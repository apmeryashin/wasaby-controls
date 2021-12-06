/**
 * Библиотека, содержащая базовые модули, необходимые для работы всех видов списков.
 * Должна в прямую импортироваться только списковыми контролами, все остальные контролы должны тянуть библиотеку
 * конкретного вида списка (таблица, плитка, дерево и т.п.).
 *
 * @library
 * @private
 * @author Уфимцев Д.Ю.
 */

//region interfaces
export {IList, IReloadItemOptions} from './_baseList/interface/IList';
export * from './_baseList/interface/IEditableList';
export * from 'Controls/_baseList/interface/IMovableList';
export {IVirtualScrollConfig, IDirection} from './_baseList/interface/IVirtualScroll';
export {default as IEmptyTemplateOptions} from './_baseList/interface/EmptyTemplate';
export {IRemovableList} from 'Controls/_baseList/interface/IRemovableList';
export {default as IListNavigation} from './_baseList/interface/IListNavigation';
export {IBaseGroupTemplate} from 'Controls/_baseList/interface/BaseGroupTemplate';
export {TCursor, TBackgroundColorStyle} from './_baseList/interface/BaseItemTemplate';
export {ISiblingStrategy, ISiblingStrategyOptions} from 'Controls/_baseList/interface/ISiblingStrategy';
export {IListViewOptions} from 'Controls/_baseList/ListView';
export {IMovableOptions, TBeforeMoveCallback} from 'Controls/_baseList/interface/IMovableList';
//endregion

//region templates
import ForTemplate = require('wml!Controls/_baseList/Render/For');
import ItemTemplate = require('wml!Controls/_baseList/ItemTemplate');
import GroupTemplate = require('wml!Controls/_baseList/GroupTemplate');
import NavigationButtonTemplate = require('wml!Controls/_baseList/BaseControl/NavigationButton');
import FooterTemplate = require('wml!Controls/_baseList/ListView/Footer');
import MultiSelectTemplate = require('wml!Controls/_baseList/Render/multiSelect');
import MultiSelectCircleTemplate = require('wml!Controls/_baseList/Render/CircleTemplate');
import EditingTemplate = require('wml!Controls/_baseList/EditInPlace/EditingTemplate');
import MoneyEditingTemplate = require('wml!Controls/_baseList/EditInPlace/decorated/Money');
import NumberEditingTemplate = require('wml!Controls/_baseList/EditInPlace/decorated/Number');

export {
    ForTemplate,
    ItemTemplate,
    GroupTemplate,
    NavigationButtonTemplate,
    FooterTemplate,
    EditingTemplate,
    // TODO: Удалить по https://online.sbis.ru/opendoc.html?guid=d63d6b23-e271-4d0b-a015-1ad37408b76b
    EditingTemplate as BaseEditingTemplate,
    MultiSelectTemplate,
    MultiSelectCircleTemplate,
    MoneyEditingTemplate,
    NumberEditingTemplate
};
//endregion

//region controls
import ListView = require('Controls/_baseList/ListView');
import ScrollEmitter = require('Controls/_baseList/BaseControl/Scroll/Emitter');

export {
    ListView,
    ScrollEmitter
};

export {default as View} from 'Controls/_baseList/List';
export {default as DataContainer, IDataOptions} from 'Controls/_baseList/Data';
export {default as ItemsView, IItemsViewOptions} from 'Controls/_baseList/ItemsView';
export {
    IBaseControlOptions,
    default as ListControl,
    default as BaseControl,
    LIST_EDITING_CONSTANTS as editing
} from 'Controls/_baseList/BaseControl';
//endregion

//region utils
export * from './_baseList/resources/utils/helpers';
export {getItemsBySelection} from './_baseList/resources/utils/getItemsBySelection';
export {default as InertialScrolling} from './_baseList/resources/utils/InertialScrolling';
export {CssClassList, createClassListCollection} from './_baseList/resources/utils/CssClassList';
//endregion

//region controllers
export * from './_baseList/Controllers/Grouping';
export {default as ScrollController, IScrollParams} from './_baseList/ScrollController';
export {RemoveController} from 'Controls/_baseList/Controllers/RemoveController';
export {default as VirtualScroll} from './_baseList/ScrollContainer/VirtualScroll';
export {MoveController, IMoveControllerOptions}  from 'Controls/_baseList/Controllers/MoveController';
//endregion

//region new scroll
export {
    AbstractListVirtualScrollController,
    IAbstractListVirtualScrollControllerOptions
} from './_baseList/Controllers/AbstractListVirtualScrollController';

export {
    ScrollController as NewScrollController,
    IScrollControllerOptions,
    IDirection as IDirectionNew,
    IPlaceholders,
    IEdgeItem,
    IEdgeItemCalculatingParams,
    IHasItemsOutRange,
    IItemsRange,
    IScheduledScrollParams,
    IScheduledScrollToElementParams
} from './_baseList/Controllers/ScrollController/ScrollController';
export {
    IItemSize,
    AbstractItemsSizesController,
    IAbstractItemsSizesControllerOptions
} from './_baseList/Controllers/ScrollController/ItemsSizeController/AbstractItemsSizeController';
export {
    AbstractObserversController,
    IAbstractObserversControllerOptions,
    TIntersectionEvent
} from './_baseList/Controllers/ScrollController/ObserverController/AbstractObserversController';
//endregion

// region Indicators
export * as IndicatorTemplate from 'wml!Controls/_baseList/indicators/IndicatorTemplate';
export * as LoadingIndicatorItemTemplate from 'wml!Controls/_baseList/indicators/LoadingIndicatorTemplate';
export * as LoadingIndicatorTemplate from 'wml!Controls/_baseList/indicators/PortionedSearchTemplate';
export * as ContinueSearchTemplate from 'wml!Controls/_baseList/indicators/ContinueSearchTemplate';
// endregion Indicators

export {groupConstants, IHiddenGroupPosition, IItemPadding, MultiSelectAccessibility} from './display';
