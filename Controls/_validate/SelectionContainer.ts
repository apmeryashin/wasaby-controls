import Container from 'Controls/_validate/Container';
import {TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_validate/SelectionContainer');

/**
 * Контрол, регулирующий валидацию своего контента. Используется с контролами, поддерживающими интерфейс {@link Controls/_interface/IMultiSelectable IMultiSelectable}.
 * Валидация запускается автоматически при смене значения в контроле и при его деактивации.
 * @remark
 * Подробнее о работе с валидацией читайте {@link /doc/platform/developmentapl/interface-development/forms-and-validation/validation/ здесь}.
 * @class Controls/_validate/SelectionContainer
 * @extends Controls/_validate/Container
 *
 * @public
 * @author Мочалов М.А.
 */

class Selection extends Container {
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

    _deactivatedHandler(): void {
        if (!this._options.readOnly && this._shouldValidateByFocusOut) {
            this._shouldValidate = true;
            this._forceUpdate();
        }
    }

    _selectedKeysChangedHandler(event: Event, value: string): void {
        this._notify('selectedKeysChanged', [value]);
        this._shouldValidateByFocusOut = true;
        this._cleanValid();
    }

    _selectedKeyChangedHandler(event: Event, value: string): void {
        this._notify('selectedKeyChanged', [value]);
        this._shouldValidateByFocusOut = true;
        this._cleanValid();
    }

    protected _afterUpdate(): void {
        if (this._shouldValidate) {
            this._shouldValidate = false;
            this.validate();
        }
    }
}

export default Selection;
