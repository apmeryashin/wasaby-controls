import {debounce} from 'Types/function';
import {
    IFixedEventData,
    isHidden,
    MODE,
    POSITION,
    SHADOW_VISIBILITY,
    SHADOW_VISIBILITY_BY_CONTROLLER,
    IRegisterEventData,
    TYPE_FIXED_HEADERS
} from './Utils';
import {SHADOW_VISIBILITY as SCROLL_SHADOW_VISIBILITY} from 'Controls/_scroll/Container/Interface/IShadows';
import StickyBlock from 'Controls/_scroll/StickyBlock';
import fastUpdate from './FastUpdate';
import {IPositionOrientation} from './../StickyBlock/Utils';
import SizeAndVisibilityObserver, {STACK_OPERATION} from 'Controls/_scroll/StickyBlock/Controller/SizeAndVisibilityObserver';
import {SyntheticEvent} from 'Vdom/Vdom';
import Group from './Group';
import {getDecomposedPosition} from './../StickyBlock/Utils/getDecomposedPosition';

// @ts-ignore

interface IShadowVisibility {
    top: SCROLL_SHADOW_VISIBILITY;
    bottom: SCROLL_SHADOW_VISIBILITY;
    left: SCROLL_SHADOW_VISIBILITY;
    right: SCROLL_SHADOW_VISIBILITY;
}

interface IStickyHeaderController {
    fixedCallback?: (position: string) => void;
    resizeCallback?: () => void;
}

function isLastVisibleModes(shadowVisibility: SHADOW_VISIBILITY): boolean {
    return shadowVisibility === SHADOW_VISIBILITY.lastVisible || shadowVisibility === SHADOW_VISIBILITY.initial;
}

class StickyHeaderController {
    // Register of all registered headers. Stores references to instances of headers.
    private _headers: object;
    // Ordered list of headers.
    private _headersStack: object;
    // The list of headers that are stuck at the moment.
    private _fixedHeadersStack: object;
    // Если созданный заголвок невидим, то мы не можем посчитать его позицию.
    // Учтем эти заголовки после ближайшего события ресайза.
    private _delayedHeaders: IRegisterEventData[] = [];
    private _initialized: boolean = false;
    private _syncUpdate: boolean = false;
    private _updateTopBottomInitialized: boolean = false;
    private _sizeObserver: SizeAndVisibilityObserver;
    private _canScroll: boolean = false;
    private _resizeHandlerDebounced: Function;
    private _container: HTMLElement;
    private _options: IStickyHeaderController = {};
    private _shadowVisibility: IShadowVisibility = {
        top: SCROLL_SHADOW_VISIBILITY.AUTO,
        bottom: SCROLL_SHADOW_VISIBILITY.AUTO,
        left: SCROLL_SHADOW_VISIBILITY.AUTO,
        right: SCROLL_SHADOW_VISIBILITY.AUTO
    };

    // TODO: Избавиться от передачи контрола доработав логику ResizeObserverUtil
    // https://online.sbis.ru/opendoc.html?guid=4091b62e-cca4-45d8-834b-324f3b441892
    constructor(options: IStickyHeaderController = {}) {
        this._headersStack = {
            top: [],
            bottom: [],
            left: [],
            right: []
        };
        this._fixedHeadersStack = {
            top: [],
            bottom: [],
            left: [],
            right: []
        };
        this._options.fixedCallback = options.fixedCallback;
        this._options.resizeCallback = options.resizeCallback;
        this._headers = {};
        this._resizeHandlerDebounced = debounce(this.resizeHandler.bind(this), 50);
        this._sizeObserver = new SizeAndVisibilityObserver(
            this._headersResizeHandler.bind(this), this.resizeHandler.bind(this), this._headers
        );
    }

    init(container: HTMLElement): Promise<void> {
        this.updateContainer(container);
        this._initialized = true;
        this._sizeObserver.init(this._container);
        return this._registerDelayed();
    }

    updateContainer(container: HTMLElement): void {
        this._container = container;
        this._sizeObserver.updateContainer(container);
    }

    destroy(): void {
        this._sizeObserver.destroy();
    }

    /**
     * Returns the true if there is at least one fixed header.
     * @param position
     */
    hasFixed(position: POSITION): boolean {
        return !!this._fixedHeadersStack[position].length;
    }

