import { TreeControl } from 'Controls/_tree/TreeControl';
import { ITreeControlOptions } from 'Controls/_tree/interface/ITreeControlOptions';
import ITree, { IOptions } from 'Controls/_tree/interface/ITree';
import { default as ItemsView } from 'Controls/_tree/ItemsTree';
import TreeCollection from 'Controls/_tree/display/TreeCollection';
import TreeNodeFooterItem from 'Controls/_tree/display/TreeNodeFooterItem';
import TreeNodeHeaderItem from 'Controls/_tree/display/TreeNodeHeaderItem';
import TreeItem, { IOptions as ITreeItemOptions } from 'Controls/_tree/display/TreeItem';
import { default as View } from 'Controls/_tree/Tree';
import { default as TreeView } from 'Controls/_tree/TreeView';
import { default as IItemTemplateOptions } from 'Controls/_tree/interface/ItemTemplate';
import { TreeSiblingStrategy } from 'Controls/_tree/Strategies/TreeSiblingStrategy';
import { register } from 'Types/di';

import * as NodeFooterTemplate from 'wml!Controls/_tree/render/NodeExtraItemTemplate';
import * as NodeHeaderTemplate from 'wml!Controls/_tree/render/NodeExtraItemTemplate';
import * as ItemTemplate from 'wml!Controls/_tree/render/Item';

/**
 * Библиотека контролов, позволяющая работать с иерархией.
 * @library
 * @includes ItemTemplate Controls/_tree/interface/ItemTemplate
 * @includes NodeFooterTemplate Controls/_tree/interface/NodeFooterTemplate
 * @includes NodeHeaderTemplate Controls/_tree/interface/NodeHeaderTemplate
 * @public
 * @author Аверкиев П.А.
 */
export {
    TreeControl,
    ITreeControlOptions,
    ITree,
    IOptions,
    ItemsView,
    TreeCollection,
    TreeItem,
    ITreeItemOptions,
    View,
    TreeView,
    TreeNodeFooterItem,
    TreeNodeHeaderItem,
    NodeFooterTemplate,
    NodeHeaderTemplate,
    ItemTemplate,
    IItemTemplateOptions,
    TreeSiblingStrategy
};

register('Controls/tree:TreeCollection', TreeCollection, {instantiate: false});
register('Controls/tree:TreeItem', TreeItem, {instantiate: false});
register('Controls/tree:TreeNodeFooterItem', TreeNodeFooterItem, {instantiate: false});
register('Controls/tree:TreeNodeHeaderItem', TreeNodeHeaderItem, {instantiate: false});
