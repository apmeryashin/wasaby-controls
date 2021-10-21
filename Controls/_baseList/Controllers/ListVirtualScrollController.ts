import { Control } from 'UI/Base';
import { CollectionItem, Collection, TItemKey } from 'Controls/display';
import { Model } from 'Types/entity';
import { IObservable } from 'Types/collection';
import type { IVirtualScrollConfig } from 'Controls/_baseList/interface/IVirtualScroll';
import {
    ScrollController, IDirection as IScrollControllerDirection, IItemsRange, IEnvironmentChangedParams, IPageDirection,
    IScheduledScrollParams, IScheduledScrollToElementParams, IEdgeItem, IIndexesChangedParams, IItemsEndedCallback
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import { SyntheticEvent } from 'UI/Vdom';

type IGetItemContainerByIndexUtil = (index: number, itemsContainer: HTMLElement) => HTMLElement;
type IScrollToElementUtil = (container: HTMLElement, toBottom: boolean, force: boolean) => void;

interface IListVirtualScrollControllerOptions {
    collection: Collection;
    listControl: Control;

    virtualScrollConfig: IVirtualScrollConfig;

    listContainer: HTMLElement;
    itemsContainer: HTMLElement;

    triggerQuerySelector: string;
    itemsQuerySelector: string;

    getItemContainerByIndexUtil: IGetItemContainerByIndexUtil;
    scrollToElementUtil: IScrollToElementUtil;

    itemsEndedCallback: IItemsEndedCallback;
}

export class ListVirtualScrollController {
    private _collection: Collection;
    private _listControl: Control;

    private _virtualScrollConfig: IVirtualScrollConfig;

    private _listContainer: HTMLElement;
    private _itemsContainer: HTMLElement;

    private _triggerQuerySelector: string;
    private _itemsQuerySelector: string;

    private _getItemContainerByIndexUtil: IGetItemContainerByIndexUtil;
    private _scrollToElementUtil: IScrollToElementUtil;

    private _itemsEndedCallback: IItemsEndedCallback;

    private _scrollController: ScrollController;

    private _itemsRangeScheduledSizeUpdate: IItemsRange;
    private _scheduledScrollParams: IScheduledScrollParams;

    constructor(options: IListVirtualScrollControllerOptions) {
        this._collection = options.collection;
        this._listControl = options.listControl;

        this._virtualScrollConfig = options.virtualScrollConfig;

        this._listContainer = options.listContainer;
        this._itemsContainer = options.itemsContainer;

        this._triggerQuerySelector = options.triggerQuerySelector;
        this._itemsQuerySelector = options.itemsQuerySelector;

        this._getItemContainerByIndexUtil = options.getItemContainerByIndexUtil;
        this._scrollToElementUtil = options.scrollToElementUtil;

        this._itemsEndedCallback = options.itemsEndedCallback;

        this._createScrollController();
        this._scrollController.resetItems(this._collection.getCount());
    }

    afterMountListControl(): void {
        this._updateItemsSizes();
    }

    afterRenderListControl(): void {
        this._updateItemsSizes();
        this._handleScheduledScroll();
    }

    virtualScrollPositionChange(position: number): void {
        this._scrollController.scrollToPosition(position);
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
        const collectionStartIndex = this._collection.getStartIndex();

        switch (action) {
            case IObservable.ACTION_ADD: {
                // let direction = newItemsIndex <= collectionStartIndex && self._scrollTop !== 0 ? 'up'
                //                                     : (newItemsIndex >= collectionStopIndex ? 'down' : undefined);
                //                                 if (self._collection.getCount() === newItems.length) {
                //                                     direction = undefined;
                //                                 }
                this._scrollController.addItems(newItemsIndex, newItems.length);
                break;
            }
            case IObservable.ACTION_MOVE: {
                // todo fix commented code
                const direction: IScrollControllerDirection =
                    newItemsIndex <= collectionStartIndex /*&& this._scrollTop !== 0*/ ? 'backward' : 'forward';
                this._scrollController.moveItems(newItemsIndex,
                    newItems.length,
                    removedItemsIndex,
                    removedItems.length,
                    direction);
                break;
            }
            case IObservable.ACTION_REMOVE: {
                this._scrollController.removeItems(removedItemsIndex, removedItems.length);
                break;
            }
            case IObservable.ACTION_RESET: {
                this._scrollController.resetItems(totalCount);
                break;
            }
        }
    }

    // todo fix promise result
    scrollToItem(key: TItemKey, toBottom?: boolean, force?: boolean): Promise<void> {
        const itemIndex = this._collection.getIndexByKey(key);
        const rangeChanged = this._scrollController.scrollToItem(itemIndex);
        if (rangeChanged) {
            this._scheduleScroll({
                type: 'scrollToElement',
                params: { itemIndex, toBottom, force }
            });
        } else {
            this._scrollToElement(itemIndex, toBottom, force);
        }
    }

    keyDownHome(event: SyntheticEvent): void {
        event.stopPropagation();
        this._scrollToPage('start');
    }

    keyDownEnd(event: SyntheticEvent): void {
        event.stopPropagation();
        this._scrollToPage('end');
    }

    keyDownPageDown(event: SyntheticEvent): void {
        event.stopPropagation();
        this._scrollToPage('forward');
    }

    keyDownPageUp(event: SyntheticEvent): void {
        event.stopPropagation();
        this._scrollToPage('backward');
    }

    viewResized(): void {
        this._scrollController.viewResized();
    }

    viewportResized(viewportSize: number): void {
        this._scrollController.setViewportSize(viewportSize);
    }

    private _createScrollController(): void {
        const totalCount = this._collection.getCount();
        this._scrollController = new ScrollController({
            listControl: this._listControl,
            virtualScrollConfig: this._virtualScrollConfig,

            itemsContainer: this._itemsContainer,
            listContainer: this._listContainer,

            itemsQuerySelector: this._itemsQuerySelector,
            triggersQuerySelector: this._triggerQuerySelector,

            triggersVisibility: undefined,
            topTriggerOffsetCoefficient: 0,
            bottomTriggerOffsetCoefficient: 0,

            scrollTop: 0,
            viewportSize: 0,
            totalCount,

            indexesChangedCallback: this._indexesChangedCallback.bind(this),
            environmentChangedCallback(params: IEnvironmentChangedParams): void {
                console.error('environmentChangedCallback', params);
            },
            activeElementChangedCallback(activeElementIndex: number): void {
                console.error('activeElementChangedCallback', activeElementIndex);
            },
            itemsEndedCallback: (direction: IScrollControllerDirection) => {
                console.error('itemsEndedCallback', direction);
                this._itemsEndedCallback(direction);
            },

            itemsSizes: [], triggersOffsets: undefined // todo fix this
        });

        this._scrollController.resetItems(totalCount);
    }

    private _indexesChangedCallback(params: IIndexesChangedParams): void {
        this._scheduleUpdateItemsSizes({
            startIndex: params.startIndex,
            endIndex: params.endIndex
        });

        const edgeVisibleItem = this._scrollController.getEdgeVisibleItem(params.shiftDirection);
        if (!this._collection.getItemBySourceKey(edgeVisibleItem.key)) {
            throw new Error('Controls/_baseList/BaseControl::_indexesChangedCallback | ' +
                'Внутренняя ошибка списков! Крайний видимый элемент не найден в Collection.');
        }
        this._scheduleScroll({
            type: 'restoreScroll',
            params: edgeVisibleItem
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

    private _handleScheduledScroll(): void {
        if (this._scheduledScrollParams) {
            switch (this._scheduledScrollParams.type) {
                case 'restoreScroll':
                    /*const edgeItem = this._scheduledScrollParams.params as IEdgeItem;
                    let directionToRestoreScroll = edgeItem.direction;
                    if (!directionToRestoreScroll && (this._hasItemWithImageChanged
                        || this._indicatorsController.hasNotRenderedChanges())) {
                        directionToRestoreScroll = 'backward';
                    }
                    if (directionToRestoreScroll) {
                        const newScrollTop = this._scrollController.getScrollTopToEdgeItem(edgeItem);
                        this._notify('doScroll', [newScrollTop, true], { bubbling: true });
                        this._hasItemWithImageChanged = false;
                    }*/
                    break;
                case 'scrollToElement':
                    const scrollToElementParams = this._scheduledScrollParams.params as IScheduledScrollToElementParams;
                    this._scrollToElement(
                        scrollToElementParams.itemIndex,
                        scrollToElementParams.toBottom,
                        scrollToElementParams.force
                    );
                    break;
                default:
                    throw new Error('Controls/_baseList/BaseControl::_handleScheduledScroll | ' +
                        'Внутренняя ошибка списков! Неопределенный тип запланированного скролла.');
            }

            this._scheduledScrollParams = null;
        }
    }

    private _scrollToElement(itemIndex: number, toBottom?: boolean, force?: boolean): void {
        const domItemIndex = itemIndex - this._collection.getStartIndex();
        const itemContainer = this._getItemContainerByIndexUtil(domItemIndex, this._itemsContainer);

        if (itemContainer) {
            this._scrollToElementUtil(itemContainer, toBottom, force);
        }
    }

    /**
     * Скроллит к переданной странице.
     * Скроллит так, чтобы было видно последний элемент с предыдущей страницы, чтобы не потерять "контекст".
     * Смещает диапазон, возвращает промис с индексами крайних видимых полностью элементов.
     * @param page Условная страница, к которой нужно скроллить. (Следующая, предыдущая, начальная, конечная)
     * @private
     */
    private _scrollToPage(page: IPageDirection): void {
        let itemIndex;
        if (page === 'forward' || page === 'backward') {
            const edgeItem = this._scrollController.getEdgeVisibleItem(page);
            itemIndex = this._collection.getIndexByKey(edgeItem.key);
        } else {
            itemIndex = page === 'start' ? 0 : this._collection.getCount() - 1;
        }

        const item = this._collection.getItemBySourceIndex(itemIndex);
        if (item) {
            this.scrollToItem(item.getContents().getKey());
            // TODO поставить маркер после скролла
        }
    }
}
