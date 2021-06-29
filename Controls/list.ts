/**
 * Библиотека контролов, которые реализуют плоский список. Список может строиться по данным, полученным из источника. Также можно организовать удаление и перемещение данных.
 * @library
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes IClickableView Controls/_list/interface/IClickableView
 * @includes IBaseItemTemplate Controls/_list/interface/IBaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
 * @includes LoadingIndicatorTemplate Controls/_list/interface/LoadingIndicatorTemplate
 * @includes IReloadableList Controls/_list/interface/IReloadableList
 * @includes IEditableList Controls/_list/interface/IEditableList
 * @includes IItemsView Controls/_list/IItemsView
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library
 * @includes ItemTemplate Controls/_list/interface/ItemTemplate
 * @includes IClickableView Controls/_list/interface/IClickableView
 * @includes IBaseItemTemplate Controls/_list/interface/IBaseItemTemplate
 * @includes IContentTemplate Controls/_list/interface/IContentTemplate
 * @includes EmptyTemplate Controls/_list/interface/EmptyTemplate
 * @includes GroupTemplate Controls/_list/interface/GroupTemplate
 * @includes EditingTemplate Controls/_list/interface/EditingTemplate
 * @includes NumberEditingTemplate Controls/_list/interface/NumberEditingTemplate
 * @includes MoneyEditingTemplate Controls/_list/interface/MoneyEditingTemplate
 * @includes LoadingIndicatorTemplate Controls/_list/interface/LoadingIndicatorTemplate
 * @includes IReloadableList Controls/_list/interface/IReloadableList
 * @includes IEditableList Controls/_list/interface/IEditableList
 * @includes IItemsView Controls/_list/IItemsView
 * @public
 * @author Крайнов Д.О.
 */
export {default as AddButton} from 'Controls/_list/AddButton';
export { default as Container } from 'Controls/_list/WrappedContainer';
import EmptyTemplate = require('wml!Controls/_list/emptyTemplate');
import GroupTemplate = require('wml!Controls/_list/GroupTemplate');
import ItemTemplate = require('wml!Controls/_list/ItemTemplate');
import {default as View} from 'Controls/_list/List';
import BaseAction from 'Controls/_list/BaseAction';
import LoadingIndicatorTemplate = require('wml!Controls/_list/PortionedSearchTemplate');
import ContinueSearchTemplate = require('wml!Controls/_list/resources/ContinueSearchTemplate');
import {default as DataContainer, IDataOptions} from 'Controls/_list/Data';
import * as EditingTemplate from 'wml!Controls/_list/EditInPlace/EditingTemplate';
import * as MoneyEditingTemplate from 'wml!Controls/_list/EditInPlace/decorated/Money';
import * as NumberEditingTemplate from 'wml!Controls/_list/EditInPlace/decorated/Number';
import FooterTemplate = require('wml!Controls/_list/ListView/Footer');

import {default as ListControl, LIST_EDITING_CONSTANTS as editing} from 'Controls/_list/BaseControl';
import ListView = require('Controls/_list/ListView');
import GroupContentResultsTemplate = require('wml!Controls/_list/GroupContentResultsTemplate');
import {default as BaseControl, IBaseControlOptions} from 'Controls/_list/BaseControl';
import ScrollEmitter = require('Controls/_list/BaseControl/Scroll/Emitter');
import HotKeysContainer from 'Controls/_list/HotKeysContainer';
import InertialScrolling from 'Controls/_list/resources/utils/InertialScrolling';
import {IVirtualScrollConfig} from './_list/interface/IVirtualScroll';
import {VirtualScroll} from './_list/ScrollContainer/VirtualScroll';
import {default as ScrollController} from './_list/ScrollController';
import {IList} from './_list/interface/IList';
import IListNavigation from './_list/interface/IListNavigation';
import { CssClassList, createClassListCollection} from 'Controls/_list/resources/utils/CssClassList';
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';
import {TCursor} from './_list/interface/BaseItemTemplate';

import ItemActionsHelpers = require('Controls/_list/ItemActions/Helpers');

// region @deprecated

import Remover = require('Controls/_list/Remover');
import Mover from 'Controls/_list/WrappedMover';
export {IMoveItemsParams, IMover, IRemover, BEFORE_ITEMS_MOVE_RESULT} from 'Controls/_list/interface/IMoverAndRemover';

// endregion @deprecated

import * as ForTemplate from 'wml!Controls/_list/Render/For';
export {ForTemplate};

import * as MultiSelectTemplate from 'wml!Controls/_list/Render/multiSelect';
export { MultiSelectTemplate };

import * as CharacteristicsTemplate from 'wml!Controls/_list/CharacteristicsTemplate/CharacteristicsTemplate';
export {CharacteristicsTemplate};

export {MoveController, IMoveControllerOptions}  from 'Controls/_list/Controllers/MoveController';
export {IMovableList, IMoveDialogTemplate, IMovableOptions, TBeforeMoveCallback} from 'Controls/_list/interface/IMovableList';
export {IBaseGroupTemplate} from 'Controls/_list/interface/BaseGroupTemplate';

export {RemoveController} from 'Controls/_list/Controllers/RemoveController';
export {IRemovableList} from 'Controls/_list/interface/IRemovableList';
export * from 'Controls/_list/interface/IEditableList';

export {default as ItemsView, IItemsViewOptions} from 'Controls/_list/ItemsView';

export {ISiblingStrategy, ISiblingStrategyOptions} from 'Controls/_list/interface/ISiblingStrategy';

export {
    EmptyTemplate,
    GroupTemplate,
    ItemTemplate,
    View,
    BaseAction,
    Mover,
    Remover,
    DataContainer,
    IDataOptions,

    EditingTemplate,
    // TODO: Удалить по https://online.sbis.ru/opendoc.html?guid=d63d6b23-e271-4d0b-a015-1ad37408b76b
    EditingTemplate as BaseEditingTemplate,
    MoneyEditingTemplate,
    NumberEditingTemplate,
    FooterTemplate,
    ItemActionsHelpers,
    ListControl,
    ListView,
    GroupContentResultsTemplate,
    BaseControl,
    IBaseControlOptions,
    ScrollEmitter,
    CssClassList,
    createClassListCollection,
    getItemsBySelection,
    LoadingIndicatorTemplate,
    ContinueSearchTemplate,
    HotKeysContainer,
    InertialScrolling,
    IVirtualScrollConfig,
    IList,
    VirtualScroll,
    ScrollController,
    IListNavigation,
    TCursor
};

import {groupConstants, IHiddenGroupPosition} from './display';
import {MultiSelectAccessibility} from './display';
import {IItemPadding, TRoundBorder} from './display';

export {groupConstants, IHiddenGroupPosition, editing, IItemPadding, TRoundBorder, MultiSelectAccessibility};
