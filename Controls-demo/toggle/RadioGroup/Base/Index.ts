import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import Template = require('wml!Controls-demo/toggle/RadioGroup/Base/Template');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _selectedKey: string = '1';
    protected _selectedKey2: string = '1';
    protected _selectedKey3: string = '1';
    protected _source: Memory;
    protected _items: RecordSet;
    protected _displayProperty: string = 'caption';

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: 'item-1'
                }, {
                    id: '2',
                    title: 'item-2'
                }, {
                    id: '3',
                    title: 'item-3'
                }
            ]
        });
        this._source = new Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [{
                id: '1',
                title: 'State1',
                caption: 'Additional caption1'
            }, {
                id: '2',
                title: 'State2',
                caption: 'Additional caption2',
                readOnly: true
            }, {
                id: '3',
                title: 'State3',
                caption: 'Additional caption3'
            }]
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
