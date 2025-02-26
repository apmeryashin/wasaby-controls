/**
 * Библиотека, которая предоставляет операции с записью коллекции.
 * @library
 * @includes IItemActions Controls/_itemActions/interface/IItemActions
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Library that provides collection item actions
 * @library
 * @public
 * @author Аверкиев П.А.
 */

export {
    TItemActionVisibilityCallback,
    TEditArrowVisibilityCallback,
    TItemActionShowType,
    TItemActionsPosition,
    TActionCaptionPosition,
    TActionDisplayMode,
    TItemActionViewMode,
    TItemActionsSize,
    IItemAction
} from './_itemActions/interface/IItemAction';
export {IShownItemAction, IItemActionsObject} from './_itemActions/interface/IItemActionsObject';
export {IContextMenuConfig} from './_itemActions/interface/IContextMenuConfig';
export {IItemActionsItem} from './_itemActions/interface/IItemActionsItem';
export {IItemActionsCollection} from './_itemActions/interface/IItemActionsCollection';
export {IItemActionsTemplateConfig} from './_itemActions/interface/IItemActionsTemplateConfig';
export {IItemActionsOptions, TItemActionsVisibility} from './_itemActions/interface/IItemActionsOptions';
export {Controller} from './_itemActions/Controller';
export {Utils} from './_itemActions/Utils';

import * as ItemActionsForTemplate from 'wml!Controls/_itemActions/resources/templates/ItemActionsFor';
import * as ItemActionsTemplate from 'wml!Controls/_itemActions/resources/templates/ItemActionsTemplate';
import * as SwipeActionTemplate from 'wml!Controls/_itemActions/resources/templates/SwipeAction';
import * as SwipeActionsTemplate from 'wml!Controls/_itemActions/resources/templates/SwipeTemplate';

export {
    ItemActionsForTemplate,
    ItemActionsTemplate,
    SwipeActionTemplate,
    SwipeActionsTemplate
};
