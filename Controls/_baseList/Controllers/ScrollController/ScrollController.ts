import {IItemsSizes, IItemsSizesControllerOptions, ItemsSizesController} from './ItemsSizeController';
import {
    TIntersectionEvent,
    IObserversControllerBaseOptions,
    ObserversController, ITriggersVisibility
} from './ObserversController';
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

export interface IIndexesChangedParams extends IItemsRange {
    shiftDirection: IDirection;
}

export interface IActiveElementIndex {
    activeElementIndex: number;
}

export type IScheduledScrollType = 'restoreScroll' | 'scrollToElement';

interface IBaseEdgeItem {
    direction: IDirection;
    border: IDirection;
    borderDistance: number;
}

export interface IEdgeItem extends IBaseEdgeItem {
    index: number;
}

export interface IScheduledRestoreScrollParams extends IBaseEdgeItem {
    key: CrudEntityKey;
}

export interface IScheduledScrollToElementParams {
    key: CrudEntityKey;
    toBottom: boolean;
    force: boolean;
}

export interface IScheduledScrollParams {
    type: IScheduledScrollType;
    params: IScheduledRestoreScrollParams | IScheduledScrollToElementParams;
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
    IItemsSizesControllerOptions,
    IObserversControllerBaseOptions,
    ICalculatorBaseOptions {
    indexesInitializedCallback: IIndexesInitializedCallback;
    indexesChangedCallback: IIndexesChangedCallback;
    activeElementChangedCallback: IActiveElementChangedChangedCallback;
    hasItemsOutRangeChangedCallback: IHasItemsOutRangeChangedCallback;
    placeholdersChangedCallback: IPlaceholdersChangedCallback;
    itemsEndedCallback: IItemsEndedCallback;
}

/**
 * Класс предназначен для управления scroll и обеспечивает:
 *   - генерацию событий о достижении границ контента (работа с триггерами);
 *   - scroll к записи / к границе (при необходимости - пересчёт range);
 *   - сохранение / восстановление позиции scroll.
 */
export class ScrollController {
    private readonly _itemsSizesController: ItemsSizesController;
    private readonly _observersController: ObserversController;
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

        this._itemsSizesController = new ItemsSizesController({
            itemsContainer: options.itemsContainer,
            itemsQuerySelector: options.itemsQuerySelector,
            itemSizeGetterType: options.itemSizeGetterType
        });

        this._observersController = new ObserversController({
            listControl: options.listControl,
            listContainer: options.listContainer,
            triggersQuerySelector: options.triggersQuerySelector,
            viewportSize: options.viewportSize,
            triggersVisibility: options.triggersVisibility,
            topTriggerOffsetCoefficient: options.topTriggerOffsetCoefficient,
            bottomTriggerOffsetCoefficient: options.bottomTriggerOffsetCoefficient,
            observersCallback: this._observersCallback.bind(this),
            triggerOffsetType: options.triggerOffsetType
        });

        this._calculator = new Calculator({
            triggersOffsets: this._observersController.getTriggersOffsets(),
            itemsSizes: this._itemsSizesController.getItemsSizes(),
            scrollPosition: options.scrollPosition,
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

    getEdgeVisibleItem(direction: IDirection): IEdgeItem {
        const topOffset = this._itemsSizesController.getBeforeItemsContentSize();
        return this._calculator.getEdgeVisibleItem(direction, topOffset);
    }

    getScrollTopToEdgeItem(edgeItem: IEdgeItem): number {
        return this._calculator.getScrollTopToEdgeItem(edgeItem);
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

        // itemsEndedCallback должен вызываться ТОЛЬКО ТУТ, загрузка осуществляется ТОЛЬКО по достижению триггера
        if (!result.indexesChanged) {
            this._itemsEndedCallback(direction);
        }
    }

    /**
     * При изменении activeElementIndex обеспечивает activeElementChangedCallback.
     * @param {IActiveElementIndexChanged} result
     * @private
     */
    private _processActiveElementIndexChanged(result: IActiveElementIndexChanged): void {
        if (result.activeElementIndexChanged) {
            this._activeElementChangedCallback(result.activeElementIndex);
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
            this._hasItemsOutRangeChangedCallback({
                backward: result.hasItemsOutRangeBackward,
                forward: result.hasItemsOutRangeForward
            });
        }

        if (result.indexesChanged) {
            this._indexesChangedCallback({
                startIndex: result.startIndex,
                endIndex: result.endIndex,
                shiftDirection: result.shiftDirection
            });
        }
    }

    // endregion Private API
}
