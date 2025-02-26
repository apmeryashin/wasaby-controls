import Container from 'Controls/_validate/Container';
import {TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_validate/InputContainer');

/**
 * Контрол, регулирующий валидацию своего контента. Используется с контролами, поддерживающими интерфейс {@link Controls/_input/interface/IValue IValue}.
 * Валидация запускается автоматически при потере фокуса.
 * @remark
 * Подробнее о работе с валидацией читайте {@link /doc/platform/developmentapl/interface-development/forms-and-validation/validation/ здесь}.
 * @class Controls/_validate/InputContainer
 * @extends Controls/_validate/Container
 *
 * @public
 * @author Мочалов М.А.
 */

class Input extends Container {
    _template: TemplateFunction = template;
    _shouldValidate: boolean;

    /**
     * Валидация по уходу фокуса должна начинаться только в случае,
     *  если была ручная валидация или пользователь ввел что-то в поле ввода
     */
    _shouldValidateByFocusOut: boolean = false;
    validate(...args: unknown[]): Promise<string[] | null> {
        this._shouldValidateByFocusOut = true;
        return super.validate(...args);
    }
    protected _deactivatedHandler(): void {
        this._contentActive = false;
        this._validationStatus = this._getValidStatus(this._contentActive);
        if (!this._options.readOnly && this._shouldValidateByFocusOut) {
            this._shouldValidate = true;
            this._forceUpdate();
        }
    }
    _inputCompletedHandler(event: Event, ...rest: any): void {
        this._notify('inputCompleted', rest);
        // Because of this error:
        // https://online.sbis.ru/opendoc.html?guid=ef52bfb5-56ea-4397-a77f-89e5c3413ed9
        // we need to stop event propagation, otherwise all subscribtions to inputComplete-event of
        // this control will be called twice
        event.stopPropagation();
    }
    _valueChangedHandler(...args: unknown[]): void {
        this._shouldValidateByFocusOut = true;
        return super._valueChangedHandler(...args);
    }
    _afterUpdate(oldOptions): void {
        if (this._shouldValidate || this._options.value !== oldOptions.value) {
            this._shouldValidate = false;
            this.validate();
        }
    }
}
export default Input;
