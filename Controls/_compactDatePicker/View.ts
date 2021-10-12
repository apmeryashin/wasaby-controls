import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_compactDatePicker/View';
import {Date as WSDate} from 'Types/entity';
import {Base as dateUtils} from 'Controls/dateUtils';
import {Utils as DateControlsUtils, DateRangeModel, IDateRangeOptions} from 'Controls/dateRange';
import {IDisplayedRangesOptions} from "Controls/interface";
import {getFormattedCaption} from 'Controls/_compactDatePicker/Utils';
import 'css!Controls/compactDatePicker';

/**
 * Диалоговое окно компактного выбора периода
 *
 * @class Controls/compactDatePicker:View
 * @extends UI/Base:Control
 * @implements Controls/dateRange:IDateRangeSelectable
 * @implements Controls/dateRange:IDateRange
 * @implements Controls/interface:IDisplayedRanges
 *
 * @remark
 *
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FCompactDatePicker%2FFullDemo%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-21.6000/Controls-default-theme/variables/_compactDatePicker.less переменные тем оформления}
 *
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/CompactDatePicker/Index
 *
 */

/**
 * @name Controls/compactDatePicker:View#isDayAvailable
 * @cfg {Function} Коллбек-функция, которая определяет, может ли пользователь выбирать конкретный день.
 * @remark
 * Функция должна возвращать булевое значение.
 * @param {Date} date - дата проверяемого дня
 * @example
 * <pre>
 *     <Controls.compactDatePicker:View
 *          bind:startValue="_value"
 *          bind:endValue="_value"
 *          selectionType="single"
 *          isDayAvailable="{{ _isDayAvailable }}"
 *     />
 * </pre>
 * <pre>
 *     protected _isDayAvailable(date: Date): boolean {
 *      // Заблокируем выбор всех понедельников и четвергов
 *      return date.getDay() !== 1 && date.getDay() !== 4;
 *  }
 * </pre>
 * @demo Controls-demo/CompactDatePicker/IsDayAvailable/Index
 */

interface ICompactDatePickerOptions extends IControlOptions, IDateRangeOptions, IDisplayedRangesOptions {
    position: Date;
}

export default class CompactDatePicker extends Control<ICompactDatePickerOptions> {
    _template: TemplateFunction = template;
    protected _position: Date;
    protected _headerCaption: string;
    protected _weekdaysCaptions: string = DateControlsUtils.getWeekdaysCaptions();
    protected _rangeModel: DateRangeModel;
    protected _todayIconVisible: boolean = false;
    protected _today: number;
    protected _getFormattedCaption: Function = getFormattedCaption;
    protected _topShadowVisibility: string = 'hidden';

    protected _beforeMount(options: ICompactDatePickerOptions): void {
        // _date только для тестов, чтобы замокать текущий день
        this._today = options._date ? options._date.getDate() : (new WSDate()).getDate();
        const getFormattedPosition = () => {
            let date;
            if (dateUtils.isValidDate(options.startValue)) {
                date = options.startValue;
            } else {
                date = new WSDate();
            }
            return dateUtils.getStartOfMonth(date);
        };
        this._position = getFormattedPosition();
        this._headerCaption = this._getFormattedCaption(this._position);
        this._rangeModel = new DateRangeModel();
        this._rangeModel.update(options);
        // В случае, если при маунте мы находимся не на текущем месяце, IntersectionObserver, находящийся на текущем
        // дне, не инициализируется. В таком случае мы не будем знать, нужно ли показывать кнопку 'Домой'. Сами
        // посчитаем видимость кнопки
        if (this._position.getFullYear() !== new WSDate().getFullYear() ||
            this._position.getMonth() !== new WSDate().getMonth()) {
            this._updateTodayIconVisible(true, options.displayedRanges);
        }
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    private _updateTodayIconVisible(newState: boolean, displayedRanges: Date[][]): void {
        const date = this._options._date || new WSDate();
        if (dateUtils.hitsDisplayedRanges(date, displayedRanges)) {
            this._todayIconVisible = newState;
        } else {
            this._todayIconVisible = false;
        }
    }

    protected _todayIconVisibleChangedHandler(event: Event, todayIconVisible: boolean): void {
        this._updateTodayIconVisible(todayIconVisible, this._options.displayedRanges);
    }

    protected _positionChangedHandler(): void {
        this._headerCaption = this._getFormattedCaption(this._position);
    }

    protected _scrollToCurrentDate(): void {
        const date = this._options._date || new WSDate();
        this._position = dateUtils.getStartOfMonth(date);
        this._headerCaption = this._getFormattedCaption(this._position);
    }

    protected _rangeChangedHandler(event: Event, startValue: Date, endValue: Date): void {
        this._rangeModel.startValue = startValue;
        this._rangeModel.endValue = endValue;
        this._notify('rangeChanged', [this._rangeModel.startValue, this._rangeModel.endValue]);
    }

    protected _dateRangeSelectionEndedHandler(event: Event, startValue: Date, endValue: Date): void {
        this._notify(
            'sendResult',
            [startValue || this._rangeModel.startValue, endValue || this._rangeModel.endValue],
            {bubbling: true}
        );
    }

    protected _itemClickHandler(event: Event, item: Date): void {
        this._notify('itemClick', [item]);
    }

    protected _closeClick(): void {
        this._notify('close');
    }

    protected _proxyEvent(event: Event): void {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }

    protected _formatDateCaption(weekdayCaption: string): string {
        return weekdayCaption[0].toUpperCase() + weekdayCaption.slice(1);
    }
}
