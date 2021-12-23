import {
    AbstractItemsSizesController,
    IAbstractItemsSizesControllerOptions
} from 'Controls/baseList';
import {getDimensions} from 'Controls/sizeUtils';

export {IAbstractItemsSizesControllerOptions as IItemsSizesControllerOptions};

export class ItemsSizeController extends AbstractItemsSizesController {
    protected _getItemSize(element: HTMLElement): number {
        return getDimensions(element).width;
    }
}
