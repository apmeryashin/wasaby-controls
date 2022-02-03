import type { IItemsRange } from '../ScrollController';
import { Logger } from 'UI/Utils';
import { CrudEntityKey } from 'Types/source';

export interface IAbstractItemsSizesControllerOptions {
    itemsContainer?: HTMLElement;
    listContainer?: HTMLElement;
    itemsQuerySelector: string;
    totalCount: number;
}

export interface IItemSize {
    key?: string;
    size: number;
    offset: number;
}

export type IItemsSizes = IItemSize[];

/**
 * Класс предназначен для получения, хранения и актуализации размеров записей.
 */
export abstract class AbstractItemsSizesController {
    protected _itemsQuerySelector: string;
    protected _itemsContainer: HTMLElement;
    protected _itemsSizes: IItemsSizes = [];
    protected _listContainer: HTMLElement;

    /**
     * Кол-во элементов, которые были отрисованы за пределами текущего диапазона(например, застиканные записи)
     * @private
     */
    private _countItemsRenderedOutsideRange: number = 0;

    constructor(options: IAbstractItemsSizesControllerOptions) {
        this._itemsContainer = options.itemsContainer;
        this._listContainer = options.listContainer;
        this._itemsQuerySelector = options.itemsQuerySelector;
        this.resetItems(options.totalCount);
    }

    getItemsSizes(): IItemsSizes {
        return this._itemsSizes;
    }

    updateItemsSizes(itemsRange: IItemsRange): IItemsSizes {
        this._updateItemsSizes(itemsRange);
        return this._itemsSizes;
    }

    getElement(key: CrudEntityKey): HTMLElement {
        const selector = `${this._itemsQuerySelector}[item-key="${key}"]`;
        return this._itemsContainer?.querySelector(selector) as HTMLElement;
    }

    /**
     * Возвращает размер контента, расположенного в этом же ScrollContainer-е до элементов списка.
     */
    getContentSizeBeforeItems(): number {
        if (!this._itemsContainer) {
            return null;
        }

        const scrollContent = this._itemsContainer.closest('.controls-Scroll-ContainerBase__content');
        return this._getContentSizeBeforeContainer(this._itemsContainer, scrollContent);
    }

    /**
     * Возвращает размер контента, расположенного в этом же ScrollContainer-е до списка.
     */
    getContentSizeBeforeList(): number {
        if (!this._listContainer) {
            return null;
        }

        const scrollContent = this._listContainer.closest('.controls-Scroll-ContainerBase__content');
        return this._getContentSizeBeforeContainer(this._listContainer, scrollContent);
    }

    setCountItemsRenderedOutsideRange(count: number): void {
        this._countItemsRenderedOutsideRange = count;
    }

    // region on DOM references update

    setItemsContainer(newItemsContainer: HTMLElement): void {
        this._itemsContainer = newItemsContainer;
    }

    setListContainer(newListContainer: HTMLElement): void {
        this._listContainer = newListContainer;
    }

    setItemsQuerySelector(newItemsQuerySelector: string): void {
        this._itemsQuerySelector = newItemsQuerySelector;
    }

    // endregion

    // region on collection change

