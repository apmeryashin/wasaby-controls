import { Control } from 'UI/Base';
import { CollectionItem, Collection, TItemKey } from 'Controls/display';
import { Model } from 'Types/entity';
import { IObservable } from 'Types/collection';
import type { IVirtualScrollConfig } from 'Controls/_baseList/interface/IVirtualScroll';
import {
    ScrollController,
    IItemsRange,
    IEnvironmentChangedParams,
    IPageDirection,
    IScheduledScrollParams,
    IScheduledScrollToElementParams,
    IEdgeItem,
    IIndexesChangedParams,
    IItemsEndedCallback,
    IScheduledRestoreScrollParams,
    IActiveElementChangedChangedCallback
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import { SyntheticEvent } from 'UI/Vdom';
import { CrudEntityKey } from 'Types/source';

type IScrollToElementUtil = (container: HTMLElement, toBottom: boolean, force: boolean) => Promise<void>;
type IDoScrollUtil = (scrollTop: number) => void;
type IHasMoreUtil = (direction: IDirection) => boolean;

interface IListVirtualScrollControllerOptions {
    collection: Collection;
    listControl: Control;

    virtualScrollConfig: IVirtualScrollConfig;

    listContainer: HTMLElement;
    itemsContainer: HTMLElement;

    triggersQuerySelector: string;
    itemsQuerySelector: string;

    scrollToElementUtil: IScrollToElementUtil;
    doScrollUtil: IDoScrollUtil;
    hasMoreUtil: IHasMoreUtil;

    itemsEndedCallback: IItemsEndedCallback;
    activeElementChangedCallback: IActiveElementChangedChangedCallback;
}

export class ListVirtualScrollController {
    private _collection: Collection;

    private _scrollToElementUtil: IScrollToElementUtil;
    private _doScrollUtil: IDoScrollUtil;
    private _hasMoreUtil: IHasMoreUtil;

    private _scrollController: ScrollController;

    private _itemsRangeScheduledSizeUpdate: IItemsRange;
    private _scheduledScrollParams: IScheduledScrollParams;

    /**
     * Колбэк, который вызывается когда завершился скролл к элементу. Скролл к элементу вызывается асинхронно.
     * По этому колбэку резолвится промис, который возвращается из метода scrollToItem
     * @private
     */
    private _scrollToElementCompletedCallback: () => void;

    constructor(options: IListVirtualScrollControllerOptions) {
        this._collection = options.collection;

        this._scrollToElementUtil = options.scrollToElementUtil;
        this._doScrollUtil = options.doScrollUtil;
        this._hasMoreUtil = options.hasMoreUtil;

        this._createScrollController(options);
    }

    setItemsContainer(itemsContainer: HTMLElement): void {
        this._scrollController.setItemsContainer(itemsContainer);
    }

    setListContainer(listContainer: HTMLElement): void {
        this._scrollController.setListContainer(listContainer);
    }

    afterMountListControl(): void {
        if (
            !this._collection.getCount() ||
            !this._hasMoreUtil('forward') && this._hasMoreUtil('backward')
        ) {
            this._scrollController.displayTrigger('backward');
        }
    }

    afterRenderListControl(hasNotRenderedChanges: boolean): void {
        this._updateItemsSizes();
        this._handleScheduledScroll(hasNotRenderedChanges);
    }

    virtualScrollPositionChange(position: number): void {
        this._scrollController.scrollToVirtualPosition(position);
    }

    scrollPositionChange(position: number): void {
        this._scrollController.scrollPositionChange(position);
    }

    collectionChange(action: string,
                     newItems: Array<CollectionItem<Model>>,
                     newItemsIndex: number,
                     removedItems: Array<CollectionItem<Model>>,
                     removedItemsIndex: number): void {
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
                this._scrollController.resetItems(
                    totalCount,
                    this._hasMoreUtil('backward'),
                    this._hasMoreUtil('forward')
                );
                break;
            }
        }
    }

    scrollToItem(key: TItemKey, toBottom?: boolean, force?: boolean): Promise<void> {
        const promise = new Promise<void>((resolver) => this._scrollToElementCompletedCallback = resolver);

        const itemIndex = this._collection.getIndexByKey(key);
        const rangeChanged = this._scrollController.scrollToItem(itemIndex);
        if (rangeChanged) {
            this._scheduleScroll({
                type: 'scrollToElement',
                params: { key, toBottom, force }
            });
        } else {
            this._scrollToElement(key, toBottom, force);
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

    private _createScrollController(options: IListVirtualScrollControllerOptions): void {
        const totalCount = this._collection.getCount();
        this._scrollController = new ScrollController({
            listControl: options.listControl,
            virtualScrollConfig: options.virtualScrollConfig,

            itemsContainer: options.itemsContainer,
            listContainer: options.listContainer,

            itemsQuerySelector: options.itemsQuerySelector,
            triggersQuerySelector: options.triggersQuerySelector,

            topTriggerOffsetCoefficient: 0,
            bottomTriggerOffsetCoefficient: 0,

            scrollPosition: 0,
            viewportSize: 0,
            contentSize: 0,
            totalCount,

            indexesInitializedCallback: (range: IItemsRange): void => {
                this._scheduleUpdateItemsSizes({
                    startIndex: range.startIndex,
                    endIndex: range.endIndex
                });
                this._collection.setIndexes(range.startIndex, range.endIndex);
            },
            indexesChangedCallback: this._indexesChangedCallback.bind(this),
            environmentChangedCallback(params: IEnvironmentChangedParams): void {
                console.error('environmentChangedCallback', params);
            },
            activeElementChangedCallback: options.activeElementChangedCallback,
            itemsEndedCallback: options.itemsEndedCallback
        });

        this._scrollController.resetItems(
            totalCount,
            this._hasMoreUtil('backward'),
            this._hasMoreUtil('forward')
        );
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

        console.error('indexChangedCallback', params);
    }

    private _scheduleUpdateItemsSizes(itemsRange: IItemsRange): void {
        this._itemsRangeScheduledSizeUpdate = itemsRange;
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
                        scrollToElementParams.toBottom,
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

    private _scrollToElement(key: CrudEntityKey, toBottom?: boolean, force?: boolean): void {
        const element = this._scrollController.getElement(key);
        if (element) {
            const promise = this._scrollToElementUtil(element, toBottom, force);
            promise.then(() => this._scrollToElementCompletedCallback());
        } else {
            throw new Error('Controls/_baseList/Controllers/ListVirtualScrollController::_scrollToElement | ' +
                'Внутренняя ошибка списков! По ключу записи не найден DOM элемент. ' +
                'Промис scrollToItem не отстрельнет, возможны ошибки.');
        }
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
}
