import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/DateRangeItem';
import {MonthModel} from "Controls/calendar";
import {Base as dateUtils} from 'Controls/dateUtils';

export default class DateRangeItem extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _monthViewModel: MonthModel = MonthModel;

    protected _startValue: Date;
    protected _endValue: Date;

    protected _beforeMount(options?: IControlOptions): void {
        this._updateRangeValues(options.startValue, options.endValue, options.monthDate);
    }

    protected _beforeUpdate(options: IControlOptions): void {
        this._updateRangeValues(options.startValue, options.endValue, options.monthDate);
    }

    private _updateRangeValues(startValue: Date, endValue: Date, monthDate: Date): void {
        // Будем обновлять startValue и endValue только в тех месяцах, в которых происходит выбор
        if (startValue === null) {
            this._startValue = startValue;
        }
        if (endValue === null) {
            this._endValue = null;
        }
        const startDate = dateUtils.getStartOfMonth(startValue);
        const endDate = dateUtils.getStartOfMonth(endValue);
        if (startValue && endValue && startDate <= monthDate && monthDate <= endDate) {
            this._startValue = startValue;
            this._endValue = endValue;
        } else {
            this._startValue = undefined;
            this._endValue = undefined;
        }
    }

    protected _proxyEvent(event: Event): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }
}