    hasShadowVisible(position: POSITION): boolean {
        const fixedHeaders = this._fixedHeadersStack[position];
        for (const id of fixedHeaders) {
            // TODO: https://online.sbis.ru/opendoc.html?guid=cc01c11d-7849-4c0c-950b-03af5fac417b
            if (this._headers[id] && this._headers[id].inst.shadowVisibility !== SHADOW_VISIBILITY.hidden) {
                return true;
            }
        }

        return false;
    }

    getFirstReplaceableHeader(position: POSITION): object {
        for (const headerId of this._headersStack[position]) {
            if (this._headers[headerId].mode === MODE.replaceable) {
                return this._headers[headerId];
            }
        }
    }

    /**
     * Возвращает высоты заголовков.
     * @function
     * @param {POSITION} [position] Высоты заголовков сверху/снизу
     * @param {TYPE_FIXED_HEADERS} [type]
     * @param considerOffsetTop Если true, то учитыввает опцию offsetTop у фиксированных блоков
     * @returns {Number}
     */
    getHeadersHeight(position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed,
                     considerOffsetTop: boolean = true): number {
        // type, предпологается, в будущем будет иметь еще одно значение, при котором будет высчитываться
        // высота всех зафиксированных на текущий момент заголовков.
        let height: number = 0;
        let replaceableHeight: number = 0;
        let header;
        let hasOffsetTop: boolean = false;
        const headers = this._headersStack;
        for (const headerId of headers[position]) {
            header = this._headers[headerId];

            if (!header || header.inst.shadowVisibility === SHADOW_VISIBILITY.hidden) {
                continue;
            }

            hasOffsetTop = hasOffsetTop || !!header.inst.offsetTop;

            // Для всех режимов кроме allFixed пропустим все незафиксированные заголовки
            let ignoreHeight: boolean = type !== TYPE_FIXED_HEADERS.allFixed &&
                !this._fixedHeadersStack[position].includes(headerId);

            // В режиме изначально зафиксированных заголовков не считаем заголовки
            // которые не были изначально зафскированы
            ignoreHeight = ignoreHeight || (type === TYPE_FIXED_HEADERS.initialFixed && !header.fixedInitially);

            // Если у заголовка задан offsetTop, то учитываем его во всех ражимах в любом случае.
            ignoreHeight = ignoreHeight && !(hasOffsetTop && header.fixedInitially);

            if (ignoreHeight) {
                continue;
            }

            // If the header is "replaceable", we take into account the last one after all "stackable" headers.
            if (header.mode === 'stackable') {
                if (header.fixedInitially || header.inst.offsetTop ||
                    type === TYPE_FIXED_HEADERS.allFixed || type === TYPE_FIXED_HEADERS.fixed) {
                    height += header.inst.height;
                    if (considerOffsetTop && position === POSITION.top) {
                        height += header.inst.offsetTop;
                    }
                }
                replaceableHeight = 0;
            } else if (header.mode === 'replaceable') {
                replaceableHeight = header.inst.height;
            }
        }
        return height + replaceableHeight;
    }

    setCanScroll(canScroll: boolean): Promise<void> {
        if (canScroll === this._canScroll) {
            return Promise.resolve();
        }

        this._canScroll = canScroll;
        if (this._canScroll && this._initialized) {
            return this._registerDelayed();
        }

        return Promise.resolve();
    }

    setShadowVisibility(topShadowVisibility: SCROLL_SHADOW_VISIBILITY,
                        bottomShadowVisibility: SCROLL_SHADOW_VISIBILITY,
                        leftShadowVisibility: SCROLL_SHADOW_VISIBILITY,
                        rightShadowVisibility: SCROLL_SHADOW_VISIBILITY): void {
        this._shadowVisibility[POSITION.top] = topShadowVisibility;
        this._shadowVisibility[POSITION.bottom] = bottomShadowVisibility;
        this._shadowVisibility[POSITION.left] = leftShadowVisibility;
        this._shadowVisibility[POSITION.right] = rightShadowVisibility;
        this._updateShadowsVisibility();
        // Если есть только что зарегистрированные и не просчитанные заголовки, что бы не было мигания теней,
        // сразу, синхронно не дожидаясь срабатывания IntersectionObserver посчитаем зафиксированы ли ониё.
        if (topShadowVisibility !== 'hidden' && this._delayedHeaders.length) {
            this._syncUpdate = true;
        }
    }

