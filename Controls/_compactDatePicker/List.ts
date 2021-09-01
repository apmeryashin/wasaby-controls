import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_compactDatePicker/List';
import {Date as WSDate} from 'Types/entity';
import {date as formatDate} from 'Types/formatter';
import {Utils as DateControlsUtils} from 'Controls/dateRange';
import 'css!Controls/compactDatePicker';
import {SyntheticEvent} from "UICommon/Events";
import {IntersectionObserverSyntheticEntry} from "Controls/scroll";
import {MonthModel} from 'Controls/calendar';

interface ICompactDatePickerOptions extends IControlOptions {
    position: Date;
    startValue: Date | null;
    endValue: Date | null;
}

export default class List extends Control<ICompactDatePickerOptions> {
    _template: TemplateFunction = template;
    protected _weekdaysCaptions: string = DateControlsUtils.getWeekdaysCaptions();
    protected _formatDate: Function = formatDate;
    protected _today: number = (new WSDate()).getDate();

    protected _monthViewModel: MonthModel = MonthModel;

    protected _positionChangedHandler(event: Event, position: Date): void {
        this._notify('positionChanged', [position]);
    }

    private _todayIconVisibleChanged(iconVisible: boolean): void {
        this._notify('todayIconVisibleChanged', [iconVisible]);
    }

    protected _getFormattedCaption(date: Date): string {
        return formatDate(date, formatDate.FULL_MONTH);
    }

    protected _proxyEvent(event: Event): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }

    protected _currentDayIntersectHandler(event: SyntheticEvent, entry: IntersectionObserverSyntheticEntry): void {
        this._todayIconVisibleChanged(!entry.nativeEntry.isIntersecting);
    }

    protected _unregisterCurrentDayIntersectHandler(): void {
        // Если в IntersectionObserverContainer, который сделит за сегодняшним днём, происходит событие unregister -
        // значит текущий день точно не отображается. Делаем "Домик" видимым
        this._todayIconVisibleChanged(true);
    }

    protected _monthViewItemClickHandler(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
    }
}
