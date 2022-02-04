//#region Imports
import rk = require('i18n!Controls');
import cClone = require('Core/core-clone');
import cInstance = require('Core/core-instance');

import BaseControlTpl = require('wml!Controls/_baseList/BaseControl/BaseControl');
import 'css!Controls/baseList';
import 'css!Controls/itemActions';
import 'css!Controls/CommonClasses';

// Core imports
import {Control, IControlOptions} from 'UI/Base';

import {constants, detection} from 'Env/Env';

import {IObservable, RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';
import {CrudEntityKey, DataSet, LOCAL_MOVE_POSITION, Memory} from 'Types/source';
import {throttle} from 'Types/function';
import {create as diCreate} from 'Types/di';
import {Guid, Model} from 'Types/entity';
import {IHashMap} from 'Types/declarations';

import {SyntheticEvent} from 'Vdom/Vdom';
import {Container as ValidateContainer, ControllerClass} from 'Controls/validate';
import {Logger} from 'UI/Utils';
import {Object as EventObject} from 'Env/Event';

import {TouchDetect} from 'Env/Touch';
import {
    groupUtil,
    isEqualItems,
    ISourceControllerOptions,
    NewSourceController as SourceController
} from 'Controls/dataSource';
import {
    Direction,
    IBaseSourceConfig,
    INavigationOptionValue,
    INavigationSourceConfig,
    ISelectionObject,
    ISourceOptions,
    TKey,
    TNavigationButtonView
} from 'Controls/interface';
import {isLeftMouseButton, Sticky} from 'Controls/popup';
import {process} from 'Controls/error';

// Utils imports
import {EventUtils} from 'UI/Events';
import {DimensionsMeasurer, getDimensions as uDimension} from 'Controls/sizeUtils';
import {
    Collection,
    CollectionItem,
    groupConstants,
    IDragPosition,
    IEditableCollectionItem,
    MoreButtonVisibility,
    TItemKey,
    TreeItem
} from 'Controls/display';

import {default as ItemContainerGetter} from 'Controls/_baseList/itemsStrategy/getItemContainerByIndex';
import {
    Controller as ItemActionsController,
    IItemAction,
    IItemActionsOptions,
    IShownItemAction,
    ItemActionsTemplate,
    SwipeActionsTemplate,
    TItemActionShowType
} from 'Controls/itemActions';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';

import ScrollPagingController from 'Controls/_baseList/Controllers/ScrollPaging';
import * as GroupingController from 'Controls/_baseList/Controllers/Grouping';
import HoverFreeze from 'Controls/_baseList/Controllers/HoverFreeze';

import {
    CONSTANTS as EDIT_IN_PLACE_CONSTANTS,
    Controller as EditInPlaceController,
    IBeforeBeginEditCallbackParams,
    IBeforeEndEditCallbackParams,
    InputHelper as EditInPlaceInputHelper,
    JS_SELECTORS,
    TAsyncOperationResult
} from '../editInPlace';
import {IEditingConfig as IEditableListOption} from './interface/IEditableList';

import {ListVirtualScrollController} from './Controllers/ListVirtualScrollController';
import {IDirection} from './interface/IVirtualScroll';
import {
    FlatSelectionStrategy,
    IFlatSelectionStrategyOptions,
    ISelectionStrategy,
    ITreeSelectionStrategyOptions,
    SelectionController,
    TreeSelectionStrategy
} from 'Controls/multiselection';
import {MarkerController, SingleColumnStrategy} from 'Controls/marker';
import {DndController, FlatStrategy, IDragStrategyParams, TreeStrategy} from 'Controls/listDragNDrop';
import 'wml!Controls/_baseList/BaseControl/NavigationButton';

import {IList, IReloadItemOptions} from './interface/IList';
import {getStickyHeadersHeight} from 'Controls/scroll';
import {IDragObject, ItemsEntity} from 'Controls/dragnDrop';
import {ISiblingStrategy} from './interface/ISiblingStrategy';
import {FlatSiblingStrategy} from './Strategies/FlatSiblingStrategy';
import {IMoveActionOptions, Move as MoveAction, Remove as RemoveAction} from 'Controls/listCommands';
import {IMovableList} from './interface/IMovableList';
import {saveConfig} from 'Controls/Application/SettingsController';
import IndicatorsController, {
    DIRECTION_COMPATIBILITY,
    IIndicatorsControllerOptions,
    INDICATOR_HEIGHT
} from './Controllers/IndicatorsController';
import {selectionToRecord} from './resources/utils/getItemsBySelection';
import {checkReloadItemArgs} from 'Controls/_baseList/resources/utils/helpers';
import {
    DEFAULT_TRIGGER_OFFSET,
    IAdditionalTriggersOffsets
} from 'Controls/_baseList/Controllers/ScrollController/ObserverController/AbstractObserversController';
import {FadeController} from 'Controls/_baseList/Controllers/FadeController';
import type {IHasItemsOutRange} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import {getCalcMode, getScrollMode} from 'Controls/_baseList/Controllers/ScrollController/ScrollUtil';

//#endregion

//#region Const

const ERROR_MSG = {
    CANT_USE_IN_READ_ONLY: (methodName: string): string => `List is in readOnly mode. Cant use ${methodName}() in readOnly!`
};

// = 28 + 6 + 6 см controls-BaseControl_paging-Padding_theme TODO не должно такого быть, он в разных темах разный
const PAGING_PADDING = 40;

// ключ операции удаления записи
const DELETE_ACTION_KEY = 'delete';

const PAGE_SIZE_ARRAY = [{id: 1, title: '5', pageSize: 5},
    {id: 2, title: '10', pageSize: 10},
    {id: 3, title: '25', pageSize: 25},
    {id: 4, title: '50', pageSize: 50},
    {id: 5, title: '100', pageSize: 100},
    {id: 6, title: '200', pageSize: 200},
    {id: 7, title: '500', pageSize: 500}];

const
    HOT_KEYS = {
        keyDownDown: constants.key.down,
        keyDownUp: constants.key.up,
        keyDownLeft: constants.key.left,
        keyDownRight: constants.key.right,
        spaceHandler: constants.key.space,
        enterHandler: constants.key.enter,
        keyDownHome: constants.key.home,
        keyDownEnd: constants.key.end,
        keyDownPageUp: constants.key.pageUp,
        keyDownPageDown: constants.key.pageDown,
        keyDownDel: constants.key.del
    };

const INITIAL_PAGES_COUNT = 1;
const SET_MARKER_AFTER_SCROLL_DELAY = 100;
const LIMIT_DRAG_SELECTION = 100;
const PORTIONED_LOAD_META_FIELD = 'iterative';
const MIN_SCROLL_PAGING_SHOW_PROPORTION = 2;
const MAX_SCROLL_PAGING_HIDE_PROPORTION = 1;
const DRAG_SHIFT_LIMIT = 4;
const IE_MOUSEMOVE_FIX_DELAY = 50;
const DRAGGING_OFFSET = 10;
const SCROLLMOVE_DELAY = 150;
/**
 * Минимальное количество элементов, при которых должен отобразиться пэйджинг
 */
const PAGING_MIN_ELEMENTS_COUNT = 5;
const LIST_MEASURABLE_CONTAINER_SELECTOR = 'js-controls-ListView__measurableContainer';
const ITEM_ACTION_SELECTOR = '.js-controls-ItemActions__ItemAction';
const LOADING_TRIGGER_SELECTOR = '.controls-BaseControl__loadingTrigger';
//#endregion

//#region Types

/**
 * Набор констант, используемых при работе с {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактированием по месту}.
 * @class Controls/list:editing
 * @public
 */
export const LIST_EDITING_CONSTANTS = {
    /**
     * С помощью этой константы можно отменить или пропустить запуск {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования по месту}.
     * Для этого константу следует вернуть из обработчика события {@link Controls/list:IEditableList#beforeBeginEdit beforeBeginEdit}.
     * При последовательном редактировании записей (при переходе через Tab, Enter, Arrow Down и Up) возврат константы CANCEL приведет к отмене запуска
     * редактирования по месту и попытке старта редактирования следующей записи в направлении перехода.
     * В остальных случаях возврат константы CANCEL приведет к отмене запуска редактирования в списке.
     */
    /*
     * Constant that can be returned in {@link Controls/list:IEditableList#beforeBeginEdit beforeBeginEdit} to cancel editing
     */
    CANCEL: EDIT_IN_PLACE_CONSTANTS.CANCEL
};

interface IAnimationEvent extends Event {
    animationName: string;
}

type CancelableError = Error & { canceled?: boolean, isCanceled?: boolean };
type TMarkerMoveDirection = 'Bottom' | 'Up' | 'Left' | 'Right' | 'Forward' | 'Backward';

interface IBeginEditOptions {
    shouldActivateInput?: boolean;
    columnIndex?: number;
}

interface IBeginAddOptions {
    shouldActivateInput?: boolean;
    addPosition?: 'top' | 'bottom';
    targetItem?: Model;
    columnIndex?: number;
}

interface IScrollParams {
    clientHeight: number;
    scrollTop: number;
    scrollHeight: number;
    rect?: DOMRect;
}

//#endregion

const _private = {
    getItemActionsMenuConfig(self, item, event, action, isContextMenu): Record<string, any> {
        const itemActionsController = _private.getItemActionsController(self, self._options);
        const defaultMenuConfig = itemActionsController.prepareActionsMenuConfig(
            item, event, action, self, isContextMenu
        );
        const menuConfig = self._children?.listView?.getActionsMenuConfig?.(
            item,
            event,
            action,
            isContextMenu,
            defaultMenuConfig,
            self._listViewModel?.getItemDataByItem ? self._listViewModel.getItemDataByItem(item) : item);
        return menuConfig || defaultMenuConfig;
    },
    getItemActionsController(self, options: IList): ItemActionsController {
        // При существующем контроллере нам не нужны дополнительные проверки как при инициализации.
        // Например, может потребоваться продолжение работы с контроллером после показа ошибки в Popup окне,
        // когда _error не зануляется.
        if (self._itemActionsController) {
            return self._itemActionsController;
        }
        // Проверки на __error не хватает, так как реактивность работает не мгновенно, и это состояние может не
        // соответствовать опциям error.Container. Нужно смотреть по текущей ситуации на наличие ItemActions
        if (self._sourceController?.getLoadError() || !self._listViewModel) {
            return;
        }
        const editingConfig = self._listViewModel.getEditingConfig();
        // Если нет опций записи, проперти, стрелка редактирования скрыта,
        // и тулбар для редактируемой записи выставлен в false,
        // то не надо инициализировать контроллер
        if (
            (options && !options.itemActions && !options.itemActionsProperty) &&
            !editingConfig?.toolbarVisibility &&
            !(options.showEditArrow && TouchDetect.getInstance().isTouch())
        ) {
            return;
        }

        self._itemActionsController = new ItemActionsController();

        return self._itemActionsController;
    },

    isNewModelItemsChange: (action, newItems) => {
        return action && (action !== 'ch' || newItems && !newItems.properties);
    },
    checkDeprecated(cfg) {
        if (cfg.historyIdCollapsedGroups) {
            Logger.warn('IGrouped: Option "historyIdCollapsedGroups" is deprecated and removed in 19.200. Use option "groupHistoryId".');
        }
        if (cfg.navigation &&
            cfg.navigation.viewConfig &&
            cfg.navigation.viewConfig.pagingMode === 'direct') {
            Logger.warn('INavigation: The "direct" value in "pagingMode" was deprecated and removed in 21.1000. Use the value "basic".');
        }
    },

    doAfterRender(self: BaseControl, callback): void {
        if (self.callbackAfterRender) {
            self.callbackAfterRender.push(callback);
        } else {
            self.callbackAfterRender = [callback];
        }
    },

    // Attention! Вызывать эту функцию запрещено! Исключение - методы reload, onScrollHide, onScrollShow.
    // Функция предназначена для выполнения каллбека после завершения цикла обновления.
    // Цикл обновления - это последовательный вызов beforeUpdate -> afterUpdate.
    // И вот посреди этого цикла нельзя менять модель, иначе beforeUpdate отработает по одному состоянию, а
    // afterUpdate уже совсем по другому!
    // Как сделать правильно: нужно переписать BaseControl таким образом, чтобы items спускались в него из HOC.
    // Примеры возникающих ошибок при обновлении items между beforeUpdate и afterUpdate:
    // https://online.sbis.ru/opendoc.html?guid=487d70ed-ba64-48b4-ad14-138b576cb9c4
    // https://online.sbis.ru/opendoc.html?guid=21fe75c0-62b8-4caf-9442-826827f73cd0
    // https://online.sbis.ru/opendoc.html?guid=8a839900-ebc0-4dad-9b53-225f0c337580
    // https://online.sbis.ru/opendoc.html?guid=dbaaabae-fcca-4c79-9c92-0f7fa2e70184
    // https://online.sbis.ru/opendoc.html?guid=b6715c2a-704a-414b-b764-ea2aa4b9776b
    // p.s. в первой ошибке также прикреплены скрины консоли.
    doAfterUpdate(self, callback, beforePaint = true): void {
        if (self._updateInProgress) {
            if (!beforePaint) {
                if (self._callbackAfterUpdate) {
                    self._callbackAfterUpdate.push(callback);
                } else {
                    self._callbackAfterUpdate = [callback];
                }
            } else {
                _private.doAfterRender(self, callback);
            }
        } else {
            callback();
        }
    },

    setReloadingState(self, state): void {
        const view = self._children && self._children.listView;
        if (view && view.setReloadingState) {
            view.setReloadingState(state);
        }
    },

    assignItemsToModel(self: BaseControl, items: RecordSet, newOptions: IBaseControlOptions): void {
        const listModel = self._listViewModel;
        const oldCollection = listModel.getCollection();

        // TODO restore marker + maybe should recreate the model completely
        if (!isEqualItems(oldCollection, items) || oldCollection !== items) {
            self._onItemsReady(newOptions, items);

            listModel.setCollection(items);
            if (self._options.itemsSetCallback) {
                self._options.itemsSetCallback(items);
            }

            self._afterItemsSet(newOptions);
        }

        // При старой модели зовется из модели. Нужен чтобы в explorer поменять модель только уже при наличии данных
        if (self._options.itemsSetCallback) {
            self._options.itemsSetCallback(items);
        }

        self._items = listModel.getCollection();
    },

    executeAfterReloadCallbacks(self, loadedList, options): void {
        self._afterReloadCallback(options, loadedList);
    },

    callDataLoadCallbackCompatibility(self, items, direction, options): void {
        if (self._sourceController && options.dataLoadCallback) {
            const sourceControllerDataLoadCallback = self._sourceController.getState().dataLoadCallback;

            if (sourceControllerDataLoadCallback !== options.dataLoadCallback) {
                options.dataLoadCallback(items, direction);
            }
        }
    },

    initializeModel(self: BaseControl, options: IBaseControlOptions, data: RecordSet): void {
        // Модели могло изначально не создаться (не передали receivedState и source)
        // https://online.sbis.ru/opendoc.html?guid=79e62139-de7a-43f1-9a2c-290317d848d0
        if (!self._destroyed) {
            let items = data;
            const hasItems = !!items;

            // Если нет items, то мы все равно должны создать модель. Для модели опция collection обязательная.
            // Поэтому инициализируем ее пустым рекордсетом. Модель нужна всегда, т.к. через нее отображаются:
            // хедеры, футеры, индикаторы.
            if (!hasItems) {
                items = new RecordSet();
            }

            self._items = items;

            if (hasItems) {
                self._onItemsReady(options, items);
            }

            if (options.collection) {
                self._listViewModel = options.collection;
            } else {
                self._listViewModel = self._createNewModel(
                    items,
                    options,
                    options.viewModelConstructor
                );
            }
            if (hasItems) {
                self._afterItemsSet(options);
            }

            _private.initListViewModelHandler(self, self._listViewModel);

            _private.prepareFooter(self, options, self._sourceController);

            self._shouldNotifyOnDrawItems = true;
        }
    },

    resetScrollAfterLoad(self): void {
        if (self._isMounted && self._isScrollShown && !self._wasScrollToEnd) {
            self._listVirtualScrollController.disableKeepScrollPosition();
        }
    },

    hasDataBeforeLoad(self): boolean {
        return self._isMounted && self._listViewModel && self._listViewModel.getCount();
    },

    hasMoreDataInAnyDirection(self): boolean {
        return self._hasMoreData('up') ||
            self._hasMoreData('down');
    },

    getHasMoreData(self): {up: boolean, down: boolean} {
        return {
            up: self._hasMoreData('up'),
            down: self._hasMoreData('down')
        };
    },

    validateSourceControllerOptions(self, options): void {
        const sourceControllerState = self._sourceController.getState();
        const validateIfOptionsIsSetOnBothControls = (optionName) => {
            if (sourceControllerState[optionName] &&
                options[optionName] &&
                sourceControllerState[optionName] !== options[optionName]) {
                Logger.warn(`BaseControl: для корректной работы опцию ${optionName} необходимо задавать на Layout/browser:Browser (Controls/list:DataContainer)`);
            }
        };
        const validateIfOptionsIsSetOnlyOnList = (optionName) => {
            if (options[optionName] && !sourceControllerState[optionName]) {
                Logger.warn(`BaseControl: для корректной работы опцию ${optionName} необходимо задавать на Layout/browser:Browser (Controls/list:DataContainer)`);
            }
        };
        const optionsToValidateOnBoth = ['source', 'navigation', 'sorting', 'root'];
        const optionsToValidateOnlyOnList = ['source', 'navigation', 'sorting', 'dataLoadCallback'];

        optionsToValidateOnBoth.forEach(validateIfOptionsIsSetOnBothControls);
        optionsToValidateOnlyOnList.forEach(validateIfOptionsIsSetOnlyOnList);
    },

    getAllDataCount(self): number | undefined {
        return self._listViewModel?.getCollection().getMetaData().more;
    },

    scrollToItem(self, key: TItemKey, position?: string, force?: boolean): Promise<void> {
        return self._listVirtualScrollController.scrollToItem(key, position, force);
    },

    // region key handlers

    keyDownHome(self, event) {
        event.stopPropagation();
        self._listVirtualScrollController.scrollToEdge('backward').then(self._setMarkedKeyAfterPaging);
    },

    keyDownRight(self, event) {
        self._keyDownRight(event);
    },

    keyDownLeft(self, event) {
        self._keyDownLeft(event);
    },

    keyDownEnd(self, event) {
        if (self._options.navigation?.viewConfig?.showEndButton) {
            _private.scrollToEdge(self, 'down');
        } else {
            self._listVirtualScrollController.scrollToEdge('forward').then(self._setMarkedKeyAfterPaging);
        }
    },
    keyDownPageUp(self, event) {
        // отлючаем нативное поведение и всплытие событие, чтобы нам повторно не пришло событие от Application
        event.stopPropagation();
        event.preventDefault();
        self._listVirtualScrollController.scrollToPage('backward').then(self._setMarkedKeyAfterPaging);
    },
    keyDownPageDown(self, event) {
        // отлючаем нативное поведение и всплытие событие, чтобы нам повторно не пришло событие от Application
        event.stopPropagation();
        event.preventDefault();
        self._listVirtualScrollController.scrollToPage('forward').then(self._setMarkedKeyAfterPaging);
    },

    enterHandler(self, event) {
        if (event.nativeEvent.ctrlKey || self.isEditing() || !self.getViewModel() || !self.getViewModel().getCount()) {
            return;
        }

        // При обработке Enter текущий target === fakeFocusElement.
        // Прикладникам нужен реальный target, по которому произошло событие, и который позволяет
        // определить координаты записи, например, для того, чтобы отобразить в нужном месте popup.
        // Пытаемся найти отмеченную маркером запись:
        if (_private.hasMarkerController(self)) {
            const markerController = _private.getMarkerController(self);
            const markedKey = markerController.getMarkedKey();
            if (markedKey !== null && markedKey !== undefined) {
                const markedItem = self.getItems().getRecordById(markedKey);

                // Ищем HTML-контейнер отмеченной записи по селектору
                const selector = `.${self._getItemsContainerUniqueClass()} > ` +
                    `${self._options.itemsSelector}[item-key="${markedKey}"]`;
                const target = self._getItemsContainer().querySelector(selector) as HTMLElement;

                // Создаём событие, в которое будем отдавать указанный target.
                const customEvent = new SyntheticEvent(null, {
                    type: 'click',
                    target,
                    _bubbling: false
                });

                self._notifyItemClick([customEvent, markedItem, customEvent]);

                if (event && !event.isStopped()) {
                    self._notify('itemActivate', [markedItem, customEvent], {bubbling: true});
                }
            }
        }
        event.stopImmediatePropagation();
    },

    keyDownDown(self, event): void {
        _private.moveMarkerToDirection(self, event, 'Down');
    },

    keyDownUp(self, event): void {
        _private.moveMarkerToDirection(self, event, 'Up');
    },

    spaceHandler(self: typeof BaseControl, event: SyntheticEvent): void {
        if (
            self._options.multiSelectVisibility === 'hidden' ||
            self._options.markerVisibility === 'hidden' ||
            self._spaceBlocked
        ) {
            return;
        }

        if (!self._options.checkboxReadOnly) {
            const markerController = _private.getMarkerController(self);
            let toggledItemId = markerController.getMarkedKey();
            if (toggledItemId === null || toggledItemId === undefined) {
                toggledItemId = markerController.getNextMarkedKey();
            }

            if (toggledItemId) {
                const result = _private.getSelectionController(self).toggleItem(toggledItemId);
                _private.changeSelection(self, result);

                // Пробел блокируется, пока не применем новое состояние, то есть пока не произойдет _beforeUpdate,
                // чтобы адекватно отрабатывать при зажатом пробеле
                self._spaceBlocked = true;
            }
        }
        _private.moveMarkerToDirection(self, event, 'Forward');
    },

    /**
     * Метод обработки нажатия клавиши del.
     * Работает по принципу "Если в itemActions есть кнопка удаления, то имитируем её нажатие"
     * @param self
     * @param event
     */
    keyDownDel(self, event): void {
        if (!_private.hasMarkerController(self)) {
            return;
        }

        const model = self.getViewModel();
        const toggledItemId = _private.getMarkerController(self).getMarkedKey();
        const toggledItem: CollectionItem<Model> = model.getItemBySourceKey(toggledItemId);
        if (!toggledItem) {
            return;
        }
        let itemActions = toggledItem.getActions();

        // Если itemActions были не проинициализированы, то пытаемся их проинициализировать
        if (!itemActions) {
            if (self._options.itemActionsVisibility !== 'visible') {
                _private.updateItemActions(self, self._options);
            }
            itemActions = toggledItem.getActions();
        }

        if (itemActions) {
            const deleteAction = itemActions.all.find((itemAction: IItemAction) => itemAction.id === DELETE_ACTION_KEY);
            if (deleteAction) {
                _private.handleItemActionClick(self, deleteAction, event, toggledItem, false);
                event.stopImmediatePropagation();
            }
        }
    },
    // endregion key handlers

    shouldDrawCut(navigation, items, hasMoreData): boolean {
        /*
         * Кат нужен, если есть еще данные
         * или данных больше, чем размер страницы
         */
        return _private.isCutNavigation(navigation) &&
                    (hasMoreData || items && items.getCount() > (navigation.sourceConfig.pageSize));
    },

    prepareFooter(self: BaseControl, options: IBaseControlOptions, sourceController: SourceController): void {
        // Если подгрузка данных осуществляется кликом по кнопке "Еще..." и есть что загружать, то рисуем эту кнопку
        // всегда кроме случая когда задана группировка и все группы свернуты
        if (_private.isDemandNavigation(self._navigation) && self._hasMoreData('down')) {
            self._shouldDrawNavigationButton = (options.groupingKeyCallback || options.groupProperty) ?
                !self._listViewModel.isAllGroupsCollapsed()
                : true;
        } else if (
            _private.shouldDrawCut(options.navigation,
                                   self._items,
                                   self._hasMoreData('down'))
        ) {
            self._shouldDrawNavigationButton = true;
        } else {
            self._shouldDrawNavigationButton = false;
        }

        if (self._shouldDrawNavigationButton && _private.isDemandNavigation(self._navigation)) {
            let loadedDataCount = 0;

            if (self._listViewModel) {
                // Единственный способ однозначно понять, что выводится дерево - проверить что список строится
                // по проекци для дерева.
                // TODO: должно быть убрано после того, как TreeControl будет наследоваться от BaseControl
                const display = self._listViewModel;
                loadedDataCount = display && display['[Controls/_display/Tree]'] ?
                    display.getChildren(display.getRoot()).getCount() :
                    self._items.getCount();
            }

            const allDataCount = _private.getAllDataCount(self);
            if (typeof loadedDataCount === 'number' && typeof allDataCount === 'number') {
                self._loadMoreCaption = allDataCount - loadedDataCount;
                if (self._loadMoreCaption === 0) {
                    self._shouldDrawNavigationButton = false;
                }
            } else {
                self._loadMoreCaption = '...';
            }
        }

        self._onFooterPrepared(options);
    },

    loadToDirection(self: BaseControl, direction: IDirection, receivedFilter?): Promise<RecordSet | void> | void {
        if (self._sourceController) {
            const filter: IHashMap<unknown> = cClone(receivedFilter || self._options.filter);
            if (_private.isPortionedLoad(self)) {
                const portionedSearchDirection = self._indicatorsController.getPortionedSearchDirection();
                if (direction === 'up' && portionedSearchDirection !== 'up' && !self._hasMoreData('down')) {
                    // Если включен порицонный поиск в обе стороны, то мы в первую очередь грузим данные вниз
                    // до самого конца. После этого показываем индикатор и триггер сверху. И по скроллу, если больше
                    // нет данных вниз и порционный поиск уже не идет вверх, продолжаем искать данные вверх.
                    self._indicatorsController.continueDisplayPortionedSearch('top');
                }
            } else {
                if (!self._indicatorsController.hasDisplayedIndicator()) {
                    self._displayGlobalIndicator();
                }
            }

            if (self._options.groupProperty) {
                GroupingController.prepareFilterCollapsedGroups(self._listViewModel.getCollapsedGroups(), filter);
            }

            self._addItemsByLoadToDirection = true;

            return self._loadItemsToDirection(direction).addCallback((addedItems) => {
                if (self._destroyed) {
                    return;
                }

                self._addItemsByLoadToDirection = false;

                if (self._indicatorsController.shouldResetDisplayPortionedSearchTimer(addedItems)) {
                    self._indicatorsController.resetDisplayPortionedSearchTimer();
                }

                _private.tryLoadToDirectionAgain(self, addedItems);

                _private.prepareFooter(self, self._options, self._sourceController);

                // После выполнения поиска мы должны поставить маркер.
                // Если выполняется порционный поиск и первый запрос не вернул ни одной записи,
                // то на событие reset список будет пустой и нам некуда будет ставить маркер.
                if (_private.hasMarkerController(self) && _private.isPortionedLoad(self)) {
                    const newMarkedKey = _private.getMarkerController(self).onCollectionReset();
                    self._changeMarkedKey(newMarkedKey);
                }
                if (!self._hasMoreData(direction)) {
                    self._updateShadowModeHandler(self._shadowVisibility);
                }

                // Пересчитывать ромашки и обновить hasMore нужно сразу после загрузки, а не по событию add, т.к.
                // например при порционном поиске последний запрос в сторону может подгрузить пустой список
                // и событие add не сработает
                const hasMoreData = _private.getHasMoreData(self);
                self._indicatorsController.setHasMoreData(hasMoreData.up, hasMoreData.down);

                // проверять что сейчас порционный поиск по метаданным нельзя,
                // т.к. в этот момент могут сказать что вниз порционный поиск закончился(metaData.iterative = false)
                const searchDirection = self._indicatorsController.getPortionedSearchDirection();
                if (searchDirection === 'down' && !hasMoreData.down && hasMoreData.up) {
                    // прекращаем показывать порционный поиск вниз, и показываем идикатор вверх,
                    // который означает что есть данные вверх. По триггеру начнем поиск вверх
                    self._indicatorsController.endDisplayPortionedSearch();

                    // если вьюпорт заполнен, то показываем индикатор вместе с триггером,
                    // иначе только триггер, чтобы не было морганий индикатора
                    const viewportFilled = self._viewSize > self._viewportSize && self._viewportSize;
                    if (viewportFilled) {
                        self._indicatorsController.displayTopIndicator(true);
                    } else {
                        self._listVirtualScrollController.setBackwardTriggerVisible(true);
                    }
                }
                // если больше нет данных заканчиваем порцоннный поиск
                if (!hasMoreData.down && !hasMoreData.up) {
                    self._indicatorsController.endDisplayPortionedSearch();
                }

                if (!_private.isPortionedLoad(self, addedItems)) {
                    self._indicatorsController.recountIndicators(direction);
                } else if (!hasMoreData[direction]) {
                    self._indicatorsController.hideIndicator(DIRECTION_COMPATIBILITY[direction]);
                }

                self._updateVirtualNavigation(self._hasItemsOutRange);

                return addedItems;
            }).addErrback((error: CancelableError) => {
                if (self._destroyed) {
                    return;
                }

                self._handleLoadToDirection = false;

                const hideIndicatorOnCancelQuery =
                    (error.isCanceled || error.canceled) &&
                    !self._sourceController?.isLoading() &&
                    !_private.isPortionedLoad(self);

                if (hideIndicatorOnCancelQuery) {
                    // при пересчете скроем все ненужые индикаторы
                    self._indicatorsController.recountIndicators(direction);
                }
                // скроллим в край списка, чтобы при ошибке загрузки данных шаблон ошибки сразу был виден
                if (!error.canceled && !error.isCanceled) {
                    // скрываем индикатор в заданном направлении, чтобы он не перекрывал ошибку
                    self._indicatorsController.hideIndicator(DIRECTION_COMPATIBILITY[direction]);
                    _private.scrollPage(self, (direction === 'up' ? 'Up' : 'Down'));
                }
            });
        }
        Logger.error('BaseControl: Source option is undefined. Can\'t load data', self);
    },

    tryLoadToDirectionAgain(self: BaseControl, loadedItems?: RecordSet, newOptions?: IBaseControlOptions): void {
        if (self._destroyed) {
            return;
        }
        const items = loadedItems || self._items;
        const options = newOptions || self._options;

        const needLoad = _private.needLoadNextPageAfterLoad(self, items, self._listViewModel, options.navigation);
        if (needLoad) {
            const filter = self._sourceController && self._sourceController.getFilter() || options.filter;
            let direction;
            if (
                _private.isPortionedLoad(self, loadedItems) &&
                self._indicatorsController.getPortionedSearchDirection()
            ) {
                direction = self._indicatorsController.getPortionedSearchDirection();
            } else if (self._hasMoreData('down')) {
                direction = 'down';
            } else if (self._hasMoreData('up')) {
                direction = 'up';
            }

            if (direction) {
                _private.loadToDirectionIfNeed(self, direction, filter);
            }
        }
    },

    getUpdatedMetaData(oldMetaData,
                       loadedMetaData,
                       navigation: INavigationOptionValue<INavigationSourceConfig>,
                       direction: 'up' | 'down') {
        if (navigation.source !== 'position' || navigation.sourceConfig.direction !== 'both') {
            return loadedMetaData;
        }
        const resultMeta = { ...loadedMetaData, more: oldMetaData.more };
        const directionMeta = direction === 'up' ? 'before' : 'after';

        resultMeta.more[directionMeta] = typeof loadedMetaData.more === 'object' ?
            loadedMetaData.more[directionMeta]
            : loadedMetaData.more;

        return resultMeta;
    },

    needLoadNextPageAfterLoad(self: BaseControl, loadedList: RecordSet, listViewModel, navigation): boolean {
        let result = false;

        if (navigation) {
            switch (navigation.view) {
                case 'infinity':
                    // todo remove loadedList.getCount() === 0 by task
                    // https://online.sbis.ru/opendoc.html?guid=909926f2-f62a-4de8-a44b-3c10006f530f
                    const allowByPortionedSearch = _private.isPortionedLoad(self, loadedList) &&
                        self._indicatorsController.shouldContinueDisplayPortionedSearch();
                    result = !loadedList || loadedList.getCount() === 0 || allowByPortionedSearch;
                    break;
                case 'maxCount':
                    result = _private.needLoadByMaxCountNavigation(listViewModel, navigation);
                    break;
            }
        }

        return  result;
    },

    needLoadByMaxCountNavigation(listViewModel, navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        let result = false;

        if (_private.isMaxCountNavigation(navigation) && _private.isMaxCountNavigationConfiguredCorrect(navigation)) {
            result = _private.isItemsCountLessThenMaxCount(
                listViewModel.getCount(),
                _private.getMaxCountFromNavigation(navigation)
            );
        }

        return result;
    },

    getMaxCountFromNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): number {
        return navigation.viewConfig.maxCountValue;
    },

    isMaxCountNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'maxCount';
    },

    isMaxCountNavigationConfiguredCorrect(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation.viewConfig && typeof navigation.viewConfig.maxCountValue === 'number';
    },

    isItemsCountLessThenMaxCount(itemsCount: number, navigationMaxCount: number): boolean {
        return navigationMaxCount >  itemsCount;
    },

    isDemandNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'demand';
    },

    isPagesNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'pages';
    },

    isInfinityNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'infinity';
    },

    isCutNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): boolean {
        return navigation && navigation.view === 'cut';
    },

    needShowShadowByNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>,
                               itemsCount: number): boolean {
        const isDemand = _private.isDemandNavigation(navigation);
        const isMaxCount = _private.isMaxCountNavigation(navigation);
        const isPages = _private.isPagesNavigation(navigation);
        const isCut = _private.isCutNavigation(navigation);
        let result = true;

        if (isDemand || isPages || isCut) {
            result = false;
        } else if (isMaxCount) {
            result = _private.isItemsCountLessThenMaxCount(itemsCount, _private.getMaxCountFromNavigation(navigation));
        }

        return result;
    },

    loadToDirectionIfNeed(self, direction, filter?: {}) {
        const sourceController = self._sourceController;
        const hasMoreData = self._hasMoreData(direction);
        const allowLoadByLoadedItems =
            _private.needScrollCalculation(self._options.navigation, self._options.virtualScrollConfig) &&
            !self._options.disableVirtualScroll
                ? !self._loadedItems || _private.isPortionedLoad(self, self._loadedItems)
                : true;
        const allowLoadBySource =
            sourceController &&
            hasMoreData &&
            !sourceController.isLoading();
        const allowLoadBySearch =
            !_private.isPortionedLoad(self) ||
            self._indicatorsController.shouldContinueDisplayPortionedSearch(direction);
        // Если перетаскиваю все записи, то не нужно подгружать данные, но если тащат несколько записей,
        // то данные подгружаем. Т.к. во время днд можно скроллить и пользователь может захотеть утащить записи
        // далеко вниз, где список еще не прогружен
        const allowLoadByDrag = !(self._dndListController?.isDragging() && self._selectionController?.isAllSelected());

        if (allowLoadBySource && allowLoadByLoadedItems && allowLoadBySearch && allowLoadByDrag) {
            _private.setHasMoreData(self._listViewModel, _private.getHasMoreData(self));

            return _private.loadToDirection(
               self,
               direction,
               filter
            );
        }
        return Promise.resolve();
    },

    scrollToEdge(self, direction) {
        let scrollToEdgePromiseResolver;
        const scrollToEdgePromise = new Promise((res) => {
            scrollToEdgePromiseResolver = res;
        });
        const hasMoreData = {
            up: self._hasMoreData('up'),
            down: self._hasMoreData('down')
        };
        if (self._hasMoreData(direction)) {

            self._resetPagingOnResetItems = false;
            let pagingMode = '';
            if (self._options.navigation && self._options.navigation.viewConfig) {
                pagingMode = self._options.navigation.viewConfig.pagingMode;
            }

            let navigationQueryConfig = self._sourceController.shiftToEdge(direction, self._options.root, pagingMode);

            // Решение проблемы загрузки достаточного количества данных для перехода в конец/начало списка
            // в зависимости от размеров экрана.
            // Из размера вьюпорта и записи мы знаем, сколько данных нам хватит.
            // Не совсем понятно, где должен быть этот код. SourceController не должен знать про
            // размеры окна, записей, и т.д. Но и список не должен сам вычислять параметры для загрузки.
            // https://online.sbis.ru/opendoc.html?guid=608aa44e-8aa5-4b79-ac90-d06ed77183a3
            const itemsOnPage = self._scrollPagingCtr?.getItemsCountOnPage();
            const metaMore = self._items.getMetaData().more;
            if (typeof metaMore === 'number' && itemsOnPage && self._options.navigation.source === 'page') {
                const pageSize = self._options.navigation.sourceConfig.pageSize;
                const page = direction === 'up' ? 0 : Math.ceil(metaMore / pageSize) - 1;
                const neededPagesCount = Math.ceil(itemsOnPage / pageSize);
                let neededPage = direction === 'up' ? 0 : 1;
                let neededPageSize = direction === 'up'
                    ? pageSize * neededPagesCount
                    : pageSize * (page - neededPagesCount);
                if (page - neededPagesCount <= neededPagesCount && direction === 'down') {
                    neededPage = 0;
                    neededPageSize = (page + 1) * pageSize;
                }
                navigationQueryConfig = {
                    ...navigationQueryConfig,
                    page: neededPage,
                    pageSize: neededPageSize
                };
            }

            // Если пейджинг уже показан, не нужно сбрасывать его при прыжке
            // к началу или концу, от этого прыжка его состояние не может
            // измениться, поэтому пейджинг не должен прятаться в любом случае
            self._shouldNotResetPagingCache = true;
            self._reload(self._options, navigationQueryConfig).then(() => {
                self._shouldNotResetPagingCache = false;

                /**
                 * Если есть ошибка, то не нужно скроллить, иначе неоднозначное поведение:
                 * иногда скролл происходит раньше, чем показана ошибка, тогда показывается ошибка внутри списка;
                 * иногда ошибка показывается раньше скролла, тогда ошибка во весь список.
                 * https://online.sbis.ru/opendoc.html?guid=ab2c30cd-895d-4b1f-8f71-cd0063e581d2
                 */
                if (!self._sourceController?.getLoadError()) {
                    if (direction === 'up') {
                        // Чтобы отрисовалась кнопка RESET в пэйджинге
                        self._scrolledToEdge = true;
                        // нужно дождаться когда отрисуются новые элементы
                        _private.doAfterRender(self, () => {
                            self._listVirtualScrollController.scrollToEdge('backward').then((key) => {
                                self._setMarkedKeyAfterPaging(key);
                                if (_private.isPagingNavigation(self._options.navigation)) {
                                    self._currentPage = 1;
                                }
                                self._scrollPagingCtr.shiftToEdge(direction, hasMoreData);
                                scrollToEdgePromiseResolver();
                            });
                        });
                    } else {
                        // TODO SCROLL тоже нужно рисовать кнопку, но надо будет тест поправить.
                        // Чтобы отрисовалась кнопка RESET в пэйджинге
                        // self._scrolledToEdge = true;
                        // нужно дождаться когда отрисуются новые элементы
                        _private.doAfterRender(self, () => {
                            self._listVirtualScrollController.scrollToEdge('forward').then((key) => {
                                self._setMarkedKeyAfterPaging(key);
                                if (_private.isPagingNavigation(self._options.navigation)) {
                                    self._currentPage = self._knownPagesCount;
                                }
                                scrollToEdgePromiseResolver();
                            });
                        });
                    }
                } else {
                    scrollToEdgePromiseResolver();
                }
            }).catch((error) => error);
        } else if (direction === 'up') {
            self._listVirtualScrollController.scrollToEdge('backward').then((key) => {
                self._scrolled = true;
                _private.updateScrollPagingButtons(self, {...self._getScrollParams(), initial: !self._scrolled});

                self._setMarkedKeyAfterPaging(key);
                if (self._scrollPagingCtr) {
                    self._currentPage = 1;
                    self._scrollPagingCtr.shiftToEdge(direction, hasMoreData);
                }
                scrollToEdgePromiseResolver();
            });
        } else {
            _private.jumpToEnd(self).then(() => {
                if (self._scrollPagingCtr) {
                    self._currentPage = self._pagingCfg.pagesCount;
                    self._scrollPagingCtr.shiftToEdge(direction, hasMoreData);
                }
                scrollToEdgePromiseResolver();
            });
        }
        return scrollToEdgePromise;
    },
    scrollPage(self, direction) {
        if (!self._scrollPageLocked) {
            const directionCompatibility = direction === 'Up' ? 'backward' : 'forward';
            self._listVirtualScrollController.scrollToPage(directionCompatibility).then((key) => {
                self._setMarkedKeyAfterPaging(key);
                /**
                 * скроллу не нужно блокироваться, если есть ошибка, потому что
                 * тогда при пэйджинге до упора не инициируется цикл обновления
                 * (не происходит подгрузки данных), а флаг снимается только после него
                 * или при ручном скролле - из-за этого пэйджинг перестает работать
                 */
                self._scrollPageLocked = !self._sourceController?.getLoadError();
            });
        }
    },

    calcViewSize(viewSize: number, pagingVisible: boolean, pagingPadding: number): number {
        return viewSize - (pagingVisible ? pagingPadding : 0);
    },
    needShowPagingByScrollSize(self, viewSize: number, viewportSize: number): boolean {
        let result = self._pagingVisible;

        // если есть Еще данные, мы не знаем сколько их всего, превышают два вьюпорта или нет и покажем пэйдджинг
        const hasMoreData = {
            up: self._hasMoreData('up'),
            down: self._hasMoreData('down')
        };

        // если мы для списка раз вычислили, что нужен пэйджинг, то возвращаем этот статус
        // это нужно для ситуации, если первая пачка данных вернула естьЕще (в этом случае пэйджинг нужен)
        // а вторая вернула мало записей и суммарный объем менее двух вьюпортов, пэйджинг не должен исчезнуть
        if (self._sourceController) {

            // если естьЕще данные, мы не знаем сколько их всего, превышают два вьюпорта или нет и покажем пэйдджинг
            // но если загрузка все еще идет (а ее мы смотрим по наличию триггера) не будем показывать пэджинг
            // далее может быть два варианта. След запрос вернет данные, тогда произойдет ресайз и мы проверим еще раз
            // след. запрос не вернет данные, а скажет ЕстьЕще: false тогда решать будет условие ниже, по высоте
            if (hasMoreData.up || hasMoreData.down) {
                result = true;

                // Если пэйджинг был показан из-за hasMore, то запоминаем это,
                // чтобы не скрыть после полной загрузки, даже если не набралось на две страницы.
                self._cachedPagingState = true;
            } else if (hasMoreData.up || hasMoreData.down) {
                self._recalcPagingVisible = true;
            }
        }

        /**
         * Правильнее будет проверять что размер viewport не равен 0.
         * Это нужно для того, чтобы пэйджинг в таком случае не отобразился.
         * viewport может быть равен 0 в том случае, когда блок скрыт через display:none, а после становится видим.
         */
        if (viewportSize !== 0) {
            let pagingPadding = self._pagingPadding;
            if (pagingPadding === null) {
                pagingPadding = self._isPagingPadding() ? PAGING_PADDING : 0;
            }
            const scrollHeight = Math.max(_private.calcViewSize(viewSize, result, pagingPadding), 0);
            const proportion = (scrollHeight / viewportSize);

            if (proportion > 0) {

                // начиличе пэйджинга зависит от того превышают данные два вьюпорта или нет
                if (!result) {
                    result = proportion >= MIN_SCROLL_PAGING_SHOW_PROPORTION;
                }

                // если все данные поместились на один экран, то скрываем пэйджинг
                if (result) {
                    result = proportion > MAX_SCROLL_PAGING_HIDE_PROPORTION;
                }
            } else {
                self._cachedPagingState = false;
                result = false;
            }

        } else {
            result = false;
        }

        if (self._cachedPagingState === true) {
            result = true;
        }

        if (!self._scrollPagingCtr && result && _private.needScrollPaging(self._options.navigation)) {
            _private.createScrollPagingController(self, hasMoreData);
        }
        return result;
    },

    onScrollShow(self, params) {
        _private.doAfterUpdate(self, () => {
            self._isScrollShown = true;

            self._viewSize = _private.getViewSize(self, true);

            if (_private.needScrollPaging(self._options.navigation)) {
                _private.getScrollPagingControllerWithCallback(self, (scrollPagingCtr) => {
                    self._scrollPagingCtr = scrollPagingCtr;
                });
            }

        });
    },

    onScrollHide(self) {
        _private.doAfterUpdate(self, () => {
            if (self._pagingVisible) {
                self._pagingVisible = false;
                if (self._cachedPagingState) {
                    self._recalcPagingVisible = true;
                }
                self._cachedPagingState = false;
                self._forceUpdate();
            }
            self._isScrollShown = false;
        });
    },
    getScrollPagingControllerWithCallback(self, callback) {
        if (self._scrollPagingCtr) {
            callback(self._scrollPagingCtr);
        } else {
            if (self._pagingVisible) {
                const hasMoreData = {
                    up: self._hasMoreData('up'),
                    down: self._hasMoreData('down')
                };
                _private.createScrollPagingController(self, hasMoreData).then((scrollPaging) => {
                        self._scrollPagingCtr = scrollPaging;
                        callback(scrollPaging);
                    });
                }
        }
    },
    createScrollPagingController(self, hasMoreData) {
        let elementsCount;
        const scrollParams = self._getScrollParams();
        if (self._sourceController) {
            elementsCount = _private.getAllDataCount(self);
            if (typeof elementsCount !== 'number') {
                elementsCount = undefined;
            }
        }
        const scrollPagingConfig = {
            pagingMode: self._options.navigation.viewConfig.pagingMode,
            scrollParams: {...scrollParams, initial: true},
            showEndButton: self._options.navigation.viewConfig.showEndButton,
            resetButtonMode: self._options.navigation.viewConfig.resetButtonMode,
            totalElementsCount: elementsCount,
            loadedElementsCount: self._listViewModel.getStopIndex() - self._listViewModel.getStartIndex(),
            pagingCfgTrigger: (cfg) => {
                if (cfg?.selectedPage !== self._currentPage && !self._selectedPageHasChanged) {
                    self._currentPage = cfg.selectedPage;
                } else {
                    self._selectedPageHasChanged = false;
                }
                if (!isEqual(self._pagingCfg, cfg)) {
                    self._pagingCfg = cfg;
                    self._forceUpdate();
                }
            }
        };
        self._scrollPagingCtr = new ScrollPagingController(scrollPagingConfig, hasMoreData);
        return Promise.resolve(self._scrollPagingCtr);
    },

    getViewRect(self): DOMRect {
        if (!self._viewRect) {
            const container = self._container[0] || self._container;
            self._viewRect = container.getBoundingClientRect();
        }
        return self._viewRect;
    },

    getViewSize(self, update = false): number {
        // TODO: Распутать эту страннейшую логику обновления размеров, ресайза по сути, в методе
        //  [GET]ViewSize. Это явно должно быть отдельно, но пока это единственная точка ресайза контента.
        if (self._container && !self._viewWidth) {
            const container = self._children?.viewContainer || self._container[0] || self._container;
            if (
                self._viewSize !== container.clientHeight ||
                self._viewWidth !== container.clientWidth
            ) {
                self._onContentResized(container.clientWidth, container.clientHeight);
            }
        }
        if (self._container && (!self._viewSize || update)) {
            const container = self._children?.viewContainer || self._container[0] || self._container;
            if (self._viewSize !== container.clientHeight) {
                self._notify('controlResize', [], { bubbling: true });
            }
            self._viewSize = container.clientHeight;
            self._listVirtualScrollController.contentResized(self._viewSize);
            self._updateViewportFilledInIndicatorsController();
        }
        return self._viewSize;
    },

    updateScrollPagingButtons(self, scrollParams) {
        _private.getScrollPagingControllerWithCallback(self, (scrollPaging) => {
            const hasMoreData = {
                up: self._hasMoreData('up'),
                down: self._hasMoreData('down')
            };
            scrollPaging.updateScrollParams(scrollParams, hasMoreData);
        });
    },

    /**
     * Обработать прокрутку списка виртуальным скроллом
     */
    handleListScroll(self, params) {
        if (_private.hasHoverFreezeController(self) && _private.isAllowedHoverFreeze(self)) {
            self._hoverFreezeController.unfreezeHover();
        }
        self._scrollPageLocked = false;
    },

    getTopOffsetForItemsContainer(self, itemsContainer) {
        let offsetTop = uDimension(itemsContainer.children[0], true).top;
        const container = self._container[0] || self._container;
        offsetTop += container.offsetTop - uDimension(container).top;
        return offsetTop;
    },

    // throttle нужен, чтобы при потоке одинаковых событий не пересчитывать состояние на каждое из них
    throttledVirtualScrollPositionChanged: throttle((self, params) => {
        self._listVirtualScrollController.virtualScrollPositionChange(params.scrollTop, params.applyScrollTopCallback);
    }, SCROLLMOVE_DELAY, true),

    /**
     * Инициализируем paging если он не создан
     * @private
     */
    initPaging(self) {
        if (!(self._editInPlaceController && self._editInPlaceController.isEditing())
            && _private.needScrollPaging(self._options.navigation)) {
            if (self._viewportSize) {
                self._recalcPagingVisible = false;
                self._pagingVisible = _private.needShowPagingByScrollSize(
                    self, _private.getViewSize(self), self._viewportSize
                );
                self._pagingVisibilityChanged = self._pagingVisible;
                if (detection.isMobilePlatform) {
                    self._recalcPagingVisible = !self._pagingVisible;
                }
            } else {
                self._recalcPagingVisible = true;
            }
        } else {
            self._pagingVisible = false;
        }
    },

    handleListScrollSync(self, scrollTop) {
        if (!self._pagingVisible) {
            _private.initPaging(self);
        }

        if (!self._scrollControllerInitializeChangeScroll || self._scrolledToEdge) {
            self._scrolled = true;
        }
        // TODO SCROLL избавиться от scrollTop в BaseControl
        // на мобильных устройствах с overflow scrolling, scrollTop может быть отрицательным
        self._scrollTop = scrollTop > 0 ? scrollTop : 0;
        self._scrollPageLocked = false;
        if (_private.needScrollPaging(self._options.navigation)) {
            _private.updateScrollPagingButtons(self, {...self._getScrollParams(), initial: !self._scrolled});
        }

        self._scrollControllerInitializeChangeScroll = false;
        self._scrolledToEdge = false;
    },

    disablePagingNextButtons(self): void {
        if (self._pagingVisible) {
            self._pagingCfg = {...self._pagingCfg};
            self._pagingCfg.arrowState.next = self._pagingCfg.arrowState.end = 'readonly';
        }
    },

    isPortionedLoad(self, items: RecordSet = self._items): boolean {
        const metaData = items && items.getMetaData();
        return !!(metaData && metaData[PORTIONED_LOAD_META_FIELD]);
    },

    allowLoadMoreByPortionedSearch(self, direction: 'up'|'down'): boolean {
        const portionedSearchDirection = self._indicatorsController.getPortionedSearchDirection();
        return (!portionedSearchDirection || portionedSearchDirection !== direction) &&
            self._indicatorsController.shouldContinueDisplayPortionedSearch();
    },

    updateShadowMode(self, shadowVisibility: {up: boolean, down: boolean}): void {
        const itemsCount = self._listViewModel && self._listViewModel.getCount();
        const hasMoreData = (direction) => self._hasMoreData(direction);
        const showShadowByNavigation = _private.needShowShadowByNavigation(self._options.navigation, itemsCount);
        const showShadowUpByPortionedSearch = _private.allowLoadMoreByPortionedSearch(self, 'up');
        const showShadowDownByPortionedSearch = _private.allowLoadMoreByPortionedSearch(self, 'down');

        self._notify('updateShadowMode', [{
            top: (shadowVisibility?.up ||
                showShadowByNavigation &&
                showShadowUpByPortionedSearch && itemsCount && hasMoreData('up')) ? 'visible' : 'auto',
            bottom: (shadowVisibility?.down ||
                showShadowByNavigation &&
                showShadowDownByPortionedSearch && itemsCount && hasMoreData('down')) ? 'visible' : 'auto'
        }], {bubbling: true});
    },

    needScrollCalculation(navigationOpt, virtualScrollConfig) {
        // Виртуальный скролл должен работать, даже если у списка не настроена навигация.
        // https://online.sbis.ru/opendoc.html?guid=a83180cf-3e02-4d5d-b632-3d03442ceaa9
        return !navigationOpt || (
            navigationOpt && navigationOpt.view === 'infinity' || !!virtualScrollConfig?.pageSize
        );
    },

    needScrollPaging(navigationOpt) {
        return (navigationOpt &&
            navigationOpt.view === 'infinity' &&
            navigationOpt.viewConfig &&
            navigationOpt.viewConfig.pagingMode &&
            navigationOpt.viewConfig.pagingMode !== 'hidden'
        );
    },

    getItemsCount(self) {
        return self._listViewModel ? self._listViewModel.getCount() : 0;
    },

    /**
     * Закрывает меню опций записи у активной записи, если она есть в списке изменённых или удалённых
     * @param self
     * @param items список изменённых или удалённых из модели записей
     */
    closeItemActionsMenuForActiveItem(self: typeof BaseControl, items: Array<CollectionItem<Model>>): void {
        const activeItem = self._itemActionsController.getActiveItem();
        let activeItemContents;
        if (activeItem) {
            activeItemContents = _private.getPlainItemContents(activeItem);
        }
        if (activeItemContents && items && items.find((item) => {
            if (!item.ItemActionsItem) {
                return false;
            }
            const itemContents = _private.getPlainItemContents(item);
            return itemContents?.getKey() === activeItemContents.getKey();
        })) {
            _private.closeActionsMenu(self);
        }
    },

    onCollectionChanged(
        self: any,
        event: SyntheticEvent,
        changesType: string,
        action: string,
        newItems: Array<CollectionItem<Model>>,
        newItemsIndex: number,
        removedItems: Array<CollectionItem<Model>>,
        removedItemsIndex: number,
        reason: string
    ): void {

        // TODO Понять, какое ускорение мы получим, если будем лучше фильтровать
        // изменения по changesType в новой модели
        const newModelChanged = _private.isNewModelItemsChange(action, newItems);
        if (self._pagingNavigation) {
            if (action === IObservable.ACTION_REMOVE || action === IObservable.ACTION_ADD) {
                _private.updatePagingDataByItemsChanged(self, newItems, removedItems);
            }
            if (action === IObservable.ACTION_RESET) {
                if (self._updatePagingOnResetItems) {
                    self._knownPagesCount = INITIAL_PAGES_COUNT;
                    _private.updatePagingData(self, self._items.getMetaData().more, self._options);
                }
                self._updatePagingOnResetItems = true;
            }
        }
        if (changesType === 'collectionChanged' || newModelChanged) {
            // TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
            // Берем self._navigation вместо self._options.navigation,
            // т.к. onCollectionChanged может сработать до Control::saveOptions и опции будут неактуальны
            if (self._navigation && self._navigation.source) {
                const itemsCount = self._listViewModel.getCount();
                const moreMetaCount = _private.getAllDataCount(self);

                if (typeof moreMetaCount === 'number') {
                    if (itemsCount !== moreMetaCount) {
                        _private.prepareFooter(self, self._options, self._sourceController);
                    } else {
                        self._shouldDrawNavigationButton = _private.isCutNavigation(self._navigation) ?
                            self._cutExpanded : false;
                    }
                } else if (moreMetaCount) {
                    _private.prepareFooter(self, self._options, self._sourceController);
                } else {
                    self._shouldDrawNavigationButton = _private.isCutNavigation(self._navigation) ?
                        self._cutExpanded : false;
                }
            }

            self._onCollectionChangedScroll(action, newItems, newItemsIndex, removedItems, removedItemsIndex);

            if (self._indicatorsController) {
                switch (action) {
                    case IObservable.ACTION_RESET:
                        self._indicatorsControllerOnCollectionReset();
                        break;
                    case IObservable.ACTION_ADD:
                        self._indicatorsController.onCollectionAdd();
                        break;
                }
            }

            if (reason === 'assign' && self._options.itemsSetCallback) {
                self._options.itemsSetCallback();
            }

            if (self._scrollPagingCtr && action === IObservable.ACTION_RESET) {
                if (self._resetPagingOnResetItems) {
                    self._scrollPagingCtr = null;
                }
                self._resetPagingOnResetItems = true;
            }

            // Обработка удаления должна происходить на afterCollectionChanged.
            // Это позволяет при удалении записей в цикле по одной
            // учитывать актуальные индексы диапазона виртуального скролла,
            // и выполнять обработку selection для всех удалённых записей.
            if (action === IObservable.ACTION_REMOVE) {
                self._removedItems.push(...removedItems);
            }

            // Тут вызывается nextVersion на коллекции, и это приводит к вызову итератора.
            // Поэтому это должно быть после обработки изменений коллекции scrollController'ом, чтобы итератор
            // вызывался с актуальными индексами
            if (action === IObservable.ACTION_REMOVE ||
                action === IObservable.ACTION_REPLACE ||
                action === IObservable.ACTION_RESET) {
                if (_private.hasHoverFreezeController(self)) {
                    self._hoverFreezeController.unfreezeHover();
                }
                if (self._itemActionsMenuId) {
                    _private.closeItemActionsMenuForActiveItem(self, removedItems);
                }
            }

            // Изначально могло не создаться selectionController (не был задан source), но в целом работа с выделением
            // нужна и когда items появляются (событие reset) - обрабатываем это.
            // https://online.sbis.ru/opendoc.html?guid=454ba08b-758a-4a39-86cb-7a6d0cd30c44
            const handleSelection = action === IObservable.ACTION_RESET && self._options.selectedKeys &&
                self._options.selectedKeys.length && self._options.multiSelectVisibility !== 'hidden';
            if (_private.hasSelectionController(self) || handleSelection) {
                const selectionController = _private.getSelectionController(self);

                let newSelection;
                switch (action) {
                    case IObservable.ACTION_ADD:
                        newSelection = selectionController.onCollectionAdd(newItems, newItemsIndex);
                        self._notify(
                            'listSelectedKeysCountChanged',
                            [selectionController.getCountOfSelected(), selectionController.isAllSelected()],
                            {bubbling: true}
                        );
                        break;
                    case IObservable.ACTION_RESET:
                        // TODO удалить после того как перейдем полностью на новую модель
                        //  на reset пересоздается display, поэтому нужно обновить модель в контроллере
                        _private.updateSelectionController(self, self._options);

                        const entryPath = self._listViewModel.getCollection().getMetaData().ENTRY_PATH;
                        newSelection = selectionController.onCollectionReset(entryPath);
                        break;
                    case IObservable.ACTION_REPLACE:
                        selectionController.onCollectionReplace(newItems);
                        break;
                    case IObservable.ACTION_MOVE:
                        selectionController.onCollectionMove();
                        break;
                }

                if (newSelection) {
                    _private.changeSelection(self, newSelection);
                }
            }

            const handleMarker = action === IObservable.ACTION_RESET
                && (self._options.markerVisibility === 'visible' || self._options.markedKey !== undefined);
            if (_private.hasMarkerController(self) || handleMarker) {
                const markerController = _private.getMarkerController(self);

                let newMarkedKey;
                switch (action) {
                    case IObservable.ACTION_REMOVE:
                        newMarkedKey = markerController.onCollectionRemove(removedItemsIndex, removedItems);
                        break;
                    case IObservable.ACTION_RESET:
                        // В случае когда прислали новый ключ и в beforeUpdate вызвался reload,
                        // новый ключ нужно применить после изменения коллекции, чтобы не было лишней перерисовки
                        if (self._options.markedKey !== undefined
                                && self._options.markedKey !== markerController.getMarkedKey()) {
                            markerController.setMarkedKey(self._options.markedKey);
                        }

                        newMarkedKey = markerController.onCollectionReset();
                        break;
                    case IObservable.ACTION_ADD:
                        markerController.onCollectionAdd(newItems);
                        break;
                    case IObservable.ACTION_REPLACE:
                        markerController.onCollectionReplace(newItems);
                        break;
                    case IObservable.ACTION_CHANGE:
                        markerController.onCollectionChange(newItems);
                        break;
                }

                self._changeMarkedKey(newMarkedKey);
            }
        }

        if (changesType === 'collectionChanged' || newModelChanged) {
            self._itemsChanged = true;
            if (!!self._itemActionsController && !self._shouldUpdateActionsAfterRender) {
                self._shouldUpdateActionsAfterRender = self._itemActionsController
                    .shouldUpdateOnCollectionChange(action, newItems, removedItems);
            }
        }

        // If BaseControl hasn't mounted yet, there's no reason to call _forceUpdate
        if (self._isMounted) {
            self._forceUpdate();
        }
    },

    initListViewModelHandler(self, model) {
        if (model) {
            model.subscribe('onCollectionChange', self._onCollectionChanged);
            model.subscribe('onAfterCollectionChange', self._onAfterCollectionChanged);
            model.subscribe('indexesChanged', self._onIndexesChanged);
        }
    },

    deleteListViewModelHandler(self, model) {
        if (model) {
            model.unsubscribe('onCollectionChange', self._onCollectionChanged);
            model.unsubscribe('onAfterCollectionChange', self._onAfterCollectionChanged);
            model.unsubscribe('indexesChanged', self._onIndexesChanged);
        }
    },

    /**
     * Получает контейнер для
     * @param self
     * @param item
     * @param clickEvent
     * @param isMenuClick
     */
    resolveItemContainer(self: BaseControl,
                         item: CollectionItem, clickEvent: SyntheticEvent, isMenuClick: boolean): HTMLElement {
        if (isMenuClick) {
            return self._targetItem;
        }
        // Из-за оптимизации scroll с группировкой нельзя доверять индексам, ищем ближайшую запись по target
        if (clickEvent && clickEvent.target) {
            return clickEvent.target.closest('.controls-ListView__itemV');
        }
    },

    /**
     * Обрабатывает клик по записи и отправляет событие actionClick наверх
     * @param self
     * @param action
     * @param clickEvent
     * @param item
     * @param isMenuClick
     */
    handleItemActionClick(
        self: any,
        action: IShownItemAction,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        isMenuClick: boolean): void {
        // TODO нужно заменить на item.getContents() при переписывании моделей.
        //  item.getContents() должен возвращать Record
        //  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(item);
        const itemContainer = _private.resolveItemContainer(self, item, clickEvent, isMenuClick);
        const result = self._notify('actionClick', [action, contents, itemContainer, clickEvent.nativeEvent]);
        if (action.handler) {
            action.handler(contents);
        }
        if (result !== false) {
            _private.closeActionsMenu(self);
        }
    },

    /**
     * Открывает меню операций
     * @param self
     * @param clickEvent
     * @param item
     * @param menuConfig
     */
    openItemActionsMenu(
        self: any,
        clickEvent: SyntheticEvent<MouseEvent>,
        item: CollectionItem<Model>,
        menuConfig: Record<string, any>): Promise<void> {
        /**
         * Не во всех раскладках можно получить DOM-элемент, зная только индекс в коллекции, поэтому запоминаем тот,
         * у которого открываем меню. Потом передадим его для события actionClick.
         */
        self._targetItem = clickEvent.target.closest('.controls-ListView__itemV');
        menuConfig.eventHandlers = {
            onResult: self._onItemActionsMenuResult,
            onOpen: () => self._onItemActionsMenuResult('onOpen'),
            onClose(): void {
                // При разрушении список сам закрывает меню, пока меню закроется и отстрелит колбек,
                // список полностью разрушится.
                if (!self._destroyed) {
                    self._onItemActionsMenuClose(this);
                }
            }
        };
        return Sticky.openPopup(menuConfig).then((popupId) => {
            // Закрываем popup с текущим id на случай, если вдруг он оказался открыт
            _private.closePopup(self, self._itemActionsMenuId);
            // Устанавливаем новый Id
            self._itemActionsMenuId = popupId;
            // Нельзя устанавливать activeItem раньше, иначе при автокликах
            // робот будет открывать меню раньше, чем оно закрылось
            _private.getItemActionsController(self, self._options).setActiveItem(item);
            RegisterUtil(self, 'scroll', self._scrollHandler.bind(self));
        });
    },

    /**
     * Метод, который закрывает меню
     * @param self
     * @param currentPopup
     * @private
     */
    closeActionsMenu(self: any, currentPopup?: any): void {
        if (self._itemActionsMenuId) {
            const itemActionsMenuId = self._itemActionsMenuId;
            _private.closePopup(self, currentPopup ? currentPopup.id : itemActionsMenuId);
            // При быстром клике правой кнопкой обработчик закрытия меню и setActiveItem(null)
            // вызывается позже, чем устанавливается новый activeItem. в результате, при попытке
            // взаимодействия с опциями записи, может возникать ошибка, т.к. activeItem уже null.
            // Для обхода проблемы ставим условие, что занулять active item нужно только тогда, когда
            // закрываем самое последнее открытое меню.
            if (!currentPopup || itemActionsMenuId === currentPopup.id) {
                const itemActionsController = _private.getItemActionsController(self, self._options);
                itemActionsController.setActiveItem(null);
                itemActionsController.deactivateSwipe();
                // Если ховер заморожен для редактирования по месту, не надо сбрасывать заморозку.
                if ((!self._editInPlaceController || !self._editInPlaceController.isEditing())) {
                    _private.addShowActionsClass(self, self._options);
                }
            }
        }
    },

    openContextMenu(self: typeof BaseControl,
                    event: SyntheticEvent<MouseEvent>,
                    itemData: CollectionItem<Model>): void {
        if (!(itemData.dispItem ? itemData.dispItem.ItemActionsItem : itemData.ItemActionsItem)) {
            return;
        }

        event.stopPropagation();
        // TODO нужно заменить на item.getContents() при переписывании моделей.
        //  item.getContents() должен возвращать Record
        //  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(itemData);
        const key = contents ? contents.getKey() : itemData.key;
        self.setMarkedKey(key);

        // Этот метод вызывается также и в реестрах, где не инициализируется this._itemActionsController
        if (!!self._itemActionsController) {
            const item = self._listViewModel.getItemBySourceKey(key) || itemData;
            const menuConfig = _private.getItemActionsMenuConfig(self, item, event, null, true);
            if (menuConfig) {
                event.nativeEvent.preventDefault();
                _private.openItemActionsMenu(self, event, item, menuConfig);
            }
        }
    },

    /**
     * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
     *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
     * @param item
     */
    getPlainItemContents(item: CollectionItem<Model>) {
        let contents = item.getContents();
        if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
            contents = contents[(contents as any).length - 1];
        }
        return contents;
    },

    /**
     * Закрывает popup меню
     * @param self
     * @param itemActionsMenuId id popup, который надо закрыть. Если не указано - берём текущий self._itemActionsMenuId
     * иногла можно не дождавшимь показа меню случайно вызвать второе менню поверх превого.
     * Это случается от того, что поуказ меню асинхронный и возвращает Promise, который мы не можем отменить.
     * При этом закрытие меню внутри самого Promise повлечёт за собой асинхронный вызов "_onItemActionsMenuClose()",
     * что приведёт к закрытию всех текущих popup на странице.
     * Зато мы можем получить объект Popup, который мы пытаемся закрыть, и, соответственно, его id. Таким образом, мы можем
     * указать, какой именно popup мы закрываем.
     */
    closePopup(self, itemActionsMenuId?: string): void {
        const id = itemActionsMenuId || self._itemActionsMenuId;
        if (id) {
            Sticky.closePopup(id);
        }
        if (!itemActionsMenuId || (self._itemActionsMenuId && self._itemActionsMenuId === itemActionsMenuId)) {
            UnregisterUtil(self, 'scroll');
            self._itemActionsMenuId = null;
        }
    },

    bindHandlers(self): void {
        self._onItemActionsMenuClose = self._onItemActionsMenuClose.bind(self);
        self._onItemActionsMenuResult = self._onItemActionsMenuResult.bind(self);
    },

    groupsExpandChangeHandler(self, changes): void {
        self._notify(
            changes.changeType === 'expand' ? 'groupExpanded' : 'groupCollapsed',
            [changes.group],
            {bubbling: true}
        );
        self._notify('collapsedGroupsChanged', [changes.collapsedGroups]);
        _private.prepareFooter(self, self._options, self._sourceController);
        if (self._options.historyIdCollapsedGroups || self._options.groupHistoryId) {
            groupUtil.storeCollapsedGroups(
                changes.collapsedGroups,
                self._options.historyIdCollapsedGroups || self._options.groupHistoryId
            );
        }
    },

    getSortingOnChange(currentSorting, propName) {
        let sorting = cClone(currentSorting || []);
        let sortElem;
        const newSortElem = {};

        if (sorting.length === 1 && sorting[0][propName]) {
            const elem = sorting[0];
            if (elem.hasOwnProperty(propName)) {
                sortElem = elem;
            }
        } else {
            sorting = [];
        }

        // change sorting direction by rules:
        // 'DESC' -> 'ASC'
        // 'ASC' -> empty
        // empty -> 'DESC'
        if (sortElem) {
            if (sortElem[propName] === 'DESC') {
                sortElem[propName] = 'ASC';
            } else {
                sorting = [];
            }
        } else {
            newSortElem[propName] = 'DESC';
            sorting.push(newSortElem);
        }

        return sorting;
    },

    calcPaging(self, hasMore: number | boolean, pageSize: number): number {
        let newKnownPagesCount = self._knownPagesCount;

        if (typeof hasMore === 'number') {
            newKnownPagesCount = Math.ceil(hasMore / pageSize);
        } else if (typeof hasMore === 'boolean' && hasMore && self._currentPage === self._knownPagesCount) {
            newKnownPagesCount++;
        }

        return newKnownPagesCount;
    },

    getPagingLabelData(totalItemsCount, pageSize, currentPage) {
        let pagingLabelData;
        if (typeof totalItemsCount === 'number') {
            pagingLabelData = {
                totalItemsCount,
                pageSize: pageSize.toString(),
                firstItemNumber: (currentPage - 1) * pageSize + 1,
                lastItemNumber: Math.min(currentPage * pageSize, totalItemsCount)
            };
        } else {
            pagingLabelData = null;
        }
        return pagingLabelData;
    },

    getSourceController(self, options): SourceController {
        return new SourceController({
            ...options,
            navigationParamsChangedCallback: self._notifyNavigationParamsChanged,
            keyProperty: self._keyProperty
        });
    },

    checkRequiredOptions(self, options) {
        if (!self._keyProperty) {
            Logger.error('IList: Option "keyProperty" is required.');
        }
    },

    needBottomPadding(self: BaseControl, options: IItemActionsOptions): boolean {
        const listViewModel = self._listViewModel;
        if (!listViewModel) {
            return false;
        }
        const isEditing = !!listViewModel.isEditing();
        const itemsCount = listViewModel.getCount();
        const footer = listViewModel.getFooter();
        const results = typeof listViewModel.getResults === 'function' ? listViewModel.getResults() : false;
        const hasMoreDown = self._hasMoreData('down');
        const hasHiddenItemsDown = listViewModel.getStopIndex() < itemsCount;

        return (
            (itemsCount || isEditing) &&
            options.itemActionsPosition === 'outside' &&
            !footer &&
            (!results || listViewModel.getResultsPosition() !== 'bottom') &&
            !(self._shouldDrawNavigationButton &&
                (_private.isDemandNavigation(options.navigation) || _private.isCutNavigation(options.navigation))
            ) &&
            (!hasHiddenItemsDown && !hasMoreDown || !_private.isInfinityNavigation(options.navigation))
        );
    },

    notifyNavigationParamsChanged(actualParams): void {
        if (this._isMounted) {
            this._notify('navigationParamsChanged', [actualParams]);
        }
    },

    isPagingNavigation(navigation): boolean {
        return navigation && navigation.view === 'pages';
    },

    isPagingNavigationVisible(self, hasMoreData, options) {
        const navigation = options.navigation;
        if (navigation?.viewConfig?.pagingMode === 'hidden') {
            return false;
        }

        /**
         * Не получится получать количество элементов через _private.getItemsCount,
         * так как функция возвращает количество отображаемых элементов
         */
        if (navigation && navigation.viewConfig &&
            navigation.viewConfig.totalInfo === 'extended') {
            return hasMoreData > PAGING_MIN_ELEMENTS_COUNT || hasMoreData === true;
        }

        return hasMoreData === true || self._knownPagesCount > 1;
    },

    updatePagingData(self, hasMoreData, options) {
        self._pagingCfg = {
            arrowState: {
                begin: 'visible',
                prev: 'visible',
                next: 'visible',
                end: options.navigation?.viewConfig?.showEndButton ? 'visible' : 'hidden'
            }
        };
        self._knownPagesCount = _private.calcPaging(self, hasMoreData, self._currentPageSize);
        self._pagingNavigationVisible = _private.isPagingNavigationVisible(self, hasMoreData, options);
        self._pagingLabelData = _private.getPagingLabelData(hasMoreData, self._currentPageSize, self._currentPage);
        self._selectedPageSizeKey = PAGE_SIZE_ARRAY.find((item) => item.pageSize === self._currentPageSize);
        self._selectedPageSizeKey = self._selectedPageSizeKey ? [self._selectedPageSizeKey.id] : [1];
    },

    updatePagingDataByItemsChanged(self, newItems, removedItems) {
        const countDifferece = (newItems?.length) || (- (removedItems?.length)) || 0;
        let totalItemsCount = 0;
        if (self._pagingLabelData) {
            totalItemsCount = self._pagingLabelData.totalItemsCount || 0;
        }
        const itemsCount = totalItemsCount + countDifferece;
        _private.updatePagingData(self, itemsCount, self._options);
    },

    resetPagingNavigation(self, navigation) {
        self._currentPageSize = navigation && navigation.sourceConfig && navigation.sourceConfig.pageSize || 1;

        self._knownPagesCount = self._items ? _private.calcPaging(
            self, self._items.getMetaData().more, self._currentPageSize
        ) : INITIAL_PAGES_COUNT;

        // нумерация страниц пейджинга начинается с 1, а не с 0,
        // поэтому текущая страница пейджига это страница навигации + 1
        self._currentPage = navigation && navigation.sourceConfig &&
            navigation.sourceConfig.page + 1 || INITIAL_PAGES_COUNT;
    },

    initializeNavigation(self, cfg) {
        self._pagingNavigation = _private.isPagingNavigation(cfg.navigation);
        // Кнопка Еще в футере рисуется по навигации, ее пересчет происходит и в onCollectionChanged,
        // который может вызваться до Control::saveOptions и пересчет будет с устаревшей навигацией
        self._navigation = cfg.navigation;

        if (!_private.isDemandNavigation(cfg.navigation) && !_private.isCutNavigation(cfg.navigation)) {
            self._shouldDrawNavigationButton = false;
        }
        if (!_private.needScrollCalculation(cfg.navigation, cfg.virtualScrollConfig)) {
            if (self._scrollPagingCtr) {
                self._scrollPagingCtr.destroy();
                self._scrollPagingCtr = null;
            }
            self._pagingCfg = null;
            if (self._pagingVisible) {
                self._pagingVisible = false;
            }
        }
        if (self._pagingNavigation) {
            _private.resetPagingNavigation(self, cfg.navigation);
            self._pageSizeSource = new Memory({
                keyProperty: 'id',
                data: PAGE_SIZE_ARRAY
            });
        } else {
            self._pagingNavigationVisible = false;
            _private.resetPagingNavigation(self, cfg.navigation);
        }
    },
    closeEditingIfPageChanged(self, oldNavigation, newNavigation) {
        const oldSourceCfg = oldNavigation && oldNavigation.sourceConfig ? oldNavigation.sourceConfig : {};
        const newSourceCfg = newNavigation && newNavigation.sourceConfig ? newNavigation.sourceConfig : {};
        if (oldSourceCfg.page !== newSourceCfg.page) {
            if (_private.isEditing(self)) {
                self._cancelEdit();
            }
        }
    },
    setHasMoreData(model, hasMoreData: object, silent: boolean = false): void {
        if (model) {
            model.setHasMoreData(hasMoreData, silent);
        }
    },
    jumpToEnd(self): Promise<void> {
        // Если в списке нет записей, то мы уже в конце списка
        if (self._listViewModel.getCount() === 0) {
            return Promise.resolve();
        }

        self._wasScrollToEnd = true;

        const hasMoreData = {
            up: self._hasMoreData('up'),
            down: self._hasMoreData('down')
        };
        if (self._scrollPagingCtr) {
            self._currentPage = self._pagingCfg.pagesCount;
            self._scrollPagingCtr.shiftToEdge('down', hasMoreData);
        }

        return self._listVirtualScrollController.scrollToEdge('forward').then((key) => {
            self._setMarkedKeyAfterPaging(key);
            _private.updateScrollPagingButtons(self, self._getScrollParams());
        });
    },

    // region Multiselection

    hasSelectionController(self: typeof BaseControl): boolean {
        return !!self._selectionController;
    },

    createSelectionController(self: any, options?: IList): SelectionController {
        options = options ? options : self._options;

        const collection = self._listViewModel.getDisplay ? self._listViewModel.getDisplay() : self._listViewModel;

        const strategy = this.createSelectionStrategy(
            options,
            collection,
            collection.getMetaData().ENTRY_PATH
        );

        self._selectionController = new SelectionController({
            model: collection,
            selectedKeys: options.selectedKeys,
            excludedKeys: options.excludedKeys,
            searchValue: options.searchValue,
            filter: options.filter,
            rootId: options.root,
            strategy
        });

        return self._selectionController;
    },

    createSelectionStrategy(options: any,
                            collection: Collection<CollectionItem<Model>>,
                            entryPath: []): ISelectionStrategy {
        const strategyOptions = this.getSelectionStrategyOptions(options, collection, entryPath);
        if (options.parentProperty) {
            return new TreeSelectionStrategy(strategyOptions);
        } else {
            return new FlatSelectionStrategy(strategyOptions);
        }
    },

    getSelectionController(self: typeof BaseControl, options?: IList): SelectionController {
        if (!self._selectionController) {
            _private.createSelectionController(self, options);
        }
        return self._selectionController;
    },

    updateSelectionController(self: typeof BaseControl, newOptions: IList): void {
        const selectionController = _private.getSelectionController(self);
        const collection = self._listViewModel.getDisplay ? self._listViewModel.getDisplay() : self._listViewModel;
        selectionController.updateOptions({
            model: collection,
            searchValue: newOptions.searchValue,
            filter: newOptions.filter,
            rootId: newOptions.root,
            strategyOptions: _private.getSelectionStrategyOptions(
                newOptions,
                collection,
                collection.getMetaData().ENTRY_PATH
            )
        });
    },

    getSelectionStrategyOptions(options: any,
                                collection: Collection<CollectionItem<Model>>,
                                entryPath: []): ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions {
        if (options.parentProperty) {
            return {
                selectDescendants: options.selectDescendants,
                selectAncestors: options.selectAncestors,
                rootId: options.root,
                model: collection,
                entryPath,
                selectionType: options.selectionType || 'all',
                selectionCountMode: options.selectionCountMode || 'all',
                recursiveSelection: options.recursiveSelection || false
            };
        } else {
            return { model: collection };
        }
    },

    onSelectedTypeChanged(typeName: string, limit: number|undefined): void {
        // Если записи удаляют при закрытия диалога, то к нам может долететь событие, уже когда список задестроился
        if (this._destroyed || this._options.multiSelectVisibility === 'hidden') {
            return;
        }

        const selectionController = _private.getSelectionController(this);
        let result;
        selectionController.setLimit(limit);

        switch (typeName) {
            case 'selectAll':
                selectionController.setLimit(0);
                result = selectionController.selectAll();
                break;
            case 'unselectAll':
                selectionController.setLimit(0);
                result = selectionController.unselectAll();
                break;
            case 'toggleAll':
                selectionController.setLimit(0);
                result = selectionController.toggleAll();
                break;
            case 'count-10':
                result = selectionController.selectAll(10);
                break;
            case 'count-25':
                result = selectionController.selectAll(25);
                break;
            case 'count-50':
                result = selectionController.selectAll(50);
                break;
            case 'count-100':
                result = selectionController.selectAll(100);
                break;
        }

        this._notify('selectedLimitChanged', [selectionController.getLimit()]);

        _private.changeSelection(this, result);
    },

    notifySelection(self: typeof BaseControl, selection: ISelectionObject): void {
        const controller = _private.getSelectionController(self);
        const selectionDifference = controller.getSelectionDifference(selection);

        const selectedDiff = selectionDifference.selectedKeysDifference;
        if (selectedDiff.added.length || selectedDiff.removed.length) {
            self._notify('selectedKeysChanged', [selectedDiff.keys, selectedDiff.added, selectedDiff.removed]);
        }

        const excludedDiff = selectionDifference.excludedKeysDifference;
        if (excludedDiff.added.length || excludedDiff.removed.length) {
            self._notify('excludedKeysChanged', [excludedDiff.keys, excludedDiff.added, excludedDiff.removed]);
        }

        // для связи с контроллером ПМО
        let selectionType = 'all';
        if (controller.isAllSelected() && self._options.nodeProperty && self._options.searchValue) {
            let onlyCrumbsInItems = true;
            self._listViewModel.each((item) => {
                if (onlyCrumbsInItems) {
                    onlyCrumbsInItems = item['[Controls/_display/BreadcrumbsItem]'];
                }
            });

            if (!onlyCrumbsInItems) {
                selectionType = 'leaf';
            }
        }
        self._notify('listSelectionTypeForAllSelectedChanged', [selectionType], {bubbling: true});
    },

    changeSelection(self: BaseControl, newSelection: ISelectionObject): Promise<ISelectionObject>|ISelectionObject {
        const controller = _private.getSelectionController(self);
        const selectionDifference = controller.getSelectionDifference(newSelection);
        let result = self._notify('beforeSelectionChanged', [selectionDifference]);

        const handleResult = (selection) => {
            _private.notifySelection(self, selection);
            if (self._options.selectedKeys === undefined) {
                controller.setSelection(selection);
            }
            self._notify(
                'listSelectedKeysCountChanged',
                [controller.getCountOfSelected(selection), controller.isAllSelected(true, selection)],
                {bubbling: true}
            );
        };

        if (result instanceof Promise) {
            result.then((selection: ISelectionObject) => handleResult(selection));
        } else if (result !== undefined) {
            handleResult(result);
        } else {
            handleResult(newSelection);
            result = newSelection;
        }

        return result;
    },

    // endregion

    getFadeController(self: BaseControl, options: IList = null): FadeController {
        if (!self._fadeController) {
            options = options ? options : self._options;
            self._fadeController = new FadeController({
                model: self._listViewModel,
                fadedKeys: options.fadedKeys
            });
        }
        return self._fadeController;
    },

    updateFadeController(self: BaseControl, options: IList): void {
        _private.getFadeController(self, options).updateOptions({
            model: self._listViewModel,
            fadedKeys: options.fadedKeys
        });
    },

    // region Marker

    hasMarkerController(self: BaseControl): boolean {
        return !!self._markerController;
    },

    getMarkerController(self: BaseControl, options: IList = null): MarkerController {
        if (!_private.hasMarkerController(self)) {
            options = options ? options : self._options;
            self._markerController = new MarkerController({
                model: self._listViewModel,
                markerVisibility: options.markerVisibility,
                markedKey: options.markedKey,
                markerStrategy: options.markerStrategy,
                moveMarkerOnScrollPaging: options.moveMarkerOnScrollPaging
            });
        }
        return self._markerController;
    },

    moveMarkerToDirection(self, event: SyntheticEvent, direction: TMarkerMoveDirection): void {
        if (self._options.markerVisibility !== 'hidden' && self._listViewModel && self._listViewModel.getCount()) {
            const isMovingForward = direction === 'Forward' || direction === 'Right' || direction === 'Down';
            // activate list when marker is moving. It let us press enter and open current row
            // must check mounted to avoid fails on unit tests
            if (self._mounted) {
                self.activate();
            }

            // чтобы предотвратить нативный подскролл
            // https://online.sbis.ru/opendoc.html?guid=c470de5c-4586-49b4-94d6-83fe71bb6ec0
            event.preventDefault();

            const controller = _private.getMarkerController(self);
            let newMarkedKey;
            if (direction === 'Backward') {
                newMarkedKey = controller.getPrevMarkedKey();
            } else if (direction === 'Forward') {
                newMarkedKey = controller.getNextMarkedKey();
            } else {
                newMarkedKey = controller.getMarkedKeyByDirection(direction);
            }
            if (newMarkedKey !== controller.getMarkedKey()) {
                const result = self._changeMarkedKey(newMarkedKey);
                if (result instanceof Promise) {
                    /**
                     * Передавая в force true, видимый элемент подскролливается наверх.
                     * https://online.sbis.ru/opendoc.html?guid=6b6973b2-31cf-4447-acaf-a64d37957bc6
                     */
                    result.then((key) => _private.scrollToItem(self, key));
                } else if (result !== undefined) {
                    const position = isMovingForward ? 'bottom' : 'top';
                    _private.scrollToItem(self, result, position, false);
                }
            }
        }
    },

    // endregion

    /**
     * Необходимо передавать опции для случая, когда в результате изменения модели меняются параметры
     * для показа ItemActions и их нужно поменять до отрисовки.
     * @param self
     * @param options
     * @private
     */
    updateItemActions(self, options: IList, editingCollectionItem?: IEditableCollectionItem): void {
        const itemActionsController =  _private.getItemActionsController(self, options);
        if (!itemActionsController) {
            return;
        }

        const editingConfig = self._listViewModel.getEditingConfig();
        const isActionsAssigned = itemActionsController.isActionsAssigned();
        let editArrowAction: IItemAction;
        if (options.showEditArrow) {
            editArrowAction = {
                id: 'view',
                icon: 'icon-Forward',
                title: rk('Просмотреть'),
                showType: TItemActionShowType.TOOLBAR,
                handler: (item) => {
                    self._notify('editArrowClick', [item]);
                }
            };
        }
        let style;
        if (options.itemActionsVisibility === 'visible') {
            style = 'transparent';
        } else {
            style = options.hoverBackgroundStyle || options.style;
        }
        const itemActionsChangeResult = itemActionsController.update({
            editingItem: editingCollectionItem as CollectionItem<Model>,
            collection: self._listViewModel,
            itemActions: options.itemActions,
            itemActionsProperty: options.itemActionsProperty,
            visibilityCallback: options.itemActionVisibilityCallback,
            itemActionsPosition: options.itemActionsPosition,
            style,
            theme: options.theme,
            actionMode: options.actionMode,
            actionAlignment: options.actionAlignment,
            actionCaptionPosition: options.actionCaptionPosition,
            itemActionsClass: options.itemActionsClass,
            iconSize: editingConfig ? 's' : 'm',
            menuIconSize: options.menuIconSize || ( editingConfig ? 's' : 'm' ),
            editingToolbarVisible: editingConfig?.toolbarVisibility,
            editingStyle: editingConfig?.backgroundStyle,
            editArrowAction,
            editArrowVisibilityCallback: options.editArrowVisibilityCallback,
            contextMenuConfig: options.contextMenuConfig,
            itemActionsVisibility: options.itemActionsVisibility,
            feature1183020440: options.feature1183020440,
            task1183329228: options.task1183329228
        });
        if (itemActionsChangeResult.length > 0 && self._listViewModel.resetCachedItemData) {
            itemActionsChangeResult.forEach((recordKey: number | string) => {
                self._listViewModel.resetCachedItemData(recordKey);
            });
            self._listViewModel.nextModelVersion(!isActionsAssigned, 'itemActionsUpdated');
        }
    },

    /**
     * Вызывает расчёт itemActions, только в том случае, если это происходит впервые
     * @private
     */
    updateItemActionsOnce(self, options: any): void {
        if (
            self._listViewModel &&
            self._options.itemActionsVisibility !== 'visible' &&
            !self._itemActionsController?.isActionsAssigned()
        ) {
            _private.updateItemActions(self, options);
        }
    },

    /**
     * Обновляет ItemActions только в случае, если они были ранее проинициализированы
     * @param self
     * @param options
     * @private
     */
    updateInitializedItemActions(self, options: any): void {
        if (self._listViewModel && self._itemActionsController?.isActionsAssigned()) {
            _private.updateItemActions(self, options);
        }
    },

    /**
     * Деактивирует свайп, если контроллер ItemActions проинициализирован
     * @param self
     */
    closeSwipe(self): void {
        if (!self._listViewModel?.destroyed && self._itemActionsController?.isActionsAssigned()) {
            _private.getItemActionsController(self, self._options).deactivateSwipe();
        }
    },

    /**
     * Метод isItemsSelectionAllowed проверяет, возможно ли выделение в списке для обработки свайпа
     * Это необходимо для корректной работы выделения на Ipad'e
     * swipe влево по записи должен ставить чекбокс, даже если multiSelectVisibility: 'hidden'.
     * Если передают selectedKeys, то точно ожидают, что выделение работает.
     * Если работают без опции selectedKeys, то работа выделения задается опцией allowMultiSelect.
     */
    isItemsSelectionAllowed(options: IBaseControlOptions): boolean {
        return options.selectedKeys || options.allowMultiSelect;
    },

    /**
     * инициализирует опции записи при загрузке контрола
     * @param self
     * @param options
     * @private
     */
    initVisibleItemActions(self, options: IList): void {
        if (options.itemActionsVisibility === 'visible') {
            _private.addShowActionsClass(self, options);
            _private.updateItemActions(self, options);
        }
    },

    // region Drag-N-Drop

    isValidDndItemsEntity(dragStartResult: ItemsEntity, dragItemKey: CrudEntityKey): boolean {
        let isValid = true;
        if (!dragStartResult.getItems()
            .every((item) => typeof item === 'string' || typeof item === 'number')) {
            Logger.error('ItemsEntity в поле items должен содержать только ключи записей.', this);
            isValid = false;
        }
        if (!dragStartResult.getItems().includes(dragItemKey)) {
            Logger.error('ItemsEntity должен содержать ключ записи, за которую начали перетаскивание.', this);
            isValid = false;
        }
        return isValid;
    },

    // возвращаем промис для юнитов
    startDragNDrop(self: BaseControl, domEvent: SyntheticEvent, draggableItem: CollectionItem): Promise<void> {
        if (
            DndController.canStartDragNDrop(
                self._options.readOnly,
                self._options.itemsDragNDrop,
                self._options.canStartDragNDrop,
                domEvent,
                self._dndListController && self._dndListController.isDragging()
            )
        ) {
            const draggableKey = draggableItem.getContents().getKey();

            // Перемещать с помощью массового выбора
            // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
            let selection = {
                selected: self._options.selectedKeys || [],
                excluded: self._options.excludedKeys || []
            };
            selection = DndController.getSelectionForDragNDrop(self._listViewModel, selection, draggableKey);

            self._dndListController =
                _private.createDndListController(self._listViewModel, draggableItem, self._options);
            const options = self._getSourceControllerOptionsForGetDraggedItems(selection);
            return self._dndListController.getDraggableKeys(selection, options).then((items) => {
                let dragStartResult = self._notify('dragStart', [items, draggableKey]);

                if (dragStartResult instanceof ItemsEntity &&
                    !_private.isValidDndItemsEntity(dragStartResult, draggableKey)) {
                    // ничего не делаем, чтобы не блочилась страница.
                    return;
                }

                if (dragStartResult === undefined) {
                    // Чтобы для работы dnd было достаточно опции itemsDragNDrop=true
                    dragStartResult = new ItemsEntity({items});
                }

                if (dragStartResult) {
                    if (self._options.dragControlId) {
                        dragStartResult.dragControlId = self._options.dragControlId;
                    }

                    self._dragEntity = dragStartResult;
                    self._draggedKey = draggableKey;
                    self._startEvent = domEvent.nativeEvent;

                    _private.clearSelectedText(self._startEvent);
                    if (self._startEvent && self._startEvent.target) {
                        self._startEvent.target.classList.add('controls-DragNDrop__dragTarget');
                    }

                    self._registerMouseMove();
                    self._registerMouseUp();
                }
            });
        }
        return Promise.resolve();
    },

    // TODO dnd когда будет наследование TreeControl <- BaseControl, правильно указать тип параметров
    createDndListController(
        model: Collection,
        draggableItem: CollectionItem,
        options: any
    ): DndController<IDragStrategyParams> {
        let strategy;
        if (options.parentProperty) {
            strategy = TreeStrategy;
        } else {
            strategy = FlatStrategy;
        }
        return new DndController(model, draggableItem, strategy);
    },

    getPageXY(event): object {
        return DimensionsMeasurer.getMouseCoordsByMouseEvent(event.nativeEvent ? event.nativeEvent : event);
    },
    isDragStarted(startEvent, moveEvent): boolean {
        const offset = _private.getDragOffset(moveEvent, startEvent);
        return Math.abs(offset.x) > DRAG_SHIFT_LIMIT || Math.abs(offset.y) > DRAG_SHIFT_LIMIT;
    },
    clearSelectedText(event): void {
        if (event.type === 'mousedown') {
            // снимаем выделение с текста иначе не будут работать клики,
            // а выделение не будет сниматься по клику из за preventDefault
            const selection = window.getSelection();
            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            } else if (selection.empty) {
                selection.empty();
            }
        }
    },
    getDragOffset(moveEvent, startEvent): object {
        const moveEventXY = _private.getPageXY(moveEvent);
        const startEventXY = _private.getPageXY(startEvent);

        return {
            y: moveEventXY.y - startEventXY.y,
            x: moveEventXY.x - startEventXY.x
        };
    },
    onMove(self, nativeEvent): void {
        if (self._startEvent) {
            const dragObject = self._getDragObject(nativeEvent, self._startEvent);
            if (
                (!self._dndListController || !self._dndListController.isDragging()) &&
                _private.isDragStarted(self._startEvent, nativeEvent)
            ) {
                self._insideDragging = true;
                self._notify('_documentDragStart', [dragObject], {bubbling: true});
            }
            if (self._dndListController && self._dndListController.isDragging()) {
                // Проставляем правильное значение флага. Если в начале днд резко утащить за пределы списка,
                // то может не отработать mouseLeave и флаг не проставится
                const moveOutsideList = !(self._container[0] || self._container).contains(nativeEvent.target);
                if (moveOutsideList !== self._listViewModel.isDragOutsideList()) {
                    self._listViewModel.setDragOutsideList(moveOutsideList);
                }

                self._notify('dragMove', [dragObject]);
                const hasSorting = self._options.sorting && self._options.sorting.length;
                if (self._options.draggingTemplate && (self._listViewModel.isDragOutsideList() || hasSorting)) {
                    self._notify(
                        '_updateDraggingTemplate', [dragObject, self._options.draggingTemplate], {bubbling: true}
                    );
                }
            }
        }
    },

    // endregion

    moveItem(self, selectedKey: CrudEntityKey, direction: 'up' | 'down'): Promise<void> {
        const selection: ISelectionObject = {
            selected: [selectedKey],
            excluded: []
        };
        return _private.getMoveAction(self).execute({
            selection,
            providerName: 'Controls/listCommands:MoveProviderDirection',
            direction
        }) as Promise<void>;
    },

    prepareMoveActionOptions(self, options: IList): IMoveActionOptions {
        const controllerOptions: IMoveActionOptions = {
            source: options.source,
            parentProperty: options.parentProperty,
            keyProperty: self._keyProperty,
            sorting: options.sorting,
            siblingStrategy: self._getSiblingsStrategy()
        };
        if (options.moveDialogTemplate) {
            if (options.moveDialogTemplate.templateName) {
                // opener необходим для корректного закрытия окна перемещения в слое совместимости в стековой панели.
                controllerOptions.popupOptions = {
                    opener: self,
                    template: options.moveDialogTemplate.templateName,
                    templateOptions: options.moveDialogTemplate.templateOptions,
                    beforeMoveCallback: options.moveDialogTemplate.beforeMoveCallback
                };
                const templateOptions = controllerOptions.popupOptions.templateOptions as IMoverDialogTemplateOptions;
                if (templateOptions && !templateOptions.keyProperty) {
                    templateOptions.keyProperty = options.keyProperty;
                }
            } else {
                Logger.error('Mover: Wrong type of moveDialogTemplate option, use object notation instead of template function', self);
            }
        }
        return controllerOptions;
    },

    getMoveAction(self): MoveAction {
        return new MoveAction(_private.prepareMoveActionOptions(self, self._options));
    },

    getRemoveAction(self, selection: ISelectionObject, providerName?: string): RemoveAction {
        return new RemoveAction({
            source: self._options.source,
            filter: self._options.filter,
            selection,
            providerName
        });
    },

    removeItems(self, selection: ISelectionObject, providerName?: string): RemoveAction {
        return this.getRemoveAction(self, selection, providerName).execute();
    },

    registerFormOperation(self): void {
        self._notify('registerFormOperation', [{
            save: self._commitEdit.bind(self, 'hasChanges'),
            cancel: self._cancelEdit.bind(self),
            isDestroyed: () => self._destroyed
        }], {bubbling: true});
    },

    isEditing(self): boolean {
        return !!self._editInPlaceController && self._editInPlaceController.isEditing();
    },

    activateEditingRow(self, enableScrollToElement: boolean = self._options.task1184306971 ? 'vertical' : true): void {
        // Контакты используют новый рендер, на котором нет обертки для редактируемой строки.
        // В новом рендере она не нужна
        if (self._children.listView && self._children.listView.activateEditingRow) {
            // todo Нативный scrollIntoView приводит к прокрутке в том числе и по горизонтали и запретить её никак.
            // Решением стало отключить прокрутку при видимом горизонтальном скролле.
            // https://online.sbis.ru/opendoc.html?guid=d07d149e-7eaf-491f-a69a-c87a50596dfe
            const hasColumnScroll = self._isColumnScrollVisible;

            const activator = () => {
                if (hasColumnScroll && !self._options.task1184306971) {
                    enableScrollToElement = false;
                }
                const rowActivator =
                    self._children.listView.activateEditingRow.bind(self._children.listView, enableScrollToElement);
                return rowActivator();
            };

            self._editInPlaceInputHelper.activateInput(activator, hasColumnScroll ? (target) => {
                if (self._children.listView.beforeRowActivated) {
                    self._children.listView.beforeRowActivated(target);
                }
            } : undefined);
        }
    },

    addShowActionsClass(self: BaseControl, options: IList): void {
        // В тач-интерфейсе не нужен класс, задающий видимость itemActions. Это провоцирует лишнюю синхронизацию.
        // Если ItemActions видимы всегда, они не должны исчезать свайп устройствах, они присутствуют всегда.
        if (!self._destroyed && (!TouchDetect.getInstance().isTouch() || options.itemActionsVisibility === 'visible')) {
            self._addShowActionsClass = true;
        }
    },

    removeShowActionsClass(self: BaseControl): void {
        // В тач-интерфейсе не нужен класс, задающий видимость itemActions. Это провоцирует лишнюю синхронизацию.
        // Если ItemActions видимы всегда, они не должны исчезать свайп устройствах, они присутствуют всегда.
        if (!self._destroyed && !TouchDetect.getInstance().isTouch() && self._options.itemActionsVisibility !== 'visible') {
            self._addShowActionsClass = false;
        }
    },

    addHoverEnabledClass(self): void {
        if (!self._destroyed) {
            self._addHoverEnabledClass = true;
        }
    },

    removeHoverEnabledClass(self): void {
        if (!self._destroyed) {
            self._addHoverEnabledClass = false;
        }
    },

    getViewUniqueClass(self): string {
        return `controls-BaseControl__View_${self._uniqueId}`;
    },

    /**
     * Контроллер "заморозки" записей не нужен, если:
     * или есть ошибки или не инициализирована коллекция
     * или операции над записью показаны внутри записи
     * или itemActions не установлены.
     * Также, нельзя запускать "заморозку" во время редактирования или DnD записей.
     * @param self
     */
    needHoverFreezeController(self): boolean {
        return !self._sourceController?.getLoadError() &&
            self._listViewModel &&
            self._options.itemActionsPosition === 'outside' &&
            (
                (self._options.itemActions && self._options.itemActions.length > 0) || self._options.itemActionsProperty
            ) &&
            _private.isAllowedHoverFreeze(self);
    },

    freezeHoveredItem(self: BaseControl, item: CollectionItem<Model> & {dispItem: CollectionItem<Model>}): void {
        const listContainer = self.getItemsContainer();
        // TODO HoverFreeze для ItemActions работает с виртуальным скроллом благодаря тому, что там всегда предаётся
        //  событие mouseEnter. Надо перевести его на item-key, тогда вот это всё уйдёт туда.
        //   https://online.sbis.ru/opendoc.html?guid=2b8e4422-4185-4ad8-834d-d1283375b385
        const itemKey = item.getContents().getKey();
        const itemSelector = `.${_private.getViewUniqueClass(self)} .controls-ListView__itemV[item-key="${itemKey}"]`;
        const itemNode = self._container.querySelector(itemSelector);

        if (!itemNode) {
            return;
        }

        const htmlNodeIndex = [].indexOf.call(listContainer.children, itemNode) + 1;
        const hoveredContainers = HoverFreeze.getHoveredItemContainers(
            self._container,
            htmlNodeIndex,
            _private.getViewUniqueClass(self),
            LIST_MEASURABLE_CONTAINER_SELECTOR
        );

        if (!hoveredContainers.length) {
            return;
        }

        // zero element in grid will be row itself; it doesn't have any background color, then lets take the last one
        const lastContainer = hoveredContainers[hoveredContainers.length - 1];
        const hoverBackgroundColor = getComputedStyle(lastContainer).backgroundColor;

        self._children.itemActionsOutsideStyle.innerHTML = HoverFreeze.getItemHoverFreezeStyles(
            _private.getViewUniqueClass(self),
            htmlNodeIndex,
            hoverBackgroundColor
        );
    },

    unfreezeHoveredItems(self: BaseControl): void {
        self._children.itemActionsOutsideStyle.innerHTML = '';
    },

    initHoverFreezeController(self): void {
        self._hoverFreezeController = new HoverFreeze({
            uniqueClass: _private.getViewUniqueClass(self),
            stylesContainer: self._children.itemActionsOutsideStyle as HTMLElement,
            viewContainer: self._container,
            measurableContainerSelector: LIST_MEASURABLE_CONTAINER_SELECTOR,
            freezeHoverCallback: () => {
                _private.removeHoverEnabledClass(self);
                _private.removeShowActionsClass(self);
            },
            unFreezeHoverCallback: () => {
                if (!self._itemActionsMenuId) {
                    _private.addHoverEnabledClass(self);
                    _private.addShowActionsClass(self, self._options);
                }
            }
        });
    },

    hasHoverFreezeController(self): boolean {
        return !!self._hoverFreezeController;
    },

    /**
     * Возвращает true если использовать "заморозку" разрешено
     * @param self
     */
    isAllowedHoverFreeze(self): boolean {
        return (!self._dndListController || !self._dndListController.isDragging()) &&
            (!self._editInPlaceController || !self._editInPlaceController.isEditing()) &&
            !(self._context?.isTouch?.isTouch);
    }
};

