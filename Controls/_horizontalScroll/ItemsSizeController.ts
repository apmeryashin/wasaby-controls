import {
    AbstractItemsSizesController,
    IItemSize
} from 'Controls/baseList';

import {getDimensions} from 'Controls/sizeUtils';

export class ItemsSizeController extends AbstractItemsSizesController {
    protected _getBeforeItemsContentSize(itemsContainer: HTMLElement, scrollContent: Element): number {
        return scrollContent ?
            scrollContent.getBoundingClientRect().left - itemsContainer.getBoundingClientRect().left :
            itemsContainer.getBoundingClientRect().left;
    }

    protected _getItemSize(element: HTMLElement): IItemSize {
        return {
            size: getDimensions(element).width,
            offset: element.offsetLeft
        };
    }
}
