import { Control } from 'UI/Base';
import { detection } from 'Env/Env';
import { SyntheticEvent } from 'UI/Vdom';
import { Model } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';
import { IObservable } from 'Types/collection';

import InertialScrolling from 'Controls/_baseList/resources/utils/InertialScrolling';

import {
    CollectionItem,
    Collection,
    TItemKey,
    VirtualScrollHideController,
    VirtualScrollController
} from 'Controls/display';
import type { IVirtualScrollConfig } from 'Controls/_baseList/interface/IVirtualScroll';
import {
    ScrollController,
    IItemsRange,
    IPageDirection,
    IScheduledScrollParams,
    IScheduledScrollToElementParams,
    IEdgeItem,
    IPlaceholders,
    IHasItemsOutRange,
    IIndexesChangedParams,
    IItemsEndedCallback,
    IScheduledRestoreScrollParams,
    IActiveElementChangedChangedCallback,
    IDirection
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import type { IItemsSizes, IItemSize } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController';
import type {ITriggersVisibility} from 'Controls/_baseList/Controllers/ScrollController/ObserversController';
import {TriggerOffsetType} from 'Controls/_baseList/Controllers/ScrollController/ObserversController';
import {getDimensions, getOffsetTop} from 'Controls/sizeUtils';

export interface IShadowVisibility {
    backward: boolean;
    forward: boolean;
}

type IScrollToElementUtil = (container: HTMLElement, position: string, force: boolean) => Promise<void>;
type IDoScrollUtil = (scrollTop: number) => void;
type IUpdateShadowsUtil = (hasItems: IHasItemsOutRange) => void;
type IUpdatePlaceholdersUtil = (placeholders: IPlaceholders) => void;
type IUpdateVirtualNavigationUtil = (hasItems: IHasItemsOutRange) => void;

interface IListVirtualScrollControllerOptions {
    collection: Collection;
    listControl: Control;

    virtualScrollConfig: IVirtualScrollConfig;

    listContainer: HTMLElement;
    itemsContainer: HTMLElement;

    triggersQuerySelector: string;
    itemsQuerySelector: string;

    updateShadowsUtil: IUpdateShadowsUtil;
    updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
    updateVirtualNavigationUtil: IUpdateVirtualNavigationUtil;

    triggersVisibility: ITriggersVisibility;
    topTriggerOffsetCoefficient: number;
    bottomTriggerOffsetCoefficient: number;

    scrollToElementUtil: IScrollToElementUtil;
    doScrollUtil: IDoScrollUtil;

    itemsEndedCallback: IItemsEndedCallback;
    activeElementChangedCallback: IActiveElementChangedChangedCallback;
}

export class ListVirtualScrollController {
    private readonly _inertialScrolling: InertialScrolling = new InertialScrolling();

    private _collection: Collection;
    private _itemSizeProperty: string;
    private _keepScrollPosition: boolean = false;

    private readonly _scrollToElementUtil: IScrollToElementUtil;
    private readonly _doScrollUtil: IDoScrollUtil;
    private readonly _updateShadowsUtil: IUpdateShadowsUtil;
    private readonly _updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
    private readonly _updateVirtualNavigationUtil: IUpdateVirtualNavigationUtil;

    private _scrollController: ScrollController;

    private _itemsRangeScheduledSizeUpdate: IItemsRange;
    private _scheduledScrollParams: IScheduledScrollParams;
    private _scheduledUpdateHasItemsOutRange: IHasItemsOutRange;

    /**
     * Колбэк, который вызывается когда завершился скролл к элементу. Скролл к элементу вызывается асинхронно.
     * По этому колбэку резолвится промис, который возвращается из метода scrollToItem
     * @private
     */
    private _scrollToElementCompletedCallback: () => void;

    constructor(options: IListVirtualScrollControllerOptions) {
        this._onCollectionChange = this._onCollectionChange.bind(this);
        this._initCollection(options.collection);

        this._itemSizeProperty = options.virtualScrollConfig.itemHeightProperty;

        this._scrollToElementUtil = options.scrollToElementUtil;
        this._doScrollUtil = options.doScrollUtil;
        this._updateShadowsUtil = options.updateShadowsUtil;
        this._updatePlaceholdersUtil = options.updatePlaceholdersUtil;
        this._updateVirtualNavigationUtil = options.updateVirtualNavigationUtil;

        this._setCollectionIterator(options.virtualScrollConfig.mode);
        this._createScrollController(options);
    }

    setCollection(collection: Collection): void {
        this._initCollection(collection);
    }

    setItemsContainer(itemsContainer: HTMLElement): void {
        this._scrollController.setItemsContainer(itemsContainer);
    }

    setListContainer(listContainer: HTMLElement): void {
        this._scrollController.setListContainer(listContainer);
    }

    afterRenderListControl(hasNotRenderedChanges: boolean): void {
        this._updateItemsSizes();
        this._handleScheduledUpdateHasItemsOutRange();
        this._handleScheduledScroll(hasNotRenderedChanges);
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

    scrollToItem(key: TItemKey, position?: string, force?: boolean): Promise<void> {
        const promise = new Promise<void>((resolver) => this._scrollToElementCompletedCallback = resolver);

        const itemIndex = this._collection.getIndexByKey(key);
        const rangeChanged = this._scrollController.scrollToItem(itemIndex);
        if (rangeChanged) {
            this._scheduleScroll({
                type: 'scrollToElement',
                params: { key, position, force }
            });
        } else {
            this._scrollToElement(key, position, force);
        }

        return promise;
    }

    keyDownHome(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('start');
    }

    keyDownEnd(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('end');
    }

    keyDownPageDown(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('forward');
    }

    keyDownPageUp(event: SyntheticEvent): Promise<CrudEntityKey> {
        event.stopPropagation();
        return this._scrollToPage('backward');
    }

    contentResized(contentSize: number): void {
        this._scrollController.contentResized(contentSize);
    }

    viewportResized(viewportSize: number): void {
        this._scrollController.viewportResized(viewportSize);
    }

    setTriggersVisibility(triggersVisibility: ITriggersVisibility): void {
        this._scrollController.setTriggersVisibility(triggersVisibility);
    }

    private _createScrollController(options: IListVirtualScrollControllerOptions): void {
        const totalCount = this._collection.getCount();
        this._scrollController = new ScrollController({
            listControl: options.listControl,
            virtualScrollConfig: options.virtualScrollConfig,

            itemsContainer: options.itemsContainer,
            listContainer: options.listContainer,

            itemsQuerySelector: options.itemsQuerySelector,
            itemSizeGetter: ListVirtualScrollController._itemSizeGetter,
            triggerOffsetType: TriggerOffsetType.VERTICAL,
            applyTriggerOffsetCallback: ListVirtualScrollController._applyTriggerOffsetCallback,
            triggersQuerySelector: options.triggersQuerySelector,

            triggersVisibility: options.triggersVisibility,
            topTriggerOffsetCoefficient: options.topTriggerOffsetCoefficient,
            bottomTriggerOffsetCoefficient: options.bottomTriggerOffsetCoefficient,

            scrollPosition: 0,
            viewportSize: options.virtualScrollConfig.viewportHeight || 0,
            contentSize: 0,
            totalCount,
            givenItemsSizes: this._getGivenItemsSizes(),

            indexesInitializedCallback: (range: IItemsRange): void => {
                this._scheduleUpdateItemsSizes({
                    startIndex: range.startIndex,
                    endIndex: range.endIndex
                });
                this._collection.setIndexes(range.startIndex, range.endIndex);
            },
            indexesChangedCallback: this._indexesChangedCallback.bind(this),
            placeholdersChangedCallback: (placeholders: IPlaceholders): void => {
                this._updatePlaceholdersUtil(placeholders);
            },
            hasItemsOutRangeChangedCallback: (hasItemsOutRange: IHasItemsOutRange): void => {
                this._scheduleUpdateHasItemsOutRange(hasItemsOutRange);
            },
            activeElementChangedCallback: options.activeElementChangedCallback,
            itemsEndedCallback: options.itemsEndedCallback
        });

        this._scrollController.resetItems(totalCount, false);
    }

    private static _itemSizeGetter(element: HTMLElement): IItemSize {
        return {
            size: getDimensions(element).height,
            offset: getOffsetTop(element)
        };
    }

    private static _applyTriggerOffsetCallback(element: HTMLElement, direction: IDirection, offset: number): void {
        if (direction === 'backward') {
            element.style.top = `${offset}px`;
        } else {
            element.style.bottom = `${offset}px`;
        }
    }

    private _indexesChangedCallback(params: IIndexesChangedParams): void {
        this._scheduleUpdateItemsSizes({
            startIndex: params.startIndex,
            endIndex: params.endIndex
        });
        this._collection.setIndexes(params.startIndex, params.endIndex);

        const edgeVisibleItem = this._scrollController.getEdgeVisibleItem(params.shiftDirection);
        const item = this._collection.at(edgeVisibleItem.index);
        if (!item) {
            throw new Error('Controls/_baseList/BaseControl::_indexesChangedCallback | ' +
                'Внутренняя ошибка списков! Крайний видимый элемент не найден в Collection.');
        }
        const restoreScrollParams: IScheduledRestoreScrollParams = {
            key: item.getContents().getKey(),
            border: edgeVisibleItem.border,
            borderDistance: edgeVisibleItem.borderDistance,
            direction: edgeVisibleItem.direction
        };
        this._scheduleScroll({
            type: 'restoreScroll',
            params: restoreScrollParams
        });
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
            this._updateShadowsUtil(hasItemsOutRange);
            this._updateVirtualNavigationUtil(hasItemsOutRange);
        }
    }

    private _updateItemsSizes(): void {
        if (this._itemsRangeScheduledSizeUpdate) {
            this._scrollController.updateItemsSizes(this._itemsRangeScheduledSizeUpdate);
            this._itemsRangeScheduledSizeUpdate = null;
        }
    }

    private _scheduleScroll(scrollParams: IScheduledScrollParams): void {
        this._scheduledScrollParams = scrollParams;
    }

    private _handleScheduledScroll(hasNotRenderedChanges: boolean): void {
        if (this._scheduledScrollParams) {
            switch (this._scheduledScrollParams.type) {
                case 'restoreScroll':
                    const restoreScrollParams = this._scheduledScrollParams.params as IScheduledRestoreScrollParams;
                    let directionToRestoreScroll;
                    if (!restoreScrollParams && hasNotRenderedChanges) {
                        directionToRestoreScroll = 'backward';
                    } else {
                        directionToRestoreScroll = restoreScrollParams.direction;
                    }
                    if (directionToRestoreScroll) {
                        const edgeItem: IEdgeItem = {
                            index: this._collection.getIndexByKey(restoreScrollParams.key),
                            border: restoreScrollParams.border,
                            borderDistance: restoreScrollParams.borderDistance,
                            direction: restoreScrollParams.direction
                        };
                        const newScrollTop = this._scrollController.getScrollTopToEdgeItem(edgeItem);
                        this._doScrollUtil(newScrollTop);
                    }
                    break;
                case 'scrollToElement':
                    const scrollToElementParams = this._scheduledScrollParams.params as IScheduledScrollToElementParams;
                    this._scrollToElement(
                        scrollToElementParams.key,
                        scrollToElementParams.position,
                        scrollToElementParams.force
                    );
                    break;
                default:
                    throw new Error('Controls/_baseList/Controllers/ListVirtualScrollController::_handleScheduledScroll | ' +
                        'Внутренняя ошибка списков! Неопределенный тип запланированного скролла.');
            }

            this._scheduledScrollParams = null;
        }
    }

    private _scrollToElement(key: CrudEntityKey, position?: string, force?: boolean): void {
        this._inertialScrolling.callAfterScrollStopped(() => {
            const element = this._scrollController.getElement(key);
            if (element) {
                const promise = this._scrollToElementUtil(element, position, force);
                promise.then(() => this._scrollToElementCompletedCallback());
            } else {
                throw new Error('Controls/_baseList/Controllers/ListVirtualScrollController::_scrollToElement | ' +
                    'Внутренняя ошибка списков! По ключу записи не найден DOM элемент. ' +
                    'Промис scrollToItem не отстрельнет, возможны ошибки.');
            }
        });
    }

    /**
     * Скроллит к переданной странице.
     * Скроллит так, чтобы было видно последний элемент с предыдущей страницы, чтобы не потерять "контекст".
     * Смещает диапазон, возвращает промис с индексами крайних видимых полностью элементов.
     * @param page Условная страница, к которой нужно скроллить. (Следующая, предыдущая, начальная, конечная)
     * @private
     */
    private _scrollToPage(page: IPageDirection): Promise<CrudEntityKey> {
        let itemIndex;
        if (page === 'forward' || page === 'backward') {
            const edgeItem = this._scrollController.getEdgeVisibleItem(page);
            itemIndex = edgeItem.index;
        } else {
            itemIndex = page === 'start' ? 0 : this._collection.getCount() - 1;
        }

        const item = this._collection.getItemBySourceIndex(itemIndex);
        const itemKey = item.getContents().getKey();
        return this.scrollToItem(itemKey).then(() => itemKey);
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
                    throw new Error(`Controls/baseList:BaseControl | Задана опция itemHeightProperty, но для записи с ключом "${it.getContents().getKey()}" высота не определена!`);
                }

                return itemSize;
            });

        return itemsSizes;
    }

    private _initCollection(collection: Collection): void {
        if (this._collection === collection) {
            return;
        }

        if (this._collection) {
            this._collection.unsubscribe('onCollectionChange', this._onCollectionChange);
        }

        this._collection = collection;

        this._collection.subscribe('onCollectionChange', this._onCollectionChange);
    }

    private _onCollectionChange(
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
}
