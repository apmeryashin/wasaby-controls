import MaskViewModel from 'Controls/_date/BaseInput/MaskViewModel';
import {Mask} from 'Controls/input';

class Component extends Mask {
    protected _getViewModelConstructor(): MaskViewModel {
        return MaskViewModel;
    }

    protected _getViewModelOptions(options): object {
        const defaultConfig = super._getViewModelOptions(options);
        return {
            ...defaultConfig,
            calendarButtonVisible: options.calendarButtonVisible
        };
    }
}

export default Component;
