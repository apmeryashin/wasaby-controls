import {
    getActiveElementIndexByScrollPosition,
    getRangeByIndex,
    getRangeByItemsSizes,
    getRangeByScrollPosition,
    shiftRangeBySegment,
    getPlaceholdersByRange,
    getFirstVisibleItemIndex
} from './CalculatorUtil';

import type { IVirtualScrollConfig } from 'Controls/_baseList/interface/IVirtualScroll';
import type { IItemsSizes } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController/AbstractItemsSizeController';
import type { ITriggersOffsets } from 'Controls/_baseList/Controllers/ScrollController/ObserverController/AbstractObserversController';
import type {
    IActiveElementIndex,
    IDirection,
    IEdgeItem,
    IHasItemsOutRange,
    IIndexesChangedParams,
    IItemsRange,
    IPlaceholders
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import type { IEdgeItemCalculatingParams } from 'Controls/_baseList/Controllers/AbstractListVirtualScrollController';
import { isEqual } from 'Types/object';

interface ICalculatorState {
    range: IItemsRange;
    placeholders: IPlaceholders;
    hasItemsOutRange: IHasItemsOutRange;
}

export interface IActiveElementIndexChanged extends IActiveElementIndex {
    activeElementIndexChanged: boolean;
}

export interface ICalculatorResult extends IIndexesChangedParams {
    indexesChanged: boolean;

    hasItemsOutRangeBackward: boolean;
    hasItemsOutRangeForward: boolean;
    hasItemsOutRangeChanged: boolean;

    backwardPlaceholderSize: number;
    forwardPlaceholderSize: number;
    placeholdersChanged: boolean;
}

export interface ICalculatorBaseOptions {
    scrollPosition?: number;
    viewportSize?: number;
    contentSize?: number;
    totalCount: number;

    /**
     * Размеры элементов заданные прикладниками.
     * Берем их из рекордсета по itemHeightProperty.
     */
    givenItemsSizes?: IItemsSizes;

    virtualScrollConfig: IVirtualScrollConfig;
}

/**
 * Интерфейс опции класса Calculator
 */
export interface ICalculatorOptions extends ICalculatorBaseOptions {
    itemsSizes: IItemsSizes;

    /**
     * Размеры смещения триггеров. Нужны чтобы избежать лишних отрисовок и сразу же отловить видимость триггера.
     */
    triggersOffsets: ITriggersOffsets;
}

const RELATION_COEFFICIENT_BETWEEN_PAGE_AND_SEGMENT = 4;
/**
 * Класс предназначен для:
 *  - сбора, хранения и актуализации любых параметров scroll: scrollTop, размер viewPort, элементов и контента;
 *  - применение индексов virtual scroll на модель;
 *  - вычисление размеров virtual placeholders.
 */
export class Calculator {
    private _itemsSizes: IItemsSizes;
    private _givenItemsSizes: IItemsSizes;
    private _triggersOffsets: ITriggersOffsets;
    private _virtualScrollConfig: IVirtualScrollConfig;
    private _scrollPosition: number;
    private _viewportSize: number;
    private _contentSize: number;
    private _totalCount: number;
    private _range: IItemsRange = { startIndex: 0, endIndex: 0 };
    private _placeholders: IPlaceholders = { backward: 0, forward: 0 };
    private _activeElementIndex: number;

    constructor(options: ICalculatorOptions) {
        this._itemsSizes = options.itemsSizes;
        this._givenItemsSizes = options.givenItemsSizes;
        this._triggersOffsets = options.triggersOffsets;
        this._scrollPosition = options.scrollPosition || 0;
        this._totalCount = options.totalCount;
        this._viewportSize = options.viewportSize || 0;
        this._contentSize = options.contentSize || 0;
        this._virtualScrollConfig = options.virtualScrollConfig;
        this.resetItems(this._totalCount, false);
    }

    // region Getters/Setters

    getRange(): IItemsRange {
        return this._range;
    }

    getTotalItemsCount(): number {
        return this._totalCount;
    }

    hasItemsOutRange(direction: IDirection): boolean {
        return Calculator._hasItemsOutRangeToDirection(direction, this._range, this._totalCount);
    }

    setTriggerOffsets(triggerOffset: ITriggersOffsets): void {
        this._triggersOffsets = triggerOffset;
    }

    setViewportSize(viewportSize: number): void {
        if (this._viewportSize !== viewportSize) {
            this._viewportSize = viewportSize;
        }
    }

    setContentSize(contentSize: number): void {
        if (this._contentSize !== contentSize) {
            this._contentSize = contentSize;
        }
    }

    /**
     * Устанавливает новые размеры элементов
     * @param itemsSizes
     */
    updateItemsSizes(itemsSizes: IItemsSizes): void {
        if (!isEqual(this._itemsSizes, itemsSizes)) {
            this._itemsSizes = itemsSizes;
        }
    }

    updateGivenItemsSizes(itemsSizes: IItemsSizes): void {
        this._givenItemsSizes = itemsSizes;
    }

    /**
     * Возвращает индекс первой полностью видимой записи
     */
    getFirstVisibleItemIndex(): number {
        return getFirstVisibleItemIndex({
            itemsSizes: this._itemsSizes,
            currentRange: this._range,
            scrollPosition: this._scrollPosition,
            placeholders: this._placeholders
        });
    }

    // endregion Getters/Setters

    // region EdgeVisibleItem

    /**
     * Считает и возвращает крайний видимый элемент.
     */
    getEdgeVisibleItem(params: IEdgeItemCalculatingParams): IEdgeItem {
        return this._getEdgeVisibleItem(params);
    }

    getScrollPositionToEdgeItem(edgeItem: IEdgeItem): number {
        let scrollPosition = 0;

        const item = this._itemsSizes[edgeItem.index];
        const itemOffset = item.offset - this._placeholders.backward;
        if (edgeItem.direction === 'backward') {
            if (edgeItem.border === 'forward') {
                scrollPosition = itemOffset + (item.size - edgeItem.borderDistance);
            } else {
                scrollPosition = itemOffset + edgeItem.borderDistance;
            }
        } else {
            const viewportSize = this._viewportSize;
            scrollPosition = itemOffset + edgeItem.borderDistance - viewportSize;
        }
        scrollPosition = Math.max(scrollPosition, 0);
        const maxScrollPosition = Math.max(this._contentSize - this._viewportSize, 0);
        return scrollPosition > maxScrollPosition ? maxScrollPosition : scrollPosition;
    }

    private _getEdgeVisibleItem(params: IEdgeItemCalculatingParams): IEdgeItem {
        const viewportSize = this._viewportSize;
        const scrollPosition = this._scrollPosition;
        const direction = params.direction;
        const range = params.range || this._range;
        const placeholders = params.placeholders || this._placeholders;
        const itemsSizes = this._itemsSizes;
        let edgeItem: IEdgeItem = null;

        for (let index = range.startIndex; index < range.endIndex && index < this._totalCount; index++) {
            const item = itemsSizes[index];
            const nextItem = itemsSizes[index + 1];
            const itemOffset = item.offset - placeholders.backward;
            const itemBorderBottom = Math.round(itemOffset) + Math.round(item.size);

            // при скроле вверх - на границе тот элемент, нижняя граница которого больше чем scrollTop
            let viewportBorderPosition = scrollPosition;
            // при скроле вниз - на границе тот элемент, нижняя граница которого больше scrollTop + viewportSize
            if (direction === 'forward') {
                // нижняя граница - это верхняя + размер viewPort
                viewportBorderPosition += viewportSize;
            }

            // запоминаем для восстановления скрола либо граничный элемент, либо просто самый последний.
            const isLastItem = index === range.endIndex - 1 || item && !nextItem;
            if (itemBorderBottom >= viewportBorderPosition || isLastItem) {
                let borderDistance;
                let border;
                if (direction === 'forward') {
                    // от верхней границы элемента до нижней границы viewPort
                    // считаем так, из нижней границы viewPort вычитаем верхнюю границу элемента
                    const bottomViewportBorder = scrollPosition + viewportSize;
                    border = 'backward';
                    borderDistance = bottomViewportBorder - itemOffset;
                } else {
                    // запись - выше, чем верхняя граница viewPort
                    if (scrollPosition >= itemOffset) {
                        border = 'forward';
                        borderDistance = itemBorderBottom - scrollPosition;
                    } else {
                        border = 'backward';
                        borderDistance = scrollPosition - itemOffset;
                    }
                }
                edgeItem = {
                    index,
                    direction,
                    border,
                    borderDistance
                };
                break;
            }
        }

        return edgeItem;
    }

    // endregion EdgeVisibleItem

    // region ShiftRangeToDirection

    /**
     * Смещает виртуальный диапазон в заданном направлении.
     * Используется при достижении триггера.
     * @param direction Направление, в котором будет смещаться диапазон
     */
    shiftRangeToDirection(direction: IDirection): ICalculatorResult {
        const oldState = this._getState();

        if (Calculator._hasItemsOutRangeToDirection(direction, this._range, this._totalCount)) {
            this._range = shiftRangeBySegment({
                currentRange: this._range,
                direction,
                pageSize: this._virtualScrollConfig.pageSize,
                segmentSize: this._getSegmentSize(),
                totalCount: this._totalCount,
                viewportSize: this._viewportSize,
                contentSize: this._contentSize,
                triggersOffsets: this._triggersOffsets,
                itemsSizes: this._itemsSizes,
                placeholders: this._placeholders
            });

            this._updatePlaceholders();
        }

        return this._getRangeChangeResult(oldState, direction);
    }

    // endregion ShiftRangeToDirection

    // region ShiftRangeByIndex

    /**
     * Смещает виртуальный диапазон к элементу по переданному индексу.
     * @param index Индекс элемента
     */
    shiftRangeToIndex(index: number): ICalculatorResult {
        const oldState = this._getState();
        let direction = null;

        // если элемент уже внутри диапазона, то ничего не делаем.
        if (!this._isItemInRange(index)) {
            direction = index > this._range.endIndex ? 'forward' : 'backward';
            this._range = getRangeByIndex({
                pageSize: this._virtualScrollConfig.pageSize,
                start: index,
                totalCount: this._totalCount
            });

            this._updatePlaceholders();
        }

        return this._getRangeChangeResult(oldState, direction);
    }

    /**
     * Возвращает, что элемент по переданному index находится внутри виртуального диапазона
     * @param index Индекс элемента
     * @return {boolean}
     */
    private _isItemInRange(index: number): boolean {
        return index >= this._range.startIndex && index < this._range.endIndex;
    }

    // endregion ShiftRangeByIndex

    // region ShiftRangeByScrollPosition

    /**
     * Смещает диапазон к переданной позиции скролла, учитывая виртуальный скролл.
     * @param scrollPosition Позиция скролла
     */
    shiftRangeToVirtualScrollPosition(scrollPosition: number): ICalculatorResult {
        const oldState = this._getState();
        const direction = scrollPosition > this._scrollPosition ? 'forward' : 'backward';

        this._range = getRangeByScrollPosition({
            itemsSizes: this._itemsSizes,
            pageSize: this._virtualScrollConfig.pageSize,
            scrollPosition,
            totalCount: this._totalCount,
            triggerOffset: this._triggersOffsets[direction]
        });

        this._updatePlaceholders();

        return this._getRangeChangeResult(oldState, direction);
    }

    // endregion ShiftRangeByScrollPosition

    // region ScrollPositionChange

    /**
     * Изменение позиции скролла. Пересчитывает индекс активного элемента от текущей позиции скролла
     * @param scrollPosition Позиция скролла
     */
    scrollPositionChange(scrollPosition: number): IActiveElementIndexChanged {
        const oldActiveElementIndex = this._activeElementIndex;
        this._scrollPosition = scrollPosition;

        this._activeElementIndex = getActiveElementIndexByScrollPosition({
            contentSize: this._contentSize,
            viewportSize: this._viewportSize,
            itemsSizes: this._itemsSizes,
            currentRange: this._range,
            placeholders: this._placeholders,
            scrollPosition,
            totalCount: this._totalCount
        });

        return {
            activeElementIndex: this._activeElementIndex,
            activeElementIndexChanged: oldActiveElementIndex !== this._activeElementIndex
        };
    }

    // endregion ScrollPositionChange

    // region HandleCollectionChanges

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * При необходимости смещает виртуальный диапазон.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     */
    addItems(position: number, count: number): ICalculatorResult {
        const oldState = this._getState();
        this._totalCount += count;

        const direction = this._calcAddDirection(position, count);

        // Корректируем старый диапазон. Т.к. записи добавились  в начало, то все индексы сместятся на count
        if (position === 0) {
            this._range.startIndex = Math.min(this._totalCount, this._range.startIndex + count);
            this._range.endIndex = Math.min(this._totalCount, this._range.endIndex + count);
        }

        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: this._getSegmentSize(),
            totalCount: this._totalCount,
            viewportSize: this._viewportSize,
            contentSize: this._contentSize,
            triggersOffsets: this._triggersOffsets,
            itemsSizes: this._itemsSizes,
            placeholders: this._placeholders
        });

        this._updatePlaceholders();
        return this._getRangeChangeResult(oldState, direction);
    }

    private _calcAddDirection(position: number, count: number): IDirection {
        // Если изначально не было элементов, то direction === 'forward'
        if (this._totalCount === count) {
            return 'forward';
        }

        // Если записи добавили внутрь диапазона, то мы должны ориентироваться по BackwardEdgeItem, чтобы
        // и так видимый элемент остался виден. Поэтому direction='forward', только если записи добавили после диапазона
        const addBeforeEndIndex = position < this._range.endIndex;
        return addBeforeEndIndex ? 'backward' : 'forward';
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param addPosition Индекс элемента, после которого вставили записи
     * @param addCount Кол-во добавляемых элементов
     * @param removePosition Индекс элемента откуда переместили записи
     * @param removeCount Кол-во удаляемых элементов
     */
    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): ICalculatorResult {
        const oldState = this._getState();

        const resultAdd = this.addItems(addPosition, addCount);
        this.removeItems(removePosition, removeCount);

        return this._getRangeChangeResult(oldState, resultAdd.shiftDirection);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * Смещает соответственно виртуальный диапазон.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     */
    removeItems(position: number, count: number): ICalculatorResult {
        const oldState = this._getState();
        const direction = position <= this._range.startIndex ? 'backward' : 'forward';

        this._totalCount -= count;

        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: count,
            totalCount: this._totalCount,
            viewportSize: this._viewportSize,
            contentSize: this._contentSize,
            triggersOffsets: this._triggersOffsets,
            itemsSizes: this._itemsSizes,
            placeholders: this._placeholders
        });

        this._updatePlaceholders();

        return this._getRangeChangeResult(oldState, direction);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * Пересчитываем виртуальный диапазон, placeholders, сбрасывает старые размеры элементов.
     * @param totalCount Новое кол-во элементов
     * @param keepPosition Нужно ли сохранить текущию позицию
     */
    resetItems(totalCount: number, keepPosition: boolean): void {
        this._totalCount = totalCount;

        const startIndex = keepPosition ? this._range.startIndex : 0;
        if (this._givenItemsSizes) {
            this._range = getRangeByItemsSizes({
                start: startIndex,
                totalCount: this._totalCount,
                viewportSize: this._viewportSize,
                itemsSizes: this._givenItemsSizes
            });
        } else {
            this._range = getRangeByIndex({
                pageSize: this._virtualScrollConfig.pageSize,
                start: startIndex,
                totalCount: this._totalCount
            });
        }
        // Пересчитываем плэйсхолдеры. При пересчете они сбросятся в 0(размеры элементов уже были сброшены)
        this._updatePlaceholders();
    }

    // endregion HandleCollectionChanges

    private _updatePlaceholders(): void {
        this._placeholders = getPlaceholdersByRange({
            range: this._range,
            totalCount: this._totalCount,
            itemsSizes: this._itemsSizes
        });
    }

    private _getRangeChangeResult(oldState: ICalculatorState, shiftDirection: IDirection|null): ICalculatorResult {
        const indexesChanged = oldState.range.startIndex !== this._range.startIndex ||
            oldState.range.endIndex !== this._range.endIndex;

        const hasItemsOutRangeBackward =
            Calculator._hasItemsOutRangeToDirection('backward', this._range, this._totalCount);
        const hasItemsOutRangeForward =
            Calculator._hasItemsOutRangeToDirection('forward', this._range, this._totalCount);

        const hasItemsOutRangeChanged = oldState.hasItemsOutRange.backward !== hasItemsOutRangeBackward ||
            oldState.hasItemsOutRange.forward !== hasItemsOutRangeForward;
        const placeholdersChanged = oldState.placeholders.backward !== this._placeholders.backward ||
            oldState.placeholders.forward !== this._placeholders.forward;

        return {
            range: this._range,
            oldRange: oldState.range,
            oldPlaceholders: oldState.placeholders,
            indexesChanged,
            shiftDirection,

            hasItemsOutRangeBackward,
            hasItemsOutRangeForward,
            hasItemsOutRangeChanged,

            forwardPlaceholderSize: this._placeholders.forward,
            backwardPlaceholderSize: this._placeholders.backward,
            placeholdersChanged
        };
    }

    private _getState(): ICalculatorState {
        return {
            range: this._range,
            placeholders: this._placeholders,
            hasItemsOutRange: {
                backward: Calculator._hasItemsOutRangeToDirection('backward', this._range, this._totalCount),
                forward: Calculator._hasItemsOutRangeToDirection('forward', this._range, this._totalCount)
            }
        };
    }

    private _getSegmentSize(): number {
        const virtualScrollConfig = this._virtualScrollConfig;
        let segmentSize = virtualScrollConfig.segmentSize;
        if (!segmentSize) {
            segmentSize = Math.ceil(virtualScrollConfig.pageSize / RELATION_COEFFICIENT_BETWEEN_PAGE_AND_SEGMENT);
        }
        return segmentSize;
    }

    /**
     * Возвращает, что в заданном направлении еще есть не отображенные элементы.
     * Используется, чтобы понять нужно ли подгружать данные или нужно сделать ссмещение виртуального скролла.
     * @param direction Направление
     * @param range Диапазон
     * @param totalCount Общее количество элементов
     */
    private static _hasItemsOutRangeToDirection(direction: IDirection,
                                                range: IItemsRange,
                                                totalCount: number): boolean {
        return direction === 'backward' ? range.startIndex > 0 : range.endIndex < totalCount;
    }
}
