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

    scrollToPage(pageDirection: IPageDirection): Promise<CrudEntityKey> {
        return this._scrollToPage(pageDirection);
    }

    /**
     * Скроллит к переданной странице.
     * Скроллит так, чтобы было видно последний элемент с предыдущей страницы, чтобы не потерять "контекст".
     * Смещает диапазон, возвращает промис с индексами крайних видимых полностью элементов.
     * @param pageDirection Условная страница, к которой нужно скроллить. (Следующая, предыдущая, начальная, конечная)
     * @private
     */
    private _scrollToPage(pageDirection: IPageDirection): Promise<CrudEntityKey> {
        let itemIndex;
        if (pageDirection === 'forward' || pageDirection === 'backward') {
            const edgeItem = this._scrollController.getEdgeVisibleItem({direction: pageDirection});
            itemIndex = edgeItem.index;
        } else {
            itemIndex = pageDirection === 'start' ? 0 : this._collection.getCount() - 1;
        }

        const item = this._collection.getItemBySourceIndex(itemIndex);
        const itemKey = item.getContents().getKey();
        return this.scrollToItem(itemKey).then(() => itemKey);
    }
}
