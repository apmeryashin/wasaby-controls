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
                caption: 'Сообщения',
                name: 'booleanEditor',
                editorTemplateName: 'Controls/filterPanel:TextEditor',
                resetValue: false,
                viewMode: 'basic',
                value: false,
                editorOptions: {
                    filterValue: true,
                    extendedCaption: 'Непрочитанные'
                }
            }, {
                caption: '',
                name: 'booleanEditor1',
                editorTemplateName: 'Controls/filterPanel:TextEditor',
                resetValue: false,
                viewMode: 'extended',
                value: false,
                editorOptions: {
                    filterValue: true,
                    extendedCaption: 'Без групп'
                }
            }, {
                caption: '',
                name: 'booleanEditor2',
                editorTemplateName: 'Controls/filterPanel:TextEditor',
                resetValue: false,
                viewMode: 'extended',
                value: false,
                editorOptions: {
                    filterValue: true,
                    extendedCaption: 'Неотвеченные'
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/filterPanel/Index'];
}
