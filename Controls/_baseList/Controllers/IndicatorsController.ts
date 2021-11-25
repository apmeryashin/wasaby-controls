import { Collection, EIndicatorState, TIndicatorPosition, TIndicatorState } from 'Controls/display';
import { RecordSet } from 'Types/collection';

export interface IIndicatorsControllerOptions {
    model: Collection;
    items: RecordSet;
    isInfinityNavigation: boolean;
    hasMoreDataToTop: boolean;
    hasMoreDataToBottom: boolean;
    shouldShowEmptyTemplate: boolean;
    scrollToFirstItem: (onDrawItems?: boolean) => void;
    hasHiddenItemsByVirtualScroll: (direction: 'up'|'down') => boolean;
    attachLoadTopTriggerToNull: boolean; // TODO LI переименовать
    attachLoadDownTriggerToNull: boolean; // TODO LI переименовать
    stopDisplayPortionedSearchCallback: () => void;
}

const INDICATOR_DELAY = 2000;
export const INDICATOR_HEIGHT = 48;

const SEARCH_MAX_DURATION = 30 * 1000;
const SEARCH_CONTINUED_MAX_DURATION = 30 * 1000;

enum SEARCH_STATES {
    NOT_STARTED = 0,
    STARTED = 'started',
    STOPPED = 'stopped',
    CONTINUED = 'continued',
    ABORTED = 'aborted'
}

type TPortionedSearchDirection = 'top'|'bottom';

export const DIRECTION_COMPATIBILITY = {
    top: 'up',
    up: 'top',
    bottom: 'down',
    down: 'bottom'
};

/**
 * Контроллер, который управляет отображением индикаторов
 * @author Панихин К.А.
 */
export default class IndicatorsController {
    private _options: IIndicatorsControllerOptions;
    private _model: Collection;
    private _viewportFilled: boolean = false;

    private _displayIndicatorTimer: number;

    private _portionedSearchDirection: TPortionedSearchDirection;
    private _portionedSearchTimer: number = null;
    private _searchState: SEARCH_STATES = 0;

    private _hasNotRenderedChanges: boolean = false;

    constructor(options: IIndicatorsControllerOptions) {
        this._options = options;
        this._model = options.model;

        if (this._isPortionedSearch() && (this._options.hasMoreDataToBottom || this._options.hasMoreDataToTop)) {
            const direction = this._options.hasMoreDataToBottom ? 'bottom' : 'top';
            this.startDisplayPortionedSearch(direction);
        }
    }

    /**
     * Обновляет опции и пересчитывает необходимые индикаторы.
     * @param {IIndicatorsControllerOptions} options Опции контроллера
     * @param {boolean} isLoading Флаг, означающий что в данный момент идет загрузка.
     * @return {boolean} Возвращает флаг, что изменились значения сброса оффсета триггера
     */
    updateOptions(options: IIndicatorsControllerOptions, isLoading: boolean): void {
        // во время загрузки sourceController всегда возвращает hasMore = false, а корректным значение будет
        // уже только после загрузки, поэтому hasMore обновим только после загрузки
        if (isLoading) {
            options.hasMoreDataToBottom = this._options.hasMoreDataToBottom;
            options.hasMoreDataToTop = this._options.hasMoreDataToTop;
        }
        const navigationChanged = this._options.isInfinityNavigation !== options.isInfinityNavigation;

        const shouldRecountAllIndicators = options.model && this._model !== options.model;
        const shouldRecountBottomIndicator = !shouldRecountAllIndicators &&
            (this._options.hasMoreDataToBottom !== options.hasMoreDataToBottom || navigationChanged);
        const shouldRecountTopIndicator = !shouldRecountAllIndicators &&
            (this._options.hasMoreDataToTop !== options.hasMoreDataToTop || navigationChanged);

        this._options = options;
        this._model = options.model;

        if (shouldRecountAllIndicators) {
            this.recountIndicators('all', true);
        }
        if (shouldRecountTopIndicator) {
            this.recountIndicators('up', false);
        }
        if (shouldRecountBottomIndicator) {
            this.recountIndicators('down', false);
        }
    }

