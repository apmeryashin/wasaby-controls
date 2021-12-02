import {
    AbstractListVirtualScrollController,
    IAbstractListVirtualScrollControllerOptions,
    IScrollControllerOptions
} from 'Controls/baseList';
import {ObserversController, IObserversControllerOptions} from './ObserversController';
import {ItemsSizeController, IItemsSizesControllerOptions} from './ItemsSizeController';
import type {TColumns, GridCollection} from 'Controls/grid';
import type {Collection} from 'Controls/display';

export interface IControllerOptions extends IAbstractListVirtualScrollControllerOptions {
    collection: Collection & GridCollection;
    columns: TColumns;
    columnScrollStartPosition?: 'end';
}

export type IItemsSizesControllerConstructor = new (options: IItemsSizesControllerOptions) => ItemsSizeController;
export type IObserversControllerConstructor = new (options: IObserversControllerOptions) => ObserversController;

export class Controller extends AbstractListVirtualScrollController<IControllerOptions> {
    protected _collection: Collection & GridCollection;
    private _columns: TColumns;

    constructor(options: IControllerOptions) {
        this._columns = options.columns;
        super(options);
    }

    protected protected _getObserversControllerConstructor(): IObserversControllerConstructor {
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
        this._collection.setColumns(this._columns.slice(startIndex, endIndex));
    }

    private _onCollectionChange(): void {
        /*Еще не реализована реакция на обновление*/
    }
}

export default Controller;
