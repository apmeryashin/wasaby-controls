import { IItemsSizesControllerOptions, ItemsSizesController } from './ItemsSizeController';
import { TIntersectionEvent, IObserversControllerBaseOptions, ObserversController } from './ObserversController';
import {Calculator, ICalculatorOptions, IRangeChangeResult} from './Calculator';
import {CrudEntityKey} from 'Types/source';

export interface IIndexesChangedParams {
    startIndex: number;
    endIndex: number;
}

export interface IEnvironmentChangedParams {
    hasItemsBackward: boolean;
    hasItemsForward: boolean;

    beforePlaceholderSize: number;
    afterPlaceholderSize: number;
}

export type IDirection = 'backward' | 'forward';

export type IIndexesChangedCallback = (params: IIndexesChangedParams) => void;

export type IEnvironmentChangedCallback = (params: IEnvironmentChangedParams) => void;

export type IActiveElementChangedChangedCallback = (activeElementIndex: number) => void;

export type IItemsEndedCallback = (direction: IDirection) => void;

export interface IScrollControllerOptions extends
    IItemsSizesControllerOptions,
    IObserversControllerBaseOptions,
    ICalculatorOptions {
    scrollTop: number;
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
            virtualScrollConfig: options.virtualScrollConfig,
            viewportSize: options.viewportSize
        })
    }

    // region Collection changes

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     * @param totalCount Общее кол-во элементов в коллекции
     */
    addItems(position: number, count: number, totalCount: number): void {
        this._calculator.addItems(position, count, totalCount);
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param newPosition Индекс элемента, после которого вставили записи
     * @param oldPosition Индекс элемента откуда переместили записи
     * @param movedCount Кол-во перемещенных элементов
     * @param totalCount Общее кол-во элементов в коллекции
     */
    moveItems(newPosition: number, oldPosition: number, movedCount: number, totalCount: number): void {
        this._calculator.moveItems(newPosition, oldPosition, movedCount, totalCount);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     * @param totalCount Общее кол-во элементов в коллекции
     */
    removeItems(position: number, count: number, totalCount: number): IRangeChangeResult {
        return this._calculator.removeItems(position, count, totalCount);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * @param count Новое кол-во элементов
     */
    resetItems(count: number): void {
        this._calculator.resetItems(count);
    }

    // endregion Collection changes

    // region Scroll

    scrollTo(): IRangeChangeResult {
        // TODO скорее всего мы должны здесь позвать shiftRangeToIndex, где index - lastVisibleItemIndex
        return null;
    }

    scrollToItem(itemKey: CrudEntityKey, totalCount: number): void {
        // TODO видимо нужна коллекция? Либо тут тоже нужно индекс прокидывать,
        //  либо в калькуляторе неправильно назван метод
        const index = 0; // this._collection.getIndexBySourceKey(itemKey)
        this._calculator.shiftRangeToIndex(index, totalCount);
    }

    changeScrollPosition(position: number, totalCount: number): void {
        this._calculator.shiftRangeToScrollPosition(position, totalCount);
    }

    // endregion Scroll


    // region Private API

    /**
     * Callback, вызываемый при достижении триггера.
     * Вызывает сдвиг itemsRange в направлении триггера.
     * В зависимости от результатов сдвига itemsRange вызывает indexesChangedCallback или itemsEndedCallback.
     * Также, по необходимости, обеспечивает вызов activeElementChangedCallback, environmentChangedCallback.
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

        if (result.activeElementIndexChanged) {
            this._activeElementChangedCallback(result.activeElementIndex);
        }

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
                endIndex: result.endIndex
            });
        } else {
            this._itemsEndedCallback('forward');
        }
    }

    // endregion Private API
}
