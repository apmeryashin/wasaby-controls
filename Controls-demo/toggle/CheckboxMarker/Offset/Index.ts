import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/toggle/CheckboxMarker/Offset/Offset');

class CheckboxMarker extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _value1: boolean = null;
    protected _value2: boolean = true;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default CheckboxMarker;
