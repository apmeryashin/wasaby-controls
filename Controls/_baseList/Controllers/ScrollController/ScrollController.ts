import { IItemsSizesControllerOptions, ItemsSizesController } from './ItemsSizeController';
import { TIntersectionEvent, IObserversControllerBaseOptions, ObserversController } from './ObserversController';
import { IRangeChangeResult } from './Calculator';

export type IDirection = 'top' | 'down';
export type IIndexChangedCallback = (rangeChangeResult: IRangeChangeResult) => void;
export type IItemsEndedCallback = (direction: IDirection) => void;

export interface IScrollControllerOptions extends IItemsSizesControllerOptions, IObserversControllerBaseOptions {
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
    _itemsSizesController: ItemsSizesController;
    _observersController: ObserversController;
    _indexChangedCallback: IIndexChangedCallback;
    _itemsEndedCallback: IItemsEndedCallback;

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
    }

    _observersCallback(eventName: TIntersectionEvent): void {
        this._itemsEndedCallback('down');
    }
}
