import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    getNextId,
    getOffset,
    IFixedEventData,
    IOffset,
    IRegisterEventData,
    isStickySupport,
    MODE,
    POSITION,
    SHADOW_VISIBILITY_BY_CONTROLLER,
    IPositionOrientation
} from 'Controls/_scroll/StickyBlock/Utils';
import {SHADOW_VISIBILITY} from './Utils';
import fastUpdate from './FastUpdate';
import {getDecomposedPosition, getDecomposedPositionFromString} from './../StickyBlock/Utils/getDecomposedPosition';
import template = require('wml!Controls/_scroll/StickyBlock/Group');

interface IHeaderData extends IRegisterEventData {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface IHeadersMap {
    [key: string]: IHeaderData;
}

interface IHeadersIds {
    top: number[];
    bottom: number[];
    left: number[];
    right: number[];
}

interface IOffsetCache {
    [key: string]: number;
}

interface IStickyHeaderGroupOptions extends IControlOptions {
    calculateHeadersOffsets?: boolean;
    offsetTop: number;
    mode: string;
}
/**
 * Allows you to combine sticky headers with the same behavior. It is necessary if you need to make
 * several headers fixed at the same level, which should simultaneously stick and stick out.
 * Behaves like one fixed header.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @author Красильников А.С.
 * @public
 */
export default class Group extends Control<IStickyHeaderGroupOptions> {
    private _index: number = null;
    protected _template: TemplateFunction = template;
    protected _isStickySupport: boolean = false;

    protected _fixed: boolean = false;
    protected _cachedOffset: IOffsetCache = {};

    private _syncDomOptimization: boolean = true;

    protected _stickyHeadersIds: IHeadersIds = {
        top: [],
        bottom: [],
        left: [],
        right: []
    };
    protected _offset: IOffset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };
    protected _headersStack: object = {
        top: [],
        bottom: [],
        left: [],
        right: []
    };
    protected _isShadowVisible: boolean = false;
    protected _isShadowVisibleByController: {
        top: SHADOW_VISIBILITY_BY_CONTROLLER;
        bottom: SHADOW_VISIBILITY_BY_CONTROLLER;
        left: SHADOW_VISIBILITY_BY_CONTROLLER;
        right: SHADOW_VISIBILITY_BY_CONTROLLER;
    } = {
        top: SHADOW_VISIBILITY_BY_CONTROLLER.auto,
        bottom: SHADOW_VISIBILITY_BY_CONTROLLER.auto,
        left: SHADOW_VISIBILITY_BY_CONTROLLER.auto,
        right: SHADOW_VISIBILITY_BY_CONTROLLER.auto
    };

    protected _headers: IHeadersMap = {};
    protected _isRegistry: boolean = false;
    protected _isMultilineGroup: boolean = false;

    private _delayedHeaders: number[] = [];

    private _stickyMode: MODE;

    // Считаем заголовок инициализированным после того как контроллер установил ему top или bottom.
    // До этого не синхронизируем дом дерево при изменении состояния.
    private _initialized: boolean = false;

    protected _beforeMount(options: IControlOptions, context): void {
        this._isStickySupport = isStickySupport();
        this._index = getNextId();
    }

    protected _componentDidMount(): void {
        this._isMultilineGroup = this._container.closest('.controls-StickyBlock-multilineGroup') !== null;
    }

    getOffset(parentElement: HTMLElement, position: POSITION): number {
        return getOffset(parentElement, this._container, position);
    }

    resetSticky(): void {
        for (const id in this._headers) {
            if (this._headers.hasOwnProperty(id)) {
                this._headers[id].inst.resetSticky();
            }
        }
    }

    get height(): number {
        // Group can be with style display: content. Use the height of the first header as the height of the group.
        const headersIds: number[] = Object.keys(this._headers);
        if (this._isMultilineGroup) {
            // Под флагом рассчитываем реальную высоту группы, в которой задают заголовки в несколько строк. Сейчас
            // используется только в графиках.
            const firstSticky = this._headers[headersIds[0]].inst.container;
            const lastSticky = this._headers[headersIds[headersIds.length - 1]].inst.container;
            return lastSticky.getBoundingClientRect().bottom - firstSticky.getBoundingClientRect().top;
        }
        return headersIds.length ? this._headers[headersIds[0]].inst.height : 0;
    }

    get offsetTop(): number {
        return this._options.offsetTop;
    }

    set top(value: number) {
        this._setOffset(value, POSITION.top);
    }

    set bottom(value: number) {
        this._setOffset(value, POSITION.bottom);
    }

    set left(value: number) {
        this._setOffset(value, POSITION.left);
    }

    set right(value: number) {
        this._setOffset(value, POSITION.right);
    }

