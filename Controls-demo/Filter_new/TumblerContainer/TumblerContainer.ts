import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import * as Template from 'wml!Controls-demo/Filter_new/TumblerContainer/TumblerContainer';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet = null;
    protected _selectedKey: string = '1';

    protected _beforeMount(): void {
        this._source = [
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
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
