import {AbstractItemsSizesController, IAbstractItemsSizesControllerOptions, IItemSize} from './AbstractItemsSizeController';
import {getDimensions, getOffsetTop} from 'Controls/sizeUtils';

export {IAbstractItemsSizesControllerOptions as IItemsSizesControllerOptions};

export class ItemsSizeController extends AbstractItemsSizesController {

    protected _getItemSize(element: HTMLElement): IItemSize {
        return {
            size: getDimensions(element).height,
            offset: getOffsetTop(element)
        };
    }
}
