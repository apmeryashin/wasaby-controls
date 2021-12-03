import {
    AbstractListVirtualScrollController
} from './AbstractListVirtualScrollController';

import {
    ObserversController,
    IObserversControllerOptions
} from './ScrollController/ObserverController/ObserversController';
import {
    ItemsSizeController,
    IItemsSizesControllerOptions
} from './ScrollController/ItemsSizeController/ItemsSizeController';
import {SyntheticEvent} from 'UI/Vdom';
import {CrudEntityKey} from 'Types/source';
import {IPageDirection} from './ScrollController/ScrollController';

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

    keyDownHome(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('start');
    }

    keyDownEnd(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('end');
    }

    keyDownPageDown(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('forward');
    }

    keyDownPageUp(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('backward');
    }
}
