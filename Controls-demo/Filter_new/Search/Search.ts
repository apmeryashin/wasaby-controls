import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/Search/Search';
import {departments} from 'Controls-demo/Filter_new/resources/DataStorage';
import memorySourceFilter = require('Controls-demo/Utils/MemorySourceFilter');
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filter: object = {};
    protected _filterSource: object[] = null;
    protected _source: Memory = null;
    protected _searchValue: string = '';

    protected _beforeMount(): void {
        this._filterSource = [{
            name: 'owner',
            value: '0',
            resetValue: '0',
            editorOptions: {
                source: new Memory({
                    keyProperty: 'lastName',
                    data: [
                        { id: 0, owner: 'По ответственному', lastName: '0' },
                        { id: 1, owner: 'Новиков Д.В.', lastName: 'Новиков Д.В.' },
                        { id: 2, owner: 'Кошелев А.Е.', lastName: 'Кошелев А.Е.' },
                        { id: 3, owner: 'Субботин А.В.', lastName: 'Субботин А.В.' },
                        { id: 4, owner: 'Чеперегин А.С.', lastName: 'Чеперегин А.С.' }
                    ]
                }),
                displayProperty: 'owner',
                keyProperty: 'lastName'
            },
            viewMode: 'frequent'
        }];

        this._source = new Memory({
            keyProperty: 'id',
            data: departments,
            filter: memorySourceFilter({
                owner: '0',
                department: 'По департаменту'
            })
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
