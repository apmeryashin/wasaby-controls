export default interface IValueOptions {
    value: Date | null | string;
}

/**
 * Интерфейс для контролов, которые поддерживают возможность ввода и выбора даты.
 *
 * @interface Controls/_date/interface/IValue
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_date/interface/IValue#value
 * @cfg {Date} Выбранная дата
 * @example
 * WML:
 * <pre>
 *  <Controls.date:Selector value="{{ _value }}" />
 * </pre>
 * JS:
 * <pre>
 *  _value: Date = new Date(2021, 0);
 * </pre>
 */

/**
 * @event Происходит при изменении значения поля ввода.
 * @name Controls/_date/interface/IValue#valueChanged
 * @param {Event} eventObject Дескриптор события.
 * @param {Date} value Новое значение поля ввода.
 * @param {String} displayValue Текстовое значение поля ввода.
 */
