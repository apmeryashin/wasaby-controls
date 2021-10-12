export interface IItemsSizesControllerOptions {
    itemsContainer: HTMLElement;
    itemsQuerySelector: string;
}

export interface IItemSize {
    height: number;
    offsetTop: number;
}

export interface IItemsSizes {
    [key: number]: IItemSize;
}

/**
 * Класс предназначен для получения, хранения и актуализации размеров записей.
 */
export class ItemsSizesController {
    _itemsQuerySelector: string;
    _itemsContainer: HTMLElement;
    _itemsSizes: IItemsSizes;

    constructor(options: IItemsSizesControllerOptions) {
        this._itemsContainer = options.itemsContainer;
        this._itemsQuerySelector = options.itemsQuerySelector;
        this._updateItemsSizes();
    }

    getItemsSizes(): IItemsSizes {
        return this._itemsSizes;
    }

    // region on DOM references update

    setItemsContainer(newItemsContainer: HTMLElement): void {
        this._itemsContainer = newItemsContainer;
        this._updateItemsSizes();
    }

    setItemsQuerySelector(newItemsQuerySelector: string): void {
        this._itemsQuerySelector = newItemsQuerySelector;
        this._updateItemsSizes();
    }

    // endregion

    // region on collection change

    addItems(position: number, count: number): IItemsSizes {
        this._updateItemsSizes();
        return this.getItemsSizes();
    }

    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): IItemsSizes {
        this._updateItemsSizes();
        return this.getItemsSizes();
    }

    removeItems(position: number, count: number): IItemsSizes {
        this._updateItemsSizes();
        return this.getItemsSizes();
    }

    resetItems(count: number): IItemsSizes {
        this._updateItemsSizes();
        return this.getItemsSizes();
    }

    // endregion

    // todo это точно нужно? можно просто containerResized звать?
    updateItemsSizes(): void {
        this._updateItemsSizes();
    }

    private _updateItemsSizes(): void {
        this._itemsSizes = {};

        const items = this._itemsContainer.querySelectorAll(
            this._itemsQuerySelector
        );

        items.forEach((item) => {
            const key = item.getAttribute('key');
            this._itemsSizes[key] = {
                height: (item as HTMLElement).offsetHeight,
                offsetTop: (item as HTMLElement).offsetTop
            };
        });
    }
}