/**
 * Компонент плоского списка, с произвольным шаблоном отображения каждого элемента. Обладает возможностью загрузки/подгрузки данных из источника.
 * @class Controls/_list/BaseControl
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IEditableList
 * @mixes Controls/_list/BaseControl/Styles
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/interface:ISorting
 * @implements Controls/list:IMovableList
 * @implements Controls/marker:IMarkerList
 * @implements Controls/list:IMovableList
 * @implements Controls/list:IListNavigation
 *
 * @private
 * @author Авраменко А.С.
 */

export interface IBaseControlOptions extends IControlOptions, ISourceOptions, IItemActionsOptions {
    keyProperty: string;
    viewModelConstructor: string;
    collection: Collection;
    navigation?: INavigationOptionValue<INavigationSourceConfig>;
    sourceController?: SourceController;
    items?: RecordSet;
    searchValue?: string;
    hasItemWithImage: boolean;
}

export default class BaseControl<TOptions extends IBaseControlOptions = IBaseControlOptions>
    extends Control<TOptions, {}>
    implements IMovableList {

    //#region States
    _updateShadowModeBeforePaint = null;
    _updateShadowModeAfterMount = null;

    _updateInProgress = false;

    _hasItemWithImageChanged = false;
    _isMounted = false;

    _shadowVisibility = null;

    _template = BaseControlTpl;
    iWantVDOM = true;

    private _indicatorsController: IndicatorsController;
    /**
     * Флаг, который означает что сейчас уже идет подгрузка в каком-либо направлении.
     * Используется, чтобы не запускалась одновременно подгрузка в две стороны.
     * Например, если при наличии данных в обе стороны и при изначальной отрисовке(или релоаде) загрузилось элементов
     * не на целую страницу.
     * @private
     */
    private _handleLoadToDirection: boolean;
    private _drawingIndicatorDirection: 'top'|'bottom';

    protected _listViewModel: Collection = null;
    protected _items: RecordSet;

    _loadMoreCaption = null;
    _shouldDrawNavigationButton = false;

    _cutExpanded = false;

    _pagingCfg = null;
    _pagingVisible = false;
    _pagingVisibilityChanged = false;
    _actualPagingVisible = false;
    _pagingPadding = null;
    _resetPagingOnResetItems: boolean = true;

    // если пэйджинг в скролле показался то запоним это состояние и не будем проверять до след перезагрузки списка
    _cachedPagingState = false;
    _shouldNotResetPagingCache = false;
    _recalcPagingVisible = false;
    _isPagingArrowClick = false;

    _itemTemplate = null;

    _isScrollShown = false;
    _notifyPlaceholdersChanged = null;
    _viewSize = null;
    _viewportSize = null;
    _viewportWidth = null;
    _scrollTop = 0;
    _popupOptions = null;
    protected _listVirtualScrollController: ListVirtualScrollController;
    protected _addItemsByLoadToDirection: boolean;

    // target элемента, на котором было вызвано контекстное меню
    _targetItem = null;

    // Variables for paging navigation
    _knownPagesCount = INITIAL_PAGES_COUNT;
    _currentPage = INITIAL_PAGES_COUNT;
    _pagingNavigation = false;
    _pagingNavigationVisible = false;
    _pagingLabelData = null;
    _applySelectedPage = null;
    _updatePagingOnResetItems = true;

    _blockItemActionsByScroll = false;

    _needBottomPadding = false;
    _noDataBeforeReload = false;

    _scrollPageLocked = false;
    _bottomVisible: boolean = true;

    _modelRecreated = false;
    _viewReady = false;

    _portionedSearch = null;

    _itemActionsController = null;
    protected _sourceController: SourceController = null;
    private _sourceControllerLoadingResolver?: () => void;
    _loadedBySourceController = false;

    _notifyHandler = EventUtils.tmplNotify;

    // По умолчанию считаем, что показывать экшны не надо, пока не будет установлено true
    _addShowActionsClass = false;

    // По умолчанию считаем, что необходимо разрешить hover на списке
    _addHoverEnabledClass: boolean = true;

    // Идентификатор текущего открытого popup
    _itemActionsMenuId = null;

    // Шаблон операций с записью
    _itemActionsTemplate = ItemActionsTemplate;

    // Шаблон операций с записью для swipe
    _swipeTemplate = SwipeActionsTemplate;

    private _markerController: MarkerController = null;
    private _selectionController: SelectionController = null;

    private _dndListController: DndController<any> = null;
    private _dragEntity: ItemsEntity = undefined;
    private _startEvent: SyntheticEvent = undefined;
    private _documentDragging: boolean = false;
    private _insideDragging: boolean = false;
    private _endDragNDropTimer: number = null; // для IE
    private _draggedKey: CrudEntityKey = null;
    _validateController = null;

    private _removedItems: CollectionItem[] = [];

    private _itemsChanged: boolean;

    // Флаг, устанавливающий, что после рендера надо обновить ItemActions
    private _shouldUpdateActionsAfterRender: boolean;

    _keyProperty = null;

    // callback'ки передаваемые в sourceController
    _notifyNavigationParamsChanged = null;

    _useServerSideColumnScroll = false;
    _isColumnScrollVisible = false;

    _uniqueId = null;

    _editInPlaceController = null;
    _editInPlaceInputHelper = null;

    _editingItem: IEditableCollectionItem;

    _fixedItem: CollectionItem<Model> = null;

    _continuationEditingDirection: Exclude<EDIT_IN_PLACE_CONSTANTS, EDIT_IN_PLACE_CONSTANTS.CANCEL>;

    _hoverFreezeController: HoverFreeze;

    _keepHorizontalScroll: boolean = false;

    _fadeController: FadeController = null;

    //#endregion

    constructor(options, context) {
        super(options || {}, context);
        options = options || {};
        this._validateController = new ControllerClass();
        this._startDragNDropCallback = this._startDragNDropCallback.bind(this);
        this._nativeDragStart = this._nativeDragStart.bind(this);
        this._resetValidation = this._resetValidation.bind(this);
        this._onWindowResize = this._onWindowResize.bind(this);
        this._scrollToFirstItemAfterDisplayTopIndicator = this._scrollToFirstItemAfterDisplayTopIndicator.bind(this);
        this._hasHiddenItemsByVirtualScroll = this._hasHiddenItemsByVirtualScroll.bind(this);
        this._onCollectionChanged = this._onCollectionChanged.bind(this);
        this._onAfterCollectionChanged = this._onAfterCollectionChanged.bind(this);
        this._onIndexesChanged = this._onIndexesChanged.bind(this);
        this._setMarkedKeyAfterPaging = this._setMarkedKeyAfterPaging.bind(this);
    }

    /**
     * @param {Object} newOptions
     * @param {Object} context
     * @return {Promise}
     * @protected
     */
    protected _beforeMount(newOptions: TOptions, context?): void | Promise<unknown> {
        this._notifyNavigationParamsChanged = _private.notifyNavigationParamsChanged.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._uniqueId = Guid.create();

        if (newOptions.sourceController) {
            this._sourceController = newOptions.sourceController;
            this._sourceController.subscribe('dataLoad', this._dataLoadCallback);
            _private.validateSourceControllerOptions(this, newOptions);
        }

        _private.checkDeprecated(newOptions);
        this._initKeyProperty(newOptions);
        _private.checkRequiredOptions(this, newOptions);

        _private.bindHandlers(this);

        _private.initializeNavigation(this, newOptions);

        // TODO: Не переношу в грид контрол, т.к. этот код удалится в 22.1000.
        if (
            !newOptions.newColumnScroll &&
            newOptions.columnScroll &&
            newOptions.columnScrollStartPosition === 'end'
        ) {
            const shouldPrevent = newOptions.preventServerSideColumnScroll;
            this._useServerSideColumnScroll = typeof shouldPrevent === 'boolean' ? !shouldPrevent : true;
        }

        _private.addShowActionsClass(this, newOptions);

        const result = this._doBeforeMount(newOptions);
        if (result instanceof Promise) {
            result.then(() => this._listVirtualScrollController.endBeforeMountListControl());
        } else {
            this._listVirtualScrollController.endBeforeMountListControl();
        }
        return result;
    }

    private _dataLoadCallback(event: EventObject, items: RecordSet, direction: IDirection): Promise<void> | void {
        this._beforeDataLoadCallback(items, direction);

        if (items.getCount()) {
            this._loadedItems = items;
        }

        if (!direction) {
            this._loadedBySourceController = true;
            if (this._isMounted && this._children.listView && !this._keepHorizontalScroll) {
                this._children.listView.reset({});
            }
            this._keepHorizontalScroll = false;
            _private.setReloadingState(this, false);
            const isEndEditProcessing = this._editInPlaceController &&
                                        this._editInPlaceController.isEndEditProcessing &&
                                        this._editInPlaceController.isEndEditProcessing();
            _private.callDataLoadCallbackCompatibility(this, items, direction, this._options);
            _private.executeAfterReloadCallbacks(this, items, this._options);
            if (this._indicatorsController.shouldHideGlobalIndicator()) {
                this._indicatorsController.hideGlobalIndicator();
            }
            // Принудительно прекращаем заморозку ховера
            if (_private.hasHoverFreezeController(this)) {
                this._hoverFreezeController.unfreezeHover();
            }
            event.setResult(
                this.isEditing() && !isEndEditProcessing
                ? this._cancelEdit(true)
                : void 0
            );
            return;
        }

        _private.setHasMoreData(this._listViewModel, _private.getHasMoreData(this));

        _private.callDataLoadCallbackCompatibility(this, items, direction, this._options);

        if (this._indicatorsController.shouldHideGlobalIndicator()) {
            this._indicatorsController.hideGlobalIndicator();
        }
    }

    protected _beforeDataLoadCallback(items: RecordSet, direction: IDirection): void {
        // для переопределения
    }

    _doBeforeMount(newOptions): Promise<unknown> | void {
        let result = null;
        let state: 'sync' | 'async' = 'sync';

        const addOperation = (cb) => {
            if (state === 'sync') {
                result = cb(result);
                state = result instanceof Promise ? 'async' : 'sync';
            } else {
                result.then(cb);
            }
        };

        // Prepare items on mount
        addOperation(() => this._prepareItemsOnMount(this, newOptions));

        // Try to start initial editing
        addOperation(() => {
            if (this._listViewModel) {
                return this._tryStartInitialEditing(newOptions);
            }
        });

        // Init model state if need
        addOperation(() => {
            const needInitModelState =
                this._listViewModel &&
                this._listViewModel.getCollection() &&
                this._listViewModel.getCollection().getCount();

            if (needInitModelState) {
                if (newOptions.markerVisibility === 'visible'
                    || newOptions.markerVisibility === 'onactivated' && newOptions.markedKey !== undefined) {
                    const controller = _private.getMarkerController(this, newOptions);
                    const markedKey = controller.calculateMarkedKeyForVisible();
                    controller.setMarkedKey(markedKey);
                }
                if (newOptions.fadedKeys) {
                    const fadeController = _private.getFadeController(this, newOptions);
                    fadeController.applyStateToModel();
                }
                if (
                    newOptions.multiSelectVisibility !== 'hidden' &&
                    newOptions.selectedKeys &&
                    newOptions.selectedKeys.length > 0
                ) {
                    const selectionController = _private.createSelectionController(this, newOptions);
                    const selection = {selected: newOptions.selectedKeys, excluded: newOptions.excludedKeys};
                    selectionController.setSelection(selection);
                }
            }
        });

        return state === 'sync' ? void 0 : result;
    }

    protected _onItemsReady(options, items): void {
        if (options.itemsReadyCallback) {
            options.itemsReadyCallback(items);
        }
    }
    protected _afterItemsSet(options): void {
        // для переопределения
    }
    private _onCollectionChanged(
        event: SyntheticEvent,
        action: string,
        newItems: Array<CollectionItem<Model>>,
        newItemsIndex: number,
        removedItems: Array<CollectionItem<Model>>,
        removedItemsIndex: number,
        reason: string): void {
        _private.onCollectionChanged(
            this, event, null, action, newItems, newItemsIndex, removedItems, removedItemsIndex, reason
        );
        if (action === IObservable.ACTION_RESET) {
            this._afterCollectionReset();
        }
        if (action === IObservable.ACTION_REMOVE) {
            this._afterCollectionRemove(removedItems, removedItemsIndex);
        }
    }
    protected _afterCollectionReset(): void {
        // для переопределения
    }
    protected _afterCollectionRemove(removedItems: Array<CollectionItem<Model>>, removedItemsIndex: number): void {
        // для переопределения
    }

    private _onAfterCollectionChanged(): void {
        if (_private.hasSelectionController(this) && this._removedItems.length) {
            const newSelection = _private.getSelectionController(this).onCollectionRemove(this._removedItems);
            _private.changeSelection(this, newSelection);
        }
        this._removedItems = [];
    }

    private _onIndexesChanged(
        event: SyntheticEvent,
        startIndex: number,
        endIndex: number,
        shiftDirection: IDirectionNew
    ): void {
        if (this._isMounted && shiftDirection) {
            // Если больше нет записей скрытых виртуальным скроллом, мы должны показать индикатор.
            // Проверяем это и если нужно показываем индикатор.
            if (shiftDirection === 'forward' && this._indicatorsController.shouldDisplayBottomIndicator()) {
                this._indicatorsController.displayBottomIndicator();
            } else if (shiftDirection === 'backward' && this._indicatorsController.shouldDisplayTopIndicator()) {
                this._indicatorsController.displayTopIndicator(false);
            }

            // Индикаторы отрисовки нужно отображать только, когда у нас сместился диапазон.
            // При подгрузке или перезагрузке мы отображает индикаторы загрузки.
            // Если у нас долго отрисовываются записи(дольше 2с), то мы показываем индикатор отрисовки.
            // Эта ситуация в частности актуальна для ScrollViewer.
            // Если индикатор и так уже есть, то скрываем его. Показываться может только один индикатор отрисовки.
            if (this._drawingIndicatorDirection) {
                this._indicatorsController.hideDrawingIndicator(
                    this._getIndicatorDomElement(this._drawingIndicatorDirection),
                    this._drawingIndicatorDirection
                );
            }
            this._drawingIndicatorDirection = shiftDirection === 'forward' ? 'bottom' : 'top';
            this._indicatorsController.displayDrawingIndicator(
                this._getIndicatorDomElement(this._drawingIndicatorDirection),
                this._drawingIndicatorDirection
            );
        }
        // При смене индексов нужно всегда обновлять itemActions, т.к.
        // они обновляются только в видимом диапазоне виртуального скролла независимо от режима.
        // Если этот метод сработал при инициализации виртуального скролла на beforeMount,
        // то в this._options ничего нет, поэтому проверяем на this._mounted.
        if (this._isMounted && !!this._itemActionsController) {
            _private.updateInitializedItemActions(this, this._options);
        }
    }

    protected _prepareItemsOnMount(self, newOptions): Promise<unknown> | void {
        let items;
        let collapsedGroups;

        if (self._sourceController) {
            items = self._sourceController.getItems();
            collapsedGroups = self._sourceController.getCollapsedGroups();
        } else if (newOptions.items) {
            items = newOptions.items;
        }

        const viewModelConfig = {
            ...newOptions,
            keyProperty: self._keyProperty,
            items,
            // Сейчас при условии newDesign предполагается, что разделителей по краям нет.
            // Прежде чем убирать это условие, стоит поправить прикладные репозитории.
            rowSeparatorVisibility: (newOptions._dataOptionsValue?.newDesign || newOptions.newDesign ?
                'items' : newOptions.rowSeparatorVisibility),
            collapsedGroups: collapsedGroups || newOptions.collapsedGroups
        };

        _private.initializeModel(self, viewModelConfig, items);

        if (items) {
            _private.setHasMoreData(self._listViewModel, _private.getHasMoreData(self), true);

            self._items = self._listViewModel.getCollection();
            self._needBottomPadding = _private.needBottomPadding(self, newOptions);
            if (self._pagingNavigation) {
                const hasMoreData = self._items.getMetaData().more;
                _private.updatePagingData(self, hasMoreData, newOptions);
            }

            self._afterReloadCallback(newOptions, self._items, self._listViewModel);
            _private.callDataLoadCallbackCompatibility(self, self._items, undefined, newOptions);
            _private.prepareFooter(self, newOptions, self._sourceController);
            _private.initVisibleItemActions(self, newOptions);
        }

        self._createListVirtualScrollController(newOptions);
        self._createIndicatorsController(newOptions);
    }

    _initKeyProperty(options: TOptions): void {
        this._keyProperty = options.keyProperty ||
            (this._sourceController && this._sourceController.getKeyProperty()) ||
            options.items?.getKeyProperty();
    }

    /**
     * Замораживает hover подсветку строки для указанной записи
     */
    freezeHoveredItem(item: Model): void {
        const collectionItem = this._listViewModel.getItemBySourceItem(item);
        if (!collectionItem) {
            Logger.error('freezeHoveredItem(). Указанный item отсутствует в коллекции.', this);
        } else {
            _private.freezeHoveredItem(this, collectionItem);
        }
    }

    /**
     * Размораживает все ранее замороженные итемы
     */
    unfreezeHoveredItems(): void {
        _private.unfreezeHoveredItems(this);
    }

    viewportResizeHandler(viewportHeight: number, viewportRect: DOMRect, scrollTop: number): void {
        this._viewportSize = viewportHeight;
        this._viewportWidth = viewportRect.width;

        this._scrollTop = scrollTop;
        this._listVirtualScrollController.viewportResized(viewportHeight);
        // TODO SCROLL во viewportResizeHandler не должно быть scrollTop
        if (scrollTop !== undefined) {
            this._listVirtualScrollController.scrollPositionChange(scrollTop);
        }
        this._updateViewportFilledInIndicatorsController();
        if (this._viewportSize >= this._viewSize) {
            this._pagingVisible = false;
        }
        if (this._pagingVisible && this._scrollPagingCtr) {
            this._scrollPagingCtr.viewportResize(viewportHeight);
            _private.updateScrollPagingButtons(this, this._getScrollParams());
        }
        if (this._recalcPagingVisible) {
            if (!this._pagingVisible) {
                _private.initPaging(this);
            }
        }
    }

    _updateShadowModeHandler(shadowVisibility: { down: boolean, up: boolean }): void {
        this._shadowVisibility = shadowVisibility;

        if (this._isMounted) {
            // scrollTop пересчитывается в beforePaint поэтому и тень должны изменять тоже в beforePaint,
            // чтобы не было моргания тени
            this._updateShadowModeBeforePaint = () => {
                _private.updateShadowMode(this, shadowVisibility);
            };
        } else {
            this._updateShadowModeAfterMount = () => {
                _private.updateShadowMode(this, shadowVisibility);
            };
        }
    }

    // TODO Необходимо провести рефакторинг механизма подгрузки данных по задаче
    //  https://online.sbis.ru/opendoc.html?guid=8a5f7598-c7c2-4f3e-905f-9b2430c0b996
    protected _loadMore(direction: IDirection): Promise<RecordSet|void> | void {
        if (_private.isInfinityNavigation(this._options?.navigation) ||
            _private.isDemandNavigation(this._options?.navigation)) {
            return _private.loadToDirectionIfNeed(this, direction, this._options.filter);
        }
        return Promise.resolve();
    }

    protected _viewResize(): void {
        if (this._isMounted) {
            const container = this._children.viewContainer || this._container[0] || this._container;
            const contentSize = _private.getViewSize(this, true);
            this._viewSize = contentSize;

            /**
             * Заново определяем должен ли отображаться пэйджинг или нет.
             * Скрывать нельзя, так как при подгрузке данных пэйджинг будет моргать.
             */
            if (this._pagingVisible) {
                this._cachedPagingState = false;
                _private.initPaging(this);
            } else if (detection.isMobilePlatform) {
                this._recalcPagingVisible = true;
            }
            this._viewRect = container.getBoundingClientRect();

            if (_private.needScrollPaging(this._options.navigation)) {
                _private.doAfterUpdate(this, () => {
                    _private.updateScrollPagingButtons(this, {...this._getScrollParams(), initial: !this._scrolled});
                });
            }
        }
    }

    protected _onWindowResize(): void {
        // Если изменили размеры окна, то нужно скрыть меню для itemActions. Иначе меню уезжает куда-то в сторону.
        _private.closeActionsMenu(this);
    }

    _getScrollParams(clear: boolean = false): IScrollParams {
        if (clear) {
            return {
                clientHeight: this._viewportSize,
                scrollHeight: this._viewSize,
                scrollTop: this._scrollTop
            };
        }
        let stickyElementsHeight = 0;
        if (detection.isBrowserEnv) {
            stickyElementsHeight = getStickyHeadersHeight(this._container, 'top', 'allFixed') || 0;
            stickyElementsHeight += getStickyHeadersHeight(this._container, 'bottom', 'allFixed') || 0;
        }
        const pagingPadding = this._isPagingPadding() ? PAGING_PADDING : 0;
        const scrollParams = {
            scrollTop: this._scrollTop,
            scrollHeight: _private.getViewSize(this, true) + pagingPadding - stickyElementsHeight,
            clientHeight: this._viewportSize - stickyElementsHeight
        };
        /**
         * Для pagingMode numbers нужно знать реальную высоту списка и scrollTop (включая то, что отсечено виртуальным скроллом)
         * Это нужно чтобы правильно посчитать номер страницы.
         * Также, это нужно для других пэджингов, но только в том случае, если мы скроллим не через нажатие кнопок.
         * Иначе пэджинг может исчезать и сразу появляться.
         * https://online.sbis.ru/opendoc.html?guid=8d830d87-be3f-4522-b453-0df337147d42
         */
        if (this._options.navigation.viewConfig.pagingMode === 'numbers' || !this._isPagingArrowClick) {
            scrollParams.scrollTop += this._placeholders?.backward || 0;
            scrollParams.scrollHeight += this._placeholders?.backward + this._placeholders?.forward || 0;
        }
        this._isPagingArrowClick = false;
        return scrollParams;
    }

    getViewModel() {
        return this._listViewModel;
    }

    getSourceController(): SourceController {
        return this._sourceController;
    }

    // region Scroll

    private _createListVirtualScrollController(options): void {
        this._listVirtualScrollController = new ListVirtualScrollController({
            collection: this._listViewModel,
            listControl: this,
            virtualScrollConfig: options.virtualScrollConfig || {},
            multiColumns: options.multiColumns,
            activeElementKey: options.activeElement,
            initialScrollPosition: options.initialScrollPosition,
            disableVirtualScroll: options.disableVirtualScroll,

            itemsContainer: null,
            listContainer: null,

            triggersQuerySelector: LOADING_TRIGGER_SELECTOR,
            itemsQuerySelector: options.itemsSelector,
            itemsContainerUniqueSelector: `.${this._getItemsContainerUniqueClass()}`,

            triggersVisibility: {
                backward: !this._hasMoreData('up') ||
                    !this._listViewModel.getCount() ||
                    !options.attachLoadTopTriggerToNull,
                forward: true
            },
            triggersOffsetCoefficients: {
                backward: options.topTriggerOffsetCoefficient,
                forward: options.bottomTriggerOffsetCoefficient
            },
            triggersPositions: {
                backward: this._sourceController && this._sourceController.hasMoreData('up') ? 'null' : 'offset',
                forward: this._sourceController && this._sourceController.hasMoreData('down') ? 'null' : 'offset'
            },
            additionalTriggersOffsets: this._getAdditionalTriggersOffsets(),
            totalCount: this._listViewModel.getCount(),

            feature1183225611: options.virtualScrollConfig?.feature1183225611,

            scrollToElementUtil: (container, position, force): Promise<void> => {
                this._scrollControllerInitializeChangeScroll = true;
                return this._notify(
                    'scrollToElement',
                    [{ itemContainer: container, position, force }],
                    { bubbling: true }
                ) as Promise<void>;
            },

            doScrollUtil: (scrollTop) => {
                this._scrollControllerInitializeChangeScroll = true;
                this._notify('doScroll', [scrollTop, true], { bubbling: true });
            },

            updatePlaceholdersUtil: (placeholders) => {
                if (!this._isMounted) {
                    return;
                }
                // TODO нужно будет сетать в пэйджинг и он на своем уровне это обработает
                // Пэйджингу нужны плэйсхолдеры, чтобы правильно работать с отображением страниц
                this._placeholders = placeholders;

                const convertedPlaceholders = {
                    top: placeholders.backward,
                    bottom: placeholders.forward
                };
                this._notify('updatePlaceholdersSize', [convertedPlaceholders], {bubbling: true});
            },

            hasItemsOutRangeChangedCallback: (hasItemsOutRange) => {
                // для ромашек и для обновления virtualNavigation после загрузки данных
                this._hasItemsOutRange = hasItemsOutRange;
            },

            updateShadowsUtil: (hasItemsOutRange) => {
                const collection = this._listViewModel;
                const navigation = this._options.navigation;
                const itemsCount = collection?.getCount();
                const shadowVisibleByNavigation = _private.needShowShadowByNavigation(navigation, itemsCount);
                const topShadowVisibleByPortionedSearch = _private.allowLoadMoreByPortionedSearch(this, 'up');
                const bottomShadowVisibleByPortionedSearch = _private.allowLoadMoreByPortionedSearch(this, 'down');

                const topShadowVisible = hasItemsOutRange.backward || shadowVisibleByNavigation &&
                    topShadowVisibleByPortionedSearch && itemsCount && this._hasMoreData('up');
                const bottomShadowVisible = hasItemsOutRange.forward || shadowVisibleByNavigation &&
                    bottomShadowVisibleByPortionedSearch && itemsCount && this._hasMoreData('down');

                this._notify('updateShadowMode', [{
                    top: topShadowVisible ? 'visible' : 'auto',
                    bottom: bottomShadowVisible ? 'visible' : 'auto'
                }], {bubbling: true});
            },

            updateVirtualNavigationUtil: (hasItemsOutRange) => {
                this._updateVirtualNavigation(hasItemsOutRange);
            },

            activeElementChangedCallback: (activeElementIndex) => {
                const activeItem = this._listViewModel.at(activeElementIndex);
                if (activeItem) {
                    this._notify('activeElementChanged', [activeItem.key]);
                }
            },

            itemsEndedCallback: (direction): void => {
                const compatibleDirection = direction === 'forward' ? 'down' : 'up';
                if (this._shouldLoadOnScroll(compatibleDirection)) {
                    this._loadMore(compatibleDirection);
                }
            }
        });
    }

    private _getAdditionalTriggersOffsets(): IAdditionalTriggersOffsets {
        return {
            backward: this._listViewModel.getTopIndicator().isDisplayed() ? INDICATOR_HEIGHT - 1 : 0,
            forward: this._listViewModel.getBottomIndicator().isDisplayed() ? INDICATOR_HEIGHT - 1 : 0
        };
    }

    private _updateVirtualNavigation(hasItemsOutRange: IHasItemsOutRange): void {
        // Список, скрытый на другой вкладке не должен нотифаить о таких изменениях
        if (this._container?.closest('.ws-hidden')) {
            return;
        }

        const topEnabled = hasItemsOutRange && hasItemsOutRange.backward || this._hasMoreData('up');
        const bottomEnabled = hasItemsOutRange && hasItemsOutRange.forward || this._hasMoreData('down');

        if (this._isMounted) {
            if (topEnabled) {
                this._notify('enableVirtualNavigation', ['top'], { bubbling: true });
            } else {
                this._notify('disableVirtualNavigation', ['top'], { bubbling: true });
            }

            if (bottomEnabled) {
                this._notify('enableVirtualNavigation', ['bottom'], { bubbling: true });
                // чтобы скрыть отступ под пэйджинг
            } else {
                this._notify('disableVirtualNavigation', ['bottom'], { bubbling: true });
                // чтобы нарисовать отступ под пэйджинг
            }
        }

        this._bottomVisible = !bottomEnabled;
    }

    private _setMarkedKeyAfterPaging(key: CrudEntityKey): void {
        const markerController = _private.getMarkerController(this);
        if (markerController.shouldMoveMarkerOnScrollPaging()) {
            const record = this._listViewModel.getCollection().getRecordById(key);
            const item = this._listViewModel.getItemBySourceKey(key);
            const suitableKey = record
                ? key
                : item && markerController.getSuitableMarkedKey(item);
            this._changeMarkedKey(suitableKey || key);
        }
    }

    protected _onCollectionChangedScroll(
        action: string,
        newItems: Array<CollectionItem<Model>>,
        newItemsIndex: number,
        removedItems: Array<CollectionItem<Model>>,
        removedItemsIndex: number
    ): void {
        // TODO SCROLL self._listVirtualScrollController нужно юниты чинить, чтобы убрать
        if (!this._listVirtualScrollController) {
            return;
        }

        const params = {
            range: {
                startIndex: this._listViewModel.getStartIndex(),
                endIndex: this._listViewModel.getStopIndex()
            },
            virtualPageSize: this._options.virtualScrollConfig?.pageSize,
            scrolledToBackwardEdge: this._scrollTop === 0,
            scrolledToForwardEdge: this._viewportSize + this._scrollTop === this._viewSize,
            newItemsIndex,
            itemsLoadedByTrigger: this._addItemsByLoadToDirection,
            portionedLoading: _private.isPortionedLoad(this)
        };

        switch (action) {
            case IObservable.ACTION_RESET:
                this._listVirtualScrollController.resetItems();
                // TODO SCROLL по идее это нужно делать после релоада.
                if (action === IObservable.ACTION_RESET) {
                    // если есть данные и вниз и вверх, то скрываем триггер вверх,
                    // т.к. в первую очередь грузим вниз
                    const backwardTriggerVisible = !this._hasMoreData('up') ||
                        !this._listViewModel.getCount() ||
                        !this._options.attachLoadTopTriggerToNull;
                    this._listVirtualScrollController.setBackwardTriggerVisible(backwardTriggerVisible);
                    this._listVirtualScrollController.setForwardTriggerVisible(true);
                }
                break;
            case IObservable.ACTION_ADD:
                this._listVirtualScrollController.addItems(
                    newItemsIndex,
                    newItems.length,
                    getScrollMode(params),
                    getCalcMode(params)
                );
                break;
            case IObservable.ACTION_REMOVE:
                this._listVirtualScrollController.removeItems(
                    removedItemsIndex,
                    removedItems.length,
                    getScrollMode(params)
                );
                break;
            case IObservable.ACTION_MOVE:
                this._listVirtualScrollController.moveItems(
                    newItemsIndex,
                    newItems.length,
                    removedItemsIndex,
                    removedItems.length
                );
                break;
        }
    }

    // endregion Scroll

    protected _afterMount(): void {
        this._isMounted = true;

        this._listVirtualScrollController.setListContainer(this._container);
        this._listVirtualScrollController.afterMountListControl();

        if (constants.isBrowserPlatform) {
            window.addEventListener('resize', this._onWindowResize);
        }

        // TODO: Не переношу в грид контрол, т.к. этот код удалится в 22.1000.
        if (!this._options.newColumnScroll && this._useServerSideColumnScroll) {
            this._useServerSideColumnScroll = false;
        }

        if (!this._sourceController?.getLoadError()) {
            this._registerObserver();
        }
        if (this._options.itemsDragNDrop) {
            const container = this._container[0] || this._container;
            container.addEventListener('dragstart', this._nativeDragStart);
        }
        this._loadedItems = null;

        if (this._editInPlaceController) {
            _private.registerFormOperation(this);
            if (this._editInPlaceController.isEditing()) {
                _private.activateEditingRow(this, false);
            }
        }

        // в тач интерфейсе инициализировать пейджер необходимо при загрузке страницы
        // В beforeMount инициализировать пейджер нельзя, т.к. не корректно посчитаются его размеры.
        // isMobilePlatform использовать для проверки не целесообразно, т.к. на интерфейсах с
        // touch режимом isMobilePlatform может быть false
        if (TouchDetect.getInstance().isTouch()) {
            _private.initPaging(this);
        }

        // для связи с контроллером ПМО
        this._notify('register', ['selectedTypeChanged', this, _private.onSelectedTypeChanged], {bubbling: true});
        this._notifyOnDrawItems();
        if (this._updateShadowModeAfterMount) {
            this._updateShadowModeAfterMount();
            this._updateShadowModeAfterMount = null;
        }

        this._notify('register', ['documentDragStart', this, this._documentDragStart], {bubbling: true});
        this._notify('register', ['documentDragEnd', this, this._documentDragEnd], {bubbling: true});
        RegisterUtil(this, 'loadToDirection', _private.loadToDirection.bind(this, this));

        // TODO удалить после того как избавимся от onactivated
        if (_private.hasMarkerController(this)) {
            const newMarkedKey = _private.getMarkerController(this).getMarkedKey();
            if (newMarkedKey !== this._options.markedKey) {
                this._changeMarkedKey(newMarkedKey, true);
            }
        }

        if (_private.hasSelectionController(this)) {
            const controller = _private.getSelectionController(this);
            _private.changeSelection(this, controller.getSelection());
        }

        // на мобильных устройствах не сработает mouseEnter, поэтому ромашку сверху добавляем сразу после моунта
        // до моунта нельзя, т.к. нельзя будет проскроллить
        if (detection.isMobilePlatform && this._indicatorsController.shouldDisplayTopIndicator()) {
            this._indicatorsController.displayTopIndicator(true, false, false);
        }
        // если элементов не хватает на всю страницу, то сразу же показываем ромашки и триггеры, чтобы догрузить данные
        if (this._viewSize < this._viewportSize) {
            // В первую очередь показываем нижний индикатор(он покажется в _beforeMount), но если данных вниз нет,
            // то показываем верхний индикатор с триггером при наличии еще данных.
            // Сделано так, чтобы не было сразу загрузки в обе стороны.
            // Верхний индикатор нельзя показать в _beforeMount, т.к. мы не знаем хватит ли элементов на всю страницу
            // и при показе верхнего индикатора нужно добавить отступ от триггера.
            if (
                !this._indicatorsController.shouldDisplayBottomIndicator() &&
                this._indicatorsController.shouldDisplayTopIndicator()
            ) {
                // скроллить не нужно, т.к. не куда, ведь элементы не занимают весь вьюПорт
                this._indicatorsController.displayTopIndicator(false);
                this._listVirtualScrollController.setBackwardTriggerVisible(true);
            }
        }

        this._listVirtualScrollController.setAdditionalTriggersOffsets(this._getAdditionalTriggersOffsets());

        // TODO SCROLL по идее это не нужно с новым скроллом, т.к. мы в новом контроллере проверим видимость триггера
        //  и спровоцируем подгрузку по нему
        _private.tryLoadToDirectionAgain(this);
    }

    _updateBaseControlModel(newOptions): void {
        // Не нужно обновлять модель, если она была пересоздана или не создана вообще
        if (this._modelRecreated || !this._listViewModel) {
            return;
        }

        const emptyTemplateChanged = this._options.emptyTemplate !== newOptions.emptyTemplate;
        const groupPropertyChanged = newOptions.groupProperty !== this._options.groupProperty;

        if (emptyTemplateChanged) {
            this._listViewModel.setEmptyTemplate(newOptions.emptyTemplate);
        }
        this._listViewModel.setEmptyTemplateOptions({
            ...newOptions.emptyTemplateOptions, items: this._items, filter: newOptions.filter});

        if (this._options.rowSeparatorSize !== newOptions.rowSeparatorSize) {
            this._listViewModel.setRowSeparatorSize(newOptions.rowSeparatorSize);
        }

        if (this._options.rowSeparatorVisibility !== newOptions.rowSeparatorVisibility) {
            this._listViewModel.setRowSeparatorVisibility(newOptions.rowSeparatorVisibility);
        }

        if (this._options.displayProperty !== newOptions.displayProperty) {
            this._listViewModel.setDisplayProperty(newOptions.displayProperty);
        }

        if (newOptions.collapsedGroups !== this._options.collapsedGroups) {
            GroupingController.setCollapsedGroups(this._listViewModel, newOptions.collapsedGroups);
        }

        if (newOptions.theme !== this._options.theme) {
            this._listViewModel.setTheme(newOptions.theme);
        }

        if (newOptions.editingConfig !== this._options.editingConfig) {
            this._listViewModel.setEditingConfig(this._getEditingConfig(newOptions));
        }

        if (newOptions.multiSelectVisibility !== this._options.multiSelectVisibility) {
            this._listViewModel.setMultiSelectVisibility(newOptions.multiSelectVisibility);
        }

        if (newOptions.multiSelectPosition !== this._options.multiSelectPosition) {
            this._listViewModel.setMultiSelectPosition(newOptions.multiSelectPosition);
        }

        if (newOptions.multiSelectAccessibilityProperty !== this._options.multiSelectAccessibilityProperty) {
            this._listViewModel.setMultiSelectAccessibilityProperty(newOptions.multiSelectAccessibilityProperty);
        }

        if (newOptions.itemTemplateProperty !== this._options.itemTemplateProperty) {
            this._listViewModel.setItemTemplateProperty(newOptions.itemTemplateProperty);
        }

        if (newOptions.itemActionsPosition !== this._options.itemActionsPosition) {
            this._listViewModel.setItemActionsPosition(newOptions.itemActionsPosition);
        }

        if (!isEqual(this._options.itemPadding, newOptions.itemPadding)) {
            this._listViewModel.setItemPadding(newOptions.itemPadding);
        }

        if (groupPropertyChanged) {
            this._listViewModel.setGroupProperty(newOptions.groupProperty);
        }
    }

    protected _keyDownLeft(event): void {
        // TODO: Не переношу в грид контрол, т.к. этот код удалится в 22.1000.
        // Сначала обрабатываем скролл колонок, если не было проскролено, то двигаем маркер
        if (!this._options.newColumnScroll && event.nativeEvent.shiftKey) {
            if (this._options.columnScroll && this._children.listView.keyDownLeft()) {
                return;
            }
        }
        _private.moveMarkerToDirection(this, event, 'Left');
    }

    protected _keyDownRight(event): void {
        // TODO: Не переношу в грид контрол, т.к. этот код удалится в 22.1000.
        // Сначала обрабатываем скролл колонок, если не было проскролено, то двигаем маркер
        if (!this._options.newColumnScroll && event.nativeEvent.shiftKey) {
            if (this._options.columnScroll && this._children.listView.keyDownRight()) {
                return;
            }
        }
        _private.moveMarkerToDirection(this, event, 'Right');
    }

    protected _beforeUpdate(newOptions: TOptions) {
        this._startBeforeUpdate(newOptions);
        if (newOptions.propStorageId && !isEqual(newOptions.sorting, this._options.sorting)) {
            saveConfig(newOptions.propStorageId, ['sorting'], newOptions);
        }
        this._updateInProgress = true;
        const navigationChanged = !isEqual(newOptions.navigation, this._options.navigation);
        const loadStarted = newOptions.loading && !this._options.loading;
        const loadedBySourceController = this._loadedBySourceController;
        let isItemsResetFromSourceController = false;

        const isSourceControllerLoadingNow =
            newOptions.sourceController &&
            newOptions.loading &&
            newOptions.sourceController.isLoading();

        if (isSourceControllerLoadingNow) {
            _private.setReloadingState(this, true);
        }

        if (this._options.activeElement !== newOptions.activeElement) {
            this._listVirtualScrollController.setActiveElementKey(newOptions.activeElement);
        }

        if (navigationChanged) {
            // При смене страницы, должно закрыться редактирование записи.
            _private.closeEditingIfPageChanged(this, this._options.navigation, newOptions.navigation);
            _private.initializeNavigation(this, newOptions);

            if (this._pagingVisible) {
                this._pagingVisible = false;
            }
        }

        const shouldReInitCollection = !!newOptions._recreateCollection ||
                                    newOptions.viewModelConstructor &&
                                    newOptions.viewModelConstructor !== this._options.viewModelConstructor ||
                                    newOptions.collection !== this._options.collection ||
                                    (this._listViewModel && this._keyProperty !== this._listViewModel.getKeyProperty());

        if (this._editInPlaceController) {
            const isEditingModeChanged = this._options.editingConfig !== newOptions.editingConfig &&
                                       this._getEditingConfig().mode !== this._getEditingConfig(newOptions).mode;
            if (isEditingModeChanged) {
                this._editInPlaceController.updateOptions({
                    mode: this._getEditingConfig(newOptions).mode
                });
            }
            if (shouldReInitCollection || loadStarted || isEditingModeChanged) {
                if (this.isEditing()) {
                    // При перезагрузке или при смене модели(например, при поиске), редактирование должно завершаться
                    // без возможности отменить закрытие из вне.
                    this._cancelEdit(true).then(() => {
                        if (shouldReInitCollection) {
                            this._destroyEditInPlaceController();
                        }
                    });
                } else {
                    if (shouldReInitCollection) {
                        this._destroyEditInPlaceController();
                    }
                }
            }
        }

        if ((newOptions.keyProperty !== this._options.keyProperty) ||
            this._sourceController && this._keyProperty !== this._sourceController.getKeyProperty()) {
            this._initKeyProperty(newOptions);
            _private.checkRequiredOptions(this, newOptions);
        }

        if (shouldReInitCollection && this._listViewModel) {
            const items = this._loadedBySourceController
               ? newOptions.sourceController.getItems()
               : this._listViewModel.getCollection();
            _private.deleteListViewModelHandler(this, this._listViewModel);
            if (!newOptions.collection) {
                this._listViewModel.destroy();
            }

            this._noDataBeforeReload = !(items && items.getCount());
            _private.initializeModel(this, {...newOptions, keyProperty: this._keyProperty}, items);
            this._listVirtualScrollController.setItemsContainer(null);
            this._listVirtualScrollController.setCollection(this._listViewModel);

            // Важно обновить коллекцию в scrollContainer перед сбросом скролла, т.к. scrollContainer реагирует на
            // scroll и произведет неправильные расчёты, т.к. у него старая collection.
            // https://online.sbis.ru/opendoc.html?guid=caa331de-c7df-4a58-b035-e4310a1896df
            this._updateIndicatorsController(newOptions, isSourceControllerLoadingNow);
            this._indicatorsControllerOnCollectionReset();

            // При пересоздании коллекции будет скрыт верхний триггер и индикатор,
            // чтобы не было лишней подгрузки при отрисовке нового списка.
            // Показываем по необходимости верхний индикатор и триггер
            if (this._indicatorsController.shouldDisplayTopIndicator()) {
                this._indicatorsController.displayTopIndicator(true);
            } else {
                this._listVirtualScrollController.setBackwardTriggerVisible(true);
            }

            // После пересоздания модели нужно проинициализировать операции записей.
            // Старая модель в контроллере операций уже не актуальна.
            if (newOptions.itemActions || newOptions.itemActionsProperty) {
                _private.updateItemActions(this, newOptions);
            }

            this._modelRecreated = true;

            _private.setHasMoreData(this._listViewModel, _private.getHasMoreData(this));
        }

        // region Indicators

        this._updateIndicatorsController(newOptions, isSourceControllerLoadingNow);

        if (loadStarted) {
            this._displayGlobalIndicator();
        } else if (this._options.loading && !newOptions.loading &&
            this._indicatorsController.shouldHideGlobalIndicator()) {
            this._indicatorsController.hideGlobalIndicator();
        }

        // endregion Indicators

        if (_private.hasMarkerController(this) && this._listViewModel) {
            _private.getMarkerController(this).updateOptions({
                model: this._listViewModel,
                markerVisibility: newOptions.markerVisibility,
                markerStrategy: newOptions.markerStrategy,
                moveMarkerOnScrollPaging: newOptions.moveMarkerOnScrollPaging
            });
        }

        if (newOptions.sourceController || newOptions.items) {
            const items = newOptions.sourceController?.getItems() || newOptions.items;
            const sourceControllerChanged = this._options.sourceController !== newOptions.sourceController;

            if (newOptions.sourceController) {
                if (sourceControllerChanged) {
                    this._sourceController = newOptions.sourceController;
                    this._sourceController.subscribe('dataLoad', this._dataLoadCallback);
                }

                if (newOptions.loading) {
                    this._noDataBeforeReload = !_private.hasDataBeforeLoad(this);
                }
            }

            if (items && (this._listViewModel && !this._listViewModel.getCollection() || this._items !== items)) {
                if (!this._listViewModel || !this._listViewModel.getCount()) {
                    _private.deleteListViewModelHandler(this, this._listViewModel);
                    if (this._listViewModel && !this._listViewModel.destroyed && !newOptions.collection) {
                        this._listViewModel.destroy();
                    }
                    _private.initializeModel(this, newOptions, items);
                    this._listVirtualScrollController.setItemsContainer(null);
                    this._listVirtualScrollController.setCollection(this._listViewModel);
                    this._updateIndicatorsController(newOptions, isSourceControllerLoadingNow);
                    this._indicatorsControllerOnCollectionReset();
                    if (_private.hasMarkerController(this)) {
                        _private.getMarkerController(this).updateOptions({
                            model: this._listViewModel,
                            markerVisibility: newOptions.markerVisibility
                        });
                    }

                    // TODO после выполнения код будет в одном месте
                    //  https://online.sbis.ru/opendoc.html?guid=59d99675-6bc4-436e-967a-34b448e8f3a4
                    // При пересоздании коллекции будет скрыт верхний триггер и индикатор,
                    // чтобы не было лишней подгрузки при отрисовке нового списка.
                    // Показываем по необходимости верхний индикатор и триггер
                    if (this._indicatorsController.shouldDisplayTopIndicator()) {
                        this._indicatorsController.displayTopIndicator(true);
                    } else {
                        this._listVirtualScrollController.setBackwardTriggerVisible(true);
                    }
                }

                // Если прислали новый рекордсет, то сохраняем позицию скролла.
                // Пока что от прикладников в ItemsView было желание только сохранять скролл.
                // Видимо придется добавить опцию, когда потребуется другое поведение.
                if (newOptions.items && newOptions.items !== this._items && !newOptions.source) {
                    this._listVirtualScrollController.enableKeepScrollPosition();
                }

                const isActionsAssigned = this._itemActionsController?.isActionsAssigned();
                _private.assignItemsToModel(this, items, newOptions);
                isItemsResetFromSourceController = true;

                // TODO удалить когда полностью откажемся от старой модели
                if (
                    !_private.hasSelectionController(this) && newOptions.multiSelectVisibility !== 'hidden' &&
                    newOptions.selectedKeys && newOptions.selectedKeys.length
                ) {
                    const controller = _private.createSelectionController(this, newOptions);
                    controller.setSelection({ selected: newOptions.selectedKeys, excluded: newOptions.excludedKeys });
                }

                // TODO удалить когда полностью откажемся от старой модели
                //  Если Items были обновлены, то в старой модели переинициализировался display
                //  и этот параметр сбросился
                if (this._itemActionsController) {
                    this._itemActionsController.setActionsAssigned(isActionsAssigned);
                }
                _private.initVisibleItemActions(this, newOptions);

                if (loadedBySourceController) {
                    this._indicatorsController.recountIndicators('all', true);
                }
            }

            if (newOptions.sourceController) {
                if (sourceControllerChanged) {
                    _private.executeAfterReloadCallbacks(this, this._items, newOptions);
                }

                if (loadedBySourceController && !this._sourceController.getLoadError()) {
                    if (this._listViewModel) {
                        this._listViewModel.setHasMoreData(_private.getHasMoreData(this));
                    }
                    if (!this._shouldNotResetPagingCache) {
                        this._cachedPagingState = false;
                    }
                    _private.resetScrollAfterLoad(this);
                    _private.tryLoadToDirectionAgain(this, null, newOptions);
                    _private.prepareFooter(this, newOptions, this._sourceController);
                }
            }
        }

        if (_private.hasSelectionController(this)) {
            _private.updateSelectionController(this, newOptions);

            const selectionController = _private.getSelectionController(this, newOptions);
            const allowClearSelectionBySelectionViewMode =
                this._options.selectionViewMode === newOptions.selectionViewMode ||
                newOptions.selectionViewMode !== 'selected';
            const isAllSelected = selectionController.isAllSelected(
                false, selectionController.getSelection(), this._options.root
            );
            const filterChanged = !isEqual(newOptions.filter, this._options.filter) ||
                !isEqual(newOptions.searchValue, this._options.searchValue);
            if (filterChanged && isAllSelected && allowClearSelectionBySelectionViewMode) {
                _private.changeSelection(this, { selected: [], excluded: [] });
            }
        }

        this._needBottomPadding = _private.needBottomPadding(this, newOptions);

        const shouldProcessMarker = newOptions.markerVisibility === 'visible'
            || newOptions.markerVisibility === 'onactivated'
            && newOptions.markedKey !== undefined || this._modelRecreated;

        // Если будет выполнена перезагрузка, то мы на событие reset применим новый ключ
        // Возможен сценарий, когда до загрузки элементов нажимают развернуть
        // ПМО и мы пытаемся посчитать маркер, но модели еще нет
        if (
            shouldProcessMarker &&
            !loadStarted &&
            !isSourceControllerLoadingNow &&
            this._listViewModel &&
            this._listViewModel.getCount()
        ) {
            let needCalculateMarkedKey = false;
            if (!_private.hasMarkerController(this) && newOptions.markerVisibility === 'visible') {
                // В этом случае маркер пытался проставиться, когда еще не было элементов.
                // Проставляем сейчас, когда уже точно есть
                needCalculateMarkedKey = true;
            }

            const markerController = _private.getMarkerController(this, newOptions);
            // могут скрыть маркер и занового показать,
            // тогда markedKey из опций нужно проставить даже если он не изменился
            // Нужно сравнивать новый ключ маркера с ключом маркера в состоянии контроллера, а не в старых опциях.
            // Т.к. может произойти несколько синхронизаций и маркер в старых опциях уже тоже будет изменен,
            // но в контроллер он не будет проставлен, т.к. в этот момент еще шла загрузка данных.
            if (
                (markerController.getMarkedKey() !== newOptions.markedKey
                || this._options.markerVisibility === 'hidden'
                && newOptions.markerVisibility === 'visible')
                && newOptions.markedKey !== undefined
            ) {
                markerController.setMarkedKey(newOptions.markedKey);
            } else if (this._options.markerVisibility !== newOptions.markerVisibility && newOptions.markerVisibility === 'visible' || this._modelRecreated || needCalculateMarkedKey) {
                // Когда модель пересоздается, то возможен такой вариант:
                // Маркер указывает на папку, TreeModel -> SearchViewModel, после пересоздания markedKey
                // будет указывать на хлебную крошку, но маркер не должен ставиться на нее,
                // поэтому нужно пересчитать markedKey

                const newMarkedKey = markerController.calculateMarkedKeyForVisible();
                this._changeMarkedKey(newMarkedKey);
            }
        } else if (_private.hasMarkerController(this) && newOptions.markerVisibility === 'hidden') {
            _private.getMarkerController(this).destroy();
            this._markerController = null;
        }

        // Когда удаляют все записи, мы сбрасываем selection, поэтому мы его должны применить даже когда список пуст
        if (this._items) {
            const selectionChanged = (!isEqual(this._options.selectedKeys, newOptions.selectedKeys)
                || !isEqual(this._options.excludedKeys, newOptions.excludedKeys)
                || this._options.selectedKeysCount !== newOptions.selectedKeysCount);

            const visibilityChangedFromHidden =
                this._options.multiSelectVisibility === 'hidden' && newOptions.multiSelectVisibility !== 'hidden';

            // В browser когда скрывают видимость чекбоксов, еще и сбрасывают selection
            if (
                selectionChanged &&
                (newOptions.multiSelectVisibility !== 'hidden' || _private.hasSelectionController(this)) ||
                visibilityChangedFromHidden &&
                newOptions.selectedKeys?.length ||
                this._options.selectionType !== newOptions.selectionType
            ) {
                const controller = _private.getSelectionController(this, newOptions);
                const newSelection = newOptions.selectedKeys === undefined
                    ? controller.getSelection()
                    : {
                        selected: newOptions.selectedKeys,
                        excluded: newOptions.excludedKeys || []
                    };
                controller.setSelection(newSelection);
                this._notify(
                    'listSelectedKeysCountChanged',
                    [controller.getCountOfSelected(), controller.isAllSelected()],
                    {bubbling: true}
                );
            }
        }
        if (newOptions.multiSelectVisibility === 'hidden' && _private.hasSelectionController(this)) {
            _private.getSelectionController(this).destroy();
            this._selectionController = null;
        }

        if (this._editInPlaceController) {
            this._editInPlaceController.updateOptions({
                collection: this._listViewModel
            });
        }

        // После нажатии на enter или лупу в строке поиска, будут загружены данные и установлены в recordSet,
        // если при этом в списке кол-во записей было 0 (ноль) и поисковой запрос тоже вернул 0 записей,
        // onCollectionChange у рекордсета не стрельнёт, и не сработает код,
        // запускающий подгрузку по скролу (в навигации more: true)
        if (newOptions.searchValue || this._loadedBySourceController) {
            _private.tryLoadToDirectionAgain(this, null, newOptions);
        }
        // В случае если у нас пустой список, то при сценарии выше не сработает событие reset. Поэтому нужно завершить
        // показ порционного поиска и начать его в этом месте,
        // по опциям от DataContainer(loading - loadStarted, loadedBySourceController)
        if (
            (!this._listViewModel || !this._listViewModel.getCount()) &&
            this._options.searchValue &&
            newOptions.searchValue &&
            _private.isPortionedLoad(this)
        ) {
            if (loadStarted) {
                this._indicatorsController.endDisplayPortionedSearch();
            } else if (this._loadedBySourceController) {
                const hasMore = _private.getHasMoreData(this);
                if (hasMore.up || hasMore.down) {
                    const direction = hasMore.down ? 'bottom' : 'top';
                    this._indicatorsController.startDisplayPortionedSearch(direction);
                }
            }
        }

        if (!loadStarted) {
            _private.doAfterUpdate(this, () => {
                if (this._listViewModel) {
                    this._listViewModel.setSearchValue(newOptions.searchValue);
                }
                if (this._sourceController) {
                    _private.setHasMoreData(this._listViewModel, _private.getHasMoreData(this));

                    if (this._pagingNavigation &&
                        this._items &&
                        loadedBySourceController) {
                        _private.updatePagingData(this, this._items.getMetaData().more, this._options);
                    }
                }
            });
            if (!isEqual(newOptions.groupHistoryId, this._options.groupHistoryId)) {
                if (this._listViewModel) {
                    this._listViewModel.setCollapsedGroups(
                        this._sourceController.getCollapsedGroups() ||
                        newOptions.collapsedGroups ||
                        []
                    );
                }
            }
        }
        // Если поменялись ItemActions, то закрываем свайп
        if (newOptions.itemActions !== this._options.itemActions) {
            _private.closeSwipe(this);
        }

        if (newOptions.hasItemWithImage !== this._options.hasItemWithImage) {
            this._hasItemWithImageChanged = true;
        }

        /*
         * Переинициализация ранее проинициализированных опций записи нужна при:
         * 1. Изменились опции записи
         * 3. Изменился коллбек видимости опции
         * 4. Записи в модели были пересозданы из sourceController
         * 5. обновилась опция readOnly (относится к TreeControl)
         * 6. обновилась опция itemActionsPosition
         */
        if (
            newOptions.itemActions !== this._options.itemActions ||
            newOptions.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
            isItemsResetFromSourceController ||
            newOptions.readOnly !== this._options.readOnly ||
            newOptions.itemActionsPosition !== this._options.itemActionsPosition
        ) {
            _private.updateInitializedItemActions(this, newOptions);
        }

        _private.updateFadeController(this, newOptions);

        if (this._itemsChanged) {
            this._shouldNotifyOnDrawItems = true;
        }

        this._spaceBlocked = false;

        this._updateBaseControlModel(newOptions);

        if (this._options.itemsSelector !== newOptions.itemsSelector) {
            this._listVirtualScrollController.setItemsQuerySelector(newOptions.itemsSelector);
        }

        this._endBeforeUpdate(newOptions);
        this._listVirtualScrollController.endBeforeUpdateListControl();
    }

    protected _startBeforeUpdate(newOptions: TOptions): void {
        // for override
    }

    protected _endBeforeUpdate(newOptions: TOptions): void {
        // for override
    }

    reloadItem(key: TKey, options: IReloadItemOptions = {}): Promise<Model | RecordSet> {
        checkReloadItemArgs(...arguments);

        const items = this._listViewModel.getCollection() as unknown as RecordSet;
        const currentItemIndex = items.getIndexByValue(this._keyProperty, key);
        const sourceController = _private.getSourceController(this, {...this._options, items: null});

        let reloadItemDeferred;
        let filter;
        let itemsCount;

        const loadCallback = (item): void => {
            if (options.replace) {
                items.replace(item, currentItemIndex);
            } else {
                items.at(currentItemIndex).merge(item);
            }
        };

        if (currentItemIndex === -1) {
            throw new Error('BaseControl::reloadItem no item with key ' + key);
        }

        if (options.method === 'query') {
            filter = cClone(this._options.filter);
            filter[this._keyProperty] = [key];

            sourceController.setFilter(filter);
            reloadItemDeferred = sourceController.load().then((loadedItems) => {
                if (loadedItems instanceof RecordSet) {
                    itemsCount = loadedItems.getCount();

                    if (itemsCount === 1) {
                        loadCallback(loadedItems.at(0));
                    } else if (itemsCount > 1) {
                        Logger.error('BaseControl: reloadItem::query returns wrong amount of items for reloadItem call with key: ' + key);
                    } else {
                        Logger.info('BaseControl: reloadItem::query returns empty recordSet.');
                    }
                }
                return loadedItems;
            });
        } else {
            reloadItemDeferred = sourceController.read(key, options.readMeta).then((item) => {
                if (item) {
                    loadCallback(item);
                } else {
                    Logger.info('BaseControl: reloadItem::read do not returns record.');
                }
                return item;
            });
        }

        return reloadItemDeferred.addErrback((error) => {
            return process({error});
        });
    }

    getItems(): RecordSet {
        return this._items;
    }

    scrollToItem(key: TItemKey, position?: string, force?: boolean): Promise<void> {
        return _private.scrollToItem(this, key, position, force);
    }

    _onValidateCreated(e: Event, control: ValidateContainer): void {
        this._validateController.addValidator(control);
    }

    _onValidateDestroyed(e: Event, control: ValidateContainer): void {
        this._validateController.removeValidator(control);
    }

    protected _afterReloadCallback(options, loadedList: RecordSet): void {
        /* FIXME: sinon mock */
    }
    protected _getColumnsCount(): number {
        return 0;
    }
    protected _getSpacing(): number {
        return 0;
    }

    _beforeUnmount() {
        if (this._checkTriggerVisibilityTimeout) {
            clearTimeout(this._checkTriggerVisibilityTimeout);
        }
        this._destroyIndicatorsController();
        if (this._listVirtualScrollController) {
            this._listVirtualScrollController.beforeUnmountListControl();
            this._listVirtualScrollController = null;
        }
        if (this._itemActionsController) {
            this._itemActionsController = null;
        }
        if (this._options.itemsDragNDrop) {
            const container = this._container[0] || this._container;
            container.removeEventListener('dragstart', this._nativeDragStart);
            this._notify('_removeDraggingTemplate', [], {bubbling: true});
        }
        // Если sourceController есть в опциях, значит его создали наверху
        // например list:DataContainer, и разрушать его тоже должен создатель.
        if (this._sourceController) {
            if (!this._options.sourceController) {
                this._sourceController.destroy();
            } else {
                this._sourceController.unsubscribe('dataLoad', this._dataLoadCallback);
            }
            this._sourceController = null;
        }

        if (this._notifyPlaceholdersChanged) {
            this._notifyPlaceholdersChanged = null;
        }

        if (this._scrollPagingCtr) {
            this._scrollPagingCtr.destroy();
        }

        if (this._editInPlaceController) {
            this._destroyEditInPlaceController();
        }

        if (this._listViewModel) {
            _private.deleteListViewModelHandler(this, this._listViewModel);
            // коллекцию дестроим только, если она была создана в BaseControl(не передана в опциях)
            if (!this._options.collection) {
                this._listViewModel.destroy();
            }
        }

        if (this._portionedSearch) {
            this._portionedSearch.destroy();
            this._portionedSearch = null;
        }

        this._validateController.destroy();
        this._validateController = null;

        // для связи с контроллером ПМО
        this._notify('unregister', ['selectedTypeChanged', this], {bubbling: true});

        this._notify('unregister', ['documentDragStart', this], {bubbling: true});
        this._notify('unregister', ['documentDragEnd', this], {bubbling: true});
        UnregisterUtil(this, 'loadToDirection');

        this._unregisterMouseMove();
        this._unregisterMouseUp();

        _private.closePopup(this, this._itemActionsMenuId);

        // При разрушении списка нужно в ПМО сбросить счетчик выбранных записей
        if (_private.hasSelectionController(this)) {
            this._notify('listSelectedKeysCountChanged', [0, false], {bubbling: true});
        }

        if (constants.isBrowserPlatform) {
            window.removeEventListener('resize', this._onWindowResize);
        }

        super._beforeUnmount();
    }

    _destroyEditInPlaceController() {
        this._editInPlaceController.destroy();
        this._editInPlaceController = null;
        this._editInPlaceInputHelper = null;
    }

    protected _beforeRender(): void {
        this._listVirtualScrollController.beforeRenderListControl();
        const hasNotRenderedChanges = this._hasItemWithImageChanged ||
            this._indicatorsController.hasNotRenderedChanges();
        if (hasNotRenderedChanges && !this._loadedBySourceController && !!this._scrollTop) {
            this._listVirtualScrollController.saveScrollPosition();
        }
    }

    _afterRender(): void {
        // TODO: https://online.sbis.ru/opendoc.html?guid=2be6f8ad-2fc2-4ce5-80bf-6931d4663d64
        if (this._container) {
            this._viewSize = _private.getViewSize(this, true);
        }

        this._listVirtualScrollController.afterRenderListControl();
        this._hasItemWithImageChanged = false;

        // Обновлять additionalTriggersOffsets нужно только после отрисовки, чтобы триггер случайно не сработал
        this._listVirtualScrollController.setAdditionalTriggersOffsets(this._getAdditionalTriggersOffsets());

        if (this._recalcPagingVisible) {
            if (!this._pagingVisible) {
                _private.initPaging(this);
            }
        }

        if (this._pagingVisible && this._isPagingPadding()) {
            this._updatePagingPadding();
        }
        if (this._pagingVisibilityChanged) {
            this._notify('controlResize', [], { bubbling: true });
            this._pagingVisibilityChanged = false;
        }

        if (this._loadedItems) {
            this._loadedItems = null;
        }

        if (this._updateShadowModeBeforePaint) {
            this._updateShadowModeBeforePaint();
            this._updateShadowModeBeforePaint = null;
        }

        if (this._drawingIndicatorDirection) {
            this._indicatorsController.hideDrawingIndicator(
                this._getIndicatorDomElement(this._drawingIndicatorDirection),
                this._drawingIndicatorDirection
            );
            this._drawingIndicatorDirection = null;
        }
        this._indicatorsController.afterRenderCallback();

        this._actualPagingVisible = this._pagingVisible;

        if (this._resolveAfterBeginEdit) {
            this._resolveAfterBeginEdit();
        }

        if (
            this._editInPlaceController &&
            this._editInPlaceController.isEditing() &&
            !this._editInPlaceController.isEndEditProcessing()
        ) {
            _private.activateEditingRow(this);
        }

        // При изменении коллекции на beforeUpdate индексы раставляются отложенно.
        // Поэтому вызывать обновление itemActions можно только на _afterRender.
        if (this._itemActionsController && this._shouldUpdateActionsAfterRender) {
            _private.updateInitializedItemActions(this, this._options);
            this._shouldUpdateActionsAfterRender = false;
        }

        if (this._applySelectedPage && this._shouldNotifyOnDrawItems) {
            this._applySelectedPage();
        }
        this._updateInProgress = false;
        this._notifyOnDrawItems();
        this._loadedBySourceController = false;

        if (this.callbackAfterRender) {
            this.callbackAfterRender.forEach((callback) => {
                callback();
            });
            this.callbackAfterRender = null;
        }

        if (
            this._indicatorsController.isDisplayedPortionedSearch() &&
            _private.isMaxCountNavigation(this._options.navigation) &&
            !_private.needLoadByMaxCountNavigation(this._listViewModel, this._options.navigation)) {
            this._indicatorsController.endDisplayPortionedSearch();
        } else if (this._indicatorsController.shouldStopDisplayPortionedSearch()) {
            // это нужно делать после вызова всех колбэков, т.к. остановка порционного поиска по необходимости
            // может вызвать отрисовку верхней ромашки. Эта отрисовка юзает колбэки выше, но мы должны попасть через них
            // в следующую отрисовку, чтобы ромашка уже была точно отрисована.
            this._indicatorsController.stopDisplayPortionedSearch();
        }
    }

    /**
     * На основании настроек навигации определяет нужна ли подгрузка данных при скроле
     */
    protected _shouldLoadOnScroll(direction: string): boolean {
        return !this._destroyed && _private.isInfinityNavigation(this._options.navigation);
    }

    _notifyOnDrawItems(): void {
        if (this._shouldNotifyOnDrawItems) {
            this._notify('drawItems');
            this._shouldNotifyOnDrawItems = false;
            this._itemsChanged = false;
            this._onDrawItems();
        }
    }

    protected _onDrawItems() {
        if (this._doAfterDrawItems) {
            this._doAfterDrawItems();
            this._doAfterDrawItems = null;
        }
    }

    _afterUpdate(oldOptions): void {
        if (!this._sourceController?.getLoadError()) {
            if (!this._observerRegistered) {
                this._registerObserver();
            }
        }

        // Запустить валидацию, которая была заказана методом commit у редактирования по месту, после
        // применения всех обновлений реактивных состояний.
        if (this._isPendingDeferSubmit) {
            this._validateController.resolveSubmit();
            this._isPendingDeferSubmit = false;
        }

        this._wasScrollToEnd = false;
        this._scrollPageLocked = false;
        this._modelRecreated = false;

        if (this._sourceControllerLoadingResolver) {
            this._sourceControllerLoadingResolver();
        }
        // Перестраиваем свайп на afterUpdate, когда точно уже известен новый размер записи
        // Перестроение должно произойти только в том случае, когда изменился размер записи
        if (this._itemActionsController && this._itemActionsController.isSwiped()) {
            this._itemActionsController.updateSwipeConfigIfNeed(
                this._container,
                _private.getViewUniqueClass(this),
                LIST_MEASURABLE_CONTAINER_SELECTOR
            );
        }
        if (this._callbackAfterUpdate) {
            this._callbackAfterUpdate.forEach((callback) => {
                callback();
            });
            this._callbackAfterUpdate = null;
        }
    }

    __onPagingArrowClick(e, arrow) {
        this._isPagingArrowClick = true;
        switch (arrow) {
            case 'Next':
                _private.scrollPage(this, 'Down');
                break;
            case 'Prev':
                _private.scrollPage(this, 'Up');
                break;
            case 'Begin':
                const resultEvent = this._notify('pagingArrowClick', ['Begin'], {bubbling: true});
                if (resultEvent !== false) {
                    _private.scrollToEdge(this, 'up');
                }
                break;
            case 'End':
                const resultEvent = this._notify('pagingArrowClick', ['End'], {bubbling: true});
                if (resultEvent !== false) {
                    _private.scrollToEdge(this, 'down');
                }
                break;
            case 'Reset':
                this._scrolled = false;
                this.reload();
                break;
        }
    }
    _canScroll(scrollTop: number, direction): boolean {
        const placeholder = this._placeholders?.backward;
        return !(direction === 'down' && scrollTop - placeholder + this._viewportSize > this._viewSize ||
            direction === 'up' && scrollTop - placeholder < 0);
    }
    _hasEnoughData(page: number): boolean {
        const neededItemsCount = this._scrollPagingCtr.getNeededItemsCountForPage(page);
        const itemsCount = this._listViewModel.getCount();
        return neededItemsCount <= itemsCount;
    }
    __selectedPageChanged(e, page: number) {
        let scrollTop = this._scrollPagingCtr.getScrollTopByPage(page, this._getScrollParams());
        const direction = this._currentPage < page ? 'down' : 'up';
        const canScroll = this._canScroll(scrollTop, direction);
        const itemsCount = this._items.getCount();
        const allDataLoaded = _private.getAllDataCount(this) === itemsCount;
        const startIndex = this._listViewModel.getStartIndex();
        const stopIndex = this._listViewModel.getStopIndex();
        if (!canScroll && allDataLoaded && direction === 'up' && startIndex === 0) {
            scrollTop = 0;
            page = 1;
        }
        if (!canScroll && allDataLoaded && direction === 'down' && stopIndex === this._listViewModel.getCount()) {
            page = this._pagingCfg.pagesCount;
        }
        this._applySelectedPage = () => {
            this._currentPage = page;
            scrollTop = this._scrollPagingCtr.getScrollTopByPage(page, this._getScrollParams());
            if (this._canScroll(scrollTop, direction)) {
                this._applySelectedPage = null;

                this._notify('doScroll', [scrollTop], {bubbling: true});
            }
        };
        if (this._currentPage === page) {
            this._applySelectedPage();
            return;
        } else {
            this._selectedPageHasChanged = true;
        }

        // При выборе первой или последней страницы крутим в край.
        if (page === 1) {
            this._currentPage = page;
            _private.scrollToEdge(this, 'up');
        } else if (page === this._pagingCfg.pagesCount) {
            this._currentPage = page;
            _private.scrollToEdge(this, 'down');
        } else {

            // При выборе некрайней страницы, проверяем,
            // можно ли проскроллить к ней, по отрисованным записям
            if (canScroll) {
                this._applySelectedPage();
            } else {
                // если нельзя проскроллить, проверяем, хватает ли загруженных данных для сдвига диапазона
                // или нужно подгружать еще.
                if (this._hasEnoughData(page)) {
                    this._applySelectedPage = null;
                    this._listVirtualScrollController.scrollToPage(direction === 'up' ? 'backward' : 'forward');
                } else {
                    this._loadMore(direction);
                }
            }
        }
    }

    __needShowEmptyTemplate(newOptions?: IBaseControlOptions): boolean {
        // Described in this document:
        // https://docs.google.com/spreadsheets/d/1fuX3e__eRHulaUxU-9bXHcmY9zgBWQiXTmwsY32UcsE
        const options = newOptions || this._options;
        const listViewModel = this._listViewModel;
        const emptyTemplate = options.emptyTemplate;
        const emptyTemplateColumns = options.emptyTemplateColumns;

        const noData = !listViewModel || !listViewModel.getCount();
        const noEdit = !listViewModel || !_private.isEditing(this);
        const isLoading = this._sourceController && this._sourceController.isLoading();
        const notHasMore = !_private.hasMoreDataInAnyDirection(this);
        const noDataBeforeReload = this._noDataBeforeReload;
        return (emptyTemplate || emptyTemplateColumns) &&
            noEdit &&
            notHasMore &&
            (isLoading ? noData && noDataBeforeReload : noData);
    }

    _onCheckBoxClick(e: SyntheticEvent, item: CollectionItem<Model>, originalEvent: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();

        const contents = _private.getPlainItemContents(item);
        const key = contents.getKey();
        const readOnly = item.isReadonlyCheckbox();

        this._onLastMouseUpWasDrag = false;

        if (!readOnly) {
            const selectionController = _private.getSelectionController(this);

            let newSelection;

            if (originalEvent.nativeEvent && originalEvent.nativeEvent.shiftKey) {
                newSelection = _private.getSelectionController(this).selectRange(key);
            } else {
                newSelection = _private.getSelectionController(this).toggleItem(key);
            }

            this._notify('checkboxClick', [key, item.isSelected()]);
            this._notify('selectedLimitChanged', [selectionController.getLimit()]);
            _private.changeSelection(this, newSelection);
        }

        // если чекбокс readonly, то мы все равно должны проставить маркер
        this.setMarkedKey(key);
    }

    reload(keepNavigation: boolean = false, sourceConfig?: IBaseSourceConfig): Promise<any> {

        if (keepNavigation) {
            this._listVirtualScrollController.enableKeepScrollPosition();
            if (!sourceConfig) {
                if (this._options.navigation?.source === 'position') {
                    const maxLimit = Math.max(this._options.navigation.sourceConfig.limit, this._items.getCount());
                    sourceConfig = {...(this._options.navigation.sourceConfig), limit: maxLimit};
                }
                if (this._options.navigation?.source === 'page') {
                    const navPageSize = this._options.navigation.sourceConfig.pageSize;
                    const pageSize = Math.max(
                        Math.ceil(this._items.getCount() / navPageSize) * navPageSize,
                        navPageSize
                    );
                    sourceConfig = {...(this._options.navigation.sourceConfig), page: 0, pageSize};
                }
            } else {

                // Если перезагружают на конкретной позиции, это значит, что нужно будет восстановить скролл.
                if (this._options.navigation.source === 'position' &&
                    this._options.navigation.sourceConfig.position !== sourceConfig.position) {
                    this._listVirtualScrollController.enableRestoreScrollPosition();
                }
            }
        } else {

            // При перезагрузке через public-метод полностью сбрасываем состояние cut-навигации
            // https://online.sbis.ru/opendoc.html?guid=73d5765b-598a-4e2c-a867-91a54150ae9e
            if (this._cutExpanded) {
                this._cutExpanded = false;
                this._sourceController.setNavigation(this._options.navigation);
            }
        }

        // Вызов перезагрузки из публичного API должен завершать имеющееся редактирование по месту.
        // Во время редактирования перезагрузка допустима только в момент завершения редактирования,
        // точка - beforeEndEdit. При этом возвращение промиса перезагрузки обязательно.
        const cancelEditPromise = this.isEditing() && !this._getEditInPlaceController().isEndEditProcessing() ?
            this._cancelEdit(true).catch(() => {
                // Перезагрузку не остановит даже ошибка во время завершения редактирования.
                // При отмене редактирования с флагом force ошибка может упасть только в прикладном коде.
                // Уведомлением об упавших ошибках занимается контроллер редактирования.
            }) : Promise.resolve();

        return cancelEditPromise.then(() => {
            if (!this._destroyed) {
                // Не дожидаемся применения изменений в модель после обновления списка,
                // если перезагрузка вызвана в момент завершения редактирования.
                const isEndEditingProcessing = this.isEditing() &&
                                               this._getEditInPlaceController().isEndEditProcessing();
                return this._reload(this._options, sourceConfig, isEndEditingProcessing);
            }
        });
    }

    protected _reload(cfg, sourceConfig?: IBaseSourceConfig, immediateResolve: boolean = true):
        Promise<RecordSet|null|void> {
        return new Promise((resolve) => {
            if (this._sourceController) {
                this._indicatorsController.endDisplayPortionedSearch();
                this._sourceController.reload(sourceConfig)
                    .then((list) => {
                        if (this._destroyed) {
                            resolve(null);
                            return;
                        }

                        if (immediateResolve) {
                            resolve(list as RecordSet);
                        } else {
                            this._resolveSourceLoadPromise(() => resolve(list as RecordSet));
                        }
                    })
                    .catch((error) => error);
            } else {
                resolve(void 0);
                Logger.error('BaseControl: Source option is undefined. Can\'t load data', this);
            }
        });
    }

    private _resolveSourceLoadPromise(nativeResolver: Function): void {
        this._sourceControllerLoadingResolver = () => {
            nativeResolver();
            this._sourceControllerLoadingResolver = null;
        };
        this._forceUpdate();
    }

    // TODO удалить, когда будет выполнено наследование контролов (TreeControl <- BaseControl)
    setMarkedKey(key: CrudEntityKey): void {
        if (this._options.markerVisibility !== 'hidden') {
            this._changeMarkedKey(key);
        }
    }

    getMarkerController(): MarkerController {
        return _private.getMarkerController(this, this._options);
    }

    protected _changeMarkedKey(newMarkedKey: CrudEntityKey,
                               shouldFireEvent: boolean = false): Promise<CrudEntityKey>|CrudEntityKey {
        const markerController = _private.getMarkerController(this);
        if ((newMarkedKey === undefined || newMarkedKey === markerController.getMarkedKey()) && !shouldFireEvent) {
            return newMarkedKey;
        }

        const eventResult: Promise<CrudEntityKey>|CrudEntityKey =
            this._notify('beforeMarkedKeyChanged', [newMarkedKey]);

        const handleResult = (key) => {
            // Прикладники могут как передавать значения в markedKey, так и передавать undefined.
            // И при undefined нужно делать так, чтобы markedKey задавался по нашей логике.
            // Это для трюка от Бегунова когда делают bind на переменную, которая изначально undefined.
            // В таком случае, чтобы не было лишних синхронизаций - мы работаем по нашему внутреннему state.
            if (this._options.markedKey === undefined) {
                markerController.setMarkedKey(key);
            }
            this._notify('markedKeyChanged', [key]);
        };

        let result = eventResult;
        if (eventResult instanceof Promise) {
            eventResult.then((key) => {
                handleResult(key);
                return key;
            });
        } else if (eventResult !== undefined && this._environment) {
            // Если не был инициализирован environment, то _notify будет возвращать null,
            // но это значение используется, чтобы сбросить маркер. Актуально для юнитов
            handleResult(eventResult);
        } else {
            result = newMarkedKey;
            handleResult(newMarkedKey);
        }

        return result;
    }

    protected _shouldMoveMarkerOnScrollPaging(): boolean {
        return this._options.moveMarkerOnScrollPaging;
    }

    protected _hasMoreData(direction: Direction): boolean {
        return !!(this._sourceController && this._sourceController.hasMoreData(direction));
    }

    protected _loadItemsToDirection(direction: IDirection): Promise<RecordSet|Error> {
        return this._sourceController.load(direction);
    }

    private _commitEditInGroupBeforeCollapse(groupItem): TAsyncOperationResult {
        if (!this.isEditing() || !groupItem.isExpanded()) {
            return Promise.resolve();
        }

        const editingItem = this.getViewModel().getItems().find((item) => item.isEditing());
        const groupId = this.getViewModel().getGroup()(editingItem.getContents());

        if (groupId !== groupItem.getContents()) {
            return Promise.resolve();
        }

        return this._commitEdit();
    }

    _onGroupClick(e, groupId, baseEvent, dispItem) {
        if (baseEvent.target.closest('.controls-ListView__groupExpander')) {
            const collection = this._listViewModel;
            const needExpandGroup = !dispItem.isExpanded();

            this._commitEditInGroupBeforeCollapse(dispItem).then((result) => {
                if (result && result.canceled) {
                    return result;
                }
                dispItem.setExpanded(needExpandGroup);

                // TODO https://online.sbis.ru/opendoc.html?guid=e20934c7-95fa-44f3-a7c2-c2a3ec32e8a3
                // По задаче предлагается объединить collapsedGroups и collapsedItems.
                // Сейчас collapsedGroups необходим стратегии группировки в модели при создании и перерисовке групп.
                // Стратегия группировки всегда заново пересоздаёт группы и опирается на это свойство для получения
                // информации о свёрнутости групп.
                const collapsedGroups = collection.getCollapsedGroups() || [];
                const groupIndex = collapsedGroups.indexOf(groupId);
                if (groupIndex === -1) {
                    if (!needExpandGroup) {
                        collapsedGroups.push(groupId);
                    }
                } else if (needExpandGroup) {
                    collapsedGroups.splice(groupIndex, 1);
                }
                const changes = {
                    changeType: needExpandGroup ? 'expand' : 'collapse',
                    group: groupId,
                    collapsedGroups
                };
                // При setExpanded() не обновляется collection.collapsedGroups, на основе которого стратегия
                // определяет, какие группы надо создавать свёрнутыми. Поэтому обновляем его тут.
                collection.setCollapsedGroups(collapsedGroups);
                _private.groupsExpandChangeHandler(this, changes);
            });
            this._notify('groupClick', [dispItem.getContents(), baseEvent, dispItem]);
        }
    }

    isLoading(): boolean {
        return this._sourceController && this._sourceController.isLoading();
    }

    _onItemClick(e, item, originalEvent, columnIndex = null) {
        _private.closeSwipe(this);

        if (originalEvent?.nativeEvent?.button === 1) {
            // на MacOS нажатие средней кнопкой мыши порождает событие click, но обычно кликом считается только ЛКМ
            e.stopPropagation();
            return;
        }

        if (this._itemActionMouseDown) {
            // Не нужно кликать по Item, если MouseDown был сделан по ItemAction
            this._itemActionMouseDown = null;
            e.stopPropagation();
            return;
        }

        if (this._onLastMouseUpWasDrag) {
            // Если на mouseUp, предшествующий этому клику, еще работало перетаскивание,
            // то мы не должны нотифаить itemClick
            this._onLastMouseUpWasDrag = false;
            e.stopPropagation();
            return;
        }

        if (this._onLastMouseUpWasOpenUrl) {
            // Если на mouseUp, предшествующий этому клику, сработало открытие ссылки,
            // то события клика быть не должно.
            this._onLastMouseUpWasOpenUrl = false;
            e.stopPropagation();
            return;
        }

        const canEditByClick = !this._options.readOnly && this._getEditingConfig().editOnClick && (
            // В процессе перехода на новые коллекции был неспециально изменен способ навешивания классов
            // для разделителей строки и колонок. Классы должны вешаться в шаблоне колонки, т.к. на этом
            // шаблоне есть несколько опций, регулирующих внешний вид ячейки (cursor и editable).
            // при применении классов "выше" шаблона колонки, визуальные изменения не применяются к разделителям.
            // Это приводит к ошибкам:
            // 1) курсор в ячейке "стрелка", а над разделителями - "указатель-лапка"
            // 2) в ячейке запрещено редактирование, но клик по разделителю запускает редактирование.
            // TODO: Убрать по задаче проверку ну '.js-controls-ListView__editingTarget' по задаче
            //  https://online.sbis.ru/opendoc.html?guid=deef0d24-dd6a-4e24-8782-5092e949a3d9
            originalEvent.target.closest('.js-controls-ListView__editingTarget') && !originalEvent.target.closest(`.${JS_SELECTORS.NOT_EDITABLE}`)
        );
        if (canEditByClick) {
            e.stopPropagation();
            this._savedItemClickArgs = [e, item, originalEvent, columnIndex];
            const hasCheckboxes =
                this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition !== 'custom';

            this._beginEdit({ item }, { columnIndex: columnIndex + hasCheckboxes }).then((result) => {
                if (!(result && result.canceled)) {
                    this._editInPlaceInputHelper.setClickInfo(originalEvent.nativeEvent, item);
                }
                return result;
            });
        } else {
            if (this._editInPlaceController) {
                this._commitEdit();
            }

            // При клике по элементу может случиться 2 события: itemClick и itemActivate.
            // itemClick происходит в любом случае, но если список поддерживает редактирование по месту, то
            // порядок событий будет beforeBeginEdit -> itemClick
            // itemActivate происходит в случае активации записи.
            // Если в списке не поддерживается редактирование, то это любой клик.
            // Если поддерживается, то событие не произойдет если успешно запустилось редактирование записи.
            if (e.isBubbling()) {
                e.stopPropagation();
            }
            const eventResult = this._notifyItemClick([e, item, originalEvent, columnIndex]);
            if (eventResult !== false) {
                this._notify('itemActivate', [item, originalEvent, columnIndex], {bubbling: true});
            }
        }
    }

    /**
     * Останавливает всплытие события updateShadowMode от внутренних списков. Иначе они могут испортить видимость
     * тени у ScrollContainer.
     */
    protected _stopInnerUpdateShadowMode(event: SyntheticEvent): void {
        event.stopImmediatePropagation();
    }

    protected _notifyItemClick(args: [SyntheticEvent?, Model, SyntheticEvent, number?]): boolean {
        const notifyArgs = args.slice(1);
        return this._notify('itemClick', notifyArgs, { bubbling: true }) as boolean;
    }

    // region EditInPlace

    _getEditInPlaceController(): EditInPlaceController {
        if (!this._editInPlaceController) {
            this._createEditInPlaceController();
        }
        return this._editInPlaceController;
    }

    _createEditInPlaceController(options = this._options): void {
        this._editInPlaceInputHelper = new EditInPlaceInputHelper();

        // При создании редактирования по мсесту до маунта, регистрация в formController
        // произойдет после маунта, т.к. она реализована через события. В любом другом случае,
        // регистрация произойдет при создании контроллера редактирования.
        if (this._isMounted) {
            _private.registerFormOperation(this);
        }

        this._editInPlaceController = new EditInPlaceController({
            mode: this._getEditingConfig(options).mode,
            collection: this._listViewModel,
            onBeforeBeginEdit: this._beforeBeginEditCallback.bind(this),
            onAfterBeginEdit: this._afterBeginEditCallback.bind(this),
            onBeforeEndEdit: this._beforeEndEditCallback.bind(this),
            onAfterEndEdit: this._afterEndEditCallback.bind(this)
        });
    }

    _beforeBeginEditCallback(params: IBeforeBeginEditCallbackParams) {
        return new Promise((resolve) => {
            // Редактирование может запуститься при построении.
            const eventResult = this._isMounted ? this._notify('beforeBeginEdit', params.toArray()) : undefined;
            if (this._savedItemClickArgs && this._isMounted) {
                // itemClick стреляет, даже если после клика начался старт редактирования, но itemClick
                // обязательно должен случиться после события beforeBeginEdit.
                this._notifyItemClick(this._savedItemClickArgs);
            }

            resolve(eventResult);
        }).then((result) => {

            if (result === LIST_EDITING_CONSTANTS.CANCEL) {
                if (this._continuationEditingDirection) {
                    return this._continuationEditingDirection;
                } else {
                    if (this._savedItemClickArgs && this._isMounted) {
                        // Запись становится активной по клику, если не началось редактирование.
                        // Аргументы itemClick сохранены в состояние и используются для нотификации об активации
                        // элемента.
                        this._notify('itemActivate', this._savedItemClickArgs.slice(1), {bubbling: true});
                    }
                    return result;
                }
            }

            // Если запускается редактирование существующей записи,
            // то сразу переходим к следующему блоку
            if (!params.isAdd) {
                return result;
            }

            //region Обработка добавления записи
            const sourceController = this.getSourceController();
            // Добавляемы итем берем либо из результата beforeBeginEdit
            // либо из параметров запуска редактирования
            const addedItem = result?.item || params.options?.item;

            // Если нет источника и к нам не пришел новый добавляемый итем, то ругаемся
            if (!sourceController && !addedItem) {
                throw new Error('You use list without source. So you need to manually create new item when processing an event beforeBeginEdit');
            }

            // Если есть источник и сверху не пришел добавляемый итем, то выполним запрос на создание новой записи
            if (sourceController && !(addedItem instanceof Model)) {
                return sourceController
                    .create(!this._isMounted ? params.options.filter : undefined)
                    .then((item) => {
                        if (item instanceof Model) {
                            return {item};
                        }

                        throw Error('BaseControl::create before add error! Source returned non Model.');
                    })
                    .catch((error: Error) => {
                        return process({error});
                    });
            }
            //endregion

            return result;
        }).then((result) => {
            const editingConfig = this._getEditingConfig();

            // Скролим к началу/концу списка. Данная операция может и скорее всего потребует перезагрузки списка.
            // Не вся бизнес логика поддерживает загрузку первой/последней страницы при курсорной навигации.
            // TODO: Поддержать везде по задаче
            //  https://online.sbis.ru/opendoc.html?guid=000ff88b-f37e-4aa6-9bd3-3705bb721014
            if (editingConfig.task1181625554 && params.isAdd) {
                return _private
                    .scrollToEdge(this, editingConfig.addPosition === 'top' ? 'up' : 'down')
                    .then(() => {
                        return result;
                    });
            } else {
                return result;
            }
        }).finally(() => {
            this._savedItemClickArgs = null;
        });
    }

    _afterBeginEditCallback(item: IEditableCollectionItem, isAdd: boolean): Promise<void> {
        // Завершение запуска редактирования по месту проиходит после построения редактора.
        // Исключение - запуск редактирования при построении списка. В таком случае,
        // уведомлений о запуске редактирования происходить не должно, а дождаться построение
        // редактора невозможно(построение списка не будет завершено до выполнения данного промиса).
        return new Promise((resolve) => {
            // Принудительно прекращаем заморозку ховера
            if (_private.hasHoverFreezeController(this)) {
                this._hoverFreezeController.unfreezeHover();
            }
            // Операции над записью должны быть обновлены до отрисовки строки редактирования,
            // иначе будет "моргание" операций.
            _private.removeShowActionsClass(this);
            _private.updateItemActions(this, this._options, item);
            this._continuationEditingDirection = null;

            if (this._isMounted) {
                this._resolveAfterBeginEdit = resolve;
            } else {
                resolve();
            }
        }).then(() => {
            this._editingItem = item;
            // Редактирование может запуститься при построении.
            if (this._isMounted) {
                this._notify('afterBeginEdit', [item.contents, isAdd]);

                if (this._listViewModel.getCount() > 1 && !isAdd) {
                    this.setMarkedKey(item.contents.getKey());
                }
            }

            if (this._pagingVisible && this._options.navigation.viewConfig.pagingMode === 'edge') {
                this._pagingVisible = false;
            }

            item.contents.subscribe('onPropertyChange', this._resetValidation);
        }).then(() => {
            // Подскролл к редактору
            if (this._isMounted) {
                return _private.scrollToItem(this, item.contents.getKey(), 'top', false);
            }
        });
    }

    _beforeEndEditCallback(params: IBeforeEndEditCallbackParams): Promise<void> {
        if (params.force) {
            this._notify('beforeEndEdit', params.toArray());
            return;
        }

        return Promise.resolve().then(() => {
            if (!params.willSave) {
                return ;
            }

            // Валидация запускается не моментально, а после заказанного для нее цикла синхронизации.
            // Такая логика необходима, если синхронно поменяли реактивное состояние, которое будет валидироваться
            // и позвали валидацию. В таком случае, первый цикл применит все состояния и только после него произойдет
            // валидация.
            // _forceUpdate гарантирует, что цикл синхронизации будет, т.к. невозможно понять поменялось ли какое-то
            // реактивное состояние.
            const submitPromise = this._validateController.deferSubmit();
            this._isPendingDeferSubmit = true;
            this._forceUpdate();
            return submitPromise.then((validationResult) => {
                for (const key in validationResult) {
                    if (validationResult.hasOwnProperty(key) && validationResult[key]) {
                        return LIST_EDITING_CONSTANTS.CANCEL;
                    }
                }
            });
        }).then((result) => {
            if (result === LIST_EDITING_CONSTANTS.CANCEL) {
                return result;
            }

            const eventResult = this._notify('beforeEndEdit', params.toArray());

            // Если пользователь не сохранил добавляемый элемент, используется платформенное сохранение.
            // Пользовательское сохранение потенциально может начаться только если вернули Promise
            const shouldUseDefaultSaving =
                params.willSave &&
                (params.isAdd || params.item.isChanged()) &&
                (
                    !eventResult ||
                    (eventResult !== LIST_EDITING_CONSTANTS.CANCEL && !(eventResult instanceof Promise))
                );

            return shouldUseDefaultSaving
                ? this._saveEditingInSource(params.item, params.isAdd, params.sourceIndex)
                : Promise.resolve(eventResult);
        }).catch((error: Error) => {
            return process({error}).then(() => {
                return LIST_EDITING_CONSTANTS.CANCEL;
            });
        });
    }

    _afterEndEditCallback(item: IEditableCollectionItem, isAdd: boolean, willSave: boolean): void {
        this._notify('afterEndEdit', [item.contents, isAdd]);
        this._editingItem = null;

        if (this._listViewModel.getCount() > 1) {
            if (this._markedKeyAfterEditing) {
                // если закрыли добавление записи кликом по другой записи, то маркер должен встать на 'другую' запись
                this.setMarkedKey(this._markedKeyAfterEditing);
                this._markedKeyAfterEditing = null;
            } else if (isAdd && willSave) {
                this.setMarkedKey(item.contents.getKey());
            } else if (_private.hasMarkerController(this)) {
                const controller = _private.getMarkerController(this);
                controller.setMarkedKey(controller.getMarkedKey());
            }
        }

        item.contents.unsubscribe('onPropertyChange', this._resetValidation);
        _private.removeShowActionsClass(this);
        // Этот код страбатывает асинхронно. Может оказаться, что индексы ещё не расставлены.
        // Гарантированно можно обновить itemActions только на afterRender
        this._shouldUpdateActionsAfterRender = true;
    }

    _resetValidation() {
        this._validateController?.setValidationResult(null);
    }

    isEditing(): boolean {
        return _private.isEditing(this);
    }

    beginEdit(userOptions: object): Promise<void | {canceled: true}> {
        if (this._options.readOnly) {
            return BaseControl._rejectEditInPlacePromise('beginEdit');
        }
        // В публичном API поьзователь указывает индекс колонки из конфигурации, не зная про множественный выбор.
        // Модель строки работает по индексам своих внутренних колонок (Cell), к которых есть колонка-чекбокс.
        // FIXME: Не должно быть в BaseControl, унести в GridControl.
        const hasCheckboxes = this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition !== 'custom';
        return this._beginEdit(userOptions, {
            shouldActivateInput: userOptions?.shouldActivateInput,
            columnIndex: (userOptions?.columnIndex || 0) + hasCheckboxes
        });
    }

    beginAdd(userOptions: object): Promise<void | { canceled: true }> {
        if (this._options.readOnly) {
            return BaseControl._rejectEditInPlacePromise('beginAdd');
        }
        // В публичном API поьзователь указывает индекс колонки из конфигурации, не зная про множественный выбор.
        // Модель строки работает по индексам своих внутренних колонок (Cell), к которых есть колонка-чекбокс.
        // FIXME: Не должно быть в BaseControl, унести в GridControl.
        const hasCheckboxes = this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition !== 'custom';
        return this._beginAdd(userOptions, {
            addPosition: userOptions?.addPosition || this._getEditingConfig().addPosition,
            targetItem: userOptions?.targetItem,
            shouldActivateInput: userOptions?.shouldActivateInput,
            columnIndex: (userOptions?.columnIndex || 0) + hasCheckboxes
        });
    }

    cancelEdit(): Promise<void | { canceled: true }> {
        if (this._options.readOnly) {
            return BaseControl._rejectEditInPlacePromise('cancelEdit');
        }
        return this._cancelEdit();
    }

    commitEdit(): Promise<void | { canceled: true }> {
        if (this._options.readOnly) {
            return BaseControl._rejectEditInPlacePromise('commitEdit');
        }
        return this._commitEdit();
    }

    _tryStartInitialEditing(options) {
        const editingConfig: Required<IEditableListOption['editingConfig']> = this._getEditingConfig(options);
        const hasItems = !!(this._loadedItems && this._loadedItems.getCount() || this._items && this._items.getCount());

        if (editingConfig.autoAddOnInit && !!this._sourceController && !hasItems) {
            this._createEditInPlaceController(options);
            return this._beginAdd({ filter: options.filter }, { addPosition: editingConfig.addPosition });
        } else if (editingConfig.item) {
            this._createEditInPlaceController(options);
            if (this._items && this._items.getRecordById(editingConfig.item.getKey())) {
                return this._beginEdit({ item: editingConfig.item });
            } else {
                return this._beginAdd({ item: editingConfig.item }, { addPosition: editingConfig.addPosition });
            }
        }
    }

    _beginEdit(userOptions: object,
               {shouldActivateInput = true, columnIndex}: IBeginEditOptions = {}
    ): Promise<void | {canceled: true}> {
        _private.closeSwipe(this);
        if (_private.hasHoverFreezeController(this)) {
            this._hoverFreezeController.unfreezeHover();
        }
        this._displayGlobalIndicator();
        return this._getEditInPlaceController().edit(userOptions, { columnIndex }).then((result) => {
            if (shouldActivateInput && !(result && result.canceled)) {
                this._editInPlaceInputHelper.shouldActivate();
                // раньше индикаторы вызывали ненужную перерисовку изменением стейта, теперь нужно в ручную вызвать
                // перерисовку, чтобы поставить фокус на инпут, который уже точно отрисовался
                this._forceUpdate();
            }
            return result;
        }).finally(() => {
            if (this._indicatorsController.shouldHideGlobalIndicator()) {
                this._indicatorsController.hideGlobalIndicator();
            }
        });
    }

    _beginAdd(userOptions,
              {shouldActivateInput = true, addPosition = 'bottom', targetItem, columnIndex}: IBeginAddOptions = {}) {
        _private.closeSwipe(this);
        this._displayGlobalIndicator();
        return this._getEditInPlaceController()
            .add(userOptions, {addPosition, targetItem, columnIndex})
            .then((addResult) => {
                if (addResult && addResult.canceled) {
                    return addResult;
                }
                if (shouldActivateInput) {
                    this._editInPlaceInputHelper.shouldActivate();
                    // раньше индикаторы вызывали ненужную перерисовку изменением стейта, теперь нужно в ручную вызвать
                    // перерисовку, чтобы поставить фокус на инпут, который уже точно отрисовался
                    this._forceUpdate();
                }
                if (!this._isMounted) {
                    return addResult;
                }

                if (_private.hasSelectionController(this)) {
                    const controller = _private.getSelectionController(this);
                    controller.setSelection(controller.getSelection());
                }
            }).finally(() => {
                if (this._indicatorsController.shouldHideGlobalIndicator()) {
                this._indicatorsController.hideGlobalIndicator();
            }
        });
    }

    _cancelEdit(force: boolean = false): TAsyncOperationResult {
        if (!this._editInPlaceController) {
            return Promise.resolve();
        }
        this._displayGlobalIndicator();
        return this._getEditInPlaceController().cancel(force).finally(() => {
            if (_private.hasSelectionController(this)) {
                const controller = _private.getSelectionController(this);
                controller.setSelection(controller.getSelection());
            }
            if (this._indicatorsController.shouldHideGlobalIndicator()) {
                this._indicatorsController.hideGlobalIndicator();
            }
        });
    }

    _commitEdit(commitStrategy?: 'hasChanges' | 'all') {
        if (!this._editInPlaceController) {
            return Promise.resolve();
        }
        this._displayGlobalIndicator();
        return this._getEditInPlaceController().commit(commitStrategy).finally(() => {
            if (this._indicatorsController.shouldHideGlobalIndicator()) {
                this._indicatorsController.hideGlobalIndicator();
            }
        });
    }

    _commitEditActionHandler(e, collectionItem) {
        return this.commitEdit().then((result) => {
            if (result && result.canceled) {
                return result;
            }
            const editingConfig = this._getEditingConfig();
            if (editingConfig.autoAddByApplyButton && collectionItem.isAdd) {
                return this._beginAdd({}, { addPosition: editingConfig.addPosition });
            } else {
                return result;
            }
        });
    }

    _cancelEditActionHandler(e, collectionItem) {
        return this.cancelEdit();
    }

    _onEditingRowKeyDown(e: SyntheticEvent<KeyboardEvent>, nativeEvent: KeyboardEvent) {
        const editNext = (item: Model | undefined,
                          direction: EDIT_IN_PLACE_CONSTANTS.GOTOPREV | EDIT_IN_PLACE_CONSTANTS.GOTONEXT) => {
            if (!item) {
                return Promise.resolve();
            }
            this._continuationEditingDirection = direction;
            const collection = this._listViewModel;
            const columnIndex = this._getEditingConfig()?.mode === 'cell' ?
                collection.find((cItem) => cItem.isEditing()).getEditingColumnIndex() : undefined;
            let shouldActivateInput = true;
            if (this._listViewModel['[Controls/_display/grid/mixins/Grid]']) {
                shouldActivateInput = false;
                this._editInPlaceInputHelper.setInputForFastEdit(nativeEvent.target, direction);
            }
            return this._beginEdit({ item }, { shouldActivateInput, columnIndex });
        };

        // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
        e.stopPropagation();

        switch (nativeEvent.keyCode) {
            case constants.key.enter:
                if (this._getEditingConfig().sequentialEditingMode === 'cell') {
                    return Promise.resolve();
                } else {
                    return this._editingRowEnterHandler(e);
                }
            case constants.key.esc:
                return this._cancelEdit();
            case constants.key.up:
                const prev = this._getEditInPlaceController().getPrevEditableItem();
                return editNext(prev?.contents, EDIT_IN_PLACE_CONSTANTS.GOTOPREV);
            case constants.key.down: // ArrowDown
                const next = this._getEditInPlaceController().getNextEditableItem();
                return editNext(next?.contents, EDIT_IN_PLACE_CONSTANTS.GOTONEXT);
        }
    }

    _editingRowEnterHandler(e: SyntheticEvent<KeyboardEvent>) {
        const editingConfig = this._getEditingConfig();
        const columnIndex = this._editInPlaceController._getEditingItem()._$editingColumnIndex;
        const next = this._getEditInPlaceController().getNextEditableItem();
        const shouldEdit = editingConfig.sequentialEditingMode !== 'none' && !!next;
        const shouldAdd = !next && !shouldEdit && !!editingConfig.autoAdd && editingConfig.addPosition === 'bottom';
        return this._tryContinueEditing(shouldEdit, shouldAdd, next && next.contents, columnIndex);
    }

    _onRowDeactivated(e: SyntheticEvent, eventOptions: any) {
        e.stopPropagation();

        const pressedKey = eventOptions?.keyPressedData?.key;
        const shouldEditNextRow = pressedKey && (
            pressedKey === 'Tab' ||
            (pressedKey === 'Enter' && this._getEditingConfig().sequentialEditingMode === 'cell')
        );

        if (shouldEditNextRow) {
            if (this._getEditingConfig()?.mode === 'cell') {
                this._onEditingCellTabHandler(eventOptions);
            } else {
                this._onEditingRowTabHandler(eventOptions);
            }
        }
    }

    _onEditingCellTabHandler(eventOptions) {
        const editingConfig = this._getEditingConfig();
        const editingItem = this._editInPlaceController._getEditingItem();
        let columnIndex;
        let next = editingItem;
        let shouldAdd;
        const hasCheckboxes = this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition !== 'custom';

        if (eventOptions.isShiftKey) {
            this._continuationEditingDirection = EDIT_IN_PLACE_CONSTANTS.PREV_COLUMN;
            columnIndex = editingItem._$editingColumnIndex - 1;
            if (columnIndex < 0) {
                next = this._getEditInPlaceController().getPrevEditableItem();
                columnIndex = this._options.columns.length - 1 + +hasCheckboxes;
            }
            shouldAdd = editingConfig.autoAdd && !next && editingConfig.addPosition === 'top';
        } else {
            this._continuationEditingDirection = EDIT_IN_PLACE_CONSTANTS.NEXT_COLUMN;
            columnIndex = editingItem._$editingColumnIndex + 1;
            if (columnIndex > this._options.columns.length - 1 + +hasCheckboxes) {
                next = this._getEditInPlaceController().getNextEditableItem();
                columnIndex = +hasCheckboxes;
            }
            shouldAdd = editingConfig.autoAdd && !next && editingConfig.addPosition === 'bottom';
        }
        return this._tryContinueEditing(!!next, shouldAdd, next && next.contents, columnIndex);
    }

    _onEditingRowTabHandler(eventOptions) {
        const editingConfig = this._getEditingConfig();
        let next;
        let shouldEdit;
        let shouldAdd;

        if (eventOptions.isShiftKey) {
            this._continuationEditingDirection = EDIT_IN_PLACE_CONSTANTS.GOTOPREV;
            next = this._getEditInPlaceController().getPrevEditableItem();
            shouldEdit = !!next;
            shouldAdd = editingConfig.autoAdd && !next && !shouldEdit && editingConfig.addPosition === 'top';
        } else {
            this._continuationEditingDirection = EDIT_IN_PLACE_CONSTANTS.GOTONEXT;
            next = this._getEditInPlaceController().getNextEditableItem();
            shouldEdit = !!next;
            shouldAdd = editingConfig.autoAdd && !next && !shouldEdit && editingConfig.addPosition === 'bottom';
        }
        return this._tryContinueEditing(shouldEdit, shouldAdd, next && next.contents);
    }

    _tryContinueEditing(shouldEdit, shouldAdd, item?: Model, columnIndex?: number) {
        return this._commitEdit().then((result) => {
            if (result && result.canceled) {
                return result;
            }
            if (shouldEdit) {
                return this._beginEdit({ item }, { columnIndex });
            } else if (shouldAdd) {
                return this._beginAdd({}, { addPosition: this._getEditingConfig().addPosition, columnIndex });
            } else {
                this._continuationEditingDirection = null;
            }
        });
    }

    _saveEditingInSource(item: Model, isAdd: boolean, sourceIndex?: number): Promise<void> {
        const updateResult = this._options.source ? this.getSourceController().update(item) : Promise.resolve();

        return updateResult.then(() => {
            // После выделения слоя логики работы с источником данных в отдельный контроллер,
            // код ниже должен переехать в него.
            if (isAdd) {
                if (typeof sourceIndex === 'number') {
                    this._items.add(item, sourceIndex);
                } else {
                    this._items.append([item]);
                }
            }
        });
    }

    _getEditingConfig(options = this._options): Required<IEditableListOption['editingConfig']> {
        const editingConfig = options.editingConfig || {};
        const addPosition = editingConfig.addPosition === 'top' ? 'top' : 'bottom';

        // Режим последовательного редактирования (действие по Enter).
        const getSequentialEditingMode = () => {
            // sequentialEditingMode[row | cell | none] - новая опция, sequentialEditing[boolean?] - старая опция
            if (typeof editingConfig.sequentialEditingMode === 'string') {
                return editingConfig.sequentialEditingMode;
            } else {
                return editingConfig.sequentialEditing !== false ? 'row' : 'none';
            }
        };

        return {
            mode: editingConfig.mode || 'row',
            editOnClick: !!editingConfig.editOnClick,
            sequentialEditingMode: getSequentialEditingMode(),
            addPosition,
            item: editingConfig.item,
            autoAdd: !!editingConfig.autoAdd,
            autoAddOnInit: !!editingConfig.autoAddOnInit,
            backgroundStyle: editingConfig.backgroundStyle || 'default',
            autoAddByApplyButton: editingConfig.autoAddByApplyButton === false
                ? false : !!(editingConfig.autoAddByApplyButton || editingConfig.autoAdd),
            toolbarVisibility: !!editingConfig.toolbarVisibility,

            task1181625554: !!editingConfig.task1181625554
        };
    }

    // endregion

    /**
     * Обработчик показа контекстного меню
     * @param e
     * @param itemData
     * @param clickEvent
     * @private
     */
    _onItemContextMenu(
        e: SyntheticEvent<Event>,
        itemData: CollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        _private.openContextMenu(this, clickEvent, itemData);
    }

    /**
     * Обработчик долгого тапа
     * @param e
     * @param itemData
     * @param tapEvent
     * @private
     */
    _onItemLongTap(
        e: SyntheticEvent<Event>,
        itemData: CollectionItem<Model>,
        tapEvent: SyntheticEvent<MouseEvent>
    ): void {
        _private.updateItemActionsOnce(this, this._options);
        _private.openContextMenu(this, tapEvent, itemData);
        this._notify('itemLongTap', [itemData.item, tapEvent]);
    }

    /**
     * Обработчик клика по операции
     * @param event
     * @param action
     * @param itemData
     * @private
     */
    _onItemActionMouseDown(
        event: SyntheticEvent<MouseEvent>,
        action: IShownItemAction,
        itemData: CollectionItem<Model>
    ): void {
        if (!isLeftMouseButton(event)) {
            return;
        }
        // TODO нужно заменить на item.getContents() при переписывании моделей. item.getContents() должен возвращать
        //  Record https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
        const contents = _private.getPlainItemContents(itemData);
        const key = contents ? contents.getKey() : itemData.key;
        const item = this._listViewModel.getItemBySourceKey(key) || itemData;
        this.setMarkedKey(key);

        if (action && !action.isMenu && !action['parent@']) {
            _private.handleItemActionClick(this, action, event, item, false);
        } else {
            const menuConfig = _private.getItemActionsMenuConfig(this, item, event, action, false);
            if (menuConfig) {
                _private.openItemActionsMenu(this, event, item, menuConfig);
            }
        }
    }

    /**
     * Обработчик клика по операции, необходимый для предотвращения срабатывания клика на записи в списке
     * @param event
     * @private
     */
    _onItemActionClick(event: SyntheticEvent<MouseEvent>): void {
        event.stopPropagation();
    }

    /**
     * Обработчик mouseUp по операции, необходимый для предотвращения срабатывания mouseUp на записи в списке
     * @param event
     * @private
     */
    _onItemActionMouseUp(event: SyntheticEvent<MouseEvent>): void {
        event.stopPropagation();
    }

    /**
     * Обработчик событий, брошенных через onResult в выпадающем/контекстном меню
     * @param eventName название события, брошенного из Controls/menu:Popup.
     * Варианты значений itemClick, applyClick, selectorDialogOpened, pinClick, menuOpened
     * @param actionModel
     * @param clickEvent
     * @private
     */
    _onItemActionsMenuResult(eventName: string, actionModel: Model, clickEvent: SyntheticEvent<MouseEvent>): void {
        if (eventName === 'click') {
            const item = _private.getItemActionsController(this, this._options).getActiveItem();
            if (item) {
                this._notifyItemClick([clickEvent, item.contents, clickEvent]);
                _private.closeActionsMenu(this);
            }
        } else if (eventName === 'itemClick') {
            const action = actionModel && actionModel.getRawData();
            if (action) {
                const item = _private.getItemActionsController(this, this._options).getActiveItem();
                _private.handleItemActionClick(this, action, clickEvent, item, true);
            }
        } else if (eventName === 'menuOpened' || eventName === 'onOpen') {
            if (_private.hasHoverFreezeController(this) && _private.isAllowedHoverFreeze(this)) {
                this._hoverFreezeController.unfreezeHover();
            }
            _private.removeShowActionsClass(this);
            _private.addHoverEnabledClass(this);
            _private.getItemActionsController(this, this._options).deactivateSwipe(false);
        }
    }

    /**
     * Обработчик закрытия выпадающего/контекстного меню
     * @private
     */
    _onItemActionsMenuClose(currentPopup): void {
        _private.closeActionsMenu(this, currentPopup);
    }

    _handleMenuActionMouseEnter(event: SyntheticEvent): void {
        _private.getItemActionsController(this, this._options).startMenuDependenciesTimer();
    }

    _handleMenuActionMouseLeave(event: SyntheticEvent): void {
        _private.getItemActionsController(this, this._options).stopMenuDependenciesTimer();
    }

    _itemMouseDown(event, itemData, domEvent) {
        // При клике в операцию записи не нужно посылать событие itemMouseDown. Останавливать mouseDown в
        // методе _onItemActionMouseDown нельзя, т.к. тогда оно не добросится до Application
        this._itemActionMouseDown = null;
        if (!!domEvent.target.closest(ITEM_ACTION_SELECTOR)) {
            this._itemActionMouseDown = true;
            event.stopPropagation();
            return;
        }

        // Если есть ссылка для открытия, то не должен срабоать авто-скролл по нажатию на колесико.
        // Так же работают нативные сслыки.
        if (domEvent.nativeEvent.button === 1) {
            const url = itemData.item.get(this._options.urlProperty);
            if (url) {
                domEvent.preventDefault();
            }
        }

        let hasDragScrolling = false;
        const contents = _private.getPlainItemContents(itemData);
        this._mouseDownItemKey = contents.getKey();
        if (!this._options.newColumnScroll && this._options.columnScroll) {
            // Не должно быть завязки на горизонтальный скролл.
            // https://online.sbis.ru/opendoc.html?guid=347fe9ca-69af-4fd6-8470-e5a58cda4d95
            hasDragScrolling = this._isColumnScrollVisible && (
                typeof this._options.dragScrolling === 'boolean'
                    ? this._options.dragScrolling : !this._options.itemsDragNDrop
            );
        }
        if (!hasDragScrolling) {
            // dragStartDelay нужен, чтобы была возможность выше отменить днд. То есть, за заданное время, контрол
            // выше может выполнить свои действия и уже на событие dragStart дать однозначный ответ.
            // Нужно например, чтобы начать dragScroll в канбане, но если прошло dragStartDelay, то должен быть DnD.
            if (this._options.dragStartDelay) {
                setTimeout(() => {
                    _private.startDragNDrop(this, domEvent, itemData);
                }, this._options.dragStartDelay);
            } else {
                _private.startDragNDrop(this, domEvent, itemData);
            }
        } else {
            this._savedItemMouseDownEventArgs = {event, itemData, domEvent};
        }
        this._notify('itemMouseDown', [itemData.item, domEvent.nativeEvent]);
    }

    _itemMouseUp(e, itemData, domEvent): void {
        let key;
        const contents = _private.getPlainItemContents(itemData);
        key = contents.getKey();
        // Маркер должен ставиться именно по событию mouseUp, т.к. есть сценарии при которых блок над которым произошло
        // событие mouseDown и блок над которым произошло событие mouseUp - это разные блоки.
        // Например, записи в мастере или запись в списке с dragScrolling'ом.
        // При таких сценариях нельзя устанавливать маркер по событию itemClick,
        // т.к. оно не произойдет (itemClick = mouseDown + mouseUp на одном блоке).
        // Также, нельзя устанавливать маркер по mouseDown, блок сменится раньше и клик по записи не выстрелет.

        // При редактировании по месту маркер появляется только если в списке больше одной записи.
        // https://online.sbis.ru/opendoc.html?guid=e3ccd952-cbb1-4587-89b8-a8d78500ba90
        // Если нажали по чекбоксу, то маркер проставим по клику на чекбокс
        let canBeMarked = this._mouseDownItemKey === key
            && (!this._options.editingConfig || (this._options.editingConfig && this._items.getCount() > 1))
            && !domEvent.target.closest('.js-controls-ListView__checkbox');

        // TODO изабвиться по задаче https://online.sbis.ru/opendoc.html?guid=f7029014-33b3-4cd6-aefb-8572e42123a2
        // Колбэк передается из explorer.View, чтобы не проставлять маркер перед проваливанием в узел
        if (this._options._needSetMarkerCallback) {
            canBeMarked = canBeMarked && this._options._needSetMarkerCallback(itemData.item, domEvent);
        }

        if (this._mouseDownItemKey === key) {
            if (domEvent.nativeEvent.button === 1 ||
                domEvent.nativeEvent.button === 0 && (
                    detection.isMac && domEvent.nativeEvent.metaKey || !detection.isMac && domEvent.nativeEvent.ctrlKey
                )) {
                const url = itemData.item.get(this._options.urlProperty);
                const isLinkClick = domEvent.target.tagName === 'A' && !!domEvent.target.getAttribute('href');
                if (url && !isLinkClick) {
                    window.open(url);
                    this._onLastMouseUpWasOpenUrl = domEvent.nativeEvent.button === 0;
                }
            }

            // TODO избавиться по задаче https://online.sbis.ru/opendoc.html?guid=7f63bbd1-3cb9-411b-81d7-b578d27bf289
            // Ключ перетаскиваемой записи мы запоминаем на mouseDown, но днд начнется только после смещения
            // на 4px и не факт, что он вообще начнется
            // Если сработал mouseUp, то днд точно не сработает и draggedKey нам уже не нужен
            this._draggedKey = null;
            // контроллер создается на mouseDown, но драг может и не начаться, поэтому контроллер уже не нужен
            if (this._dndListController && !this._dndListController.isDragging()) {
                this._dndListController = null;
            }
        }

        this._mouseDownItemKey = undefined;
        this._onLastMouseUpWasDrag = this._dndListController && this._dndListController.isDragging();
        this._notify('itemMouseUp', [itemData.item, domEvent.nativeEvent]);

        if (canBeMarked && !this._onLastMouseUpWasDrag) {
            // маркер устанавливается после завершения редактирования
            if (this._editInPlaceController?.isEditing()) {
                // TODO нужно перенести установку маркера на клик, т.к. там выполняется проверка для редактирования
                this._markedKeyAfterEditing = key;
            } else {
                this.setMarkedKey(key);
            }
        }
    }

    _startDragNDropCallback(): void {
        _private.startDragNDrop(
            this, this._savedItemMouseDownEventArgs.domEvent, this._savedItemMouseDownEventArgs.itemData
        );
    }

    protected _onloadMore(e: SyntheticEvent, dispItem?: CollectionItem): void {
        _private.loadToDirectionIfNeed(this, 'down', this._options.filter);
    }

    protected _resolveNavigationButtonView(): TNavigationButtonView {
        const navigation = this._options.navigation;
        const view = navigation?.view;
        const buttonView = navigation?.viewConfig?.buttonView;
        return buttonView || (view === 'cut' ? 'separator' : 'link');
    }

    protected _onNavigationButtonClick(e: SyntheticEvent): void {
        if (e.target.closest('.js-controls-BaseControl__NavigationButton')) {
            const view = this._options.navigation?.view;
            if (view === 'demand') {
                _private.loadToDirectionIfNeed(this, 'down', this._options.filter);
            } else if (view === 'cut') {
                this._toggleCutClick();
            }
        }
    }

    // region Cut

    private _toggleCutClick() {
        const result = this._notify('cutClick', [this._cutExpanded], { bubbling: true });
        if (result !== false) {
            const newExpanded = !this._cutExpanded;
            this._reCountCut(newExpanded).then(() => this._cutExpanded = newExpanded);
        }
    }

    private _reCountCut(newExpanded: boolean): Promise<void> {
        if (newExpanded) {
            this._sourceController.setNavigation(undefined);
            this._listVirtualScrollController.enableKeepScrollPosition();
            return this._reload(this._options).then(() => {
                _private.prepareFooter(this, this._options, this._sourceController);
            });
        } else {
            this._sourceController.setNavigation(this._options.navigation);
            this._listVirtualScrollController.enableKeepScrollPosition();
            return this._reload(this._options).then(() => {
                _private.prepareFooter(this, this._options, this._sourceController);
            });
        }
    }

    // endregion Cut

    private _nativeDragStart(event: SyntheticEvent): void {
        // preventDefault нужно делать именно на нативный dragStart:
        // 1. getItemsBySelection может отрабатывать асинхронно (например при массовом выборе всех записей), тогда
        //    preventDefault в startDragNDrop сработает слишком поздно, браузер уже включит нативное перетаскивание
        // 2. На mouseDown ставится фокус, если на нём сделать preventDefault - фокус не будет устанавливаться
        if (DndController.canStartDragNDrop(
            this._options.readOnly,
            this._options.itemsDragNDrop,
            this._options.canStartDragNDrop,
            event,
            this._dndListController && this._dndListController.isDragging()
        )) {
            event.preventDefault();
        }
    }

    handleKeyDown(event): void {
        this._onViewKeyDown(event);
    }

    // TODO удалить после выполнения наследования Explorer <- TreeControl <- BaseControl
    clearSelection(): void {
        _private.changeSelection(this, { selected: [], excluded: [] });
    }

    isAllSelected(): boolean {
        return _private.getSelectionController(this)?.isAllSelected();
    }

    // region move

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet> {
        return _private.getMoveAction(this).execute({
            selection,
            filter: this._filter,
            targetKey,
            position,
            providerName: 'Controls/listCommands:MoveProvider'
        }) as Promise<DataSet>;
    }

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return _private.moveItem(this, selectedKey, 'up');
    }

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return _private.moveItem(this, selectedKey, 'down');
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet> {
        return _private.getMoveAction(this).execute({selection, filter: this._options.filter});
    }

    protected _getSiblingsStrategy(): ISiblingStrategy {
        return new FlatSiblingStrategy({
            collection: this._listViewModel
        });
    }

    // endregion move

    // region remove

    removeItems(selection: ISelectionObject): Promise<string | void> {
        return _private
            .removeItems(this, selection, 'Controls/listCommands:RemoveProvider')
            .catch((error) => {
                if (error) {
                    return process({error});
                }
                return;
            });
    }

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<string | void> {
        return _private.removeItems(this, selection).catch((error) => {
            if (error) {
                return process({error});
            }
            return;
        });
    }

    // endregion remove

    _onViewKeyDown(event) {
        if (event.nativeEvent.altKey) {
            return;
        }
        const isLoading = this._sourceController && this._sourceController.isLoading();
        // Во время порционного поиска можно пользоваться клавишами
        const allowByLoading = !isLoading || _private.isPortionedLoad(this);
        if (allowByLoading) {
            const key = event.nativeEvent.keyCode;
            const dontStop = key === 17 // Ctrl
                || key === 33 // PageUp
                || key === 34 // PageDown
                || key === 35 // End
                || key === 36 // Home
                || key === 46 // Delete
                || key === constants.key.enter;
            EventUtils.keysHandler(event, HOT_KEYS, _private, this, dontStop);
        }
    }

    protected _keyDownHandler(event): boolean | void {/* For override  */}

    protected _getViewClasses(addShowActionsClass: boolean, addHoverEnabledClass: boolean, uniqueId: string): string  {
        const classes: string[] = [];
        if (addShowActionsClass) {
            const visibility = this._getEditingConfig(this._options)?.mode === 'cell'
                ? 'onhovercell' : this._options.itemActionsVisibility;
            classes.push(`controls-BaseControl_showActions controls-BaseControl_showActions_${visibility}`);
        }
        if (addHoverEnabledClass) {
            classes.push('controls-BaseControl_hover_enabled');
        } else {
            classes.push('controls-BaseControl_hover_disabled');
        }
        if (this._uniqueId) {
            classes.push(_private.getViewUniqueClass(this));
        }
        return classes.join(' ');
    }

    protected _getItemsContainerUniqueClass(): string {
        return `controls-BaseControl__itemsContainer_${this._uniqueId}`;
    }

    _onItemActionsMouseEnter(event: SyntheticEvent<MouseEvent>, itemData: CollectionItem<Model>): void {
        if (_private.hasHoverFreezeController(this) &&
            _private.isAllowedHoverFreeze(this) &&
            itemData.ItemActionsItem &&
            !this._itemActionsMenuId) {
            const itemKey = _private.getPlainItemContents(itemData).getKey();
            const itemIndex = this._listViewModel.getIndex(itemData.dispItem || itemData);
            this._hoverFreezeController.startFreezeHoverTimeout(
                itemKey, event, itemIndex, this._listViewModel.getStartIndex()
            );
        }
    }

    _itemMouseEnter(event: SyntheticEvent<MouseEvent>, itemData: CollectionItem<Model>, nativeEvent: Event): void {
        if (itemData.ItemActionsItem) {
            const itemKey = _private.getPlainItemContents(itemData).getKey();
            const itemIndex = this._listViewModel.getIndex(itemData.dispItem || itemData);
            const actions = itemData.getActions();
            // Не надо делать фриз, если ItemActions пустые (например, их отрезали по visibilityCallback)
            if (actions?.showed?.length && _private.needHoverFreezeController(this) && !this._itemActionsMenuId) {
                if (!_private.hasHoverFreezeController(this)) {
                    _private.initHoverFreezeController(this);
                }
                this._hoverFreezeController.startFreezeHoverTimeout(
                    itemKey, nativeEvent, itemIndex, this._listViewModel.getStartIndex()
                );
            }
        }
        this._notify('itemMouseEnter', [itemData.item, nativeEvent]);
    }

    private _itemMouseMove(event: SyntheticEvent, item: CollectionItem, nativeEvent: MouseEvent): void {
        this._notify('itemMouseMove', [item.item, nativeEvent]);
        const hoverFreezeController = this._hoverFreezeController;
        if (!this._addShowActionsClass &&
            (!this._dndListController || !this._dndListController.isDragging()) &&
            (!this._editInPlaceController || !this._editInPlaceController.isEditing()) &&
            !this._itemActionsMenuId &&
            (!hoverFreezeController || hoverFreezeController.getCurrentItemKey() === null)) {
            _private.addShowActionsClass(this, this._options);
        }

        if (this._dndListController && this._dndListController.isDragging()) {
            this._draggingItemMouseMove(item, nativeEvent);
        }
        if (hoverFreezeController && item.ItemActionsItem) {
            const itemKey = _private.getPlainItemContents(item).getKey();
            const itemIndex = this._listViewModel.getIndex(item.dispItem || item);
            hoverFreezeController.setDelayedHoverItem(
                itemKey, nativeEvent, itemIndex, this._listViewModel.getStartIndex()
            );
        }
    }

    protected _draggingItemMouseMove(targetItem: CollectionItem, event: MouseEvent): boolean {
        const targetIsDraggableItem
            = this._dndListController.getDraggableItem()?.getContents() === targetItem.getContents();
        if (targetIsDraggableItem) {
            return false;
        }

        const mouseOffsetInTargetItem = this._calculateMouseOffsetInItem(event);
        const dragPosition = this._dndListController.calculateDragPosition({
            targetItem, mouseOffsetInTargetItem
        });
        if (dragPosition && !isEqual(this._dndListController.getDragPosition(), dragPosition)) {
            const changeDragTarget = this._notify(
                'changeDragTarget',
                [this._dndListController.getDragEntity(), dragPosition.dispItem.getContents(), dragPosition.position]
            );
            if (changeDragTarget !== false) {
                return this._dndListController.setDragPosition(dragPosition);
            }
        }
        return false;
    }

    _itemMouseLeave(event, itemData, nativeEvent) {
        this._notify('itemMouseLeave', [itemData.item, nativeEvent]);
        if (_private.hasHoverFreezeController(this) && _private.isAllowedHoverFreeze(this)) {
            this._hoverFreezeController.startUnfreezeHoverTimeout(nativeEvent);
        }
    }

    private _onFixedItemChanged(event: SyntheticEvent,
                                item: CollectionItem<Model>,
                                information: { fixedPosition: string }): void {
        if (information.fixedPosition === '') {
            if (this._fixedItem && this._fixedItem.key === item.key) {
                this._fixedItem = null;
            }
        } else {
            this._fixedItem = item;
        }

    }

    _sortingChanged(event, propName) {
        const newSorting = _private.getSortingOnChange(this._options.sorting, propName);
        event.stopPropagation();

        // При смене сортировки позиция горизонтального скролла не должна изменяться.
        // FIXME: Временное решение, до перехода на нативный горизонтальный скролл.
        //  https://online.sbis.ru/opendoc.html?guid=bc40e794-c5d4-4381-800f-a98f2746750a
        this._keepHorizontalScroll = true;
        this._notify('sortingChanged', [newSorting]);
    }

    _updatePagingPadding(): void {
        // Сюда может попасть из beforePaint, когда pagingVisible уже поменялся на true (стрельнуло событие от скролла),
        // но вот сам pagingPaddingContainer отрисуется лишь в следующем цикле синхронизации
        // https://online.sbis.ru/opendoc.html?guid=b6939810-b640-41eb-8139-b523a8df16df
        // Поэтому дополнительно проверяем на this._children.pagingPaddingContainer
        if (!this._pagingPadding && this._children.pagingPaddingContainer) {
            this._pagingPadding = this._children.pagingPaddingContainer.offsetHeight;
        }
    }

    _mouseEnter(event: SyntheticEvent<MouseEvent>): void {
        if (this._listViewModel) {
            this._dragEnter(this._getDragObject());
        }

        if (!_private.isPortionedLoad(this)) {
            if (this._indicatorsController.shouldDisplayTopIndicator()) {
                this._indicatorsController.displayTopIndicator(true);
            }

            if (this._indicatorsController.shouldDisplayBottomIndicator()) {
                this._indicatorsController.displayBottomIndicator();
            }
        }

        if (!this._pagingVisible) {
            _private.initPaging(this);
        }
    }

    _mouseLeave(event): void {
        if (this._listViewModel) {
            this._dragLeave();
        }
    }

    __pagingChangePage(event, page) {
        this._currentPage = page;
        this._applyPagingNavigationState({page: this._currentPage});
    }

    _changePageSize(e, key) {
        this._currentPageSize = PAGE_SIZE_ARRAY[key - 1].pageSize;
        this._currentPage = 1;
        this._applyPagingNavigationState({pageSize: this._currentPageSize});
    }

    /**
     * Хандлер клика на Tag в BaseControl.wml
     * @private
     */
    _onTagClickHandler(event: Event, item: CollectionItem<Model>, columnIndex: number): void {
        event.stopPropagation();
        this._notify('tagClick', [item.getContents(), columnIndex, event]);
    }

    /**
     * Хандлер наведения на Tag в BaseControl.wml
     * @private
     */
    _onTagHoverHandler(event: Event, item: CollectionItem<Model>, columnIndex: number): void {
        this._notify('tagHover', [item.getContents(), columnIndex, event]);
    }

    _applyPagingNavigationState(params): void {
        const newNavigation = cClone(this._options.navigation);
        if (params.pageSize) {
            newNavigation.sourceConfig.pageSize = params.pageSize;
            newNavigation.sourceConfig.page = this._currentPage - 1;
        }
        if (params.page) {
            newNavigation.sourceConfig.page = params.page - 1;
            newNavigation.sourceConfig.pageSize = this._currentPageSize;
        }

        const updateData = () => {
            this._sourceController.setNavigation(newNavigation);
            this._updatePagingOnResetItems = false;
            return this._reload(this._options);
        };

        if (_private.isEditing(this)) {
            this._cancelEdit().then((result) => {
                return !(result && result.canceled) ? updateData() : result;
            });
        } else {
            return updateData();
        }
    }

    recreateSourceController(options): void {
        if (this._sourceController) {
            this._sourceController.destroy();
        }
        this._sourceController = _private.getSourceController(this, options);
    }

    updateSourceController(options): void {
        this._sourceController?.updateOptions(options);
    }

    protected _getSourceControllerOptionsForGetDraggedItems(selection: ISelectionObject): ISourceControllerOptions {
        const options: ISourceControllerOptions = {...this._options};
        options.dataLoadCallback = null;
        options.dataLoadErrback = null;
        options.navigationParamsChangedCallback = null;

        const newFilter = cClone(options.filter) || {};
        newFilter.selection = selectionToRecord({
            selected: selection.selected,
            excluded: selection.excluded
        }, 'adapter.sbis', this._options.selectionType);
        options.filter = newFilter;

        if (options.navigation) {
            const newNavigation = cClone(options.navigation);
            // Ограничиваем получение перемещаемых записей до 100 (максимум в D&D пишется "99+ записей"), в дальнейшем
            // количество записей будет отдавать selectionController
            // https://online.sbis.ru/opendoc.html?guid=b93db75c-6101-4eed-8625-5ec86657080e
            if (newNavigation.source === 'position') {
                newNavigation.sourceConfig.limit = LIMIT_DRAG_SELECTION;
            } else if (newNavigation.source === 'page') {
                newNavigation.sourceConfig.pageSize = LIMIT_DRAG_SELECTION;
            }
            options.navigation = newNavigation;
        }

        // Удалим текущие items иначе SourceController их запомнит и будет модифицировать
        delete options.items;

        return options;
    }

    /**
     * Обработчик скролла, вызываемый при помощи регистратора событий по событию в ScrollContainer
     * @param event
     * @param scrollEvent
     * @param initiator
     * @private
     */
    _scrollHandler(event: Event, scrollEvent: Event, initiator: string): void {
        // Код ниже взят из Controls\_popup\Opener\Sticky.ts
        // Из-за флага listenAll на listener'e, подписка доходит до application'a всегда.
        // На ios при показе клавиатуры стреляет событие скролла, что приводит к вызову текущего обработчика
        // и закрытию окна. Для ios отключаю реакцию на скролл, событие скролла стрельнуло на body.
        if (detection.isMobileIOS && (scrollEvent.target === document.body || scrollEvent.target === document)) {
            return;
        }
        if (_private.hasHoverFreezeController(this) && _private.isAllowedHoverFreeze(this)) {
            this._hoverFreezeController.unfreezeHover();
        }
        _private.closeActionsMenu(this);
    }

    /**
     * Обработчик свайпа по записи. Показывает операции по свайпу
     * @param e
     * @param item
     * @param swipeEvent
     * @private
     */

    _onItemSwipe(e: SyntheticEvent<Event>, item: CollectionItem<Model>, swipeEvent): void {
        if (item['[Controls/_display/GroupItem]']) {
            return;
        }
        swipeEvent.stopPropagation();
        const key = _private.getPlainItemContents(item).getKey();
        const itemContainer = (swipeEvent.target as HTMLElement).closest('.controls-ListView__itemV');
        const swipeContainer = ItemActionsController.
            getSwipeContainerSize(itemContainer as HTMLElement, LIST_MEASURABLE_CONTAINER_SELECTOR);
        let itemActionsController: ItemActionsController;
        if (this._itemActionsMenuId) {
            _private.closeActionsMenu(this);
        }
        if (swipeEvent.nativeEvent.direction === 'left') {
            this.setMarkedKey(key);
            _private.updateItemActionsOnce(this, this._options);
            itemActionsController = _private.getItemActionsController(this, this._options);
            if (itemActionsController) {
                itemActionsController.activateSwipe(key, swipeContainer?.width, swipeContainer?.height);
            }
        }
        if (swipeEvent.nativeEvent.direction === 'right') {
            // Тут не надо инициализировать контроллер, если он не проинициализирован
            const swipedItem = this._itemActionsController?.getSwipeItem();
            if (swipedItem) {
                this._itemActionsController.startSwipeCloseAnimation();
                this._listViewModel.nextVersion();

                // Для сценария, когда свайпнули одну запись и потом свайпнули вправо другую запись
                if (swipedItem !== item) {
                    this.setMarkedKey(key);
                }
            } else {
                // After the right swipe the item should get selected.
                if (_private.isItemsSelectionAllowed(this._options)) {
                    this._notify('checkboxClick', [key, item.isSelected()]);
                    const newSelection = _private.getSelectionController(this).toggleItem(key);
                    _private.changeSelection(this, newSelection);
                    // Animation should be played only if checkboxes are visible.
                    if (_private.hasSelectionController(this)) {
                        _private.getSelectionController(this).startItemAnimation(key);
                    }
                }
                this.setMarkedKey(key);
            }
        }
        // Событие свайпа должно стрелять всегда. Прикладники используют его для кастомных действий.
        // Раньше событие останавливалось если оно обработано платформой, но прикладники сами могут это контролировать.
        this._notify('itemSwipe', [_private.getPlainItemContents(item), swipeEvent, swipeContainer?.clientHeight]);
    }

    _updateItemActionsOnItem(event: SyntheticEvent<Event>, itemKey: string | number, itemWidth: number): void {
        event.stopImmediatePropagation();
        // Если в модели поменялся набор записей до перерисовки контрола, не нужно обрабатывать событие
        if (this._itemActionsController?.isActionsAssigned() && !this._itemsChanged) {
            const itemActionsController = _private.getItemActionsController(this);
            itemActionsController.updateItemActions(itemKey, itemWidth);
        }
    }

    /**
     * Обработчик, выполняемый после окончания анимации свайпа по опциям записи
     * @param e
     * @private
     */
    _onActionsSwipeAnimationEnd(e: SyntheticEvent<IAnimationEvent>): void {
        if (e.nativeEvent.animationName === 'itemActionsSwipeClose') {
            const itemActionsController = _private.getItemActionsController(this, this._options);
            const item = itemActionsController.getSwipeItem();
            if (item) {
                if (!this._options.itemActions) {
                    this._notify('itemSwipe', [item, e]);
                }
                itemActionsController.deactivateSwipe();
            }
        }
    }

    /**
     * Обработчик, выполняемый после окончания анимации свайпа вправо по записи
     * @param e
     * @private
     */
    _onItemSwipeAnimationEnd(e: SyntheticEvent<IAnimationEvent>): void {
        if (_private.hasSelectionController(this) && e.nativeEvent.animationName === 'rightSwipe') {
            _private.getSelectionController(this).stopItemAnimation();
        }
    }

    _createNewModel(items, modelConfig, modelName): Collection {
        return diCreate(modelName, {
            ...modelConfig,
            collection: items,
            unique: true,
            emptyTemplateOptions: {...modelConfig.emptyTemplateOptions, items, filter: modelConfig.filter},
            hasMoreData: _private.getHasMoreData(this),
            // Если навигация по скролу то для дерева нужно скрывать кнопку "Ещё" для узла являющегося
            // последней записью коллекции. Т.к. в этом случае подгрузка осуществляется по скролу.
            // На самом деле условие показа кнопки более сложное, но здесь нам нужно на преобразовать
            // информацию о навигации в информацию о режиме отображения кнопки, т.к. коллекция про навигацию
            // знать не должна
            moreButtonVisibility: _private.isInfinityNavigation(modelConfig.navigation)
                ? MoreButtonVisibility.exceptLastNode
                : MoreButtonVisibility.visible,
            // TODO LI нужно переименовать в portionedSearchTemplate, но нужно переименовывать и у прикладников
            portionedSearchTemplate: modelConfig.loadingIndicatorTemplate
        });
    }

    _stopBubblingEvent(event: SyntheticEvent<Event>): void {
        // В некоторых кейсах (например ScrollViewer) внутри списков могут находиться
        // другие списки, которые также будут нотифицировать события управления скроллом и тенью
        // Необходимо их останавливать, чтобы скроллом управлял только самый верхний список

        // Можно избавиться от этой опции, если не использовать в scrollViewer BaseControl,
        // а создать для этого самостоятельный контрол.
        // Задача: https://online.sbis.ru/opendoc.html?guid=5bafceb4-b19b-4e72-ace0-c42d713ed083
        if (!this._options.passBubblingEvents) {
            event.stopPropagation();
        }
    }

    // Уйдет когда будем наследоваться от baseControl
    protected _getItemsContainer(): HTMLElement {/* For override  */}
    getItemsContainer() {
        return this._getItemsContainer();
    }

    _onContentResized(width: number, height: number): void {
        // TODO: После переписывания метода getViewSize, тут будет обновление размеров.
    }

    _viewUnmount(): void {
        this._viewReady = false;
    }

    _itemsContainerReadyHandler(_: SyntheticEvent<Event>, itemsContainerGetter: Function): void {
        this._getItemsContainer = itemsContainerGetter;
        // Нельзя до маунта сетать listContainer, т.к. это спровоцирует вызов триггера до маунта.
        // Нужно обновлять listContainer, т.к. вместе с items могут перерисоваться и триггеры.
        // TODO SCROLL если доработать обсерверы, чтобы они работали по циклам синхронизаци. То можно оставить
        //  одну точку входа для setListContainer и убрать здесь проверку
        if (this._isMounted) {
            this._listVirtualScrollController.setListContainer(this._container);
        }
        this._listVirtualScrollController.setItemsContainer(this._getItemsContainer());
        this._viewReady = true;
        if (_private.needScrollCalculation(this._options.navigation, this._options.virtualScrollConfig)) {
            this._viewSize = _private.getViewSize(this, true);
        }
    }

    /**
     * Вызывает деактивацию свайпа когда список теряет фокус
     * @private
     */
    _onListDeactivated() {
        if (!this._itemActionsMenuId) {
            _private.closeSwipe(this);
        }
    }

    _onCloseSwipe() {
        if (!this._itemActionsMenuId) {
            _private.closeSwipe(this);
        }
    }

    _registerObserver(): void {
        if (this._children.scrollObserver && !this._observerRegistered && this._listViewModel) {
            // @ts-ignore
            this._children.scrollObserver.startRegister([this._children.scrollObserver]);
            this._observerRegistered = true;
        }
    }

    _observeScrollHandler(_: SyntheticEvent<Event>, eventName: string, params: IScrollParams): void {
        if (_private.needScrollCalculation(this._options.navigation, this._options.virtualScrollConfig)) {
            switch (eventName) {
                case 'virtualScrollMove':
                    _private.throttledVirtualScrollPositionChanged(this, params);
                    break;
                case 'canScroll':
                    _private.onScrollShow(this, params);
                    break;
                case 'cantScroll':
                    _private.onScrollHide(this);
                    break;
            }
        }
        switch (eventName) {
            case 'scrollMove':
                _private.handleListScroll(this, params);
                break;
            case 'scrollMoveSync':
                this._listVirtualScrollController.scrollPositionChange(params.scrollTop);
                _private.handleListScrollSync(this, params.scrollTop);
                break;
            case 'viewportResize':
                // размеры вью порта нужно знать всегда, независимо от navigation,
                // т.к. по ним рисуется глобальная ромашка
                this.viewportResizeHandler(params.clientHeight, params.rect, params.scrollTop);
                break;
        }
    }

    // region Indicators

    private _createIndicatorsController(options: IBaseControlOptions): void {
        this._indicatorsController = new IndicatorsController(this._getIndicatorsControllerOptions(options));
    }

    private _updateIndicatorsController(newOptions?: IBaseControlOptions, isLoading: boolean = false): void {
        const options = newOptions || this._options;
        const controllerOptions = this._getIndicatorsControllerOptions(options);
        this._indicatorsController.updateOptions(controllerOptions, isLoading);
    }

    private _getIndicatorsControllerOptions(options: IBaseControlOptions): IIndicatorsControllerOptions {
        const stopDisplayPortionedSearchCallback = () => {
            if (typeof this._sourceController.cancelLoading !== 'undefined') {
                this._sourceController.cancelLoading();
            }

            if (this._indicatorsController.shouldDisplayTopIndicator()) {
                this._indicatorsController.displayTopIndicator(true);
            }

            if (this._isScrollShown) {
                _private.updateShadowMode(this, this._shadowVisibility);
            }
        };

        return {
            model: this._listViewModel,
            items: this._items,
            isInfinityNavigation: _private.isInfinityNavigation(options.navigation),
            hasMoreDataToTop: this._hasMoreData('up'),
            hasMoreDataToBottom: this._hasMoreData('down'),
            shouldShowEmptyTemplate: this.__needShowEmptyTemplate(options),
            scrollToFirstItem: this._scrollToFirstItemAfterDisplayTopIndicator,
            hasHiddenItemsByVirtualScroll: this._hasHiddenItemsByVirtualScroll,
            attachLoadTopTriggerToNull: !!options.attachLoadTopTriggerToNull,
            attachLoadDownTriggerToNull: !!options.attachLoadDownTriggerToNull,
            stopDisplayPortionedSearchCallback
        };
    }

    private _indicatorsControllerOnCollectionReset(): void {
        // прерывать поиск нужнно до вызова onCollectionReset.
        // onCollectionReset при необходимости запустит порционный поиск.
        if (_private.isPortionedLoad(this)) {
            // Событие reset коллекции приводит к остановке активного порционного поиска.
            // В дальнейшем (по необходимости) он будет перезапущен в нужных входных точках.
            this._indicatorsController.endDisplayPortionedSearch();

            // после ресета пытаемся подгрузить данные, возможно вернули не целую страницу
            _private.tryLoadToDirectionAgain(this);
        }

        if (!_private.isPortionedLoad(this) && this._indicatorsController.isDisplayedPortionedSearch()) {
            this._indicatorsController.endDisplayPortionedSearch();
        }

        // Нужно обновить hasMoreData. Когда произойдет _beforeUpdate уже будет поздно,
        // т.к. успеет сработать intersectionObserver и произойдет лишняя подгрузка
        const hasMoreData = _private.getHasMoreData(this);
        this._indicatorsController.setHasMoreData(hasMoreData.up, hasMoreData.down);

        this._indicatorsController.onCollectionReset();
    }

    private _updateViewportFilledInIndicatorsController(): void {
        let viewportFilled;

        // viewportSize и viewSize обновляются не одновременно. Чтобы корректно посчитать viewportFilled,
        // дожидаемся когда оба значения есть.
        if (!this._viewportSize || !this._viewSize) {
            viewportFilled = false;
        } else {
            const container = this._children?.viewContainer || this._container[0] || this._container;
            // Не учитываем высоту индикаторов порционного поиска по viewSize.
            // Т.к. они стикаются и при остановке поиска скрываются.
            // То есть если эти индикаторы учитывается во viewSize,
            // то после остановки поиска останется свободное место во вьюпорте.
            const portionedSearchIndicators = container.querySelectorAll && container.querySelectorAll('.controls-BaseControl__portionedSearch') || [];
            let portionedSearchIndicatorsHeight = 0;
            Array.from(portionedSearchIndicators).forEach((it) => {
                portionedSearchIndicatorsHeight += it.clientHeight;
            });

            viewportFilled = this._viewSize - portionedSearchIndicatorsHeight > this._viewportSize;
        }

        this._indicatorsController?.setViewportFilled(viewportFilled);
    }

    private _destroyIndicatorsController(): void {
        this._indicatorsController.destroy();
        this._indicatorsController = null;
    }

    private _getIndicatorDomElement(direction: 'top'|'bottom'): HTMLElement {
        return direction === 'top'
            ? this._children.listView?.getTopIndicator()
            : this._children.listView?.getBottomIndicator();
    }

    private _countGlobalIndicatorPosition(): number {
        return this._scrollTop + (this._viewportSize || this._viewSize) / 2 - INDICATOR_HEIGHT / 2;
    }

    private _displayGlobalIndicator(): void {
        if (this._indicatorsController.shouldDisplayGlobalIndicator()) {
            this._indicatorsController.displayGlobalIndicator(this._countGlobalIndicatorPosition());
        }
    }

    private _hasHiddenItemsByVirtualScroll(direction: 'up'|'down'): boolean {
        const compatibleDirection = direction === 'up' ? 'backward' : 'forward';
        return this._hasItemsOutRange && this._hasItemsOutRange[compatibleDirection];
    }

    private _scrollToFirstItemAfterDisplayTopIndicator(onDrawItems: boolean = false): void {
        const scrollAndShowTrigger = () => {
            if (this._scrollTop) {
                // если уже список проскроллен, то не нужно скроллить к первому элементу
                this._listVirtualScrollController.setBackwardTriggerVisible(true);
            } else {
                const scrollResult = this._scrollToFirstItem();
                scrollResult.then(() => {
                    this._listVirtualScrollController.setBackwardTriggerVisible(true);
                });
            }
        };

        // Скроллить нужно после того как ромашка отрисуется, то есть на _afterRender
        if (onDrawItems) {
            this._doAfterDrawItems = () => {
                scrollAndShowTrigger();
            };
        } else {
            _private.doAfterRender(this, scrollAndShowTrigger);
        }
    }

    private _scrollToFirstItem(): Promise<void> {
        let firstItem = this._listViewModel.getFirst();
        // к скрытой группе нельзя скроллить, т.к. ее высота равна 0 и это не добавит отступ для триггера =>
        // вызовется подгрузка вверх
        if (firstItem['[Controls/_display/GroupItem]'] && firstItem.key === groupConstants.hiddenGroup) {
            firstItem = this._listViewModel.getNext(firstItem);
        }
        const firstItemKey = firstItem && firstItem.key !== undefined ? firstItem.key : null;
        if (firstItemKey !== null) {
            return _private.scrollToItem(this, firstItemKey, 'top', true);
        }
        return Promise.resolve();
    }

    protected _onContinueSearchClick(): void {
        this._indicatorsController.continueDisplayPortionedSearch();
        _private.loadToDirectionIfNeed(this, this._indicatorsController.getPortionedSearchDirection());
    }

    protected _onAbortSearchClick(): void {
        this._indicatorsController.abortDisplayPortionedSearch();
        if (typeof this._sourceController.cancelLoading !== 'undefined') {
            this._sourceController.cancelLoading();
        }

        _private.disablePagingNextButtons(this);

        if (this._isScrollShown) {
            _private.updateShadowMode(this, this._shadowVisibility);
        }
        this._notify('iterativeSearchAborted', []);
    }

    protected _shouldEndDisplayPortionedSearch(loadedItems?: RecordSet): boolean {
        const wasPortionedLoad = _private.isPortionedLoad(this);
        const isPortionedLoad = _private.isPortionedLoad(this, loadedItems);
        return wasPortionedLoad && (!_private.hasMoreDataInAnyDirection(this) || !isPortionedLoad);
    }

    // endregion Indicators

    // region Drag-N-Drop

    getDndListController(): DndController {
        return this._dndListController;
    }

    _isPagingPaddingFromOptions(): boolean {
        return this._options.navigation &&
            this._options.navigation.viewConfig &&
            !(this._options.navigation.viewConfig.pagingMode === 'end' ||
                this._options.navigation.viewConfig.pagingPadding === 'null' ||
                this._options.navigation.viewConfig.pagingPadding === null
            );
    }

    /**
     * Говорим контролу сверху, что тач уже обработан этим контролом,
     * помечая событие тача как обработанное
     * @param event
     */
    _touchStartHandler(event: SyntheticEvent): void {
        event.nativeEvent.processed = true;
    }

    _isPagingPadding(): boolean {
        return !detection.isMobileIOS &&
            this._isPagingPaddingFromOptions() &&
            (this._bottomVisible || !!this._indicatorsController.getPortionedSearchDirection());
    }

    /**
     * Подписка на событие mouseMove внутри всего списка, а не только внутри item
     * @param event
     * @private
     */
    _onListMouseMove(event): void {
        // В тач режиме itemActions создаются непосредственно при свайпе
        // isMobilePlatform использовать для проверки не целесообразно, т.к. на интерфейсах с
        // touch режимом isMobilePlatform может быть false
        if (!TouchDetect.getInstance().isTouch() && !_private.isEditing(this)) {
            _private.updateItemActionsOnce(this, this._options);
        }
        // Использовать itemMouseMove тут нельзя, т.к. отслеживать перемещение мышки надо вне itemsContainer
        if (_private.hasHoverFreezeController(this) && _private.isAllowedHoverFreeze(this)) {
            this._hoverFreezeController.restartUnfreezeHoverTimeout(event);
        }
        // Для случая, когда на ZinFrame посвайпали а потом взяли мышь
        const itemActionsController = _private.getItemActionsController(this, this._options);
        if (itemActionsController) {
            itemActionsController.deactivateSwipe();
        }
    }

    _onMouseMove(event): void {
        // В яндекс браузере каким то образом пришел nativeEvent === null, после чего
        // упала ошибка в коде ниже и страница стала некликабельной. Повторить ошибку не получилось
        // добавляем защиту на всякий случай.
        if (event.nativeEvent) {
            if (detection.isIE) {
                this._onMouseMoveIEFix(event);
            } else {
                // Check if the button is pressed while moving.
                if (!event.nativeEvent.buttons) {
                    this._dragNDropEnded(event);
                }
            }

            // Не надо вызывать onMove если не нажата кнопка мыши.
            // Кнопка мыши может быть не нажата в 2 случаях:
            // 1) Мышь увели за пределы браузера, там отпустили и вернули в браузер
            // 2) Баг IE, который подробнее описан в методе _onMouseMoveIEFix
            if (event.nativeEvent.buttons) {
                _private.onMove(this, event.nativeEvent);
            }
        }
    }

    _onMouseMoveIEFix(event): void {
        // In IE strange bug, the cause of which could not be found. During redrawing of the table the MouseMove
        // event at which buttons = 0 shoots. In 10 milliseconds we will check that the button is not pressed.
        if (!event.nativeEvent.buttons && !this._endDragNDropTimer) {
            this._endDragNDropTimer = setTimeout(() => {
                this._dragNDropEnded(event);
            }, IE_MOUSEMOVE_FIX_DELAY);
        } else {
            clearTimeout(this._endDragNDropTimer);
            this._endDragNDropTimer = null;
        }
    }

    _onTouchMove(event): void {
        _private.onMove(this, event.nativeEvent);
    }

    _onMouseUp(event): void {
        if (this._startEvent) {
            this._dragNDropEnded(event);
        }
    }

    _documentDragStart(dragObject: IDragObject): void {
        if (this._options.readOnly || !this._options.itemsDragNDrop || !(dragObject && dragObject.entity)) {
            return;
        }

        // dragStart должен вызываться в том списке, в котором он начался.
        // draggedKey запоминается имеено на таком списке.
        // Возможна ситуация: событие _documentDragStart бросается из стартового списка, а после того как
        // событие долетает до всех списков мышка находится уже в другом списке.
        // (1-ый список insideDragging=false, 2-ой список insideDragging=true)
        // Из-за этого пытаемся начать днд не в том списке.
        if (this._draggedKey !== null) {
            this._dragStart(dragObject, this._draggedKey);
        } else {
            this._dragEntity = dragObject.entity;
        }
        this._documentDragging = true;
    }

    _dragStart(dragObject: IDragObject, draggedKey: CrudEntityKey): void {
        this._beforeStartDrag(draggedKey);

        if (_private.hasHoverFreezeController(this)) {
            this._hoverFreezeController.unfreezeHover();
        }

        this._dndListController.startDrag(dragObject.entity);

        // Показываем плашку, если утащили мышь за пределы списка, до
        // того как выполнился запрос за перетаскиваемыми записями
        const hasSorting = this._options.sorting && this._options.sorting.length;
        if (this._options.draggingTemplate && (this._listViewModel.isDragOutsideList() || hasSorting)) {
            this._notify('_updateDraggingTemplate', [dragObject, this._options.draggingTemplate], {bubbling: true});
        }
    }

    _beforeStartDrag(draggedKey: CrudEntityKey): void {
        // переопределяем в TreeControl
    }

    _dragLeave(): void {
        this._insideDragging = false;
        // Это функция срабатывает при перетаскивании скролла, поэтому проверяем _dndListController
        if (this._dndListController && this._dndListController.isDragging() && this._documentDragging) {
            const draggableItem = this._dndListController.getDraggableItem();
            if (draggableItem && this._listViewModel.getItemBySourceKey(draggableItem.getContents().getKey())) {
                const newPosition = this._dndListController.calculateDragPosition(
                    {targetItem: null, mouseOffsetInTargetItem: null}
                );
                // Если индекс === -1, значит изначально элемента не было в коллекции и нужно завершить днд,
                // т.к. мышку увели из этого списка.
                if (newPosition.index === -1) {
                    this._dndListController.endDrag();
                } else {
                    this._dndListController.setDragPosition(newPosition);
                }
            } else {
                // если перетаскиваемого элемента нет в модели, значит мы перетащили элемент в другой список
                this._dndListController.endDrag();
            }
        }
        const hasSorting = this._options.sorting && this._options.sorting.length;
        if (!hasSorting) {
            this._listViewModel.setDragOutsideList(true);
        }
    }

    _dragEnter(dragObject: IDragObject): void {
        this._insideDragging = true;
        const hasSorting = this._options.sorting && this._options.sorting.length;
        if (!hasSorting) {
            if (this._documentDragging) {
                this._notify('_removeDraggingTemplate', [], {bubbling: true});
            }
            this._listViewModel.setDragOutsideList(false);
        }

        // Не нужно начинать dnd, если и так идет процесс dnd
        if (this._dndListController?.isDragging()) {
            return;
        }

        if (this._documentDragging) {
            if (dragObject && cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity')) {
                const dragEnterResult = this._notify('dragEnter', [dragObject.entity]);

                if (cInstance.instanceOfModule(dragEnterResult, 'Types/entity:Record')) {
                    // Создаем перетаскиваемый элемент, т.к. в другом списке его нет.
                    const draggableItem = this._listViewModel.createItem({contents: dragEnterResult});
                    // Считаем изначальную позицию записи. Нужно считать обязательно до ::startDrag,
                    // т.к. после перетаскиваемая запись уже будет в коллекции
                    let startPosition;
                    if (this._listViewModel.getCount()) {
                        startPosition = {
                            index: this._listViewModel.getCount(),
                            dispItem: this._listViewModel.getLast(),
                            position: 'after'
                        };
                    } else {
                        startPosition = {
                            index: 0,
                            dispItem: draggableItem,
                            position: 'before'
                        };
                    }

                    // если мы утащим в другой список, то в нем нужно создать контроллер
                    this._dndListController =
                        _private.createDndListController(this._listViewModel, draggableItem, this._options);
                    this._dndListController.startDrag(dragObject.entity);

                    // задаем изначальную позицию в другом списке
                    this._dndListController.setDragPosition(startPosition);
                } else if (dragEnterResult === true) {
                    this._dndListController = _private.createDndListController(
                        this._listViewModel, null, this._options
                    );
                    this._dndListController.startDrag(dragObject.entity);
                }
            }
        }
    }

    _notifyDragEnd(dragObject: IDragObject, targetPosition: IDragPosition<CollectionItem>) {
        return this._notify('dragEnd', [
            dragObject.entity,
            targetPosition.dispItem.getContents(),
            targetPosition.position
        ]);
    }

    _documentDragEnd(dragObject: IDragObject): void {
        // Флаг _documentDragging проставляется во всех списках, он говорит что где-то началось перетаскивание записи
        // и при mouseEnter возможно придется начать днд. Поэтому сбрасываем флаг не зависимо от isDragging
        this._documentDragging = false;

        // событие documentDragEnd может долететь до списка, в котором нет модели
        if (!this._listViewModel || !this._dndListController || !this._dndListController.isDragging()) {
            return;
        }

        let dragEndResult: Promise<any> | undefined;
        if (this._insideDragging && this._dndListController) {
            const targetPosition = this._dndListController.getDragPosition();
            if (targetPosition && targetPosition.dispItem) {
                dragEndResult = this._notifyDragEnd(dragObject, targetPosition);
            }

            // После окончания DnD, не нужно показывать операции, до тех пор, пока не пошевелим мышкой.
            // Задача: https://online.sbis.ru/opendoc.html?guid=9877eb93-2c15-4188-8a2d-bab173a76eb0
            _private.removeShowActionsClass(this);
        }

        const endDrag = () => {
            const targetPosition = this._dndListController.getDragPosition();
            const draggableItem = this._dndListController.getDraggableItem();
            this._dndListController.endDrag();

            // перемещаем маркер только если dragEnd сработал в списке в который перетаскивают
            if (this._options.markerVisibility !== 'hidden' &&
                targetPosition &&
                draggableItem &&
                this._insideDragging) {
                const moveToCollapsedNode = targetPosition.position === 'on'
                    && targetPosition.dispItem instanceof TreeItem
                    && !targetPosition.dispItem.isExpanded();
                // Ставим маркер на перетаксиваемый элемент всегда, за исключением ситуации
                // когда перетаскиваем запись в свернутый узел
                if (!moveToCollapsedNode) {
                    const draggedKey = draggableItem.getContents().getKey();
                    this._changeMarkedKey(draggedKey);
                }
            }

            // данное поведение сейчас актуально только для дерева или когда перетаскиваем в другой список
            if (_private.hasSelectionController(this) && (this._options.parentProperty || !this._insideDragging)) {
                _private.changeSelection(this, {selected: [], excluded: []});
            }

            this._dndListController = null;
            this._insideDragging = false;
        };

        // Это функция срабатывает при перетаскивании скролла, поэтому проверяем _dndListController
        // endDrag нужно вызывать только после события dragEnd,
        // чтобы не было прыжков в списке, если асинхронно меняют порядок элементов
        if (this._dndListController) {
            if (dragEndResult instanceof Promise) {
                this._displayGlobalIndicator();
                dragEndResult.finally(() => {
                    endDrag();
                    if (this._indicatorsController.shouldHideGlobalIndicator()) {
                        this._indicatorsController.hideGlobalIndicator();
                    }
                });
            } else {
                endDrag();
            }
        }

        this._draggedKey = null;
        this._listViewModel.setDragOutsideList(false);
    }

    _getDragObject(mouseEvent?, startEvent?): IDragObject {
        const result: IDragObject = {
            entity: this._dragEntity
        };
        if (mouseEvent && startEvent) {
            result.domEvent = mouseEvent;
            result.position = _private.getPageXY(mouseEvent);
            result.offset = _private.getDragOffset(mouseEvent, startEvent);
            result.draggingTemplateOffset = DRAGGING_OFFSET;
        }
        return result;
    }

    _dragNDropEnded(event: SyntheticEvent): void {
        // https://online.sbis.ru/opendoc.html?guid=81679655-1bde-4817-a7d6-b177242c00e8
        if (this._destroyed) {
            return;
        }

        if (this._dndListController && this._dndListController.isDragging()) {
            const dragObject = this._getDragObject(event.nativeEvent, this._startEvent);
            this._notify('_documentDragEnd', [dragObject], {bubbling: true});
        }
        if (this._startEvent && this._startEvent.target) {
            this._startEvent.target.classList.remove('controls-DragNDrop__dragTarget');
        }
        this._unregisterMouseMove();
        this._unregisterMouseUp();
        this._dragEntity = null;
        this._startEvent = null;
    }

    protected _calculateMouseOffsetInItem(event: MouseEvent): {top: number, bottom: number} {
        let result = null;

        const targetElement = this._getDndTargetRow(event);

        if (targetElement) {
            const dragTargetRect = targetElement.getBoundingClientRect();

            result = { top: null, bottom: null };

            const mouseCoords = DimensionsMeasurer.getMouseCoordsByMouseEvent(event.nativeEvent);

            // В плитке порядок записей слева направо, а не сверху вниз, поэтому считаем отступы слева и справа
            if (this._listViewModel['[Controls/_tile/Tile]']) {
                result.top = (mouseCoords.x - dragTargetRect.left) / dragTargetRect.width;
                result.bottom = (dragTargetRect.right - mouseCoords.x) / dragTargetRect.width;
            } else {
                result.top = (mouseCoords.y - dragTargetRect.top) / dragTargetRect.height;
                result.bottom = (dragTargetRect.top + dragTargetRect.height - mouseCoords.y) / dragTargetRect.height;
            }
        }

        return result;
    }

    /**
     * Получаем по event.target строку списка
     * @param event
     * @private
     */
    private _getDndTargetRow(event: MouseEvent): Element {
        if (
            !event.target ||
            !event.target.classList ||
            !event.target.parentNode ||
            !event.target.parentNode.classList
        ) {
            return event.target as Element;
        }

        const startTarget = event.target;
        let target = startTarget;

        const condition = () => {
            // В плитках элемент с классом controls-ListView__itemV имеет нормальные размеры,
            // а в обычном списке данный элемент будет иметь размер 0x0
            if (this._listViewModel['[Controls/_tile/Tile]']) {
                return !target.classList.contains('controls-ListView__itemV');
            } else {
                return !target.parentNode.classList.contains('controls-ListView__itemV');
            }
        };

        while (condition()) {
            target = target.parentNode;

            // Условие выхода из цикла, когда controls-ListView__itemV не нашелся в родительских блоках
            if (!target.classList || !target.parentNode || !target.parentNode.classList
                || target.classList.contains('controls-BaseControl')) {
                target = startTarget;
                break;
            }
        }

        return target as Element;
    }

    _registerMouseMove(): void {
        this._notify('register', ['mousemove', this, this._onMouseMove], {bubbling: true});
        this._notify('register', ['touchmove', this, this._onTouchMove], {bubbling: true});
    }

    _unregisterMouseMove(): void {
        this._notify('unregister', ['mousemove', this], {bubbling: true});
        this._notify('unregister', ['touchmove', this], {bubbling: true});
    }

    _registerMouseUp(): void {
        this._notify('register', ['mouseup', this, this._onMouseUp], {bubbling: true});
        this._notify('register', ['touchend', this, this._onMouseUp], {bubbling: true});
    }

    _unregisterMouseUp(): void {
        this._notify('unregister', ['mouseup', this], {bubbling: true});
        this._notify('unregister', ['touchend', this], {bubbling: true});
    }
    // endregion

    _getFooterSpacingClasses(options): string {
        const hasCheckboxes = options.multiSelectVisibility !== 'hidden' && options.multiSelectPosition !== 'custom';

        const paddingClassName = `controls__BaseControl__footer-${options.style}__paddingLeft_`;
        if (hasCheckboxes) {
            paddingClassName += 'withCheckboxes';
        } else {
            paddingClassName += (options.itemPadding?.left?.toLowerCase() || 'default');
        }

        return `${paddingClassName}`;
    }

    _getNavigationButtonClasses(options, buttonConfig): string {
        const buttonView = this._resolveNavigationButtonView() === 'separator';
        if (!buttonView || (buttonConfig && buttonConfig.buttonPosition !== 'center')) {
            return this._getFooterSpacingClasses(options);
        }
    }

    /**
     * Ф-ия вызывается после того как были обновлены значения флагов, идентифицирующих
     * нужно или нет показывать кнопку "Еще..." или "•••" (cut)
     */
    _onFooterPrepared(options: IBaseControlOptions): void {
        // После обновления данных футера нужно обновить _needBottomPadding,
        // который прокидывается во view
        this._needBottomPadding = _private.needBottomPadding(this, options);
    }

    _onToggleHorizontalScroll(e, visibility: boolean): void {
        // TODO: Не переношу в грид контрол, т.к. этот код удалится в 22.1000.
        if (!this._options.newColumnScroll) {
            this._isColumnScrollVisible = visibility;
        }
    }

    isColumnScrollVisible(): boolean {
        // TODO: Не переношу в грид контрол, т.к. этот код удалится в 22.1000.
        if (!this._options.newColumnScroll) {
            return this._isColumnScrollVisible;
        }
    }

    static _private: typeof _private = _private;

    private static _rejectEditInPlacePromise(fromWhatMethod: string): Promise<void> {
        const msg = ERROR_MSG.CANT_USE_IN_READ_ONLY(fromWhatMethod);
        Logger.warn(msg);
        return Promise.reject(msg);
    }

    static getDefaultOptions(): Partial<IBaseControlOptions> {
        return {
            attachLoadTopTriggerToNull: true,
            attachLoadDownTriggerToNull: true,
            itemContainerGetter: ItemContainerGetter,
            markerStrategy: SingleColumnStrategy,
            uniqueKeys: true,
            multiSelectVisibility: 'hidden',
            multiSelectPosition: 'default',
            allowMultiSelect: true,
            markerVisibility: 'onactivated',
            style: 'default',
            loadingIndicatorTemplate: 'Controls/baseList:LoadingIndicatorTemplate',
            continueSearchTemplate: 'Controls/baseList:ContinueSearchTemplate',
            virtualScrollConfig: {},
            multiColumns: false,
            plainItemsContainer: true,
            filter: {},
            itemActionsVisibility: 'onhover',
            searchValue: '',
            moreFontColorStyle: 'listMore',
            urlProperty: 'url',

            // FIXME: https://online.sbis.ru/opendoc.html?guid=12b8b9b1-b9d2-4fda-85d6-f871ecc5474c
            stickyHeader: true,
            stickyResults: true,
            stickyColumnsCount: 1,
            notifyKeyOnRender: false,
            topTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET,
            bottomTriggerOffsetCoefficient: DEFAULT_TRIGGER_OFFSET
        };
    }
}

Object.defineProperty(BaseControl, 'defaultProps', {
    enumerable: true,
    configurable: true,
    get(): object {
        return BaseControl.getDefaultOptions();
    }
});
