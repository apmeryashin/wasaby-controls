import {
    getActiveElementIndexByScrollPosition,
    getRangeByIndex, getRangeByItemsSizes,
    getRangeByScrollPosition,
    shiftRangeBySegment
} from './CalculatorUtil';

import type {IVirtualScrollConfig} from 'Controls/_baseList/interface/IVirtualScroll';
import type {IItemsSizes} from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController';
import type {ITriggersOffsets} from 'Controls/_baseList/Controllers/ScrollController/ObserversController';
import type {
    IActiveElementIndex,
    IDirection,
    IEnvironmentChangedParams,
    IEdgeItem,
    IIndexesChangedParams,
    IItemsRange
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export interface IActiveElementIndexChanged extends IActiveElementIndex {
    activeElementIndexChanged: boolean;
}

export interface ICalculatorResult extends
    IIndexesChangedParams,
    IEnvironmentChangedParams {
    indexesChanged: boolean;
    environmentChanged: boolean;
}

export interface ICalculatorBaseOptions {
    scrollPosition: number;
    viewportSize: number;
    contentSize: number;
    totalCount: number;

    /**
     * Размеры элементов заданные прикладниками.
     * Берем их из рекордсета по itemHeightProperty.
     */
    givenItemsSizes: IItemsSizes;

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

export interface IPlaceholders {
    top: number;
    bottom: number;
}

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
    private _placeholders: IPlaceholders = { top: 0, bottom: 0 };
    private _activeElementIndex: number;

    constructor(options: ICalculatorOptions) {
        this._itemsSizes = options.itemsSizes;
        this._givenItemsSizes = options.givenItemsSizes;
        this._triggersOffsets = options.triggersOffsets;
        this._scrollPosition = options.scrollPosition;
        this._totalCount = options.totalCount;
        this._viewportSize = options.viewportSize;
        this._contentSize = options.contentSize;
        this._virtualScrollConfig = options.virtualScrollConfig;
        this.resetItems(this._totalCount);
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

    getScrollTopToEdgeItem(edgeItem: IEdgeItem): number {
        let scrollTop = 0;

        const item = this._itemsSizes[edgeItem.index];
        if (item) {
            if (edgeItem.direction === 'backward') {
                if (edgeItem.border === 'forward') {
                    scrollTop = item.offset + (item.size - edgeItem.borderDistance);
                } else {
                    scrollTop = item.offset + edgeItem.borderDistance;
                }
            } else {
                const viewportHeight = this._viewportSize;
                scrollTop = item.offset + edgeItem.borderDistance - viewportHeight;
            }
        }

        return scrollTop;
    }

    // endregion Getters/Setters

    // region EdgeVisibleItemIndexes

    /**
     * Считает и возвращает крайний видимый элемент.
     * Считаем именно по гетеру только при необходимости.
     * Всегда пересчитывать не нужно, т.к. ,например, при скролле это бесмысленно.
     */
    getEdgeVisibleItem(direction: IDirection, topCompensation: number): IEdgeItem {
        return this._getEdgeVisibleItem(direction, topCompensation);
    }

    private _getEdgeVisibleItem(direction: IDirection, topCompensation: number): IEdgeItem {
        const viewportHeight = this._viewportSize;
        const scrollPosition = this._scrollPosition;
        let edgeItemParams: IEdgeItem;

        this._itemsSizes.some((item, index) => {
            const itemBorderBottom = Math.round(item.offset) + Math.round(item.size);

            // при скроле вверх - на границе тот элемент, нижняя граница которого больше чем scrollTop
            let edgeBorder = scrollPosition + topCompensation;
            // при скроле вниз - на границе тот элемент, нижняя граница которого больше scrollTop + viewportHeight
            if (direction === 'forward') {
                // нижняя граница - это верхняя + размер viewPort
                edgeBorder += viewportHeight;
            }
            // запоминаем для восстановления скрола либо граничный элемент, либо просто самый последний.
            if (itemBorderBottom >= edgeBorder || this._itemsSizes.indexOf(item) === this._itemsSizes.length - 1) {
                let borderDistance;
                let border;
                if (direction === 'forward') {
                    // от верхней границы элемента до нижней границы viewPort
                    // считаем так, из нижней границы viewPort вычитаем верхнюю границу элемента
                    const bottomViewportBorder = scrollPosition + viewportHeight;
                    border = 'backward';
                    borderDistance = bottomViewportBorder - item.offset;
                } else {
                    // запись - выше, чем верхняя граница viewPort
                    if (scrollPosition >= item.offset) {
                        border = 'forward';
                        borderDistance = itemBorderBottom - scrollPosition;
                    } else {
                        border = 'backward';
                        borderDistance = scrollPosition - item.offset;
                    }
                }
                edgeItemParams = {
                    index,
                    direction,
                    border,
                    borderDistance
                };
                return true;
            }

            return false;
        });

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

        if (this._hasItemsToDirection(direction)) {
            this._range = shiftRangeBySegment({
                currentRange: this._range,
                direction,
                pageSize: this._virtualScrollConfig.pageSize,
                segmentSize: this._virtualScrollConfig.segmentSize,
                totalCount: this._totalCount
            });

            this._updatePlaceholders(this._range);
        }

        return this._getRangeChangeResult(oldRange, direction);
    }

    /**
     * Возвращает, что в заданном направлении еще есть не отображенные элементы.
     * Используется, чтобы понять нужно ли подгружать данные или нужно сделать ссмещение виртуального скролла.
     * @param direction Направление
     */
    private _hasItemsToDirection(direction: IDirection): boolean {
        return direction === 'backward'
            ? this._range.startIndex > 0
            : this._range.endIndex < (this._totalCount - 1);
    }

    // endregion ShiftRangeToDirection

    // region ShiftRangeByIndex

    /**
     * Смещает виртуальный диапазон к элементу по переданному индексу.
     * @param index Индекс элемента
     */
    shiftRangeToIndex(index: number): ICalculatorResult {
        const oldRange = this._range;
        let direction = null;

        // если элемент уже внутри диапазона, то ничего не делаем.
        if (!this._isItemInRange(index)) {
            direction = index > this._range.endIndex ? 'forward' : 'backward';
            this._range = getRangeByIndex({
                pageSize: this._virtualScrollConfig.pageSize,
                start: 0,
                totalCount: this._totalCount
            });

            this._updatePlaceholders(this._range);
        }

        return this._getRangeChangeResult(oldRange, direction);
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
        const direction = scrollPosition > this._scrollPosition ? 'forward' : 'backward';

        this._range = getRangeByScrollPosition({
            itemsSizes: this._itemsSizes,
            pageSize: this._virtualScrollConfig.pageSize,
            scrollPosition,
            totalCount: this._totalCount,
            triggerOffset: this._triggersOffsets.backward
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange, direction);
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
            segmentSize: count,
            totalCount: this._totalCount
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange, direction);
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

        const result = this.addItems(addPosition, addCount);

        this.removeItems(removePosition, removeCount);

        return this._getRangeChangeResult(oldRange, result.shiftDirection);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * Смещает соответственно виртуальный диапазон.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     */
    removeItems(position: number, count: number): ICalculatorResult {
        const oldRange = this._range;

        const direction = position <= this._range.startIndex ? 'backward' : 'forward';
        this._totalCount -= count;

        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: count,
            totalCount: this._totalCount
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange, direction);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * Пересчитываем виртуальный диапазон, placeholders, сбрасывает старые размеры элементов.
     * @param totalCount Новое кол-во элементов
     */
    resetItems(totalCount: number): ICalculatorResult {
        this._totalCount = totalCount;
        const oldRange = this._range;

        this._totalCount = totalCount;

        if (this._givenItemsSizes) {
            this._range = getRangeByItemsSizes({
                start: 0,
                totalCount: this._totalCount,
                viewportSize: this._viewportSize,
                itemsSizes: this._givenItemsSizes
            });
        } else {
            this._range = getRangeByIndex({
                pageSize: this._virtualScrollConfig.pageSize,
                start: 0,
                totalCount: this._totalCount
            });
        }

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange, 'forward');
    }

    // endregion HandleCollectionChanges

    private _updatePlaceholders(itemsRange: IItemsRange): void {
        // TODO мы в этот момент не знаем размеры элементов, как посчитать placeholders если count > virtualPageSize
        this._placeholders = {
            top: 0,
            bottom: 0
        };
    }

    private _getRangeChangeResult(oldRange: IItemsRange, shiftDirection: IDirection): ICalculatorResult {
        const indexesChanged = oldRange.startIndex !== this._range.startIndex ||
            oldRange.endIndex !== this._range.endIndex;

        return {
            startIndex: this._range.startIndex,
            endIndex: this._range.endIndex,
            indexesChanged,
            shiftDirection,

            hasItemsBackward: this._hasItemsToDirection('backward'),
            hasItemsForward: this._hasItemsToDirection('forward'),
            beforePlaceholderSize: this._placeholders.top,
            afterPlaceholderSize: this._placeholders.bottom,
            environmentChanged: true // todo Calc it!
        };
    }
}