    _updateShadowsVisibility(): void {
        for (const position of [POSITION.top, POSITION.bottom, POSITION.left, POSITION.right]) {
            const headersStack: [] = this._headersStack[position];
            const lastHeaderId = this._getLastFixedHeaderWithShadowId(position);
            for (const headerId of headersStack) {
                if (this._fixedHeadersStack[position].includes(headerId)) {
                    const header: IRegisterEventData = this._headers[headerId];
                    let visibility: SHADOW_VISIBILITY_BY_CONTROLLER = SHADOW_VISIBILITY_BY_CONTROLLER.auto;

                    if (header.inst.shadowVisibility !== SHADOW_VISIBILITY.hidden) {
                        if (this._shadowVisibility[position] === SCROLL_SHADOW_VISIBILITY.HIDDEN) {
                            visibility = SHADOW_VISIBILITY_BY_CONTROLLER.hidden;
                        } else if (this._shadowVisibility[position] === SCROLL_SHADOW_VISIBILITY.VISIBLE) {
                            // Если снаружи включили отбражать тени всегда, то для заголовков сконфигурированных
                            // отображать тень только у последнего, принудительно отключим тени на всех заголовках
                            // кроме последнего, а на последнем принудительно включим.
                            if (isLastVisibleModes(header.inst.shadowVisibility) || header.mode === MODE.replaceable) {
                                visibility = headerId === lastHeaderId ?
                                    SHADOW_VISIBILITY_BY_CONTROLLER.visible : SHADOW_VISIBILITY_BY_CONTROLLER.hidden;
                            } else {
                                visibility = SHADOW_VISIBILITY_BY_CONTROLLER.visible;
                            }
                        } else {
                            // Принудительно отключим тени у всех заголовков кроме последнего если они сконфигурированы
                            // отображать тень только у последнего.
                            if (
                                !(
                                    (position === POSITION.left || position === POSITION.right) &&
                                    header.inst instanceof Group &&
                                    !header.position.vertical && header.position.horizontal
                                ) &&
                                isLastVisibleModes(header.inst.shadowVisibility) && (headerId !== lastHeaderId)
                            ) {
                                visibility = SHADOW_VISIBILITY_BY_CONTROLLER.hidden;
                            }
                        }
                    }

                    header.inst.updateShadowVisibility(visibility, position);
                }
            }
        }
    }

    registerHandler(event,
                    data: IRegisterEventData,
                    register: boolean,
                    syncUpdate: boolean = false,
                    syncDomOptimization: boolean = true): Promise<void> {
        if (!syncDomOptimization && register) {
            data.inst.setSyncDomOptimization(syncDomOptimization);
        }
        const promise = this._register(data, register, syncUpdate);
        this._clearOffsetCache();
        event.stopImmediatePropagation();
        if (syncUpdate) {
            this._syncUpdate = true;
        }
        return promise;
    }

    _register(data: IRegisterEventData, register: boolean, syncUpdate: boolean = false): Promise<void> {
        if (register) {
            this._headers[data.id] = {
                ...data,
                fixedInitially: false,
                offset: {}
            };

            // Проблема в том, что чтобы узнать положение заголовка нам надо снять position: sticky.
            // Это приводит к layout. И так для каждого заголовка. Создадим список всех заголовков
            // которые надо обсчитать в этом синхронном участке кода и обсчитаем их за раз в микротаске,
            // один раз сняв со всех загоовков position: sticky. Если контроллер не видим, или еще не замонтирован,
            // то положение заголовков рассчитается по событию ресайза или в хуке _afterMount.
            // Невидимые заголовки нельзя обсчитать, потому что нельзя узнать их размеры и положение.
            this._delayedHeaders.push(data);

            if (!isHidden(data.inst.getHeaderContainer()) && (this._initialized || syncUpdate) && this._canScroll) {
                return Promise.resolve().then(this._registerDelayed.bind(this));
            }
        } else {
            // При 'отрегистриации' удаляем заголовок из всех возможных стэков
            this._sizeObserver.unobserve(this._headers[data.id].inst);
            delete this._headers[data.id];
            this._removeFromStack(data.id, this._headersStack);
            this._removeFromStack(data.id, this._fixedHeadersStack);
            this._removeFromDelayedStack(data.id);
        }
        return Promise.resolve();
    }

