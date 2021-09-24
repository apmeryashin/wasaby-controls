import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/FilterEditors/TextEditor/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonSource: object[] = [];
    protected _source: Memory = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: [
                {department: 'Разработка', title: 'Разработка'},
                {department: 'Продвижение СБИС', title: 'Продвижение СБИС'},
                {department: 'Федеральная клиентская служка', title: 'Федеральная клиентская служка'}
            ],
            keyProperty: 'department',
            filter: (item, queryFilter) => {
                const filterValue = queryFilter.hasOwnProperty('booleanEditor') && queryFilter.booleanEditor;
                const itemTitle = item.get('title');
                return filterValue ? itemTitle === 'Разработка' : true;
            }
        });
        this._filterButtonSource = [
            {
                caption: '',
                name: 'booleanEditor',
                editorTemplateName: 'Controls/filterPanel:TextEditor',
                resetValue: false,
                viewMode: 'basic',
                value: true,
                editorOptions: {
                    value: true,
                    extendedCaption: 'Разработка'
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
