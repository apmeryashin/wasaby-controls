import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import template = require('./Markup/resources/template');
import * as linkDecorateUtils from './Markup/resources/linkDecorateUtils';
import 'css!Controls/decorator';

   /**
    * Контрол служит для вставки вёрстки в формате JsonML в шаблон.
    *
    * <a href="/doc/platform/developmentapl/service-development/service-contract/logic/json-markup-language/markup/">Руководство разработчика.</a>
    * @remark
    * Полезные ссылки:
    * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_decorator.less переменные тем оформления}
    *
    * @class Controls/_decorator/Markup
    * @extends UI/Base:Control
    * @author Угриновский Н.В.
    * @demo Controls-demo/Decorators/Markup/Markup
    * @public
    */

   /*
    * Builds a control by data in Json array.
    *
    * @class Controls/_decorator/Markup
    * @extends UI/Base:Control
    * @author Угриновский Н.В.
    * @public
    */

class MarkupDecorator extends Control<IControlOptions> {
      _template: TemplateFunction = template;

      _contextMenuHandler(event: SyntheticEvent<MouseEvent>): void {
         if (event.target.tagName.toLowerCase() === 'a') {
            // Для ссылок требуется браузерное контекстное меню.
            event.stopImmediatePropagation();
         }
      }

      _copyHandler(event: SyntheticEvent<ClipboardEvent>): void {
         const decoratedLinkNodes = event.currentTarget.getElementsByClassName(linkDecorateUtils.getClasses().link);
         Array.prototype.forEach.call(decoratedLinkNodes, (decoratedLink) => {
            const decoratedLinkImage = decoratedLink.getElementsByTagName('img')[0].cloneNode(true);
            const span = document.createElement('span');
            span.innerHTML = decoratedLink.href;
            // FIXME: код нерабочий, так как клонированная картинка однозначно
            //  не будет присутствовать в скопированном тексте
            // Необходимо попробовать:
            // 1. Удалить обработчик и смириться с тем, что в ворд будет вставляться картинка
            // 2. Придумать, как сделать, чтобы в ворд ссылка вставлялась в виде текста
            if (decoratedLink.contains(decoratedLinkImage)) {
               decoratedLink.replaceChild(span, decoratedLinkImage);
            }
         });
      }
   }
   /**
    * @name Controls/_decorator/Markup#value
    * @cfg {Array} Json-массив на основе JsonML.
    */

   /**
    * @name Controls/_decorator/Markup#tagResolver
    * @cfg {Function} Инструмент для изменения данных в формате Json перед сборкой, если это необходимо. Применяется к каждому узлу.
    * @remark
    * Аргументы функции:
    * <ol>
    *    <li>value - Json-узел для изменения.</li>
    *    <li>parent - Json-узел, родитель "value".</li>
    *    <li>resolverParams - Внешние данные для tagResolver из опции resolverParams.</li>
    * </ol>
    * Функция должна возвращать допустимый JsonML.
    * Если возвращаемое значение не равно (!= = ) исходному узлу, функция не будет применяться к дочерним элементам нового значения.
    * Примечание: функция не должна изменять исходное значение.
    *
    * @example
    * {@link Controls/decorator:Highlight}
    * {@link Controls/decorator:linkDecorate}
    */

   /**
    * @name Controls/_decorator/Markup#resolverParams
    * @cfg {Object} Внешние данные для tagResolver.
    */

   /**
    * @typedef {Object}
    * @name ValidHtml
    * @property {Object} validNodes Набор тегов, которые будут вставляться версткой. Формат: {tagName: true, ...}. Набор по умолчанию расположен в модуле <a href='https://git.sbis.ru/sbis/ws/blob/498360abc1272395be3b26ec388afb688bc9e200/WS.Core/core/validHtml.js'>Core/validHtml</a>.
    * @property {Object} validAttributes Набор разрешенных атрибутов, которые попадут в результат. Формат: {attributeName: true, ...}. Набор по умолчанию расположен в модуле <a href='https://git.sbis.ru/sbis/ws/blob/498360abc1272395be3b26ec388afb688bc9e200/WS.Core/core/validHtml.js'>Core/validHtml</a>.
    */

   /**
    * @name Controls/_decorator/Markup#validHtml
    * @cfg {ValidHtml} Опция для переопределения разрешённых тегов и атрибутов. Набор по умолчанию расположен в модуле <a href='https://git.sbis.ru/sbis/ws/blob/498360abc1272395be3b26ec388afb688bc9e200/WS.Core/core/validHtml.js'>Core/validHtml</a>.
    * @example
    * Рассмотрим пример, в котором вставляется верстка с картинкой и текстом.
    *
    * <pre>
    * <!-- Control.wml -->
    * <Controls.decorator:Markup value="{{ json }}" validHtml="{{ validHtml }}" />
    * </pre>
    *
    * <pre>
    * // Control.js
    * ...
    * _beforeMount: function() {
    *    this.json = Converter.htmlToJson(`
    *       <div>
    *          <img src="logo.png" width="100" height="100">
    *          <p>some text</p>
    *       </div>
    *    `);
    *
    *    this.validHtml = {
    *       validNodes: {
    *          img: true,
    *          div: true
    *       },
    *       validAttributes: {
    *          src: true,
    *          alt: true,
    *          height: true,
    *          width: true
    *       }
    *    };
    * }
    * ...
    * </pre>
    *
    * В данном примере опция validHtml разрешает в качестве верстки использовать только блочные теги div и картинки img, а также указан набор разрешенных атрибутов: src, alt, height и width. Это значит, что картинка будет вставлена версткой, а параграф будет экранирован и вставлен строкой.
    *
    */
export default MarkupDecorator;
