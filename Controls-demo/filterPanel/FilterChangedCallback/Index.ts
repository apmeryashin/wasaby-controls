import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/FilterChangedCallback/Index';
import {isEqual} from 'Types/object';
import {Memory} from 'Types/source';
import {departments} from 'Controls-demo/filterPanel/resources/DataStorage';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonSource: unknown[] = [];
    protected _source: Memory = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: departments,
            keyProperty: 'id',
            filter: (item, queryFilter) => {
                let addToData = true;
                const emptyFields = {
                    owner: [],
                    amount: []
                };
                for (const filterField in queryFilter) {
                    if (queryFilter.hasOwnProperty(filterField) && item.get(filterField) && addToData) {
                        const filterValue = queryFilter[filterField];
                        const itemValue = item.get(filterField);
                        const itemValueIsNumber = typeof itemValue === 'number';
                        addToData = ((itemValue >= filterValue[0] || !filterValue[0]) &&
                            (itemValue <= filterValue[1] || !filterValue[1])) &&
                            itemValueIsNumber || filterValue.includes(itemValue);
                        if (emptyFields && isEqual(filterValue, emptyFields[filterField])) {
                            addToData = true;
                        }
                    }
                }
                return addToData;
            }
        });
        this._filterButtonSource = [
            {
                caption: 'Количество сотрудников',
                name: 'amount',
                editorTemplateName: 'Controls/filterPanel:NumberRangeEditor',
                resetValue: [],
                value: [],
                textValue: ''
            },
            {
                name: 'owner',
                resetValue: [],
                value: [],
                caption: '',
                expanderVisible: true,
                textValue: '',
                editorTemplateName: 'Controls/filterPanel:ListEditor',
                filterChangedCallback: 'Controls-demo/filterPanel/FilterChangedCallback/filterChangedCallback',
                editorOptions: {
                    keyProperty: 'id',
                    filter: {},
                    displayProperty: 'title',
                    source: new Memory({
                        data: [
                            { id: 'Новиков Д.В.', title: 'Новиков Д.В.', showOnAmountChanged: true},
                            { id: 'Кошелев А.Е.', title: 'Кошелев А.Е.', showOnAmountChanged: true},
                            { id: 'Субботин А.В.', title: 'Субботин А.В.'},
                            { id: 'Чеперегин А.С.', title: 'Чеперегин А.С.'}
                        ],
                        keyProperty: 'id'
                    })
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter', 'Controls-demo/filterPanel/Index'];
}
