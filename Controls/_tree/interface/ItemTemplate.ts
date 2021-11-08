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
 * @name Controls/_tree/interface/ItemTemplate#expanderIconSize
 * @cfg {Controls/_display/interface/ITree/TExpanderIconSize.typedef} Размер иконки разворота узла дерева
 * @default default
 */

/**
 * @name Controls/_tree/interface/ItemTemplate#expanderIconStyle
 * @cfg {Controls/_display/interface/ITree/TExpanderIconStyle.typedef} Стиль цвета иконки разворота узла дерева
 * @default default
 */