    private _headersResizeHandler(headers): void {
        Object.entries(headers).forEach(([, updateHeader]) => {
            this._changeHeadersStackByHeader(updateHeader.header, updateHeader.operation);
        });

        this.resizeHandler();

        const addedHeaders = Object.entries(headers)
            .filter(([, header]) => header.operation === STACK_OPERATION.add)
            .map(([headerId, header]) => parseInt(headerId, 10));

        if (addedHeaders.length) {
            this._updateHeadersFixedPositions(addedHeaders);
            this._updateShadowsVisibility();
        }
        this._callResizeCallback();
    }

    private _changeHeadersStackByHeader(header: StickyBlock, operation: STACK_OPERATION): void {
        if (operation === STACK_OPERATION.remove) {
            this._removeFromStack(header.id, this._headersStack);
            // Если заголовок опять в будущем отобразится нужно будет пересчитать его offset.
            this._headers[header.id].offset = {};
        } else if (operation === STACK_OPERATION.add) {
            const headerPosition = this._headers[header.id].position;
            const positions = getDecomposedPosition(headerPosition);

            positions.forEach((position) => {
                const inHeadersStack = this._headersStack[position].some((headerId) => headerId === header.id);
                // В operations panel при инициализации контент намеренно скрывают, вешая нулевую высоту.
                // Из-за этого вначале заголовок во время обсчета оффсетов запишет себе height = 0,
                // а после, когда он покажется, по ресайз обсёрверу будет опять добавление
                // в headersStack, т.к предыдущая высота была равна 0.
                if (!inHeadersStack) {
                    this._addToHeadersStack(header.id, headerPosition, true);
                }
            });
        }
    }

    /**
     * @param {UICommon/Events:SyntheticEvent} event
     * @param {Controls/_scroll/StickyBlock/Types/InformationFixationEvent.typedef} fixedHeaderData
     * @private
     */
    fixedHandler(event: SyntheticEvent, fixedHeaderData: IFixedEventData): void {
        event.stopImmediatePropagation();
        const isFixationUpdated = this._updateFixationState(fixedHeaderData);
        if (!isFixationUpdated) {
            return;
        }

        // fixedPosition пуст когда идет открепление
        const position = fixedHeaderData.fixedPosition || fixedHeaderData.prevPosition;
        // If the header is single, then it makes no sense to send notifications.
        // Thus, we prevent unnecessary force updates on receiving messages.
        const isSingleHeader = fixedHeaderData.fixedPosition &&
            this._fixedHeadersStack[fixedHeaderData.fixedPosition].length === 1;

        if (!isSingleHeader) {
            for (const id in this._headers) {
                if (this._headers.hasOwnProperty(id)) {
                    this._headers[id].inst.updateShadowVisible([
                        this._getLastFixedHeaderWithShadowId(POSITION.top),
                        this._getLastFixedHeaderWithShadowId(POSITION.bottom)
                    ], false);
                }
            }
        }
        // Если зафиксировался (отфиксировался) replaceable заголовок, значит другой replaceable заголовок
        // (если такой есть) стал не виден (виден). Получим id этого заголовка и стрельнем у него событием fixed.
        const headerFixedChangedVisibilityId = this._getHeaderFixedChangedVisibilityId(fixedHeaderData, position);
        if (headerFixedChangedVisibilityId !== undefined) {
            const isFixed = !fixedHeaderData.fixedPosition;
            this._headers[headerFixedChangedVisibilityId].inst.fakeFixedNotifier(isFixed);
        }
        this._updateShadowsVisibility();
        // Спилить после того ак удалим старый скролл контейнер. Используется только там.
        this._callFixedCallback(position);
    }

    private _getHeaderFixedChangedVisibilityId(fixedHeaderData: IFixedEventData, position: POSITION): number {
        let resultId;
        if (this._headers[fixedHeaderData.id].mode === MODE.replaceable) {
            const indexInHeadersStack = this._headersStack[position].indexOf(fixedHeaderData.id);
            const tempResultId = this._headersStack[position][indexInHeadersStack - 1];
            if (tempResultId !== undefined && this._headers[tempResultId].mode === MODE.replaceable) {
                resultId = tempResultId;
            }
        }
        return resultId;
    }

