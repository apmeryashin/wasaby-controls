import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ItemTemplate/CustomClass/CustomClass';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';

const MAXINDEX = 5;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Countries.getData().slice(0, MAXINDEX)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
