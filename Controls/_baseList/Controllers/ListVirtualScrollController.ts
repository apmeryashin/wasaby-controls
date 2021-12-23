import { AbstractListVirtualScrollController } from './AbstractListVirtualScrollController';

import {
    ObserversController,
    IObserversControllerOptions
} from './ScrollController/ObserverController/ObserversController';
import {
    ItemsSizeController,
    IItemsSizesControllerOptions
} from './ScrollController/ItemsSizeController/ItemsSizeController';
import type { IDirection } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export type IItemsSizesControllerConstructor = new (options: IItemsSizesControllerOptions) => ItemsSizeController;
export type IObserversControllerConstructor = new (options: IObserversControllerOptions) => ObserversController;

export class ListVirtualScrollController extends AbstractListVirtualScrollController {
    setItemsContainer(itemsContainer: HTMLElement) {
        super.setItemsContainer(itemsContainer);
        // В списке триггеры лежат внутри itemsContainer, поэтому когда он изменился, нужно обновить триггеры.
        this._scrollController.updateTriggers();
    }

    protected _getObserversControllerConstructor(): IObserversControllerConstructor {
        return ObserversController;
    }
    protected _getItemsSizeControllerConstructor(): IItemsSizesControllerConstructor {
        return ItemsSizeController;
    }

    protected _applyIndexes(startIndex: number, endIndex: number, shiftDirection: IDirection): void {
        this._collection.setIndexes(startIndex, endIndex, shiftDirection);
    }
}
