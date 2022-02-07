import { Control } from 'UI/Base';
import { detection } from 'Env/Env';
import { CrudEntityKey } from 'Types/source';

import InertialScrolling from 'Controls/_baseList/resources/utils/InertialScrolling';

import {
    Collection,
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
    IScrollControllerOptions,
    IScrollMode,
    ICalcMode
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
import { TVirtualScrollMode } from 'Controls/_baseList/interface/IVirtualScroll';
import type { IInitialScrollPosition } from 'Controls/scroll';
import { isEqual } from 'Types/object';

const ERROR_PATH = 'Controls/_baseList/Controllers/AbstractListVirtualScrollController';

export type IScheduledScrollType = 'restoreScroll' | 'calculateRestoreScrollParams' | 'scrollToElement' | 'doScroll'
    | 'applyScrollPosition';

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
    itemsSizes?: IItemsSizes;
}

export type IScrollParam = number | 'top' | 'bottom' | 'pageUp' | 'pageDown';

export type IScrollOnReset = 'reset' | 'keep' | 'restore';

export interface IDoScrollParams {
    scrollParam: IScrollParam;
}

export interface IScheduledApplyScrollPositionParams {
    callback: () => void;
}

export interface IScheduledScrollParams {
    type: IScheduledScrollType;
    params: IEdgeItem | IScheduledScrollToElementParams | IEdgeItemCalculatingParams | IDoScrollParams
        | IScheduledApplyScrollPositionParams;
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

export const HIDDEN_ITEM_SELECTOR = '.controls-ListView__hiddenContainer';

// Нативный IntersectionObserver дергает callback по перерисовке.
// В ie нет нативного IntersectionObserver.
// Для него работает полифилл, используя throttle. Поэтому для ie нужна задержка.
// В fireFox возникает аналогичная проблема, но уже с нативным обсервером.
// https://online.sbis.ru/opendoc.html?guid=ee31faa7-467e-48bd-9579-b60bc43b2f87
const CHECK_TRIGGERS_DELAY = detection.isWin && !detection.isDesktopChrome || detection.isIE || detection.isMobileIOS
    ? 150
    : 0;

export interface IAbstractListVirtualScrollControllerOptions {
    collection: Collection;
    listControl: Control;

    virtualScrollConfig: IVirtualScrollConfig;
    activeElementKey: CrudEntityKey;
    initialScrollPosition: IInitialScrollPosition;

    listContainer: HTMLElement;
    itemsContainer: HTMLElement;

    triggersQuerySelector: string;
    itemsQuerySelector: string;
    itemsContainerUniqueSelector: string;

    updateShadowsUtil?: IUpdateShadowsUtil;
    updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
    updateVirtualNavigationUtil?: IUpdateVirtualNavigationUtil;

    triggersVisibility: ITriggersVisibility;
    triggersOffsetCoefficients: ITriggersOffsetCoefficients;
    triggersPositions: ITriggersPositions;
    additionalTriggersOffsets: IAdditionalTriggersOffsets;

    scrollToElementUtil: IScrollToElementUtil;
    doScrollUtil: IDoScrollUtil;

    itemsEndedCallback: IItemsEndedCallback;
    activeElementChangedCallback: IActiveElementChangedChangedCallback;
    hasItemsOutRangeChangedCallback: IHasItemsOutRangeChangedCallback;

