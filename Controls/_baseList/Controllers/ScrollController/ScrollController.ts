import { IItemsSizesControllerOptions, ItemsSizesController } from './ItemsSizeController';
import { TIntersectionEvent, IObserversControllerBaseOptions, ObserversController } from './ObserversController';
import {Calculator, ICalculatorOptions, IRangeChangeResult} from './Calculator';
import {CrudEntityKey} from 'Types/source';

export type IDirection = 'top' | 'down';
export type IIndexChangedCallback = (rangeChangeResult: IRangeChangeResult) => void;
export type IItemsEndedCallback = (direction: IDirection) => void;

export interface IScrollControllerOptions extends
    IItemsSizesControllerOptions,
    IObserversControllerBaseOptions,
    ICalculatorOptions {
    scrollTop: number;
    viewPortSize: number;
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
            collection: options.collection,
            scrollTop: options.scrollTop,
            segmentSize: options.segmentSize // TODO почему только segmentSize? А как же pageSize?
        })
    }

    // region HandleCollectionChanges

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     */
    addItems(position: number, count: number): IRangeChangeResult {
        return this._calculator.addItems(position, count);
    }

    /**
     * Обрабатывает перемещение элементов внутри коллекции.
     * @param addPosition Индекс элемента, после которого вставили записи
     * @param addCount Кол-во перемещенных элементов
     * @param removePosition Индекс элемента откуда переместили записи
     * @param removeCount Кол-во перемещенных элементов
     */
    moveItems(addPosition: number, addCount: number, removePosition: number, removeCount: number): IRangeChangeResult {
        return this._calculator.moveItems(addPosition, addCount, removePosition, removeCount);
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     */
    removeItems(position: number, count: number): IRangeChangeResult {
        return this._calculator.removeItems(position, count);
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
        // TODO тут что должно быть? К чему скроллим? Наверное это должен быть метод scrollToPosition(shiftToPosition)
        //  вместо changeScrollPosition.
        return null;
    }

    scrollToItem(itemKey: CrudEntityKey): IRangeChangeResult {
        // TODO видимо нужна коллекция? Либо тут тоже нужно индекс прокидывать,
        //  либо в калькуляторе неправильно назван метод
        const index = 0; // this._collection.getIndexBySourceKey(itemKey)
        return this._calculator.updateRangeByIndex(index);
    }

    changeScrollPosition(position: number): IRangeChangeResult {
        return this._calculator.shiftRangeToScrollPosition(position);
    }

    // endregion Scroll

    private _observersCallback(eventName: TIntersectionEvent): void {
        this._itemsEndedCallback('down');
    }
}
