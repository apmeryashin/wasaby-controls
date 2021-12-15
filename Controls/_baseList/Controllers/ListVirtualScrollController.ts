import { AbstractListVirtualScrollController } from './AbstractListVirtualScrollController';

import {
    ObserversController,
    IObserversControllerOptions
} from './ScrollController/ObserverController/ObserversController';
import {
    ItemsSizeController,
    IItemsSizesControllerOptions
} from './ScrollController/ItemsSizeController/ItemsSizeController';

export type IItemsSizesControllerConstructor = new (options: IItemsSizesControllerOptions) => ItemsSizeController;
export type IObserversControllerConstructor = new (options: IObserversControllerOptions) => ObserversController;

export class ListVirtualScrollController extends AbstractListVirtualScrollController {
    protected _getObserversControllerConstructor(): IObserversControllerConstructor {
        return ObserversController;
    }
    protected _getItemsSizeControllerConstructor(): IItemsSizesControllerConstructor {
        return ItemsSizeController;
    }

    protected _applyIndexes(startIndex: number, endIndex: number): void {
        this._collection.setIndexes(startIndex, endIndex);
    }
}
