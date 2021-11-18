import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/LoadingIndicator/Middle/ColumnScroll/ColumnScroll';
import {Memory} from 'Types/source';
import { IColumn, IHeaderCell } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';
import {slowDownSource} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';

function getColumnsWithScroll(): IColumn[] {
    return [
        {
            displayProperty: 'number',
            width: '40px'
        },
        {
            displayProperty: 'country',
            width: '300px'
        },
        {
            displayProperty: 'capital',
            width: '700px',
            compatibleWidth: '98px'
        },
        {
            width: '200px'
        },
        {
            displayProperty: 'population',
            width: '700px',
            compatibleWidth: '100px'
        },
        {
            displayProperty: 'square',
            width: '700px',
            compatibleWidth: '83px'
        },
        {
            displayProperty: 'populationDensity',
            width: '700px',
            compatibleWidth: '175px'
        }
    ];
}

function getHeaderWithColumnScroll(): IHeaderCell[] {
    return [
        {
            caption: '#',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2
        },
        {
            caption: 'Географические данные',
            startRow: 1,
            endRow: 2,
            startColumn: 2,
            endColumn: 4,
            align: 'center'
        },
        {
            caption: 'Страна',
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
        },
        {
            caption: 'Столица',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Колонка с выключенным перемещением мышью',
            startRow: 1,
            endRow: 3,
            startColumn: 4,
            endColumn: 5
        },
        {
            caption: 'Цифры',
            startRow: 1,
            endRow: 2,
            startColumn: 5,
            endColumn: 8,
            align: 'center'
        },
        {
            caption: 'Население',
            startRow: 2,
            endRow: 3,
            startColumn: 5,
            endColumn: 6
        },
        {
            caption: 'Площадь км2',
            startRow: 2,
            endRow: 3,
            startColumn: 6,
            endColumn: 7
        },
        {
            caption: 'Плотность населения чел/км2',
            startRow: 2,
            endRow: 3,
            startColumn: 7,
            endColumn: 8
        }
    ];
}

function getColumns(): IColumn[] {
    return [
        {
            displayProperty: 'number',
            width: '40px'
        },
        {
            displayProperty: 'country',
            width: '300px'
        },
        {
            displayProperty: 'capital',
            width: '300px'
        }
    ];
}

function getHeader(): IHeaderCell[] {
    return [
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
        }
    ];
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = getHeaderWithColumnScroll();
    protected _columns: IColumn[] = getColumnsWithScroll();
    protected _selectedKeys: number[] = [];
    protected _columnScroll: boolean = true;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData()
        });
    }

    protected _reloadList(): void {
        slowDownSource(this._viewSource, 5000);
        this._children.list.reload();
    }

    protected _switchColumnScroll(): void {
        this._columnScroll = !this._columnScroll;

        if (this._columnScroll) {
            this._columns = getColumnsWithScroll();
            this._header = getHeaderWithColumnScroll();
        } else {
            this._columns = getColumns();
            this._header = getHeader();
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
