import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_compactDatePicker/List';
import {Date as WSDate} from 'Types/entity';
import {Utils as DateControlsUtils} from 'Controls/dateRange';
import 'css!Controls/compactDatePicker';
import {SyntheticEvent} from "UICommon/Events";
import {IntersectionObserverSyntheticEntry} from "Controls/scroll";
import * as dayTemplate from 'wml!Controls/_compactDatePicker/dayTemplate';
import {MonthViewDayTemplate} from 'Controls/calendar';
import {MonthModel} from 'Controls/calendar';
import {getFormattedCaption} from 'Controls/_compactDatePicker/Utils';
import {IDisplayedRangesOptions} from 'Controls/interface';

interface ICompactDatePickerOptions extends IControlOptions, IDisplayedRangesOptions {
    position: Date;
    startValue: Date | null;
    endValue: Date | null;
    topShadowVisibility: string;
}

export default class List extends Control<ICompactDatePickerOptions> {
    protected _template: TemplateFunction = template;
    protected _dayTemplate: TemplateFunction = dayTemplate;
    protected _defaultDayTemplate: TemplateFunction = MonthViewDayTemplate;
    protected _weekdaysCaptions: string = DateControlsUtils.getWeekdaysCaptions();
    protected _today: number = (new WSDate()).getDate();
    // Список подскролливает к первому элементу после того как мы навели мышку на список, т.к. загружаются новые
    // элементы и показывается ромашка. Не будем реагировать на первое событие скролла.
    private _shouldUpdateShadowState: boolean = false;

    protected _monthViewModel: MonthModel = MonthModel;

    protected _positionChangedHandler(event: Event, position: Date): void {
        this._notify('positionChanged', [position]);
    }

    private _todayIconVisibleChanged(iconVisible: boolean): void {
        this._notify('todayIconVisibleChanged', [iconVisible]);
    }

    protected _isLastMonth(date: Date): boolean {
        if (!this._options.displayedRanges) {
            return false;
        }
        const displayedRanges = this._options.displayedRanges;
        const amountOfRanges = displayedRanges.length;
        const lastRange = this._options.displayedRanges[amountOfRanges - 1][1];
        if (!lastRange) {
            return false;
        }
        return  lastRange.getFullYear() === date.getFullYear() && lastRange.getMonth() === date.getMonth();
    }

    protected _getFormattedCaption(date: Date): string {
        // Рисуем заголовок текущего месяца в футоре другого месяца. Таким образом позиция будет меняться только когда
        // пользователь подскроллит прямо к месяцу с ячейками дней. Это нужно для того, чтобы заголовок в шапке менялся
        // только тогда, когда заголовка у месяца уже не видно. Иначе визуально заголовки будут дублироваться.
        const captionDate = new Date(date.getFullYear(), date.getMonth() + 1);
        return getFormattedCaption(captionDate);
    }

    protected _scrollHandler(): void {
        // Будем показывать тень только после того как пользователь проскроллил
        if (this._shouldUpdateShadowState && this._options.topShadowVisibility === 'hidden') {
            this._notify('topShadowVisibilityChanged', ['auto']);
            this._shouldUpdateShadowState = false;
        } else {
            this._shouldUpdateShadowState = true;
        }
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
