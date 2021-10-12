import { IItemsSizesControllerOptions, ItemsSizesController } from './ItemsSizeController';
import { IObserversControllerOptions, ObserversController } from './ObserversController';

export interface IScrollControllerOptions extends IItemsSizesControllerOptions, IObserversControllerOptions {
    scrollTop: number;
    viewPortSize: number;
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

    constructor(options: IScrollControllerOptions) {
        this._itemsSizesController = new ItemsSizesController({
            itemsContainer: options.itemsContainer,
            itemsQuerySelector: options.itemsQuerySelector
        });

        this._observersController = new ObserversController({
            listControl: options.listControl,
            listContainer: options.listContainer,
            triggersQuerySelector: options.triggersQuerySelector,
            triggersVisibility: options.triggersVisibility,
            observersCallback: options.observersCallback
        });
    }
}
