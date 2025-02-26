import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/toggle/Switch/Size/Template';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: boolean = false;
    protected _value2: boolean = false;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Base;
