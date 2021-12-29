import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Heading/Back/TextTransform/Index';
import 'css!Controls-demo/Controls-demo';

export default class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
