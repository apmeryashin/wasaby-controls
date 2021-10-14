import { IItemsSizesControllerOptions, ItemsSizesController } from './ItemsSizeController';
import { TIntersectionEvent, IObserversControllerBaseOptions, ObserversController } from './ObserversController';
import {Calculator, ICalculatorOptions, IRangeChangeResult} from './Calculator';
import {CrudEntityKey} from 'Types/source';

export type IDirection = 'backward' | 'forward';
export type IIndexChangedCallback = (rangeChangeResult: IRangeChangeResult) => void;
export type IItemsEndedCallback = (direction: IDirection) => void;

export interface IScrollControllerOptions extends
    IItemsSizesControllerOptions,
    IObserversControllerBaseOptions,
    ICalculatorOptions {
    scrollTop: number;
    indexChangedCallback: IIndexChangedCallback;
    itemsEndedCallback: IItemsEndedCallback;
}

/**
 * Класс предназначен для управления scroll и обеспечивает:
 *   - генерацию событий о достижении границ контента (работа с триггерами);
 *   - управление virtual scroll и установка рассчитанных индексов;
 *   - scroll к записи / к границе (при необходимости - пересчёт virtualScroll);
 *   - сохранение / восстановление позиции scroll.
 */
export class ScrollController {
    private _itemsSizesController: ItemsSizesController;
    private _observersController: ObserversController;
    private _calculator: Calculator;
    private _indexChangedCallback: IIndexChangedCallback;
    private _itemsEndedCallback: IItemsEndedCallback;

    constructor(options: IScrollControllerOptions) {
        this._indexChangedCallback = options.indexChangedCallback;
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
            triggersOffsets: this._observersController.getTriggerOffsets(), // TODO где-то триггер, где-то обсервер???
            itemsSizes: this._itemsSizesController.getItemsSizes(),
            scrollTop: options.scrollTop,
            virtualScrollConfig: options.virtualScrollConfig,
            viewportSize: options.viewportSize
        })
    }

    // region HandleCollectionChanges

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     * @param totalCount Общее кол-во элементов в коллекции
     */
    addItems(position: number, count: number, totalCount: number): IRangeChangeResult {
        return this._calculator.addItems(position, count, totalCount);
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param newPosition Индекс элемента, после которого вставили записи
     * @param oldPosition Индекс элемента откуда переместили записи
     * @param movedCount Кол-во перемещенных элементов
     * @param totalCount Общее кол-во элементов в коллекции
     */
    moveItems(newPosition: number, oldPosition: number, movedCount: number, totalCount: number): IRangeChangeResult {
        return this._calculator.moveItems(newPosition, oldPosition, movedCount, totalCount);
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
    resetItems(count: number): IRangeChangeResult {
        return this._calculator.resetItems(count);
    }

    // endregion HandleCollectionChanges

    // region Scroll

    scrollTo(): IRangeChangeResult {
        // TODO скорее всего мы должны здесь позвать shiftRangeToIndex, где index - lastVisibleItemIndex
        return null;
    }

    scrollToItem(itemKey: CrudEntityKey, totalCount: number): IRangeChangeResult {
        // TODO видимо нужна коллекция? Либо тут тоже нужно индекс прокидывать,
        //  либо в калькуляторе неправильно назван метод
        const index = 0; // this._collection.getIndexBySourceKey(itemKey)
        return this._calculator.shiftRangeToIndex(index, totalCount);
    }

    changeScrollPosition(position: number, totalCount: number): IRangeChangeResult {
        return this._calculator.shiftRangeToScrollPosition(position, totalCount);
    }

    // endregion Scroll

    private _observersCallback(eventName: TIntersectionEvent): void {
        this._itemsEndedCallback('forward');
    }
}
