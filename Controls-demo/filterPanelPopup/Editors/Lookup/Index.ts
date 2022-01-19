import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPanelPopup/Editors/Lookup/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _filterButtonSource: unknown[] = [];
    protected _source: Memory = null;

    protected _beforeMount(): void {
        this._filterButtonSource = [
            {
                name: 'position',
                caption: 'Должность',
                editorTemplateName: 'Controls/filterPanel:LookupEditor',
                resetValue: '1',
                value: '1',
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
                    extendedCaption: 'Должность',
                    selectorTemplate: {
                        templateName: 'Controls-demo/filterPanel/resources/MultiSelectStackTemplate/StackTemplate',
                        templateOptions: {items: [
                                { id: '1', title: 'Разработчик' },
                                { id: '2', title: 'Тестировщик' },
                                { id: '3', title: 'Сборщик' }
                            ]}
                    }
                }
            }
        ];
    }
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