    feature1183225611: boolean;
    disableVirtualScroll: boolean;
}

export abstract class AbstractListVirtualScrollController<
    TOptions extends IAbstractListVirtualScrollControllerOptions = IAbstractListVirtualScrollControllerOptions> {
    private readonly _inertialScrolling: InertialScrolling = new InertialScrolling();

    protected _collection: Collection;
    protected _scrollController: ScrollController;
    private _itemSizeProperty: string;
    private _virtualScrollMode: TVirtualScrollMode;
    private _activeElementKey: CrudEntityKey;
    private _initialScrollPosition: IInitialScrollPosition;
    private readonly _itemsContainerUniqueSelector: string;
    private _scrollOnReset: IScrollOnReset = 'reset';
    protected _scrollPosition: number;

    private readonly _scrollToElementUtil: IScrollToElementUtil;
    protected readonly _doScrollUtil: IDoScrollUtil;
    private readonly _updateShadowsUtil?: IUpdateShadowsUtil;
    private readonly _updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
    private readonly _updateVirtualNavigationUtil?: IUpdateVirtualNavigationUtil;
    private readonly _hasItemsOutRangeChangedCallback?: IHasItemsOutRangeChangedCallback;

    private _itemsRangeScheduledSizeUpdate: IItemsRange;
    private _scheduledScrollParams: IScheduledScrollParams;
    private _scheduledUpdateHasItemsOutRange: IHasItemsOutRange;
    private _scheduledCheckTriggersVisibility: boolean;
    private _handleChangedIndexesAfterSynchronizationCallback: Function;

    private _checkTriggersVisibilityTimeout: number;

    /**
     * Стейт используется для отделения внешнего скролла и скролла, который был вызван в служебных целях
     * самим контроллером. Так, не нужно вычислять активный элемент, после подскролла к записи.
     * Это нужно из-за того, что подскролл делается так, что целевой эелемент в верху вьюпорта,
     * а активный элемент не обязятельно.
     * Можно убрать после https://online.sbis.ru/opendoc.html?guid=075223ea-ed73-4412-9bba-0452cd555736
     * @private
     */
    private _selfScroll: boolean;

    /**
     * Предопределенное направление для восстановления скролла.
     * @remark Используется при подгрузке в узел, т.к. в этом случае обязательно нужно
     * восстанавливать скролл относительно верхней записи. В данном кейсе сделать это через shiftDirection нельзя, т.к.
     * смещать диапазон точно нужно вниз, но скролл восстанавливаем относительно верхней записи.
     * @private
     */
    private _predicatedRestoreDirection: IDirection;

    /**
     * Стейт используется, чтобы определить что сейчас идет отрисовка.
     * Нужно для того, чтобы не менять индексы уже во время отрисовки.
     * @private
     */
    private _renderInProgress: boolean;

    /**
     * Стейт, который определяет что сейчас выполняется отрисовка новых индексов.
     * Проставляется при изменении индексов и сбрасывается в afterRender
     * @private
     */
    private _renderNewIndexes: boolean;

    /**
     * Колбэк, который вызывается когда завершился скролл к элементу. Скролл к элементу вызывается асинхронно.
     * По этому колбэку резолвится промис, который возвращается из метода scrollToItem
     * @private
     */
    private _scrollCompletedCallback: () => void;

    /**
     * Колбэк, который вызывается, когда завершился подскролл.
     * Используется, чтобы вернуть правильный ключ в методе scrollToPage
     * @private
     */
    private _doScrollCompletedCallback: () => void;
    private _shouldResetScrollPosition: boolean;

    private _itemsRenderedOutsideRange: number[] = [];

    constructor(options: TOptions) {
        this._itemSizeProperty = options.virtualScrollConfig.itemHeightProperty;
        this._virtualScrollMode = options.virtualScrollConfig.mode;
        this._initialScrollPosition = options.initialScrollPosition;
        this.setActiveElementKey(options.activeElementKey);
        this._itemsContainerUniqueSelector = options.itemsContainerUniqueSelector;

        this._scrollToElementUtil = options.scrollToElementUtil;
        this._doScrollUtil = options.doScrollUtil;
        this._updateShadowsUtil = options.updateShadowsUtil;
        this._updatePlaceholdersUtil = options.updatePlaceholdersUtil;
        this._updateVirtualNavigationUtil = options.updateVirtualNavigationUtil;
        this._hasItemsOutRangeChangedCallback = options.hasItemsOutRangeChangedCallback;

        this._initCollection(options.collection);
        this._createScrollController(options);
    }

    protected abstract _getItemsSizeControllerConstructor(): IAbstractItemsSizesControllerConstructor;
    protected abstract _getObserversControllerConstructor(): IAbstractObserversControllerConstructor;

    setCollection(collection: Collection): void {
        this._initCollection(collection);
        if (this._scrollController && this._collection) {
            this.resetItems();
        }
    }

    setItemsContainer(itemsContainer: HTMLElement): void {
        this._scrollController.setItemsContainer(itemsContainer);
    }

    setItemsQuerySelector(newItemsQuerySelector: string): void {
        const itemsQuerySelector = this._getItemsSelector(newItemsQuerySelector, this._virtualScrollMode);
        this._scrollController.setItemsQuerySelector(itemsQuerySelector);
    }

    setListContainer(listContainer: HTMLElement): void {
        this._scrollController.setListContainer(listContainer);
    }

    afterMountListControl(): void {
        this._renderInProgress = false;
        this._renderNewIndexes = false;
        this._handleScheduledUpdateItemsSizes();
        this._handleScheduledUpdateHasItemsOutRange();
        if (this._activeElementKey !== undefined && this._activeElementKey !== null) {
            const activeElementIndex = this._collection.getIndexByKey(this._activeElementKey);
            // Если активный элемент находится в начале, то на маунт он и так виден, поэтому не скроллим к нему.
            // Если вызвать скролл, то ничего не произойдет, но при наличии графической шапки она сожмется.
            if (activeElementIndex !== 0) {
                this.scrollToItem(this._activeElementKey, 'top', true);
            }
        }

        // Если изначальная позиция ScrollContainer-а была задана end,
        // то contentSizeBeforeItems будет посчитан неправильно.
        // Поэтому планируем обновление размеров элементов на момент,
        // когда ScrollContainer уже будет отрисован правильно и размеры будут считаться правильно.
        if (this._initialScrollPosition?.vertical === 'end' || this._initialScrollPosition?.horizontal === 'end') {
            this._scheduleUpdateItemsSizes({
                startIndex: this._collection.getStartIndex(),
                endIndex: this._collection.getStopIndex()
            });
        }
    }

    endBeforeMountListControl(): void {
        // Устанавливаем _renderInProgress именно после маунта списка, т.к. нужно дождаться завершения:
        // - инициализации начальных индексов коллекции;
        // - инициализации строки добавления по месту.
        this._renderInProgress = true;
    }

    beforeUnmountListControl(): void {
        this._updatePlaceholdersUtil({
            forward: 0,
            backward: 0
        });
        if (this._updateVirtualNavigationUtil) {
            this._updateVirtualNavigationUtil({
                forward: false,
                backward: false
            });
        }
        this._scrollController.destroy();
    }

    endBeforeUpdateListControl(): void {
        // Нужно проставлять именно тут этот флаг. Например, если нам прокинутт 2 опции, одна из которых будет source.
        // То индексы могут посчитаться где-то между beforeUpdate и beforeRender.
        // Нужно чтобы эти индексы применились уже после отрисовки.
        // Также не нужно забывать, что индексы могут синхронно пересчитаться внутри _beforeUpdate
        // и вот их нужно применить сразу же.
        this._renderInProgress = true;
    }

    beforeRenderListControl(): void {
        // На beforeRender нам нужно только считать параметры для восстановления скролла.
        // Все остальные типы скролла выполняются на afterRender, когда записи уже отрисовались.
        if (this._scheduledScrollParams && this._scheduledScrollParams.type === 'calculateRestoreScrollParams') {
            this._handleScheduledScroll();
        }

        const itemsRenderedOutsideRange = this._collection.getItems()
            .filter((it) => it.isRenderedOutsideRange())
            .map((it) => this._collection.getIndex(it));
        if (!isEqual(this._itemsRenderedOutsideRange, itemsRenderedOutsideRange)) {
            this._itemsRenderedOutsideRange = itemsRenderedOutsideRange;

            // Если скрылась или отобразилась запись за пределами диапазона, то нужно восстановить скролл
            if (!this._isScheduledScroll()) {
                this.saveScrollPosition();
            }

            this._scrollController.setItemsRenderedOutsideRange(itemsRenderedOutsideRange);
        }

        // Браузер при замене контента всегда пытается восстановить скролл в прошлую позицию.
        // Т.е. если scrollTop = 1000, а размер нового контента будет лишь 500, то видимым будет последний элемент.
        // Из-за этого получится что мы вначале из-за нативного подскрола видим последний элемент, а затем сами
        // устанавливаем скролл в "0".
        // Как итог - контент мелькает. Поэтому сбрасываем скролл в 0 именно ДО отрисовки.
        // Пример ошибки: https://online.sbis.ru/opendoc.html?guid=c3812a26-2301-4998-8283-bcea2751f741
        // Демка нативного поведения: https://jsfiddle.net/alex111089/rjuc7ey6/1/
        if (this._shouldResetScrollPosition) {
            this._shouldResetScrollPosition = false;
            this._doScrollUtil('top');
        }
    }

    afterRenderListControl(): void {
        this._renderNewIndexes = false;

        this._handleScheduledUpdateItemsSizes();
        this._handleScheduledUpdateHasItemsOutRange();
        this._handleScheduledScroll();
        this._handleScheduledCheckTriggerVisibility();

        if (this._handleChangedIndexesAfterSynchronizationCallback) {
            this._handleChangedIndexesAfterSynchronizationCallback();
            this._handleChangedIndexesAfterSynchronizationCallback = null;
        }
        this._renderInProgress = false;
    }

    setPredicatedRestoreDirection(restoreDirection: IDirection): void {
        this._predicatedRestoreDirection = restoreDirection;
    }

    saveScrollPosition(): void {
        // Если и так запланировано восстановление скролла, то не нужно пытаться еще раз сохранять позицию.
        // Данный кейс возможен если мы, например: скроллим вверх, смещаем диапазон, показываем ромашку(т.к. следующее
        // достижение триггера долнжо подгрузить данные). В этом случае восстановление скролла будет запланировано
        // в indexesChangedCallback.
        if (!this._scheduledScrollParams) {
            const edgeItem = this._scrollController.getEdgeVisibleItem({ direction: 'backward' });
            if (edgeItem) {
                this._scheduleScroll({
                    type: 'restoreScroll',
                    params: edgeItem
                });
            }
        }
    }

    virtualScrollPositionChange(position: number, applyScrollPositionCallback: () => void): void {
        // Когда мы смещаем диапазон к виртуальной позиции, то scrollPosition нужно применить после отрисовки
        // нового диапазона. Для этого ScrollContainer прокидывает коллбэк.
        this._scheduleScroll({
            type: 'applyScrollPosition',
            params: {
                callback: applyScrollPositionCallback
            }
        });
        const indexesChanged = this._scrollController.scrollToVirtualPosition(position);
        if (!indexesChanged && !this._renderInProgress) {
            this._handleScheduledScroll();
        }
    }

    scrollPositionChange(position: number): void {
        if (detection.isMobileIOS) {
            this._inertialScrolling.scrollStarted();
        }

        this._scrollPosition = position;
        this._scrollController.scrollPositionChange(position, !this._selfScroll);
        this._selfScroll = false;
        if (this._scrollCompletedCallback) {
            this._scrollCompletedCallback();
        }
    }

    enableKeepScrollPosition(): void {
        this._scrollOnReset = 'keep';
    }

    disableKeepScrollPosition(): void {
        if (this._scrollOnReset === 'keep') {
            this._scrollOnReset = 'reset';
        }
    }

    enableRestoreScrollPosition(): void {
        this._scrollOnReset = 'restore';
    }

    disableRestoreScrollPosition(): void {
        if (this._scrollOnReset === 'restore') {
            this._scrollOnReset = 'reset';
        }
    }

    contentResized(contentSize: number): void {
        const changed = this._scrollController.contentResized(contentSize);
        // contentResized может сработать до afterRender.
        // Поэтому если запланировано обновление размеров, то мы его должны обязательно сделать на afterRender
        if (changed && !this._isScheduledUpdateItemsSizes()) {
            this._scrollController.updateItemsSizes();
        }
    }

    viewportResized(viewportSize: number): void {
        const changed = this._scrollController.viewportResized(viewportSize);
        // viewportResized может сработать до afterRender.
        // Поэтому если запланировано обновление размеров, то мы его должны обязательно сделать на afterRender
        if (changed && !this._isScheduledUpdateItemsSizes()) {
            this._scrollController.updateItemsSizes();
        }
    }

    setActiveElementKey(activeElementKey: CrudEntityKey): void {
        if (this._activeElementKey !== activeElementKey) {
            this._activeElementKey = activeElementKey;
        }
    }

    // region CollectionChanges

    addItems(position: number, count: number, scrollMode: IScrollMode, calcMode: ICalcMode): void {
        this._scrollController.addItems(position, count, scrollMode, calcMode);
    }

    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): void {
        this._scrollController.moveItems(
            addPosition,
            addCount,
            removePosition,
            removeCount
        );
    }

