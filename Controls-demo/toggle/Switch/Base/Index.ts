import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/toggle/Switch/Base/Template');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: boolean = true;
    protected _value2: boolean = false;
    protected _value3: boolean = false;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Base;
