import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/CompositeFilter/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonSource: object[] = [];
    protected _source: Memory = null;
    protected _gridColumns: object[] = [
        {
            displayProperty: 'title'
        }, {
            displayProperty: 'amount'
        }
    ];

    protected _beforeMount(): void {
        const data = [
            {department: 'Разработка', title: 'Разработка', isDevelopment: true},
            {department: 'Продвижение СБИС', title: 'Продвижение СБИС', isDevelopment: false},
            {department: 'Федеральная клиентская служка', title: 'Федеральная клиентская служка', isDevelopment: false}
        ];
        this._source = new Memory({
            data,
            keyProperty: 'department'
        });
        this._filterButtonSource = [
            {
                group: 'Разработка',
                name: 'isDevelopment',
                editorTemplateName: 'Controls-demo/filterPanel/CompositeFilter/resources/CheckboxEditor',
                resetValue: false,
                caption: '',
                value: true,
                textValue: '',
                editorOptions: {
                    caption: 'Разработка'
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/filterPanel/Index'];
}
