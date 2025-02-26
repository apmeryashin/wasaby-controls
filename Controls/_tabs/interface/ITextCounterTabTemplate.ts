/**
 * Шаблон TextCounterTabTemplate для отображения вкладки, используется для вывода содержимого:
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
 *       * additionalCaption {String} - Дополнительная подпись вкладки.
 *       * horizontalPadding {String} - Определяет Наличие отступа
 * @class Controls/_tabs/interface/TextCounterTabTemplate
 * @author Мочалов М.А.
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
 *        mainCounter: 12,
 *        additionalCaption: 'Доп. текст'
 *     }
 * </pre>
 * @demo Controls-demo/Tabs/Buttons/NewTemplate/Index
 * @public
 */
export interface ITextCounterTabTemplate {
    /**
     * @name Controls/_tabs/interface/TextCounterTabTemplate#icon
     * @cfg {String} Название иконки.
     */
    icon?: string;
    /**
     * @name Controls/_tabs/interface/TextCounterTabTemplate#iconStyle
     * @cfg {String} Стиль отображения иконки.
     */
    iconStyle?: string;
    /**
     * @name Controls/_tabs/interface/TextCounterTabTemplate#iconSize
     * @cfg {String} Размер иконки.
     */
    iconSize?: string;
    /**
     * @name Controls/_tabs/interface/TextCounterTabTemplate#mainCounter
     * @cfg {String} Значение счетчика.
     */
    mainCounter?: string;
    /**
     * @name Controls/_tabs/interface/TextCounterTabTemplate#mainCounterStyle
     * @cfg {String} Стиль отображения счетчика.
     */
    mainCounterStyle?: string;
    /**
     * @name Controls/_tabs/interface/TextCounterTabTemplate#caption
     * @cfg {String} Подпись вкладки.
     */
    caption?: string;
    /**
     * @name Controls/_tabs/interface/TextCounterTabTemplate#additionalCaption
     * @cfg {String} Дополнительная подпись вкладки.
     */
    additionalCaption?: string;
    /**
     * @name Controls/_tabs/interface/ITextCounterTabTemplate#horizontalPadding
     * @cfg {String} Определяет наличие отступа.
     * @variant left
     * @variant right
     * @variant none
     * @default left
     */
    horizontalPadding?: string;
}