    _getLastFixedHeaderWithShadowId(position: POSITION): number {
        let headerWithShadow: number;
        // Тень рисуем у последнего не заменяемого заголовка, либо у первого заменяемого.
        // Это позволяет не перерисовывать тени при откреплении/зареплении следующих заголовков.
        for (const headerId of this._headersStack[position]) {
            const header = this._headers[headerId];
            if (this._fixedHeadersStack[position].includes(headerId) &&
                header.inst.shadowVisibility !== SHADOW_VISIBILITY.hidden &&
                !isHidden(header.inst.getHeaderContainer())) {
                headerWithShadow = headerId;
                if (this._headers[headerId].mode === 'replaceable') {
                    break;
                }
            }
        }
        return headerWithShadow;
    }

    private _callFixedCallback(position: string): void {
        if (typeof this._options.fixedCallback === 'function') {
            this._options.fixedCallback(position);
        }
    }

     private _callResizeCallback(): void {
        if (typeof this._options.resizeCallback === 'function') {
            this._options.resizeCallback();
        }
    }

    _updateTopBottomHandler(event: Event): void {
        event.stopImmediatePropagation();

        this._updateTopBottom();
    }

    controlResizeHandler(): void {
        if (!this._initialized) {
            return;
        }
        this._sizeObserver.controlResizeHandler();
        // TODO: Переделать по https://online.sbis.ru/opendoc.html?guid=73950100-bf2c-44cf-9e59-d29ddbb58d3a
        // Чинит проблемы https://online.sbis.ru/opendoc.html?guid=a6f1e8c3-dd71-43b9-a1a8-9270c2f85c0d
        // Нужно как то сообщать контроллеру фиксированных блоков, что блок стал видимым, что бы рассчитать его.
        this._registerDelayed();
    }

    resizeHandler() {
        // Игнорируем все события ресайза до _afterMount.
        // В любом случае в _afterMount мы попробуем рассчитать положение заголовков.
        if (this._initialized) {
            this._registerDelayed();
            const isSimpleHeaders = this._headersStack.top.length <= 1 && this._headersStack.bottom.length <= 1;
            if (!isSimpleHeaders) {
                this._updateTopBottom();
            }
        }
    }

    private _resetSticky(): void {
        for (const id in this._headers) {
            if (this._headers.hasOwnProperty(id)) {
                this._headers[id].inst.resetSticky();
            }
        }
    }

    private _registerDelayed(): Promise<void> {
        const delayedHeadersCount = this._delayedHeaders.length;

        if (!delayedHeadersCount || !this._canScroll) {
            return Promise.resolve();
        }

        this._resetSticky();

        return fastUpdate.measure(() => {
            const newHeaders: [] = [];
            this._delayedHeaders = this._delayedHeaders.filter((header: IRegisterEventData) => {
                if (!isHidden(header.inst.getHeaderContainer())) {
                    this._sizeObserver.observe(header.inst);
                    const headerPosition = header.position;
                    this._addToHeadersStack(header.id, headerPosition);
                    newHeaders.push(header.id);
                    return false;
                }
                return true;
            });

            // Найдем среди новых заголовков те, что зафиксированы, и не дожидаясь
            // срабатывания IntersectionObserver синхронно установим им состояние фиксации.
            // Таким образом избавимся от мигания тени при построении на клиенте.
            if (this._syncUpdate) {
                this._updateHeadersFixedPositions(newHeaders);
                this._syncUpdate = false;
            }

            if (delayedHeadersCount !== this._delayedHeaders.length) {
                this._updateFixedInitially(POSITION.top);
                this._updateFixedInitially(POSITION.bottom);
                this._updateTopBottomDelayed();
                this._updateShadowsVisibility();
                this._clearOffsetCache();
                this._callResizeCallback();
            }
        });
    }

