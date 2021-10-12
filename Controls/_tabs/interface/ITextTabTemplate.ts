/**
 * Шаблон ITextTabTemplate для отображения вкладки, используется для вывода содержимого:
 * * <текст> - <иконка>
 * * <текст> - <иконка> - <доп. текст>
 * Шаблон поддерживает следующие параметры:
 *       * icon {String} —  Название иконки.
 *       * iconStyle {String} — Стиль отображения иконки.
 *       * iconSize {String} - Размер иконки(Доступны значения s и m).
 *       * caption {String} — Подпись вкладки.
 *       * additionalCaption {String} - Дополнительная подпись вкладки.
 * @class Controls/_tabs/interface/ITextCounterTabTemplate
 * @author Красильников А.С.
 * @example
 * Вкладки с использованием шаблона ITextTabTemplate.
 * <pre>
 *     <Controls.tabs:Buttons
 *                      bind:selectedKey='SelectedKey'
 *                      itemTemplate="Controls/tabs:ITextTabTemplate"
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
export interface ITextTabTemplate {
    /**
     * @name Controls/_tabs/interface/ITextTabTemplate#icon
     * @cfg {String} Название иконки.
     */
    icon?: string;
    /**
     * @name Controls/_tabs/interface/ITextTabTemplate#iconStyle
     * @cfg {String} Стиль отображения иконки.
     */
    iconStyle?: string;
    /**
     * @name Controls/_tabs/interface/ITextTabTemplate#iconSize
     * @cfg {String} Размер иконки.
     */
    iconSize?: string;
    /**
     * @name Controls/_tabs/interface/ITextTabTemplate#caption
     * @cfg {String} Подпись вкладки.
     */
    caption?: string;
    /**
     * @name Controls/_tabs/interface/ITextTabTemplate#additionalCaption
     * @cfg {String} Дополнительная подпись вкладки.
     */
    additionalCaption?: string;
}