    removeItems(position: number, count: number, scrollMode: IScrollMode): void {
        this._scrollController.removeItems(position, count, scrollMode);
    }

    resetItems(): void {
        const activeIndex = this._collection.getIndexByKey(this._activeElementKey);
        // скроллим к активному элементу только если он задан и он есть в списке
        const shouldScrollToActiveItem = activeIndex !== -1;

        // смотри комментарий в beforeRenderListControl
        // Не нужно сбрасывать скролл, если список не был проскроллен.
        // Т.к. из-за вызова скролла сжимается графическая шапка.
        // Не нужно сбрасывать скролл, если будем скроллить к активному элементу.
        this._shouldResetScrollPosition = this._scrollOnReset === 'reset'
            && !!this._scrollPosition
            && !shouldScrollToActiveItem;
        const totalCount = this._getCollectionItemsCount();
        this._scrollController.updateGivenItemsSizes(this._getGivenItemsSizes());

        // Инициализируем диапазон, начиная:
        // с текущего startIndex, если собираемся оставить прежнюю позицию скролла,
        // с индекса активного элемента, если он задан
        // с нуля в остальных случаях
        const startIndex = this._scrollOnReset === 'keep'
            ? this._collection.getStartIndex()
            : (activeIndex !== -1 ? activeIndex : 0);
        this._scrollController.resetItems(totalCount, startIndex);
        if (shouldScrollToActiveItem) {
            if (this._renderInProgress) {
                this._scheduleScroll({
                    type: 'scrollToElement',
                    params: {
                        key: this._activeElementKey,
                        position: 'top',
                        force: true
                    }
                });
            } else {
                this.scrollToItem(this._activeElementKey, 'top', true);
            }
        }
    }

