import {AbstractItemsSizesController, IAbstractItemsSizesControllerOptions} from './AbstractItemsSizeController';
import {getDimensions, getOffsetTop} from 'Controls/sizeUtils';

export {IAbstractItemsSizesControllerOptions as IItemsSizesControllerOptions};

export class ItemsSizeController extends AbstractItemsSizesController {
    protected _getContentSizeBeforeContainer(itemsContainer: HTMLElement, scrollContent: Element): number {
        return scrollContent
            ? getDimensions(itemsContainer, true).top - scrollContent.getBoundingClientRect().top
            : getOffsetTop(itemsContainer);
    }

    protected _getItemSize(element: HTMLElement): number {
        return getDimensions(element).height;
    }
}
