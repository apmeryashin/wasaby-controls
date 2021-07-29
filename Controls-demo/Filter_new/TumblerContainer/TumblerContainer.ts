import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import * as Template from 'wml!Controls-demo/Filter_new/TumblerContainer/TumblerContainer';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet = null;
    protected _selectedKey: string = '1';
    protected _filter: object = {};
    protected _filterSource: object[] = null;
    protected _source: Memory = null;

    protected _beforeMount(): void {
        this._filterSource = [
            {
            name: 'date',
            resetValue: null,
            value: null,
            type: 'dateRange',
            itemTemplate: 'wml!Controls-demo/Filter_new/resources/Editors/DateRange',
            editorOptions: {
                emptyCaption: 'Весь период',
                editorMode: 'Selector',
                chooseHalfyears: true,
                chooseYears: true,
                clearButtonVisibility: true
            },
            viewMode: 'basic'
        }, {
            name: 'tumbler',
            resetValue: '1',
            value: '1',
            type: 'tumbler',
            editorOptions: {
                items: new RecordSet({
                    rawData: [
                        {
                            id: '1',
                            caption: 'Название 1'
                        },
                        {
                            id: '2',
                            caption: 'Название 2'
                        },
                        {
                            id: '3',
                            caption: 'Название 3'
                        }
                    ],
                    keyProperty: 'id'
                })
            },
            viewMode: 'tumbler'
        }];

        this._source = new Memory({
            keyProperty: 'id',
            data: [
                { id: '1', title: 'Первая запись' },
                { id: '2', title: 'Вторая запись' },
                { id: '3', title: 'Третья запись' }
            ],
            filter: (item, queryFilter) => {
                let addToData = true;
                for (const filterField in queryFilter) {
                    const filterValue = queryFilter[filterField];
                    if (filterValue) {
                        const itemId = item.get('id');
                        addToData = itemId === filterValue;
                    }
                }
                return addToData;
            }
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