    /**
     * Обновляет значения опций, есть ли еще данные вверх или вниз.
     * @param {boolean} hasMoreToTop Есть ли данные вверх
     * @param {boolean} hasMoreToBottom Есть ли данные вниз
     * @void
     */
    setHasMoreData(hasMoreToTop: boolean, hasMoreToBottom: boolean): void {
        this._options.hasMoreDataToTop = hasMoreToTop;
        this._options.hasMoreDataToBottom = hasMoreToBottom;
    }

    /**
     * Устанавливает значение флага, viewportFilled. Который означает, что у нас заполненн весь вьюпорт.
     * Это нужно для правильного отображения верхней ромашки. Т.к. подгрузка должна идти только в одну сторону
     * и в первую очередь вниз, и пока данные не занимают весь вьюпорт мы грузим(и отображаем ромашку) только вниз
     * @param value
     */
    setViewportFilled(value: boolean): void {
        this._viewportFilled = value;
    }

    /**
     * Обрабатывает пересоздание элементов в коллекции. (в частном случае подразумевает под этим перезагрзку списка)
     * При необходимости пересчитываеет индикаторы, начинает порционный поиск, сбрасывает оффсет у триггеров
     */
    onCollectionReset(): void {
        this._setSearchState(SEARCH_STATES.NOT_STARTED);
        this.hideGlobalIndicator();
        if (this._isPortionedSearch() && (this._options.hasMoreDataToBottom || this._options.hasMoreDataToTop)) {
            const direction = this._options.hasMoreDataToBottom ? 'bottom' : 'top';
            this.startDisplayPortionedSearch(direction);
        } else {
            this.recountIndicators('all', true);
        }
    }

    /**
     * Обрабатывает добавление записей в коллекцию.
     * При необходимости скрывает глобальный индикатор.
     */
    onCollectionAdd(): void {
        const hasMoreInAnyDirection = this._options.hasMoreDataToTop || this._options.hasMoreDataToBottom;
        if (!hasMoreInAnyDirection && this.shouldHideGlobalIndicator()) {
            this.hideGlobalIndicator();
        }
    }

    /**
     * Уничтожает состояние контроллера.
     * Сбрасывает все таймеры.
     */
    destroy(): void {
        this.clearDisplayPortionedSearchTimer();
    }

    // region LoadingIndicator

    /**
     * Проверяет, должен ли отображаться верхний индикатор.
     * @return {boolean} Отображать ли верхний индикатор.
     */
    shouldDisplayTopIndicator(): boolean {
        // верхний индикатор покажем только если заполнен вьюпорт, т.к. загрузка в первую очередь идет вниз
        // или сразу же покажем если вниз грузить нечего
        const allowByViewport = this._viewportFilled || !this._options.hasMoreDataToBottom;
        return allowByViewport && this._options.attachLoadTopTriggerToNull && this._options.hasMoreDataToTop
            && this._shouldDisplayIndicator('up');
    }

    /**
     * Отображает верхний индикатор
     * @param {boolean} scrollToFirstItem Нужно ли скроллить к первому элементу, чтобы добавить отступ под триггер
     * @param onDrawItems // TODO удалить https://online.sbis.ru/opendoc.html?guid=e84068e3-0844-4930-89e3-1951efbaee25
     * @void
     */
    displayTopIndicator(scrollToFirstItem: boolean, onDrawItems: boolean, isTopIndicatorDisplayed: boolean): void {
        const wasDisplayedIndicator = this._model.getTopIndicator().isDisplayed();

        if (!isTopIndicatorDisplayed) {
            this._hasNotRenderedChanges = true;
        }

        // если индикатор уже показан, то возможно у нас поменялось состояние индикатора.
        // Поэтому метод на модели нужно всегда вызывать
        const indicatorState = this._getLoadingIndicatorState('top');
        this._model.displayIndicator('top', indicatorState);

        // к первому элементу не нужно скроллить, если индикатор и так был показан
        if (scrollToFirstItem && !wasDisplayedIndicator) {
            this._options.scrollToFirstItem(onDrawItems);
        }
    }

