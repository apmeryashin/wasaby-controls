import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_buttons/ArrowButton/ArrowButton');
import {IContrastBackgroundOptions} from 'Controls/interface';
import 'css!Controls/buttons';

export type TArrowButtonDirection = 'right' | 'left' | 'up' | 'down';

export interface IArrowButtonOptions extends IControlOptions, IContrastBackgroundOptions {
    direction?: TArrowButtonDirection;
    inlineHeight: string;
    iconSize: string;
    translucent: boolean;
}

/**
 * Графический контрол в виде стрелки, который предоставляет пользователю возможность простого запуска события при нажатии на него.
 * @class Controls/_buttons/ArrowButton
 * @extends UI/Base:Control
 * @public
 * @implements Controls/interface:IIconSize
 * @author Мочалов М.А.
 * @demo Controls-demo/Buttons/ArrowButton/Index
 */

class ArrowButton extends Control<IArrowButtonOptions>  {
    protected _template: TemplateFunction = template;

    protected _clickHandler(event: Event): void {
        if (this._options.readOnly) {
            event.stopPropagation();
        }
    }

    static getDefaultOptions(): object {
        return {
            inlineHeight: 'default',
            iconSize: 's',
            direction: 'right',
            translucent: false
        };
    }
}

Object.defineProperty(ArrowButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ArrowButton.getDefaultOptions();
   }
});

/**
 * @typedef {String} TArrowButtonDirection
 * @variant left Влево.
 * @variant right Вправо.
 * @variant up Вверх.
 * @variant down Вниз.
 */

/**
 * @name Controls/_buttons/ArrowButton#direction
 * @cfg {TArrowButtonDirection} Выбор стороны, куда будет указывтаь стрелка в кнопке.
 * @example
 * <pre class="brush: html">
 * <Controls.buttons:ArrowButton direction="left"/>
 * </pre>
 * @demo Controls-demo/Buttons/ArrowButton/Direction/Index
 */

/**
 * @name Controls/_buttons/ArrowButton#translucent
 * @cfg {Boolean} Режим полупрозрачного отображения кнопки.
 * @example
 * <pre class="brush: html">
 * <Controls.buttons:ArrowButton translucent="{{true}}"/>
 * </pre>
 * @demo Controls-demo/Buttons/ArrowButton/Translucent/Index
 */

/**
 * @name Controls/_buttons/ArrowButton#inlineHeight
 * @cfg {Enum} Высота контрола.
 * @variant s
 * @variant m
 * @variant l
 * @default m
 * @demo Controls-demo/Buttons/ArrowButton/InlineHeight/Index
 * @example
 * Кнопка большого размера (l).
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:ArrowButton direction="down" inlineHeight="l"/>
 * </pre>
 */

/**
 * @name Controls/_buttons/ArrowButton#iconSize
 * @demo Controls-demo/Buttons/ArrowButton/IconSize/Index
 */

/**
 * @name Controls/_buttons/ArrowButton#contrastBackground
 * @demo Controls-demo/Buttons/ArrowButton/ContrastBackground/Index
 */

export default ArrowButton;
