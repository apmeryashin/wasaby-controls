import {Control} from 'UI/Base';

import {
    NewScrollController as ScrollController,
    IPlaceholders,
    IScheduledScrollParams,
    IEdgeItemCalculatingParams,
    IItemsRange,
    IEdgeItem
} from 'Controls/baseList';

import {ObserversController} from './ObserversController';
import {ItemsSizeController} from './ItemsSizeController';
import {Logger} from 'UI/Utils';

const ERROR_PATH = 'Controls/horizontalScroll:Controller';

type IDoScrollUtil = (scrollTop: number) => void;

export interface IHorizontalScrollCollection {
    setColumns(columns: object[]): void;
}

export interface IControllerOptions {
    listControl: Control;
    collection: IHorizontalScrollCollection;
    virtualScrollConfig?: {
        pageSize?: number;
    };
    columnScrollStartPosition?: 'end';
    triggersQuerySelector: string;
    columns: object[];
    doScrollUtil: IDoScrollUtil;
    leftTriggerOffsetCoefficient: number;
    rightTriggerOffsetCoefficient: number;
    updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
}

type IUpdatePlaceholdersUtil = (placeholders: IPlaceholders) => void;

export class Controller {
    private _scrollController: ScrollController;
    private _collection: IHorizontalScrollCollection;
    private _scheduledScrollParams: IScheduledScrollParams;
    private _itemsRangeScheduledSizeUpdate: IItemsRange;
    private _doScrollUtil: IDoScrollUtil;
    private readonly _updatePlaceholdersUtil: IUpdatePlaceholdersUtil;

    constructor(options: IControllerOptions) {
        this._doScrollUtil = options.doScrollUtil;
        this._collection = options.collection;
        this._updatePlaceholdersUtil = options.updatePlaceholdersUtil;
        this._createScrollController(options);
    }

    private _createScrollController(options: IControllerOptions): void {
        this._scrollController = new ScrollController({
            virtualScrollConfig: options.virtualScrollConfig,
            listControl: options.listControl,
            totalCount: options.columns.length,
            itemsSizeControllerConstructor: ItemsSizeController,
            observerControllerConstructor: ObserversController,
            itemsQuerySelector: '.js-controls-Grid__columnScroll__relativeCell',

            backwardTriggerOffsetCoefficient: options.leftTriggerOffsetCoefficient,
            forwardTriggerOffsetCoefficient: options.rightTriggerOffsetCoefficient,
            triggersQuerySelector: options.triggersQuerySelector,
            triggersVisibility: {
                backward: true,
                forward: true
            },

            indexesChangedCallback: (params) => {
                this._scheduleUpdateItemsSizes(params.range);
                this._collection.setColumns(options.columns.slice(params.range.startIndex, params.range.endIndex));

                // Планируем восстановление скролла. Скролл можно восстановить запомнив крайний видимый
                // элемент (IEdgeItem). EdgeItem мы можем посчитать только на _beforeRender - это момент
                // когда точно прекратятся события scroll и мы будем знать актуальную scrollPosition.
                // Поэтому в params запоминает необходимые параметры для подсчета EdgeItem.
                this._scheduleScroll({
                    type: 'calculateRestoreScrollParams',
                    params: {
                        direction: params.shiftDirection,
                        range: params.oldRange,
                        placeholders: params.oldPlaceholders
                    } as IEdgeItemCalculatingParams
                });
            },
            indexesInitializedCallback: ({startIndex, endIndex}) => {
                this._collection.setColumns(options.columns.slice(startIndex, endIndex));
            },
            placeholdersChangedCallback: (placeholders: IPlaceholders) => {
                this._updatePlaceholdersUtil(placeholders);
            }
        });
    }

    setItemsContainer(itemsContainer: HTMLElement): void {
        this._scrollController.setItemsContainer(itemsContainer);
    }

    setListContainer(listContainer: HTMLElement): void {
        this._scrollController.setListContainer(listContainer);
    }

    beforeRenderListControl(hasNotRenderedChanges: boolean): void {
        if (hasNotRenderedChanges && !this._scheduledScrollParams) {
            // Планируем восстановление скролла, если не было запланировано восстановления скролла
            // и у нас есть неотрендеренные изменения, которые могут повлиять на скролл
            const edgeItem = this._scrollController.getEdgeVisibleItem('forward');
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
        this._handleScheduledScroll();
    }

    scrollPositionChange(position: number): void {
        this._scrollController.scrollPositionChange(position);
    }

    viewportResized(viewportSize: number): void {
        this._scrollController.viewportResized(viewportSize);
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
                case 'calculateRestoreScrollParams':
                    const params = this._scheduledScrollParams.params as IEdgeItemCalculatingParams;
                    const edgeItem = this._scrollController.getEdgeVisibleItem(
                        params.direction,
                        params.range,
                        params.placeholders
                    );
                    this._scheduledScrollParams = null;

                    this._scheduleScroll({
                        type: 'restoreScroll',
                        params: edgeItem
                    });
                    break;
                case 'restoreScroll':
                    const restoreScrollParams = this._scheduledScrollParams.params as IEdgeItem;
                    const scrollPosition = this._scrollController.getScrollPositionToEdgeItem(restoreScrollParams);
                    this._doScrollUtil(scrollPosition);
                    this._scheduledScrollParams = null;
                    break;
                default:
                    Logger.error(`${ERROR_PATH}::_handleScheduledScroll | ` +
                        'Внутренняя ошибка списков! Неопределенный тип запланированного скролла.');
            }
        }
    }
}

export default Controller;
