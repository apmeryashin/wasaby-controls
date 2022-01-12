import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/NodeProperty/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'In any state', text: 'In any state', parent: null, '@parent': null},
                {key: 2, title: 'In progress', text: 'In progress', parent: null, '@parent': null},
                {key: 3, title: 'Completed', text: 'Completed', parent: null, '@parent': false},
                {
                    key: 4,
                    title: 'positive',
                    myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdownSub',
                    parent: 3, '@parent': null
                },
                {
                    key: 5,
                    title: 'negative',
                    myTemplate: 'wml!Controls-demo/Input/Dropdown/itemTemplateDropdownSub',
                    parent: 3, '@parent': null
                },
                {key: 6, title: 'Deleted', text: 'Deleted', parent: null, '@parent': null},
                {key: 7, title: 'Drafts', text: 'Drafts', parent: null, '@parent': null}
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
