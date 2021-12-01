import {
    AbstractListVirtualScrollController,
    IAbstractListVirtualScrollControllerOptions
} from 'Controls/baseList';

import {ObserversController, IObserversControllerOptions} from './ObserversController';
import {ItemsSizeController, IItemsSizesControllerOptions} from './ItemsSizeController';
import type {GridCollection, TColumns} from 'Controls/grid';

export interface IControllerOptions extends IAbstractListVirtualScrollControllerOptions {
    columnScrollStartPosition?: 'end';
    columns: TColumns;
}

export type IItemsSizesControllerConstructor = new (options: IItemsSizesControllerOptions) => ItemsSizeController;
export type IObserversControllerConstructor = new (options: IObserversControllerOptions) => ObserversController;

export class Controller extends AbstractListVirtualScrollController<IControllerOptions> {
    protected _collection: GridCollection;
    protected _itemsSizeControllerConstructor: IItemsSizesControllerConstructor = ItemsSizeController;
    protected _observersControllerConstructor: IObserversControllerConstructor = ObserversController;

    private _columns: TColumns;

    constructor(options: IControllerOptions) {
        super(options);
        this._columns = options.columns;
    }

    protected _applyIndexes(startIndex: number, endIndex: number): void {
        this._collection.setColumns(this._columns.slice(startIndex, endIndex));
    }

    private _onCollectionChange(): void {
        /*Еще не реализована реакция на обновление*/
    }
}

export default Controller;
