import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/DataStoreContext/Widget';

export default class WidgetWrapper extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}
