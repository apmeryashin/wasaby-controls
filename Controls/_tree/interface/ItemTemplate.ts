import {TExpanderIconSize, TExpanderIconStyle} from 'Controls/display';

export default interface IItemTemplateOptions {
    expanderIconSize?: TExpanderIconSize;
    expanderIconStyle?: TExpanderIconStyle;
}

/**
 * Базовый Шаблон элемента дерева.
 * @class Controls/_tree/interface/ItemTemplate
 * @implements Controls/list:IBaseItemTemplate
 * @author Аверкиев П.А.
 * @public
 */

/**
 * @name Controls/_tree/interface/ItemTemplate#expanderSize
 * @cfg {Controls/_tree/interface/ITreeControl/TOffset.typedef} Размер области, который отведён под иконку узла или скрытого узла.
 * @default s
 * @remark
 * Опции expanderSize на контроле и {@link Controls/treeGrid:ItemTemplate#expanderSize expanderSize на шаблоне элемента} не являются взаимоисключающими.
 * Опция expanderSize на контроле определяет размер области, отведённой под иконку узла или скрытого узла для всего списка, включая автоматическую конфигурацию {@link nodeFooterTemplate шаблона подвалов узлов}.
 * Опция {@link Controls/treeGrid:ItemTemplate#expanderSize expanderSize на шаблоне элемента} приоритетнее, чем expanderSize на контроле.
 * В случае, если для разных элементов дерева заданы разные значения опции, то для корректного выравнивания подвалов узлов необходимо продублировать опцию на {@link nodeFooterTemplate шаблоне подвалов узлов}.
 * @see expanderIcon
 * @see expanderVisibility
 */

/**
 * @name Controls/_tree/interface/ItemTemplate#expanderIcon
 * @cfg {String|undefined} Стиль отображения иконки для всех узлов и скрытых узлов дерева.
 * @variant none Иконки всех узлов и скрытых узлов не отображаются.
 * @variant node Иконки всех узлов и скрытых узлов отображаются как иконки узлов.
 * @variant hiddenNode Иконки всех узлов и скрытых узлов отображаются как иконки скрытых узлов.
 * @default undefined
 * @remark
 * Когда в опции задано undefined, используются иконки узлов и скрытых узлов.
 * Опции expanderIcon на контроле и {@link Controls/treeGrid:ItemTemplate#expanderIcon expanderIcon на шаблоне элемента} не являются взаимоисключающими.
 * Опции expanderIcon на контроле определяет стиль отображения иконки для узла и скрытого узла для всего списка, включая автоматическую конфигурацию {@link nodeFooterTemplate шаблона подвалов узлов}.
 * Опция {@link Controls/treeGrid:ItemTemplate#expanderIcon expanderIcon на шаблоне элемента} приоритетнее, чем expanderIcon на контроле.
 * В случае, если для разных элементов дерева заданы разные значения опции, то для корректного выравнивания подвалов узлов необходимо продублировать опцию на {@link nodeFooterTemplate шаблоне подвалов узлов}.
 * @see expanderSize
 * @see expanderVisibility
 */

/**
 * @name Controls/_tree/interface/ItemTemplate#expanderIconSize
 * @cfg {Controls/_display/interface/ITree/TExpanderIconSize.typedef} Размер иконки разворота узла дерева
 * @default default
 */

/**
 * @name Controls/_tree/interface/ItemTemplate#expanderIconStyle
 * @cfg {Controls/_display/interface/ITree/TExpanderIconStyle.typedef} Стиль цвета иконки разворота узла дерева
 * @default default
 */
