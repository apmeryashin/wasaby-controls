/**
 * Библиотека контролов, которые реализуют список, отображающийся в виде плитки.
 * @library
 * @includes ItemTemplate Controls/_tile/interface/ItemTemplate
 * @includes ITile Controls/_tile/interface/ITile
 * @includes SmallItemTemplate Controls/_tile/interface/ISmallTemplate
 * @includes PreviewTemplate Controls/_tile/interface/IPreviewTemplate
 * @includes RichTemplate Controls/_tile/interface/IRichTemplate
 * @public
 * @author Колесов В.А.
 */

import {register} from 'Types/di';

import {default as View} from 'Controls/_tile/View';
import * as ItemTemplate from 'wml!Controls/_tile/render/items/Default';
import * as SmallItemTemplate from 'wml!Controls/_tile/render/items/Small';
import * as MediumTemplate from 'wml!Controls/_tile/render/items/Medium';
import * as PreviewTemplate from 'wml!Controls/_tile/render/items/Preview';
import * as RichTemplate from 'wml!Controls/_tile/render/items/Rich';
import {default as ActionsMenu} from 'Controls/_tile/itemActions/Menu';
import {getImageUrl, getImageSize, getImageClasses, getImageRestrictions, getItemSize} from 'Controls/_tile/utils/imageUtil';

import TileCollection, { ITileCollectionOptions } from 'Controls/_tile/display/TileCollection';
import TileCollectionItem, { ITileCollectionItemOptions } from 'Controls/_tile/display/TileCollectionItem';
import InvisibleTileItem from 'Controls/_tile/display/InvisibleTileItem';
import AddItem from 'Controls/_tile/display/mixins/AddItem';
import AddTileItem from 'Controls/_tile/display/AddTileItem';
import Tile from 'Controls/_tile/display/mixins/Tile';
import TileItem from 'Controls/_tile/display/mixins/TileItem';
import InvisibleStrategy, { COUNT_INVISIBLE_ITEMS } from 'Controls/_tile/display/strategies/Invisible';
import AddTileStrategy from 'Controls/_tile/display/strategies/AddTile';
import TileView from 'Controls/_tile/TileView';
import ItemsView from 'Controls/_tile/ItemsView';
import InvisibleItem from 'Controls/_tile/display/mixins/InvisibleItem';
import TileItemActions, { ITileItemActionsOptions } from 'Controls/_tile/itemActions/Control';

export {
    View,
    ItemsView,
    TileView,
    ItemTemplate,
    SmallItemTemplate,
    MediumTemplate,
    PreviewTemplate,
    RichTemplate,
    ActionsMenu,
    TileCollection,
    ITileCollectionOptions,
    TileCollectionItem,
    ITileCollectionItemOptions,
    Tile as TileMixin,
    TileItem as TileItemMixin,
    InvisibleItem,
    InvisibleTileItem,
    InvisibleStrategy,
    AddTileStrategy,
    AddTileItem,
    AddItem,
    COUNT_INVISIBLE_ITEMS,
    TileItemActions,
    ITileItemActionsOptions,
    getImageUrl,
    getImageSize,
    getImageClasses,
    getImageRestrictions,
    getItemSize
};

export {TImagePosition} from 'Controls/_tile/interface/IRichTemplate';

export {
    TTileItem,
    TActionMode,
    TGradientType,
    TTitlePosition,
    TContentPosition,
    TImageViewMode,
    TShadowVisibility,
    TTitleStyle
} from 'Controls/_tile/display/mixins/TileItem';

register('Controls/tile:TileCollection', TileCollection, {instantiate: false});
register('Controls/tile:TileCollectionItem', TileCollectionItem, {instantiate: false});
register('Controls/tile:InvisibleTileItem', InvisibleTileItem, {instantiate: false});
register('Controls/tile:AddTileItem', AddTileItem, {instantiate: false});
