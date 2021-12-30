import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/dateNew/Input/Placeholder/Placeholder';

class DemoControl extends Control {
    protected _template: TemplateFunction = template;
}

export default DemoControl;