    _updateHeadersFixedPositions(headers: string[]) {
        const position = POSITION.top;
        const headersStack: [] = this._headersStack[position];
        let fixedHeadersHeight: number = 0;
        let replaceableHeight: number = 0;

        // Спилить метод после того как будет сделана задача
        // https://online.sbis.ru/opendoc.html?guid=8089ac76-89d3-42c0-9ef2-8b187014559f

        const isFixed: Function = (headerId: number, headersHeight) => {
            return this._getHeaderOffset(headerId, position) < headersHeight;
        };

        for (let i = 0; i < headersStack.length; i++) {
            const headerId: number = headersStack[i];
            const header = this._headers[headerId];
            // По контролРесайзу попадаем в этот метод, ресайзОбсёрвер к этому моменту может еще не стрельнуть
            // таким образом получится, что в headersStack могут лежать скрытые стикиБлоки.
            if (isHidden(header.inst.getHeaderContainer())) {
                continue;
            }
            if (headers.includes(headerId)) {
                const currentHeadersHeight: number = fixedHeadersHeight + replaceableHeight;
                if (isFixed(headerId, currentHeadersHeight)) {
                    if (isLastVisibleModes(header.inst.shadowVisibility)) {
                        const nextHeaderId = headersStack[i + 1];
                        if (!nextHeaderId || !isFixed(nextHeaderId, currentHeadersHeight + header.inst.height)) {
                            header.inst.setFixedPosition(POSITION.top);
                        }
                    } else {
                        header.inst.setFixedPosition(POSITION.top);
                    }
                }
            }

            if (header.inst.shadowVisibility === SHADOW_VISIBILITY.hidden) {
                continue;
            }

            // If the header is "replaceable", we take into account the last one after all "stackable" headers.
            if (header.mode === 'stackable') {
                fixedHeadersHeight += header.inst.height + header.inst.offsetTop;
                replaceableHeight = 0;
            } else if (header.mode === 'replaceable') {
                replaceableHeight = header.inst.height;
            }
        }
    }

    /**
     * Update information about the fixation state.
     * @param {Controls/_scroll/StickyBlock/Types/InformationFixationEvent.typedef} data Data about the header that changed the fixation state.
     */
    private _updateFixationState(data: IFixedEventData) {
        let isFixationUpdated = false;
        if (!!data.fixedPosition && !data.isFakeFixed) {
            this._fixedHeadersStack[data.fixedPosition].push(data.id);
            isFixationUpdated = true;
        }
        if (!!data.prevPosition) {
            const positionInGroup = this._fixedHeadersStack[data.prevPosition].indexOf(data.id);
            if (positionInGroup !== -1 && !data.isFakeFixed) {
                this._fixedHeadersStack[data.prevPosition].splice(positionInGroup, 1);
                isFixationUpdated = true;
            }
        }
        return isFixationUpdated;
    }

    /**
     * Возвращает смещение заголовка относительно контейнера контроллера.
     * Кэширует вычисленные положения заголовков чтобы не вычислять их повторно. Несмотря на то, что мы не вносим
     * изменений в дом дерево, вызовы getBoundingClientRect выполняются достаточно долго.
     * После всех рассчетов необходимо вызывать _clearOffsetCache, что бы очистить кэш.
     * @param id
     * @param position
     * @private
     */
    private _getHeaderOffset(id: number, position: string, needUpdateOffset = false) {
        const header = this._headers[id];
        // Нужно пересчитать оффсет в случае, если после ресайза добавляются заголовки в headersStack.
        if (header.offset[position] === undefined || needUpdateOffset) {
            header.offset[position] = this._getHeaderOffsetByContainer(this._container, id, position);
        }
        return header.offset[position];
    }

    private _getHeaderOffsetByContainer(container: HTMLElement, id: number, position: string) {
        const header = this._headers[id];
        return header.inst.getOffset(container, position);
    }

    /**
     * Очищает кэш вычисленных смещений заголовков относительно контроллера.
     * @private
     */
    private _clearOffsetCache() {
        for (const id in this._headers) {
            if (this._headers.hasOwnProperty(id)) {
                this._headers[id].offset = {};
            }
        }
    }

    private _addToHeadersStack(id: number,
                               headerPosition: IPositionOrientation,
                               needUpdateOffset: boolean = false): void {
        const positions = getDecomposedPosition(headerPosition);
        positions.forEach((position) => {
            const headersStack = this._headersStack[position];
            const newHeaderOffset = this._getHeaderOffset(id, position, needUpdateOffset);
            const headerContainerSizes = this._headers[id].inst.getHeaderContainer().getBoundingClientRect();
            let headerContainerSize;
            if (position === 'left' || position === 'right') {
                headerContainerSize = headerContainerSizes.width;
            } else {
                headerContainerSize = headerContainerSizes.height;
            }

            // Ищем позицию первого элемента, смещение которого больше текущего.
            // Если смещение у элементов одинаковое, но у добавляемоего заголовка высота равна нулю,
            // то считаем, что добавляемый находится выше. Вставляем новый заголовок в этой позиции.
            let index = headersStack.findIndex((headerId) => {
                const headerOffset = this._getHeaderOffset(headerId, position, needUpdateOffset);
                return headerOffset > newHeaderOffset ||
                    (headerOffset === newHeaderOffset && headerContainerSize === 0);
            });
            index = index === -1 ? headersStack.length : index;
            headersStack.splice(index, 0, id);
        });
    }

