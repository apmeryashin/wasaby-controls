import {ItemsSizeController} from './ItemsSizeController';
import {IItemsRange} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import {Logger} from 'UI/Utils';
import {AbstractItemsSizesController} from './AbstractItemsSizeController';

export default class ItemsSizeControllerWithoutVirtualization extends ItemsSizeController {
    protected _updateItemsSizes(itemsRange: IItemsRange): void {
        const itemsContainer = this._itemsContainer;
        if (itemsContainer) {
            const itemsElements = itemsContainer.querySelectorAll(this._itemsQuerySelector);
            if (!this._domElementsMatchToRange(itemsRange, itemsElements)) {
                Logger.error('Controls/list:ItemsSizeController.updateItemsSizes | ' +
                    'The count of elements in the DOM differs from the length of the updating items range. ' +
                    `Check that each item has selector: ${this._itemsQuerySelector}.`
                );
            } else {
                let position = itemsRange.startIndex;
                Array.from(itemsElements).forEach((element: HTMLElement) => {
                    const offset = element.getBoundingClientRect().top - itemsContainer.getBoundingClientRect().top;

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
}
