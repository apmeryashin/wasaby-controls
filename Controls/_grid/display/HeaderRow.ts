import {
    ICellPadding,
    IColumn,
    IColumnSeparatorSizeConfig,
    TColumnSeparatorSize
} from './interface/IColumn';

import {IHeaderCell, THeader} from './interface/IHeaderCell';

import Row, {IOptions as IRowOptions} from './Row';
import Header, {IHeaderBounds} from './Header';
import ItemActionsCell from './ItemActionsCell';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
import {ISortItem} from 'Controls/_grid/display/mixins/Grid';

export interface IOptions extends IRowOptions<null> {
    headerModel: Header;
}

/**
 * Строка заголовка в таблице
 */
export default class HeaderRow extends Row<null> {
    protected _$headerModel: Header;
    protected _$sorting: ISortItem[];

    readonly listElementName: string = 'header';

    constructor(options?: IOptions) {
        super(options);

        // Заголовок будет всегда застикан при отрисовке, когда есть данные вверх
        this._shadowVisibility = this.hasMoreDataUp() ? 'initial' : 'lastVisible';
    }

    getIndex(): number {
        return this._$owner.getRowIndex(this);
    }

    isSticked(): boolean {
        return this._$headerModel.isSticked();
    }

    isMultiline(): boolean {
        return this._$headerModel.isMultiline();
    }

    getContents(): string {
        return 'header';
    }

    getItemClasses(): string {
        return 'controls-Grid__header';
    }

    getColumnIndex(cell: HeaderCell, takeIntoAccountColspans: boolean = false): number {
        const superIndex = super.getColumnIndex.apply(this, arguments);
        const columnItems = this.getColumns() as HeaderCell[];
        let ladderCells = 0;

        // Ищем индекс ячейки, попутно считаем колспаны предыдущих.
        columnItems.forEach((columnItem, index) => {
            if (columnItem.isLadderCell() && index < superIndex) {
                ladderCells++;
            }
        });

        return superIndex - ladderCells;
    }

    protected _processStickyLadderCells(): void {
        // todo Множественный stickyProperties можно поддержать здесь:
        const stickyLadderProperties = this.getStickyLadderProperties(this._$gridColumnsConfig[0]);
        const stickyLadderCellsCount = stickyLadderProperties && stickyLadderProperties.length || 0;

        if (stickyLadderCellsCount === 2) {
            this._$columnItems.splice(1, 0, new HeaderCell({
                column: {},
                isLadderCell: true,
                owner: this,
                backgroundStyle: 'transparent',
                shadowVisibility: 'hidden'
            }));
        }

        if (stickyLadderCellsCount) {
            this._$columnItems = ([
                new HeaderCell({
                    column: {},
                    isLadderCell: true,
                    owner: this,
                    shadowVisibility: 'hidden',
                    backgroundStyle: 'transparent'
                })
            ] as Cell[]).concat(this._$columnItems);
        }
    }

    getBounds(): IHeaderBounds {
        return this._$headerModel.getBounds();
    }

    protected _initializeColumns(): void {
        // TODO: Уйдет при выпиле старого горизонтального скролла, в ХФ никак не меняем старое поведение.
        const columnsMap = (cb: Function) => {
            if (this._$owner.hasNewColumnScroll()) {
                return this._$owner.getColumnsEnumerator().getIndexes(true).map(
                    (index) => cb(this._$columnsConfig[index], index)
                );
            } else {
                return this._$columnsConfig.map(cb);
            }
        };

        if (this._$columnsConfig) {
            this._$columnItems = [];
            const factory = this.getColumnsFactory();
            let totalColspan = 0;

            this._$columnItems = columnsMap((column, index) => {
                const isFixed =
                    (this.isMultiline() ? (column.startColumn - 1) : totalColspan) < this.getStickyColumnsCount();
                totalColspan += (column.endColumn - column.startColumn) || 1;
                return factory({
                    column,
                    isFixed,
                    sorting: this._getSortingBySortingProperty(column.sortingProperty),
                    backgroundStyle: this._$backgroundStyle,
                    cellPadding: this._getCellPaddingForHeaderColumn(column, index),
                    columnSeparatorSize: this._getColumnSeparatorSizeForColumn(column, index),
                    shadowVisibility: this.getShadowVisibility()
                });
            });

            this._processStickyLadderCells();
            this._addCheckBoxColumnIfNeed();

            if (this.hasItemActionsSeparatedCell()) {
                this._$columnItems.push(new ItemActionsCell({
                    owner: this,
                    rowspan: this.getBounds().row.end - this.getBounds().row.start,
                    column: {}
                }));
            }
        }
    }