    /**
     * Проверяет, должен ли отображаться нижний индикатор.
     * @return {boolean} Отображать ли нижний индикатор.
     */
    hasNotRenderedChanges(): boolean {
        return this._hasNotRenderedChanges;
    }

    afterRenderCallback(): void {
        this._hasNotRenderedChanges = false;
    }

    /**
     * Проверяет, должен ли отображаться нижний индикатор.
     * @return {boolean} Отображать ли нижний индикатор.
     */
    shouldDisplayBottomIndicator(): boolean {
        return this._options.attachLoadDownTriggerToNull && this._options.hasMoreDataToBottom
            && this._shouldDisplayIndicator('down');
    }

    /**
     * Отображает нижний индикатор
     * @void
     */
    displayBottomIndicator(): void {
        // если индикатор уже показан, то возможно у нас поменялось состояние индикатора.
        // Поэтому метод на модели нужно всегда вызывать
        if (this._viewportFilled) {
            const indicatorState = this._getLoadingIndicatorState('bottom');
            this._model.displayIndicator('bottom', indicatorState);
        } else {
            this._startDisplayIndicatorTimer(() => {
                const indicatorState = this._getLoadingIndicatorState('bottom');
                this._model.displayIndicator('bottom', indicatorState);
            });
        }
    }

    hideIndicator(direction: TIndicatorPosition): void {
        this._model.hideIndicator(direction);
    }

    shouldDisplayGlobalIndicator(): boolean {
        return !this._displayIndicatorTimer && !this._isPortionedSearch();
    }

    /**
     * Отображает глобальный индикатор загрузки.
     * Отображает его с задержкой в 2с.
     * @param {number} topOffset Отступ сверху для центрирования ромашки
     */
    displayGlobalIndicator(topOffset: number): void {
        this._startDisplayIndicatorTimer(
            () => this._model.displayIndicator('global', EIndicatorState.Loading, topOffset)
        );
    }

    shouldHideGlobalIndicator(): boolean {
        return !this._isPortionedSearch() && (!!this._displayIndicatorTimer || !!this._model.getGlobalIndicator());
    }

    /**
     * Скрывает глобальный индикатор загрузки
     */
    hideGlobalIndicator(): void {
        // TODO LI кривые юниты нужно фиксить
        if (!this._model || this._model.destroyed) {
            return;
        }

        this._model.hideIndicator('global');
        this._clearDisplayIndicatorTimer();
    }

    /**
     * Отображает индикатор долгой отрисовки элементов
     * @param indicatorElement DOM элемент индикатора
     * @param position Позиция индикатора
     * @void
     */
    displayDrawingIndicator(indicatorElement: HTMLElement, position: 'top'|'bottom'): void {
        if (!this._shouldHandleDrawingIndicator(position)) {
            return;
        }

        this._startDisplayIndicatorTimer(() => {
            // Устанавливаем напрямую в style, чтобы не ждать и не вызывать лишний цикл синхронизации,
            // т.к. долгая отрисовка равноценна медленному компьютеру и еще один цикл синхронизации
            // скорее всего не выполнится
            indicatorElement.style.display = '';
            indicatorElement.style.position = 'sticky';
            indicatorElement.style[position] = '0';
        });
    }

    /**
     * Скрывает индикатор долгой отрисовки элементов
     * @param indicatorElement DOM элемент индикатора
     * @param position Позиция индикатора
     */
    hideDrawingIndicator(indicatorElement: HTMLElement, position: 'top'|'bottom'): void {
        if (!this._shouldHandleDrawingIndicator(position)) {
            return;
        }

        this._clearDisplayIndicatorTimer();
        indicatorElement.style.display = 'none';
        indicatorElement.style.position = '';
        indicatorElement.style[position] = '';
    }

