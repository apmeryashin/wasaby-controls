import {IColumn} from 'Controls/grid';
import {IBaseGroupTemplate} from 'Controls/baseList';
/**
 * Интерфейс колонки списка с иерархической группировкой.
 * @interface Controls/_treeGrid/interface/IGroupNodeColumn
 *
 * @public
 * @author Аверкиев П.А.
 */
export interface IGroupNodeColumn extends IColumn {
    /**
     * @cfg {Controls/list:IBaseGroupTemplate} Конфигурация шаблона группы для текущей колонки
     * В конфигурации поддерживаются все свойства шаблона группы.
     * @example
     *
     * В следующем примере показана конфигурация, которая позволит отобразить узел в виде группы.
     *
     * <pre class="brush: js">
     * class MyControl extends Control<IControlOptions> {
     *
     *     protected _source = new Memory({
     *         keyProperty: 'id',
     *         data: [{
     *             id: 1,
     *             parent: null,
     *             type: true,
     *             nodeType: 'group',
     *             title: 'I am group'
     *         },
     *         {
     *             id: 10,
     *             parent: 1,
     *             type: null,
     *             nodeType: null,
     *             title: 'I am leaf'
     *         }]
     *     })
     *
     *     protected _columns: IGroupNodeColumn[] = [
     *         {
     *             displayProperty: 'title',
     *             groupNodeConfig: {
     *                 textAlign: 'center'
     *             }
     *         }
     *     ]
     * }
     * </pre>
     */
    groupNodeConfig?: IBaseGroupTemplate;

    /**
     * @cfg Шаблон отображения ячейки. Не влияет на отображение группы.
     * @name {UI/Base:TemplateFunction|string} template
     * @see Controls/grid:IColumn
     */
}
/**
 * @name Controls/_treeGrid/interface/IGroupNodeColumn#fontSize
 * @cfg {TFontSize} Размер шрифта.
 * @default "l". Для контрола {@link Controls/treeGrid:View}: "m" (для листа), "xl" (для скрытого узла) и "2xl" (для узла).
 * @remark
 * Размер шрифта ячейки имеет больший приоритет, чем {@link Controls/_grid/interface/ItemTemplate#fontSize размер шрифта записи}.
 * Размер шрифта применяется ко всем записям дерева с колонками, включая {@kink https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree-column/node/group/ узлы, отображаемые в виде групп}..
 */
/**
 * @name Controls/_treeGrid/interface/IGroupNodeColumn#fontColorStyle
 * @cfg {TFontColorStyle} Стиль цвета текста ячейки.
 * @remark
 * Стиль цвета текста ячейки имеет больший приоритет, чем {@link Controls/_grid/interface/ItemTemplate#fontColorStyle стиль цвета текста записи}.
 * Стиль цвета текста применяется ко всем записям дерева с колонками, включая {@kink https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree-column/node/group/ узлы, отображаемые в виде групп}.
 */
