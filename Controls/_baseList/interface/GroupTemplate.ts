import {IFontColorStyleOptions, IFontSizeOptions} from 'Controls/interface';
import {IBaseGroupTemplate} from 'Controls/_baseList/interface/BaseGroupTemplate';
/**
 * Шаблон, который по умолчанию используется для отображения заголовка {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группы} в {@link Controls/list:View плоских списках} и {@link Controls/tile:View плитке}.
 *
 * @class Controls/_list/interface/GroupTemplate
 * @implements Controls/list:IBaseGroupTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGroupedList#groupTemplate
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [3-16]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *    <ws:groupTemplate>
 *       <ws:partial template="Controls/list:GroupTemplate"
 *          separatorVisibility="{{ false }}"
 *          expanderVisible="{{ false }}"
 *          textAlign="left"
 *          fontSize="xs"
 *          iconSize="m"
 *          scope="{{groupTemplate}}">
 *          <ws:contentTemplate>
 *             <ws:if data="{{contentTemplate.item.contents === 'nonexclusive'}}">Неисключительные права</ws:if>
 *             <ws:if data="{{contentTemplate.item.contents === 'works'}}">Работы</ws:if>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:groupTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/ здесь}.
 * @public
 */
export default interface IGroupTemplate extends IBaseGroupTemplate, IFontColorStyleOptions, IFontSizeOptions {
    '[Controls/_baseList/interface/GroupTemplate]': boolean;
}

/**
 * @name Controls/_list/interface/GroupTemplate#fontSize
 * @cfg {TFontSize} Размер {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/text/#font-size текста заголовка группы}.
 * @default xs
 * @remark
 * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
 * @default l
 * @see fontColorStyle
 */
/**
 * @name Controls/_list/interface/GroupTemplate#fontColorStyle
 * @cfg {TFontColorStyle} Стиль цвета текста заголовка группы.
 * @demo Controls-demo/breadCrumbs_new/FontColorStyle/Index
 * @remark
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 * @see iconSize
 */