    /**
     * Пересчитывает индикаторы в заданном направлении
     * @param direction Направление, для которого будут пересчитаны индикаторы. all - пересчет всех индикаторов.
     * @param {boolean} scrollToFirstItem Нужно ли скроллить к первому элементу, чтобы добавить отступ под верхний триггер
     */
    recountIndicators(direction: 'up'|'down'|'all', scrollToFirstItem: boolean = false): void {
        // если поиск был прерван, то ничего делать не нужно, т.к. ромашек теперь точно не будет
        if (this._getSearchState() === SEARCH_STATES.ABORTED) {
            return;
        }

        switch (direction) {
            case 'up':
                this._recountTopIndicator(scrollToFirstItem);
                break;
            case 'down':
                this._recountBottomIndicator();
                break;
            case 'all':
                this._recountTopIndicator(scrollToFirstItem);
                this._recountBottomIndicator();
                // после перезагрузки скрываем глобальный индикатор
                if (this.shouldHideGlobalIndicator()) {
                    this.hideGlobalIndicator();
                }
                break;
        }
    }

    /**
     * Определяет есть ли отображенные индикаторы.
     * @return {boolean} Есть ли отображенные индикаторы.
     */
    hasDisplayedIndicator(): boolean {
        return !!(
            this._model.hasIndicator('global') ||
            this._model.getTopIndicator().isDisplayed() ||
            this._model.getBottomIndicator().isDisplayed()
        );
    }

    private _recountTopIndicator(scrollToFirstItem: boolean = false): void {
        // если сейчас порционный поиск и у нас еще не кончился таймер показа индикатора, то не нужно пересчитывать,
        // т.к. при порционном поиске индикатор покажется с задержкой в 2с, дожидаемся её
        if (this._isPortionedSearch() && this._displayIndicatorTimer) {
            return;
        }

        const isTopIndicatorDisplayed = this._model.getTopIndicator().isDisplayed();

        // всегда скрываем индикатор и если нужно, то мы его покажем. Сделано так, чтобы если индикатор
        // и так был показан, подскроллить к нему.
        this._model.hideIndicator('top');

        if (this.shouldDisplayTopIndicator()) {
            // смотри комментарий в _recountBottomIndicator
            if (this._isPortionedSearch()) {
                this.startDisplayPortionedSearch('top');
            } else {
                this.displayTopIndicator(scrollToFirstItem, false, isTopIndicatorDisplayed);
            }
        }
    }

    private _recountBottomIndicator(): void {
        // если сейчас порционный поиск и у нас еще не кончился таймер показа индикатора, то не нужно пересчитывать,
        // т.к. при порционном поиске индикатор покажется с задержкой в 2с, дожидаемся её
        if (this._isPortionedSearch() && this._displayIndicatorTimer) {
            return;
        }

        if (this.shouldDisplayBottomIndicator()) {
            // Возможен след кейс: список пустой, зовется релоад с итеративной загрузкой.
            // Событие rs не сработает и items не пересоздастся. Единственное, что случится это поменяется опция loading
            // Из-за этого мы попадем в updateOptions, в котором по hasMoreData вызовем пересчет ромашки.
            // И именно здесь определим по флагу iterative, показывать порционный поиск или просто ромашку.
            if (this._isPortionedSearch()) {
                this.startDisplayPortionedSearch('bottom');
            } else {
                this.displayBottomIndicator();
            }
        } else {
            this._model.hideIndicator('bottom');
        }
    }

    private _shouldDisplayIndicator(direction: 'up'|'down'): boolean {
        // если нет элементов, то покажем глобальный индикатор при долгой загрузке
        const hasItems = !!this._model.getCount();
        // порционынй поиск может быть включен не только в infinity навигации.
        const allowByNavigation = this._options.isInfinityNavigation && hasItems || this._isPortionedSearch();
        return allowByNavigation && !this._options.hasHiddenItemsByVirtualScroll(direction)
            && !this._options.shouldShowEmptyTemplate;
    }

    private _startDisplayIndicatorTimer(showIndicator: () => void): void {
        this._clearDisplayIndicatorTimer();
        this._displayIndicatorTimer = setTimeout(() => {
            if (!this._model || this._model.destroyed) {
                return;
            }

            this._displayIndicatorTimer = null;
            showIndicator();
        }, INDICATOR_DELAY);
    }

    private _clearDisplayIndicatorTimer(): void {
        if (this._displayIndicatorTimer) {
            clearTimeout(this._displayIndicatorTimer);
            this._displayIndicatorTimer = null;
        }
    }

