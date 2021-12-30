import {
    AbstractItemsSizesController,
    IAbstractItemsSizesControllerOptions
} from 'Controls/baseList';
import {getDimensions} from 'Controls/sizeUtils';

export {IAbstractItemsSizesControllerOptions as IItemsSizesControllerOptions};

export class ItemsSizeController extends AbstractItemsSizesController {
    protected _getContentSizeBeforeItems(itemsContainer: HTMLElement, scrollContent: Element): number {
        return scrollContent
            ? getDimensions(itemsContainer, true).left - scrollContent.getBoundingClientRect().left
            : getDimensions(itemsContainer, true).left;
    }

    protected _getItemSize(element: HTMLElement): number {
        return getDimensions(element).width;
    }
}
