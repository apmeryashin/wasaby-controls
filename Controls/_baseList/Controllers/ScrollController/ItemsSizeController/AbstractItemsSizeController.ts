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
export class AbstractItemsSizesController {
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
    getBeforeContentSize(): number {
        if (!this._itemsContainer) {
            return null;
        }

        const scrollContent = this._itemsContainer.closest('.controls-Scroll-ContainerBase__content');
        return this._getBeforeContentSize(this._itemsContainer, scrollContent);
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
                    'The count of elements in the DOM differs from the length of the updating items range.');
            } else {
                let position = itemsRange.startIndex;

                // Нужно учитывать оффсет элементов скрытых виртуальным диапазоном.
                // Например, был диапазон 0 - 10, стал 5 - 15
                // У 5-ой записи offset === 0, но перед ней есть еще 5-ть скрытых записей, у которых мы знаем offset.
                // offset после послденей скрытой записи равен ее offset + size.
                let hiddenItemsOffset = 0;
                if (position > 0) {
                    const lastHiddenItem = this._itemsSizes[position - 1];
                    hiddenItemsOffset = lastHiddenItem.offset + lastHiddenItem.size;
                }
                itemsElements.forEach((element: HTMLElement) => {
                    this._itemsSizes[position] = this._getItemSize(element);
                    this._itemsSizes[position].offset += hiddenItemsOffset;
                    position++;
                });

                // Т.к. мы обновили размеры в начале массива, то у последующих элементов нужно обновить offset
                if (itemsRange.endIndex < this._itemsSizes.length) {
                    const lastUpdatedItem = this._itemsSizes[itemsRange.endIndex - 1];
                    const firstNotUpdatedItem = this._itemsSizes[itemsRange.endIndex];
                    const updatedItemsOffset = lastUpdatedItem.offset + lastUpdatedItem.size
                        - firstNotUpdatedItem.offset;
                    for (let i = itemsRange.endIndex; i < this._itemsSizes.length; i++) {
                        this._itemsSizes[i].offset += updatedItemsOffset;
                    }
                }
            }
        } else {
            for (let position = itemsRange.startIndex; position <= itemsRange.endIndex; position++) {
                this._itemsSizes[position] = AbstractItemsSizesController._getEmptyItemSize();
            }
        }
    }

    protected abstract _getBeforeContentSize(itemsContainer: HTMLElement, scrollContent: Element): number;

    protected abstract _getItemSize(element: HTMLElement): IItemSize;

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
