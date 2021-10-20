/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/grid:View таблице}.
 *
 * @class Controls/_grid/interface/ItemTemplate
 * @implements Controls/list:IBaseItemTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGridItemTemplate#itemTemplate
 * @see Controls/interface/IGridItemTemplate#itemTemplateProperty
 * @see Controls/grid:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [3-5]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/grid:ItemTemplate" marker="{{false}}" scope="{{ itemTemplate }}" />
 *    </ws:itemTemplate>
 * </Controls.grid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/item/ здесь}.
 * @public
 */

/**
 * @name Controls/_grid/interface/ItemTemplate#fontColorStyle
 * @cfg {TFontColorStyle} Стиль цвета текста записи.
 * @remark
 * {@link Controls/_grid/display/interface/IColumn#fontColorStyle Стиль цвета текста ячейки} имеет больший приоритет, чем стиль цвета текста записи.
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 */
/**
 * @name Controls/_grid/interface/ItemTemplate#fontSize
 * @cfg {TFontSize} Размер шрифта записи.
 * @remark
 * {@link Controls/_grid/display/interface/IColumn#fontSize Размер шрифта ячейки} имеет больший приоритет, чем стиль размер шрифта текста записи.
 * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
 * @default l
 */
/**
 * @name Controls/_grid/interface/ItemTemplate#fontWeight
 * @cfg {TFontWeight} Начертание шрифта.
 * @default "default".
 * @remark
 * {@link Controls/_grid/display/interface/IColumn#fontWeight Начертание шрифта ячейки} имеет больший приоритет, чем начертание шрифта записи.
 */
