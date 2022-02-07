import {
    AbstractListVirtualScrollController,
    IAbstractListVirtualScrollControllerOptions,
    IScrollControllerOptions,
    TVirtualScrollMode
} from 'Controls/baseList';
import {ObserversController, IObserversControllerOptions} from './ObserversController';
import {ItemsSizeController, IItemsSizesControllerOptions} from './ItemsSizeController';
import ScrollBar from './scrollBar/ScrollBar';
import {ColumnsEnumerator} from './displayUtils/ColumnsEnumerator';
import type {TColumns, GridCollection, THeader} from 'Controls/grid';
import type {Collection} from 'Controls/display';

export interface IControllerOptions extends IAbstractListVirtualScrollControllerOptions {
    collection: Collection & GridCollection;
    columns: TColumns;
    header?: THeader;
    stickyColumnsCount?: number;
    columnScrollStartPosition?: 'end';
}

export type IItemsSizesControllerConstructor = new (options: IItemsSizesControllerOptions) => ItemsSizeController;
export type IObserversControllerConstructor = new (options: IObserversControllerOptions) => ObserversController;

export const HORIZONTAL_LOADING_TRIGGER_SELECTOR = '.controls-BaseControl__loadingTrigger_horizontal';

export class Controller extends AbstractListVirtualScrollController<IControllerOptions> {
    protected _collection: Collection & GridCollection;
    private _scrollBar: ScrollBar;
    private _columns: TColumns;
    private _header?: THeader;

    constructor(options: IControllerOptions) {
        this._columns = options.columns;
        this._header = options.header;
        super({
            ...options,
            itemsQuerySelector: '.js-controls-Grid__virtualColumnScroll__fake-scrollable-cell-to-recalc-width',
            triggersQuerySelector: HORIZONTAL_LOADING_TRIGGER_SELECTOR
        });
    }

    protected _getObserversControllerConstructor(): IObserversControllerConstructor {
        return ObserversController;
    }

    protected _getItemsSizeControllerConstructor(): IItemsSizesControllerConstructor {
        return ItemsSizeController;
    }

    protected _setCollectionIterator(mode: TVirtualScrollMode): void {
        this._collection.setColumnsEnumerator(new ColumnsEnumerator(this._collection));
    }

    protected _getScrollControllerOptions(options: IControllerOptions): IScrollControllerOptions {
        return {
            ...super._getScrollControllerOptions(options),
            totalCount: options.columns.length
        };
    }

    protected _applyIndexes(startIndex: number, endIndex: number): void {
        this._collection.getColumnsEnumerator().setIndexes(startIndex, endIndex);
    }

    protected _getCollectionItemsCount(): number {
        return this._collection.getColumnsCount();
    }

    scrollPositionChange(position: number): void {
        super.scrollPositionChange(position);
        this._scrollBar?.setScrollPosition(position);
    }

    setScrollBar(scrollBar: ScrollBar): void {
        this._scrollBar = scrollBar;
        this._scrollBar.setScrollPosition(this._scrollPosition);
    }

    keyDownLeft(): Promise<void> {
        return this.scrollToPage('backward');
    }

    keyDownRight(): Promise<void> {
        return this.scrollToPage('forward');
    }

    protected _onCollectionChange(): void {
        /*Еще не реализована реакция на обновление*/
    }
}

export default Controller;
