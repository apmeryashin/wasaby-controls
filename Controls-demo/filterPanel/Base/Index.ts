import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/Base/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonSource: object[] = [];
    protected _source: Memory = null;

    protected _beforeMount(): void {
        const data = [
            {department: 'Разработка', title: 'Разработка'},
            {department: 'Продвижение СБИС', title: 'Продвижение СБИС'},
            {department: 'Федеральная клиентская служка', title: 'Федеральная клиентская служка'}
        ];
        this._source = new Memory({
            data,
            keyProperty: 'department',
            filter: (item, queryFilter) => {
                let addToData = true;
                for (const filterField in queryFilter) {
                    if (queryFilter.hasOwnProperty(filterField) && item.get(filterField)) {
                        const filterValue = queryFilter[filterField];
                        const itemValue = item.get(filterField);
                        addToData = filterValue.includes(itemValue) || !filterValue.length;
                    }
                }
                return addToData;
            }
        });
        this._filterButtonSource = [
            {
                group: 'Город',
                name: 'city',
                editorTemplateName: 'Controls/filterPanel:DropdownEditor',
                resetValue: ['1'],
                caption: '',
                value: ['1'],
                textValue: '',
                viewMode: 'extended',
                editorOptions: {
                    source: new Memory({
                        keyProperty: 'id',
                        data: [
                            { id: '1', title: 'Yaroslavl' },
                            { id: '2', title: 'Moscow' },
                            { id: '3', title: 'St-Petersburg' },
                            { id: '4', title: 'Astrahan' },
                            { id: '5', title: 'Arhangelsk' }
                        ]
                    }),
                    displayProperty: 'title',
                    keyProperty: 'id',
                    extendedCaption: 'Город'
                }
            }, {
                caption: '',
                name: 'booleanEditor',
                editorTemplateName: 'Controls/filterPanel:TextEditor',
                resetValue: false,
                viewMode: 'extended',
                value: false,
                editorOptions: {
                    filterValue: true,
                    extendedCaption: 'Без рабочих групп'
                }
            }, {
                group: 'Должность',
                name: 'position',
                editorTemplateName: 'Controls/filterPanel:DropdownEditor',
                resetValue: ['1'],
                caption: '',
                value: ['1'],
                textValue: '',
                viewMode: 'extended',
                editorOptions: {
                    source: new Memory({
                        keyProperty: 'id',
                        data: [
                            { id: '1', title: 'Разработчик' },
                            { id: '2', title: 'Тестировщик' },
                            { id: '3', title: 'Сборщик' }
                        ]
                    }),
                    displayProperty: 'title',
                    keyProperty: 'id',
                    extendedCaption: 'Должность'
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/filterPanel/Index'];
}
