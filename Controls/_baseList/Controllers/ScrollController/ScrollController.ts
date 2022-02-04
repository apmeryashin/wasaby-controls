import {
    AbstractItemsSizesController,
    IAbstractItemsSizesControllerOptions,
    IItemsSizes
} from './ItemsSizeController/AbstractItemsSizeController';
import {
    AbstractObserversController,
    IAbstractObserversControllerBaseOptions,
    IAbstractObserversControllerOptions,
    IAdditionalTriggersOffsets,
    ITriggerPosition
} from './ObserverController/AbstractObserversController';
import {Calculator, IActiveElementIndexChanged, ICalculatorBaseOptions, ICalculatorResult} from './Calculator';
import CalculatorWithoutVirtualization from 'Controls/_baseList/Controllers/ScrollController/CalculatorWithoutVirtualization';
import {CrudEntityKey} from 'Types/source';
import type {IEdgeItemCalculatingParams} from '../AbstractListVirtualScrollController';

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
    /**
     * Направление, в котором был смещен диапазон.
     * @remark Возможно значение null. Это значит, что не возможно определить направление. Например, reset.
     */
    shiftDirection: IDirection|null;
    range: IItemsRange;
    oldRange: IItemsRange;
    oldPlaceholders: IPlaceholders;
    scrollMode: IScrollMode;
}

/**
 * Режим работы скролла
 * @param fixed DOM-элемент первой видимой записи должен сохранять свою позицию
 * относительно viewPort после смещения диапазона.
 * @param unfixed DOM-элемент первой видимой записи не сохраняет свою позицию
 * относительно viewPort после смещения диапазона, а сдвигается по нативным правилам.
 */
export type IScrollMode = 'fixed'|'unfixed';

/**
 * Режим пересчета диапазона
 * @param shift Диапазон смещается (пересчитывается и startIndex и stopIndex)
 * @param extend Диапазон расширяется (пересчитывается или startIndex или stopIndex, зависит от направления)
 * @param nothing Диапазон не пересчитывается
 */
export type ICalcMode = 'shift'|'extend'|'nothing';

export interface IActiveElementIndex {
    activeElementIndex: number;
}

export interface IEdgeItem {
    key: string;
    direction: IDirection;
    border: IDirection;
    borderDistance: number;
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

export type IScrollToPageMode = 'edgeItem' | 'viewport';

export type IIndexesChangedCallback = (params: IIndexesChangedParams) => void;

export type IActiveElementChangedChangedCallback = (activeElementIndex: number) => void;

export type IItemsEndedCallback = (direction: IDirection) => void;

export type IIndexesInitializedCallback = (range: IIndexesChangedParams) => void;

export type IHasItemsOutRangeChangedCallback = (hasItems: IHasItemsOutRange) => void;

export type IPlaceholdersChangedCallback = (placeholders: IPlaceholders) => void;

export interface IScrollControllerOptions extends
    IAbstractItemsSizesControllerOptions,
    IAbstractObserversControllerBaseOptions,
    ICalculatorBaseOptions {
    disableVirtualScroll: boolean;
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

    private _viewportSize: number = 0;
    private _contentSize: number = 0;

    private _disableVirtualScroll: boolean;

    constructor(options: IScrollControllerOptions) {
        this._indexesChangedCallback = options.indexesChangedCallback;
        this._hasItemsOutRangeChangedCallback = options.hasItemsOutRangeChangedCallback;
        this._placeholdersChangedCallback = options.placeholdersChangedCallback;
        this._activeElementChangedCallback = options.activeElementChangedCallback;
        this._itemsEndedCallback = options.itemsEndedCallback;
        this._indexesInitializedCallback = options.indexesInitializedCallback;

        this._viewportSize = options.viewportSize;
        this._contentSize = options.contentSize;

        this._disableVirtualScroll = options.disableVirtualScroll;

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
            triggersOffsetCoefficients: options.triggersOffsetCoefficients,
            triggersPositions: options.triggersPositions,
            additionalTriggersOffsets: options.additionalTriggersOffsets,
            observersCallback: this._observersCallback.bind(this)
        });

