import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Heading/Back/IconViewMode/Index';
import 'css!Controls-demo/Controls-demo';

export default class Index extends Control {
    protected _template: TemplateFunction = template;
}
