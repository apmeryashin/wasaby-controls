import {
    AbstractListVirtualScrollController,
    IAbstractListVirtualScrollControllerOptions
} from './AbstractListVirtualScrollController';

import {
    ObserversController,
    IObserversControllerOptions
} from './ScrollController/ObserverController/ObserversController';
import {
    ItemsSizeController,
    IItemsSizesControllerOptions
} from './ScrollController/ItemsSizeController/ItemsSizeController';
import type { IDirection } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import ItemsSizeControllerMultiColumns from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/ItemsSizeControllerMultiColumns';

export type IItemsSizesControllerConstructor = new (options: IItemsSizesControllerOptions) => ItemsSizeController;
export type IObserversControllerConstructor = new (options: IObserversControllerOptions) => ObserversController;

export interface IListVirtualScrollControllerOptions extends IAbstractListVirtualScrollControllerOptions {
    /**
     * Флаг который означает, что записи в списке расположены в несколько столбцов.
     */
    multiColumns: boolean;
}

export class ListVirtualScrollController extends AbstractListVirtualScrollController {
    private readonly _multiColumns: boolean;

    constructor(options: IListVirtualScrollControllerOptions) {
        this._multiColumns = options.multiColumns;
        super(options);
    }

    protected _getObserversControllerConstructor(): IObserversControllerConstructor {
        return ObserversController;
    }
    protected _getItemsSizeControllerConstructor(): IItemsSizesControllerConstructor {
        return this._multiColumns ? ItemsSizeControllerMultiColumns : ItemsSizeController;
    }

    protected _applyIndexes(startIndex: number, endIndex: number, shiftDirection: IDirection): void {
        this._collection.setIndexes(startIndex, endIndex, shiftDirection);
    }

    protected _getCollectionItemsCount(): number {
        return this._collection.getCount();
    }
}
