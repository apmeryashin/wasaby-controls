import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupConfirmation/template';
import 'css!Controls/popupConfirmation';
import {Logger} from 'UI/Utils';

type TStyle = 'default' | 'danger' | 'secondary' | 'success' | 'primary';
type TSize = 's' | 'l';
interface IConfirmationTemplate extends IControlOptions {
   bodyContentTemplate?: TemplateFunction;
   footerContentTemplate?: TemplateFunction;
   size: TSize | string;
   borderStyle: TStyle;
}
/**
 * Базовый шаблон <a href='/doc/platform/developmentapl/interface-development/controls/openers/confirmation/'>диалога подтверждения</a>.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupConfirmation/Template
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @mixes Controls/_popupConfirmation/Template/mixin
 * @demo Controls-demo/PopupConfirmation/Template/Index
 */
class Template extends Control<IConfirmationTemplate> {
   protected _template: TemplateFunction = template;

   _beforeMount(options?: IConfirmationTemplate): void {
      if (options.style !== undefined) {
         Logger.warn(`${this._moduleName}: Используется устаревшая опция style,` +
                                                                           ' нужно использовать borderStyle', this);
      }
   }

   close(): void {
      this._notify('close', [], { bubbling: true });
   }

   static getDefaultOptions(): IConfirmationTemplate {
      return {
         size: 's',
         borderStyle: 'secondary'
      };
   }
}

Object.defineProperty(Template, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Template.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupConfirmation/Template#size
 * @cfg {String} Размер окна диалога.
 * @variant s
 * @variant l
 * @default s
 */

/**
 * @name Controls/_popupConfirmation/Template#borderStyle
 * @cfg {String} Стиль отображения окна диалога.
 * @variant secondary
 * @variant success
 * @variant danger
 * @variant primary
 * @variant secondary
 */

/**
 * @name Controls/_popupConfirmation/Template#bodyContentTemplate
 * @cfg {function|String} Основной контент окна диалога.
 */

/**
 * @name Controls/_popupConfirmation/Template#footerContentTemplate
 * @cfg {function|String} Контент подвала окна диалога.
 */

/**
 * Закрытие окна диалога подтверждения.
 * @function Controls/_popupConfirmation/Template#close
 */
export default Template;
