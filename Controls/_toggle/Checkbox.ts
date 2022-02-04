import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import checkBoxTemplate = require('wml!Controls/_toggle/Checkbox/Checkbox');
import {descriptor as EntityDescriptor} from 'Types/entity';
import {
   ITooltip,
   ITooltipOptions,
   ICaption,
   ICaptionOptions,
   IFontColorStyle,
   IFontColorStyleOptions,
   IIcon,
   IIconOptions,
   IIconSize,
   IIconSizeOptions,
   IIconStyle,
   IIconStyleOptions,
   IValidationStatus,
   IValidationStatusOptions,
   IContrastBackgroundOptions,
   IResetValueOptions
} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {constants} from 'Env/Env';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';
import {default as WorkByKeyboardContext, IWorkByKeyboardContext} from '../Context/WorkByKeyboardContext';

export interface ICheckboxOptions extends IControlOptions, ICaptionOptions, IIconOptions, ITooltipOptions,
      IIconSizeOptions, IIconStyleOptions, IValidationStatusOptions, IContrastBackgroundOptions, IResetValueOptions,
      IFontColorStyleOptions  {
   triState?: boolean;
   value?: boolean | null;
   multiline?: boolean;
   horizontalPadding?: string;
   checkboxStyle?: 'primary' | 'default';
   size?: 's' | 'l';
   captionPosition: 'left' | 'right';
}

const mapTriState = {false: true, true: null, null: false};
const mapBoolState = {true: false, false: true, null: true};

/**
 * Контрол, позволяющий пользователю управлять параметром с двумя состояниями — включено и отключено.
 *
 * @remark
 * Для того, чтобы убрать отступ у контролла, нужно навесить CSS-класс **controls-Input_negativeOffset**
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Ftoggle%2FCheckbox%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 *
 * @class Controls/_toggle/Checkbox
 * @extends UI/Base:Control
 * @implements Controls/interface:ICaption
 * @implements Controls/interface:IIcon
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:IIconStyle
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IValidationStatus
 * @implements Controls/interface:IResetValue
 * @implements Controls/interface:IContrastBackground
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/Checkbox/Base/Index
 */

/*
 * Represents a control that a user can select and clear.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2Ftoggle%2FCheckbox%2FIndex">Demo-example</a>.
 *
 * @class Controls/_toggle/Checkbox
 * @extends UI/Base:Control
 * @implements Controls/interface:ICaption
 * @implements Controls/interface:IIcon
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IIconStyle
 * @implements Controls/interface:IIconSize
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/Checkbox/Base/Index
 */
class Checkbox extends Control<ICheckboxOptions> implements ICaption, IFontColorStyle,
                                                            IIcon, ITooltip, IIconSize, IIconStyle, IValidationStatus {
   '[Controls/_interface/IFontColorStyle]': boolean = true;
   '[Controls/_interface/ITooltip]': boolean = true;
   '[Controls/_interface/ICaption]': boolean = true;
   '[Controls/_interface/IIcon]': boolean = true;
   '[Controls/_interface/IIconSize]': boolean = true;
   '[Controls/_interface/IIconStyle]': boolean = true;
   '[Controls/_interface/IValidationStatus]': boolean = true;

   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = checkBoxTemplate;
   protected _workByKeyboard: WorkByKeyboardContext;

   protected _beforeMount(options: ICheckboxOptions, context: IWorkByKeyboardContext = {}): void {
      this._workByKeyboard = context.workByKeyboard;
   }

   protected _beforeUpdate(newOptions: ICheckboxOptions, context: IWorkByKeyboardContext = {}): void {
      if (this._workByKeyboard !== context.workByKeyboard) {
         this._workByKeyboard = context.workByKeyboard;
      }
   }

   protected _highlightedOnFocus(): boolean {
      return !!this._workByKeyboard?.status && !this._options.readOnly;
   }

   private _notifyChangeValue(value: boolean | null): void {
      this._notify('valueChanged', [value]);
   }

   protected _clickHandler(): void {
      if (!this._options.readOnly) {
         const map = this._options.triState ? mapTriState : mapBoolState;
         this._notifyChangeValue(map[this._options.value + '']);
      }
   }

   protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
      if (e.nativeEvent.keyCode === constants.key.space && !this._options.readOnly) {
         e.preventDefault();
         this._clickHandler();
      }
   }

   static getDefaultOptions(): object {
      return {
         value: false,
         triState: false,
         iconSize: 'default',
         iconStyle: 'secondary',
         validationStatus: 'valid',
         contrastBackground: false,
         multiline: true,
         horizontalPadding: 'default',
         checkboxStyle: 'primary',
         size: 's',
         captionPosition: 'right'
      };
   }

   static getOptionTypes(): object {
      return {
         triState: EntityDescriptor(Boolean),
         tooltip: EntityDescriptor(String),
         captionPosition: EntityDescriptor(String).oneOf([
            'left',
            'right'
         ])
      };
   }

   static contextTypes(): object {
      return {
         workByKeyboard: WorkByKeyboardContext
      };
   }
}

