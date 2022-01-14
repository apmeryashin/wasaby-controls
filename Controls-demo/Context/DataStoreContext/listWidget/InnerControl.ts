import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Context/DataStoreContext/listWidget/InnerControl';

export default class WidgetControl extends Control {
    protected _template: TemplateFunction = template;

    protected _beforeMount(options): void {
        this._sourceController = options.dataStoreValue.sourceController;
        this._source = options.dataStoreValue.source;
    }
}
