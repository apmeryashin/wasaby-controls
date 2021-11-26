import {Control} from 'UI/Base';

import {
    NewScrollController as ScrollController,
    IDirectionNew as IDirection,
    IPlaceholders,
    IItemSize,
    TriggerOffsetType
} from 'Controls/baseList';

import type {GridCollection} from 'Controls/grid';
import {getDimensions} from 'Controls/sizeUtils';

export interface IControllerOptions {
    listControl: Control;
    collection: GridCollection;
    virtualScrollConfig?: {
        pageSize?: number;
    };
    columnScrollStartPosition?: 'end';
    triggersQuerySelector: string;
    columns: object[];
    leftTriggerOffsetCoefficient: number;
    rightTriggerOffsetCoefficient: number;
    updatePlaceholdersUtil: IUpdatePlaceholdersUtil;
}

type IUpdatePlaceholdersUtil = (placeholders: IPlaceholders) => void;

export class Controller {
    private _scrollController: ScrollController;
    private _collection: GridCollection;
    private readonly _updatePlaceholdersUtil: IUpdatePlaceholdersUtil;

    constructor(options: IControllerOptions) {
        this._collection = options.collection;
        this._updatePlaceholdersUtil = options.updatePlaceholdersUtil;
        this._createScrollController(options);
    }

    private _createScrollController(options: IControllerOptions): void {
        this._scrollController = new ScrollController({
            virtualScrollConfig: options.virtualScrollConfig,
            listControl: options.listControl,
            totalCount: options.columns.length,
            itemSizeGetter: Controller._itemSizeGetter,
            triggerOffsetType: TriggerOffsetType.HORIZONTAL,
            applyTriggerOffsetCallback: Controller._applyTriggerOffsetCallback,

            indexesChangedCallback: ({startIndex, endIndex}) => {
                this._collection.setColumns(options.columns.slice(startIndex, endIndex));
            },
            hasItemsOutRangeChangedCallback: () => {/**/
            },
            indexesInitializedCallback: ({startIndex, endIndex}) => {
                this._collection.setColumns(options.columns.slice(startIndex, endIndex));
            },
            placeholdersChangedCallback: (placeholders: IPlaceholders) => {
                this._updatePlaceholdersUtil(placeholders);
            },
            itemsEndedCallback: () => {/*Needless*/
            },
            activeElementChangedCallback: () => {/*Needless*/
            },

            itemsContainer: undefined,
            listContainer: undefined,

            itemsQuerySelector: '.js-Controls-Grid__columnScroll__relativeCell',

            topTriggerOffsetCoefficient: options.leftTriggerOffsetCoefficient,
            bottomTriggerOffsetCoefficient: options.rightTriggerOffsetCoefficient,
            triggersQuerySelector: options.triggersQuerySelector,
            triggersVisibility: {
                backward: true,
                forward: true
            },

            contentSize: 0,
            givenItemsSizes: undefined,
            scrollPosition: 0,
            viewportSize: 0
        });
    }

    setItemsContainer(itemsContainer: HTMLElement): void {
        this._scrollController.setItemsContainer(itemsContainer);
    }

    setListContainer(listContainer: HTMLElement): void {
        this._scrollController.setListContainer(listContainer);
    }

    viewportResized(viewportSize: number): void {
        this._scrollController.viewportResized(viewportSize);
    }

    private static _itemSizeGetter(element: HTMLElement): IItemSize {
        return {
            size: getDimensions(element).width,
            offset: element.offsetLeft
        };
    }

    private static _applyTriggerOffsetCallback(element: HTMLElement, direction: IDirection, offset: number): void {
        if (direction === 'backward') {
            element.style.left = `${offset}px`;
        } else {
            element.style.right = `${offset}px`;
        }
    }
}

export default Controller;
