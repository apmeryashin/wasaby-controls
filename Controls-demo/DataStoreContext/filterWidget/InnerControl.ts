import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/DataStoreContext/filterWidget/InnerControl';

export default class WidgetControl extends Control {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        this._options.dataStoreValue.filterStore.applyFilterDescription([
            {
                name: 'title',
                value: ['Александр'],
                viewMode: 'basic',
                textValue: ''
            }
        ]);
    }
}
