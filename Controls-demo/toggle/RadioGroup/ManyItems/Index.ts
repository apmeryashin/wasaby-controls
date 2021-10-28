import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import Template = require('wml!Controls-demo/toggle/RadioGroup/ManyItems/Template');

class Direction extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _selectedKey: string = 1;
    protected _selectedKey2: string = 1;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [
                {
                    id: 1,
                    title: 'First option'
                },
                {
                    id: 2,
                    title: 'Second option'
                },
                {
                    id: 3,
                    title: 'Third option'
                },
                {
                    id: 4,
                    title: 'Fourth option'
                },
                {
                    id: 5,
                    title: 'Fifth option'
                },
                {
                    id: 6,
                    title: 'Sixth options'
                },
                {
                    id: 7,
                    title: 'Sevent option'
                }
            ]
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Direction;
