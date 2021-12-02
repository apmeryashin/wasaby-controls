import {
    IItemsSizes,
    IAbstractItemsSizesControllerOptions,
    AbstractItemsSizesController
} from './ItemsSizeController/AbstractItemsSizeController';
import {
    IAbstractObserversControllerBaseOptions,
    IAbstractObserversControllerOptions,
    AbstractObserversController,
    TIntersectionEvent,
    ITriggersVisibility
} from './ObserverController/AbstractObserversController';
import {
    Calculator,
    IActiveElementIndexChanged,
    ICalculatorBaseOptions,
    ICalculatorResult
} from './Calculator';
import {CrudEntityKey} from 'Types/source';

export interface IItemsRange {
    startIndex: number;
    endIndex: number;
}

/**
 * Интерфейс, описывающий параметры колбэка об изменении индексов(диапазона отображаемых элементов)
 * @remark
 * oldRange, oldPlaceholders - нужны чтобы правильно посчитать крайний видимый элемент
 * на _beforeRender для восстановления скролла
 */
export interface IIndexesChangedParams {
    shiftDirection: IDirection;
    range: IItemsRange;
    oldRange: IItemsRange;
    oldPlaceholders: IPlaceholders;
}

export interface IActiveElementIndex {
    activeElementIndex: number;
}

export type IScheduledScrollType = 'restoreScroll' | 'calculateRestoreScrollParams' | 'scrollToElement';

export interface IEdgeItem {
    index: number;
    direction: IDirection;
    border: IDirection;
    borderDistance: number;
}

/**
 * Интерфейс, описывающий параметры для подсчтеа крайнего видимого элемента
 * @remark
 * range, placeholders, itemsSizes - не обязательные параметры. Если их не задать, то будут использоваться
 * текущие значения. Задвать нужно только для восстановления скролла, т.к. восстанавливать скролл нужно
 * исходя из старого состояния.
 */
export interface IEdgeItemCalculatingParams {
    direction: IDirection;
    range?: IItemsRange;
    placeholders?: IPlaceholders;
}

export interface IScheduledScrollToElementParams {
    key: CrudEntityKey;
    position: string;
    force: boolean;
}

export interface IScheduledScrollParams {
    type: IScheduledScrollType;
    params: IEdgeItem | IScheduledScrollToElementParams | IEdgeItemCalculatingParams;
}

export interface IPlaceholders {
    backward: number;
    forward: number;
}

export interface IHasItemsOutRange {
    backward: boolean;
    forward: boolean;
}

export type IDirection = 'backward' | 'forward';

export type IPageDirection = 'backward' | 'forward' | 'start' | 'end';

export type IIndexesChangedCallback = (params: IIndexesChangedParams) => void;

export type IActiveElementChangedChangedCallback = (activeElementIndex: number) => void;

export type IItemsEndedCallback = (direction: IDirection) => void;

export type IIndexesInitializedCallback = (range: IItemsRange) => void;

export type IHasItemsOutRangeChangedCallback = (hasItems: IHasItemsOutRange) => void;

export type IPlaceholdersChangedCallback = (placeholders: IPlaceholders) => void;

export interface IScrollControllerOptions extends
    IAbstractItemsSizesControllerOptions,
    IAbstractObserversControllerBaseOptions,
    ICalculatorBaseOptions {
    observerControllerConstructor: new (options: IAbstractObserversControllerOptions) => AbstractObserversController;
    itemsSizeControllerConstructor: new (options: IAbstractItemsSizesControllerOptions) => AbstractItemsSizesController;
    indexesInitializedCallback: IIndexesInitializedCallback;
    indexesChangedCallback: IIndexesChangedCallback;
    activeElementChangedCallback?: IActiveElementChangedChangedCallback;
    hasItemsOutRangeChangedCallback?: IHasItemsOutRangeChangedCallback;
    placeholdersChangedCallback: IPlaceholdersChangedCallback;
    itemsEndedCallback?: IItemsEndedCallback;
}

/**
 * Класс предназначен для управления scroll и обеспечивает:
 *   - генерацию событий о достижении границ контента (работа с триггерами);
 *   - scroll к записи / к границе (при необходимости - пересчёт range);
 *   - сохранение / восстановление позиции scroll.
 */
