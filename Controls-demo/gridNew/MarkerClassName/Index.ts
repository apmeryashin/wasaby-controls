import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import * as Template from 'wml!Controls-demo/gridNew/MarkerClassName/MarkerClassName';
import {IColumn} from 'Controls/grid';
import {Tasks} from 'Controls-demo/gridNew/DemoHelpers/Data/Tasks';

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSourceImage: Memory;
    protected _viewSourceImageL: Memory;
    protected _viewSourceImageM: Memory;
    protected _viewSourceImageS: Memory;
    protected _viewSourceImageXS: Memory;
    protected _viewSourceText: Memory;
    protected _columnsImage: INoStickyLadderColumn[] = Tasks.getColumns();
    protected _columnsText: IColumn[] =  [
        {
            displayProperty: 'px',
            width: '150px'
        },
        {
            displayProperty: 'fr1of3',
            width: '400px'
        }
    ];
    protected _ladderProperties: string[] = ['photo', 'date'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSourceText = new Memory({
            keyProperty: 'key',
            data: [
                {
                    key: 1,
                    px: 'Строго 150px',
                    fr1of3: '1/3 свободного пространства. fr - гибкая ширина. fr расчитывается как доля от оставшегося свободного пространства внутри грида. Грубо говоря, сначала браузер просчитает ширины всех остальных колонок, потом fr'
                },
                {
                    key: 2,
                    px: 'Ячейка 2/1',
                    fr1of3: 'Ячейка 2/3'
                }
            ]
        });
        this._viewSourceImage = this._getViewSource();
        this._viewSourceImageL = this._getViewSource(40, 40);
        this._viewSourceImageM = this._getViewSource(32, 32);
        this._viewSourceImageS = this._getViewSource(24, 24);
        this._viewSourceImageXS = this._getViewSource(16, 16);
    }

    private _getViewSource(imageWidth?: number, imageHeight?: number): Memory {
        const data = Tasks.getData().map((el) => {
            const newEl = {...el};
            if (imageWidth) {
                newEl.width = `${imageWidth}px`;
            }
            if (imageHeight) {
                newEl.height = `${imageHeight}px`;
            }
            return newEl;
        });
        return new Memory({
            keyProperty: 'key',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
