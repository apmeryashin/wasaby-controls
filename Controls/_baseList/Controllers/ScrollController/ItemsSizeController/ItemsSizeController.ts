import {AbstractItemsSizesController, IItemSize} from './AbstractItemsSizeController';
import {getDimensions, getOffsetTop} from 'Controls/sizeUtils';

export class ItemsSizeController extends AbstractItemsSizesController {
    protected _getBeforeItemsContentSize(itemsContainer: HTMLElement, scrollContent: Element): number {
        return scrollContent ?
            scrollContent.getBoundingClientRect().top - itemsContainer.getBoundingClientRect().top :
            getOffsetTop(itemsContainer);
    }

    protected _getItemSize(element: HTMLElement): IItemSize {
        return {
            size: getDimensions(element).height,
            offset: getOffsetTop(element)
        };
    }
}