export class ScrollController {
    private readonly _itemsSizesController: AbstractItemsSizesController;
    private readonly _observersController: AbstractObserversController;
    private readonly _calculator: Calculator;
    private readonly _indexesChangedCallback: IIndexesChangedCallback;
    private readonly _activeElementChangedCallback: IActiveElementChangedChangedCallback;
    private readonly _hasItemsOutRangeChangedCallback: IHasItemsOutRangeChangedCallback;
    private readonly _placeholdersChangedCallback: IPlaceholdersChangedCallback;
    private readonly _itemsEndedCallback: IItemsEndedCallback;
    private readonly _indexesInitializedCallback: IIndexesInitializedCallback;

    constructor(options: IScrollControllerOptions) {
        this._indexesChangedCallback = options.indexesChangedCallback;
        this._hasItemsOutRangeChangedCallback = options.hasItemsOutRangeChangedCallback;
        this._placeholdersChangedCallback = options.placeholdersChangedCallback;
        this._activeElementChangedCallback = options.activeElementChangedCallback;
        this._itemsEndedCallback = options.itemsEndedCallback;
        this._indexesInitializedCallback = options.indexesInitializedCallback;

        this._itemsSizesController = new options.itemsSizeControllerConstructor({
            itemsContainer: options.itemsContainer,
            itemsQuerySelector: options.itemsQuerySelector,
            totalCount: options.totalCount
        });

        this._observersController = new options.observerControllerConstructor({
            listControl: options.listControl,
            listContainer: options.listContainer,
            triggersQuerySelector: options.triggersQuerySelector,
            viewportSize: options.viewportSize,
            triggersVisibility: options.triggersVisibility,
            backwardTriggerOffsetCoefficient: options.backwardTriggerOffsetCoefficient,
            forwardTriggerOffsetCoefficient: options.forwardTriggerOffsetCoefficient,
            observersCallback: this._observersCallback.bind(this)
        });

        // корректируем скролл на размер контента до списка
        const beforeContentSize = this._itemsSizesController.getBeforeContentSize();
        // если скролл меньше размера контента до списка, то это значит что сам список еще не проскроллен
        const givenScrollPosition = options.scrollPosition || 0;
        const scrollPosition = givenScrollPosition < beforeContentSize
            ? 0
            : givenScrollPosition - beforeContentSize;
        this._calculator = new Calculator({
            triggersOffsets: this._observersController.getTriggersOffsets(),
            itemsSizes: this._itemsSizesController.getItemsSizes(),
            scrollPosition,
            totalCount: options.totalCount,
            virtualScrollConfig: options.virtualScrollConfig,
            viewportSize: options.viewportSize,
            contentSize: options.contentSize,
            givenItemsSizes: options.givenItemsSizes
        });

        this._indexesInitializedCallback(this._calculator.getRange());
    }

    viewportResized(viewportSize: number): void {
        const triggerOffsets = this._observersController.setViewportSize(viewportSize);
        this._calculator.setTriggerOffsets(triggerOffsets);
        this._calculator.setViewportSize(viewportSize);

        this._updateItemsSizes();
    }

    getElement(key: CrudEntityKey): HTMLElement {
        return this._itemsSizesController.getElement(key);
    }

    // region Triggers

    setTriggersVisibility(triggersVisibility: ITriggersVisibility): void {
        this._observersController.setTriggersVisibility(triggersVisibility);
    }

    // endregion Triggers

    // region Update DOM elements

    /**
     * Обновить контейнер с элементами. Также пересчитывает размеры отображаемых в данный момент элементов.
     * @param {HTMLElement} newItemsContainer
     */
    setItemsContainer(newItemsContainer: HTMLElement): void {
        this._itemsSizesController.setItemsContainer(newItemsContainer);
        this._itemsSizesController.resetItems(this._calculator.getTotalItemsCount());

        const newItemsSizes = this._itemsSizesController.updateItemsSizes(this._calculator.getRange());
        this._calculator.updateItemsSizes(newItemsSizes);
    }

    /**
     * Обновить селектор элементов. Также пересчитывает размеры отображаемых в данный момент элементов.
     * @param {string} newItemsQuerySelector
     */
    setItemsQuerySelector(newItemsQuerySelector: string): void {
        this._itemsSizesController.setItemsQuerySelector(newItemsQuerySelector);
        this._itemsSizesController.resetItems(this._calculator.getTotalItemsCount());

        const newItemsSizes = this._itemsSizesController.updateItemsSizes(this._calculator.getRange());
        this._calculator.updateItemsSizes(newItemsSizes);
    }