    protected _addCheckBoxColumnIfNeed(): void {
        const factory = this.getColumnsFactory();
        if (this._$owner.hasMultiSelectColumn()) {
            const {start, end} = this._$headerModel.getBounds().row;
            this._$columnItems.unshift(factory({
                column: {
                    startRow: start,
                    endRow: end,
                    startColumn: 1,
                    endColumn: 2
                },
                backgroundStyle: this._$backgroundStyle,
                isFixed: true,
                shadowVisibility: this.getShadowVisibility()
            }));
        }
    }

    protected _getCellPaddingForHeaderColumn(headerColumn: IHeaderCell, columnIndex: number): ICellPadding {
        const columns = this.getGridColumnsConfig();
        const headerColumnIndex =
            typeof headerColumn.startColumn !== 'undefined' ? headerColumn.startColumn - 1 : columnIndex;
        return columns[headerColumnIndex].cellPadding;
    }

    protected _updateSeparatorSizeInColumns(separatorName: 'Column'): void {
        this._$columnsConfig.forEach((column, columnIndex) => {
            const multiSelectOffset = this.hasMultiSelectColumn() ? 1 : 0;
            const cell = this._$columnItems[columnIndex + multiSelectOffset];
            cell[`set${separatorName}SeparatorSize`](
                this[`_get${separatorName}SeparatorSizeForColumn`](column, columnIndex)
            );
        });
    }

    protected _getColumnSeparatorSizeForColumn(column: IHeaderCell, columnIndex: number): TColumnSeparatorSize {
        if (columnIndex > 0) {
            const currentColumn = {
                ...column,
                columnSeparatorSize: this._getHeaderColumnSeparatorSize(column, columnIndex)
            } as IColumn;

            const prevColumnIndex = columnIndex - (
                (columnIndex > 1 &&
                    this._$columnsConfig[columnIndex - 1].startColumn === column.startColumn &&
                    column.startColumn !== undefined) ? 2 : 1);

            const prevColumnConfig = this._$columnsConfig[prevColumnIndex];
            const columnSeparatorSize = this._getHeaderColumnSeparatorSize(prevColumnConfig, prevColumnIndex);
            const previousColumn: IColumn = {
                ...prevColumnConfig,
                columnSeparatorSize
            } as IColumn;

            return this._resolveColumnSeparatorSize(currentColumn, previousColumn);
        }
        return null;
    }

    private _getHeaderColumnSeparatorSize(headerColumn: IHeaderCell, columnIndex: number): IColumnSeparatorSizeConfig {
        const columnSeparatorSize: IColumnSeparatorSizeConfig = {};
        const columns = this.getGridColumnsConfig();
        const columnLeftIndex =
            typeof headerColumn.startColumn !== 'undefined' ? headerColumn.startColumn - 1 : columnIndex;
        const columnRightIndex =
            typeof headerColumn.endColumn !== 'undefined' ? headerColumn.endColumn - 2 : columnIndex;
        const columnLeft = columns[columnLeftIndex];
        const columnRight = columns[columnRightIndex];
        if (columnLeft?.columnSeparatorSize?.hasOwnProperty('left')) {
            columnSeparatorSize.left = columnLeft.columnSeparatorSize.left;
        }
        if (columnRight?.columnSeparatorSize?.hasOwnProperty('right')) {
            columnSeparatorSize.right = columnRight.columnSeparatorSize.right;
        }
        return columnSeparatorSize;
    }

    setSorting(sorting: ISortItem[]): void {
        this._$sorting = sorting;
        if (this._$columnItems) {
            this._$columnItems.forEach((cell) => {
                // Пропускаем колонку для операций над записью
                if ((cell as ItemActionsCell).ItemActionsCell) {
                    return;
                }
                const cellSorting = this._getSortingBySortingProperty((cell as HeaderCell).getSortingProperty());
                (cell as HeaderCell).setSorting(cellSorting);
            });
            this._nextVersion();
        }
    }

    private _getSortingBySortingProperty(property: string): string {
        const sorting = this._$sorting;
        let sortingDirection;
        if (sorting && property) {
            sorting.forEach((elem) => {
                if (elem[property]) {
                    sortingDirection = elem[property];
                }
            });
        }
        return sortingDirection;
    }
}

Object.assign(HeaderRow.prototype, {
    '[Controls/_display/grid/HeaderRow]': true,
    _moduleName: 'Controls/grid:GridHeaderRow',
    _instancePrefix: 'grid-header-row-',
    _cellModule: 'Controls/grid:GridHeaderCell',
    _$headerModel: null,
    _$sorting: null
});
