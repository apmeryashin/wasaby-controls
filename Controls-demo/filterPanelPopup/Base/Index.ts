import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanelPopup/Base/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonData: unknown[] = [];
    protected _source: Memory = null;
    protected _navigation: object = null;
    protected _filterItems: object[] = null;
    protected _detailPanelTemplateOptions: object = {};

    protected _beforeMount(): void {
        this._filterButtonData = [
            {
                caption: '',
                name: 'booleanEditor',
                editorTemplateName: 'Controls/filterPanel:TextEditor',
                resetValue: false,
                viewMode: 'basic',
                value: false,
                editorOptions: {
                    value: true,
                    extendedCaption: 'Без рабочих групп'
                }
            }, {
                group: 'Город',
                name: 'city',
                editorTemplateName: 'Controls/filterPanel:DropdownEditor',
                resetValue: ['1'],
                caption: '',
                value: ['1'],
                textValue: '',
                viewMode: 'basic',
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
                group: 'Должность',
                name: 'position',
                editorTemplateName: 'Controls/filterPanel:DropdownEditor',
                resetValue: ['1'],
                caption: '',
                value: ['1'],
                textValue: '',
                viewMode: 'basic',
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

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
