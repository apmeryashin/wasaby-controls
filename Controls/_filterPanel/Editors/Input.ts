import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as InputTemplate from 'wml!Controls/_filterPanel/Editors/Input';
import 'css!Controls/filterPanel';

interface IInputOptions extends IControlOptions {
    propertyValue: string;
}

/**
 * Контрол используют в качестве редактора для поля фильтра с типом String.
 * @class Controls/_filterPanel/Editors/Input
 * @extends UI/Base:Control
 * @mixes Controls/input:Text
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanelPopup/Editors/Input/Index
 * @public
 */

class InputEditor extends Control<IInputOptions> {
    protected _template: TemplateFunction = InputTemplate;
    protected _value: string = null;

    protected _beforeMount(options: IInputOptions): void {
        this._value = options.propertyValue;
    }

    protected _beforeUpdate(newOptions: IInputOptions): void {
        if (newOptions.propertyValue !== this._options.propertyValue) {
            this._value = newOptions.propertyValue;
        }
    }

    protected _valueChangedHandler(event: SyntheticEvent, newValue: string): void {
        this._propertyValueChanged(newValue);
    }

    protected _extendedCaptionClickHandler(): void {
        this._propertyValueChanged(null);
    }

    protected _propertyValueChanged(newValue: string): void {
        const extendedValue = {
            value: newValue,
            textValue: newValue,
            viewMode: 'basic'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }
}
export default InputEditor;
