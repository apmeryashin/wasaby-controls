import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/LoadingIndicator/Both/Both';
import Memory from './Memory';
import {SyntheticEvent} from "UI/Vdom";
import {Memory as DefaultMemory} from "Types/source";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory = null;
    protected _filter: Object = null;
    protected _position: number = 0;
    private _fastFilterData: any;

    protected _beforeMount(): void {
        this._viewSource = new Memory({keyProperty: 'key'});
        this._filter = {};
        this._fastFilterData = [{
            name: 'filter',
            value: null,
            resetValue: null,
            emptyText: 'Все',
            editorOptions: {
                source: new DefaultMemory({
                    keyProperty: 'id',
                    data: [
                        {id: 'few-items', title: 'Мало записей'},
                        {id: 'more-items', title: 'Много записей'},
                    ]
                }),
                displayProperty: 'title',
                keyProperty: 'id'
            },
            viewMode: 'frequent'
        }];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
