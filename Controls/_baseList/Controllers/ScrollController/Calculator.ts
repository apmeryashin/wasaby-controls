import { calculateVirtualRange } from './VirtualScrollUtil';

import { IItemsSizes } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController';
import { ITriggersOffset } from 'Controls/_baseList/Controllers/ScrollController/ObserversController';
import type { IDirection } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import { IVirtualScrollConfig } from 'Controls/_baseList/interface/IVirtualScroll';

export interface IRangeChangeResult {
    startIndex: number;
    endIndex: number;

    hasItemsBackward: boolean;
    hasItemsForward: boolean;

    beforePlaceholderSize: number;
    afterPlaceholderSize: number;

    indexesChanged: boolean;

    // todo release it!
    activeElementIndex: number
}

/**
 * Интерфейс опции класса Calculator
 */
export interface ICalculatorOptions {
    itemsSizes: IItemsSizes;

    /**
     * Размеры смещения триггеров. Нужны чтобы избежать лишних отрисовок и сразу же отловить видимость триггера.
     */
    triggersOffsets: ITriggersOffset;

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
    private _triggersOffsets: ITriggersOffset;
    private _virtualScrollConfig: IVirtualScrollConfig;
    private _scrollTop: number;
    private _viewportSize: number;
    private _range: IRange;
    private _placeholders: IPlaceholders;

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
    setItemsSizes(itemsSizes: IItemsSizes): void {
        this._itemsSizes = itemsSizes;
    }

    /**
     * Возвращает активный элемент. Активный элемент - это элемент, который находится по середине вьюпорта.
     */
    getActiveElementIndex(): number {
        // TODO взять старую реализацию
        return 0;
    }

    // endregion Getters/Setters

    // region ShiftRange

    // region ShiftRangeByDirection

    /**
     * Смещает виртуальный диапазон в заданном направлении.
     * Используется при достижении триггера.
     * @param direction Направление, в котором будет смещаться диапазон
     * @param totalCount Общее кол-во элементов в коллекции
     */
    shiftRangeToDirection(direction: IDirection, totalCount: number): IRangeChangeResult {
        const oldRange = this._range;

        // если в заданном направлении больше нет элементов, то ничего не делаем
        if (!this._hasItemsToDirection(direction, totalCount)) {
            return this._getRangeChangeResult(oldRange, totalCount);
        }

        this._updateVirtualRange();
        return this._getRangeChangeResult(oldRange, totalCount);
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

    // endregion ShiftRangeByDirection

    // region ShiftRangeByIndex

    /**
     * Смещает виртуальный диапазон к элементу по переданному индексу.
     * @param index Индекс элемента
     * @param totalCount Общее кол-во элементов в коллекции
     */
    shiftRangeToIndex(index: number, totalCount: number): IRangeChangeResult {
        const oldRange = this._range;

        // если элемент уже внутри диапазона, то ничего не делаем.
        if (this._isItemInVirtualRange(index)) {
            return this._getRangeChangeResult(oldRange, totalCount);
        }

        this._updateVirtualRange();
        return this._getRangeChangeResult(oldRange, totalCount);
    }

    /**
     * Возвращает, что элемент по переданному index находится внутри виртуального диапазона
     * @param index Индекс элемента
     * @return {boolean}
     */
    private _isItemInVirtualRange(index: number): boolean {
        return index >= this._range.start && index < this._range.end;
    }

    // endregion ShiftRangeByIndex

    // region ShiftRangeByScrollPosition

    /**
     * Смещает диапазон к переданной позиции скролла.
     * @param scrollPosition Позиция скролла
     * @param totalCount Общее кол-во элементов в коллекции
     */
    shiftRangeToScrollPosition(scrollPosition: number, totalCount: number): IRangeChangeResult {
        const oldRange = this._range;
        this._updateVirtualRange();
        return this._getRangeChangeResult(oldRange, totalCount);
    }

    // endregion ShiftRangeByScrollPosition

    private _updateVirtualRange(): void {
        this._range = calculateVirtualRange({
            currentVirtualRange: this._range,
            segmentSize: this._virtualScrollConfig.segmentSize
        });
    }

    // endregion ShiftRange

    // region HandleCollectionChanges

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * При необходимости смещает виртуальный диапазон.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     * @param totalCount Общее кол-во элементов в коллекции
     */
    addItems(position: number, count: number, totalCount: number): IRangeChangeResult {
        const oldRange = this._range;
        this._updateVirtualRange();
        return this._getRangeChangeResult(oldRange, totalCount);
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param newPosition Индекс элемента, после которого вставили записи
     * @param oldPosition Индекс элемента откуда переместили записи
     * @param movedCount Кол-во перемещенных элементов
     * @param totalCount Общее кол-во элементов в коллекции
     */
    moveItems(newPosition: number, oldPosition: number, movedCount: number, totalCount: number): IRangeChangeResult {
        const oldRange = this._range;

        this._updateVirtualRange();

        return this._getRangeChangeResult(oldRange, totalCount);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * Смещает соответственно виртуальный диапазон.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     * @param totalCount Общее кол-во элементов в коллекции
     */
    removeItems(position: number, count: number, totalCount: number): IRangeChangeResult {
        const oldRange = this._range;

        this._updateVirtualRange();

        return this._getRangeChangeResult(oldRange, totalCount);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * Пересчитываем виртуальный диапазон, placeholders, сбрасывает старые размеры элементов.
     * @param count Новое кол-во элементов
     */
    resetItems(count: number): IRangeChangeResult {
        const oldRange = this._range;

        this.setItemsSizes([]);
        // TODO не факт что все элементы поместятся в virtualPageSize
        this._range = {
            start: 0,
            end: count
        }
        // TODO мы в этот момент не знаем размеры элементов, как посчитать placeholders если count > virtualPageSize
        this._placeholders = {
            top: 0,
            bottom: 0
        }

        return this._getRangeChangeResult(oldRange, count);
    }

    // endregion HandleCollectionChanges

    private _getRangeChangeResult(oldRange: IRange, totalCount: number): IRangeChangeResult {
        return {
            startIndex: this._range.start,
            endIndex: this._range.end,
            hasItemsBackward: this._hasItemsToDirection('backward', totalCount),
            hasItemsForward: this._hasItemsToDirection('forward', totalCount),
            beforePlaceholderSize: this._placeholders.top,
            afterPlaceholderSize: this._placeholders.bottom,
            activeElementIndex: this.getActiveElementIndex(),
            indexesChanged: oldRange.start !== this._range.start || oldRange.end !== this._range.end
        }
    }
}