    private _getLoadingIndicatorState(direction: TIndicatorPosition): TIndicatorState {
        let state = EIndicatorState.Loading;

        if (this._portionedSearchDirection === direction) {
            if (this.isDisplayedPortionedSearch()) {
                state = EIndicatorState.PortionedSearch;
            }
            if (this._searchState === SEARCH_STATES.STOPPED) {
                state = EIndicatorState.ContinueSearch;
            }
        }

        return state;
    }

    private _shouldHandleDrawingIndicator(position: 'top'|'bottom'): boolean {
        // Этими опциями в календаре полностью отключены ромашки, т.к. там не может быть долгой подгрузки.
        // И в IE из-за его медленной работы индикаторы вызывают прыжки
        const allowByOptions = this._options.attachLoadTopTriggerToNull && position === 'top' ||
            this._options.attachLoadDownTriggerToNull && position === 'bottom';
        // индикатор отрисовки мы должны показывать, только если не показан обычный индикатор в этом направлении
        const allowByIndicators = position === 'top' && !this._model.getTopIndicator().isDisplayed() ||
            position === 'bottom' && !this._model.getBottomIndicator().isDisplayed();
        // при порционном поиске индикатор всегда отрисовать и поэтому индикатор отрисовки не нужен
        return !this._isPortionedSearch() && allowByOptions && allowByIndicators;
    }

    // endregion LoadingIndicator

    // region PortionedSearch

    /**
     * Начинает отображение индикатора порционного поиска. Индикатор позывается только через 2с.
     * @param direction Направление, в котором будет отрисован индикатор
     */
    startDisplayPortionedSearch(direction: TPortionedSearchDirection): void {
        const currentState = this._getSearchState();
        if (currentState === SEARCH_STATES.NOT_STARTED || currentState === SEARCH_STATES.ABORTED) {
            this._setSearchState(SEARCH_STATES.STARTED);
            this._startDisplayPortionedSearchTimer(SEARCH_MAX_DURATION);
            this._portionedSearchDirection = direction;

            // скрываем оба индикатора, т.к. после начала порционного поиска индикатор
            // должен показаться только в одну сторону и через 2с
            this._model.hideIndicator('top');
            this._model.hideIndicator('bottom');
            this._startDisplayIndicatorTimer(
                () => this._model.displayIndicator(direction, EIndicatorState.PortionedSearch)
            );
        }
    }

    /**
     * Определяет, нужно ли приостанавливать поиск
     * @remark
     * Поиск нужно приостановить если страница успела загрузиться быстрее 30с(при первой подгрузке)
     * или быстрее 2м(при последующних подгрузках)
     */
    shouldStopDisplayPortionedSearch(): boolean {
        // если загрузилась целая страница раньше чем прервался порционный поиск, то приостанавливаем его
        // по стандарту в этом кейсе под страницей понимается viewport
        // проверять по скрытию триггера загрузку страницы не лучшая идея, т.к. изначально может быть много данных,
        // а первая порционная подгрузка тоже загрузит много данных => события скрытия триггера не будет.
        return this._viewportFilled && this.isDisplayedPortionedSearch() && !this._isSearchContinued();
    }

    /**
     * Приостанавливаем отображение порционного поиска.
     */
    stopDisplayPortionedSearch(): void {
        this.clearDisplayPortionedSearchTimer();
        this._setSearchState(SEARCH_STATES.STOPPED);
        // https://online.sbis.ru/opendoc.html?guid=0be69d45-286d-4f71-af2e-fe8653804da9
        if (this._model && !this._model.destroyed) {
            this._model.displayIndicator(this._portionedSearchDirection, EIndicatorState.ContinueSearch);
        }
        this._options.stopDisplayPortionedSearchCallback();
    }

