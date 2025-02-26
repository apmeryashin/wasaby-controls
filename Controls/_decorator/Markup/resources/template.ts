import { TClosure as thelpers } from 'UI/Executor';
import validHtml = require('Core/validHtml');
import {Logger} from 'UI/Utils';
import {constants} from 'Env/Env';
import { _FocusAttrs } from 'UI/Focus';

/* tslint:disable */
const lowerValidNodes = Object.assign(
    ...Object.keys(validHtml.validNodes).map((key) => {
        return { [key.toLowerCase()]: validHtml.validNodes[key] };
    })
);

const lowerValidAttributes = Object.assign(
    ...Object.keys(validHtml.validAttributes).map((key) => {
        return { [key.toLowerCase()]: validHtml.validAttributes[key] };
    })
);

const lowerValidHtml = {
    validNodes: lowerValidNodes,
    validAttributes: lowerValidAttributes
};

let markupGenerator,
      defCollection,
      control,
      resolver,
      resolverParams,
      resolverMode,
      currentValidHtml,
      linkAttributesMap = {
         action: true,
         background: true,
         cite: true,
         codebase: true,
         formaction: true,
         href: true,
         icon: true,
         longdesc: true,
         manifest: true,
         poster: true,
         profile: true,
         src: true,
         usemap: true
      },
      startOfGoodLinks = [
         'data:image(//|\/)[^;]+;base64[^"]+',
         'http:(//|\\\\)',
         'https:(//|\\\\)',
         'ftp:(//|\\\\)',
         'file:(//|\\\\)',
         'smb:(//|\\\\)',
         'mailto:',
         'tel:',
         'viber:(//|\\\\)',
         'sbisplugin:(//|\\\\)',
         'Notes:(//|\\\\)',
         'notes:(//|\\\\)',
         '#',
         './',
         '/'
      ],
      goodLinkAttributeRegExp = new RegExp(`^(${startOfGoodLinks.join('|')})`
         .replace(/[a-z]/g, (m) => `[${m + m.toUpperCase()}]`)),
      dataAttributeRegExp = /^data-(?!component$|bind$)([\w-]*[\w])+$/,
      additionalNotVdomEscapeRegExp = /(\u00a0)|(&#)/g;

const attributesWhiteListForEscaping = ['style'];

function isString(value) {
      return typeof value === 'string' || value instanceof String;
   }

function isKeyExist(obj: object, find: string = ''): boolean {
      const keys = Object.keys(obj).map(key => key.toLowerCase());
      const soughtKey = find.toLowerCase();
      return keys.includes(soughtKey) ? obj[soughtKey] || obj[find] : false;
   }

function logError(text: string, node?: any[]|string|object) {
       let strNode: string;
       try {
           strNode = JSON.stringify(node);
       } catch (e) {
           strNode = '"Невалидный Json узел"';
       }

       Logger.error('UI/Executor:TClosure' + `Ошибка разбора JsonML: ${text}. Ошибочный узел: ${strNode}`, control);
   }

function generateEventSubscribeObject(handlerName) {
      return {
         name: 'event',
         args: [],
         value: handlerName,
         fn: (function(self) {
            const f = (function() {
               const event = arguments[0];
               event.result = thelpers.getter(this, [handlerName]).apply(this, arguments);
            }).bind(self);
            f.control = self;
            f.isControlEvent = false;
            return f;
         })(control)
      };
   }

function addEventListener(events, eventName, handlerName) {
      if (!events[eventName]) {
         events[eventName] = [];
      }
      events[eventName].push(generateEventSubscribeObject(handlerName));
   }

function isBadLinkAttribute(attributeName, attributeValue) {
      return linkAttributesMap[attributeName] && !goodLinkAttributeRegExp.test(attributeValue);
   }

function validAttributesInsertion(targetAttributes: object,
                                  sourceAttributes: object,
                                  additionalValidAttributes?: object
   ) {
      const validAttributes: Object = currentValidHtml.validAttributes;
      for (const attributeName in sourceAttributes) {
         if (!sourceAttributes.hasOwnProperty(attributeName)) {
            continue;
         }
         const sourceAttributeValue = isKeyExist(sourceAttributes, attributeName);
         if (!isString(sourceAttributeValue)) {
            logError(`Невалидное значение атрибута ${attributeName}, ожидается строковое значение`, sourceAttributes);
            continue;
         }
         const isStrictValid = isKeyExist(validAttributes, attributeName);
         const isAdditionalValid = additionalValidAttributes && isKeyExist(additionalValidAttributes, attributeName);
         if (!isStrictValid && !isAdditionalValid && !dataAttributeRegExp.test(attributeName)) {
            continue;
         }

         // Разрешаем только ссылочные атрибуты с безопасным началом, чтобы избежать XSS.
         if (isBadLinkAttribute(attributeName, sourceAttributeValue)) {
            continue;
         }

         if (attributesWhiteListForEscaping.includes(attributeName)) {
            targetAttributes[attributeName] = sourceAttributeValue;
         } else {
            targetAttributes[attributeName] = markupGenerator.escape(sourceAttributeValue);
         }
      }
   }

function recursiveMarkup(attr, data, context, isVdom, value, attrsToDecorate, key, parent?, options?) {
      let valueToBuild = resolverMode && resolver ? resolver(value, parent, resolverParams) : value,
         wasResolved,
         i,
         templateCount = 0;
      if (isString(valueToBuild)) {
         if (!resolver || !resolver.__noNeedEscapeString) {
            valueToBuild = markupGenerator.escape(valueToBuild);
         }
         return markupGenerator.createText(valueToBuild, key);
      }
      if (!valueToBuild) {
         return [];
      }
      if (isString(valueToBuild[0]) && valueToBuild[0].includes('component:')) {
            const valueToBuildPaths = valueToBuild[0].split(':');
            if (options[valueToBuildPaths[1]]) {
                return markupGenerator.createControlNew(
                    'resolver',
                    options[valueToBuildPaths[1]],
                    {},
                    {},
                    valueToBuild[1], // опции компонента
                    {
                        attr: attr,
                        data: data,
                        ctx: this,
                        isVdom: isVdom,
                        defCollection:  {
                            id: [],
                            def: undefined
                        },
                        depsLocal: {},
                        includedTemplates: {},
                        viewController: this,
                        context: isVdom ? context + 'part_' + (templateCount++) : context,
                        key: key + '0_',
                        internal: {},
                        mergeType: 'attribute'
                    });
            }
      }
      if (!Array.isArray(valueToBuild)) {
         logError('Узел в JsonML должен быть строкой или массивом', valueToBuild);
         return [];
      }
      wasResolved = value !== valueToBuild;
      resolverMode ^= wasResolved;
      const children = [];
      if (Array.isArray(valueToBuild[0])) {
         for (i = 0; i < valueToBuild.length; ++i) {
            children.push(recursiveMarkup(
                attr, data, context, isVdom, valueToBuild[i], attrsToDecorate, key + i + '_', valueToBuild, options
            ));
         }
         resolverMode ^= wasResolved;
         return children;
      }
      let firstChildIndex = 1;
      const tagName = valueToBuild[0];
      const attrs = {
            attributes: {},
            events: {},
            key
         };
      const validNodesValue = isKeyExist(currentValidHtml.validNodes, tagName);
      let additionalValidAttributes;
      if (!validNodesValue) {
         resolverMode ^= wasResolved;
         return [];
      }
      if (typeof validNodesValue === 'object') {
         additionalValidAttributes = validNodesValue;
      }
      if (valueToBuild[1] && !isString(valueToBuild[1]) && !Array.isArray(valueToBuild[1])) {
         firstChildIndex = 2;
         validAttributesInsertion(attrs.attributes, valueToBuild[1], additionalValidAttributes);
      }
      for (i = firstChildIndex; i < valueToBuild.length; ++i) {
         children.push(recursiveMarkup(
             attr, data, context, isVdom, valueToBuild[i], {}, key + i + '_', valueToBuild, options
         ));
      }
      resolverMode ^= wasResolved;
      return [markupGenerator.createTag(tagName, attrs, children, attrsToDecorate, defCollection, control, key)];
   }

const template = function(data, attr, context, isVdom, sets, forceCompatible, generatorConfig) {
      markupGenerator = thelpers.createGenerator(isVdom, forceCompatible, generatorConfig);
      defCollection = {
         id: [],
         def: undefined
      };
      control = data;
      resolver = control._options.tagResolver;
      resolverParams = control._options.resolverParams || {};
      resolverMode = 1;
      currentValidHtml = control._options.validHtml || lowerValidHtml;

      const events = attr.events || {};
      if (constants.isBrowserPlatform) {
         addEventListener(events, 'on:contextmenu', '_contextMenuHandler');
         addEventListener(events, 'on:copy', '_copyHandler');
      }
      let elements = [],
         key = (attr && attr.key) || '_',
         attrsToDecorate = {
            // _isRootElement ничего не поменяет в инферно, но нужен в реакте.
            _isRootElement: attr._isRootElement,
            refForContainer: attr.refForContainer,
            attributes: attr.attributes,
            events,
            context: attr.context
         },
         oldEscape,
         value = control._options.value;
      if (value && value.length) {
         // Need just one root node.

         // Mobile can't work with tags yet, so can be value like ["text"].
         // TODO: cancel this merge in https://online.sbis.ru/opendoc.html?guid=a8a904f8-6c0d-4754-9e02-d53da7d32c99
         if (Array.isArray(value) && value.length === 1 && isString(value[0])) {
            value = ['div', value[0].split('\n').map(function(str, index) {
               // Newline symbol does not shown in the middle of tag.
               return index ? ['p', '\n' + str] : ['p', str];
            })];
         } else {
            value = ['div', value];
         }
      }
      if (!isVdom) {
         // Markup Converter should escape long space characters too.
         oldEscape = markupGenerator.escape;
         markupGenerator.escape = function(str) {
            return oldEscape(str).replace(additionalNotVdomEscapeRegExp,
               (match) => match[0] === '&' ? '&amp;#' : '&nbsp;');
         };
      }
      try {
         elements = recursiveMarkup(
             attr, data, context, isVdom, value, attrsToDecorate, key + '0_', null, control._options
         );
      } catch (e) {
          Logger.error('UI/Executor:TClosure: ' + e.message, undefined, e);
      } finally {
         if (!isVdom) {
            markupGenerator.escape = oldEscape;
         }
      }

      if (!elements.length) {
         elements = [!control._isMarkupConverter ? markupGenerator.createTag('div', { key: key + Date.now() + '_' }, [],
            attrsToDecorate, defCollection, control, key + '0_') : ''];
      }

      // Избежим утечки из-за глобальных переменных.
      control = null;
      resolver = null;
      resolverParams = null;
      resolverMode = null;
      currentValidHtml = null;

      return markupGenerator.joinElements(elements, key, defCollection);
   };

   // Template functions should have true "stable" flag to send error on using, for example, some control instead it.
template.stable = true;

export = template;