    /**
     * Обновить контейнер списочного контрола. Также производит реинициализацию observers.
     * @param {HTMLElement} newListContainer
     */
    setListContainer(newListContainer: HTMLElement): void {
        this._observersController.setListContainer(newListContainer);
    }

    /**
     * Обновить селектор триггеров. Также производит реинициализацию observers.
     * @param {string} newTriggersQuerySelector
     */
    setTriggersQuerySelector(newTriggersQuerySelector: string): void {
        this._observersController.setTriggersQuerySelector(newTriggersQuerySelector);
    }

    // endregion Update DOM elements

    // region Update items sizes

    updateItemsSizes(itemsRange: IItemsRange): void {
        this._updateItemsSizes(itemsRange);
    }

    updateGivenItemsSizes(itemsSizes: IItemsSizes): void {
        this._calculator.updateGivenItemsSizes(itemsSizes);
    }

    contentResized(contentSize: number): void {
        this._updateItemsSizes();
        this._calculator.setContentSize(contentSize);
    }

    private _updateItemsSizes(itemsRange?: IItemsRange): void {
        const range = itemsRange || this._calculator.getRange();
        const newItemsSizes = this._itemsSizesController.updateItemsSizes(range);
        this._calculator.updateItemsSizes(newItemsSizes);
    }

    // endregion Update items sizes