    // endregion CollectionChanges

    // region ScrollTo

    scrollToItem(key: TItemKey, position?: string, force?: boolean): Promise<void> {
        const itemIndex = this._collection.getIndexByKey(key);
        if (itemIndex === -1) {
            return Promise.resolve();
        }

        const promise = new Promise<void>((resolver) => this._scrollCompletedCallback = resolver);
        const rangeChanged = this._scrollController.scrollToItem(itemIndex);
        if (rangeChanged || this._scheduledScrollParams || this._renderNewIndexes) {
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
        const edgeItem = this._scrollController.getEdgeVisibleItem({direction});
        if (edgeItem && this._scrollController.getScrollToPageMode(edgeItem.key) === 'edgeItem') {
            const scrollPosition = direction === 'forward' ? 'top' : 'bottom';
            return this.scrollToItem(edgeItem.key, scrollPosition, true).then(() => this._getFirstVisibleItemKey());
        } else {
            const promise = new Promise<void>((resolver) => this._scrollCompletedCallback = resolver);
            this._doScrollUtil(direction === 'forward' ? 'pageDown' : 'pageUp');
            return promise.then(() => this._getFirstVisibleItemKey());
        }
    }

    /**
     * Скроллит к переданному краю списка.
     * Смещает диапазон, возвращает промис с индексами крайних видимых полностью элементов.
     * @param edge Край списка
     * @private
     */
    scrollToEdge(edge: IDirection): Promise<CrudEntityKey> {
        const itemIndex = edge === 'backward' ? 0 : this._getCollectionItemsCount() - 1;
        const item = this._collection.at(itemIndex);
        const itemKey = item.key;
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
        if (!this._collection || !this._getCollectionItemsCount()) {
            return null;
        }

        const firstVisibleItemIndex = this._scrollController.getFirstVisibleItemIndex();
        const item = this._collection.at(firstVisibleItemIndex);
        return item.key;
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

        this.resetItems();
    }

    protected _getScrollControllerOptions(options: TOptions): IScrollControllerOptions {
        const itemsQuerySelector = this._getItemsSelector(
            options.itemsQuerySelector,
            options.virtualScrollConfig.mode
        );
        return {
            listControl: options.listControl,
            virtualScrollConfig: options.virtualScrollConfig,

            itemsContainer: options.itemsContainer,
            listContainer: options.listContainer,

            itemsQuerySelector,
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
            totalCount: this._getCollectionItemsCount(),
            givenItemsSizes: this._getGivenItemsSizes(),
            feature1183225611: options.feature1183225611,
            disableVirtualScroll: options.disableVirtualScroll,

            indexesInitializedCallback: this._indexesInitializedCallback.bind(this),
            indexesChangedCallback: this._indexesChangedCallback.bind(this),
            placeholdersChangedCallback: (placeholders: IPlaceholders): void => {
                this._updatePlaceholdersUtil(placeholders);
            },
            hasItemsOutRangeChangedCallback: (hasItemsOutRange: IHasItemsOutRange): void => {
                this._scheduleUpdateHasItemsOutRange(hasItemsOutRange);
                if (this._hasItemsOutRangeChangedCallback) {
                    this._hasItemsOutRangeChangedCallback(hasItemsOutRange);
                }
                // Это нужно выполнять в этом же цикле синхронизации.
                // Чтобы ScrollContainer и отступ под пэйджинг отрисовались в этом же цикле.
                if (this._updateVirtualNavigationUtil) {
                    this._updateVirtualNavigationUtil(hasItemsOutRange);
                }

                // Если у нас есть записи скрытые виртуальным скроллом, то мы точно должны показать триггер.
                if (hasItemsOutRange.backward) {
                    this.setBackwardTriggerVisible(true);
                }
                if (hasItemsOutRange.forward) {
                    this.setForwardTriggerVisible(true);
                }
            },
            activeElementChangedCallback: options.activeElementChangedCallback,
            itemsEndedCallback: options.itemsEndedCallback
        };
    }

    private _indexesInitializedCallback(params: IIndexesChangedParams): void {
        this._handleChangedIndexes(params.range, null, () => {
            if (this._scrollOnReset === 'restore') {
                this._scheduleScroll({
                    type: 'calculateRestoreScrollParams',
                    params: {
                        range: params.oldRange,
                        placeholders: params.oldPlaceholders,
                        itemsSizes: params.oldItemsSizes,
                        direction: 'backward'
                    }
                });
                this.disableRestoreScrollPosition();
            }
        });
    }

    private _indexesChangedCallback(params: IIndexesChangedParams): void {
        this._handleChangedIndexes(params.range, params.shiftDirection, () => {
            // Планируем восстановление скролла. Скролл можно восстановить запомнив крайний видимый элемент (IEdgeItem).
            // EdgeItem мы можем посчитать только на _beforeRender - это момент когда точно прекратятся события scroll
            // и мы будем знать актуальную scrollPosition.
            // Поэтому в params запоминаем необходимые параметры для подсчета EdgeItem.
            if (params.shiftDirection && params.scrollMode === 'fixed') {
                const restoreDirection = this._predicatedRestoreDirection
                    ? this._predicatedRestoreDirection
                    : params.shiftDirection;
                this._predicatedRestoreDirection = null;
                if (this._scheduledScrollParams?.type !== 'scrollToElement') {
                    this._scheduleScroll({
                        type: 'calculateRestoreScrollParams',
                        params: {
                            direction: restoreDirection,
                            range: params.oldRange,
                            placeholders: params.oldPlaceholders
                        } as IEdgeItemCalculatingParams
                    });
                }
            }
        });
    }

    /**
     * Обрабатывает новые индексы сразу же или после выполнения текущей синхронизации.
     * Для дополнительной обработки можно передать handleAdditionallyCallback
     * @param range Новый диапазон
     * @param shiftDirection
     * @param handleAdditionallyCallback Коллбэк с дополнительными действиями
     * @private
     */
    private _handleChangedIndexes(
        range: IItemsRange,
        shiftDirection: IDirection,
        handleAdditionallyCallback?: Function
    ): void {
        const callback = () => {
            this._renderNewIndexes = true;

            this._scheduleUpdateItemsSizes(range);
            // Возможно ситуация, что после смещения диапазона(подгрузки данных) триггер остался виден
            // Поэтому после отрисовки нужно проверить, не виден ли он. Если он все еще виден, то нужно
            // вызвать observerCallback. Сам колбэк не вызовется, т.к. видимость триггера не поменялась.
            this._scheduleCheckTriggersVisibility();
            // Если меняется только endIndex, то это не вызовет изменения скролла и восстанавливать его не нужно.
            // Например, если по триггеру отрисовать записи вниз, то скролл не изменится.
            // НО когда у нас меняется startIndex, то мы отпрыгнем вверх, если не восстановим скролл.
            // PS. ОБРАТИТЬ ВНИМАНИЕ! Восстанавливать скролл нужно ВСЕГДА, т.к. если записи добавляются в самое начало,
            // то startIndex не изменится, а изменится только endIndex, но по факту это изменение startIndex.
            this._applyIndexes(range.startIndex, range.endIndex, shiftDirection);

            if (handleAdditionallyCallback) {
                handleAdditionallyCallback();
            }
        };

        // Нельзя изменять индексы во время отрисовки, т.к. возможно что afterRender будет вызван другими измениями.
        // Из-за этого на afterRender не будет еще отрисован новый диапазон, он отрисуется на следующую синхронизацию.
        if (this._renderInProgress) {
            this._handleChangedIndexesAfterSynchronizationCallback = callback;
        } else {
            callback();
        }
    }

    private _scheduleUpdateItemsSizes(itemsRange: IItemsRange): void {
        this._itemsRangeScheduledSizeUpdate = itemsRange;
    }

    private _isScheduledUpdateItemsSizes(): boolean {
        // Обновление размеров элементов запланировано, если:
        // 1. Непосредственно уже запланировано обновление размеров
        // 2. Запланирована обработка новых индексов (это потом спровоцирует планирование обновления размеров)
        return !!this._itemsRangeScheduledSizeUpdate || !!this._handleChangedIndexesAfterSynchronizationCallback;
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

            if (this._checkTriggersVisibilityTimeout) {
                clearTimeout(this._checkTriggersVisibilityTimeout);
            }

            // Возможна ситуация, что мы сперва проверим из кода что триггер виден, а после этого отработает observer.
            // Нужно гарантированно сперва дать отработать observer-у.
            // requestAnimationFrame, чтобы гарантированно изменения отобразились на странице.
            // Другой порядок не даст нам таких гарантий и либо IO не отработает, либо попадаем в цикл синхронизации.
            window?.requestAnimationFrame(() => {
                this._checkTriggersVisibilityTimeout = setTimeout(() => {
                    // Если сейчас идет синхронизация(что-то отрисовывается) или мы запланировали скролл, то
                    // переносим проверку видимости триггеров на следующий afterRender, когда уже
                    // точно отрисуются изменения и запланированный скролл будет выполнен(в частности восстановление)
                    if (this._renderInProgress || this._isScheduledScroll() || this._renderNewIndexes) {
                        this._scheduleCheckTriggersVisibility();
                    } else {
                        this._scrollController.checkTriggersVisibility();
                    }
                }, CHECK_TRIGGERS_DELAY);
            });
        }
    }

