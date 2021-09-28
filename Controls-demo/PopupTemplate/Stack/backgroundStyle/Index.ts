import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/PopupTemplate/Stack/backgroundStyle/Template');
import 'css!Controls-demo/Controls-demo';

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
export default Demo;
