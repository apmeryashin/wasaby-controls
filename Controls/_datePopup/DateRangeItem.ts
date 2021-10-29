import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_datePopup/DateRangeItem';
import {MonthModel} from 'Controls/calendar';

export default class DateRangeItem extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _monthViewModel: MonthModel = MonthModel;

    protected _proxyEvent(event: Event): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }

    protected _monthCaptionClick(event: Event, date: Date): void {
        this._notify('monthCaptionClick', [date]);
    }
}
