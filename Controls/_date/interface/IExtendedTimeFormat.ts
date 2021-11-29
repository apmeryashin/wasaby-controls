export interface IExtendedTimeFormatOptions {
    extendedTimeFormat: boolean;
}

/**
 * Интерфейс расширенного режима ввода времени в поле.
 * @interface Controls/_date/interface/IExtendedTimeFormat
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_date/interface/IExtendedTimeFormat#extendedTimeFormat
 * @cfg {Boolean} Определяет, включен ли раширенный режим.
 * @remark
 * Опция позволяет вводить пользователю '24:00'. При этом значение в формает Date будет 23:59:59.
 * @demo Controls-demo/Input/DateTime/DateTime
 */
