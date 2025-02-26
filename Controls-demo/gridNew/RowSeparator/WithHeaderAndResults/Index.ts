import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/RowSeparator/WithHeaderAndResults/WithHeaderAndResults';
import {Memory} from 'Types/source';
import {IColumn, IHeaderCell} from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedLargeWidths();
    protected _header: IHeaderCell[] = Countries.getHeader();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData(5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
