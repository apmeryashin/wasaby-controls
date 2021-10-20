import {
    shiftRangeBySegment,
    getRangeByIndex,
    getRangeByScrollPosition,
    getActiveElementIndexByPosition
} from './CalculatorUtil';

import type { IVirtualScrollConfig } from 'Controls/_baseList/interface/IVirtualScroll';
import type { IItemsSizes } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController';
import type { ITriggersOffsets } from 'Controls/_baseList/Controllers/ScrollController/ObserversController';
import type {
    IDirection,
    IVisibleItemIndexes,
    IItemsRange,
    IEnvironmentChangedParams,
    IActiveElementIndex
} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export interface IActiveElementIndexChanged extends IActiveElementIndex {
    activeElementIndexChanged: boolean;
}

export interface ICalculatorResult extends
    IItemsRange,
    IEnvironmentChangedParams,
    IActiveElementIndexChanged {
    indexesChanged: boolean;
    environmentChanged: boolean;
}

export interface IShiftRangeToNearbyPageResult extends ICalculatorResult, IVisibleItemIndexes {}

/**
 * Интерфейс опции класса Calculator
 */
export interface ICalculatorOptions {
    itemsSizes: IItemsSizes;

    /**
     * Размеры смещения триггеров. Нужны чтобы избежать лишних отрисовок и сразу же отловить видимость триггера.
     */
    triggersOffsets: ITriggersOffsets;

    scrollTop: number;
    viewportSize: number;

    virtualScrollConfig: IVirtualScrollConfig;
}

/**
 * Интерфейс диапазона отображаемых элементов.
 * start, end - индексы элементов включительно
 */
export interface IRange {
    start: number;
    end: number;
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
    private _triggersOffsets: ITriggersOffsets;
    private _virtualScrollConfig: IVirtualScrollConfig;
    private _scrollTop: number;
    private _viewportSize: number;
    private _totalCount: number;
    private _range: IRange = { start: 0, end: 0 };
    private _placeholders: IPlaceholders = { top: 0, bottom: 0 };
    private _activeElementIndex: number;

    constructor(options: ICalculatorOptions) {
        this._itemsSizes = options.itemsSizes;
        this._triggersOffsets = options.triggersOffsets;
        this._scrollTop = options.scrollTop;
        this._viewportSize = options.viewportSize;
        this._virtualScrollConfig = options.virtualScrollConfig; // TODO нужно избавитсья от понятия виртуализации
    }

    // region Getters/Setters

    /**
     * Устанавливает новые размеры элементов
     * @param itemsSizes
     */
    updateItemsSizes(itemsSizes: IItemsSizes): void {
        this._itemsSizes = itemsSizes;
    }

    // endregion Getters/Setters

    // region ShiftRangeToDirection

