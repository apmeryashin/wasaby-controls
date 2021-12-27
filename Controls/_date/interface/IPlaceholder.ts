interface IPlaceholderOptions {
    placeholder: string;
}

/**
 * Интерфейс для контролов, которые поддерживают возможность подсказки в пустом поле ввода даты
 *
 * @interface Controls/_date/interface/IPlaceholder
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_date/interface/IPlaceholder#placeholder
 * @cfg {String} Подсказка в пустом поле ввода даты
 * @remark
 * Подсказка будет работать только в том случае, если у поля выключен режим
 * ручного ввода, т.е. опция calendarButtonVisible = false
 * @example
 * <pre>
 *  <Controls.date:Input value="{{ _value }}"
 *                       placeholder="Когда?"
 *                       calendarButtonVisible={{ false }}/>
 * </pre>
 * @demo Controls-demo/dateNew/Input/Placeholder/Index
 */
