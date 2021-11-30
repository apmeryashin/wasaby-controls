import {
    getActiveElementIndexByScrollPosition,
    getRangeByIndex, getRangeByItemsSizes,
    getRangeByScrollPosition,
    shiftRangeBySegment,
    getPlaceholdersByRange
} from './CalculatorUtil';

import type {IVirtualScrollConfig} from 'Controls/_baseList/interface/IVirtualScroll';
import type {IItemsSizes} from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController';
import type {ITriggersOffsets} from 'Controls/_baseList/Controllers/ScrollController/ObserversController/AbstractObserversController';
import type {
    IActiveElementIndex,
    IDirection,
    IEdgeItem,
    IIndexesChangedParams,
    IItemsRange,
    IPlaceholders
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

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
        this._itemsSizes = itemsSizes;
    }

    updateGivenItemsSizes(itemsSizes: IItemsSizes): void {
        this._givenItemsSizes = itemsSizes;
    }

    // endregion Getters/Setters

    // region EdgeVisibleItemIndexes

    /**
     * Считает и возвращает крайний видимый элемент.
     */
    getEdgeVisibleItem(
        direction: IDirection,
        range: IItemsRange = this._range,
        placeholders: IPlaceholders = this._placeholders
    ): IEdgeItem {
        return this._getEdgeVisibleItem(direction, range, placeholders);
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
            const viewportHeight = this._viewportSize;
            scrollPosition = itemOffset + edgeItem.borderDistance - viewportHeight;
        }

        return scrollPosition;
    }

    private _getEdgeVisibleItem(direction: IDirection, range: IItemsRange, placeholders: IPlaceholders): IEdgeItem {
        const viewportHeight = this._viewportSize;
        const scrollPosition = this._scrollPosition;
        let edgeItemParams: IEdgeItem;

        for (let index = range.startIndex; index < range.endIndex; index++) {
            const item = this._itemsSizes[index];
            const nextItem = this._itemsSizes[index + 1];
            const itemOffset = item.offset - placeholders.backward;
            const itemBorderBottom = Math.round(itemOffset) + Math.round(item.size);

            // при скроле вверх - на границе тот элемент, нижняя граница которого больше чем scrollTop
            let viewportBorderPosition = scrollPosition;
            // при скроле вниз - на границе тот элемент, нижняя граница которого больше scrollTop + viewportHeight
            if (direction === 'forward') {
                // нижняя граница - это верхняя + размер viewPort
                viewportBorderPosition += viewportHeight;
            }

            // запоминаем для восстановления скрола либо граничный элемент, либо просто самый последний.
            const isLastItem = index === range.endIndex - 1 || item && !nextItem;
            if (itemBorderBottom >= viewportBorderPosition || isLastItem) {
                let borderDistance;
                let border;
                if (direction === 'forward') {
                    // от верхней границы элемента до нижней границы viewPort
                    // считаем так, из нижней границы viewPort вычитаем верхнюю границу элемента
                    const bottomViewportBorder = scrollPosition + viewportHeight;
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
                edgeItemParams = {
                    index,
                    direction,
                    border,
                    borderDistance
                };
                break;
            }
        }

        return edgeItemParams;
    }

    // endregion EdgeVisibleItemIndexes

    // region ShiftRangeToDirection

    /**
     * Смещает виртуальный диапазон в заданном направлении.
     * Используется при достижении триггера.
     * @param direction Направление, в котором будет смещаться диапазон
     */
    shiftRangeToDirection(direction: IDirection): ICalculatorResult {
        const oldRange = this._range;
        const oldPlaceholders = this._placeholders;
        let placeholdersChanged = false;

        if (Calculator._hasItemsOutRangeToDirection(direction, this._range, this._totalCount)) {
            this._range = shiftRangeBySegment({
                currentRange: this._range,
                direction,
                pageSize: this._virtualScrollConfig.pageSize,
                segmentSize: this._getSegmentSize(),
                totalCount: this._totalCount
            });

            placeholdersChanged = this._updatePlaceholders();
        }

        return this._getRangeChangeResult(oldRange, direction, oldPlaceholders, placeholdersChanged);
    }

    // endregion ShiftRangeToDirection

    // region ShiftRangeByIndex

    /**
     * Смещает виртуальный диапазон к элементу по переданному индексу.
     * @param index Индекс элемента
     */
    shiftRangeToIndex(index: number): ICalculatorResult {
        const oldRange = this._range;
        const oldPlaceholders = this._placeholders;
        let direction = null;
        let placeholdersChanged = false;

        // если элемент уже внутри диапазона, то ничего не делаем.
        if (!this._isItemInRange(index)) {
            direction = index > this._range.endIndex ? 'forward' : 'backward';
            this._range = getRangeByIndex({
                pageSize: this._virtualScrollConfig.pageSize,
                start: index,
                totalCount: this._totalCount
            });

            placeholdersChanged = this._updatePlaceholders();
        }

        return this._getRangeChangeResult(oldRange, direction, oldPlaceholders, placeholdersChanged);
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
        const oldRange = this._range;
        const oldPlaceholders = this._placeholders;
        const direction = scrollPosition > this._scrollPosition ? 'forward' : 'backward';
        let placeholdersChanged;

        this._range = getRangeByScrollPosition({
            itemsSizes: this._itemsSizes,
            pageSize: this._virtualScrollConfig.pageSize,
            scrollPosition,
            totalCount: this._totalCount,
            triggerOffset: this._triggersOffsets[direction]
        });

        placeholdersChanged = this._updatePlaceholders();

        return this._getRangeChangeResult(oldRange, direction, oldPlaceholders, placeholdersChanged);
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
        const oldRange = this._range;
        const oldPlaceholders = this._placeholders;
        this._totalCount += count;

        const direction = this._calcAddDirection(position, count);

        if (direction === 'backward') {
            this._range.startIndex = Math.min(this._totalCount, this._range.startIndex + count);
            this._range.endIndex = Math.min(this._totalCount, this._range.endIndex + count);
        }

        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: this._getSegmentSize(),
            totalCount: this._totalCount
        });

        const placeholdersChanged = this._updatePlaceholders();

        return this._getRangeChangeResult(oldRange, direction, oldPlaceholders, placeholdersChanged);
    }

    private _calcAddDirection(position: number, count: number): IDirection {
        // Если изначально не было элементов, то direction === 'forward'
        if (this._totalCount === count) {
            return 'forward';
        }

        // Если позиция скролла === 0, то мы должны пожертвовать текущими отображаемыми записями и уступить место
        // свежедобавленным, т.е. direction === 'forward'
        if (this._scrollPosition === 0) {
            return 'forward';
        }

        const addBeforeStartIndex = position <= this._range.startIndex;
        return addBeforeStartIndex ? 'backward' : 'forward';
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param addPosition Индекс элемента, после которого вставили записи
     * @param addCount Кол-во добавляемых элементов
     * @param removePosition Индекс элемента откуда переместили записи
     * @param removeCount Кол-во удаляемых элементов
     */
    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): ICalculatorResult {
        const oldRange = this._range;
        const oldPlaceholders = this._placeholders;

        const resultAdd = this.addItems(addPosition, addCount);

        const resultRemove = this.removeItems(removePosition, removeCount);

        const placeholdersChanged = resultAdd.placeholdersChanged || resultRemove.placeholdersChanged;

        return this._getRangeChangeResult(oldRange, resultAdd.shiftDirection, oldPlaceholders, placeholdersChanged);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * Смещает соответственно виртуальный диапазон.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     */
    removeItems(position: number, count: number): ICalculatorResult {
        const oldRange = this._range;
        const oldPlaceholders = this._placeholders;
        const direction = position <= this._range.startIndex ? 'backward' : 'forward';
        let placeholdersChanged;

        this._totalCount -= count;

        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: count,
            totalCount: this._totalCount
        });

        placeholdersChanged = this._updatePlaceholders();

        return this._getRangeChangeResult(oldRange, direction, oldPlaceholders, placeholdersChanged);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * Пересчитываем виртуальный диапазон, placeholders, сбрасывает старые размеры элементов.
     * @param totalCount Новое кол-во элементов
     * @param keepPosition Нужно ли сохранить текущию позицию
     */
    resetItems(totalCount: number, keepPosition: boolean): ICalculatorResult {
        const oldRange = this._range;
        const oldPlaceholders = this._placeholders;

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

        const placeholdersChanged = this._updatePlaceholders();

        return this._getRangeChangeResult(oldRange, 'forward', oldPlaceholders, placeholdersChanged);
    }

    // endregion HandleCollectionChanges

    private _updatePlaceholders(): boolean {
        const oldPlaceholders = this._placeholders;

        this._placeholders = getPlaceholdersByRange({
            range: this._range,
            totalCount: this._totalCount,
            itemsSizes: this._itemsSizes
        });

        return oldPlaceholders.forward !== this._placeholders.forward ||
            oldPlaceholders.backward !== this._placeholders.backward;
    }

    private _getRangeChangeResult(oldRange: IItemsRange,
                                  shiftDirection: IDirection,
                                  oldPlaceholders: IPlaceholders,
                                  placeholdersChanged: boolean): ICalculatorResult {
        const indexesChanged = oldRange.startIndex !== this._range.startIndex ||
            oldRange.endIndex !== this._range.endIndex;

        const hasItemsOutRangeBackward =
            Calculator._hasItemsOutRangeToDirection('backward', this._range, this._totalCount);
        const hasItemsOutRangeForward =
            Calculator._hasItemsOutRangeToDirection('forward', this._range, this._totalCount);

        const oldHasItemsOutRangeBackward =
            Calculator._hasItemsOutRangeToDirection('backward', oldRange, this._totalCount);
        const oldHasItemsOutRangeForward =
            Calculator._hasItemsOutRangeToDirection('forward', oldRange, this._totalCount);

        const hasItemsOutRangeChanged = oldHasItemsOutRangeBackward !== hasItemsOutRangeBackward ||
            oldHasItemsOutRangeForward !== hasItemsOutRangeForward;

        return {
            range: this._range,
            oldRange,
            oldPlaceholders,
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
        return direction === 'backward' ? range.startIndex > 0 : range.endIndex < (totalCount - 1);
    }
}
