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
    IEdgeItem,
    IEdgeItemCalculatingParams,
    IHasItemsOutRange,
    IIndexesChangedParams,
    IItemsEndedCallback,
    IItemsRange,
    IDirection,
    IPageDirection,
    IPlaceholders,
    IScheduledScrollParams,
    IScheduledScrollToElementParams,
    ScrollController
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import type { IItemsSizes, IItemSize } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/AbstractItemsSizeController';
import type {ITriggersVisibility} from 'Controls/_baseList/Controllers/ScrollController/ObserversController/AbstractObserversController';
import {ObserversController} from 'Controls/_baseList/Controllers/ScrollController/ObserverController/ObserversController';
import {ItemsSizeController} from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/ItemsSizeController';
import { Logger } from 'UI/Utils';

export interface IShadowVisibility {
    backward: boolean;
    forward: boolean;
}

const ERROR_PATH = 'Controls/_baseList/Controllers/ListVirtualScrollController';

type IScrollToElementUtil = (container: HTMLElement, position: string, force: boolean) => Promise<void>|void;
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

    beforeRenderListControl(hasNotRenderedChanges: boolean): void {
        if (hasNotRenderedChanges && !this._scheduledScrollParams) {
            // Планируем восстановление скролла, если
            // не было запланировано восстановления скролла и у нас есть неотрендеренные изменения,
            // которые могут повлиять на скролл
            const edgeItem = this._scrollController.getEdgeVisibleItem({ direction: 'forward' });
            this._scheduleScroll({
                type: 'restoreScroll',
                params: edgeItem
            });
        } else {
            this._handleScheduledScroll();
        }
    }

    afterRenderListControl(): void {
        this._updateItemsSizes();
        this._handleScheduledUpdateHasItemsOutRange();
        this._handleScheduledScroll();
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
            itemsSizeControllerConstructor: ItemsSizeController,
            observerControllerConstructor: ObserversController,
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

    private _indexesChangedCallback(params: IIndexesChangedParams): void {
        this._scheduleUpdateItemsSizes(params.range);
        // Если меняется только endIndex, то это не вызовет изменения скролла и восстанавливать его не нужно.
        // Например, если по триггеру отрисовать записи вниз, то скролл не изменится.
        // НО когда у нас меняется startIndex, то мы отпрыгнем вверх, если не восстановим скролл.
        const shouldRestoreScroll = this._collection.getStartIndex() !== params.range.startIndex;
        this._collection.setIndexes(params.range.startIndex, params.range.endIndex);

        if (shouldRestoreScroll) {
            // Планируем восстановление скролла. Скролл можно восстановить запомнив крайний видимый элемент (IEdgeItem).
            // EdgeItem мы можем посчитать только на _beforeRender - это момент когда точно прекратятся события scroll
            // и мы будем знать актуальную scrollPosition.
            // Поэтому в params запоминает необходимые параметры для подсчета EdgeItem.
            this._scheduleScroll({
                type: 'calculateRestoreScrollParams',
                params: {
                    direction: params.shiftDirection,
                    range: params.oldRange,
                    placeholders: params.oldPlaceholders
                } as IEdgeItemCalculatingParams
            });
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

    /**
     * Скроллит к переданной странице.
     * Скроллит так, чтобы было видно последний элемент с предыдущей страницы, чтобы не потерять "контекст".
     * Смещает диапазон, возвращает промис с индексами крайних видимых полностью элементов.
     * @param pageDirection Условная страница, к которой нужно скроллить. (Следующая, предыдущая, начальная, конечная)
     * @private
     */
    private _scrollToPage(pageDirection: IPageDirection): Promise<CrudEntityKey> {
        let itemIndex;
        if (pageDirection === 'forward' || pageDirection === 'backward') {
            const edgeItem = this._scrollController.getEdgeVisibleItem({direction: pageDirection});
            itemIndex = edgeItem.index;
        } else {
            itemIndex = pageDirection === 'start' ? 0 : this._collection.getCount() - 1;
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
