import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/BackgroundHoverStyle/BackgroundHoverStyle';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

const MAXINDEX = 5;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();
    protected _hoverBackground: string = 'default';
    protected _hoverMode: string = 'background';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().slice(0, MAXINDEX)
        });
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/gridNew/BackgroundHoverStyle/BackgroundHoverStyle'
    ];

    protected _setHoverBackground(value: string): void {
        this._hoverBackground = value;
    }

    protected _setHoverMode(value: string): void {
        this._hoverMode = value;
    }
}
