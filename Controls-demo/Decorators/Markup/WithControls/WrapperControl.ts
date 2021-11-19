import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Decorators/Markup/WithControls/WrapperControl';

export default class WrapperControl extends Control {
    protected _template: TemplateFunction = template;
    protected _value;

    protected _beforeMount(options) {
        this._value = options.value;
    }

    protected _valueChangedHandler(e, value) {
        this._value = value;
        this._notify('inputDataChanged', [this._options.id, value]);
    }
}