    get shadowVisibility(): SHADOW_VISIBILITY {
        // TODO: сделать чтобы видимость теней явно задавалась через опцию на группе.
        // https://online.sbis.ru/opendoc.html?guid=4e5cd2c6-a2ec-4619-b9c4-fafbb21fc4b8
        for (const id in this._headers) {
            if (this._headers.hasOwnProperty(id)) {
                const shadowVisibility = this._headers[id].inst.shadowVisibility;
                if (shadowVisibility === SHADOW_VISIBILITY.visible ||
                    shadowVisibility === SHADOW_VISIBILITY.lastVisible ||
                    shadowVisibility === SHADOW_VISIBILITY.initial) {
                    return shadowVisibility;
                }
            }
        }
        return SHADOW_VISIBILITY.hidden;
    }

    get index(): number {
        return this._index;
    }

    get container(): HTMLElement {
        return this._container;
    }

    getChildrenHeaders(): IRegisterEventData[] {
        return Object.keys(this._headers).map((id) => this._headers[id]);
    }

    setSyncDomOptimization(value: boolean): void {
        if (this._syncDomOptimization !== value) {
            for (const id in this._headers) {
                if (this._headers.hasOwnProperty(id)) {
                    this._headers[id].inst.setSyncDomOptimization(value);
                }
            }
        }
    }

    private _setOffset(value: number, position: POSITION): void {

        this._offset[position] = value;

        if (this._initialized || !this._options.calculateHeadersOffsets) {
            for (const id in this._headers) {
                if (this._headers.hasOwnProperty(id)) {
                    const positionValue: number = this._headers[id][position] + value;
                    this._headers[id].inst[position] = positionValue;
                }
            }
        }

        if (!this._initialized) {
            this._initialized = true;
            if (this._delayedHeaders.length && this._options.calculateHeadersOffsets) {
                Promise.resolve().then(this._updateTopBottomDelayed.bind(this));
            }
        }

    }

    setFixedPosition(position: string): void {
        for (const id in this._headers) {
            if (this._headers.hasOwnProperty(id)) {
                this._headers[id].inst.setFixedPosition(position);
            }
        }
    }

    protected _fixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
        event.stopImmediatePropagation();
        if (!fixedHeaderData.isFakeFixed) {
            if (!!fixedHeaderData.prevPosition) {
                getDecomposedPositionFromString(fixedHeaderData.prevPosition).forEach((pos) => {
                    if (this._stickyHeadersIds[pos].indexOf(fixedHeaderData.id) > -1) {
                        this._stickyHeadersIds[pos].splice(
                            this._stickyHeadersIds[pos].indexOf(fixedHeaderData.id), 1
                        );
                    }
                });
            }

            if (!!fixedHeaderData.fixedPosition) {
                getDecomposedPositionFromString(fixedHeaderData.fixedPosition).forEach((pos) => {
                    const headersIds: number[] = this._stickyHeadersIds[pos];
                    headersIds.push(fixedHeaderData.id);
                    // Если это не первый заголовок в группе, то группа уже знает надо ли отображить тень,
                    // сообщим это заголовку.
                    if (headersIds.length > 1) {
                        if (this._isShadowVisible) {
                            this._headers[fixedHeaderData.id].inst.updateShadowVisible([fixedHeaderData.id]);
                        } else {
                            this._headers[fixedHeaderData.id].inst.updateShadowVisible([]);
                        }
                    }
                });
            }
        }

