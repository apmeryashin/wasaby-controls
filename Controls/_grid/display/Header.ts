import {create} from 'Types/di';

import {TColumns, TColumnSeparatorSize} from './interface/IColumn';

import Collection from './Collection';
import HeaderRow, {IOptions as IHeaderRowOptions} from './HeaderRow';
import {ISortItem} from './mixins/Grid';

export interface IOptions extends IHeaderRowOptions {
}

export interface IHeaderBounds {
    row: { start: number, end: number };
    column: { start: number, end: number };
}

/**
 * Заголовок таблицы
 */
export default class Header {
    protected _$owner: Collection;
    protected _$rows: HeaderRow[];
    protected _$headerBounds: IHeaderBounds;
    protected _$theme: string;
    protected _$style: string;

    constructor(options: IOptions) {
        this._$owner = options.owner;
        this._$rows = this._initializeRows(options);
    }

    getBounds(): IHeaderBounds {
        return this._$headerBounds;
    }

    getRow(): HeaderRow {
        return this._$rows[0];
    }

    getTheme(): string {
        return this._$theme;
    }

    getStyle(): string {
        return this._$style;
    }

    getRowIndex(row: HeaderRow): number {
        return this._$rows.indexOf(row);
    }

    isMultiline(): boolean {
        return (this._$headerBounds.row.end - this._$headerBounds.row.start) > 1;
    }

    isSticked(): boolean {
        return this._$owner.isStickyHeader() && this._$owner.isFullGridSupport();
    }

    setColumnSeparatorSize(columnSeparatorSize: TColumnSeparatorSize): void {
        this._$rows.forEach((row) => {
            row.setColumnSeparatorSize(columnSeparatorSize);
        });
    }

    setStickyColumnsCount(stickyColumnsCount: number): void {
        this._$rows.forEach((row) => {
            row.setStickyColumnsCount(stickyColumnsCount);
        });
    }

    setMultiSelectVisibility(multiSelectVisibility: string): void {
        this._$rows.forEach((row) => {
            row.setMultiSelectVisibility(multiSelectVisibility);
        });
    }

    setColumnsConfig(newColumns: TColumns): void {
        this._$rows.forEach((row) => {
            row.setColumnsConfig(newColumns);
        });
    }

    setGridColumnsConfig(newColumns: TColumns): void {
        this._$rows.forEach((row) => {
            row.setGridColumnsConfig(newColumns);
        });
    }

    setSorting(sorting: ISortItem[]): void {
        this._$rows.forEach((row) => {
            row.setSorting(sorting);
        });
    }

    protected _initializeRows(options: IOptions): HeaderRow[] {
        this._$headerBounds = this._getGridHeaderBounds(options);
        return this._buildRows(options);
    }

    protected _buildRows(options: IOptions): HeaderRow[] {
        const factory = this._getRowsFactory();
        return [new factory(options)];
    }

    protected _getGridHeaderBounds(options: IOptions): IHeaderBounds {
        const bounds: IHeaderBounds = {
            row: {start: Number.MAX_VALUE, end: Number.MIN_VALUE},
            column: {start: 1, end: options.gridColumnsConfig.length + 1}
        };

        for (let i = 0; i < options.columnsConfig.length; i++) {
            if (typeof options.columnsConfig[i].startRow === 'number') {
                bounds.row.start = Math.min(options.columnsConfig[i].startRow, bounds.row.start);
            } else {
                // Одноуровневая шапка либо невалидная конфигурация шапки
                bounds.row.start = 1;
                bounds.row.end = 2;
                break;
            }

            if (typeof options.columnsConfig[i].endRow === 'number') {
                bounds.row.end = Math.max(options.columnsConfig[i].endRow, bounds.row.end);
            } else {
                // Одноуровневая шапка либо невалидная конфигурация шапки
                bounds.row.start = 1;
                bounds.row.end = 2;
                break;
            }
        }
        return bounds;
    }

    protected _getRowsFactory(): new (options: IOptions) => HeaderRow {
        return (options: IOptions) => {
            options.headerModel = this;
            options.hasMoreDataUp = !!options.hasMoreData?.up;
            options.theme = this.getTheme();
            options.style = this.getStyle();
            return create(this._rowModule, options as IHeaderRowOptions);
        };
    }
}

Object.assign(Header.prototype, {
    '[Controls/_display/grid/Header]': true,
    _moduleName: 'Controls/grid:GridHeader',
    _instancePrefix: 'grid-header-',
    _rowModule: 'Controls/grid:GridHeaderRow',
    _cellModule: 'Controls/grid:GridHeaderCell',
    _$style: 'default',
    _$theme: 'default'
});
