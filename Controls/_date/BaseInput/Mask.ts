import MaskViewModel from 'Controls/_date/BaseInput/MaskViewModel';
import {Mask} from 'Controls/input';

class Component extends Mask {
    protected _getViewModelConstructor(): MaskViewModel {
        return MaskViewModel;
    }
}

export default Component;
