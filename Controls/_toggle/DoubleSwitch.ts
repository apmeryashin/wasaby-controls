import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'Vdom/Vdom';
import DoubleSwitchTemplate = require('wml!Controls/_toggle/DoubleSwitch/DoubleSwitch');
import toggleTemplate = require('wml!Controls/_toggle/DoubleSwitch/resources/DoubleSwitchToggle');
import textTemplate = require('wml!Controls/_toggle/DoubleSwitch/resources/DoubleSwitchText');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import {IResetValueOptions, ITooltip, ITooltipOptions, IContrastBackgroundOptions} from 'Controls/interface';
import 'css!Controls/toggle';

export interface IDoubleSwitchOptions extends IControlOptions, ICheckableOptions,
    ITooltipOptions, IContrastBackgroundOptions, IResetValueOptions {
   captions?: string[];
   orientation?: string;
   size?: string;
   captionTemplate?: Function;
}

const CAPTIONS_LENGTH = 2;
/**
 * Двойной переключатель, который позволяет выбрать один из двух взаимоисключающих вариантов.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Ftoggle%2FDoubleSwitch%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/DoubleSwitch
 * @extends UI/Base:Control
 * @implements Controls/toggle:ICheckable
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IContrastBackground
 * @implements Controls/interface:IResetValue
 *
 * @public
 * @author Мочалов М.А.
 *
 * @demo Controls-demo/toggle/DoubleSwitch/Base/Index
 */

/*
 * Switch with two captions and with support two orientation.
 *
 * @class Controls/_toggle/DoubleSwitch
 * @extends UI/Base:Control
 * @implements Controls/toggle:ICheckable
 * @implements Controls/interface:ITooltip
 *
 * @public
 * @author Мочалов М.А.
 *
 * @demo Controls-demo/toggle/DoubleSwitch/Base/Index
 *
 */
class DoubleSwitch extends Control<IDoubleSwitchOptions> implements ICheckable, ITooltip {
   '[Controls/_interface/ITooltip]': true;
   '[Controls/_toggle/interface/ICheckable]': true;

   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = DoubleSwitchTemplate;

   protected _toggleTemplate: Function = toggleTemplate;
   protected _toggleHoverState: boolean = false;

   private _checkCaptions(captions: string[]): void {
      if (captions.length !== CAPTIONS_LENGTH) {
         throw new Error('You must set 2 captions.');
      }
   }

   private _toggleSwitchHoverState(e: SyntheticEvent<Event>, toggledState?: boolean): void {
      this._toggleHoverState = !!toggledState;
   }

   protected _clickTextHandler(e: SyntheticEvent<Event>, _nextValue: boolean): void {
      if (this._options.value !== _nextValue && !this._options.readOnly) {
         this._notifyChanged();
         this._toggleSwitchHoverState(e, false);
      }
   }

   private _notifyChanged(): void {
      this._notify('valueChanged', [!this._options.value]);
   }

   protected _clickToggleHandler(): void {
      if (!this._options.readOnly) {
         this._notifyChanged();
      }
   }

   protected _beforeMount(newOptions: IDoubleSwitchOptions): void {
      this._checkCaptions(newOptions.captions);
   }

   protected _beforeUpdate(newOptions: IDoubleSwitchOptions): void {
      this._checkCaptions(newOptions.captions);
   }

   static getDefaultOptions(): object {
      return {
         value: false,
         contrastBackground: true,
         orientation: 'horizontal',
         size: 'l',
         captionTemplate: textTemplate
      };
   }
   static getOptionTypes(): object {
      return {
         value: EntityDescriptor(Boolean),
         orientation: EntityDescriptor(String).oneOf([
            'vertical',
            'horizontal'
         ]),
          contrastBackground: EntityDescriptor(Boolean),

         // TODO: сделать проверку на массив когда будет сделана задача
         // https://online.sbis.ru/opendoc.html?guid=2016ea16-ed0d-4413-82e5-47c3aeaeac59
         captions: EntityDescriptor(Object)
      };
   }
}

Object.defineProperty(DoubleSwitch, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DoubleSwitch.getDefaultOptions();
   }
});

/**
 * @name Controls/_toggle/DoubleSwitch#contrastBackground
 * @cfg {string}
 * @default true
 * @demo Controls-demo/toggle/DoubleSwitch/ContrastBackground/Index
 */

/**
 * @name Controls/_toggle/DoubleSwitch#size
 * @cfg {string} Определяет размер переключателя.
 * @variant s
 * @variant l
 * @default l
 * @demo Controls-demo/toggle/DoubleSwitch/Size/Index
 */

/**
 * @name Controls/_toggle/DoubleSwitch#resetValue
 * @cfg {boolean}
 * @demo Controls-demo/toggle/DoubleSwitch/ResetValue/Index
 */

/**
 * @name Controls/_toggle/DoubleSwitch#tooltip
 * @cfg
 * @demo Controls-demo/toggle/DoubleSwitch/Tooltip/Index
 */

/**
 * @name Controls/_toggle/DoubleSwitch#captions
 * @cfg {Array.<String>} Массив из двух подписей. Если количество подписей не равно двум, то возникает ошибка.
 */

/*
 * @name Controls/_toggle/DoubleSwitch#captions
 * @cfg {Array.<String>} Array of two captions. If caption number is not equal to two, then an error occurs.
 */

/**
 * @name Controls/_toggle/DoubleSwitch#orientation
 * @cfg {String} Ориентация двойного переключателя в пространстве.
 * @demo Controls-demo/toggle/DoubleSwitch/Orientation/Index
 * @variant horizontal Горизонтальная ориентация. Значение по умолчанию.
 * @variant vertical Вертикальная ориентация.
 */

/*
 * @name Controls/_toggle/DoubleSwitch#orientation
 * @cfg {String} Double switch orientation in space.
 * @variant horizontal Horizontal orientation. It is default value.
 * @variant vertical Vertical orientation.
 */

/**
 * @name Controls/_toggle/DoubleSwitch#captionTemplate
 * @cfg {TemplateFunction|String} Шаблон текста заголовка кнопки.
 * @remark
 * По умолчанию используется шаблон "Controls/toggle:doubleSwitchCaptionTemplate".
 *
 * Базовый шаблон captionTemplate поддерживает следующие параметры:
 * - additionalCaption {Function|String} — Дополнительный текст заголовка кнопки.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.toggle:DoubleSwitch>
 *    <ws:captionTemplate>
 *       <ws:partial template="Controls/toggle:doubleSwitchCaptionTemplate" scope="{{captionTemplate}}" additionalCaption="{{_captionTemplate}}"/>
 *    </ws:captionTemplate>
 * </Controls.toggle:DoubleSwitch>
 * </pre>
 */

export default DoubleSwitch;