    /**
     * Продолжаем отображение порционного поиска.
     * @param direction Новое направление порционного поиска. Оно может смениться, если сперва поиск шел вниз,
     * а после полной загрузки вниз, стали грузить вверх.
     */
    continueDisplayPortionedSearch(direction: TPortionedSearchDirection = this._portionedSearchDirection): void {
        this._setSearchState(SEARCH_STATES.CONTINUED);
        this._portionedSearchDirection = direction;
        this._startDisplayPortionedSearchTimer(SEARCH_CONTINUED_MAX_DURATION);
        this._model.displayIndicator(this._portionedSearchDirection, EIndicatorState.PortionedSearch);
    }

    /**
     * Прерываем отображение порционного поиска.
     */
    abortDisplayPortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.ABORTED);
        this.clearDisplayPortionedSearchTimer();
        // скрываем все индикаторы, т.к. после abort никаких подгрузок не будет
        this._model.hideIndicator('top');
        this._model.hideIndicator('bottom');
        this._model.hideIndicator('global');
    }

    /**
     * Заканчиваем отображение порционного поиска.
     */
    endDisplayPortionedSearch(): void {
        this._model.hideIndicator(this._portionedSearchDirection);
        this._portionedSearchDirection = null;
        this._setSearchState(SEARCH_STATES.NOT_STARTED);
        this.clearDisplayPortionedSearchTimer();
    }

    /**
     * Нужно ли перезапустить таймер для показа индикатора порционного поиска.
     * Перезапускаем, только если порционный поиск был начат, таймер запущен и еще не выполнился
     * и были подгруженны данные.
     */
    shouldResetDisplayPortionedSearchTimer(loadedItems: RecordSet): boolean {
        return loadedItems.getCount() && this.isDisplayedPortionedSearch() && !!this._displayIndicatorTimer;
    }

    /**
     * Перезапускаем таймер для показа индикатора порционного поиска
     */
    resetDisplayPortionedSearchTimer(): void {
        this._clearDisplayIndicatorTimer();
        this._startDisplayIndicatorTimer(
            () => this._model.displayIndicator(
                this._portionedSearchDirection, EIndicatorState.PortionedSearch
            )
        );
    }

    /**
     * Определяет, можно ли продолжить отображать порционный поиск.
     * @return {boolean} Можно ли продолжить отображать порционный поиск
     */
    shouldContinueDisplayPortionedSearch(direction?: 'up'|'down'): boolean {
        // Либо мы при остановке пытаемся подгрузить в другую сторону, либо поиск не приостановле
        const allowByStoppedState = direction && this.getPortionedSearchDirection() !== direction ||
            this._getSearchState() !== SEARCH_STATES.STOPPED;
        return allowByStoppedState && this._getSearchState() !== SEARCH_STATES.ABORTED;
    }

    /**
     * Проверяет, отображается ли сейчас порционный поиск
     * @return {boolean} Отображается ли сейчас порционный поиск
     */
    isDisplayedPortionedSearch(): boolean {
        return this._getSearchState() === SEARCH_STATES.STARTED || this._getSearchState() === SEARCH_STATES.CONTINUED;
    }

    /**
     * Возвращает направление порционного поиска.
     */
    getPortionedSearchDirection(): 'up'|'down' {
        // Приводим новые названия направлений к старым
        return DIRECTION_COMPATIBILITY[this._portionedSearchDirection] as 'up'|'down';
    }

    /**
     * Прерывает таймеры отображения порционного поиска
     */
    clearDisplayPortionedSearchTimer(): void {
        this._clearDisplayIndicatorTimer();
        if (this._portionedSearchTimer) {
            clearTimeout(this._portionedSearchTimer);
            this._portionedSearchTimer = null;
        }
    }

    private _startDisplayPortionedSearchTimer(duration: number): void {
        this._portionedSearchTimer = setTimeout(() => {
            this.stopDisplayPortionedSearch();
        }, duration);
    }

    private _setSearchState(state: SEARCH_STATES): void {
        this._searchState = state;
    }

    private _getSearchState(): SEARCH_STATES {
        return this._searchState;
    }

    private _isSearchContinued(): boolean {
        return this._getSearchState() === SEARCH_STATES.CONTINUED;
    }

    private _isPortionedSearch(): boolean {
        const metaData = this._options.items && this._options.items.getMetaData();
        return !!(metaData && metaData.iterative);
    }

    // endregion PortionedSearch
}
