import {Control, TemplateFunction} from 'UI/Base';
import * as template 'wml!Controls-demo/dateNew/RightFieldTemplate/RightFieldTemplate';

class DemoControl extends Control {
    protected _template: TemplateFunction = template;
    protected _value: Date = new Date(2021, 1, 1);
}

export default DemoControl;
