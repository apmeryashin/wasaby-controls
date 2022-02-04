import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/BackgroundHoverStyle/BackgroundHoverStyle';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { SyntheticEvent } from 'Vdom/Vdom';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';
import {IRoundBorder, TRoundBorderSize} from 'Controls/interface';

const MAXINDEX = 5;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();
    protected _hoverBackground: string = 'primary';
    protected _hoverMode: string = 'highlight';
    protected _roundBorder: IRoundBorder;
    protected _shadowVisibility: 'visible' | 'hidden' | 'onhover' = 'hidden';
    protected _borderVisibility: 'visible' | 'hidden' | 'onhover' = 'hidden';

    protected _roundBorderVariants = ['null', 'xs', 's', 'm', 'l', 'xl', '3xs', '2xs'];

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

    protected _setHoverBackground(e: SyntheticEvent, value: string): void {
        this._hoverBackground = value;
    }

    protected _setShadowVisibility(e: SyntheticEvent, value: string): void {
        this._shadowVisibility = value;
    }

    protected _setBorderVisibility(e: SyntheticEvent, value: string): void {
        this._borderVisibility = value;
    }

    protected _setHoverMode(e: SyntheticEvent, value: string): void {
        this._hoverMode = value;
    }

    protected _setRoundBorder(e: SyntheticEvent, value: TRoundBorderSize): void {
        this._roundBorder = {
            bl: value,
            br: value,
            tl: value,
            tr: value
        };
    }
}
