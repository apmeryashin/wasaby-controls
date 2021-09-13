import { Collection, EIndicatorState } from 'Controls/display';
import { RecordSet } from 'Types/collection';
import { TIndicatorState } from 'Controls/_display/Indicator';

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

    private _displayIndicatorTimer: number;

    private _portionedSearchDirection: TPortionedSearchDirection;
    private _portionedSearchTimer: number = null;
    private _searchState: SEARCH_STATES = 0;

    constructor(options: IIndicatorsControllerOptions) {
        this._options = options;
        this._model = options.model;

        const hasItems = this._model && !!this._model.getCount();
        const displayBottomIndicator = this.shouldDisplayBottomIndicator() && hasItems;

        // Нижний индикатор сразу же показываем, т.к. не нужно скроллить
        if (displayBottomIndicator) {
            this.displayBottomIndicator();
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

        const shouldRecountAllIndicators = options.items && this._options.items !== options.items;
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
     * Обрабатывает пересоздание элементов в коллекции. (в частном случае подразумевает под этим перезагрзку списка)
     * При необходимости пересчитываеет индикаторы, начинает порционный поиск, сбрасывает оффсет у триггеров
     */
    onCollectionReset(): void {
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
        return this._options.attachLoadTopTriggerToNull && this._options.hasMoreDataToTop
            && this._shouldDisplayIndicator('up');
    }

    /**
     * Отображает верхний индикатор
     * @param {boolean} scrollToFirstItem Нужно ли скроллить к первому элементу, чтобы добавить отступ под триггер
     * @param onDrawItems // TODO удалить https://online.sbis.ru/opendoc.html?guid=e84068e3-0844-4930-89e3-1951efbaee25
     * @void
     */
    displayTopIndicator(scrollToFirstItem: boolean, onDrawItems?: boolean): void {
        const isDisplayedIndicator = this._model.getTopIndicator().isDisplayed();
        if (isDisplayedIndicator) {
            return;
        }

        const indicatorState = this._getLoadingIndicatorState();
        this._model.displayIndicator('top', indicatorState);

        if (scrollToFirstItem) {
            this._options.scrollToFirstItem(onDrawItems);
        }
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
        const isDisplayedIndicator = this._model.getBottomIndicator().isDisplayed();
        if (isDisplayedIndicator) {
            return;
        }

        const indicatorState = this._getLoadingIndicatorState();
        this._model.displayIndicator('bottom', indicatorState);
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
        return !this._isPortionedSearch() && (!!this._displayIndicatorTimer || !!this._model.getGlobalIndicator())
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
     * @param position Позиция индикатора
     * @void
     */
    displayDrawingIndicator(indicatorElement: HTMLElement, position: 'top'|'bottom'): void {
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
                // Вместе с пересчетом нижнего индикатора нужно пересчитать верхний триггер, т.к. мог отработать
                // виртуальный скролл и скрытый триггер нужно будет показать, пример:
                // https://online.sbis.ru/opendoc.html?guid=947f8f71-f261-474f-9efd-74b1db1bc5b5
                break;
            case 'all':
                this._recountTopIndicator(scrollToFirstItem);
                this._recountBottomIndicator();
                // после перезагрузки скрываем глобальный индикатор
                this.hideGlobalIndicator();
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

        if (this._options.attachLoadTopTriggerToNull) {
            // всегда скрываем индикатор и если нужно, то мы его покажем. Сделано так, чтобы если индикатор
            // и так был показан, подскроллить к нему.
            this._model.hideIndicator('top');
        }

        if (this.shouldDisplayTopIndicator()) {
            this.displayTopIndicator(scrollToFirstItem, false);
        }
    }

    private _recountBottomIndicator(): void {
        // если сейчас порционный поиск и у нас еще не кончился таймер показа индикатора, то не нужно пересчитывать,
        // т.к. при порционном поиске индикатор покажется с задержкой в 2с, дожидаемся её
        if (this._isPortionedSearch() && this._displayIndicatorTimer) {
            return;
        }

        if (this.shouldDisplayBottomIndicator()) {
            this.displayBottomIndicator();
        } else {
            this._model.hideIndicator('bottom');
        }
    }

    private _shouldDisplayIndicator(direction: 'up'|'down'): boolean {
        return this._options.isInfinityNavigation && !this._options.hasHiddenItemsByVirtualScroll(direction)
            && !this._options.shouldShowEmptyTemplate;
    }

    private _startDisplayIndicatorTimer(showIndicator: () => void): void {
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

    private _getLoadingIndicatorState(): TIndicatorState {
        let state = EIndicatorState.Loading;

        if (this.isDisplayedPortionedSearch()) {
            state = EIndicatorState.PortionedSearch;
        }
        if (this._searchState === SEARCH_STATES.STOPPED) {
            state = EIndicatorState.ContinueSearch;
        }

        return state;
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
     * @param pageLoaded Признак, который означает что загрузилась целая страница
     */
    shouldStopDisplayPortionedSearch(pageLoaded: boolean): boolean {
        return pageLoaded && this.isDisplayedPortionedSearch() && !this._isSearchContinued();
    }

    /**
     * Приостанавливаем отображение порционного поиска.
     */
    stopDisplayPortionedSearch(): void {
        this.clearDisplayPortionedSearchTimer();
        this._setSearchState(SEARCH_STATES.STOPPED);
        this._model.displayIndicator(this._portionedSearchDirection, EIndicatorState.ContinueSearch);
        this._options.stopDisplayPortionedSearchCallback();
    }

    /**
     * Продолжаем отображение порционного поиска.
     */
    continueDisplayPortionedSearch(): void {
        this._setSearchState(SEARCH_STATES.CONTINUED);
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
     * Нужно ли перезапустить таймер для показа индикатора порционного поиска
     * Перезапускаем, только если порционный поиск был начат, таймер запущен и еще не выполнился
     */
    shouldResetDisplayPortionedSearchTimer(): boolean {
        return this.isDisplayedPortionedSearch() && !!this._displayIndicatorTimer;
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
    shouldContinueDisplayPortionedSearch(): boolean {
        // TODO LI точно ли нужна проверка на STOPPED
        return this._getSearchState() !== SEARCH_STATES.STOPPED && this._getSearchState() !== SEARCH_STATES.ABORTED;
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