Object.defineProperty(Checkbox, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Checkbox.getDefaultOptions();
   }
});

/**
 * @name Controls/_toggle/Checkbox#triState
 * @cfg {Boolean} Определяет, разрешено ли устанавливать чекбоксу третье состояние — "не определен" (null).
 * @default False
 * @remark
 * True - Разрешено устанавливать третье состояние.
 * False - Не разрешено устанавливать третье состояние.
 * Если установлен режим triState, то значение может быть "null".
 * @demo Controls-demo/toggle/Checkbox/Tristate/Index
 * @example
 * Чекбокс с включенным triState.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    }
 * </pre>
 * @see option Value
 */

/*
 * @name Controls/_toggle/Checkbox#triState
 * @cfg {Boolean} Determines whether the Checkbox will allow three check status rather than two.
 * @default False
 * @remark
 * True - Enable triState.
 * False - Disable triState.
 * If the triState mode is set, then the value can be null.
 * @demo Controls-demo/toggle/Checkbox/Tristate/Index
 * @example
 * Checkbox with enabled triState.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    }
 * </pre>
 * @see option Value
 */

/**
 * @name Controls/_toggle/Checkbox#value
 * @cfg {Boolean|null} Значение, которое определяет текущее состояние.
 * @default False
 * @remark
 * True - Чекбокс в состоянии "отмечено".
 * False - Чекбокс в состоянии "не отмечено". Это состояние по умолчанию.
 * Null - Состояние чекбокса при включенной опции TriState.
 * Вариант "null" возможен только при включенной опции triState.
 * @example
 * Чекбокс, регулирующий тему в контроле.
 * <pre>
 *    <Controls.toggle:Checkbox caption="Enable dark theme" value="{{_checkBoxValue}}" on:valueChanged="_darkThemeSwitched()"/>
 * </pre>
 * <pre>
 *   class MyControl extends Control<IControlOptions> {
 *       ...
 *       _darkThemeSwitched(e, value) {
 *          _checkBoxValue = value;
 *          this._notify('themeChanged', [_checkBoxValue]);
 *       }
 *       ...
 *    }
 * </pre>
 * Чекбокс с включенной опцией triState.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    }
 * </pre>
 * @see option triState
 * @see event valueChanged()
 */

/*
 * @name Controls/_toggle/Checkbox#value
 * @cfg {Boolean|null} Current value, it's determines current state.
 * @default False
 * @remark
 * True - Selected checkbox state.
 * False - Unselected checkbox state. It is default state.
 * Null - TriState checkbox state.
 * Variant null of value this option is possible only when the triState option is enabled.
 * @example
 * Checkbox regulate theme in control.
 * <pre>
 *    <Controls.toggle:Checkbox caption="Enable dark theme" value="{{_checkBoxValue}}" on:valueChanged="_darkThemeSwitched()"/>
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ...
 *       _darkThemeSwitched(e, value) {
 *          _checkBoxValue = value;
 *          this._notify('themeChanged', [_checkBoxValue]);
 *       }
 *       ...
 *    }
 * </pre>
 * Checkbox value when triState option is true.
 * <pre>
 *    Boolean variable value: <Controls.toggle:Checkbox on:valueChanged="_updateCheckBox()" triState="{{true}}" value="{{_checkBoxValue}}"/>
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ...
 *       _updateCheckBox(event, value) {
 *          _checkBoxValue = value;
 *       }
 *       ...
 *    }
 * </pre>
 * @see option triState
 * @see event valueChanged()
 */

