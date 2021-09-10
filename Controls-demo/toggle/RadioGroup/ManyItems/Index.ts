import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import Template = require('wml!Controls-demo/toggle/RadioGroup/ManyItems/Template');

class Direction extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _selectedKey: string = '1';
    protected _selectedKey2: string = '1';
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [
                {
                    key: 1,
                    title: 'First option'
                },
                {
                    key: 2,
                    title: 'Second option'
                },
                {
                    key: 3,
                    title: 'Third option'
                },
                {
                    key: 4,
                    title: 'Fourth option'
                },
                {
                    key: 5,
                    title: 'Fifth option'
                },
                {
                    key: 6,
                    title: 'Sixth options'
                },
                {
                    key: 7,
                    title: 'Sevent option'
                }
            ]
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Direction;