    protected _isScheduledScroll(): boolean {
        return !!this._scheduledScrollParams;
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
                    this._selfScroll = true;
                    this._doScrollUtil(scrollPosition);
                    this._scheduledScrollParams = null;
                    break;
                case 'scrollToElement':
                    if (this._handleChangedIndexesAfterSynchronizationCallback) {
                        break;
                    }
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
                case 'applyScrollPosition':
                    // containerBase в событии virtualScrollMove прокидывает callback, который нужно позвать
                    // после отрисовки нового диапазона для встановки scrollPosition
                    const applyScrollParams = this._scheduledScrollParams.params as IScheduledApplyScrollPositionParams;
                    applyScrollParams.callback();
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
                this._selfScroll = true;
                const result = this._scrollToElementUtil(element, position, force);
                if (result instanceof Promise) {
                    result.then(() => this._scrollCompletedCallback());
                } else {
                    this._scrollCompletedCallback?.();
                }
            } else {
                Logger.error(`${ERROR_PATH}::_scrollToElement | ` +
                    'Внутренняя ошибка списков! По ключу записи не найден DOM элемент. ' +
                    'Промис scrollToItem не отстрельнет, возможны ошибки.');
            }
        });
    }

    /**
     * Корректирует селктор элементов.
     * Если виртуальный скролл настроен скрывать записи вне диапазона, то нужно в селекторе исключить скрытые записи.
     * @param selector
     * @param virtualScrollMode
     * @private
     */
    private _getItemsSelector(selector: string, virtualScrollMode: TVirtualScrollMode): string {
        let correctedSelector = selector;
        if (virtualScrollMode === 'hide') {
            correctedSelector += `:not(${HIDDEN_ITEM_SELECTOR})`;
        }
        if (this._itemsContainerUniqueSelector) {
            correctedSelector = `${this._itemsContainerUniqueSelector} > ${correctedSelector}`;
        }
        return correctedSelector;
    }

    private _getGivenItemsSizes(): IItemsSizes|null {
        if (!this._itemSizeProperty) {
            return null;
        }

        return this._collection.getItems()
            .map((it) => {
                const itemSize = {
                    size: it.getContents().get(this._itemSizeProperty),
                    offset: 0,
                    key: it.itemKeyAttribute
                };

                if (!itemSize.size) {
                    Logger.error('Controls/baseList:BaseControl | Задана опция itemHeightProperty, ' +
                        `но для записи с ключом "${it.getContents().getKey()}" высота не определена!`);
                }

                return itemSize;
            });
    }

    private _initCollection(collection: Collection): void {
        if (this._collection === collection) {
            return;
        }

        this._collection = collection;
        this._setCollectionIterator();
    }

    protected _setCollectionIterator(): void {
        switch (this._virtualScrollMode) {
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

    protected abstract _getCollectionItemsCount(): number;
    protected abstract _applyIndexes(startIndex: number, endIndex: number, shiftDirection: IDirection): void;
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
