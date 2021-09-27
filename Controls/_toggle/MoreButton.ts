import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import Template = require('wml!Controls/_toggle/MoreButton/MoreButton');
import {IFontSize, IFontSizeOptions} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/toggle';

export interface IBigSeparatorOptions extends IControlOptions, ICheckableOptions, IFontSizeOptions {
    /**
     * Определяет контрастность фона кнопки по отношению к ее окружению.
     * @default true
     * @demo Controls-demo/toggle/MoreButton/ContrastBackground/Index
     */
    contrastBackground?: boolean;
    /**
     * Значение счетчика.
     * @demo Controls-demo/toggle/MoreButton/Base/Index
     */
    moreCount?: number;
}

/**
 * Контрол служит для визуального ограничения контента. При клике на него отображаются скрытые записи, попавшие в ограничение.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Ftoggle%2FMoreButton%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/MoreButton
 * @extends UI/Base:Control
 *
 * @public
 * @author Красильников А.С.
 * @implements Controls/toggle:ICheckable
 *
 * @demo Controls-demo/toggle/MoreButton/Index
 */

class MoreButton extends Control<IBigSeparatorOptions> implements ICheckable, IFontSize {
   readonly '[Controls/_toggle/interface/ICheckable]': boolean = true;
   readonly '[Controls/_interface/IFontSize]': boolean = true;

   protected _template: TemplateFunction = Template;

   protected _clickHandler(e: SyntheticEvent): void {
      if (this._options.readOnly) {
         e.stopPropagation();
      }
   }

   static getDefaultOptions(): IBigSeparatorOptions {
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
