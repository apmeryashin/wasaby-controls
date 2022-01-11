import {
   actualItems,
   getButtonTemplate,
   getSimpleButtonTemplateOptionsByItem,
   ItemTemplate,
   showType
} from 'Controls/toolbars';
import {Logger} from 'UI/Utils';
import {Record} from 'Types/entity';
import {DOMUtil, getWidth} from 'Controls/sizeUtils';
import {constants} from 'Env/Env';

let MENU_WIDTH = 0;

const _private = {
      initializeConstants(theme: string) {
         if (!MENU_WIDTH) {
            const iconClass = `icon-medium icon-SettingsNew controls-Toolbar__menu_spacing-small_theme-${theme}`;
            MENU_WIDTH = constants.isBrowserPlatform && getWidth(`<i class="${iconClass}"/></span>`);
         }
      },

      getContentTemplate(item, itemTemplate, itemTemplateProperty) {
         let contentTemplate = null;
         if (itemTemplateProperty && item) {
            contentTemplate = item.get(itemTemplateProperty);
         }
         if (!contentTemplate && itemTemplate !== ItemTemplate) {
            contentTemplate = itemTemplate;
         }
         return contentTemplate;
      },

      getItemsSizes(items, visibleKeys, theme, itemTemplate, itemTemplateProperty) {
         const itemsMark = [];
         let item;
         let buttonTemplateOptions;

         visibleKeys.forEach((key) => {
            item = items.getRecordById(key);
            buttonTemplateOptions = _private.getButtonTemplateOptionsForItem(item, itemTemplateProperty);

            itemsMark.push(ItemTemplate({
               item,
               size: 'm',
               itemsSpacing: 'medium',
               theme,
               direction: 'horizontal',
               buttonTemplate: getButtonTemplate(),
               buttonTemplateOptions,
               contentTemplate: _private.getContentTemplate(item, itemTemplate, itemTemplateProperty)
            }));
         });

         return DOMUtil.getElementsWidth(itemsMark, 'controls-Toolbar__item', true);
      },

      getButtonTemplateOptionsForItem(item: Record, itemTemplateProperty?: string): object {
         const buttonOptions = getSimpleButtonTemplateOptionsByItem(item);

         if (itemTemplateProperty &&
             item.get(itemTemplateProperty) &&
             !buttonOptions._caption &&
             !buttonOptions._icon) {
            Logger.error(
                'OperationsPanel: при использовании своего шаблона отображения операции (itemTemplateProperty) ' +
                'необходимо задать caption и/или icon на каждой операции для корректных расчётов размеров');
         }

         return buttonOptions;
      },

      setShowType(items, type) {
         items.each((item) => {
            const configShowType = item.get('showType');
            // Сохраняем переданный в опции showType, чтобы при изменении размеров панели действий
            // не потерять положение кнопки, определённое пользователем в опции
            if (item.get('originalShowType') === undefined && configShowType !== undefined) {
               item.set('originalShowType', configShowType);
            }
            if (item.get('originalShowType') !== showType.MENU) {
               item.set('showType', type);
            }
         });
      }
   };

export = {
      fillItemsType(keyProperty,
                    parentProperty,
                    items, availableWidth,
                    theme, defaultItemTemplate,
                    itemTemplateProperty
      ) {
         let itemsSizes;
         let currentWidth;
         const visibleItemsKeys = [];

         actualItems(items);

         items.each((item) => {
            if (!item.get(parentProperty)) {
               visibleItemsKeys.push(item.get(keyProperty));
            }
         });

         if (visibleItemsKeys.length <= 1) {
            _private.setShowType(items, showType.TOOLBAR);
         } else {
            itemsSizes = _private.getItemsSizes(
                items, visibleItemsKeys, theme, defaultItemTemplate, itemTemplateProperty
            );
            currentWidth = itemsSizes.reduce((acc, width) => {
               return acc + width;
            }, 0);

            if (currentWidth > availableWidth) {
               _private.initializeConstants(theme);
               _private.setShowType(items, showType.MENU);
               currentWidth += MENU_WIDTH;

               for (let i = visibleItemsKeys.length - 1; i >= 0; i--) {
                  items
                      .getRecordById(visibleItemsKeys[i])
                      .set('showType', currentWidth > availableWidth ? showType.MENU : showType.MENU_TOOLBAR);
                  currentWidth -= itemsSizes[i];
               }
            } else {
               _private.setShowType(items, showType.TOOLBAR);
            }
         }

         return items;
      },
      _private // for unit testing
   };
