import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/toggle/Tumbler/inlineHeight/Template';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items1: RecordSet;
    protected _selectedKey1: string | null = '1';
    protected _selectedKey2: string | null = '1';
    protected _selectedKey3: string | null = '1';
    protected _selectedKey4: string | null = '1';
    protected _selectedKey5: string | null = '1';
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
                }
            ],
            keyProperty: 'id'
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
