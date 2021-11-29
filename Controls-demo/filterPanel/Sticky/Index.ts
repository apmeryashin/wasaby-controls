import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanel/Sticky/Index';
import * as stackTemplate from 'wml!Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate';
import {Memory} from 'Types/source';
import 'Controls-demo/Filter_new/resources/HistorySourceDemo';
import {RecordSet} from 'Types/collection';

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
                group: 'Статус',
                name: 'status',
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
                    extendedCaption: 'Статус'
                }
            },{
                group: 'Статус',
                name: 'status1',
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
                    extendedCaption: 'Статус'
                }
            },{
                group: 'Статус',
                name: 'status3',
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
                    extendedCaption: 'Статус'
                }
            },
            {
                group: 'Должность',
                name: 'position',
                editorTemplateName: 'Controls/filterPanel:LookupEditor',
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
                    extendedCaption: 'Должность',
                    multiSelect: true,
                    selectorTemplate: {
                        templateName: 'Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate',
                        templateOptions: {items: [
                                { id: '1', title: 'Yaroslavl' },
                                { id: '2', title: 'Moscow' },
                                { id: '3', title: 'St-Petersburg' },
                                { id: '4', title: 'Astrahan' },
                                { id: '5', title: 'Arhangelsk' }
                            ]},
                        popupOptions: {
                            width: 300
                        }
                    }
                }
            },
            {
                group: 'Пол',
                name: 'gender',
                resetValue: '1',
                caption: '',
                viewMode: 'basic',
                value: '1',
                textValue: 'Мужской',
                editorTemplateName: 'Controls/filterPanel:TumblerEditor',
                editorOptions: {
                    closeButtonVisibility: 'hidden',
                    items: new RecordSet({
                        rawData: [
                            {
                                id: '1',
                                caption: 'Мужской'
                            },
                            {
                                id: '2',
                                caption: 'Женский'
                            }
                        ],
                        keyProperty: 'id'
                    })
                }
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
