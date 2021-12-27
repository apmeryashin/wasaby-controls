import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/Rating/_Perfomance/Template';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import * as countryRatingNumber from 'wml!Controls-demo/progress/Rating/_Perfomance/cellTemplate';
import data from 'Controls-demo/progress/Rating/_Perfomance/_data';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _columns: IColumn[] = [
        {
            displayProperty: 'key',
            width: 'max-content',
            compatibleWidth: '44px',
            template: countryRatingNumber
        },
        {
            displayProperty: 'number',
            width: '300px'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            // tslint:disable-next-line
            data: data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
