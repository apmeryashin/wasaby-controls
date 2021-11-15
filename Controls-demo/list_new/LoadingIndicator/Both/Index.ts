import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/LoadingIndicator/Both/Both';
import Memory from './Memory';
import { Memory as DefaultMemory } from 'Types/source';
import {slowDownSource} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';
import {register} from 'Types/di';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory = null;
    protected _keyProperty: string = 'key';
    protected _filter: Object = null;
    protected _navigation: object = {
        view: 'infinity',
        source: 'position',
        sourceConfig: {
            field: 'key',
            position: 0,
            direction: 'bothways',
            limit: 15
        }
    };
    private _fastFilterData: any;

    protected _beforeMount(): void {
        this._viewSource = new Memory({keyProperty: this._keyProperty});
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

    protected _onReload(): void {
        this._viewSource = new Memory({keyProperty: this._keyProperty, model: 'LoadingIndicator/Both/MyModel'});
        slowDownSource(this._viewSource, 2000);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

class MyModel extends Model { }
register('LoadingIndicator/Both/MyModel', MyModel, {instantiate: false});
