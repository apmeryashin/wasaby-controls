import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Search/Search';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();

    protected _beforeMount(): void {
        this._columns.forEach((col) => {
            if (col.displayProperty === 'population') {
                col.displayType = 'number';
            }
        });

        this._columns.push(
            {
                displayType: 'date',
                displayProperty: 'date',
                displayTypeOptions: {
                    format: 'DD MMM\'YY HH:mm'
                }
            },
            {
                displayType: 'money',
                displayProperty: 'gdp'
            }
        );

        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
