import { Control } from 'UI/Base';
import { detection } from 'Env/Env';
import { SyntheticEvent } from 'UI/Vdom';
import { Model } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';
import { IObservable } from 'Types/collection';

import InertialScrolling from 'Controls/_baseList/resources/utils/InertialScrolling';

import {
    Collection,
    CollectionItem,
    TItemKey,
    VirtualScrollController,
    VirtualScrollHideController
} from 'Controls/display';
import type { IVirtualScrollConfig } from 'Controls/_baseList/interface/IVirtualScroll';
import {
    IActiveElementChangedChangedCallback,
    IDirection,
    IEdgeItem,
    IHasItemsOutRange,
    IIndexesChangedParams,
    IItemsEndedCallback,
    IItemsRange,
    IPlaceholders,
    ScrollController,
    IScrollControllerOptions
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import {
    AbstractItemsSizesController,
    IAbstractItemsSizesControllerOptions,
    IItemsSizes
} from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/AbstractItemsSizeController';
import {
    AbstractObserversController,
    IAbstractObserversControllerOptions,
    ITriggersPositions,
    ITriggersOffsetCoefficients,
    ITriggersVisibility,
    ITriggerPosition,
    IAdditionalTriggersOffsets
} from 'Controls/_baseList/Controllers/ScrollController/ObserverController/AbstractObserversController';
import { Logger } from 'UI/Utils';

const ERROR_PATH = 'Controls/_baseList/Controllers/AbstractListVirtualScrollController';

export type IScheduledScrollType = 'restoreScroll' | 'calculateRestoreScrollParams' | 'scrollToElement' | 'doScroll';

export interface IScheduledScrollToElementParams {
    key: CrudEntityKey;
    position: string;
    force: boolean;
}

/**
 * Интерфейс, описывающий параметры для подсчтеа крайнего видимого элемента
 * @remark
 * range, placeholders, itemsSizes - не обязательные параметры. Если их не задать, то будут использоваться
 * текущие значения. Задвать нужно только для восстановления скролла, т.к. восстанавливать скролл нужно
 * исходя из старого состояния.
 */
export interface IEdgeItemCalculatingParams {
    direction: IDirection;
    range?: IItemsRange;
    placeholders?: IPlaceholders;
}

export type IScrollParam = number | 'top' | 'bottom' | 'pageUp' | 'pageDown';

export interface IDoScrollParams {
    scrollParam: IScrollParam;
}

export interface IScheduledScrollParams {
    type: IScheduledScrollType;
    params: IEdgeItem | IScheduledScrollToElementParams | IEdgeItemCalculatingParams | IDoScrollParams;
}

type IScrollToElementUtil = (container: HTMLElement, position: string, force: boolean) => Promise<void>|void;
type IDoScrollUtil = (scrollParam: IScrollParam) => void;
type IUpdateShadowsUtil = (hasItems: IHasItemsOutRange) => void;
type IUpdatePlaceholdersUtil = (placeholders: IPlaceholders) => void;
type IUpdateVirtualNavigationUtil = (hasItems: IHasItemsOutRange) => void;
type IHasItemsOutRangeChangedCallback = (hasItems: IHasItemsOutRange) => void;
export type IAbstractItemsSizesControllerConstructor =
    new (options: IAbstractItemsSizesControllerOptions) => AbstractItemsSizesController;
export type IAbstractObserversControllerConstructor =
    new (options: IAbstractObserversControllerOptions) => AbstractObserversController;

export interface IAbstractListVirtualScrollControllerOptions {
    collection: Collection;
    listControl: Control;

    virtualScrollConfig: IVirtualScrollConfig;

    listContainer: HTMLElement;
    itemsContainer: HTMLElement;

    triggersQuerySelector: string;
    itemsQuerySelector: string;

    updateShadowsUtil?: IUpdateShadowsUtil;
    updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
    updateVirtualNavigationUtil?: IUpdateVirtualNavigationUtil;
    hasItemsOutRangeChangedCallback: IHasItemsOutRangeChangedCallback;

    triggersVisibility: ITriggersVisibility;
    triggersOffsetCoefficients: ITriggersOffsetCoefficients;
    triggersPositions: ITriggersPositions;
    additionalTriggersOffsets: IAdditionalTriggersOffsets;

    scrollToElementUtil: IScrollToElementUtil;
    doScrollUtil: IDoScrollUtil;

    itemsEndedCallback: IItemsEndedCallback;
    activeElementChangedCallback: IActiveElementChangedChangedCallback;
}

export abstract class AbstractListVirtualScrollController<
    TOptions extends IAbstractListVirtualScrollControllerOptions = IAbstractListVirtualScrollControllerOptions> {
    private readonly _inertialScrolling: InertialScrolling = new InertialScrolling();

    protected _collection: Collection;
    protected _scrollController: ScrollController;
    private _itemSizeProperty: string;
    private _keepScrollPosition: boolean = false;

    private readonly _scrollToElementUtil: IScrollToElementUtil;
    protected readonly _doScrollUtil: IDoScrollUtil;
    private readonly _updateShadowsUtil?: IUpdateShadowsUtil;
    private readonly _updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
    private readonly _updateVirtualNavigationUtil?: IUpdateVirtualNavigationUtil;
    private readonly _hasItemsOutRangeChangedCallback: IHasItemsOutRangeChangedCallback;

    private _itemsRangeScheduledSizeUpdate: IItemsRange;
    private _scheduledScrollParams: IScheduledScrollParams;
    private _scheduledUpdateHasItemsOutRange: IHasItemsOutRange;
    private _scheduledCheckTriggersVisibility: boolean;
    private _doAfterSynchronizationCallback: Function;

    /**
     * Стейт используется, чтобы определить что сейчас идет синхронизация.
     * Нужно для того, чтобы не менять индексы уже во время синхронизации.
     * @private
     */
    private _synchronizationInProgress: boolean;

    /**
     * Колбэк, который вызывается когда завершился скролл к элементу. Скролл к элементу вызывается асинхронно.
     * По этому колбэку резолвится промис, который возвращается из метода scrollToItem
     * @private
     */
    private _scrollToElementCompletedCallback: () => void;

    /**
     * Колбэк, который вызывается, когда завершился подскролл.
     * Используется, чтобы вернуть правильный ключ в методе scrollToPage
     * @private
     */
    protected _doScrollCompletedCallback: () => void;

    constructor(options: TOptions) {
        this._onCollectionChange = this._onCollectionChange.bind(this);
        this._initCollection(options.collection);

        this._itemSizeProperty = options.virtualScrollConfig.itemHeightProperty;

        this._scrollToElementUtil = options.scrollToElementUtil;
        this._doScrollUtil = options.doScrollUtil;
        this._updateShadowsUtil = options.updateShadowsUtil;
        this._updatePlaceholdersUtil = options.updatePlaceholdersUtil;
        this._updateVirtualNavigationUtil = options.updateVirtualNavigationUtil;
        this._hasItemsOutRangeChangedCallback = options.hasItemsOutRangeChangedCallback;

        this._setCollectionIterator(options.virtualScrollConfig.mode);
        this._createScrollController(options);
    }

    protected abstract _getItemsSizeControllerConstructor(): IAbstractItemsSizesControllerConstructor;
    protected abstract _getObserversControllerConstructor(): IAbstractObserversControllerConstructor;

    setCollection(collection: Collection): void {
        this._initCollection(collection);
    }

    setItemsContainer(itemsContainer: HTMLElement): void {
        this._scrollController.setItemsContainer(itemsContainer);
    }

    setListContainer(listContainer: HTMLElement): void {
        this._scrollController.setListContainer(listContainer);
    }

    afterMountListControl(): void {
        this._handleScheduledUpdateHasItemsOutRange();
        this._handleScheduledCheckTriggerVisibility();
    }

    beforeUpdateListControl(): void {
        this._synchronizationInProgress = true;
    }

    beforeRenderListControl(): void {
        this._handleScheduledScroll();
    }

    afterRenderListControl(): void {
        this._handleScheduledUpdateItemsSizes();
        this._handleScheduledUpdateHasItemsOutRange();
        this._handleScheduledScroll();
        this._handleScheduledCheckTriggerVisibility();

        this._synchronizationInProgress = false;
        if (this._doAfterSynchronizationCallback) {
            this._doAfterSynchronizationCallback();
            this._doAfterSynchronizationCallback = null;
        }
    }

    saveScrollPosition(): void {
        // Если и так запланировано восстановление скролла, то не нужно пытаться еще раз сохранять позицию.
        // Данный кейс возможен если мы, например: скроллим вверх, смещаем диапазон, показываем ромашку(т.к. следующее
        // достижение триггера долнжо подгрузить данные). В этом случае восстановление скролла будет запланировано
        // в indexesChangedCallback.
        if (!this._scheduledScrollParams) {
            const edgeItem = this._scrollController.getEdgeVisibleItem({ direction: 'backward' });
            this._scheduleScroll({
                type: 'restoreScroll',
                params: edgeItem
            });
        }
    }

    virtualScrollPositionChange(position: number): void {
        this._scrollController.scrollToVirtualPosition(position);
    }

    scrollPositionChange(position: number): void {
        if (detection.isMobileIOS) {
            this._inertialScrolling.scrollStarted();
        }

        this._scrollController.scrollPositionChange(position);
    }

    enableKeepScrollPosition(): void {
        this._keepScrollPosition = true;
    }

    disableKeepScrollPosition(): void {
        this._keepScrollPosition = false;
    }

    contentResized(contentSize: number): void {
        const changed = this._scrollController.contentResized(contentSize);
        // contentResized может сработать до afterRender.
        // Поэтому если запланировано обновление размеров, то мы его должны обязательно сделать на afterRender
        if (changed && !this._itemsRangeScheduledSizeUpdate) {
            this._scrollController.updateItemsSizes();
        }
    }

    viewportResized(viewportSize: number): void {
        const changed = this._scrollController.viewportResized(viewportSize);
        // viewportResized может сработать до afterRender.
        // Поэтому если запланировано обновление размеров, то мы его должны обязательно сделать на afterRender
        if (changed && !this._itemsRangeScheduledSizeUpdate) {
            this._scrollController.updateItemsSizes();
        }
    }

    // region ScrollTo

    scrollToItem(key: TItemKey, position?: string, force?: boolean): Promise<void> {
        const promise = new Promise<void>((resolver) => this._scrollToElementCompletedCallback = resolver);

        const itemIndex = this._collection.getIndexByKey(key);
        const rangeChanged = this._scrollController.scrollToItem(itemIndex);
        if (rangeChanged || this._scheduledScrollParams) {
            this._scheduleScroll({
                type: 'scrollToElement',
                params: { key, position, force }
            });
        } else {
            this._scrollToElement(key, position, force);
        }

        return promise;
    }

    /**
     * Скроллит к переданной странице.
     * Скроллит так, чтобы было видно последний элемент с предыдущей страницы, чтобы не потерять "контекст".
     * Смещает диапазон, возвращает промис с ключом записи верхней полностью видимой записи.
     * @param direction Условная страница, к которой нужно скроллить. (Следующая, предыдущая)
     * @private
     */
    scrollToPage(direction: IDirection): Promise<CrudEntityKey> {
        this._doScrollUtil(direction === 'forward' ? 'pageDown' : 'pageUp');
        return Promise.resolve(this._getFirstVisibleItemKey());

        // TODO SCROLL по идее нужно скролить к EdgeItem, чтобы не терялся контекст.
        //  Но нужно сперва завести новый скролл на текущих тестах.
        /*const edgeItem = this._scrollController.getEdgeVisibleItem({direction});
        // TODO SCROLL юниты
        if (!edgeItem) {
            return Promise.resolve(null);
        }

        const item = this._collection.at(edgeItem.index);
        const itemKey = item.getContents().getKey();
        const scrollPosition = direction === 'forward' ? 'top' : 'bottom';
        return this.scrollToItem(itemKey, scrollPosition, true).then(() => this._getFirstVisibleItemKey());*/
    }

    /**
     * Скроллит к переданному краю списка.
     * Смещает диапазон, возвращает промис с индексами крайних видимых полностью элементов.
     * @param edge Край списка
     * @private
     */
    scrollToEdge(edge: IDirection): Promise<CrudEntityKey> {
        const itemIndex = edge === 'backward' ? 0 : this._collection.getCount() - 1;
        const item = this._collection.at(itemIndex);
        const itemKey = item.getContents().getKey();
        const scrollPosition = edge === 'forward' ? 'top' : 'bottom';
        return this.scrollToItem(itemKey, scrollPosition, true).then(() => {
            const promise = new Promise<void>((resolver) => this._doScrollCompletedCallback = resolver);

            // Делаем подскролл, чтобы список отскролился к самому краю
            // Делаем через scheduleScroll, чтобы если что успел отрисоваться, например отступ под пэйджинг
            this._scheduleScroll({
                type: 'doScroll',
                params: {
                    scrollParam: edge === 'backward' ? 'top' : 'bottom'
                }
            });

            return promise.then(() => this._getFirstVisibleItemKey());
        });
    }

    protected _getFirstVisibleItemKey(): CrudEntityKey {
        if (!this._collection || !this._collection.getCount()) {
            return null;
        }

        const firstVisibleItemIndex = this._scrollController.getFirstVisibleItemIndex();
        const item = this._collection.at(firstVisibleItemIndex);
        return item.getContents().getKey();
    }

    // endregion ScrollTo

    // region Triggers

    setBackwardTriggerVisible(visible: boolean): void {
        this._scrollController.setBackwardTriggerVisible(visible);
    }

    setForwardTriggerVisible(visible: boolean): void {
        this._scrollController.setForwardTriggerVisible(visible);
    }

    setBackwardTriggerPosition(position: ITriggerPosition): void {
        this._scrollController.setBackwardTriggerPosition(position);
    }

    setForwardTriggerPosition(position: ITriggerPosition): void {
        this._scrollController.setForwardTriggerPosition(position);
    }

    setAdditionalTriggersOffsets(additionalTriggersOffsets: IAdditionalTriggersOffsets): void {
        this._scrollController.setAdditionalTriggersOffsets(additionalTriggersOffsets);
    }

    // endregion Triggers

    private _createScrollController(options: TOptions): void {
        const scrollControllerOptions = this._getScrollControllerOptions(options);
        this._scrollController = new ScrollController(scrollControllerOptions);
        this._scrollController.resetItems(scrollControllerOptions.totalCount, false);
    }

    protected _getScrollControllerOptions(options: TOptions): IScrollControllerOptions {
        return {
            listControl: options.listControl,
            virtualScrollConfig: options.virtualScrollConfig,

            itemsContainer: options.itemsContainer,
            listContainer: options.listContainer,

            itemsQuerySelector: options.itemsQuerySelector,
            itemsSizeControllerConstructor: this._getItemsSizeControllerConstructor(),
            observerControllerConstructor: this._getObserversControllerConstructor(),
            triggersQuerySelector: options.triggersQuerySelector,

            triggersVisibility: options.triggersVisibility,
            triggersOffsetCoefficients: options.triggersOffsetCoefficients,
            triggersPositions: options.triggersPositions,
            additionalTriggersOffsets: options.additionalTriggersOffsets,

            scrollPosition: 0,
            viewportSize: options.virtualScrollConfig.viewportHeight || 0,
            contentSize: 0,
            totalCount: this._collection.getCount(),
            givenItemsSizes: this._getGivenItemsSizes(),

            indexesInitializedCallback: (range: IItemsRange): void => {
                this._scheduleUpdateItemsSizes({
                    startIndex: range.startIndex,
                    endIndex: range.endIndex
                });
                this._applyIndexes(range.startIndex, range.endIndex);
            },
            indexesChangedCallback: this._indexesChangedCallback.bind(this),
            placeholdersChangedCallback: (placeholders: IPlaceholders): void => {
                this._updatePlaceholdersUtil(placeholders);
            },
            hasItemsOutRangeChangedCallback: (hasItemsOutRange: IHasItemsOutRange): void => {
                this._scheduleUpdateHasItemsOutRange(hasItemsOutRange);
                this._hasItemsOutRangeChangedCallback(hasItemsOutRange);
            },
            activeElementChangedCallback: options.activeElementChangedCallback,
            itemsEndedCallback: options.itemsEndedCallback
        };
    }

    private _indexesChangedCallback(params: IIndexesChangedParams): void {
        // Нельзя изменять индексы во время синхронизации, т.к. возможно что afterRender будет вызван другими измениями.
        // Из-за этого на afterRender не будет еще отрисован новый диапазон, он отрисуется на следующую синхронизацию.
        this._doAfterSynchronization(() => {
            this._scheduleUpdateItemsSizes(params.range);
            // Возможно ситуация, что после смещения диапазона(подгрузки данных) триггер остался виден
            // Поэтому после отрисовки нужно проверить, не виден ли он. Если он все еще виден, то нужно
            // вызвать observerCallback. Сам колбэк не вызовется, т.к. видимость триггера не поменялась.
            this._scheduleCheckTriggersVisibility();

            // Если меняется только endIndex, то это не вызовет изменения скролла и восстанавливать его не нужно.
            // Например, если по триггеру отрисовать записи вниз, то скролл не изменится.
            // НО когда у нас меняется startIndex, то мы отпрыгнем вверх, если не восстановим скролл.
            // PS. ОБРАТИТЬ ВНИМАНИЕ! Восстанавливать скролл нужно ВСЕГДА, т.к. если записи добавляются в самое начало,
            // то startIndex не изменится, а изменится только endIndex, но по факту это изменение startIndex.
            this._applyIndexes(params.range.startIndex, params.range.endIndex);

            // Планируем восстановление скролла. Скролл можно восстановить запомнив крайний видимый элемент (IEdgeItem).
            // EdgeItem мы можем посчитать только на _beforeRender - это момент когда точно прекратятся события scroll
            // и мы будем знать актуальную scrollPosition.
            // Поэтому в params запоминает необходимые параметры для подсчета EdgeItem.
            if (params.shiftDirection !== null) {
                this._scheduleScroll({
                    type: 'calculateRestoreScrollParams',
                    params: {
                        direction: params.shiftDirection,
                        range: params.oldRange,
                        placeholders: params.oldPlaceholders
                    } as IEdgeItemCalculatingParams
                });
            }
        });
    }

    private _doAfterSynchronization(callback: Function): void {
        if (this._synchronizationInProgress) {
            this._doAfterSynchronizationCallback = callback;
        } else {
            callback();
        }
    }

    private _scheduleUpdateItemsSizes(itemsRange: IItemsRange): void {
        this._itemsRangeScheduledSizeUpdate = itemsRange;
    }

    private _scheduleUpdateHasItemsOutRange(hasItemsOutRange: IHasItemsOutRange): void {
        this._scheduledUpdateHasItemsOutRange = hasItemsOutRange;
    }

    private _handleScheduledUpdateHasItemsOutRange(): void {
        const hasItemsOutRange = this._scheduledUpdateHasItemsOutRange;
        if (hasItemsOutRange) {
            if (this._updateShadowsUtil) {
                this._updateShadowsUtil(hasItemsOutRange);
            }
            if (this._updateVirtualNavigationUtil) {
                this._updateVirtualNavigationUtil(hasItemsOutRange);
            }
        }
    }

    private _handleScheduledUpdateItemsSizes(): void {
        if (this._itemsRangeScheduledSizeUpdate) {
            this._scrollController.updateItemsSizes(this._itemsRangeScheduledSizeUpdate);
            this._itemsRangeScheduledSizeUpdate = null;
        }
    }

    private _scheduleCheckTriggersVisibility() {
        this._scheduledCheckTriggersVisibility = true;
    }

    private _handleScheduledCheckTriggerVisibility(): void {
        if (this._scheduledCheckTriggersVisibility) {
            this._scheduledCheckTriggersVisibility = false;
            this._scrollController.checkTriggersVisibility();
        }
    }

    protected _scheduleScroll(scrollParams: IScheduledScrollParams): void {
        this._scheduledScrollParams = scrollParams;
    }

    private _handleScheduledScroll(): void {
        if (this._scheduledScrollParams) {
            switch (this._scheduledScrollParams.type) {
                case 'calculateRestoreScrollParams':
                    const params = this._scheduledScrollParams.params as IEdgeItemCalculatingParams;
                    const edgeItem = this._scrollController.getEdgeVisibleItem(params);
                    this._scheduledScrollParams = null;

                    if (edgeItem) {
                        this._scheduleScroll({
                            type: 'restoreScroll',
                            params: edgeItem
                        });
                    }
                    break;
                case 'restoreScroll':
                    const restoreScrollParams = this._scheduledScrollParams.params as IEdgeItem;
                    const scrollPosition = this._scrollController.getScrollPositionToEdgeItem(restoreScrollParams);
                    this._doScrollUtil(scrollPosition);
                    this._scheduledScrollParams = null;
                    break;
                case 'scrollToElement':
                    const scrollToElementParams = this._scheduledScrollParams.params as IScheduledScrollToElementParams;
                    this._scrollToElement(
                        scrollToElementParams.key,
                        scrollToElementParams.position,
                        scrollToElementParams.force
                    );
                    this._scheduledScrollParams = null;
                    break;
                case 'doScroll':
                    const doScrollParams = this._scheduledScrollParams.params as IDoScrollParams;
                    this._doScrollUtil(doScrollParams.scrollParam);
                    this._doScrollCompletedCallback();
                    this._scheduledScrollParams = null;
                    break;
                default:
                    Logger.error(`${ERROR_PATH}::_handleScheduledScroll | ` +
                        'Внутренняя ошибка списков! Неопределенный тип запланированного скролла.');
            }
        }
    }

    private _scrollToElement(key: CrudEntityKey, position?: string, force?: boolean): void {
        this._inertialScrolling.callAfterScrollStopped(() => {
            const element = this._scrollController.getElement(key);
            if (element) {
                const result = this._scrollToElementUtil(element, position, force);
                if (result instanceof Promise) {
                    result.then(() => this._scrollToElementCompletedCallback());
                } else {
                    this._scrollToElementCompletedCallback();
                }
            } else {
                /* TODO SCROLL починить юниты
                Logger.error(`${ERROR_PATH}::_scrollToElement | ` +
                    'Внутренняя ошибка списков! По ключу записи не найден DOM элемент. ' +
                    'Промис scrollToItem не отстрельнет, возможны ошибки.');*/
            }
        });
    }

    private _setCollectionIterator(mode: 'remove' | 'hide'): void {
        switch (mode) {
            case 'hide':
                VirtualScrollHideController.setup(
                    this._collection as unknown as VirtualScrollHideController.IVirtualScrollHideCollection
                );
                break;
            default:
                VirtualScrollController.setup(
                    this._collection as unknown as VirtualScrollController.IVirtualScrollCollection
                );
                break;
        }
    }

    private _getGivenItemsSizes(): IItemsSizes|null {
        if (!this._itemSizeProperty) {
            return null;
        }

        const itemsSizes: IItemsSizes = this._collection.getItems()
            .map((it) => {
                const itemSize = {
                    size: it.getContents().get(this._itemSizeProperty),
                    offset: 0
                };

                if (!itemSize.size) {
                    Logger.error('Controls/baseList:BaseControl | Задана опция itemHeightProperty, ' +
                                `но для записи с ключом "${it.getContents().getKey()}" высота не определена!`);
                }

                return itemSize;
            });

        return itemsSizes;
    }

    private _initCollection(collection: Collection): void {
        if (this._collection === collection) {
            return;
        }

        // Не нужно отписываться от коллекции, если она уже задестроена
        if (this._collection && !this._collection.destroyed) {
            this._collection.unsubscribe('onCollectionChange', this._onCollectionChange);
        }

        this._collection = collection;

        this._collection.subscribe('onCollectionChange', this._onCollectionChange);

        if (this._scrollController && this._collection) {
            this._scrollController.resetItems(this._collection.getCount(), this._keepScrollPosition);
        }
    }

    protected _onCollectionChange(
        event: SyntheticEvent,
        action: string,
        newItems: Array<CollectionItem<Model>>,
        newItemsIndex: number,
        removedItems: Array<CollectionItem<Model>>,
        removedItemsIndex: number
    ): void {
        if (!this._scrollController) {
            return;
        }

        const totalCount = this._collection.getCount();

        switch (action) {
            case IObservable.ACTION_ADD: {
                this._scrollController.addItems(newItemsIndex, newItems.length);
                break;
            }
            case IObservable.ACTION_MOVE: {
                this._scrollController.moveItems(
                    newItemsIndex,
                    newItems.length,
                    removedItemsIndex,
                    removedItems.length);
                break;
            }
            case IObservable.ACTION_REMOVE: {
                this._scrollController.removeItems(removedItemsIndex, removedItems.length);
                break;
            }
            case IObservable.ACTION_RESET: {
                this._scrollController.updateGivenItemsSizes(this._getGivenItemsSizes());
                this._scrollController.resetItems(totalCount, this._keepScrollPosition);
                break;
            }
        }
    }

    protected abstract _applyIndexes(startIndex: number, endIndex: number): void;
}

// Как работает pageDown/pageUp:
// 1. Обрабатывается нажатие клавиши
// 2. Получаем крайний видимый элемент
// 3. Скроллим к нему
// 4. Возвращаем промис с ключом записи, к которой проскролили
// 5. Ставим маркер на эту запись

// Как работает восстановление скролла:
// 1. Срабатывает trigger, вызываем shiftToDirection, смещаем диапазон
// 2. Вызываем indexesChangedCallback
// 3. Планируем восстановление скролла. Для этого запоминаем текущий(не новый) range, плейсхолдеры и shiftDirection
// 4. На beforeRender считаем крайний видимый элемент по параметрам из шага 3.
// 5. На afterRender считаем новый scrollPosition до крайнего видимого элемента
// EdgeItem можно запоминать ТОЛЬКО на beforeRender, т.к. после срабатывания триггера может произойти скролл.
// beforeRender - это точка после которой гарантированно не будет меняться scrollPosition.
// Но т.к. мы считаем EdgeItem на beforeRender, нам нужно прокидывать старый range и плейсхолдер, чтобы EdgeItem
// посчитать по состоянию до смещения диапазона.
// Плейсхолдер нужны, чтобы из ItemSizes посчитать актуальный offset
// (ItemSize.offset = placeholders.backward + element.offset(настоящий оффсет в DOM)
