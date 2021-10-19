import {IFontColorStyleOptions, IFontSizeOptions} from 'Controls/interface';
import {IBaseGroupTemplate} from 'Controls/baseList';
/**
 * Шаблон, который по умолчанию используется для отображения заголовка {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} в {@link Controls/grid:View таблице}, {@link Controls/treeGrid:View дереве с колонками} и {@link Controls/explorer:View иерархическом проводнике}.
 *
 * @class Controls/_grid/interface/GroupTemplate
 * @implements Controls/list:IBaseGroupTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGroupedGrid#groupTemplate
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [3-10]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/grid:GroupTemplate" expanderVisible="{{ false }}" scope="{{ groupTemplate }}">
 *          <ws:contentTemplate>
 *             <ws:if data="{{contentTemplate.item.contents === 'tasks'}}">Задачи</ws:if>
 *             <ws:if data="{{contentTemplate.item.contents === 'error'}}">Ошибки</ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.grid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ здесь}.
 * @public
 */
export default interface IGroupTemplate extends IBaseGroupTemplate, IFontColorStyleOptions, IFontSizeOptions {
   '[Controls/_grid/interface/GroupTemplate]': boolean;
}

/**
 * @name Controls/_grid/interface/GroupTemplate#fontSize
 * @cfg {TFontSize} Размер {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/text/#font-size текста заголовка группы}.
 * @default xs
 * @remark
 * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
 * @default l
 * @see fontColorStyle
 */
/**
 * @name Controls/_grid/interface/GroupTemplate#fontColorStyle
 * @cfg {TFontColorStyle} Стиль цвета текста заголовка группы.
 * @demo Controls-demo/breadCrumbs_new/FontColorStyle/Index
 * @remark
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 * @see iconSize
 */
