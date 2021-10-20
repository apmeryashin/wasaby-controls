import {BaseSelector, IBaseSelectorOptions} from "Controls/date";
import DateRangeModel from './DateRangeModel';
import {EventUtils} from 'UI/Events';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';

export interface IDateRangeBaseSelectorOptions extends IBaseSelectorOptions {
}

export default class DateRangeBaseSelector extends BaseSelector<IDateRangeBaseSelectorOptions> {
    protected _startValue: Date | null;
    protected _endValue: Date | null;
    protected _rangeModel: DateRangeModel = null;

    protected _beforeMount(options: IDateRangeBaseSelectorOptions): void {
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
        this._updateRangeModel(options);
        super._beforeMount(options);
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _beforeUpdate(options: IDateRangeBaseSelectorOptions): void {
        this._updateRangeModel(options);
        super._beforeUpdate(options);
    }

    protected _updateRangeModel(options: IDateRangeBaseSelectorOptions): void {
        this._rangeModel.update(options);
    }

    protected _onResult(startValue: Date, endValue: Date): void {
        if (startValue instanceof Date || !startValue) {
            this._rangeModel.setRange(startValue, endValue);
            this.closePopup();
        }
    }

    protected _getPopupOptions(): IStickyPopupOptions {
        return {};
    }

    protected _rangeChangedHandler(event: SyntheticEvent, startValue: Date, endValue: Date): void {
        this._rangeModel.setRange(startValue, endValue);
    }
}
