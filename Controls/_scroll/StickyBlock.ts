import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import {constants, detection} from 'Env/Env';
import {descriptor} from 'Types/entity';
import {
    getNextId,
    getOffset,
    IFixedEventData,
    IOffset,
    IPositionOrientation,
    isHidden,
    isStickySupport,
    MODE,
    POSITION,
    SHADOW_VISIBILITY,
    SHADOW_VISIBILITY_BY_CONTROLLER
} from './StickyBlock/Utils';
import fastUpdate from './StickyBlock/FastUpdate';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {IScrollState} from '../Utils/ScrollState';
import {SCROLL_POSITION} from './Utils/Scroll';
import {IntersectionObserver} from 'Controls/sizeUtils';
import {EventUtils} from 'UI/Events';
import Group from 'Controls/_scroll/StickyBlock/Group';
import 'css!Controls/scroll';
import Model = require('Controls/_scroll/StickyBlock/Model');
import template = require('wml!Controls/_scroll/StickyBlock/StickyHeader');

export enum BACKGROUND_STYLE {
    TRANSPARENT = 'transparent',
    DEFAULT = 'default'
}

export interface IStickyHeaderOptions extends IControlOptions {
    _subPixelArtifactFix: Boolean;
    position: IPositionOrientation;
    mode: MODE;
    fixedZIndex: number;
    zIndex: number;
    shadowVisibility: SHADOW_VISIBILITY;
    backgroundStyle?: string;
    offsetTop: number;
    offsetLeft: number;
}

const CONTENT_CLASS = '.controls-StickyHeader__content';

/**
 * Обеспечивает прилипание контента к краю родительского контейнера при прокрутке.
 * В зависимости от конфигурации, прилипание происходит в момент пересечения верхней, нижней, левой или правой
 * части контента и родительского контейнера.
 * @remark
 * Фиксация заголовка в IE и Edge версии ниже 16 не поддерживается.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @public
 * @extends UI/Base:Control
 *
 * @implements Controls/interface:IBackgroundStyle
 *
 * @author Красильников А.С.
 * @demo Controls-demo/Scroll/Container/StickyBlock/SomeSimpleHeaders/Index
 */

/*
 * Ensures that content sticks to the top or bottom of the parent container when scrolling.
 * Occurs at the moment of intersection of the upper or lower part of the content and the parent container.
 * @remark
 * Fixing in IE and Edge below version 16 is not supported.
 *
 * @public
 * @extends UI/Base:Control
 * @class Controls/_scroll/StickyBlock
 * @author Красильников А.С.
 */
export default class StickyBlock extends Control<IStickyHeaderOptions> {

    /**
     * @type {Function} Component display template.
     * @private
     */
    protected _template: TemplateFunction = template;

    /**
     * @type {IntersectionObserver}
     * @private
     */
    private _observer: IntersectionObserver;

    private _model: Model;

    protected _isIOSChrome: boolean = StickyBlock._isIOSChrome();
    protected _isMobileIOS: boolean = detection.isMobileIOS;

