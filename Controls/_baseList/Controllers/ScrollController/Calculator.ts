import { calculateVirtualRange } from './VirtualScrollUtil';


import { IItemsSizes } from 'Controls/_baseList/Controllers/ScrollController/ItemsSizeController';
import { ITriggersOffset } from 'Controls/_baseList/Controllers/ScrollController/ObserversController';
import { IDirection } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export interface IRangeChangeResult {
    startIndex: number;
    stopIndex: number;

    topEdgeItemIndex: number;
    bottomEdgeItemIndex: number;

    hasItemsBackward: boolean;
    hasItemsForward: boolean;

    topVirtualPlaceholderSize: number;
    bottomVirtualPlaceholderSize: number;

    // todo release it!
    activeElementIndex: number
}

export interface IVirtualScrollCollection {
    setIndexes: (start: number, stop: number) => void;
}

export interface ICalculatorOptions {
    collection: IVirtualScrollCollection;
    itemsSizes: IItemsSizes;
    triggersOffsets: ITriggersOffset;
    scrollTop: number;
    segmentSize: number;
}

export interface IVirtualRange {
    start: number;
    stop: number;
}

interface IVirtualPlaceholders {
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
    private _collection: IVirtualScrollCollection;
    private _itemsSizes: IItemsSizes;
    // TODO для чего он вообще нужен?
    private _triggersOffsets: ITriggersOffset;
    private _segmentSize: number;
    private _scrollTop: number;
    private _range: IVirtualRange;
    private _placeholders: IVirtualPlaceholders;

