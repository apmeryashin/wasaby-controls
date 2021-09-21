import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/LoadingIndicator/Down/ColumnScroll/ColumnScroll';
import {Memory} from 'Types/source';
import { IColumn, IHeaderCell } from 'Controls/grid';
import {slowDownSource} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';
import PortionedSearchMemory from 'Controls-demo/gridNew/LoadingIndicator/Down/ColumnScroll/PortionedSearchMemory';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = [
        {
            caption: '#',
            startColumn: 1,
            endColumn: 2
        },
        {
            caption: 'Страна',
            startColumn: 2,
            endColumn: 3
        },
        {
            caption: 'Столица',
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Колонка с выключенным перемещением мышью',
            startColumn: 4,
            endColumn: 5
        },
        {
            caption: 'Население',
            startColumn: 5,
            endColumn: 6
        },
        {
            caption: 'Площадь км2',
            startColumn: 6,
            endColumn: 7
        },
        {
            caption: 'Плотность населения чел/км2',
            startColumn: 7,
            endColumn: 8
        }
    ];
    protected _columns: IColumn[] = [
        {
            displayProperty: 'key',
            width: '40px'
        },
        {
            displayProperty: 'country',
            width: '300px'
        },
        {
            displayProperty: 'capital',
            width: '300px'
        },
        {
            width: '200px'
        },
        {
            displayProperty: 'key',
            width: '200px'
        },
        {
            displayProperty: 'key',
            width: '200px',
            compatibleWidth: '83px'
        },
        {
            displayProperty: 'key',
            width: '200px'
        }
    ];
    protected _position: number = 0;
    protected _filter: Object = null;

    protected _beforeMount(): void {
        this._viewSource = new PortionedSearchMemory({keyProperty: 'key'});
        slowDownSource(this._viewSource, 2000);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
