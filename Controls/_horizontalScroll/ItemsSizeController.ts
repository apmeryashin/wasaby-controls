import {
    AbstractItemsSizesController,
    IAbstractItemsSizesControllerOptions,
    IItemSize
} from 'Controls/baseList';
import {getDimensions} from 'Controls/sizeUtils';

export {IAbstractItemsSizesControllerOptions as IItemsSizesControllerOptions};

export class ItemsSizeController extends AbstractItemsSizesController {

    protected _getItemSize(element: HTMLElement): IItemSize {
        return {
            size: getDimensions(element).width,
            offset: element.offsetLeft
        };
    }
}
