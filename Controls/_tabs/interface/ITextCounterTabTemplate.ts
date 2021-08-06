/**
 * Шаблон ITextCounterTabTemplate для отображения вкладки, используется для вывода содержимого:
 * * <текст> - <счетчик>
 * * <текст> - <иконка>
 * * <текст> - <иконка> - <счетчик>
 * Шаблон поддерживает следующие параметры:
 *       * icon {String} —  Название иконки.
 *       * iconStyle {String} — Стиль отображения иконки.
 *       * iconSize {String} - Размер иконки(Доступны значения s и m).
 *       * mainCounter {Number} — Значение счетчика.
 *       * mainCounterStyle {String} — Стиль отображения счетчика.
 *       * caption {String} — Подпись вкладки.
 * @class Controls/_tabs/interface/ITextCounterTabTemplate
 * @author Красильников А.С.
 * @example
 * Вкладки с использованием шаблона TextCounterTabTemplate.
 * <pre>
 *     <Controls.tabs:Buttons
 *                      bind:selectedKey='SelectedKey'
 *                      itemTemplate="Controls/tabs:TextCounterTabTemplate"
 *                      items="{{_items}}"
 *                      keyProperty="id"/>
 * </pre>
 * <pre>
 *     {
 *        id: '1',
 *        caption: 'Вкладка',
 *        mainCounter: 12
 *     },
 *     {
 *        id: '2',
 *        caption: 'Вкладка',
 *        mainCounter: 12
 *     },
 *     {
 *        id: '3',
 *        caption: 'Вкладка',
 *        mainCounter: 12
 *     }
 * </pre>
 * @demo Controls-demo/Tabs/Buttons/NewTemplate/Index
 * @public
 */
export interface ITextCounterTabTemplate {
    /**
     * @name Controls/_tabs/interface/ITextCounterTabTemplate#icon
     * @cfg {String} Название иконки.
     */
    icon?: string;
    /**
     * @name Controls/_tabs/interface/ITextCounterTabTemplate#iconStyle
     * @cfg {String} Стиль отображения иконки.
     */
    iconStyle?: string;
    /**
     * @name Controls/_tabs/interface/ITextCounterTabTemplate#iconSize
     * @cfg {String} Размер иконки.
     */
    iconSize?: string;
    /**
     * @name Controls/_tabs/interface/ITextCounterTabTemplate#mainCounter
     * @cfg {String} Значение счетчика.
     */
    mainCounter?: string;
    /**
     * @name Controls/_tabs/interface/ITextCounterTabTemplate#mainCounterStyle
     * @cfg {String} Стиль отображения счетчика.
     */
    mainCounterStyle?: string;
    /**
     * @name Controls/_tabs/interface/ITextCounterTabTemplate#caption
     * @cfg {String} Подпись вкладки.
     */
    caption?: string;
}
