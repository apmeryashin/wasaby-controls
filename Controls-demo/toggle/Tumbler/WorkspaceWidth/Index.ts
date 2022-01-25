import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/toggle/Tumbler/WorkspaceWidth/Template';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items1: RecordSet;
    protected _selectedKey1: string | null = '1';
    protected _selectedKey2: string | null = '1';
    protected _beforeMount(): void {
        this._items1 = new RecordSet({
            rawData: [
                {
                    id: '1',
                    title: 'title 1'
                },
                {
                    id: '2',
                    title: 'title 2'
                },
                {
                    id: '3',
                    title: 'title 3'
                }
            ],
            keyProperty: 'id'
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
