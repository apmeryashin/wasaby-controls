export interface ICalendarButtonVisibleOptions {
    calendarButtonVisible: boolean;
}

/**
 * Интерфейс для контролов, которые имеют возможность отключения видимости иконки рядом с полем ввода, которая вызывает попап
 *
 * @interface Controls/_date/interfaces/ICalendarButtonVisible
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_date/interface/ICalendarButtonVisible#calendarButtonVisible
 * @cfg {Boolean} Определяет видимость иконки, открывающей попап выбора периода.
 * @remark
 * Если иконку не видно, попап выбора периода будет открываться по клику на поле ввода.
 * @default true
 * @demo Controls-demo/dateRange/Input/CalendarButtonVisible/Index
 */