/**
 * @event Происходит при изменении состояния контрола.
 * @name Controls/_toggle/Checkbox#valueChanged
 * @param {Boolean|null} New value.
 * @remark Событие необходимо для реагирования на изменения, внесенные пользователем в чекбокс. Значение, возвращаемое в событии, не вставляется в контрол, если не передать его обратно в поле в качестве опции. Значение может быть null только тогда, когда включена опция tristate.
 * @example
 * Пример:
 * <pre>
 *    <Controls.toggle:Checkbox value="{{_checkBoxValue}}" on:valueChanged="_valueChangedHandler()" />
 * </pre>
 * <pre>
 *   class MyControl extends Control<IControlOptions> {
 *       ...
 *       _valueChangedHandler(e, value) {
 *          this._checkBoxValue= value;
 *       }
 *       ...
 *    }
 * </pre>
 * @see value
 * @see triState
 */

/*
 * @event Occurs when state changes.
 * @name Controls/_toggle/Checkbox#valueChanged
 * @param {Boolean|null} New value.
 * @remark This event should be used to react to changes user makes in the checkbox. Value returned in the event is not inserted in control unless you pass it back to the field as an option. Value may be null only when checkbox tristate option is true.
 * @example
 * Example description.
 * <pre>
 *    <Controls.toggle:Checkbox value="{{_checkBoxValue}}" on:valueChanged="_valueChangedHandler()" />
 * </pre>
 * <pre>
 *    class MyControl extends Control<IControlOptions> {
 *       ...
 *       _valueChangedHandler(e, value) {
 *          this._checkBoxValue= value;
 *       }
 *       ...
 *    }
 * </pre>
 * @see value
 * @see triState
 */
/**
 * @name Controls/_toggle/Checkbox#multiline
 * @cfg {boolean} Поведение текста, если он не умещается.
 * @variant false Текст обрезается многоточием.
 * @variant true Текст разбивается на несколько строк.
 * @default true
 * @demo Controls-demo/toggle/Checkbox/Multiline/Index
 */
/**
 * @name Controls/_toggle/Checkbox#icon
 * @cfg
 * @demo Controls-demo/toggle/Checkbox/Icon/Index
 */
/**
 * @name Controls/_toggle/Checkbox#iconSize
 * @cfg
 * @demo Controls-demo/toggle/Checkbox/Icon/Index
 */
/**
 * @name Controls/_toggle/Checkbox#iconStyle
 * @cfg
 * @demo Controls-demo/toggle/Checkbox/Icon/Index
 */
/**
 * @name Controls/_toggle/Checkbox#contrastBackground
 * @cfg
 * @demo Controls-demo/toggle/Checkbox/ContrastBackground/Index
 */
/**
 * @name Controls/_toggle/Checkbox#horizontalPadding
 * @cfg {String} Конфигурация горизонтальных отступов чекбокса.
 * @default default
 * @variant default
 * @variant null
 * @demo Controls-demo/toggle/CheckboxMarker/HorizontalPadding/Index
 */
/**
 * @name Controls/_toggle/Checkbox#resetValue
 * @cfg
 * @demo Controls-demo/toggle/Checkbox/ResetValue/Index
 */
/**
 * @name Controls/_toggle/Checkbox#checkboxStyle
 * @cfg {String} Цвет заливки чекбокса.
 * Внимание: опция работает только в паре с опцией {@link contrastBackground}
 * @variant default
 * @variant primary
 * @default primary
 * @demo Controls-demo/toggle/Checkbox/CheckboxStyle/Index
 * @see contrastBackground
 */
/**
 * @typedef {String} TFontColorStyle
 * @description Допустимые значения для опции {@link Controls/_toggle/Checkbox#fontColorStyle fontColorStyle}.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant unaccented
 * @variant link
 * @variant label
 * @variant info
 * @variant default
 */
/**
 * @name Controls/_toggle/Checkbox#fontColorStyle
 * @cfg {TFontColorStyle} Стиль цвета текста контрола.
 * @demo Controls-demo/toggle/Checkbox/FontColorStyle/Index
 */
/**
 * @name Controls/_toggle/Checkbox#captionPosition
 * @cfg {String} Определяет, с какой стороны расположен заголовок кнопки.
 * @variant left Заголовок расположен перед чекбоксом.
 * @variant right Заголовок расположен после чекбоксом.
 * @default right
 * @demo Controls-demo/toggle/Checkbox/CaptionPosition/Index
 */
/**
 * @name Controls/_toggle/Checkbox#size
 * @cfg {String} Определяет размер галочки чекбокса.
 * @variant s
 * @variant l
 * @default s
 * @demo Controls-demo/toggle/Checkbox/Size/Index
 */
export default Checkbox;
