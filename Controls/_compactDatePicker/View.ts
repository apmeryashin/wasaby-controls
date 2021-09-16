import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_compactDatePicker/View';
import {Date as WSDate} from 'Types/entity';
import {Base as dateUtils} from 'Controls/dateUtils';
import {Utils as DateControlsUtils, DateRangeModel} from 'Controls/dateRange';
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

interface ICompactDatePickerOptions extends IControlOptions {
    position: Date;
    startValue: Date | null;
    endValue: Date | null;
}

export default class CompactDatePicker extends Control<ICompactDatePickerOptions> {
    _template: TemplateFunction = template;
    protected _position: Date;
    protected _headerCaption: string;
    protected _weekdaysCaptions: string = DateControlsUtils.getWeekdaysCaptions();
    protected _rangeModel: DateRangeModel;
    protected _todayIconVisible: boolean = false;
    protected _today: number = (new WSDate()).getDate();
    protected _getFormattedCaption: Function = getFormattedCaption;
    protected _topShadowVisibility: string = 'hidden';

    protected _beforeMount(options: ICompactDatePickerOptions): void {
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
            this._todayIconVisible = true;
        }
    }

    protected _beforeUnmount(): void {
        this._rangeModel.destroy();
    }

    protected _positionChangedHandler(): void {
        this._headerCaption = this._getFormattedCaption(this._position);
    }

    protected _scrollToCurrentDate(): void {
        this._position = dateUtils.getStartOfMonth(new WSDate());
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
