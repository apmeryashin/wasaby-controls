import {Logger} from 'UI/Utils';
import {_Options, SyntheticEvent} from 'UI/Vdom';
import {isEqual} from 'Types/object';
import {Control} from 'UI/Base';
import {debounce as cDebounce} from 'Types/function';
import * as forTemplate from 'wml!Controls/_baseList/Render/For';
import * as GroupTemplate from 'wml!Controls/_baseList/GroupTemplate';
import * as ListViewTpl from 'wml!Controls/_baseList/ListView/ListView';
import * as defaultItemTemplate from 'wml!Controls/_baseList/ItemTemplate';
import 'css!Controls/baseList';
import { Collection, CollectionItem } from 'Controls/display';
import {IRoundBorder} from 'Controls/interface';
import { Model } from 'Types/entity';
import {IFixedEventData} from 'Controls/scroll';

export interface IListViewOptions {
    listModel: Collection;
    theme: string;
    needShowEmptyTemplate: boolean;
    roundBorder: IRoundBorder;
}

const DEBOUNCE_HOVERED_ITEM_CHANGED = 150;

const _private = {
    checkDeprecated(cfg, self) {
        if (cfg.contextMenuEnabled !== undefined) {
            Logger.warn('IList: Option "contextMenuEnabled" is deprecated and removed in 19.200. Use option "contextMenuVisibility".', self);
        }
        if (cfg.markerVisibility === 'always') {
            Logger.warn('IList: Value "always" for property Controls/_list/interface/IList#markerVisibility is deprecated, use value "visible" instead.', self);
        }
        if (cfg.markerVisibility === 'demand') {
            Logger.warn('IList: Value "demand" for property Controls/_list/interface/IList#markerVisibility is deprecated, use value "onactivated" instead.', self);
        }
        if (cfg.results) {
            Logger.warn('IList: Option "results" is deprecated and removed in 19.200. Use options "resultsPosition" and "resultsTemplate".', self);
        }
        if (cfg.groupingKeyCallback) {
            Logger.warn('IList: Option "groupingKeyCallback" is deprecated and removed soon. Use options "groupProperty".', self);
        }
    },

    resizeNotifyOnListChanged(self) {
       // command to scroll watcher
       self._notify('controlResize', [], {bubbling: true});
    },

    setHoveredItem(self, itemData, nativeEvent) {
        // setHoveredItem вызывается с задержкой, поэтому список уже может задестроиться
        // Не надо посылать ховер по элементам, которые нельзя выбирать
        if (self._destroyed || (itemData && itemData.SelectableItem === false)) {
            return;
        }

        const item = itemData?.item;
        if (item !== self._hoveredItem) {
            self._hoveredItem = item;
            const container = nativeEvent ? nativeEvent.target.closest('.controls-ListView__itemV') : null;
            self._notify('hoveredItemChanged', [item, container]);
        }
    }
};

