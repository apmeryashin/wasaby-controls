/**
 * Библиотека контролов, которые реализуют иерархический список, отображающийся в виде плитки.
 * @library
 * @includes ITreeTile Controls/_treeTile/interface/ITreeTile
 * @includes FolderTemplate Controls/_treeTile/interface/FolderIcon
 * @public
 * @author Панихин К.А.
 */

import View from 'Controls/_treeTile/View';
import TreeTileView from 'Controls/_treeTile/TreeTileView';
import TreeTileCollection from 'Controls/_treeTile/display/TreeTileCollection';
import TreeTileCollectionItem from 'Controls/_treeTile/display/TreeTileCollectionItem';
import InvisibleTreeTileItem from 'Controls/_treeTile/display/InvisibleTreeTileItem';
import AddTreeTileItem from 'Controls/_treeTile/display/AddTreeTileItem';
import {default as ItemsView} from 'Controls/_treeTile/ItemsView';
import {register} from 'Types/di';
import * as FolderTemplate from 'wml!Controls/_treeTile/render/Folder';
import TreeTileItemActions from 'Controls/_treeTile/itemActions/Control';

export {
    View,
    ItemsView,
    TreeTileView,
    FolderTemplate,
    TreeTileItemActions,
    TreeTileCollection
};

register('Controls/treeTile:TreeTileCollection', TreeTileCollection, {instantiate: false});
register('Controls/treeTile:TreeTileCollectionItem', TreeTileCollectionItem, {instantiate: false});
register('Controls/treeTile:InvisibleTreeTileItem', InvisibleTreeTileItem, {instantiate: false});
register('Controls/treeTile:AddTreeTileItem', AddTreeTileItem, {instantiate: false});