    addItems(position: number, count: number): IItemsSizes {
        const addedItemsSize = AbstractItemsSizesController._getEmptyItemsSizes(count);
        this._itemsSizes.splice(position, 0, ...addedItemsSize);

        return this.getItemsSizes();
    }

    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): IItemsSizes {
        this.addItems(addPosition, addCount);
        this.removeItems(removePosition, removeCount);
        return this.getItemsSizes();
    }

    removeItems(position: number, count: number): IItemsSizes {
        this._itemsSizes.splice(position, count);
        return this.getItemsSizes();
    }

    resetItems(count: number): IItemsSizes {
        this._itemsSizes = AbstractItemsSizesController._getEmptyItemsSizes(count);
        return this.getItemsSizes();
    }

    // endregion

    protected _updateItemsSizes(itemsRange: IItemsRange): void {
        if (this._itemsContainer) {
            const itemsElements = this._itemsContainer.querySelectorAll(this._itemsQuerySelector);
            if (!this._domElementsMatchToRange(itemsRange, itemsElements)) {
                Logger.error('Controls/list:ItemsSizeController.updateItemsSizes | ' +
                    'The count of elements in the DOM differs from the length of the updating items range. ' +
                    `Check that each item has selector: ${this._itemsQuerySelector}.`
                );
            } else {
                // item.offset который мы посчитали является расстоянием от края itemsContainer до элемента
                // НО scrollPosition - это расстояние от scrollContainer до границы вьюпорта.
                // Поэтому она учитывает еще и все что находится до itemsContainer.
                // То есть нам нужно поставить item.offset и scrollPosition в одинаковые условия.
                // Для этого корректируем item.offset на contentSizeBeforeItems.
                // Корректировать scrollPosition на contentSizeBeforeItems нельзя, т.к. в кальклуторе есть другие
                // параметры на которые тоже может повлиять contentSizeBeforeItems.
                // Например, triggerOffset - он может содержать высоту ромашки,
                // а ромашка является частью contentSizeBeforeItems.
                // По идее после того как triggerOffset будет позиционироваться от ромашки
                // и высота ромашки на него не будет влиять,
                // то можно будет корректировать только scrollPosition на уровне ScrollController.
                // Это вроде должно выглядеть понятнее.
                const contentSizeBeforeItems = this.getContentSizeBeforeItems();
                const firstItemOffset = this._itemsSizes[0]?.offset || 0;
                let position = itemsRange.startIndex;
                // Возможна ситуация, что диапазон сместился с [0, 5] на [10, 15].В этом случае предыдущий отрисованный
                // элемент это не startIndex - 1, а это первый от startIndex к началу отрендеренный элемент;
                const beforeRangeItems = this._itemsSizes.slice(0, itemsRange.startIndex);
                const renderedItemSizeBeforeRange = beforeRangeItems.reverse().find((it) => !!it.size);
                Array.from(itemsElements).forEach((element: HTMLElement) => {
                    const prevRenderedItemSize = position === itemsRange.startIndex
                        ? renderedItemSizeBeforeRange
                        : this._itemsSizes[position - 1];
                    // оффсет не учитывает margin-ы, нужно будет решить эту проблему. offsetTop ее не решает.
                    // Если брать offsetTop у записи, то возникает еще проблема с застикаными записями.
                    let offset = prevRenderedItemSize ? prevRenderedItemSize.offset + prevRenderedItemSize.size : 0;
                    if (position === itemsRange.startIndex) {
                        offset += contentSizeBeforeItems;
                        // нужно вычитать оффсет первой записи, чтобы он не учитывался дважды, когда мы будем прибавлять
                        // contentSizeBeforeItems к элементам нового диапазона.
                        if (position !== 0) {
                            offset -= firstItemOffset;
                        }
                    }
                    this._itemsSizes[position] = {
                        size: this._getItemSize(element),
                        offset,
                        key: element.getAttribute('item-key')
                    };
                    position++;
                });
            }
        } else {
            for (let position = itemsRange.startIndex; position <= itemsRange.endIndex; position++) {
                this._itemsSizes[position] = AbstractItemsSizesController._getEmptyItemSize();
            }
        }
    }

    /**
     * Проверяет, что записи отрисовались правильно
     * @param itemsRange
     * @param itemsElements
     * @private
     */
    protected _domElementsMatchToRange(itemsRange: IItemsRange, itemsElements: NodeListOf<Element>): boolean {
        const itemsRangeLength = itemsRange.endIndex - itemsRange.startIndex;
        const renderedItemsCount = itemsElements.length;
        const renderedItemsCountFromRange = renderedItemsCount - this._countItemsRenderedOutsideRange;
        return renderedItemsCountFromRange === itemsRangeLength;
    }

    /**
     * Возвращает размер контента, который находится в scrollContent, но до container.
     * @param container
     * @param scrollContent
     * @protected
     */
    protected abstract _getContentSizeBeforeContainer(container: HTMLElement, scrollContent: Element): number;

    protected abstract _getItemSize(element: HTMLElement): number;

    protected static _getEmptyItemSize(): IItemSize {
        return {
            size: 0,
            offset: 0
        };
    }

    private static _getEmptyItemsSizes(count: number): IItemsSizes {
        const itemsSizes = Array(count);
        for (let position = 0; position < count; position++) {
            itemsSizes[position] = AbstractItemsSizesController._getEmptyItemSize();
        }
        return itemsSizes;
    }

}