const ListView = Control.extend(
    {
        _listModel: null,
        _hoveredItem: null,
        _template: ListViewTpl,
        _groupTemplate: GroupTemplate,
        _defaultItemTemplate: defaultItemTemplate,
        _pendingRedraw: false,
        _reloadInProgress: false,
        _callbackAfterReload: null,
        _callbackAfterUpdate: null,
        _forTemplate: null,
        _modelChanged: false,
        _fixedItems: [],

        constructor() {
            ListView.superclass.constructor.apply(this, arguments);
            this._debouncedSetHoveredItem = cDebounce(_private.setHoveredItem, DEBOUNCE_HOVERED_ITEM_CHANGED);
           // TODO при полном переходе на новую модель нужно переписать, уберется параметр changesType
            this._onListChangeFnc = (event, changesType, action, newItems) => {
               if (this._destroyed) {
                   return;
               }
               if (this._isPendingRedraw(event, changesType, action, newItems)) {
                  this._pendingRedraw = true;
               }
            };
            this._onIndexesChanged = () => {
                this._pendingRedraw = true;
            };
        },

        _isPendingRedraw(event, changesType, action, newItems) {
            // todo refactor by task https://online.sbis.ru/opendoc.html?guid=80fbcf1f-5804-4234-b635-a3c1fc8ccc73
            // Из новой коллекции нотифается collectionChanged, в котором тип изменений указан в newItems.properties
            let itemChangesType;
            // В событии новой модели нет такого параметра как changesType, из-за этого в action лежит newItems
            itemChangesType = action ? action.properties : null;

            if (changesType !== 'hoveredItemChanged' &&
                changesType !== 'activeItemChanged' &&
                changesType !== 'loadingPercentChanged' &&
                changesType !== 'markedKeyChanged' &&
                changesType !== 'itemActionsUpdated' &&
                itemChangesType !== 'marked' &&
                itemChangesType !== 'hovered' &&
                itemChangesType !== 'active' &&
                itemChangesType !== 'canShowActions' &&
                itemChangesType !== 'animated' &&
                itemChangesType !== 'fixedPosition') {
                return true;
            }
        },

        _doAfterReload(callback): void {
            if (this._reloadInProgress) {
                if (this._callbackAfterReload) {
                    this._callbackAfterReload.push(callback);
                } else {
                    this._callbackAfterReload = [callback];
                }
            } else {
                callback();
            }
        },

        _doAfterUpdate(callback): void {
            if (this._updateInProgress) {
                if (this._callbackAfterUpdate) {
                    this._callbackAfterUpdate.push(callback);
                } else {
                    this._callbackAfterUpdate = [callback];
                }
            } else {
                callback();
            }
        },

        _doOnComponentDidUpdate(callback): void {
            if (this._waitingComponentDidUpdate) {
                if (this._callbackOnComponentDidUpdate) {
                    this._callbackOnComponentDidUpdate.push(callback);
                } else {
                    this._callbackOnComponentDidUpdate = [callback];
                }
            } else {
                callback();
            }
        },

        setReloadingState(state): void {
            this._reloadInProgress = state;
            if (state === false && this._callbackAfterReload) {
                if (this._callbackAfterReload) {
                    this._callbackAfterReload.forEach((callback) => {
                        callback();
                    });
                    this._callbackAfterReload = null;
                }
            }
        },

        _beforeMount(newOptions) {
            _private.checkDeprecated(newOptions, this);
            if (newOptions.groupTemplate) {
                this._groupTemplate = newOptions.groupTemplate;
            }
            if (newOptions.listModel) {
                this._listModel = newOptions.listModel;

                this._listModel.subscribe('onCollectionChange', this._onListChangeFnc);
                this._listModel.subscribe('indexesChanged', this._onIndexesChanged);
            }
            this._forTemplate = forTemplate;
            this._itemTemplate = this._resolveItemTemplate(newOptions);
        },

        _beforeUnmount() {
            this._notify('viewUnmount', []);
            if (this._listModel && !this._listModel.destroyed) {
                this._listModel.unsubscribe('onCollectionChange', this._onListChangeFnc);
                this._listModel.unsubscribe('indexesChanged', this._onIndexesChanged);
            }
            this._fixedItems = [];
        },

        _beforeUpdate(newOptions) {
            this._updateInProgress = true;
            this._waitingComponentDidUpdate = true;
            if (newOptions.listModel && (this._listModel !== newOptions.listModel)) {
                this._modelChanged = true;
                if (this._listModel && !this._listModel.destroyed) {
                    this._listModel.unsubscribe('onCollectionChange', this._onListChangeFnc);
                    this._listModel.unsubscribe('indexesChanged', this._onIndexesChanged);
                }
                this._listModel = newOptions.listModel;
                this._listModel.subscribe('onCollectionChange', this._onListChangeFnc);
                this._listModel.subscribe('indexesChanged', this._onIndexesChanged);
            }
            if (this._options.groupTemplate !== newOptions.groupTemplate) {
                this._groupTemplate = newOptions.groupTemplate;
            }
            if (!isEqual(this._options.roundBorder, newOptions.roundBorder)) {
                this._listModel.setRoundBorder(newOptions.roundBorder);
            }
            this._itemTemplate = this._resolveItemTemplate(newOptions);

            this._applyNewOptionsAfterReload(this._options, newOptions);
        },

        _componentDidUpdate() {
            this._waitingComponentDidUpdate = false;
            if (this._callbackOnComponentDidUpdate) {
                this._callbackOnComponentDidUpdate.forEach((callback) => {
                    callback();
                });
                this._callbackOnComponentDidUpdate = null;
            }
        },

        _afterUpdate() {
            this._updateInProgress = false;
            if (this._callbackAfterUpdate) {
                this._callbackAfterUpdate.forEach((callback) => {
                    callback();
                });
                this._callbackAfterUpdate = null;
            }
        },

        // Сброс к изначальному состоянию без ремаунта, например при reload'е.
        reset(params: {keepScroll?: boolean} = {}): void {
            /* For override  */
        },

        _resolveItemTemplate(options) {
           return options.itemTemplate || this._defaultItemTemplate;
        },

        // protected
        /**
         * Метод предназначен для перекрытия в потомках что бы можно было реализовать
         * кастомную проверку и обновление модели
         */
        _applyNewOptionsAfterReload(oldOptions: unknown, newOptions: unknown): void {
            const changes = [];
            const changedOptions = _Options.getChangedOptions(newOptions, oldOptions);

            if (changedOptions) {
                if (changedOptions.hasOwnProperty('stickyFooter') || changedOptions.hasOwnProperty('footerTemplate')) {
                    changes.push('footer');
                }
            }

            if (changes.length) {
                this._doAfterReload(() => {
                    if (changes.includes('footer')) {
                        this._listModel.setFooter(newOptions);
                    }
                });
            }
        },

        onViewResized() {
            _private.resizeNotifyOnListChanged(this);
        },

        _componentDidMount() {
            this._notify('itemsContainerReady', [this.getItemsContainer.bind(this)]);
            // todo костыль до тех пор, пока не перейдем на отслеживание ресайза через нативное событие в двух основныых
            // местах - в окнах и в scrollContainer'e.
            // https://online.sbis.ru/opendoc.html?guid=4409ca19-6e5d-41af-b080-5431dbd8887c
            if (this._options.notifyResizeAfterMount !== false) {
                this._notify('controlResize', [], {bubbling: true});
            }
        },

        _afterRender() {
            if (this._pendingRedraw) {
                this.onViewResized();
            }
            this._pendingRedraw = false;

            if (this._modelChanged) {
                this._modelChanged = false;
                if (this._listModel) {
                    this._notify('itemsContainerReady', [this.getItemsContainer.bind(this)]);
                }
            }
        },

        getItemsContainer(): HTMLElement {
            return this._children.itemsContainer;
        },

        _onItemClick(e: SyntheticEvent & {preventItemEvent: boolean}, dispItem: CollectionItem): void {
            // Флаг preventItemEvent выставлен, если нужно предотвратить возникновение
            // событий itemClick, itemMouseDown по нативному клику, но по какой-то причине
            // невозможно остановить всплытие события через stopPropagation
            // TODO: Убрать, preventItemEvent когда это больше не понадобится
            // https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
            if (e.preventItemEvent) {
                return;
            }

            // Если взаимодействие идет непосредственно с внешней оберткой,
            // то нужно заглушить такое событие, т.к. это значит что настроен
            // межстрочный интервал и взаимодействие идет непосредственно с ним,
            // а не со строкой.
            if (this._targetIsRootItemContainer(e.target as HTMLElement)) {
                e.stopImmediatePropagation();
                return;
            }

            if (dispItem['[Controls/_display/GroupItem]']) {
                const groupItem = dispItem.getContents();
                this._notify('groupClick', [groupItem, e, dispItem]);
                return;
            }

            if (e.target.closest('.js-controls-ListView__checkbox')) {
                this._notify('checkBoxClick', [dispItem, e]);
                return;
            }

            const item = dispItem.getContents();
            this._notify('itemClick', [item, e]);
        },

        _onGroupClick(e, dispItem) {
            const item = dispItem.getContents();
            this._notify('groupClick', [item, e]);
        },

        _onItemContextMenu(event, itemData) {
           if (
               this._options.contextMenuEnabled !== false &&
               this._options.contextMenuVisibility !== false &&
               !this._options.listModel.isEditing()
           ) {
                this._notify('itemContextMenu', [itemData, event, false]);
           }
        },

        /**
         * Обработчик долгого тапа
         * @param event
         * @param itemData
         * @private
         */
        _onItemLongTap(event, itemData): void {
            if (
                this._options.contextMenuEnabled !== false &&
                this._options.contextMenuVisibility !== false &&
                !this._options.listModel.isEditing()
            ) {
                this._notify('itemLongTap', [itemData, event]);
            }
        },

        _onItemSwipe(event, itemData) {
            if (event.nativeEvent.direction === 'left') {
                this.activate();
            }
            this._notify('itemSwipe', [itemData, event]);
            event.stopPropagation();
        },

        _onRowDeactivated(event, eventOptions) {
            this._notify('rowDeactivated', [eventOptions]);
        },

        _onItemMouseDown(event: SyntheticEvent, itemData: CollectionItem): void {
            // Если взаимодействие идет непосредственно с внешней оберткой,
            // то нужно заглушить такое событие, т.к. это значит что настроен
            // межстрочный интервал и взаимодействие идет непосредственно с ним,
            // а не со строкой.
            if (this._targetIsRootItemContainer(event.target as HTMLElement)) {
                event.stopImmediatePropagation();
                return;
            }

            if (itemData['[Controls/_display/GroupItem]']) {
                event.stopPropagation();
                return;
            }
            if (itemData && itemData.isSwiped()) {
                // TODO: Сейчас на itemMouseDown список переводит фокус на fakeFocusElement
                //  и срабатывает событие listDeactivated. Из-за этого события закрывается свайп,
                //  это неправильно, т.к. из-за этого становится невозможным открытие меню.
                //  Выпилить после решения задачи
                //  https://online.sbis.ru/opendoc.html?guid=38315a8d-2006-4eb8-aeb3-05b9447cd629
                return;
            }

            // TODO: Убрать, preventItemEvent когда это больше не понадобится
            // https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
            if (!event.preventItemEvent) {
                this._notify('itemMouseDown', [itemData, event]);
            }
        },

        _onItemMouseUp(e: SyntheticEvent, itemData: CollectionItem): void {
            // Если взаимодействие идет непосредственно с внешней оберткой,
            // то нужно заглушить такое событие, т.к. это значит что настроен
            // межстрочный интервал и взаимодействие идет непосредственно с ним,
            // а не со строкой.
            if (this._targetIsRootItemContainer(e.target as HTMLElement)) {
                e.stopImmediatePropagation();
                return;
            }

            if (itemData['[Controls/_display/GroupItem]']) {
                e.stopPropagation();
                return;
            }

            this._notify('itemMouseUp', [itemData, e]);
        },

        _onItemMouseEnter(event, itemData) {
            this._notify('itemMouseEnter', [itemData, event]);
            this._debouncedSetHoveredItem(this, itemData, event);
        },

        // TODO: из-за того что ItemOutput.wml один для всех таблиц, приходится подписываться в нем на события,
        // которые не нужны для ListView.
        // Выписана задача https://online.sbis.ru/opendoc.html?guid=9fd4922f-eb37-46d5-8c39-dfe094605164
        _onItemMouseLeave(event, itemData) {
            this._notify('itemMouseLeave', [itemData, event]);
            this._debouncedSetHoveredItem(this, null);
        },

        _onItemMouseMove(event, itemData) {
            this._notify('itemMouseMove', [itemData, event]);
        },

        _onItemWheel(event) {
            /* For override  */
        },

        // region Indicators

        getTopLoadingTrigger(): HTMLElement {
            return this._children.topLoadingTrigger;
        },

        getBottomLoadingTrigger(): HTMLElement {
            return this._children.bottomLoadingTrigger;
        },

        getTopIndicator(): HTMLElement {
            return this._children.topIndicator;
        },

        getBottomIndicator(): HTMLElement {
            return this._children.bottomIndicator;
        },

        _onIndicatorClick(event: SyntheticEvent): void {
            if (event.target.closest('.js-controls-BaseControl__continueSearch')) {
                this._notify('continueSearchClick');
            }
            if (event.target.closest('.js-controls-BaseControl__abortSearch')) {
                this._notify('abortSearchClick');
            }
        },

        // endregion Indicators

        setHoveredItem(item) {
            this._listModel.setHoveredItem(item);
        },

        getHoveredItem() {
            return this._listModel.getHoveredItem();
        },

        _onFixedItemChanged(
            event: SyntheticEvent,
            item: CollectionItem<Model>,
            information: IFixedEventData
        ): void {
            // Обновляем данные по зафиксированным итемам.
            // Далее на основании этой информации будут проставляться CSS классы
            if (information.fixedPosition) {
                this._fixedItems.push(item);
            } else {
                const index = this._fixedItems.indexOf(item);

                if (index >= 0) {
                    this._fixedItems.splice(index, 1);
                }
            }

            this._notify('fixedItemChanged', [item, information]);
        },

        // protected
        _getFooterClasses(): string {
            let result = 'controls-ListView__footer';

            // Есть смысл добавлять минимальную высоту футеру только если в коллекции есть данные
            if (this._options.itemActionsPosition === 'outside' && this._listModel.getCount()) {
                result += ' controls-ListView__footer__itemActionsV_outside';
            }

            let leftPadding: string;
            if (this._options.multiSelectVisibility !== 'hidden') {
                leftPadding = 'withCheckboxes';
            } else {
                leftPadding = (this._options.itemPadding && this._options.itemPadding.left || 'default').toLowerCase();
            }
            result += ` controls-ListView__footer__paddingLeft_${leftPadding}`;

            return result;
        },

        activateEditingRow(enableScrollToElement?: boolean): boolean {
            if (this._children.editingRow) {
                this._children.editingRow.activate({ enableScrollToElement });
                return true;
            }
            return false;
        },

        _onEditingItemClick(e, dispItem, nativeEvent): void {
            e.stopPropagation();

            if (!e.preventItemEvent && nativeEvent.target.closest('.js-controls-ListView__checkbox')) {
                this._notify('checkBoxClick', [dispItem, nativeEvent]);
                return;
            }
        },

        /**
         * Вернет true, если переданный элемент это внешняя обертка итема,
         * котора организует отступы.
         */
        _targetIsRootItemContainer(target: HTMLElement): boolean {
            return target.classList.contains('controls-ListView__itemV');
        }
    });

ListView.getDefaultOptions = () => ({
    contextMenuVisibility: true,
    markerVisibility: 'onactivated'
});

Object.defineProperty(ListView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ListView.getDefaultOptions();
   }
});

/**
 * Имя сущности для идентификации списка.
 */
Object.defineProperty(ListView.prototype, 'listInstanceName', {
    value: 'controls-List',
    writable: false
});

export = ListView;
