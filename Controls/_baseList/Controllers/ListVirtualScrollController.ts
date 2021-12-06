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
import {CrudEntityKey} from 'Types/source';
import {IDirection} from './ScrollController/ScrollController';

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

    /**
     * Скроллит к переданной странице.
     * Скроллит так, чтобы было видно последний элемент с предыдущей страницы, чтобы не потерять "контекст".
     * Смещает диапазон, возвращает промис с ключом записи верхней полностью видимой записи.
     * @param direction Условная страница, к которой нужно скроллить. (Следующая, предыдущая)
     * @private
     */
    scrollToPage(direction: IDirection): Promise<CrudEntityKey> {
        const edgeItem = this._scrollController.getEdgeVisibleItem({direction});
        // TODO SCROLL юниты
        if (!edgeItem) {
            return Promise.resolve(null);
        }

        const item = this._collection.at(edgeItem.index);
        const itemKey = item.getContents().getKey();
        const scrollPosition = direction === 'forward' ? 'top' : 'bottom';
        return this.scrollToItem(itemKey, scrollPosition, true).then(() => this._getFirstVisibleItemKey());
    }

    /**
     * Скроллит к переданному краю списка.
     * Смещает диапазон, возвращает промис с индексами крайних видимых полностью элементов.
     * @param edge Край списка
     * @private
     */
    scrollToEdge(edge: IDirection): Promise<CrudEntityKey> {
        const itemIndex = edge === 'backward' ? 0 : this._collection.getCount() - 1;
        const item = this._collection.at(itemIndex);
        const itemKey = item.getContents().getKey();
        const scrollPosition = edge === 'forward' ? 'top' : 'bottom';
        return this.scrollToItem(itemKey, scrollPosition, true).then(() => {
            const promise = new Promise<void>((resolver) => this._doScrollCompletedCallback = resolver);

            // Делаем подскролл, чтобы список отскролился к самому краю
            // Делаем через scheduleScroll, чтобы если что успел отрисоваться, например отступ под пэйджинг
            this._scheduleScroll({
                type: 'doScroll',
                params: {
                    scrollParam: edge === 'backward' ? 'top' : 'bottom'
                }
            });

            return promise.then(() => this._getFirstVisibleItemKey());
        });
    }

    private _getFirstVisibleItemKey(): CrudEntityKey {
        const firstVisibleItemIndex = this._scrollController.getFirstVisibleItemIndex();
        const item = this._collection.at(firstVisibleItemIndex);
        return item.getContents().getKey();
    }
}