    constructor(options: ICalculatorOptions) {
        this._collection = options.collection;
        this._itemsSizes = options.itemsSizes;
        this._triggersOffsets = options.triggersOffsets;
        this._scrollTop = options.scrollTop;
        this._segmentSize = options.segmentSize;
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
     * Возвращает текущий виртуальный диапазон
     */
    getVirtualRange(): IVirtualRange {
        return this._range;
    }

    /**
     * Возвращает активный элемент. Активный элемент - это первый видимый элемент во вьюпорте.
     * Используется, чтобы
     *  1. после скролла поставить маркер
     *  2. отправить прикладникам(используется например в двухколоночных реестрах)
     */
    getActiveElementIndex(): number {
        let activeElementIndex = this._range.start;
        let itemsHeight = 0;
        while (itemsHeight < this._scrollTop && activeElementIndex < this._range.stop) {
            itemsHeight += this._itemsSizes[activeElementIndex].height;
            activeElementIndex++;
        }

        if (activeElementIndex < this._range.start || activeElementIndex >= this._range.stop) {
            throw new Error('Calculator::getActiveElementIndex Внутренняя ошибка виртуального скролла.' +
                ' Активный элемент не может быть за пределами virtualRange.');
        }

        return activeElementIndex;
    }

    // endregion Getters/Setters

    // region ShiftRange

    // region ShiftRangeByDirection

    /**
     * Возвращает, что в заданном направлении еще есть не отображенные элементы.
     * Используется, чтобы понять нужно ли подгружать данные или нужно сделать ссмещение виртуального скролла.
     * @param direction Направление
     */
    hasItemsInDirection(direction: IDirection): boolean {
        // TODO в IRangeChangeResult налогичные значения называются hasItemsBackward, нужно свести названия
        // TODO видимо на коллекции нужен метод getCount, чтобы определить что закончились данные вниз
        return direction === 'top'
            ? this._range.start > 0
            : false; // this._range.stop < this._collection.getCount()
    }

    /**
     * Смещает виртуальный диапазон в заданном направлении.
     * Используется при достижении триггера.
     * @param direction Направление, в котором будет смещаться диапазон
     */
    shiftRangeInDirection(direction: IDirection): IRangeChangeResult {
        this._updateVirtualRange();
        return this._getRangeChangeResult();
    }

    // endregion ShiftRangeByDirection

    // region ShiftRangeByIndex

    /**
     * Возвращает, что элемент по переданному index находится внутри виртуального диапазона
     * @param index Индекс элемента
     * @return {boolean}
     */
    isItemInVirtualRange(index: number): boolean {
        return index >= this._range.start && index < this._range.stop;
    }

    /**
     * Смещает виртуальный диапазон к элементу по переданному индексу.
     * @param index Индекс элемента
     */
    updateRangeByIndex(index: number): IRangeChangeResult {
        // TODO наверное стоит переименовать метод по аналогии с shiftRangeInDirection: shiftRangeToIndex
        //  Лучше и shiftRangeInDirection переименовать в shiftRangeToDirection.
        //  Тогда аналогичные методы будут аналогично названы.
        this._updateVirtualRange();
        return this._getRangeChangeResult();
    }

    // endregion ShiftRangeByIndex

    // region ShiftRangeByScrollPosition

    /**
     * Смещает диапазон к переданной позиции скролла.
     * @param scrollPosition Позиция скролла
     */
    shiftRangeToScrollPosition(scrollPosition: number): IRangeChangeResult {
        this._updateVirtualRange();
        return this._getRangeChangeResult();
    }

    // endregion ShiftRangeByScrollPosition

    private _updateVirtualRange(): void {
        this._range = calculateVirtualRange({
            currentVirtualRange: this._range,
            segmentSize: this._segmentSize
        });
        this._collection.setIndexes(this._range.start, this._range.stop);
    }

    // endregion ShiftRange

    // region HandleCollectionChanges

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * При необходимости смещает виртуальный диапазон.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     */
    addItems(position: number, count: number): IRangeChangeResult {
        this._updateVirtualRange();
        return this._getRangeChangeResult();
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param addPosition Индекс элемента, после которого вставили записи
     * @param addCount Кол-во перемещенных элементов
     * @param removePosition Индекс элемента откуда переместили записи
     * @param removeCount Кол-во перемещенных элементов
     */
    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): IRangeChangeResult {
        // TODO по идее addCount и removeCount всегда будет одинаковым(иначе коллекция еще на своем уровне кинет ошибку).
        //  Поэтому можно свести к одному параметру movedCount(count).
        //  И я думаю лучше переименовать addPosition -> newPosition, removePosition -> oldPosition
        this._updateVirtualRange();

        return this._getRangeChangeResult();
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * Смещает соответственно виртуальный диапазон.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     */
    removeItems(position: number, count: number): IRangeChangeResult {
        this._updateVirtualRange();

        return this._getRangeChangeResult();
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * Пересчитываем виртуальный диапазон, placeholders, сбрасывает старые размеры элементов.
     * @param count Новое кол-во элементов
     */
    resetItems(count: number): IRangeChangeResult {
        this._itemsSizes = [];
        // TODO не факт что все элементы поместятся в virtualPageSize
        this._range = {
            start: 0,
            stop: count
        }
        // TODO мы в этот момент не знаем размеры элементов, как посчитать placeholders если count > virtualPageSize
        this._placeholders = {
            top: 0,
            bottom: 0
        }

        return this._getRangeChangeResult();
    }

    // endregion HandleCollectionChanges

    // TODO временно, в каждом методе должен быть уникальный результат только с изменившимися значениями
    private _getRangeChangeResult(): IRangeChangeResult {
        return {
            startIndex: this._range.start,
            stopIndex: this._range.stop,
            topEdgeItemIndex: this._range.start,
            bottomEdgeItemIndex: this._range.stop,
            hasItemsBackward: this.hasItemsInDirection('top'),
            hasItemsForward: this.hasItemsInDirection('down'),
            topVirtualPlaceholderSize: this._placeholders.top,
            bottomVirtualPlaceholderSize: this._placeholders.bottom,
            activeElementIndex: this.getActiveElementIndex()
        }
    }
}
