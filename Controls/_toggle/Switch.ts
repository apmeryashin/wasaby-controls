import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import {
    IContrastBackgroundOptions,
    IResetValueOptions,
    ITooltip,
    ITooltipOptions,
    IValidationStatus,
    IValidationStatusOptions
} from 'Controls/interface';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';
import SwitchTemplate = require('wml!Controls/_toggle/Switch/Switch');
import * as CaptionTemplate from 'wml!Controls/_toggle/Switch/resources/CaptionTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {constants} from 'Env/Env';
import {default as WorkByKeyboardContext, IWorkByKeyboardContext} from '../Context/WorkByKeyboardContext';

export interface ISwitchOptions extends IControlOptions, ICheckableOptions,
    ITooltipOptions, IValidationStatusOptions, IContrastBackgroundOptions, IResetValueOptions {
    caption: string;
    captionPosition: string;
    size?: string;
    captionTemplate?: TemplateFunction;
}

/**
 * Кнопка-переключатель с одним заголовком. Часто используется для настроек "вкл-выкл".
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2ftoggle%2fSwitch%2fIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 * @class Controls/_toggle/Switch
 * @extends UI/Base:Control
 * @implements Controls/toggle:ICheckable
 * @implements Controls/interface:ITooltip
 * @implements Controls/interface:IResetValue
 * @implements Controls/interface:IContrastBackground
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/Switch/Base/Index
 */

/*
 * Switch button with single caption. Frequently used for 'on-off' settings.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2ftoggle%2fSwitch%2fIndex">Demo-example</a>.
 *
 * @class Controls/_toggle/Switch
 * @extends UI/Base:Control
 * @implements Controls/toggle:ICheckable
 * @implements Controls/interface:ITooltip
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/toggle/Switch/Base/Index
 */

class Switch extends Control<ISwitchOptions> implements ITooltip, ICheckable, IValidationStatus {
    '[Controls/_interface/ITooltip]': true;
    '[Controls/_toggle/interface/ICheckable]': true;
    '[Controls/_interface/IValidationStatus]': true;
    protected _template: TemplateFunction = SwitchTemplate;
    protected _workByKeyboard: WorkByKeyboardContext;

    protected _beforeMount(options: ISwitchOptions, context: IWorkByKeyboardContext = {}): void {
        this._workByKeyboard = context.workByKeyboard;
    }

    protected _beforeUpdate(newOptions: ISwitchOptions, context: IWorkByKeyboardContext = {}): void {
        if (this._workByKeyboard !== context.workByKeyboard) {
            this._workByKeyboard = context.workByKeyboard;
        }
    }

    protected _highlightedOnFocus(): boolean {
        return !!this._workByKeyboard?.status && !this._options.readOnly;
    }

    protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
        if (e.nativeEvent.keyCode === constants.key.space && !this._options.readOnly) {
            e.preventDefault();
            this._clickHandler();
        }
    }

    protected _clickHandler(): void {
        if (!this._options.readOnly) {
            this._notify('valueChanged', [!this._options.value]);
        }
    }

    static getDefaultOptions(): object {
        return {
            value: false,
            captionPosition: 'right',
            validationStatus: 'valid',
            contrastBackground: true,
            size: 'l',
            captionTemplate: CaptionTemplate
        };
    }

    static getOptionTypes(): object {
        return {
            value: EntityDescriptor(Boolean),
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

Object.defineProperty(Switch, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Switch.getDefaultOptions();
    }
});

/**
 * @name Controls/_toggle/Switch#size
 * @cfg {string} Определяет размер переключателя.
 * @variant s
 * @variant l
 * @default l
 * @demo Controls-demo/toggle/Switch/Size/Index
 */

/**
 * @name Controls/_toggle/Switch#resetValue
 * @cfg {boolean}
 * @demo Controls-demo/toggle/Switch/ResetValue/Index
 */

/**
 * @name Controls/_toggle/Switch#contrastBackground
 * @cfg {string}
 * @default true
 * @demo Controls-demo/toggle/Switch/ContrastBackground/Index
 */

/**
 * @name Controls/_toggle/Switch#caption
 * @cfg {String} Текст заголовка кнопки.
 */

/*
 * @name Controls/_toggle/Switch#caption
 * @cfg {String} Caption text.
 */

/**
 * @name Controls/_toggle/Switch#captionPosition
 * @cfg {String} Определяет, с какой стороны расположен заголовок кнопки.
 * @variant left Заголовок расположен перед кнопкой.
 * @variant right Заголовок расположен после кнопки.
 * @default right
 * @demo Controls-demo/toggle/Switch/CaptionPosition/Index
 */

/*
 * @name Controls/_toggle/Switch#captionPosition
 * @cfg {String} Determines on which side of the button caption is located.
 * @variant left Caption before toggle.
 * @variant right Toggle before caption.
 * @default right
 */

/**
 * @name Controls/_toggle/Switch#captionTemplate
 * @cfg {TemplateFunction|String} Шаблон текста заголовка кнопки.
 * @remark
 * По умолчанию используется шаблон "Controls/toggle:switchCaptionTemplate".
 *
 * Базовый шаблон captionTemplate поддерживает следующие параметры:
 * - additionalCaption {Function|String} — Дополнительный текст заголовка кнопки.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.toggle:Switch>
 *    <ws:captionTemplate>
 *       <ws:partial template="Controls/toggle:switchCaptionTemplate" scope="{{captionTemplate}}" additionalCaption="{{_captionTemplate}}"/>
 *    </ws:captionTemplate>
 * </Controls.toggle:Switch>
 * </pre>
 * @demo Controls-demo/toggle/Switch/CaptionTemplate/Index
 */
export default Switch;
