import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanelPopup/HistoryId/Index';
import * as stackTemplate from 'wml!Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate';
import {Memory} from 'Types/source';
import 'Controls-demo/Filter_new/resources/HistorySourceDemo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _stackTemplate: TemplateFunction = stackTemplate;
    protected _filterButtonData: unknown[] = [];
    protected _source: Memory = null;
    protected _navigation: object = null;
    protected _filterItems: object[] = null;
    protected _detailPanelTemplateOptions: object = {};

    protected _beforeMount(): void {
        this._filterButtonData = [
            {
                caption: null,
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
                caption: 'Должность',
                name: 'position',
                editorTemplateName: 'Controls/filterPanel:DropdownEditor',
                resetValue: ['1'],
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
            }, {
                caption: 'Должность',
                name: 'position',
                editorTemplateName: 'Controls/filterPanel:LookupEditor',
                resetValue: ['1'],
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
                    extendedCaption: 'Должность',
                    multiSelect: true,
                    selectorTemplate: {
                        templateName: 'Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate',
                        templateOptions: {items: [
                                { id: '1', title: 'Разработчик' },
                                { id: '2', title: 'Тестировщик' },
                                { id: '3', title: 'Сборщик' }
                            ]},
                        popupOptions: {
                            width: 300
                        }
                    }
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
