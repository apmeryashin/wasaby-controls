type TDatePopup = 'datePicker' | 'compactDatePicker' | 'shortDatePicker';

export interface IDatePopupTypeOptions {
    datePopupType: TDatePopup;
}

/**
 * Интерфейс выбора разных попапов в рамках одного вызывающего элемента.
 * @interface Controls/_date/interface/IDatePopupType
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_date/interface/IDatePopupType#datePopupType
 * @cfg {string} Календарь, который откроется при нажатии на вызывающий элемент
 * @variant datePicker Большой выбор периода
 * @variant compactDatePicker Компактный выбор периода
 * @default datePicker
 * @demo Controls-demo/dateRange/RangeSelector/DatePopupType/Index
 */
