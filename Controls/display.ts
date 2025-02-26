/**
 * Библиотека, которая предоставляет различные виды коллекций.
 * @library
 * @includes IBind Controls/_display/IBind
 * @public
 * @author Авраменко А.С.
 */

/*
 * Library that provides various views over collections
 * @library
 * @includes IBind Controls/_display/IBind
 * @public
 * @author Авраменко А.С.
 */
import {register} from 'Types/di';
export {default as IBind} from './_display/IBind';
import {default as TreeChildren} from './_display/TreeChildren';
export {TreeChildren};
export {IOptions as ITreeCollectionOptions} from './_display/Tree';
export {default as Abstract} from './_display/Abstract';
import {
    default as Collection,
    IOptions as ICollectionOptions,
    IEditingConfig,
    IItemActionsTemplateConfig,
    ISwipeConfig,
    ItemsFactory,
    IViewIterator,
    ISessionItems
} from './_display/Collection';
export {
    Collection, ICollectionOptions, IEditingConfig, ISessionItems,
    IItemActionsTemplateConfig, ISwipeConfig, ItemsFactory, IViewIterator
};
export {default as CollectionItem, IOptions as ICollectionItemOptions, TItemBaseLine} from './_display/CollectionItem';
import {default as GroupItem} from './_display/GroupItem';
export {GroupItem};
import * as itemsStrategy from './_display/itemsStrategy';
export {itemsStrategy};
import {default as Search} from './_display/Search';
export {Search};
import {default as Tree, NODE_TYPE_PROPERTY_GROUP} from './_display/Tree';
export {Tree, NODE_TYPE_PROPERTY_GROUP};
import {IOptions as ITreeOptions} from './_display/Tree';
export {ITreeOptions};
import {default as TreeItem} from './_display/TreeItem';
export {TreeItem};
import {IOptions as ITreeItemOptions} from './_display/TreeItem';
export {ITreeItemOptions};

import ExpandableMixin, {IOptions as IExpandableMixinOptions} from 'Controls/_display/ExpandableMixin';
export {ExpandableMixin, IExpandableMixinOptions};

export {default as IMarkable} from './_display/interface/IMarkable';
export {default as ISelectableItem} from './_display/interface/ISelectableItem';
export {default as IEnumerableItem} from './_display/interface/IEnumerableItem';

export {default as IGroupNode} from './_display/interface/IGroupNode';

import {default as CollectionItem} from 'Controls/_display/CollectionItem';
import BreadcrumbsItem from './_display/BreadcrumbsItem';
export {BreadcrumbsItem};
import SearchSeparator from './_display/SearchSeparator';
export {SearchSeparator};

export {ANIMATION_STATE, IItemPadding} from './_display/interface/ICollection';
export {IEditableCollection} from './_display/interface/IEditableCollection';
export {IEditableCollectionItem} from './_display/interface/IEditableCollectionItem';
export {ICollectionItem, TMarkerClassName, TRowSeparatorVisibility} from './_display/interface/ICollectionItem';
export {IBaseCollection, TItemKey} from './_display/interface';

import * as GridLadderUtil from './_display/utils/GridLadderUtil';
export {GridLadderUtil};
export {ILadderObject, IStickyColumn, ILadderConfig, IStickyLadderConfig, TLadderElement} from './_display/utils/GridLadderUtil';
export {default as isFullGridSupport} from './_display/utils/GridSupportUtil';
export {default as GridLayoutUtil} from './_display/utils/GridLayoutUtil';

import * as VirtualScrollController from './_display/controllers/VirtualScroll';

export { VirtualScrollController };
import * as VirtualScrollHideController from './_display/controllers/VirtualScrollHide';

export { VirtualScrollHideController };
import {IDragPosition} from './_display/interface/IDragPosition';
export {IDragPosition};
export {groupConstants} from './_display/itemsStrategy/Group';
export {IHiddenGroupPosition} from './_display/itemsStrategy/Group';
export {MultiSelectAccessibility} from './_display/Collection';
export {IHasMoreData} from './_display/Collection';
export {MoreButtonVisibility} from './_display/Collection';
export {TItemActionsPosition} from './_display/Collection';

export { default as CollectionEnumerator } from 'Controls/_display/CollectionEnumerator';
export { getFlatNearbyItem } from 'Controls/_display/utils/NearbyItemUtils';

import IItemsStrategy, {IOptions as IItemsStrategyOptions} from 'Controls/_display/IItemsStrategy';
import TreeItemDecorator from 'Controls/_display/TreeItemDecorator';
export {IItemsStrategy, IItemsStrategyOptions};

import {Footer, IOptions as IFooterOptions} from './_display/Footer';
export {Footer, IFooterOptions};
import NodeFooter from 'Controls/_display/NodeFooter';
export { NodeFooter };

import Indicator from 'Controls/_display/Indicator';
export {default as Indicator, EIndicatorState, TIndicatorState} from 'Controls/_display/Indicator';
export {default as IndicatorsMixin, ITriggerOffset} from 'Controls/_display/IndicatorsMixin';
export {default as GroupMixin} from 'Controls/_display/GroupMixin';
export {TExpanderIconStyle, TExpanderIconSize} from 'Controls/_display/interface/ITree';

register('Controls/display:Collection', Collection, {instantiate: false});
register('Controls/display:CollectionItem', CollectionItem, {instantiate: false});

register('Controls/display:GroupItem', GroupItem, {instantiate: false});
register('Controls/display:Tree', Tree, {instantiate: false});
register('Controls/display:TreeChildren', TreeChildren, {instantiate: false});
register('Controls/display:TreeItem', TreeItem, {instantiate: false});
register('Controls/display:TreeItemDecorator', TreeItemDecorator, {instantiate: false});
register('Controls/display:Footer', Footer, {instantiate: false});
register('Controls/display:NodeFooter', NodeFooter, {instantiate: false});

register('Controls/display:Indicator', Indicator, {instantiate: false});
