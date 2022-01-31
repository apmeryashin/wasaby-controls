import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls/_buttons/MoreButton/MoreButton');
import {IFontSize, IFontSizeOptions} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/buttons';

export interface IMoreButtonOptions extends IControlOptions, IFontSizeOptions {
    /**
     * Определяет контрастность фона кнопки по отношению к ее окружению.
     * @default true
     * @demo Controls-demo/Buttons/MoreButton/Index
     */
    contrastBackground?: boolean;
    /**
     * Значение счетчика.
     * @demo Controls-demo/Buttons/MoreButton/Index
     */
    count?: number;
}

/**
 * Контрол служит для визуального ограничения записей.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FButtons%2FMoreButton%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_buttons.less переменные тем оформления}
 *
 * @class Controls/_buttons/MoreButton
 * @extends UI/Base:Control
 * @implements Controls/buttons:IMoreButtonOptions
 *
 * @public
 * @author Мочалов М.А.
 *
 * @demo Controls-demo/Buttons/MoreButton/Index
 */

class MoreButton extends Control<IMoreButtonOptions> implements IFontSize {
   readonly '[Controls/_interface/IFontSize]': boolean = true;

   protected _template: TemplateFunction = Template;

   protected _clickHandler(e: SyntheticEvent): void {
      if (this._options.readOnly) {
         e.stopPropagation();
      }
   }

   static getDefaultOptions(): IMoreButtonOptions {
      return {
         contrastBackground: true,
         fontSize: 'm'
      };
   }
}

Object.defineProperty(MoreButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return MoreButton.getDefaultOptions();
   }
});

export default MoreButton;
