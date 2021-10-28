import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as template from 'wml!Controls-demo/Search/ExpandableInput/SearchInputContrastBackground/Index';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _navigation: object;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