        if (!!fixedHeaderData.fixedPosition && !this._fixed) {
            if (!fixedHeaderData.isFakeFixed) {
                // Эти 2 поля означают одно и то же но со нюансами. _isFixed когда то назывался _shadowVisible.
                // Свести к одному полю, либо дать адекватные названия.
                // https://online.sbis.ru/opendoc.html?guid=08a36766-8ac6-4884-bd3b-c28514c9574c
                this._fixed = true;
                this._isShadowVisible = true;
            }
            getDecomposedPositionFromString(fixedHeaderData.fixedPosition).forEach((p) => {
                this._notifyFixed({
                    ...fixedHeaderData,
                    fixedPosition: p
                });
            });
        } else if (!fixedHeaderData.fixedPosition && this._fixed &&
                this._stickyHeadersIds.top.length === 0 && this._stickyHeadersIds.bottom.length === 0) {
            if (!fixedHeaderData.isFakeFixed) {
                this._fixed = false;
            }
            this._notifyFixed(fixedHeaderData);
        }
    }

    protected updateShadowVisible(ids: number[], needFakeFixedNotify: boolean = true): void {
        const isShadowVisible = ids.indexOf(this._index) !== -1;
        if (this._isShadowVisible !== isShadowVisible) {
            this._isShadowVisible = isShadowVisible;
            if (isShadowVisible) {
               this._updateShadowVisible(
                   this._stickyHeadersIds.top.concat(this._stickyHeadersIds.bottom), needFakeFixedNotify
               );
            } else {
               this._updateShadowVisible([], needFakeFixedNotify);
            }
        }
    }

    _updateShadowVisible(ids: number[], needFakeFixedNotify: boolean = true): void {
        for (const id in this._headers) {
            if (this._headers.hasOwnProperty(id)) {
                this._headers[id].inst.updateShadowVisible(ids, needFakeFixedNotify);
            }
        }
    }

    // Необходимость в "фейковом" событии fixed описана в интерфейсе IFixedEventData (scroll/StickyBlock/Utils.ts)
    fakeFixedNotifier(isFixed: boolean): void {
        for (const id in this._headers) {
            if (this._headers.hasOwnProperty(id)) {
                this._headers[id].inst.fakeFixedNotifier(isFixed);
            }
        }
    }

    protected updateShadowVisibility(visibility: SHADOW_VISIBILITY_BY_CONTROLLER, position: POSITION): void {
        if (this._isShadowVisibleByController[position] !== visibility) {
            this._isShadowVisibleByController[position] = visibility;
            for (const id in this._headers) {
                if (this._headers.hasOwnProperty(id)) {
                    this._headers[id].inst.updateShadowVisibility(visibility, position);
                }
            }
        }
    }

    getHeaderContainer(): HTMLElement {
        return this._container;
    }

    private _addToHeadersStack(id: number,
                               headerPosition: IPositionOrientation): void {

        getDecomposedPosition(headerPosition).forEach((position) => {
            const headersStack = this._headersStack[position];
            const newHeaderOffset = this._headers[id].inst.getOffset(this._container, position);
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
                const headerOffset = this._headers[headerId].inst.getOffset(this._container, position);
                return headerOffset > newHeaderOffset ||
                    (headerOffset === newHeaderOffset && headerContainerSize === 0);
            });
            index = index === -1 ? headersStack.length : index;
            headersStack.splice(index, 0, id);
        });
    }

    private _removeFromStack(id: number): void {
        let isUpdated = false;
        let index: number;

        for (const position of [POSITION.left, POSITION.right, POSITION.top, POSITION.bottom]) {
            index = this._headersStack[position].indexOf(id);
            if (index !== -1) {
                this._headersStack[position].splice(index, 1);
                // Обновляем смещения только у стикнутых по горизонтали заголовков.
                isUpdated = position === POSITION.left || position === POSITION.right;
            }
        }

        if (isUpdated) {
            this._updateTopBottom(this._headers);
        }
    }

    protected _stickyRegisterHandler(event: SyntheticEvent<Event>, data: IRegisterEventData, register: boolean): void {
        event.stopImmediatePropagation();
        if (register) {
            this._headers[data.id] = {
                ...data,
                top: 0,
                bottom: 0,
                offset: {}
            };

            data.inst.group = this;

            this._addToHeadersStack(data.id, data.position);

            if (this._options.calculateHeadersOffsets) {
                this._addDelayedHeaders(data);
            } else {
                data.inst[POSITION.top] = this._offset[POSITION.top];
                data.inst[POSITION.bottom] = this._offset[POSITION.bottom];
            }

            for (const position of [POSITION.top, POSITION.bottom, POSITION.left, POSITION.right]) {
                data.inst.updateShadowVisibility(this._isShadowVisibleByController[position], position);
            }

            if (this._isShadowVisible) {
                data.inst.updateShadowVisible([data.id]);
            }

            data.inst.setSyncDomOptimization(this._syncDomOptimization);

            // Register group after first header is registered
            if (!this._isRegistry) {
                this._notify('stickyRegister', [{
                    id: this._index,
                    inst: this,
                    position: data.position,
                    mode: this._options.mode === 'auto' ? data.mode : this._options.mode
                }, true], {bubbling: true});
                this._isRegistry = true;
            }
        } else {
            this._removeFromStack(data.id);
            delete this._headers[data.id];
            const index = this._delayedHeaders.indexOf(data.id);
            if (index > -1) {
                this._delayedHeaders.splice(index, 1);
            }

            // Unregister group after last header is unregistered
            if (!Object.keys(this._headers).length) {
                this._notify('stickyRegister', [{id: this._index}, false], {bubbling: true});
                this._isRegistry = false;
                // Сбрасываем офсет, т.к после анрегистра группы в нее следом могут добавиться новые заголовки.
                this._offset = {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                };
            }
        }
    }

    protected _stickyModeChanged(event: SyntheticEvent<Event>, stickyId: number, newMode: MODE): void {
        // Если мы поменяли mode у заголовков внутри группы, метод вызовется несколько раз, в этом случае
        // будем реагировать только на первый вызов
        if (this._stickyMode !== newMode) {
            this._stickyMode = newMode;
            this._notify('stickyModeChanged', [this._index, newMode], {bubbling: true});
        }
        event.stopPropagation();
    }

    private _addDelayedHeaders(data: IRegisterEventData): void {
        // Проблема в том, что чтобы узнать положение заголовка относительно группы нам надо снять position: sticky.
        // Это приводит к layout. И так для каждой ячейки для заголвков в таблице. Создадим список всех заголовков
        // которые надо обсчитать в этом синхронном участке кода и обсчитаем их за раз в микротаске,
        // один раз сняв со всех загоовков position: sticky.
        if (this._initialized && !this._delayedHeaders.length) {
            Promise.resolve().then(this._updateTopBottomDelayed.bind(this));
        }
        this._delayedHeaders.push(data.id);
    }

    resizeHandler(): void {
        this._updateTopBottom(this._headers);
    }

    private _updateTopBottomDelayed(): void {
        this._updateTopBottom(this._delayedHeaders, true);
    }

    private _setVerticalOffsets(header: IHeaderData, stickyPosition: string, offsets: object): void {
        for (const position of [POSITION.top, POSITION.bottom]) {
            if (stickyPosition.indexOf(position) !== -1) {
                const offset = header.inst.getOffset(this._container, position);
                this._headers[header.id][position] = offset;
                offsets[position][header.id] = this._offset[position] + offset;
            }
        }
    }

    private _setHorizontalOffsets(header: IHeaderData, stickyPosition: string, offsets: object): void {
        // TODO: Опция StickyBlock.mode не позволяет задать разные значения для разных направлений.
        //  Поэтому пока стаканье в группе поддерживаю только по горизонтали.
        for (const position of [POSITION.left, POSITION.right]) {
            if (stickyPosition.toLowerCase().indexOf(position) !== -1) {
                const headerIdx = this._headersStack[position].indexOf(header.id);
                const prevHeaderIdx = headerIdx > 0 ? headerIdx - 1 : 0;
                const prevHeader = this._headers[this._headersStack[position][prevHeaderIdx]];
                let offset = prevHeader.left || 0;

                if (prevHeader.mode !== MODE.replaceable && headerIdx > 0) {
                    offset += prevHeader.inst.getHeaderContainer().getBoundingClientRect().width;
                }

                this._headers[header.id][position] = offset;
                offsets[position][header.id] = this._offset[position] + offset;
            }
        }
    }

    private _updateTopBottom(headerStore: IHeadersMap | number[], needResetDelayedHeaders: boolean = false): void {
        const offsets: Record<POSITION, Record<string, number>> = {
            top: {},
            bottom: {},
            left: {},
            right: {}
        };
        this.resetSticky();

        fastUpdate.measure(() => {
            const headersIds = Array.isArray(headerStore) ? headerStore : Object.keys(headerStore);
            for (const headerId of headersIds) {
                const header: IRegisterEventData = this._headers[headerId];
                const position = header.inst.position;
                if (position.vertical) {
                    this._setVerticalOffsets(header, position.vertical, offsets);
                }
                if (position.horizontal) {
                    this._setHorizontalOffsets(header, position.horizontal, offsets);
                }
            }
            if (needResetDelayedHeaders) {
                this._delayedHeaders = [];
            }
        });

        fastUpdate.mutate(() => {
            for (const position of [POSITION.top, POSITION.bottom, POSITION.left, POSITION.right]) {
                const positionOffsets = offsets[position];
                for (const headerId of Object.keys(offsets[position])) {
                    this._headers[headerId].inst[position] = positionOffsets[headerId];
                }
            }
        });
    }

    private _notifyFixed(fixedHeaderData: IFixedEventData): void {
        this._notify(
            'fixed',
            [{
                ...fixedHeaderData,
                id: this._index
            }],
            {bubbling: true}
        );
    }

    static getDefaultOptions(): Partial<IStickyHeaderGroupOptions> {
        return {
            calculateHeadersOffsets: true,
            offsetTop: 0,
            mode: 'auto'
        };
    }
}
/**
 * @name Controls/_scroll/StickyBlock/Group#content
 * @cfg {Function} Content in which several fixed headers are inserted.
 */

/**
 * @name Controls/_scroll/StickyBlock/Group#mode
 * @cfg {String} Режим прилипания группы заголовков.
 * @default auto
 * @variant replaceable Заменяемая группа. Следующая группа заменяет текущую.
 * @variant stackable Составная группа. Следующая группа прилипает к нижней части текущей.
 * @variant auto Определяется автоматически.
 */

/**
 * @event Change the fixation state.
 * @name Controls/_scroll/StickyBlock/Group#fixed
 * @param {UICommon/Events:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyBlock/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */

Object.defineProperty(Group, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Group.getDefaultOptions();
   }
});
