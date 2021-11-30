export default interface ICaptionOptions {
    captionFormatter?: Function;
    emptyCaption?: string;
}

/**
 * Интерфейс для контролов ввода или выбора дат, которые поддерживают возможность форматирования заголовка
 *
 * @interface Controls/_date/interfaces/ICaption
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_date/interfaces/ICaption#captionFormatter
 * @cfg {Function} Функция форматирования заголовка.
 * @remark
 * Аргументы функции:
 *
 * * startValue — Начальное значение периода.
 * * endValue — Конечное значение периода.
 * * emptyCaption — Отображаемый текст, когда в контроле не выбран период.
 *
 * Функция должна возвращать строку с заголовком.
 * @example
 * WML:
 * <pre>
 * <Controls.dateRange:Selector captionFormatter="{{_captionFormatter}}" />
 * </pre>
 * JS:
 * <pre>
 * _captionFormatter: function(startValue, endValue, emptyCaption) {
 *    return 'Custom range format';
 * }
 * </pre>
 * @demo Controls-demo/dateRange/LiteSelector/CaptionFormatter/Index
 */

/**
 * @name Controls/_date/interfaces/ICaption#emptyCaption
 * @cfg {String} Отображаемый текст, когда в контроле не выбран период.
 */
