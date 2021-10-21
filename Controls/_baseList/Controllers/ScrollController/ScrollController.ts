import { IItemsSizesControllerOptions, ItemsSizesController} from './ItemsSizeController';
import { TIntersectionEvent, IObserversControllerBaseOptions, ObserversController } from './ObserversController';
import { Calculator, IActiveElementIndexChanged, ICalculatorOptions, ICalculatorResult } from './Calculator';
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

export interface IEnvironmentChangedParams {
    hasItemsBackward: boolean;
    hasItemsForward: boolean;

    beforePlaceholderSize: number;
    afterPlaceholderSize: number;
}

export type IScheduledScrollType = 'restoreScroll' | 'scrollToElement';

export interface IEdgeItem {
    key: CrudEntityKey;
    direction: IDirection;
    border: IDirection;
    borderDistance: number;
}

export interface IScheduledScrollToElementParams {
    itemIndex: number;
    toBottom: boolean;
    force: boolean;
}

export interface IScheduledScrollParams {
    type: IScheduledScrollType;
    params: IEdgeItem | IScheduledScrollToElementParams;
}

export type IDirection = 'backward' | 'forward';

export type IPageDirection = 'backward' | 'forward' | 'start' | 'end';

export type IIndexesChangedCallback = (params: IIndexesChangedParams) => void;

export type IEnvironmentChangedCallback = (params: IEnvironmentChangedParams) => void;

export type IActiveElementChangedChangedCallback = (activeElementIndex: number) => void;

export type IItemsEndedCallback = (direction: IDirection) => void;

export interface IScrollControllerOptions extends
    IItemsSizesControllerOptions,
    IObserversControllerBaseOptions,
    ICalculatorOptions {
    indexesChangedCallback: IIndexesChangedCallback;
    activeElementChangedCallback: IActiveElementChangedChangedCallback;
    environmentChangedCallback: IEnvironmentChangedCallback;
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
    private readonly _environmentChangedCallback: IEnvironmentChangedCallback;
    private readonly _itemsEndedCallback: IItemsEndedCallback;

    constructor(options: IScrollControllerOptions) {
        this._indexesChangedCallback = options.indexesChangedCallback;
        this._environmentChangedCallback = options.environmentChangedCallback;
        this._activeElementChangedCallback = options.activeElementChangedCallback;
        this._itemsEndedCallback = options.itemsEndedCallback;

        this._itemsSizesController = new ItemsSizesController({
            itemsContainer: options.itemsContainer,
            itemsQuerySelector: options.itemsQuerySelector
        });

        this._observersController = new ObserversController({
            listControl: options.listControl,
            listContainer: options.listContainer,
            triggersQuerySelector: options.triggersQuerySelector,
            triggersVisibility: options.triggersVisibility,
            observersCallback: this._observersCallback.bind(this)
        });

        this._calculator = new Calculator({
            triggersOffsets: this._observersController.getTriggersOffsets(),
            itemsSizes: this._itemsSizesController.getItemsSizes(),
            scrollTop: options.scrollTop,
            totalCount: options.totalCount,
            virtualScrollConfig: options.virtualScrollConfig,
            viewportSize: options.viewportSize
        });
    }

    // region Update DOM elements

    /**
     * Обновить контейнер с элементами. Также пересчитывает размеры отображаемых в данный момент элементов.
     * @param {HTMLElement} newItemsContainer
     */
    setItemsContainer(newItemsContainer: HTMLElement): void {
        const newItemsSizes = this._itemsSizesController.setItemsContainer(newItemsContainer);
        this._calculator.updateItemsSizes(newItemsSizes);
    }

    /**
     * Обновить селектор элементов. Также пересчитывает размеры отображаемых в данный момент элементов.
     * @param {string} newItemsQuerySelector
     */
    setItemsQuerySelector(newItemsQuerySelector: string): void {
        const newItemsSizes = this._itemsSizesController.setItemsQuerySelector(newItemsQuerySelector);
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
        const newItemsSizes = this._itemsSizesController.updateItemsSizes(itemsRange);
        this._calculator.updateItemsSizes(newItemsSizes);
    }

    resized(): void {
        const range = this._calculator.getRange();
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
     * @param direction Направление перемещения
     */
    moveItems(addPosition: number,
              addCount: number,
              removePosition: number,
              removeCount: number,
              direction: IDirection): void {
        const itemsSizes = this._itemsSizesController.moveItems(addPosition, addCount, removePosition, removeCount);
        this._calculator.updateItemsSizes(itemsSizes);

        const result = this._calculator.moveItems(addPosition, addCount, removePosition, removeCount, direction);
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
     */
    resetItems(totalCount: number): void {
        const itemsSizes = this._itemsSizesController.resetItems(totalCount);
        this._calculator.updateItemsSizes(itemsSizes);

        const result = this._calculator.resetItems(totalCount);
        this._processCalculatorResult(result);
    }

    // endregion Collection changes

    // region Scroll

    getEdgeVisibleItem(direction: IDirection): IEdgeItem {
        return this._calculator.getEdgeVisibleItem(direction);
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
    scrollToPosition(position: number): void {
        const result = this._calculator.shiftRangeToScrollPosition(position);
        this._processCalculatorResult(result);
    }

    /**
     * Обрабатывает изменение позиции при скролле.
     * Используется при обычном скролле списка.
     * TODO возможно стоит сделать более понятные названия для методов scrollToPosition, scrollPositionChange
     * @param position
     */
    scrollPositionChange(position: number): void {
        const result = this._calculator.shiftActiveElementIndexToScrollPosition(position);
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
        let direction: IDirection;
        if (eventName === 'bottomIn') {
            direction = 'forward';
        }
        if (eventName === 'topIn') {
            direction = 'backward';
        }

        const result = this._calculator.shiftRangeToDirection(direction);

        this._processCalculatorResult(result);

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
     * Также, по необходимости, обеспечивает вызов activeElementChangedCallback, environmentChangedCallback.
     * @param {ICalculatorResult} result
     * @private
     */
    private _processCalculatorResult(result: ICalculatorResult): void {
        this._processActiveElementIndexChanged(result);

        if (result.environmentChanged) {
            this._environmentChangedCallback({
                afterPlaceholderSize: result.afterPlaceholderSize,
                beforePlaceholderSize: result.beforePlaceholderSize,
                hasItemsBackward: result.hasItemsBackward,
                hasItemsForward: result.hasItemsForward
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
