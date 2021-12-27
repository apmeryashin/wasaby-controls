import type { IItemsRange } from '../ScrollController';
import { Logger } from 'UI/Utils';
import { CrudEntityKey } from 'Types/source';

export interface IAbstractItemsSizesControllerOptions {
    itemsContainer?: HTMLElement;
    itemsQuerySelector: string;
    totalCount: number;
}

export interface IItemSize {
    size: number;
    offset: number;
}

export type IItemsSizes = IItemSize[];

/**
 * Класс предназначен для получения, хранения и актуализации размеров записей.
 */
export abstract class AbstractItemsSizesController {
    private _itemsQuerySelector: string;
    private _itemsContainer: HTMLElement;
    private _itemsSizes: IItemsSizes = [];

    constructor(options: IAbstractItemsSizesControllerOptions) {
        this._itemsContainer = options.itemsContainer;
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
     * Возвращает размер контента, расположенного в этом же ScrollContainer-е до списка.
     */
    getContentSizeBeforeItems(): number {
        if (!this._itemsContainer) {
            return null;
        }

        const scrollContent = this._itemsContainer.closest('.controls-Scroll-ContainerBase__content');
        return this._getContentSizeBeforeItems(this._itemsContainer, scrollContent);
    }

    // region on DOM references update

    setItemsContainer(newItemsContainer: HTMLElement): void {
        this._itemsContainer = newItemsContainer;
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

    private _updateItemsSizes(itemsRange: IItemsRange): void {
        const itemsRangeLength = itemsRange.endIndex - itemsRange.startIndex;

        if (this._itemsContainer) {
            const itemsElements = this._itemsContainer.querySelectorAll(this._itemsQuerySelector);

            if (itemsRangeLength !== itemsElements.length) {
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
                // элемент это не startIndex - 1, а элемент у которого нет следующего отрисованного элемента.
                const renderedItemSizeBeforeRange = this._itemsSizes.find((it, index) => {
                    const nextItemSize = this._itemsSizes[index + 1];
                    const isLastItemBeforeRange = index === itemsRange.startIndex - 1;
                    return index < itemsRange.startIndex && (
                        !nextItemSize || !nextItemSize.size || isLastItemBeforeRange
                    );
                });
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
                        offset
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

    protected abstract _getContentSizeBeforeItems(itemsContainer: HTMLElement, scrollContent: Element): number;

    protected abstract _getItemSize(element: HTMLElement): number;

    private static _getEmptyItemSize(): IItemSize {
        return {
            offset: 0,
            size: 0
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
