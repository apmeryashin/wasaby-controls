import type { IItemsRange } from './ScrollController';
import { Logger } from 'UI/Utils';

export interface IItemsSizesControllerOptions {
    itemsContainer: HTMLElement;
    itemsQuerySelector: string;
}

export interface IItemSize {
    height: number;
    offsetTop: number;
}

export type IItemsSizes = IItemSize[];

/**
 * Класс предназначен для получения, хранения и актуализации размеров записей.
 */
export class ItemsSizesController {
    _itemsQuerySelector: string;
    _itemsContainer: HTMLElement;
    _itemsSizes: IItemsSizes = [];

    constructor(options: IItemsSizesControllerOptions) {
        this._itemsContainer = options.itemsContainer;
        this._itemsQuerySelector = options.itemsQuerySelector;
    }

    getItemsSizes(): IItemsSizes {
        return this._itemsSizes;
    }

    // region on DOM references update

    setItemsContainer(newItemsContainer: HTMLElement): void {
        this._itemsContainer = newItemsContainer;
        // this._updateItemsSizes();
    }

    setItemsQuerySelector(newItemsQuerySelector: string): void {
        this._itemsQuerySelector = newItemsQuerySelector;
        // this._updateItemsSizes();
    }

    // endregion

    // region on collection change

    addItems(position: number, count: number): IItemsSizes {
        // this._updateItemsSizes();
        return this.getItemsSizes();
    }

    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): IItemsSizes {
        // this._updateItemsSizes();
        return this.getItemsSizes();
    }

    removeItems(position: number, count: number): IItemsSizes {
        // this._updateItemsSizes();
        return this.getItemsSizes();
    }

    resetItems(count: number): IItemsSizes {
        // this._updateItemsSizes();
        return this.getItemsSizes();
    }

    // endregion

    // todo это точно нужно? можно просто containerResized звать?
    updateItemsSizes(itemsRange: IItemsRange): IItemsSizes {
        this._updateItemsSizes(itemsRange);
        return this._itemsSizes;
    }

    private _updateItemsSizes(itemsRange: IItemsRange): void {
        const itemsRangeLenght = itemsRange.endIndex - itemsRange.startIndex;

        const itemsElements = this._itemsContainer.querySelectorAll(
            this._itemsQuerySelector
        );

        if (itemsRangeLenght !== itemsElements.length) {
            Logger.error('Controls/list:ItemsSizeController.updateItemsSizes | ' +
                'The count of elements in the DOM differs from the length of the updating items range.');
        } else {
            let position = itemsRange.startIndex;

            itemsElements.forEach((element) => {
                // todo add support for Controls/grid and display: contents
                this._itemsSizes[position] = {
                    height: (element as HTMLElement).offsetHeight,
                    offsetTop: (element as HTMLElement).offsetTop
                };
                position++;
            });
        }
    }
}
