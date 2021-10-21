import {
    getActiveElementIndexByPosition,
    getRangeByIndex,
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
    IEnvironmentChangedParams,
    IActiveElementIndexChanged {
    indexesChanged: boolean;
    environmentChanged: boolean;
}

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
    totalCount: number;

    virtualScrollConfig: IVirtualScrollConfig;
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
    private _range: IItemsRange = { startIndex: 0, endIndex: 0 };
    private _placeholders: IPlaceholders = { top: 0, bottom: 0 };
    private _activeElementIndex: number;

    constructor(options: ICalculatorOptions) {
        this._itemsSizes = options.itemsSizes;
        this._triggersOffsets = options.triggersOffsets;
        this._scrollTop = options.scrollTop;
        this._totalCount = options.totalCount;
        this._viewportSize = options.viewportSize;
        this._virtualScrollConfig = options.virtualScrollConfig; // TODO нужно избавитсья от понятия виртуализации
    }

    // region Getters/Setters

    getRange(): IItemsRange {
        return this._range;
    }

    setTriggerOffsets(triggerOffset: ITriggersOffsets): void {
        this._triggersOffsets = triggerOffset;
    }

    setViewportSize(viewportSize: number): void {
        if (this._viewportSize !== viewportSize) {
            this._viewportSize = viewportSize;
        }
    }

    /**
     * Устанавливает новые размеры элементов
     * @param itemsSizes
     */
    updateItemsSizes(itemsSizes: IItemsSizes): void {
        this._itemsSizes = itemsSizes;
    }

    getScrollTopToEdgeItem(edgeItem: IEdgeItem): number {
        // компенсируем расчёты в соответствии с размерами контента до контейнера с итемами
        // const compensation = getOffsetTop(itemsContainer);

        let scrollTop = 0;

        const item = this._itemsSizes.find((it) => it.key === edgeItem.key);
        if (item) {
            if (edgeItem.direction === 'backward') {
                if (edgeItem.border === 'forward') {
                    scrollTop = item.offsetTop + (item.height - edgeItem.borderDistance);
                } else {
                    scrollTop = item.offsetTop + edgeItem.borderDistance;
                }
            } else {
                const viewportHeight = this._viewportSize;
                scrollTop = item.offsetTop + edgeItem.borderDistance - viewportHeight;
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
    getEdgeVisibleItem(direction: IDirection): IEdgeItem {
        return this._getEdgeVisibleItem(direction);
    }

    private _getEdgeVisibleItem(direction: IDirection): IEdgeItem {
        const viewportHeight = this._viewportSize;

        // компенсируем расчёты в соответствии с размерами контента до контейнера с итемами
        // TODO нет доступа к дому.
        const topCompensation = 0;
        /*const scrollContent = itemsContainer.closest('.controls-Scroll-ContainerBase__content');
        const topCompensation = scrollContent ?
            (scrollContent.getBoundingClientRect().top - itemsContainer.getBoundingClientRect().top) :
            getOffsetTop(itemsContainer);*/
        const scrollTop = this._scrollTop;

        let edgeItemParams: IEdgeItem;

        this._itemsSizes.some((item) => {
            // TODO у нас нет доступа к дом элементу
            // if (item.className.includes('controls-ListView__hiddenContainer')) {
            //     return false;
            // }

            const itemBorderBottom = Math.round(item.offsetTop) + Math.round(item.height);

            // при скроле вверх - на границе тот элемент, нижняя граница которого больше чем scrollTop
            let edgeBorder = scrollTop + topCompensation;
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
                    const bottomViewportBorder = scrollTop + viewportHeight;
                    border = 'backward';
                    borderDistance = bottomViewportBorder - item.offsetTop;
                } else {
                    // запись - выше, чем верхняя граница viewPort
                    if (scrollTop >= item.offsetTop) {
                        border = 'forward';
                        borderDistance = itemBorderBottom - scrollTop;
                    } else {
                        border = 'backward';
                        borderDistance = scrollTop - item.offsetTop;
                    }
                }
                edgeItemParams = {
                    key: item.key,
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
     * Смещает диапазон к переданной позиции скролла.
     * @param scrollPosition Позиция скролла
     */
    shiftRangeToScrollPosition(scrollPosition: number): ICalculatorResult {
        const oldRange = this._range;
        const direction = scrollPosition > this._scrollTop ? 'forward' : 'backward';

        this._range = getRangeByScrollPosition({
            itemsSizes: this._itemsSizes,
            pageSize: this._virtualScrollConfig.pageSize,
            scrollPosition,
            totalCount: this._totalCount,
            triggerOffset: this._triggersOffsets.top
        });

        this._updatePlaceholders(this._range);

        return this._getRangeChangeResult(oldRange, direction);
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

    // endregion ShiftActiveElementIndexToScrollPosition

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
        const direction = predicatedDirection || (position <= this._range.startIndex ? 'backward' : 'forward');

        this._totalCount += count;

        if (direction === 'backward' && predicatedDirection) {
            this._range.startIndex = Math.min(this._totalCount, this._range.startIndex + count);
            this._range.endIndex = Math.min(this._totalCount, this._range.endIndex + count);
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

        return this._getRangeChangeResult(oldRange, direction);
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

        return this._getRangeChangeResult(oldRange, direction);
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

        this._range = getRangeByIndex({
            pageSize: this._virtualScrollConfig.pageSize,
            start: 0,
            totalCount: this._totalCount
        });

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
        return {
            startIndex: this._range.startIndex,
            endIndex: this._range.endIndex,
            indexesChanged: oldRange.startIndex !== this._range.startIndex || oldRange.endIndex !== this._range.endIndex,
            shiftDirection,

            hasItemsBackward: this._hasItemsToDirection('backward'),
            hasItemsForward: this._hasItemsToDirection('forward'),
            beforePlaceholderSize: this._placeholders.top,
            afterPlaceholderSize: this._placeholders.bottom,
            environmentChanged: true, // todo Calc it!

            activeElementIndex: this._activeElementIndex,
            activeElementIndexChanged: true // todo Calc it!
        };
    }
}