        const calculatorConstructor = this._disableVirtualScroll ? CalculatorWithoutVirtualization : Calculator;
        this._calculator = new calculatorConstructor({
            triggersOffsets: this._observersController.getTriggersOffsets(),
            itemsSizes: this._itemsSizesController.getItemsSizes(),
            scrollPosition: options.scrollPosition,
            totalCount: options.totalCount,
            virtualScrollConfig: options.virtualScrollConfig,
            viewportSize: options.viewportSize,
            contentSize: options.contentSize,
            givenItemsSizes: options.givenItemsSizes,
            feature1183225611: options.feature1183225611
        });
    }

    destroy(): void {
        this._observersController.destroy();
    }

    viewportResized(viewportSize: number): boolean {
        const changed = this._viewportSize !== viewportSize;
        if (changed) {
            this._viewportSize = viewportSize;

            const triggerOffsets = this._observersController.setViewportSize(viewportSize);
            this._calculator.setTriggerOffsets(triggerOffsets);
            this._calculator.setViewportSize(viewportSize);
        }
        return changed;
    }

    contentResized(contentSize: number): boolean {
        const changed = this._contentSize !== contentSize;
        if (changed) {
            this._contentSize = contentSize;

            this._calculator.setContentSize(contentSize);
            this._observersController.setContentSize(contentSize);
        }
        return changed;
    }

    getElement(key: CrudEntityKey): HTMLElement {
        return this._itemsSizesController.getElement(key);
    }

    getFirstVisibleItemIndex(): number {
        return this._calculator.getFirstVisibleItemIndex();
    }

    setItemsRenderedOutsideRange(items: number[]): void {
        this._itemsSizesController.setCountItemsRenderedOutsideRange(items.length);
        this._calculator.setItemsRenderedOutsideRange(items);
    }

    // region Triggers

    setBackwardTriggerVisible(visible: boolean): void {
        this._observersController.setBackwardTriggerVisible(visible);
    }

    setForwardTriggerVisible(visible: boolean): void {
        this._observersController.setForwardTriggerVisible(visible);
    }

    setBackwardTriggerPosition(position: ITriggerPosition): void {
        const triggerOffsets = this._observersController.setBackwardTriggerPosition(position);
        this._calculator.setTriggerOffsets(triggerOffsets);
    }

    setForwardTriggerPosition(position: ITriggerPosition): void {
        const triggerOffsets = this._observersController.setForwardTriggerPosition(position);
        this._calculator.setTriggerOffsets(triggerOffsets);
    }

    setAdditionalTriggersOffsets(additionalTriggersOffsets: IAdditionalTriggersOffsets): void {
        const triggersOffsets = this._observersController.setAdditionalTriggersOffsets(additionalTriggersOffsets);
        this._calculator.setTriggerOffsets(triggersOffsets);
    }

    checkTriggersVisibility(): void {
        const contentSizeBeforeList = this._itemsSizesController.getContentSizeBeforeList();
        this._observersController.checkTriggersVisibility(contentSizeBeforeList);
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
        this._itemsSizesController.setListContainer(newListContainer);
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

    updateItemsSizes(itemsRange: IItemsRange = this._calculator.getRange()): void {
        const newItemsSizes = this._itemsSizesController.updateItemsSizes(itemsRange);
        this._calculator.updateItemsSizes(newItemsSizes);
    }

    updateGivenItemsSizes(itemsSizes: IItemsSizes): void {
        this._calculator.updateGivenItemsSizes(itemsSizes);
    }

    // endregion Update items sizes

    // region Collection changes

    /**
     * Обрабатывает добавление элементов в коллекцию.
     * @param position Индекс элемента, после которого добавили записи
     * @param count Кол-во добавленных записей
     * @param scrollMode Режим скролла
     * @param calcMode Режим пересчета записей
     */
    addItems(position: number, count: number, scrollMode: IScrollMode, calcMode: ICalcMode): void {
        const itemsSizes = this._itemsSizesController.addItems(position, count);
        this._calculator.updateItemsSizes(itemsSizes);

        const result = this._calculator.addItems(position, count, calcMode);

        // При добавлении записей в список нужно добавить оффсет триггеру,
        // чтобы далее загрузка не требовала подскролла до ромашки
        const triggersOffsets = result.shiftDirection === 'backward'
            ? this._observersController.setBackwardTriggerPosition('offset')
            : this._observersController.setForwardTriggerPosition('offset');
        this._calculator.setTriggerOffsets(triggersOffsets);

        this._processCalculatorResult(result, scrollMode);
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
    }

    /**
     * Обрабатывает удаление элементов из коллекции.
     * @param position Индекс первого удаленного элемента.
     * @param count Кол-во удаленных элементов.
     * @param scrollMode Режим скролла
     */
    removeItems(position: number, count: number, scrollMode: IScrollMode): void {
        const result = this._calculator.removeItems(position, count);

        const itemsSizes = this._itemsSizesController.removeItems(position, count);
        this._calculator.updateItemsSizes(itemsSizes);

        this._processCalculatorResult(result, scrollMode);
    }

    /**
     * Обрабатывает пересоздание всех элементов коллекции.
     * @param totalCount Общее кол-во элементов в коллекции
     * @param startIndex Начальный индекс диапазона отображаемых записей
     */
    resetItems(totalCount: number, startIndex: number): void {
        const triggerOffsets = this._observersController.resetItems(totalCount);
        this._calculator.setTriggerOffsets(triggerOffsets);

        const result = this._calculator.resetItems(totalCount, startIndex);

        const hasItemsOutRange = {
            backward: this._calculator.hasItemsOutRange('backward'),
            forward: this._calculator.hasItemsOutRange('forward')
        };
        // TODO SCROLL нужно будет удалить
        // Код нужен только для того, чтобы у триггера проставить оффсет после инициализации.
        // НО при иницализцаии оффсет у триггера не нужен в этом кейсе.(чтобы избежать лишних подгрузок)
        // Удалить, после внедрения. Нужно будет поправить тест. Внедряемся без каких-либо изменений тестов.
        if (hasItemsOutRange.backward) {
            this.setBackwardTriggerPosition('offset');
        }
        if (hasItemsOutRange.forward) {
            this.setForwardTriggerPosition('offset');
        }

        this._handleInitializingResult(result);
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
        return this._calculator.getScrollPositionToEdgeItem(edgeItem);
    }

    /**
     * Возвращает способ скролла к следующей/предыдущей страницы в зависимости от размера крайней записи
     */
    getScrollToPageMode(edgeItemKey: string): IScrollToPageMode {
        // Если запись меньше трети вьюпорта, то скроллим к ней на pageUp|pageDown, чтобы не разбивать мелкие записи.
        // Иначе, скроллим как обычно, на высоту вьюпорта
        const MAX_SCROLL_TO_EDGE_ITEM_RELATION = 3;
        const itemSize = this._itemsSizesController.getItemsSizes().find(((item) => item.key === edgeItemKey)).size;
        if (itemSize * MAX_SCROLL_TO_EDGE_ITEM_RELATION > this._viewportSize || this._disableVirtualScroll) {
            return 'viewport';
        } else {
            return 'edgeItem';
        }
    }

    /**
     * Скроллит к элементу по переданному индексу.
     * При необходимости смещает диапазон.
     * @param itemIndex Индекс элемента, к которому нужно проскроллить.
     * @return {boolean} Изменился ли диапазон отображаемых записей.
     */
    scrollToItem(itemIndex: number): boolean {
        const result = this._calculator.shiftRangeToIndex(itemIndex);
        this._processCalculatorResult(result, 'fixed');
        return result.indexesChanged;
    }

    /**
     * Сдвигает диапазон отображаемых элементов к позиции скролла.
     * Используется при нажатии в скролбар в позицию, где записи уже скрыты виртуальным скроллом.
     * @param position Позиция скролла.
     */
    scrollToVirtualPosition(position: number): boolean {
        const result = this._calculator.shiftRangeToVirtualScrollPosition(position);
        this._processCalculatorResult(result, 'fixed');
        return result.indexesChanged;
    }

    /**
     * Обрабатывает изменение позиции при скролле.
     * Используется при обычном скролле списка.
     * @param position
     * @param updateActiveElement Нужно ли обновлять активный эелемент
     */
    scrollPositionChange(position: number, updateActiveElement: boolean): void {
        const result = this._calculator.scrollPositionChange(position, updateActiveElement);
        this._processActiveElementIndexChanged(result);
        this._observersController.setScrollPosition(position);
    }

    // endregion Scroll

    // region Private API

    /**
     * Callback, вызываемый при достижении триггера.
     * Вызывает сдвиг itemsRange в направлении триггера.
     * В зависимости от результатов сдвига itemsRange вызывает indexesChangedCallback или itemsEndedCallback.
     * @param direction
     * @private
     */
    private _observersCallback(direction: IDirection): void {
        // НЕЛЬЗЯ делать рассчеты связанные со scrollPosition.
        // Т.к. в момент срабатывания триггера scrollPosition может быть не актуален.
        // Актуальное значение прийдет только после триггера в событии scrollMoveSync.
        // Выходит след-ая цепочка вызовов: scrollMoveSync -> observerCallback -> scrollMoveSync.
        const result = this._calculator.shiftRangeToDirection(direction);
        this._processCalculatorResult(result, 'fixed');

        // после первого срабатывания триггера сбрасываем флаг resetTriggerOffset.
        // Чтобы дальше триггер срабатывал заранее за счет оффсета.
        let triggerOffsets;
        if (direction === 'forward') {
            triggerOffsets = this._observersController.setForwardTriggerPosition('offset');
        } else {
            triggerOffsets = this._observersController.setBackwardTriggerPosition('offset');
        }
        this._calculator.setTriggerOffsets(triggerOffsets);
        // TODO триггер может сразу стать виден, но это вызовет точно 2 перерисовки.
        //  нужно подумать, можно ли исправить. По идее мы не знаем размеры элементов.

        if (!result.indexesChanged) {
            // itemsEndedCallback должен вызываться ТОЛЬКО ТУТ, загрузка осуществляется ТОЛЬКО по достижению триггера
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
     * @param scrollMode
     * @private
     */
    private _processCalculatorResult(result: ICalculatorResult, scrollMode: IScrollMode): void {
        if (result.placeholdersChanged) {
            this._placeholdersChangedCallback({
                backward: result.backwardPlaceholderSize,
                forward: result.forwardPlaceholderSize
            });
        }

        if (result.hasItemsOutRangeChanged) {
            const hasItemsOutRange: IHasItemsOutRange = {
                backward: result.hasItemsOutRangeBackward,
                forward: result.hasItemsOutRangeForward
            };
            this._observersController.setHasItemsOutRange(hasItemsOutRange);
            if (this._hasItemsOutRangeChangedCallback) {
                this._hasItemsOutRangeChangedCallback(hasItemsOutRange);
            }
        }

        if (result.indexesChanged) {
            this._indexesChangedCallback({
                range: result.range,
                oldRange: result.oldRange,
                oldPlaceholders: result.oldPlaceholders,
                shiftDirection: result.shiftDirection,
                scrollMode
            });
        }
    }

    private _handleInitializingResult(result: ICalculatorResult): void {
        this._indexesInitializedCallback({
            range: result.range,
            oldRange: result.oldRange,
            oldPlaceholders: result.oldPlaceholders,
            shiftDirection: result.shiftDirection
        });

        const hasItemsOutRange: IHasItemsOutRange = {
            backward: this._calculator.hasItemsOutRange('backward'),
            forward: this._calculator.hasItemsOutRange('forward')
        };
        this._observersController.setHasItemsOutRange(hasItemsOutRange);
        this._hasItemsOutRangeChangedCallback(hasItemsOutRange);

        this._placeholdersChangedCallback({
            backward: 0,
            forward: 0
        });
    }

    // endregion Private API
}
