type TDatePopup = 'datePicker' | 'compactDatePicker' | 'shortDatePicker';

export interface IDatePopupTypeOptions {
    datePopupType: TDatePopup;
}

/**
 * Интерфейс выбора разных попапов в рамках одного вызывающего элемента.
 * @interface Controls/_dateRange/interfaces/IDatePopupType
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_dateRange/interfaces/IDatePopupType#datePopupType
 * @cfg {String} Календарь, который откроется при нажатии на вызывающий элемент
 * @variant datePicker Большой выбор периода
 * @variant compactDatePicker Компактный выбор периода
 * @variant shortDatePicker
 * @default datePicker
 * @demo Controls-demo/dateRange/RangeSelector/DatePopupType/Index
 */
