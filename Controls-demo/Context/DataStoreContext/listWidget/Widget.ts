import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Context/DataStoreContext/listWidget/Widget';

export default class WidgetControl extends Control {
    protected _template: TemplateFunction = template;
}
