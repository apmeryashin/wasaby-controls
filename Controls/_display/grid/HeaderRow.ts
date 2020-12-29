import {IColumn, IHeaderCell, THeader} from 'Controls/grid';
import Row, {IOptions as IRowOptions} from './Row';
import Header from './Header';
import ItemActionsCell from './ItemActionsCell';
import HeaderCell from 'Controls/_display/grid/HeaderCell';
import { Model } from 'Types/entity';

export interface IOptions<T> extends IRowOptions<T> {
    header: THeader;
    headerModel: Header<T>
}


export default class HeaderRow<T> extends Row<T> {
    protected _$header: THeader;
    protected _$headerModel: Header<T>;
    protected _$sorting: Array<{[p: string]: string}>;

    constructor(options?: IOptions<T>) {
        super(options);
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

    getContents(): T {
        return 'header' as unknown as T
    }

    getItemClasses(params): string {
        return `controls-Grid__header controls-Grid__header_theme-${params.theme}`;
    }

    protected _initializeColumns(): void {
        if (this._$header) {
            this._$columnItems = [];
            const factory = this._getColumnsFactory();
            this._$columnItems = this._$header.map((column, index) => {
                const isFixed = typeof column.endColumn !== 'undefined' ?
                    (column.endColumn - 1) <= this.getStickyColumnsCount() : index < this.getStickyColumnsCount();

                return factory({
                    column,
                    isFixed,
                    sorting: this._getSortingBySortingProperty(column.sortingProperty),
                    cellPadding: this._$columns[typeof column.startColumn !== 'undefined' ? column.startColumn : index].cellPadding
                });
            });
            this._addCheckBoxColumnIfNeed();

            if (this.hasItemActionsSeparatedCell()) {
                this._$columnItems.push(new ItemActionsCell({
                    owner: this,
                    column: {}
                }))
            }
        }
    }

    protected _addCheckBoxColumnIfNeed(): void {
        const factory = this._getColumnsFactory();
        if (this._$owner.hasMultiSelectColumn()) {
            const {start, end} = this._$headerModel.getBounds().row;
            this._$columnItems.unshift(factory({
                column: {
                    startRow: start,
                    endRow: end,
                    startColumn: 1,
                    endColumn: 2
                },
                isFixed: true
            }));
        }
    }

    setSorting(sorting: Array<{[p: string]: string}>): void {
        this._$sorting = sorting;
        this.getColumns().forEach((cell: HeaderCell<Model>) => {
            cell.setSorting(this._getSortingBySortingProperty(cell.getSortingProperty()));
        });
        this._nextVersion();
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
    _moduleName: 'Controls/display:GridHeaderRow',
    _instancePrefix: 'grid-header-row-',
    _cellModule: 'Controls/display:GridHeaderCell',
    _$header: null,
    _$headerModel: null
});
