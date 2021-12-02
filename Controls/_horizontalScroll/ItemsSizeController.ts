import {
    AbstractItemsSizesController,
    IItemSize
} from 'Controls/baseList';

import {getDimensions} from 'Controls/sizeUtils';

export class ItemsSizeController extends AbstractItemsSizesController {
    protected _getBeforeContentSize(itemsContainer: HTMLElement, scrollContent: Element): number {
        return scrollContent
            ? getDimensions(itemsContainer, true).left - scrollContent.getBoundingClientRect().left
            : getDimensions(itemsContainer, true).left;
    }

    protected _getItemSize(element: HTMLElement): IItemSize {
        return {
            size: getDimensions(element).width,
            offset: element.offsetLeft
        };
    }
}