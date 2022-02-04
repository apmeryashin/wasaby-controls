import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/HorizontalScroll/HorizontalScroll';
import * as headerTemplate from 'wml!Controls-demo/gridNew/HorizontalScroll/HeaderTemplate';
import * as columnTemplate from 'wml!Controls-demo/gridNew/HorizontalScroll/ColumnTemplate';
import { IColumn, IHeaderCell } from 'Controls/grid';
import {Memory} from 'Types/source';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] =
        this._multiplyColumns(Countries.getHeader(), 20, 'pseudo', headerTemplate);
    protected _columns: IColumn[] =
        this._multiplyColumns(Countries.getColumnsWithWidths(), 20, 'pseudo', columnTemplate);
    protected _stickyColumnsCount: number = 1;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._getData('key', 30)
        });
    }

    private _multiplyColumns<T extends Array<{}>>(columns: T, count: number, displayProperty, template): T {
        const res = [...(columns.slice(1, columns.length).map((c) => ({...c})))] as T;
        for (let i = 0; i < count - 1; i++) {
            res.push(
                ...(columns.map((c, idx) => ({
                    ...c,
                    [displayProperty]: `Column ${columns.length * i + idx}`,
                    template,
                    width: 'auto'
                })))
            );
        }
        return res;
    }

    private _getData(keyProperty: string, count: number): object[] {
        const res = [];
        const data = Countries.getData();
        for (let i = 0; i < count; i++) {
            res.push({...data[i % data.length], number: i});
            res[i][keyProperty] = i;
        }
        return res;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
