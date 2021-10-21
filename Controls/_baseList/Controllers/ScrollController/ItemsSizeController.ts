import type { IItemsRange } from './ScrollController';
import { Logger } from 'UI/Utils';
import { CrudEntityKey } from 'Types/source';

export interface IItemsSizesControllerOptions {
    itemsContainer: HTMLElement;
    itemsQuerySelector: string;
}

export interface IItemSize {
    key: CrudEntityKey;
    height: number;
    offsetTop: number;
}

export type IItemsSizes = IItemSize[];

/**
 * Класс предназначен для получения, хранения и актуализации размеров записей.
 */
export class ItemsSizesController {
    private _itemsQuerySelector: string;
    private _itemsContainer: HTMLElement;
    private _itemsSizes: IItemsSizes = [];

    constructor(options: IItemsSizesControllerOptions) {
        this._itemsContainer = options.itemsContainer;
        this._itemsQuerySelector = options.itemsQuerySelector;
    }

    getItemsSizes(): IItemsSizes {
        return this._itemsSizes;
    }

    updateItemsSizes(itemsRange: IItemsRange): IItemsSizes {
        this._updateItemsSizes(itemsRange);
        return this._itemsSizes;
    }

    // region on DOM references update

    setItemsContainer(newItemsContainer: HTMLElement): IItemsSizes {
        this._itemsContainer = newItemsContainer;
        // this._updateItemsSizes();
        return this.getItemsSizes();
    }

    setItemsQuerySelector(newItemsQuerySelector: string): IItemsSizes {
        this._itemsQuerySelector = newItemsQuerySelector;
        // this._updateItemsSizes();
        return this.getItemsSizes();
    }

    // endregion

    // region on collection change

    addItems(position: number, count: number): IItemsSizes {
        const addedItemsSize = Array(count).fill(ItemsSizesController._getEmptyItemSize());
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
        this._itemsSizes = Array(count).fill(ItemsSizesController._getEmptyItemSize());
        return this.getItemsSizes();
    }

    // endregion

    private _updateItemsSizes(itemsRange: IItemsRange): void {
        const itemsRangeLength = itemsRange.endIndex - itemsRange.startIndex;

        const itemsElements = this._itemsContainer.querySelectorAll(
            this._itemsQuerySelector
        );

        if (itemsRangeLength !== itemsElements.length) {
            Logger.error('Controls/list:ItemsSizeController.updateItemsSizes | ' +
                'The count of elements in the DOM differs from the length of the updating items range.');
        } else {
            let position = itemsRange.startIndex;

            itemsElements.forEach((element) => {
                // todo add support for Controls/grid and display: contents
                this._itemsSizes[position] = {
                    key: (element as HTMLElement).getAttribute('item-key'),
                    height: (element as HTMLElement).offsetHeight,
                    offsetTop: (element as HTMLElement).offsetTop
                };
                position++;
            });
        }
    }

    private static _getEmptyItemSize(): IItemSize {
        return {
            key: undefined,
            offsetTop: 0,
            height: 0
        }
    }
}