    /**
     * Смещает виртуальный диапазон в заданном направлении.
     * Используется при достижении триггера.
     * @param direction Направление, в котором будет смещаться диапазон
     */
    shiftRangeToDirection(direction: IDirection): ICalculatorResult {
        const oldRange = this._range;

        // если в заданном направлении больше нет элементов, то ничего не делаем
        if (!this._hasItemsToDirection(direction, this._totalCount)) {
            return this._getRangeChangeResult(oldRange);
        }

        const newRange = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: this._virtualScrollConfig.segmentSize,
            totalCount: this._totalCount
        });
        return this._getRangeChangeResult(newRange);
    }

    /**
     * Возвращает, что в заданном направлении еще есть не отображенные элементы.
     * Используется, чтобы понять нужно ли подгружать данные или нужно сделать ссмещение виртуального скролла.
     * @param direction Направление
     * @param totalCount Общее кол-во элементов в коллекции
     */
    private _hasItemsToDirection(direction: IDirection, totalCount: number): boolean {
        return direction === 'backward'
            ? this._range.start > 0
            : this._range.end < (totalCount - 1);
    }

    // endregion ShiftRangeToDirection

    // region ShiftRangeToNearbyPage

    shiftRangeToNearbyPage(direction: IDirection): IShiftRangeToNearbyPageResult {
        const oldRange = this._range;

        const calculatorResult = this._getRangeChangeResult(oldRange);

        const firstVisibleItemIndex = 0; // todo release it
        const lastVisibleItemIndex = 10; // todo release it

        return {
            ...calculatorResult,
            firstVisibleItemIndex,
            lastVisibleItemIndex
        };
    }

    // endregion ShiftRangeToNearbyPage

    // region ShiftRangeByIndex

    /**
     * Смещает виртуальный диапазон к элементу по переданному индексу.
     * @param index Индекс элемента
     * @param totalCount Общее кол-во элементов
     */
    shiftRangeToIndex(index: number): ICalculatorResult {
        const oldRange = this._range;

        // если элемент уже внутри диапазона, то ничего не делаем.
        if (!this._isItemInRange(index)) {
            this._range = getRangeByIndex({
                pageSize: this._virtualScrollConfig.pageSize,
                start: 0,
                totalCount: this._totalCount
            });

            this._updatePlaceholders(this._range);
        }

        return this._getRangeChangeResult(oldRange);
    }

    /**
     * Возвращает, что элемент по переданному index находится внутри виртуального диапазона
     * @param index Индекс элемента
     * @return {boolean}
     */
    private _isItemInRange(index: number): boolean {
        return index >= this._range.start && index < this._range.end;
    }

    // endregion ShiftRangeByIndex

    // region ShiftRangeByScrollPosition

    /**
     * Смещает диапазон к переданной позиции скролла.
     * @param scrollPosition Позиция скролла
     */
    shiftRangeToScrollPosition(scrollPosition: number): ICalculatorResult {
        const oldRange = this._range;

        this._range = getRangeByScrollPosition({
            itemsSizes: this._itemsSizes,
            pageSize: this._virtualScrollConfig.pageSize,
            scrollPosition,
            totalCount: this._totalCount,
            triggerOffset: this._triggersOffsets.top
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange);
    }

    // endregion ShiftRangeByScrollPosition

    // region ShiftActiveElementIndexToScrollPosition

    /**
     * Пересчитывает индекс активного элемента от текущей позиции скролла
     * @param scrollPosition Позиция скролла
     */
    shiftActiveElementIndexToScrollPosition(scrollPosition: number): IActiveElementIndexChanged {
        const oldActiveElementIndex = this._activeElementIndex;

        this._activeElementIndex = getActiveElementIndexByPosition({
            itemsSizes: this._itemsSizes,
            pageSize: this._virtualScrollConfig.pageSize,
            scrollPosition,
            totalCount: this._totalCount,
            triggerOffset: this._triggersOffsets.top
        });

        return {
            activeElementIndex: this._activeElementIndex,
            activeElementIndexChanged: oldActiveElementIndex !== this._activeElementIndex
        };
    }

    // endregion ShiftRangeByScrollPosition

    // region HandleCollectionChanges

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * При необходимости смещает виртуальный диапазон.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     * @param predicatedDirection заранее высчитанное направление добавления (необходимо при вызове prepend и append)
     */
    addItems(position: number, count: number, predicatedDirection: IDirection): ICalculatorResult {
        const oldRange = this._range;
        const direction = predicatedDirection || (position <= this._range.start ? 'backward' : 'forward');

        this._totalCount += count;

        if (direction === 'backward' && predicatedDirection) {
            this._range.start = Math.min(this._totalCount, this._range.start + count);
            this._range.end = Math.min(this._totalCount, this._range.end + count);
        }

        // todo FIX IT
        /*if (predicatedDirection) {
            this._savedDirection = predicatedDirection;
        }*/

        //if (!predicatedDirection && triggerState[direction]) {
        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: count,
            totalCount: this._totalCount
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange);
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param addPosition Индекс элемента, после которого вставили записи
     * @param addCount Кол-во добавляемых элементов
     * @param removePosition Индекс элемента откуда переместили записи
     * @param removeCount Кол-во удаляемых элементов
     * @param direction Направление перемещения
     */
    moveItems(addPosition: number,
              addCount: number,
              removePosition: number,
              removeCount: number,
              direction: IDirection): ICalculatorResult {
        const oldRange = this._range;

        this.addItems(
            addPosition,
            addCount,
            direction
        );

        this.removeItems(removePosition, removeCount);

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * Смещает соответственно виртуальный диапазон.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     */
    removeItems(position: number, count: number): ICalculatorResult {
        const oldRange = this._range;

        const direction = position <= this._range.start ? 'backward' : 'forward';
        this._totalCount -= count;

        this._range = shiftRangeBySegment({
            currentRange: this._range,
            direction,
            pageSize: this._virtualScrollConfig.pageSize,
            segmentSize: count,
            totalCount: this._totalCount
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * Пересчитываем виртуальный диапазон, placeholders, сбрасывает старые размеры элементов.
     * @param totalCount Новое кол-во элементов
     */
    resetItems(totalCount: number): ICalculatorResult {
        const oldRange = this._range;

        this._totalCount = totalCount;

        this._range = getRangeByIndex({
            pageSize: this._virtualScrollConfig.pageSize,
            start: 0,
            totalCount: this._totalCount
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange);
    }

    // endregion HandleCollectionChanges

    private _updatePlaceholders(itemsRange: IRange): void {
        // TODO мы в этот момент не знаем размеры элементов, как посчитать placeholders если count > virtualPageSize
        this._placeholders = {
            top: 0,
            bottom: 0
        };
    }

    private _getRangeChangeResult(oldRange: IRange): ICalculatorResult {
        return {
            startIndex: this._range.start,
            endIndex: this._range.end,
            indexesChanged: oldRange.start !== this._range.start || oldRange.end !== this._range.end,

            hasItemsBackward: this._hasItemsToDirection('backward', this._totalCount),
            hasItemsForward: this._hasItemsToDirection('forward', this._totalCount),
            beforePlaceholderSize: this._placeholders.top,
            afterPlaceholderSize: this._placeholders.bottom,
            environmentChanged: true, // todo Calc it!

            activeElementIndex: this._activeElementIndex,
            activeElementIndexChanged: true // todo Calc it!
        };
    }
}
