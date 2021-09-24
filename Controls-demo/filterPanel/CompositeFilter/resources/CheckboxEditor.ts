import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/CompositeFilter/resources/CheckboxEditor';
import {SyntheticEvent} from 'Vdom/Vdom';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _handleValueChanged(event: SyntheticEvent, value: boolean): void {
        this._notify('propertyValueChanged', [value]);
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/filterPanel/Index'];
}