    private _updateFixedInitially(position: POSITION): void {
        const container: HTMLElement = this._container;
        const headersStack: number[] = this._headersStack[position];
        const content: HTMLCollection = container.children;
        const contentContainer: Element = position === POSITION.top ? content[0] : content[content.length - 1];

        let headersHeight: number = 0;
        let headerInst: StickyBlock;

        for (const headerId: number of headersStack) {
            headerInst = this._headers[headerId].inst;
            let headerOffset = this._getHeaderOffsetByContainer(contentContainer, headerId, position);
            if (headerOffset !== 0) {
                // При расчете высоты заголовка, мы учитываем devicePixelRatio. Нужно его учитывать и здесь, иначе
                // расчеты не сойдутся. Делайем это только если headerOffset не равен нулю, т.е. после первой итерации.
                headerOffset -= Math.abs(1 - StickyBlock.getDevicePixelRatio());
            }

            headerOffset += headerInst.offsetTop;

            if (headersHeight >= headerOffset) {
                this._headers[headerId].fixedInitially = true;
            }
            headersHeight += headerInst.height;
        }
    }

    private _removeFromStack(id: number, stack: object): void {
        let isUpdated = false;
        let index = stack.top.indexOf(id);

        if (index !== -1) {
            stack.top.splice(index, 1);
            isUpdated = true;
        }
        index = stack.bottom.indexOf(id);
        if (index !== -1) {
            stack.bottom.splice(index, 1);
            isUpdated = true;
        }
        if (isUpdated) {
            this._updateTopBottom();
        }
    }

    private _removeFromDelayedStack(id: number): void {
        this._delayedHeaders.forEach((header, index) => {
            if (header.id === id) {
                this._delayedHeaders.splice(index, 1);
            }
        });
    }

    updateStickyMode(stickyId: number, newMode: MODE): void {
        this._headers[stickyId].mode = newMode;
        this._updateTopBottom();
    }

    private _updateTopBottom() {
        // Обновляем положение заголовков один раз в микротаске
        if (this._updateTopBottomInitialized) {
            return;
        }
        this._updateTopBottomInitialized = true;
        return Promise.resolve().then(() => {
            return this._updateTopBottomDelayed();
        });
    }

    private _isLastIndex(srcArray: object[], index: number): boolean {
        return index === (srcArray.length - 1);
    }

    private _getGeneralParentNode(header0: IRegisterEventData, header1: IRegisterEventData): Node {
        const getGeneralParentNode = (container0: IRegisterEventData, container1: IRegisterEventData) => {
            let parentElementOfContainer0 = container0.inst.getHeaderContainer().parentElement;
            const parentElementOfContainer1 = container1.inst.getHeaderContainer().parentElement;
            while (parentElementOfContainer0 !== parentElementOfContainer1 &&
            parentElementOfContainer0 !== document.body) {
                parentElementOfContainer0 = parentElementOfContainer0.parentElement;
            }

            if (parentElementOfContainer0 === document.body) {
                const group0 = container0.inst.getHeaderContainer().closest('.controls-StickyHeader__isolatedGroup');
                const group1 = container1.inst.getHeaderContainer().closest('.controls-StickyHeader__isolatedGroup');
                if (group0 !== null && group1 !== null && group0  === group1) {
                    parentElementOfContainer0 = group0 as HTMLElement;
                }
            }
            return parentElementOfContainer0;
        };

        let parentElement = getGeneralParentNode(header0, header1);
        // Если общий родитель body, то пройдемся вверх по дереву от второго заголовка, может оказаться что заголовок1
        // лежит ниже заголовка0.
        if (parentElement === document.body) {
            parentElement = getGeneralParentNode(header1, header0);
        }
        return parentElement;
    }

