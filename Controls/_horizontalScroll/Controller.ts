import {
    AbstractListVirtualScrollController,
    IAbstractListVirtualScrollControllerOptions,
    IScrollControllerOptions
} from 'Controls/baseList';
import {ObserversController, IObserversControllerOptions} from './ObserversController';
import {ItemsSizeController, IItemsSizesControllerOptions} from './ItemsSizeController';
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
    private _columns: TColumns;
    private _header?: THeader;

    constructor(options: IControllerOptions) {
        this._columns = options.columns;
        this._header = options.header;
        super({
            ...options,
            itemsQuerySelector: '.js-controls-Grid__columnScroll__relativeCell',
            triggersQuerySelector: HORIZONTAL_LOADING_TRIGGER_SELECTOR
        });
    }

    protected _getObserversControllerConstructor(): IObserversControllerConstructor {
        return ObserversController;
    }

    protected _getItemsSizeControllerConstructor(): IItemsSizesControllerConstructor {
        return ItemsSizeController;
    }

    protected _getScrollControllerOptions(options: IControllerOptions): IScrollControllerOptions {
        return {
            ...super._getScrollControllerOptions(options),
            totalCount: options.columns.length
        };
    }

    protected _applyIndexes(startIndex: number, endIndex: number): void {
        const a = [0, 1];
        const b = [startIndex, endIndex - 1];

        this._collection.setColumns([
            ...this._columns.slice(a[0], a[1]),
            ...this._columns.slice(b[0], b[1])
        ]);

        if (this._header) {
            this._collection.setHeader(this._header.slice(startIndex, endIndex));
        }
    }

    keyDownLeft(): Promise<void> {
        return this._scrollToPage('backward');
    }

    keyDownRight(): Promise<void> {
        return this._scrollToPage('forward');
    }

    protected _onCollectionChange(): void {
        /*Еще не реализована реакция на обновление*/
    }
}

export default Controller;