    private _isStickyShadowVisible: boolean = false;
    private _isShadowVisibleByController: {
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
    private _stickyHeadersHeight: IOffset = {
        top: null,
        bottom: null,
        left: null,
        right: null
    };

    private _index: number = getNextId();

    private _height: number = 0;

    private _cachedStyles: CSSStyleDeclaration = null;
    private _cssClassName: string = null;
    private _canScroll: boolean = false;
    private _scrollState: IScrollState = {
        canVerticalScroll: false,
        verticalPosition: detection.isMobileIOS ? SCROLL_POSITION.START : null,
        hasUnrenderedContent: {
            top: false,
            bottom: false
        }
    };
    private _negativeScrollTop: boolean = false;

    protected _notifyHandler: Function = EventUtils.tmplNotify;

    protected _moduleName: string = 'Controls/_scroll/StickyBlock/_StickyHeader';

    /**
     * The position property with sticky value is not supported in ie and edge lower version 16.
     * https://developer.mozilla.org/ru/docs/Web/CSS/position
     */
    protected _isStickySupport: boolean = isStickySupport();

    protected _style: string = '';

    protected _isBottomShadowVisible: boolean = false;
    protected _isTopShadowVisible: boolean = false;
    protected _isLeftShadowVisible: boolean = false;
    protected _isRightShadowVisible: boolean = false;

    protected _topObserverStyle: string = '';
    protected _bottomObserverStyle: string = '';
    protected _leftObserverStyle: string = '';
    protected _rightObserverStyle: string = '';
    protected _canShadowVisible: {
        top: boolean;
        bottom: boolean;
        left: boolean;
        right: boolean;
    } = {top: false, bottom: false, left: false, right: false};

    private _stickyDestroy: boolean = false;
    private _scroll: HTMLElement;

    private _needUpdateObserver: boolean = false;

    // Если заголовок сконфигурариован так, что при построении отображется тень, то установим true.
    // Сбросим обратно только, когда отработает обсервер и мы узнаем настоящее положение заголовка.
    // До этого момента будем отображать тень.
    private _initialShowShadow: boolean = false;

    // Считаем заголовок инициализированным после того как контроллер установил ему top или bottom.
    // До этого не синхронизируем дом дерево при изменении состояния.
    private _initialized: boolean = false;

    private _offsetTopChanged: boolean = false;

    private _syncDomOptimization: boolean = true;
    private _bottomShadowHiddenClassRemovedinJS: boolean = null;
    private _content: HTMLElement;

    private _isHidden: boolean = false;

    protected _isPixelRatioBug: boolean = false;

    protected _subPixelArtifactClass: string = '';
    protected _topGapFixClass: string = '';

    group: Group;

    get index(): number {
        return this._index;
    }

    get container(): HTMLElement {
        return this._container;
    }

    constructor(cfg: IStickyHeaderOptions, context?: object) {
        super(cfg, context);
        this._observeHandler = this._observeHandler.bind(this);
    }

    protected _beforeMount(options: IStickyHeaderOptions): void {
        if (!this._isStickyEnabled(options)) {
            return;
        }
        if (options.shadowVisibility === SHADOW_VISIBILITY.initial) {
            this._initialShowShadow = true;
        }
        this._updateCanShadowVisible(options);
        this._updateStyles(options);
    }

    protected _componentDidMount(options: IStickyHeaderOptions): void {
        // Компонент иногда модифицирует стили до циклов синхронизации чтобы не было миганий. Из-за этого имеем
        // следующую ошибку. Заголовок уничтожается, и на том же dom контейнере строится новый компонент.
        // Несмотря на то, что _style === '', на дом элементе остаются стили от старого компонента.
        // Если стили остались, то чистим их.
        // TODO: После того как заменим инферно на реакт проблемы скорее не будет.
        if (this._container.dataset?.stickyBlockNode) {
            this._container.style.top = '';
            this._container.style.bottom = '';
        }
        if (!this._isStickyEnabled(options)) {
            return;
        }
        this._register();
        // name на partial не работает, поэтому контентную область ищем через querySelector.
        this._content = this._container.querySelector(CONTENT_CLASS);
        this._updateIsPixelRatioBug();
        this._subPixelArtifactClass = this._getSubPixelArtifactFixClass();
        this._topGapFixClass = this._getTopGapFixClass();
    }

    protected _afterMount(options: IStickyHeaderOptions): void {
        if (!this._isStickyEnabled(options)) {
            return;
        }
        this._init();
    }

    getHeaderContainer(): HTMLElement {
        return this._container;
    }

    protected _beforeUpdate(options: IStickyHeaderOptions, context): void {
        // Проверяем именно по старым опциями (this._options), т.к. в случае, если режим прилипания был 'notsticky' и
        // сменился на любой другой, мы должны заново инициализировать нужные для работы поля.
        // На beforeUpdate контрол еще не успел перестроится и обсерверы не появились в верстке.
        // Инициализируем поля на afterUpdate, соотвественно нет смысла что-то обновлять до этого момента.
        if (!this._isStickyEnabled(this._options)) {
            return;
        }
        this._updateIsPixelRatioBug();
        if (options.position !== this._options.position) {
            this._updateCanShadowVisible(options);
        }

        if (options.mode !== this._options.mode) {
            if (options.mode === MODE.notsticky) {
                this._release();
                return;
            } else {
                this._stickyModeChanged(options.mode);
            }
        }
        if (options.fixedZIndex !== this._options.fixedZIndex) {
            this._updateStyle(
                options.position,
                options.fixedZIndex,
                options.zIndex, options.offsetTop,
                options.task1177692247,
                options.task1181007458
            );
        }
        if (options.offsetTop !== this._options.offsetTop) {
            this._offsetTopChanged = true;
            this._notify('stickyHeaderOffsetTopChanged', [], {bubbling: true});
        }
        this._bottomShadowHiddenClassRemovedinJS = null;
        this._subPixelArtifactClass = this._getSubPixelArtifactFixClass();
    }

    protected _afterUpdate(oldOptions: IStickyHeaderOptions): void {
        if (oldOptions.mode === MODE.notsticky && this._isStickyEnabled(this._options)) {
            this._register();
            this._init();
        }
        this._updateComputedStyle();
    }

    protected _beforeUnmount(): void {
        // Установим дата аттрибут, чтобы в будущем была возможность определить, был ли в этой ноде стики блок.
        // Подробности в комментарии в _componentDidMount.
        this._container.dataset?.stickyBlockNode = 'true';
        if (!this._isStickySupport || this._options.mode === MODE.notsticky) {
            return;
        }
        this._release();
        this.group = null;
    }

    _register(): void {
        this._notify('stickyRegister', [{
            id: this._index,
            inst: this,
            position: this._options.position,
            mode: this._options.mode,
            shadowVisibility: this._options.shadowVisibility
        }, true], {bubbling: true});
    }

    _init(): void {
        if (this._model) {
            return;
        }
        this._stickyDestroy = false;
        this._updateComputedStyle();

        // После реализации https://online.sbis.ru/opendoc.html?guid=36457ffe-1468-42bf-acc9-851b5aa24033
        // отказаться от closest.
        this._scroll = this._container.closest('.controls-Scroll, .controls-Scroll-Container');
        if (!this._scroll) {
            Logger.warn('Controls.scroll:StickyBlock: Используются фиксация заголовков вне Controls.scroll:Container. Либо используйте Controls.scroll:Container, либо уберите, либо отключите фиксацию заголовков в контролах в которых она включена.', this);
            return;
        }

        const children = this._children;
        this._model = new Model({
            topTarget: children.observationTargetTop,
            bottomLeftTarget: children.observationTargetBottomLeft,
            bottomRightTarget: children.observationTargetBottomRight,
            leftTarget: children.observationTargetLeft,
            rightTarget: children.observationTargetRight,
            position: this._options.position
        });

        RegisterUtil(this, 'scrollStateChanged', this._onScrollStateChanged);
        RegisterUtil(this, 'controlResize', this._resizeHandler);

        this._initObserver();
    }

    _release(): void {
        UnregisterUtil(this, 'controlResize');
        UnregisterUtil(this, 'scrollStateChanged');
        if (this._model) {
            // Let the listeners know that the element is no longer fixed before the unmount.
            this._fixationStateChangeHandler('', this._model.fixedPosition);
            this._model.destroy();
            this._model = null;
        }
        this._stickyDestroy = true;

        // его может и не быть, если контрол рушится не успев замаунтиться
        if (this._observer) {
            this._observer.disconnect();
        }

        this._observer = undefined;
        this._notify('stickyRegister', [{id: this._index}, false], {bubbling: true});
    }

    private _stickyModeChanged(newMode: MODE): void {
        this._notify('stickyModeChanged', [this._index, newMode], {bubbling: true});
        this._updateShadowStyles(newMode, this._options.shadowVisibility);
    }

    getOffset(parentElement: HTMLElement, position: POSITION): number {
        return getOffset(parentElement, this._container, position);
    }

    resetSticky(): void {
        fastUpdate.resetSticky([this._container]);
    }

    get position(): IPositionOrientation {
        return this._options.position;
    }

    get height(): number {
        const container: HTMLElement = this._container;
        if (!isHidden(container)) {
            // Проблема: заголовок помечен зафиксированным, но еще не успел пройти цикл синхронизации
            // где навешиваются padding/margin/top. Из-за этого высота, получаемая через .offsetHeight будет
            // не актуальная, когда цикл обновления завершится. Неактуальные размеры придут в scroll:Container
            // и вызовут полную перерисовку, т.к. контрол посчитает что изменились высоты контента.
            // При след. замерах возьмется актуальная высота и опять начнется перерисовка.
            // Т.к. смещения только на ios добавляем, считаю высоту через clientHeight только для ios.
            if (detection.isMobileIOS) {
                this._height = container.clientHeight;
            } else {
                this._height = container.offsetHeight;
                if (detection.isWin) {
                    // offsetHeight округляет к ближайшему числу, из-за этого на масштабе просвечивают полупиксели.
                    // Такое решение подходит только для Windows Desktop, т.к.
                    // на мобильных устройствах devicePixelRatio = 2.75
                    // на Mac devicePixelRatio = 2
                    this._height -= Math.abs(1 - StickyBlock.getDevicePixelRatio());
                }
            }
        }
        return this._height;
    }

    get width(): number {
        return this._container.offsetWidth;
    }

    get offsetTop(): number {
        return this._options.offsetTop;
    }

    get offsetLeft(): number {
        return this._options.offsetLeft;
    }

    get top(): number {
        return this._stickyHeadersHeight.top;
    }

    set top(value: number) {
        const setTop = () => {
            this._stickyHeadersHeight.top = value;
            this._initialized = true;
            // ОБновляем сразу же dom дерево что бы не было скачков в интерфейсе
            if (this._syncDomOptimization) {
                fastUpdate.mutate(() => {
                    this._container.style.top = `${value}px`;
                });
            }
            this._updateStylesIfCanScroll();
        };
        if (this._stickyHeadersHeight.top !== value) {
            setTop();
            return;
        }
        if (this._offsetTopChanged) {
            // top у заголовка - это высота всех прилипающих заголовков до него. Мы расчитываем высоту начиная с 0,
            // не учитывая опцию offsetTop, из-за этого в случае если мы обновим offsetTop у первого заголовка, у него
            // не пересчитается top, т.к. в расчетах его top как был 0, так и остался.
            // Из-за этого появляется такая ошибка
            // https://online.sbis.ru/opendoc.html?guid=f68df0fb-e18a-4060-ae04-cfe3a5410fa7
            // Графическая шапа при смене на вкладку, где не поддерживается развертывание/свертывание шапки меняет
            // offsetTop у заголовка с -120 на 0, top остается тем же самым и появляется дыра между заголовками.
            // Установим новый top если поменялся offsetTop.
            this._offsetTopChanged = false;
            setTop();
        }
    }

    get left(): number {
        return this._stickyHeadersHeight.left;
    }

    set left(value: number): number {
        if (this._stickyHeadersHeight.left !== value) {
            this._initialized = true;
            this._stickyHeadersHeight.left = value;
            this._updateStylesIfCanScroll();
        }
    }

    get right(): number {
        return this._stickyHeadersHeight.right;
    }

    set right(value: number): number {
        if (this._stickyHeadersHeight.right !== value) {
            this._initialized = true;
            this._stickyHeadersHeight.right = value;
            this._updateStylesIfCanScroll();
        }
    }

    setSyncDomOptimization(value: boolean): void {
        this._syncDomOptimization = value;
    }

    get bottom(): number {
        return this._stickyHeadersHeight.bottom;
    }

    set bottom(value: number) {
        if (this._stickyHeadersHeight.bottom !== value) {
            this._stickyHeadersHeight.bottom = value;
            this._initialized = true;
            // ОБновляем сразу же dom дерево что бы не было скачков в интерфейсе
            this._container.style.bottom = `${value}px`;
            this._updateStylesIfCanScroll();
        }
    }

    get shadowVisibility(): SHADOW_VISIBILITY {
        return this._options.shadowVisibility;
    }

    protected _onScrollStateChanged(scrollState: IScrollState, oldScrollState: IScrollState): void {
        let changed: boolean = false;

        const isInitializing = Object.keys(oldScrollState).length === 0;
        // Если нет скролла, то и заголовки незачем обновлять
        if (this._isHidden || isInitializing || !scrollState.canVerticalScroll && !scrollState.canHorizontalScroll) {
            return;
        }

        if (scrollState.clientHeight !== oldScrollState.clientHeight
            || scrollState.clientWidth !== oldScrollState.clientWidth
            || scrollState.scrollHeight !== oldScrollState.scrollHeight
            || scrollState.scrollWidth !== oldScrollState.scrollWidth) {
            // В случае поддержки бразуером resizeObserver'a controlResize'ы не обрабатываются.
            this._resizeHandler();
        }

        const position = this._options.position;
        if ((position.vertical === 'top' || position.vertical === 'bottom' ||
            position.vertical === 'topBottom') &&
            scrollState.canVerticalScroll !== this._scrollState.canVerticalScroll) {
            changed = true;
        }

        if ((position.horizontal === 'left' || position.horizontal === 'right' ||
            position.horizontal === 'leftRight') &&
            scrollState.canHorizontalScroll !== this._scrollState.canHorizontalScroll) {
            changed = true;
        }
        this._canScroll = scrollState.canVerticalScroll || scrollState.canHorizontalScroll;
        this._negativeScrollTop = scrollState.scrollTop < 0;

        if (this._scrollState.verticalPosition !== scrollState.verticalPosition ||
            this._scrollState.horizontalPosition !== scrollState.horizontalPosition ||
            this._scrollState.hasUnrenderedContent.top !== scrollState.hasUnrenderedContent.top ||
            this._scrollState.hasUnrenderedContent.bottom !== scrollState.hasUnrenderedContent.bottom) {
            changed = true;
        }

        if (!scrollState.hasUnrenderedContent.top && this._initialized) {
            this._initialShowShadow = false;
        }

        this._scrollState = scrollState;

        if (changed && this._initialized) {
            this._updateStyles(this._options);
        }
    }

    protected _resizeHandler(): void {
        if (this._needUpdateObserver) {
            this._initObserver();
        }
    }

    protected _selfResizeHandler(): void {
        this._notify('stickyHeaderResize', [], {bubbling: true});
    }

    private _getDevicePixelRatio(): number {
        return window ? window.devicePixelRatio : 1;
    }

    private _updateIsPixelRatioBug(): void {
        const DESKTOP_PIXEL_RATIOS_BUG = [0.75, 1.25, 1.75];
        let result = false;
        if (detection.isMobilePlatform) {
            if (!detection.isMobileAndroid) {
                result = true;
            }
        } else {
            // Щель над прилипающим заголовком появляется на десктопах на масштабе 75%, 125% и 175%
            if (DESKTOP_PIXEL_RATIOS_BUG.indexOf(this._getDevicePixelRatio()) !== -1) {
                result = true;
            }
        }
        this._isPixelRatioBug = result;
    }

    private _initObserver(): void {
        // Если заголовок невидим(display: none), то мы не сможем рассчитать его положение. Вернее обсервер вернет нам
        // что тригеры невидимы, но рассчеты мы сделать не сможем. Когда заголовк станет видим, и если он находится
        // в самом верху скролируемой области, то верхний тригер останется невидимым, т.е. сбытия не будет.
        // Что бы самостоятельно не рассчитывать положение тригеров, мы просто пересоздадим обсервер когда заголовок
        // станет видимым.
        if (isHidden(this._container)) {
            this._needUpdateObserver = true;
            return;
        }

        this._destroyObserver();
        this._createObserver();
        this._needUpdateObserver = false;
    }

    private _destroyObserver(): void {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }

    private _createObserver(): void {
        const children = this._children;

        // Если задали бордер на корне StickyBlock, то IntersectionObserver не вызывает коллбэк, когда прилипающий
        // блок доходит до края. Фиксация не срабатывает. Будем добавлять дополнительный rootMargin в случае, если
        // на корне контрола висит бордер.
        const borderTop = this._getComputedStyle()['border-top-width'];
        const borderBottom  = this._getComputedStyle()['border-bottom-width'];

        const rootMarginTop = borderTop ? '-' + borderTop : '0px';
        const rootMarginBottom = borderBottom ? '-' + borderBottom : '0px';
        this._observer = new IntersectionObserver(
            this._observeHandler,
            {
                root: this._scroll,
                // Рассширим область тслеживания по горизонтали чтобы ячейки за праделами вьюпорта сбоку не считались
                // невидимыми если включен горизонтальный скролл в таблицах. Значение не влияет на производительнось.
                // 20 000 должно хватить, но если повятся сценарии в которых этого значения мало, то можно увеличить.
                rootMargin: rootMarginTop + ' 20000px ' + rootMarginBottom + ' 20000px'
            }
        );
        this._observer.observe(children.observationTargetTop);
        this._observer.observe(children.observationTargetBottomLeft);
        this._observer.observe(children.observationTargetBottomRight);
        this._observer.observe(children.observationTargetLeft);
        this._observer.observe(children.observationTargetRight);
    }

    /**
     * Handles changes to the visibility of the target object of observation at the intersection of the root container.
     * @param {IntersectionObserverEntry[]} entries The intersections between the target element and its root container at a specific moment of transition.
     * @private
     */
    private _observeHandler(entries: IntersectionObserverEntry[]): number {
        /**
         * Баг IntersectionObserver на Mac OS: сallback может вызываться после отписки от слежения. Отписка происходит в
         * _beforeUnmount. Устанавливаем защиту.
         */
        if (this._stickyDestroy) {
            return;
        }
        // При скрытии родителя всегда стреляет событие о невидимости заголовков. При обратном отображении стреляет
        // событие о видимости. Но представление обновляется асинхронно.
        // Сцеарий 1. В области есть скрол контэйнер с проскроленым контентом. Его скрывают. Если этого условия нет,
        // то все заголовки считают себя не зафиксированными. Затем контент заново отображают.
        // Заголовки не зафиксированы, z-index у них не проставлен, их закрывает идущий за ними контент.
        // Через мгновение они появляются. Проблема есть в SwitchableArea и в стэковых окнах.
        // Сценарий 2. Области создаются скрытыми. а после загрузки данных отбражаются.
        if (isHidden(this._container)) {
            this._isHidden = true;
            return;
        } else if (this._isHidden) {
            this._isHidden = false;
            return;
        }

        const fixedPosition: POSITION = this._model.fixedPosition;

        this._model.update(entries);

        // Не отклеиваем заголовки scrollTop отрицательный.
        if (this._negativeScrollTop && this._model.fixedPosition === '') {
            this._model.fixedPosition = fixedPosition;
            return;
        }

        if (!this._model.fixedPosition) {
            this._initialShowShadow = false;
        }

        if (this._model.fixedPosition !== fixedPosition) {
            this._fixationStateChangeHandler(this._model.fixedPosition, fixedPosition);
            if (this._canScroll && this._initialized) {
                this._updateStyles(this._options);
            }
        }
    }

    setFixedPosition(position: string): void {
        // Спилить метод после того как будет сделана задача
        // https://online.sbis.ru/opendoc.html?guid=8089ac76-89d3-42c0-9ef2-8b187014559f
        this._init();

        const fixedPosition: POSITION = this._model.fixedPosition;
        this._model.fixedPosition = position;

        if (this._model.fixedPosition !== fixedPosition) {
            this._fixationStateChangeHandler(this._model.fixedPosition, fixedPosition);
            this._updateStyles(this._options);
            this._updateCanShadowVisible(this._options);
            fastUpdate.mutate(() => {
                // shadowBottom может не быть в DOM, т.к он стоит под условием и при изменении _canShadowVisible.bottom
                // отрисуется в следующем цикле синхронизации.
                if (this._isBottomShadowVisible && this._children.hasOwnProperty('shadowBottom')) {
                    this._children.shadowBottom.classList.remove(this._isMobileIOS ? 'ws-invisible' : 'ws-hidden');
                    this._bottomShadowHiddenClassRemovedinJS = true;
                }
                this._container.style.zIndex = this._model?.fixedPosition ? this._options.fixedZIndex : '';
            });
        }
    }

    /**
     * To inform descendants about the fixing status. To update the state of the instance.
     * @private
     */
    protected _fixationStateChangeHandler(newPosition: POSITION, prevPosition: POSITION): void {
        this._isStickyShadowVisible = !!newPosition;
        this._fixedNotifier(newPosition, prevPosition);
    }

    protected _fixedNotifier(newPosition: POSITION, prevPosition: POSITION, isFakeFixed: boolean = false): void {
        const information: IFixedEventData = {
            id: this._index,
            fixedPosition: newPosition,
            prevPosition,
            mode: this._options.mode,
            shadowVisible: this._options.shadowVisibility === 'visible',
            isFakeFixed
        };

        this._notify('fixed', [information], {bubbling: true});
    }

    private _updateStyles(options: IStickyHeaderOptions): void {
        this._updateStyle(
            options.position,
            options.fixedZIndex,
            options.zIndex,
            options.offsetTop,
            options._isIosZIndexOptimized,
            options.task1177692247,
            options.task1181007458
        );
        this._updateShadowStyles(options.mode, options.shadowVisibility, options.position);
        this._updateObserversStyles(options.offsetTop, options.shadowVisibility);
    }

    private _updateStyle(position: POSITION, fixedZIndex: number,
                         zIndex: number,
                         offsetTop: number,
                         isIosZIndexOptimized: boolean,
                         task1177692247?,
                         task1181007458?): void {
        const style = this._getStyle(position, fixedZIndex, zIndex, offsetTop, isIosZIndexOptimized, task1177692247);
        if (this._style !== style) {
            this._style = style;
        }
    }

    protected _getStyle(positionFromOptions: POSITION,
                        fixedZIndex: number,
                        zIndex: number, offsetTop: number,
                        isIosZIndexOptimized: boolean,
                        task1177692247?,
                        task1181007458?): string {
        const offset: number = 0;
        let top: number;
        let left: number;
        let bottom: number;
        let right: number;
        let fixedPosition: POSITION;
        let style: string = '';

        fixedPosition = this._model ? this._model.fixedPosition : undefined;
        // Включаю оптимизацию для всех заголовков на ios, в 5100 проблем выявлено не было
        const isIosOptimizedMode = this._isMobileIOS && task1181007458 !== true;
        const stickyPosition = positionFromOptions;

        const isStickedOnTop = stickyPosition.vertical && stickyPosition.vertical?.indexOf(POSITION.top) !== -1;
        const isStickedOnBottom = stickyPosition.vertical &&
            stickyPosition.vertical?.toLowerCase().indexOf(POSITION.bottom) !== -1;
        const isStickedOnLeft = stickyPosition.horizontal && stickyPosition.horizontal?.indexOf(POSITION.left) !== -1;
        const isStickedOnRight = stickyPosition.horizontal &&
            stickyPosition.horizontal?.toLowerCase().indexOf(POSITION.right) !== -1;

        if (isStickedOnTop) {
            // После построения контролов на afterMount инициализируется контроллер, он проставит заголовкам
            // top'ы. Установив изначально в стилях top: 0, мы избавимся от лишних синхранизаций в множестве мест.
            top = this._stickyHeadersHeight.top || 0;
            if (offsetTop) {
                top += offsetTop;
            }
            const checkOffset = fixedPosition || isIosOptimizedMode;
            style += 'top: ' + (top - (checkOffset ? offset : 0)) + 'px;';
        }

        if (isStickedOnBottom) {
            bottom = this._stickyHeadersHeight.bottom || 0;
            style += 'bottom: ' + (bottom - offset) + 'px;';
        }

        if (isStickedOnLeft) {
            left = this._stickyHeadersHeight.left || 0;
            style += 'left: ' + (left) + 'px;';
        }

        if (isStickedOnRight) {
            right = this._stickyHeadersHeight.right || 0;
            style += 'right: ' + (right) + 'px;';
        }

        // На IOS чтобы избежать дерганий скролла при достижении нижней или верхей границы, требуется
        // отключить обновления в DOM дереве дочерних элементов скролл контейнера. Сейчас обновления происходят
        // в прилипающих заголовках в аттрибуте style при закреплении/откреплении заголовка. Опция позволяет
        // отключить эти обновления.
        // Повсеместно включать нельзя, на заголовках где есть бордеры или в контенте есть разные цвета фона
        // могут наблюдаться проблемы.
        let position = fixedPosition;
        if (!position && isIosOptimizedMode && (stickyPosition.vertical === 'top' || stickyPosition.vertical === 'bottom')) {
            position = stickyPosition.vertical;
        }
        if (position && this._container) {
            // TODO https://online.sbis.ru/opendoc.html?guid=b8c7818f-adc8-4e9e-8edc-ec1680f286bb
            // В ios на стикиблоках всегда установлен z-index: fixedZIndex,
            // т.к в момент оттягивания из-за смены z-index происходят прыжки.
            // Из-за этого возникает следующая проблема: в списке лежат стики и не стики элементы. У не стики элеметов
            // присутствует весло с itemAction. Если следующим элементом идёт стикиблок, то он перекроет весло.
            // Получается, нужно чтобы весло был выше незафиксированного стикиблока, но ниже зафиксированного.
            if (isIosZIndexOptimized || fixedPosition) {
                style += 'z-index: ' + fixedZIndex + ';';
            }
        } else if (zIndex) {
            style += 'z-index: ' + zIndex + ';';
        }

        // убрать по https://online.sbis.ru/opendoc.html?guid=ede86ae9-556d-4bbe-8564-a511879c3274
        if (task1177692247 && fixedZIndex && !fixedPosition) {
            style += 'z-index: ' + fixedZIndex + ';';
        }

        return style;
    }

    private _updateObserversStyles(offsetTop: number, shadowVisibility: SHADOW_VISIBILITY): void {
        this._topObserverStyle = this._getObserverStyle(POSITION.top, offsetTop, shadowVisibility);
        this._bottomObserverStyle = this._getObserverStyle(POSITION.bottom, offsetTop, shadowVisibility);
    }

    protected _getObserverStyle(position: POSITION, offsetTop: number, shadowVisibility: SHADOW_VISIBILITY): string {
        // The top observer has a height of 1 pixel. In order to track when it is completely hidden
        // beyond the limits of the scrollable container, taking into account round-off errors,
        // it should be located with an offset of -3 pixels from the upper border of the container.
        let coord: number = (this._stickyHeadersHeight[position] || 0) + 2;
        if (StickyBlock.getDevicePixelRatio() !== 1) {
            coord += 1;
        }
        if (position === POSITION.top && offsetTop && shadowVisibility !== SHADOW_VISIBILITY.hidden) {
            coord += offsetTop;
        }
        // Учитываем бордеры на фиксированных заголовках
        // Во время серверной верстки на страницах на ws3 в this._container находится какой то объект...
        // https://online.sbis.ru/opendoc.html?guid=ea21ab20-8346-4092-ac24-5ac6198ed2b8
        if (this._container && !constants.isServerSide) {
            const styles = this._getComputedStyle();
            const borderWidth = parseInt(styles[`border-${position}-width`], 10);
            if (borderWidth) {
                coord += borderWidth;
            }
        }

        return `${position}: ${-coord}px;`;
    }

    // Необходимость в "фейковом" событии fixed описана в интерфейсе IFixedEventData (scroll/StickyBlock/Utils.ts)
    fakeFixedNotifier(isFixed: boolean): void {
        // Модели может не быть, значит заголовок только что создан.
        if (this._model) {
            const newPosition = isFixed ? this._model.fixedPosition : '';
            const prevPosition = isFixed ? '' : this._model.fixedPosition;
            this._fixedNotifier(newPosition, prevPosition, true);
        }
    }

    protected updateShadowVisible(ids: number[], needFakeFixedNotify: boolean = true): void {
        const isStickyShadowVisible: boolean = ids.indexOf(this._index) !== -1;
        if (this._isStickyShadowVisible !== isStickyShadowVisible) {
            if (!this._model) {
                this._init();
                // Модель еще не существует, значит заголвок только что создан и контроллер сказал
                // заголовку что он зафиксирован. Обновим тень вручную что бы не было скачков.
                fastUpdate.mutate(() => {
                    if (this._children.shadowBottom &&
                        this._isShadowVisibleByScrollState(POSITION.bottom)) {
                        const hiddenClass = this._isMobileIOS ? 'ws-invisible' : 'ws-hidden';
                        this._children.shadowBottom.classList.remove(hiddenClass);
                        this._isBottomShadowVisible = true;
                        this._bottomShadowHiddenClassRemovedinJS = true;
                    }
                });
            } else if (this._model.fixedPosition && needFakeFixedNotify) {
                this.fakeFixedNotifier(isStickyShadowVisible);
            }
            this._isStickyShadowVisible = isStickyShadowVisible;
            this._updateStylesIfCanScroll();
        }
    }

    private _restoreBottomShadowHiddenClass(): void {
        // При создании нового заголовка в группе проставляем ему видимость тени в обход
        // циклов синхронизации, чтобы не было скачков. Может произойти такой случай, когда группа в этот
        // момент открепляется (тень нужно скрыть), а мы убрали ws-hidden с тени руками,
        // поэтому vdom думает, что данный класс на ноде весит и не проставляет его при с
        // инхронизации - восстановим ws-hidden сами.
        // _bottomShadowHiddenClassRemovedinJS будем сбрасывать в каждом цикле синхронизации, т.к _isBottomShadowVisible
        // может измениться лишь под конец цикла синхронизации.
        if (this._bottomShadowHiddenClassRemovedinJS && !this._isBottomShadowVisible) {
            this._bottomShadowHiddenClassRemovedinJS = null;
            const hiddenClass = this._isMobileIOS ? 'ws-invisible' : 'ws-hidden';
            this._children.shadowBottom.classList.add(hiddenClass);
        }
    }

    private _updateShadowStyles(mode: MODE, shadowVisibility: SHADOW_VISIBILITY, position: IPositionOrientation): void {
        this._isTopShadowVisible = this._isShadowVisible(POSITION.top, mode, shadowVisibility, position);
        this._isBottomShadowVisible = this._isShadowVisible(POSITION.bottom, mode, shadowVisibility, position);
        if (this.position && this.position.horizontal) {
            this._isLeftShadowVisible = this._isShadowVisible(POSITION.left, mode, shadowVisibility, position);
            this._isRightShadowVisible = this._isShadowVisible(POSITION.right, mode, shadowVisibility, position);
        }
        this._restoreBottomShadowHiddenClass();
    }

    protected updateShadowVisibility(visibility: SHADOW_VISIBILITY_BY_CONTROLLER, position: POSITION): void {
        if (this._isShadowVisibleByController[position] !== visibility) {
            this._isShadowVisibleByController[position] = visibility;
            this._updateStylesIfCanScroll();
        }
    }

    private _getOppositePosition(position: POSITION): POSITION {
        switch (position) {
            case POSITION.top:
                return POSITION.bottom;
            case POSITION.bottom:
                return POSITION.top;
            case POSITION.left:
                return POSITION.right;
            case POSITION.right:
                return POSITION.left;
        }
    }

    protected _isShadowVisible(shadowPosition: POSITION, mode: MODE,
                               shadowVisibility: SHADOW_VISIBILITY, position: IPositionOrientation): boolean {
        // The shadow from above is shown if the element is fixed from below,
        // from below if the element is fixed from above.
        const fixedPosition = this._getOppositePosition(shadowPosition);

        if (this._initialShowShadow && position.vertical === fixedPosition) {
            return true;
        }

        if (this._isShadowVisibleByController[fixedPosition] !== SHADOW_VISIBILITY_BY_CONTROLLER.auto &&
            this._model?.fixedPosition.toLowerCase().indexOf(fixedPosition) !== -1) {
            return this._isShadowVisibleByController[fixedPosition] === SHADOW_VISIBILITY_BY_CONTROLLER.visible;
        }

        const shadowEnabled: boolean = this._isShadowVisibleByScrollState(shadowPosition);

        return !!(
            shadowEnabled &&
            (
                (this._model && this._model.fixedPosition.toLowerCase().indexOf(fixedPosition) !== -1) ||
                (!this._model && this._isStickyShadowVisible)
            ) &&
            (
                shadowVisibility === SHADOW_VISIBILITY.visible ||
                shadowVisibility === SHADOW_VISIBILITY.lastVisible ||
                shadowVisibility === SHADOW_VISIBILITY.initial
            ) &&
            (mode === MODE.stackable || this._isStickyShadowVisible)
        );
    }

    private _isShadowVisibleByScrollState(shadowPosition: POSITION): boolean {
        const canScroll = (orientation: 'vertical' | 'horizontal'): boolean => {
            const scrollState = this._scrollState[`${orientation}Position`];
            const isBackward = shadowPosition === (orientation === 'vertical' ? POSITION.top : POSITION.left);
            const isForward = shadowPosition === (orientation === 'vertical' ? POSITION.bottom : POSITION.right);

            return !!(
                scrollState && (
                    isForward && scrollState !== SCROLL_POSITION.START ||
                    isBackward && scrollState !== SCROLL_POSITION.END
                )
            );
        };

        return shadowPosition === POSITION.top || shadowPosition === POSITION.bottom ?
            canScroll('vertical') : canScroll('horizontal');
    }

    _updateComputedStyle(): void {
        const container: HTMLElement = this._getNormalizedContainer();
        if (this._cssClassName !== container.className) {
            this._cssClassName = container.className;
            const styles = getComputedStyle(container) as CSSStyleDeclaration;
            // Сразу запрашиваем и сохраняем нужные стили. Recalculate Style происходит не в момент вызова
            // getComputedStyle, а при обращении к стилям в из полученного объекта.
            this._cachedStyles = {
                'border-top-width': styles['border-top-width'],
                'border-bottom-width': styles['border-bottom-width'],
                'padding-top': styles['padding-top'],
                'padding-bottom': styles['padding-bottom'],
                minHeight: styles.minHeight,
                boxSizing: styles.boxSizing
            };
        }
    }

    private _isBackgroundDefaultClass(): boolean {
        const isFixed = !!this._model?.fixedPosition;
        return !(this._options.backgroundStyle && (this._options.backgroundStyle !== 'default' || isFixed));
    }

    protected _getBackgroundClass(): string {
        return this._isBackgroundDefaultClass() ?
            'controls-StickyHeader__background_default' :
            `controls-background-${this._options.backgroundStyle}`;
    }

    protected _getSubPixelArtifactFixClass(): string {
        let result = '';
        // В StickyBlock может лежать контент, у которого по бокам рисуется border. В таком случае, border будут
        // перекрыты box-shadow. Вводим возможность отключить box-shadow через навешивание класса.
        // Этот способ отключения будет описан в статье отладке скролла и стикиблоков:
        // https://wi.sbis.ru/doc/platform/developmentapl/interface-development/debug/scroll-container/ после
        // https://online.sbis.ru/opendoc.html?guid=9e7f5914-3b96-4799-9e1d-9390944b4ab3
        const artifactFixOff = this._content?.classList.contains('controls-StickyBlock__onSideIsBorder');
        const backgroundStyle = this._isBackgroundDefaultClass() ? 'backgroundDefault' : this._options.backgroundStyle;
        if (this._options._subPixelArtifactFix && !artifactFixOff) {
            result = `controls-StickyBlock__subpixelFix-${backgroundStyle}`;
        }
        return result;
    }

    protected _getTopGapFixClass(): string {
        let result = '';
        // Над StickyBlock может лежать контент, у которого рисуется border-bottom. В таком случае, border будут
        // перекрыты box-shadow. Вводим возможность отключить box-shadow через навешивание класса.
        // Этот способ отключения будет описан в статье отладке скролла и стикиблоков:
        // https://wi.sbis.ru/doc/platform/developmentapl/interface-development/debug/scroll-container/ после
        // https://online.sbis.ru/opendoc.html?guid=9e7f5914-3b96-4799-9e1d-9390944b4ab3
        const topGapFixOff = this._content?.classList.contains('controls-StickyBlock__aboveBorder');
        if (this._isPixelRatioBug && !topGapFixOff) {
            result = `controls-StickyBlock__topGapFix-${this._options.backgroundStyle}`;
        }
        return result;
    }

    private _getComputedStyle(): CSSStyleDeclaration | object {
        // В ядре проблема, что до маунта вызывают апдейт контрола. Пока они разбираются, ставлю защиту
        return this._cachedStyles || {};
    }

    private _getNormalizedContainer(): HTMLElement {
        // TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
        // There's no container at first building of template.
        if (!this._container) {
            return;
        }
        return this._container.get ? this._container.get(0) : this._container;
    }

    private _updateStylesIfCanScroll(): void {
        if (this._canScroll && this._initialized) {
            this._updateStyles(this._options);
        }
    }

    private _isStickyEnabled(options: IStickyHeaderOptions): boolean {
        return this._isStickySupport && options.mode !== MODE.notsticky;
    }

    private _updateCanShadowVisible(options: IStickyHeaderOptions): void {
        const stickyPosition = options.position;
        const verticalPosition = (stickyPosition?.vertical || '').toLowerCase();
        const horizontalPosition = (stickyPosition?.horizontal || '').toLowerCase();
        const top: boolean = verticalPosition.includes(POSITION.bottom);
        const bottom: boolean = verticalPosition.includes(POSITION.top);
        const left: boolean = horizontalPosition.includes(POSITION.right);
        const right: boolean = horizontalPosition.includes(POSITION.left);
        if (this._canShadowVisible.top !== top || this._canShadowVisible.bottom !== bottom ||
            this._canShadowVisible.left !== left || this._canShadowVisible.right !== right) {
            this._canShadowVisible = { top, bottom, left, right };
        }
    }

    static _isIOSChrome(): boolean {
        return detection.isMobileIOS && detection.chrome;
    }

    static getDefaultOptions(): IStickyHeaderOptions {
        return {
            fixedZIndex: 2,
            zIndex: undefined,
            shadowVisibility: SHADOW_VISIBILITY.visible,
            mode: MODE.replaceable,
            offsetTop: 0,
            offsetLeft: 0,
            position: {
                vertical: 'top'
            },
            _isIosZIndexOptimized: true
        };
    }

    static getOptionTypes(): Record<string, Function> {
        return {
            shadowVisibility: descriptor(String).oneOf([
                SHADOW_VISIBILITY.visible,
                SHADOW_VISIBILITY.hidden,
                SHADOW_VISIBILITY.lastVisible,
                SHADOW_VISIBILITY.initial
            ]),
            backgroundStyle: descriptor(String),
            mode: descriptor(String).oneOf([
                MODE.replaceable,
                MODE.stackable,
                MODE.notsticky
            ])
        };
    }

    static getDevicePixelRatio(): number {
        if (window?.devicePixelRatio) {
            return window.devicePixelRatio;
        }
        return 1;
    }

}
/**
 * @name Controls/_scroll/StickyBlock#content
 * @cfg {Function} Содержимое заголовка, которое будет зафиксировано.
 */

/*
 * @name Controls/_scroll/StickyBlock#content
 * @cfg {Function} Sticky header content.
 */

/**
 * @name Controls/_scroll/StickyBlock#mode
 * @cfg {String} Режим прилипания заголовка.
 * @variant replaceable Заменяемый заголовок. Следующий заголовок заменяет текущий.
 * @variant stackable Составной заголовок. Следующий заголовок прилипает к нижней части текущего.
 */

/*
 * @name Controls/_scroll/StickyBlock#mode
 * @cfg {String} Sticky header mode.
 * @variant replaceable Replaceable header. The next header replaces the current one.
 * @variant stackable Stackable header.  The next header is stick to the bottom of the current one.
 */

/**
 * @name Controls/_scroll/StickyBlock#shadowVisibility
 * @cfg {String} Устанавливает видимость тени.
 * @variant visible Показать тень.
 * @variant hidden Не показывать.
 * @default visible
 */

/*
 * @name Controls/_scroll/StickyBlock#shadowVisibility
 * @cfg {String} Shadow visibility.
 * @variant visible Show.
 * @variant hidden Do not show.
 * @default visible
 */

/**
 * @typedef {Object} StickyVerticalPosition
 * @description Определяет, с какой стороны произайдет прилипание по вертикали
 * @variant 'top'
 * @variant 'bottom'
 * @variant 'topBottom'
 */

/**
 * @typedef {Object} StickyHorizontalPosition
 * @description Определяет, с какой стороны произайдет прилипание по горизонтали
 * @variant 'left'
 * @variant 'right'
 * @variant 'leftRight'
 */

/**
 * @typedef {Object} StickyPosition
 * @description Конфигурация позиции прилипающего блока
 * @property {StickyVerticalPosition} vertical
 * @property {StickyHorizontalPosition} horizontal
 */

/**
 * @name Controls/_scroll/StickyBlock#position
 * @cfg {StickyPosition} Определяет позицию прилипания.
 * @remark
 * В качестве значения передается объект с полями horizontal и vertical
 * Значения vertical:
 * * top - блок будет прилипать сверху
 * * bottom - блок будет прилипать снизу
 * * topBottom - блок будет прилипать и сверху и снизу
 * Значения horizontal:
 * * left - блок будет прилипать слева
 * * right - блок будет прилипать справа
 * * leftRight - блок будет прилипать и слева и справа
 * @example
 * <pre class="brush: js">
 *      protected _position: object = { 'horizontal': 'left', 'vertical': 'top' };
 * </pre>
 * <pre class="brush: html">
 *     <Controls.scroll:StickyBlock position="{{ _position }}">
 *         <div> Блок будет прилипать сверху и слева </div>
 *     </Controls.scroll:StickyBlock/>
 * </pre>
 * @default { vertical: 'top'}
 * @demo Controls-demo/Scroll/StickyBlock/Position/Index
 */

/*
 * @name Controls/_scroll/StickyBlock#position
 * @cfg {String} Determines which side the control can sticky.
 * @variant top Top side.
 * @variant bottom Bottom side.
 * @variant topbottom Top and bottom side.
 * @default top
 */

/**
 * @name Controls/_scroll/StickyBlock#fixedZIndex
 * @cfg {Number} Определяет значение z-index на заголовке, когда он зафиксирован
 * @default 2
 */

/**
 * @name Controls/_scroll/StickyBlock#zIndex
 * @cfg {Number} Определяет значение z-index на заголовке, когда он не зафиксирован
 * @default undefined
 */

/**
 * @name Controls/_scroll/StickyBlock#offsetTop
 * @cfg {Number} Определяет смещение позиции прилипания вниз относитильно позиции прилипания по умолчанию
 * @default 0
 */

/**
 * @name Controls/_scroll/StickyBlock#offsetLeft
 * @cfg {Number} Определяет смещение позиции прилипания вправо относитильно позиции прилипания по умолчанию
 * @default 0
 */

/**
 * @event Происходит при изменении состояния фиксации.
 * @name Controls/_scroll/StickyBlock#fixed
 * @param {UICommon/Events:SyntheticEvent} event Дескриптор события.
 * @param {Controls/_scroll/StickyBlock/Types/InformationFixationEvent.typedef} information Информация о событии фиксации.
 */

/*
 * @event Change the fixation state.
 * @name Controls/_scroll/StickyBlock#fixed
 * @param {UICommon/Events:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyBlock/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */

Object.defineProperty(StickyBlock, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return StickyBlock.getDefaultOptions();
    }
});