    private _updateTopBottomDelayed(): void {
        const offsets: Record<POSITION, Record<string, number>> = {
                top: {},
                bottom: {},
                left: {},
                right: {}
            };

        this._resetSticky();

        fastUpdate.measure(() => {
            let header: IRegisterEventData;
            let curHeader: IRegisterEventData;
            let prevHeader: IRegisterEventData;

            // Проверяем, имеет ли заголовок в родителях прямых родителей предыдущих заголовков.
            // Если имеет, значит заголовки находятся в одном контейнере -> высчитываем offset и добавляем к заголовку.
            for (const position of [POSITION.top, POSITION.bottom, POSITION.left, POSITION.right]) {
                this._headersStack[position].reduce((offset, headerId, i) => {
                    header = this._headers[headerId];
                    // Если заголовок скрыт, то не будем ему проставлять offset.
                    // Возникает следующая ошибка: невидимым заголовкам проставляется одинаковый offset, т.к
                    // размер у скрытого заголовка получить нельзя и им задаётся смещение первого видимого заголовка.
                    // В будущем, когда заголовки покажутся, они будут все иметь одинаковый offset
                    // из-за чего в неправильном порядке запишутся в headersStack.
                    if (isHidden(header.inst.getHeaderContainer())) {
                        return offset;
                    }
                    curHeader = null;

                    // Если предыдущий заголовок replaceable и не имеет общих родителей с текущим - нужно вычесть
                    // со смещения высоту последнего stackable заголовка.
                    prevHeader = this._headers[this._headersStack[position][i - 1]];
                    if (prevHeader?.mode === 'replaceable' && header.mode === 'stackable') {
                        const parentNode = this._getGeneralParentNode(prevHeader, header);
                        if (parentNode === document.body) {
                            const size = this._getPrevStackableHeaderHeight(i, position);
                            offset -= size;
                        }
                    }

                    offsets[position][headerId] = offset;
                    if (
                        header.mode === 'stackable' && header.position?.vertical &&
                        (position === 'top' || position === 'bottom')
                    ) {
                        if (!this._isLastIndex(this._headersStack[position], i)) {
                            const curHeaderId = this._headersStack[position][i + 1];
                            curHeader = this._headers[curHeaderId];
                            // От текущего заголовка по стэку двигаемся к началу и ищем прямых родителей
                            for (let j = i; j >= 0; j--) {
                                prevHeader = this._headers[this._headersStack[position][j]];
                                let size = this._getHeaderSize(header, position);
                                const generalParentNode = this._getGeneralParentNode(curHeader, prevHeader);
                                if (generalParentNode !== document.body) {
                                    if (position === 'top' || position === 'bottom') {
                                        // Сохраним высоты по которым рассчитали позицию заголовков,
                                        // что бы при последующих изменениях понимать, надо ли пересчитывать их позиции.
                                        this._sizeObserver.updateElementHeight(header.inst.getHeaderContainer(), size);
                                    }
                                    return offset + size;
                                } else if (j > 0 && prevHeader.mode === 'stackable') {
                                    // Бывают ситуации, когда какие-то из предыдущих заголовков могут находиться
                                    // в контейнерах, которые не являются родительским для текущего.
                                    // Значит нужно их не учитывать в смещении.
                                    size = this._getHeaderSize(prevHeader, position);
                                    offset -= size;
                                }
                            }
                            return 0;
                        }
                    }
                    return offset;
                }, 0);
            }
        });
        const promise = fastUpdate.mutate(() => {
            for (const position of [POSITION.top, POSITION.bottom, POSITION.left, POSITION.right]) {
                const positionOffsets = offsets[position];
                for (const headerId in offsets[position]) {
                    if (offsets[position].hasOwnProperty(headerId)) {
                        this._headers[headerId].inst[position] = positionOffsets[headerId];
                    }
                }
            }
        });

        this._updateTopBottomInitialized = false;
        return promise;
    }

    private _getPrevStackableHeaderHeight(curHeaderIndex: number, position: POSITION): number {
        for (let i = (curHeaderIndex - 1); i >= 0; i--) {
            const prevHeader = this._headers[this._headersStack[position][i]];
            if (prevHeader.mode === 'stackable') {
                const headerSize = this._getHeaderSize(prevHeader, position);
                if (headerSize !== 0) {
                    return headerSize;
                }
            }
        }
    }

    private _getHeaderSize(header: IRegisterEventData, position: POSITION): number {
        if (position === POSITION.left || position === POSITION.right) {
            return header.inst.width + header.inst.offsetLeft;
        } else {
            return header.inst.height + header.inst.offsetTop;
        }
    }
}

export default StickyHeaderController;
