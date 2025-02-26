import {IItemTemplateOptions as ITreeItemTemplateOptions} from 'Controls/tree';
/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/treeGrid:View дереве с колонками}.
 * @class Controls/_treeGrid/interface/ItemTemplate
 * @implements Controls/list:IBaseItemTemplate
 * @implements Controls/tree:IItemTemplateOptions
 * @author Авраменко А.С.
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplate
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
 * @see Controls/treeGrid:View
 * @example
 * <pre class="brush: html; highlight: [3-5]">
 * <!-- WML -->
 * <Controls.treeGrid:View >
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/treeGrid:ItemTemplate" levelIndentSize="null" expanderSize="l" expanderIcon="node" />
 *    </ws:itemTemplate>
 * </Controls.treeGrid:View>
 * </pre>
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/item/ руководство разработчика}
 *
 * @public
 */

export default interface IItemTemplateOptions extends ITreeItemTemplateOptions {
    /**
     * @cfg {Boolean} Когда опция установлена в значение true, в дереве отсутствуют {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/paddings/ структурные отступы} для элементов иерархии.
     * @default false
     * @see levelIndentSize
     */
    withoutLevelPadding?: boolean;
    /**
     * @cfg {Stings|undefined} Стиль отображения {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/#expander-icon иконки} для узла и скрытого узла.
     * @variant none Иконки всех узлов не отображаются.
     * @variant node Иконки всех узлов отображаются как иконки узлов.
     * @variant emptyNode Иконки всех узлов отображаются как иконки пустых узлов.
     * @variant hiddenNode Иконки всех узлов отображаются как иконки скрытых узлов."
     * @default undefined
     * @remark
     * Когда в опции задано undefined, используются иконки узлов и скрытых узлов.
     * @see expanderSize
     */
    expanderIcon?: string;
    /**
     * @cfg {Controls/_tree/interface/ITree/TOffset.typedef} Размер области, который отведён под иконку узла или скрытого узла.
     * @default s
     * @see expanderIcon
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/#expander-size здесь}.
     */
    expanderSize?: string;
    /**
     * @cfg {Controls/_tree/interface/ITree/TOffset.typedef} Размер структурного отступа для элементов иерархии.
     * @default s
     * @see withoutLevelPadding
     * @remark
     * Каждому значению опции соответствует размер в px. Он зависит от {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
     * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/paddings/#hierarchical-indentation здесь}.
     */
    levelIndentSize?: string;
}

/**
 * @name Controls/_treeGrid/interface/ItemTemplate#fontColorStyle
 * @cfg {Controls/_interface/IFontColorStyle/TFontColorStyle.typedef} Стиль цвета текста записи.
 * @remark
 * Стиль цвета текста применяется ко всем записям дерева с колонками, включая {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree-column/node/group/ узлы, отображаемые в виде групп}.
 * {@link Controls/_treeGrid/interface/IColumn#fontColorStyle Стиль цвета текста ячейки} имеет больший приоритет, чем стиль цвета текста записи.
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 */
/**
 * @name Controls/_treeGrid/interface/ItemTemplate#fontSize
 * @cfg {TFontSize} Размер шрифта записи.
 * @remark
 * Размер шрифта применяется ко всем записям дерева с колонками, включая {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree-column/node/group/ узлы, отображаемые в виде групп}.
 * Базовая линия в узлах, отображаемых в виде групп, основывается на этом значении, поэтому для корректного выравнивания здесь стоит указывать максимальную величину шрифта.
 * {@link Controls/_treeGrid/interface/IColumn#fontSize Размер шрифта ячейки} имеет больший приоритет, чем стиль размер шрифта текста записи, но на базовую линию не влияет.
 * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
 * @default l
 */
/**
 * @name Controls/_treeGrid/interface/ItemTemplate#fontWeight
 * @cfg {TFontWeight} Насыщенность шрифта.
 * @remark
 * Насыщенность шрифта применяется ко всем записям дерева с колонками, включая {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree-column/node/group/ узлы, отображаемые в виде групп}..
 * {@link Controls/_treeGrid/interface/IColumn#fontWeight Насыщенность шрифта ячейки} имеет больший приоритет, чем Насыщенность шрифта текста записи.
 * @default "default".
 */