    // region Collection changes

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     */
    addItems(position: number, count: number): void {
        const itemsSizes = this._itemsSizesController.addItems(position, count);
        this._calculator.updateItemsSizes(itemsSizes);

        const result = this._calculator.addItems(position, count);
        this._processCalculatorResult(result);
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param addPosition Индекс элемента, после которого вставили записи
     * @param addCount Кол-во добавляемых элементов
     * @param removePosition Индекс элемента откуда переместили записи
     * @param removeCount Кол-во удаляемых элементов
     */
    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): void {
        const itemsSizes = this._itemsSizesController.moveItems(addPosition, addCount, removePosition, removeCount);
        this._calculator.updateItemsSizes(itemsSizes);

        const result = this._calculator.moveItems(addPosition, addCount, removePosition, removeCount);
        this._processCalculatorResult(result);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     */
    removeItems(position: number, count: number): void {
        const itemsSizes = this._itemsSizesController.removeItems(position, count);
        this._calculator.updateItemsSizes(itemsSizes);

        const result = this._calculator.removeItems(position, count);
        this._processCalculatorResult(result);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * @param totalCount Общее кол-во элементов в коллекции
     * @param keepPosition Нужно ли сохранить текущию позицию
     */
    resetItems(totalCount: number, keepPosition: boolean): void {
        const triggerOffsets = this._observersController.resetItems(totalCount);
        this._calculator.setTriggerOffsets(triggerOffsets);

        const itemsSizes = this._itemsSizesController.resetItems(totalCount);
        this._calculator.updateItemsSizes(itemsSizes);

        const result = this._calculator.resetItems(totalCount, keepPosition);
        this._processCalculatorResult(result);
    }

    // endregion Collection changes

    // region Scroll

    /**
     * Возвращает крайний видимый элемент
     * @param params
     */
    getEdgeVisibleItem(params: IEdgeItemCalculatingParams): IEdgeItem {
        return this._calculator.getEdgeVisibleItem(params);
    }

    getScrollPositionToEdgeItem(edgeItem: IEdgeItem): number {
        const beforeContentSize = this._itemsSizesController.getBeforeContentSize();
        const scrollPosition = this._calculator.getScrollPositionToEdgeItem(edgeItem);
        return edgeItem.direction === 'forward' ? scrollPosition + beforeContentSize : scrollPosition;
    }

    /**
     * Скроллит к элементу по переданному индексу.
     * При необходимости смещает диапазон.
     * @param itemIndex Индекс элемента, к которому нужно проскроллить.
     * @return {boolean} Изменился ли диапазон отображаемых записей.
     */
    scrollToItem(itemIndex: number): boolean {
        // TODO не забыть про InertialScrolling
        const rangeResult = this._calculator.shiftRangeToIndex(itemIndex);
        return rangeResult.indexesChanged;
    }

    /**
     * Сдвигает диапазон отображаемых элементов к позиции скролла.
     * Используется при нажатии в скролбар в позицию, где записи уже скрыты виртуальным скроллом.
     * @param position Позиция скролла.
     */
    scrollToVirtualPosition(position: number): void {
        const result = this._calculator.shiftRangeToVirtualScrollPosition(position);
        this._processCalculatorResult(result);
    }

    /**
     * Обрабатывает изменение позиции при скролле.
     * Используется при обычном скролле списка.
     * @param position
     */
    scrollPositionChange(position: number): void {
        const result = this._calculator.scrollPositionChange(position);
        this._processActiveElementIndexChanged(result);
    }

    // endregion Scroll

    // region Private API

    /**
     * Callback, вызываемый при достижении триггера.
     * Вызывает сдвиг itemsRange в направлении триггера.
     * В зависимости от результатов сдвига itemsRange вызывает indexesChangedCallback или itemsEndedCallback.
     * @param {TIntersectionEvent} eventName
     * @private
     */
    private _observersCallback(eventName: TIntersectionEvent): void {
        if (eventName === 'bottomOut' || eventName === 'topOut') {
            return;
        }

        // НЕЛЬЗЯ делать рассчеты связанные со scrollPosition.
        // Т.к. в момент срабатывания триггера scrollPosition может быть не актуален.
        // Актуальное значение прийдет только после триггера в событии scrollMoveSync.
        // Выходит след-ая цепочка вызовов: scrollMoveSync -> observerCallback -> scrollMoveSync.

        let direction: IDirection;
        if (eventName === 'bottomIn') {
            direction = 'forward';
        }
        if (eventName === 'topIn') {
            direction = 'backward';
        }

        const result = this._calculator.shiftRangeToDirection(direction);
        this._processCalculatorResult(result);

        // после первого срабатывания триггера сбрасываем флаг resetTriggerOffset.
        // Чтобы дальше триггер срабатывал заранее за счет оффсета.
        let triggerOffsets;
        if (direction === 'forward') {
            triggerOffsets = this._observersController.setResetForwardTriggerOffset(false);
        } else {
            triggerOffsets = this._observersController.setResetBackwardTriggerOffset(false);
        }
        this._calculator.setTriggerOffsets(triggerOffsets);
        // TODO триггер может сразу стать виден, но это вызовет точно 2 перерисовки.
        //  нужно подумать, можно ли исправить. По идее мы не знаем размеры элементов.

        // itemsEndedCallback должен вызываться ТОЛЬКО ТУТ, загрузка осуществляется ТОЛЬКО по достижению триггера
        if (!result.indexesChanged) {
            if (this._itemsEndedCallback) {
                this._itemsEndedCallback(direction);
            }
        }
    }

    /**
     * При изменении activeElementIndex обеспечивает activeElementChangedCallback.
     * @param {IActiveElementIndexChanged} result
     * @private
     */
    private _processActiveElementIndexChanged(result: IActiveElementIndexChanged): void {
        if (result.activeElementIndexChanged) {
            if (this._activeElementChangedCallback) {
                this._activeElementChangedCallback(result.activeElementIndex);
            }
        }
    }

    /**
     * В зависимости от результатов сдвига itemsRange вызывает indexesChangedCallback.
     * Также, по необходимости, обеспечивает вызов activeElementChangedCallback.
     * @param {ICalculatorResult} result
     * @private
     */
    private _processCalculatorResult(result: ICalculatorResult): void {
        if (result.placeholdersChanged) {
            this._placeholdersChangedCallback({
                backward: result.backwardPlaceholderSize,
                forward: result.forwardPlaceholderSize
            });
        }

        if (result.hasItemsOutRangeChanged) {
            if (this._hasItemsOutRangeChangedCallback) {
                this._hasItemsOutRangeChangedCallback({
                    backward: result.hasItemsOutRangeBackward,
                    forward: result.hasItemsOutRangeForward
                });
            }
        }

        if (result.indexesChanged) {
            this._indexesChangedCallback({
                range: result.range,
                oldRange: result.oldRange,
                oldPlaceholders: result.oldPlaceholders,
                shiftDirection: result.shiftDirection
            });
        }
    }

    // endregion Private API
}
