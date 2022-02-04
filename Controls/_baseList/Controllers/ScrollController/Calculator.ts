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
    IPlaceholders,
    ICalcMode
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
    feature1183225611: boolean;

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
    private readonly _feature1183225611: boolean;
    private _scrollPosition: number;
    private _viewportSize: number;
    private _contentSize: number;
    protected _totalCount: number;
    protected _range: IItemsRange = { startIndex: 0, endIndex: 0 };
    private _placeholders: IPlaceholders = { backward: 0, forward: 0 };
    private _activeElementIndex: number;
    private _itemsRenderedOutsideRange: number[] = [];

    constructor(options: ICalculatorOptions) {
        this._itemsSizes = options.itemsSizes;
        this._givenItemsSizes = options.givenItemsSizes;
        this._triggersOffsets = options.triggersOffsets;
        this._scrollPosition = options.scrollPosition || 0;
        this._totalCount = options.totalCount;
        this._feature1183225611 = options.feature1183225611;
        this._viewportSize = options.viewportSize || 0;
        this._contentSize = options.contentSize || 0;
        this._virtualScrollConfig = options.virtualScrollConfig;
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

    /**
     * Устанавливает массив индексов элементов, которые отрисовываются за пределами диапазона
     * @param items
     */
    setItemsRenderedOutsideRange(items: number[]): void {
        this._itemsRenderedOutsideRange = items;
        this._placeholders = getPlaceholdersByRange({
            range: this._range,
            totalCount: this._totalCount,
            itemsSizes: this._itemsSizes,
            itemsRenderedOutsideRange: this._itemsRenderedOutsideRange
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
        let scrollPositionOffset = 0;

        const item = this._itemsSizes.find((item) => item.key === edgeItem.key );
        if (!item) {
            return this._scrollPosition;
        }
        // https://jsfiddle.net/alex111089/oj8bL0mq/ нативная демка про восстановление скролла
        // Вычитаем scrollPosition, чтобы привести координаты в единую систему, до и после отрисовки.
        const itemOffset = item.offset - this._scrollPosition - this._placeholders.backward;
        if (edgeItem.direction === 'backward') {
            if (edgeItem.border === 'forward') {
                scrollPositionOffset = itemOffset + (item.size - edgeItem.borderDistance);
            } else {
                scrollPositionOffset = itemOffset + edgeItem.borderDistance;
            }
        } else {
            scrollPositionOffset = itemOffset - this._viewportSize + edgeItem.borderDistance;
        }

        return Math.max(this._scrollPosition + scrollPositionOffset, 0);
    }

    private _getEdgeVisibleItem(params: IEdgeItemCalculatingParams): IEdgeItem {
        const viewportSize = this._viewportSize;
        const scrollPosition = this._scrollPosition;
        const direction = params.direction;
        const range = params.range || this._range;
        const placeholders = params.placeholders || this._placeholders;
        const itemsSizes = params.itemsSizes || this._itemsSizes;

        // Возможен кейс, что после resetItems записи не успели отрисоваться
        // и в этот же _beforeUpdate изменили коллекцию. Допустим свернули узлы.
        // Это вызовет removeItems, который запланирует восстановление скролла.
        // Но скролл восстанавливать нельзя, т.к. записи еще не были отрисованы.
        const itemsIsRendered = itemsSizes.some((it) => it.size);
        if (!itemsIsRendered) {
            return null;
        }

        let edgeItem: IEdgeItem = null;
        for (let index = range.startIndex; index < range.endIndex && index < itemsSizes.length; index++) {
            const item = itemsSizes[index];
            const nextItem = itemsSizes[index + 1];
            const itemOffset = item.offset - placeholders.backward - scrollPosition;
            const itemBorderBottom = Math.round(itemOffset) + Math.round(item.size);

            // при скроле вверх - на границе тот элемент, нижняя граница которого больше чем scrollTop
            let viewportBorderPosition = 0;
            // при скроле вниз - на границе тот элемент, нижняя граница которого больше scrollTop + viewportSize
            if (direction === 'forward') {
                // нижняя граница - это верхняя + размер viewPort
                viewportBorderPosition += viewportSize;
            }

            // запоминаем для восстановления скрола либо граничный элемент, либо просто самый последний.
            const isLastItem = index === range.endIndex - 1;
            const hasNextRenderedItem = itemsSizes.slice(index + 1, range.endIndex).some((it) => it.size);
            const isLastRenderedItem = (!nextItem || !nextItem.size) && !hasNextRenderedItem;
            if (itemBorderBottom > viewportBorderPosition || isLastItem || isLastRenderedItem) {
                let borderDistance;
                let border;
                if (direction === 'forward') {
                    // от верхней границы элемента до нижней границы viewPort
                    // считаем так, из нижней границы viewPort вычитаем верхнюю границу элемента
                    border = 'backward';
                    borderDistance = viewportBorderPosition - itemOffset;
                } else {
                    // запись - выше, чем верхняя граница viewPort
                    if (viewportBorderPosition > itemOffset) {
                        // TODO SCROLL зачем в виде крайнего видимого элемента брать тот, который не полностью виден?
                        //  по идее условие этого ифа должно быть выше. И нам тогда вообще не нужно считать
                        //  itemBorderBottom и всегда брать верхнюю границу записи.
                        border = 'forward';
                        borderDistance = itemBorderBottom - viewportBorderPosition;
                    } else {
                        border = 'backward';
                        // TODO SCROLL очень странно что тут всегда отрицательное значение,
                        //  хотя по факту оно должно быть положительным
                        borderDistance = viewportBorderPosition - itemOffset;
                    }
                }
                edgeItem = {
                    key: item.key,
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
                scrollPosition: this._scrollPosition,
                triggersOffsets: this._triggersOffsets,
                itemsSizes: this._itemsSizes,
                placeholders: this._placeholders,
                calcMode: 'shift'
            });

            this._placeholders = getPlaceholdersByRange({
                range: this._range,
                totalCount: this._totalCount,
                itemsSizes: this._itemsSizes,
                itemsRenderedOutsideRange: this._itemsRenderedOutsideRange
            });
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

        // Смещать диапазон нужно, если
        // 1. Элемент находится за пределами текущего диапазона
        // 2. Мы не можем к нему полноценно проскроллить(проскроллить так, чтобы элемент был в верху вьюпорта)
        if (!this._isItemInRange(index) || !this._contentAfterItemMoreThanViewport(index)) {
            direction = index > this._range.endIndex ? 'forward' : 'backward';
            this._range = getRangeByIndex({
                pageSize: this._virtualScrollConfig.pageSize,
                start: index,
                totalCount: this._totalCount
            });

            this._placeholders = getPlaceholdersByRange({
                range: this._range,
                totalCount: this._totalCount,
                itemsSizes: this._itemsSizes,
                itemsRenderedOutsideRange: this._itemsRenderedOutsideRange
            });
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

    /**
     * Проверяем, что после элемента записей достаточно, чтобы запонлить весь вьюпорт.
     * @param itemIndex
     * @private
     */
    private _contentAfterItemMoreThanViewport(itemIndex: number): boolean {
        let itemsSizesSum = 0;
        for (let i = itemIndex; i < this._range.endIndex; i++) {
            itemsSizesSum += this._itemsSizes[i].size;
        }
        return itemsSizesSum >= this._viewportSize;
    }

    // endregion ShiftRangeByIndex

    // region ShiftRangeByScrollPosition

    /**
     * Смещает диапазон к переданной позиции скролла, учитывая виртуальный скролл.
     * @param scrollPosition Позиция скролла
     */
    shiftRangeToVirtualScrollPosition(scrollPosition: number): ICalculatorResult {
        const oldState = this._getState();

        if (this._scrollPosition !== scrollPosition) {
            const direction = scrollPosition > this._scrollPosition ? 'forward' : 'backward';
            this._range = getRangeByScrollPosition({
                itemsSizes: this._itemsSizes,
                pageSize: this._virtualScrollConfig.pageSize,
                scrollPosition,
                totalCount: this._totalCount,
                triggerOffset: this._triggersOffsets[direction]
            });

            this._placeholders = getPlaceholdersByRange({
                range: this._range,
                totalCount: this._totalCount,
                itemsSizes: this._itemsSizes,
                itemsRenderedOutsideRange: this._itemsRenderedOutsideRange
            });
        }

        // При скролле к виртуальной позиции нельзя сказать куда сместился диапазон, т.к. по сути это поведение схожее
        // с resetItems. Мы просто создаем новый диапазон, а не смещаем старый. Поэтому shiftDirection = null;
        // Это нужно чтобы мы не востанавливали скролл.
        return this._getRangeChangeResult(oldState, null);
    }

    // endregion ShiftRangeByScrollPosition

    // region ScrollPositionChange

    /**
     * Изменение позиции скролла. Пересчитывает индекс активного элемента от текущей позиции скролла
     * @param scrollPosition Позиция скролла
     * @param updateActiveElement Нужно ли обновлять активный эелемент
     */
    scrollPositionChange(scrollPosition: number, updateActiveElement: boolean): IActiveElementIndexChanged {
        const oldActiveElementIndex = this._activeElementIndex;

        if (this._scrollPosition !== scrollPosition) {
            this._scrollPosition = scrollPosition;
            if (updateActiveElement) {
                this._activeElementIndex = getActiveElementIndexByScrollPosition({
                    contentSize: this._contentSize,
                    viewportSize: this._viewportSize,
                    itemsSizes: this._itemsSizes,
                    currentRange: this._range,
                    placeholders: this._placeholders,
                    scrollPosition,
                    totalCount: this._totalCount,
                    feature1183225611: this._feature1183225611
                });
            }
        }

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
     * @param calcMode Режим пересчета диапазона отображаемых записей
     */
    addItems(position: number, count: number, calcMode: ICalcMode): ICalculatorResult {
        const oldState = this._getState();
        this._totalCount += count;
        const direction = this._calcAddDirection(position, count);
        let indexesChanged = false;

        // если записи добавляют в начало и список не проскроллен, то не нужно пересчитывать range,
        // т.к. добавленная запись должна сразу стать видна вверху и собой выместить последнюю запись в диапазоне
        const shouldChangedRange = calcMode !== 'nothing' || !!this._scrollPosition;
        // Корректируем старый диапазон. Т.к. записи добавились  в начало, то все индексы сместятся на count
        if (position === 0 && shouldChangedRange) {
            indexesChanged = true;
            this._range.startIndex = Math.min(this._totalCount, this._range.startIndex + count);
            this._range.endIndex = Math.min(this._totalCount, this._range.endIndex + count);
        }

        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            calcMode,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: this._getSegmentSize(),
            totalCount: this._totalCount,
            viewportSize: this._viewportSize,
            scrollPosition: this._scrollPosition,
            triggersOffsets: this._triggersOffsets,
            itemsSizes: this._itemsSizes,
            placeholders: this._placeholders
        });

        this._placeholders = getPlaceholdersByRange({
            range: this._range,
            totalCount: this._totalCount,
            itemsSizes: this._itemsSizes,
            itemsRenderedOutsideRange: this._itemsRenderedOutsideRange
        });

        return this._getRangeChangeResult(oldState, direction, indexesChanged);
    }

    protected _calcAddDirection(position: number, count: number): IDirection {
        // Если изначально не было элементов, то direction === 'forward'
        if (this._totalCount === count) {
            return 'forward';
        }

        const addBeforeStartIndex = position <= this._range.startIndex;
        return addBeforeStartIndex ? 'backward' : 'forward';
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
        // Всегда смещаем диапазон, если удалили записи в начале и пересчитываем при удалении после startIndex,
        // только если за пределами диапазона недостаточно записей для заполнения pageSize, в противном случае
        // записи за пределами диапазона сами попадут в текущий диапазон из-за удаления записей.
        const enoughItemsToForward = this._totalCount - this._range.endIndex >= count;
        const shouldShiftRange = direction === 'backward' || !enoughItemsToForward;

        this._totalCount -= count;

        if (shouldShiftRange) {
            this._range = shiftRangeBySegment({
                currentRange: this._range,
                direction,
                pageSize: this._virtualScrollConfig.pageSize,
                segmentSize: count,
                totalCount: this._totalCount,
                viewportSize: this._viewportSize,
                scrollPosition: this._scrollPosition,
                triggersOffsets: this._triggersOffsets,
                itemsSizes: this._itemsSizes,
                placeholders: this._placeholders,
                calcMode: 'shift'
            });
        }

        this._placeholders = getPlaceholdersByRange({
            range: this._range,
            totalCount: this._totalCount,
            itemsSizes: this._itemsSizes,
            itemsRenderedOutsideRange: this._itemsRenderedOutsideRange
        });

        return this._getRangeChangeResult(oldState, direction);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * Пересчитываем виртуальный диапазон, placeholders, сбрасывает старые размеры элементов.
     * @param totalCount Новое кол-во элементов
     * @param startIndex Начальный индекс диапазона отображаемых записей
     */
    resetItems(totalCount: number, startIndex: number): ICalculatorResult {
        const oldState = this._getState();
        this._totalCount = totalCount;

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
        this._placeholders = getPlaceholdersByRange({
            range: this._range,
            totalCount: this._totalCount,
            itemsSizes: this._itemsSizes,
            itemsRenderedOutsideRange: this._itemsRenderedOutsideRange
        });

        return this._getRangeChangeResult(oldState, null);
    }

    // endregion HandleCollectionChanges

    protected _getRangeChangeResult(
        oldState: ICalculatorState,
        shiftDirection: IDirection|null,
        forceIndexesChanged: boolean = false
    ): ICalculatorResult {
        // TODO избавиться от forceIndexesChanged по
        //  https://online.sbis.ru/opendoc.html?guid=c6c7d72b-6808-4500-b857-7455d0520d53
        const indexesChanged = oldState.range.startIndex !== this._range.startIndex ||
            oldState.range.endIndex !== this._range.endIndex || forceIndexesChanged;

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
            scrollMode: null,

            hasItemsOutRangeBackward,
            hasItemsOutRangeForward,
            hasItemsOutRangeChanged,

            forwardPlaceholderSize: this._placeholders.forward,
            backwardPlaceholderSize: this._placeholders.backward,
            placeholdersChanged
        };
    }

    protected _getState(): ICalculatorState {
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
