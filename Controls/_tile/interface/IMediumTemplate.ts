/**
 * Упрощенный шаблон отображения элементов в {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/MediumTemplate
 * @implements Controls/tile:ItemTemplate
 * @author Колесов В.А
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html; highlight: [3-7]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}" imageProperty="image">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:MediumTemplate"
 *                   titleLines="2">
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @public
 * @demo Controls-demo/tileNew/DifferentItemTemplates/MediumTemplate/Index
 * @remark
 * Шаблон имеет фиксированную высоту. Опция tileHeight не учитывается.
 */

export default interface IMediumTemplate {
    /**
     * @cfg {Number} Количество строк в описании.
     * @default 1
     */
    titleLines?: number;
}
