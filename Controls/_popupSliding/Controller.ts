import {BaseController, IDragOffset} from 'Controls/popupTemplate';
import {Controller as PopupController, ISlidingPanelPopupOptions} from 'Controls/popup';
import * as PopupContent from 'wml!Controls/_popupSliding/SlidingPanelContent';
import SlidingPanelStrategy, {AnimationState, ISlidingPanelItem, ResizeType} from './Strategy';
import {constants} from 'Env/Env';

/**
 * SlidingPanel Popup Controller
 * @class Controls/_popupSliding/Opener/Controller
 *
 * @private
 * @extends Controls/_popupTemplate/BaseController
 */
class Controller extends BaseController {
    TYPE: string = 'SlidingPanel';
    private _destroyPromiseResolvers: Record<string, Function> = {};
    private _panels: ISlidingPanelItem[] = [];

    elementCreated(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        this._updatePopupSizes(item, container);
        // После создания запускаем анимацию изменив позицию
        item.position = SlidingPanelStrategy.getShowingPosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        item.animationState = AnimationState.showing;

        // Фиксим оттягивание документа при свайпе на IOS
        if (!this._hasOpenedPopups()) {
            this._toggleCancelBodyDragging(true);
        }

        this._addPopupToList(item);
        return true;
    }

    elementUpdated(item: ISlidingPanelItem, container: HTMLDivElement, isOrientationChanging?: boolean): boolean {
        if (!this._isTopPopup(item) && !isOrientationChanging) {
            return false;
        }
        this._updatePosition(item, container, isOrientationChanging);
        return true;
    }

    /**
     * Обновление размеров и позиции попапа
     * @param item
     * @param container
     * @param resizeType При изменении размеров экрана нужно варидировать размер шторки, чтобы она не оказалась меньше,
     * чем минимальная высота после возвращение экрана к нормальным размерам
     * @private
     */
    private _updatePosition(item: ISlidingPanelItem, container: HTMLDivElement, resizeType?: ResizeType): void {
        this._updatePopupSizes(item, container);
        item.position = SlidingPanelStrategy.getPosition(item, resizeType);
        item.popupOptions.workspaceWidth = item.position.width;
        this._fixIosBug(item, container);
    }

    _fixIosBug(item: ISlidingPanelItem, container: HTMLDivElement): void {
        if (!document) {
            return;
        }
        const bodyHeight = document.body.clientHeight;
        const viewportHeight = window.visualViewport?.height || document.body.clientHeight;
        const viewportOffsetTop = window.visualViewport?.offsetTop || 0;

        // Если высчитана высота берем ее, если высота по контенту, смотрим на контенте. На контенте до цикла синх.
        // значение может быть больше, чем позволяет maxHeight.
        const isFullHeight = item.position.height ? (item.position.height === item.position.maxHeight) :
                                                    (item.sizes.height >= item.position.maxHeight);

        // Если поле ввода в верхней части экрана, то при показе клавиатуры размер экрана браузера не ресайзится
        // (ресайзится только visualViewPort). В этом случае css св-во bottom: 0 будет позиционировать окно под
        // клавиатурой, т.к. физически отсчет координат начинается там.

        // Чтобы визаульно не было видно реакции окна при открыти клавы (изменения размеров, скачка позиции и т.п.)
        // Добавляю компенсацию высоты клавиатуры через отступ, сохраняя высоту окна.
        // Когда есть viewport.offsetTop, значит браузер при установке фокуса подскроллил окно и нужно компенсировать
        // отступ на размер offsetTop, т.к. нижняя часть body, от которой будет считаться позиция окажется выше
        const toggle = isFullHeight && (bodyHeight > viewportHeight);
        if (toggle) {
            const dif = bodyHeight - viewportHeight - viewportOffsetTop;
            // todo: https://online.sbis.ru/opendoc.html?guid=2b5e5b84-5b2f-4e2a-af92-bd46e13db48d
            container.style.paddingBottom = dif + 'px';
            container.style.boxSizing = 'border-box';

            // Высоту так же компенсируем на размер офсета, т.к. мы уменьшили нижний отступ
            const panelMaxHeight = bodyHeight - viewportOffsetTop;
            item.position.height = panelMaxHeight;
            item.position.maxHeight = panelMaxHeight;

            // В шаблон нужно спускать высоту шаблона, без учета паддинга,
            // т.к. шаблон расчитывает там увидить данные о размерах попапа и он не знает ничего о паддинге
            const templateHeight = panelMaxHeight - dif;
            const slidingPanelData = item.popupOptions.slidingPanelData;
            slidingPanelData.height = templateHeight;
            slidingPanelData.maxHeight = templateHeight;
            if (slidingPanelData.minHeight > templateHeight) {
                slidingPanelData.minHeight = templateHeight;
            }
        } else {
            container.style.paddingBottom = '0px';
            container.style.boxSizing = '';
        }
    }

    elementDestroyed(item: ISlidingPanelItem): Promise<void> {
        // Если попап еще не замаунчен, то просто закрываем без анимации
        if (!this._isPopupOpened(item)) {
            this._finishPopupClosing(item);
            return Promise.resolve(null);
        }

        // Запускаем анимацию закрытия и откладываем удаление до её окончания
        item.position = SlidingPanelStrategy.getHidingPosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        item.animationState = AnimationState.closing;
        return new Promise((resolve) => {
            this._destroyPromiseResolvers[item.id] = resolve;
            this._finishPopupClosing(item);
        });
    }

    elementAnimated(item: ISlidingPanelItem): boolean {

        if (item.animationState === 'showing') {
            /*
                После показа меняем координату позиционирования на противоположную,
                чтобы прибить окно к краю вьюпорта и не пересчитывать позицию при изменении размеров.
                Например: Если шторка открывается снизу, то будет bottom: 0;
             */
            item.position = SlidingPanelStrategy.getPosition(item);
        }

        // Резолвим удаление, только после окончания анимации закрытия
        const destroyResolve = this._destroyPromiseResolvers[item.id];
        if (destroyResolve) {
            destroyResolve();
        }
        item.animationState = void 0;
        return true;
    }

    resizeInner(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        this._updatePopupSizes(item, container);

        // Если еще открытие, то ресайзим по стартовым координатам(по которым анимируем открытие)
        if (item.animationState === 'showing') {
            item.position = SlidingPanelStrategy.getStartPosition(item);
        } else {
            item.position = SlidingPanelStrategy.getPosition(item, ResizeType.inner);
        }
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        this._fixIosBug(item, container);
        return true;
    }

    resizeOuter(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        if (this._isTopPopup(item)) {
            this._updatePosition(item, container, ResizeType.outer);
            return true;
        }
        return false;
    }

    getDefaultConfig(item: ISlidingPanelItem): void|Promise<void> {
        item.position = SlidingPanelStrategy.getStartPosition(item);
        const className = `${item.popupOptions.className || ''} controls-SlidingPanel__popup
            controls-SlidingPanel__animation controls_popupSliding_theme-${PopupController.getTheme()}`;

        item.popupOptions.workspaceWidth = item.position.width;
        item.popupOptions.className = className;
        item.popupOptions.content = PopupContent;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
        item.animationState = AnimationState.initializing;
    }

    popupDragStart(item: ISlidingPanelItem, container: HTMLDivElement, offset: IDragOffset): void {
        if (item.popupOptions.slidingPanelOptions.userMoveLocked) {
            return;
        }
        const position = item.position;
        const isFirstDrag = !item.dragStartHeight;

        if (isFirstDrag) {
            item.dragStartHeight = this._getHeight(item);
        }

        const {
            slidingPanelOptions: {position: positionOption} = {}
        } = item.popupOptions;
        const heightOffset = positionOption === 'top' ? offset.y : -offset.y;
        const newHeight = item.dragStartHeight + heightOffset;

        position.height = newHeight;
        item.sizes.height = newHeight;
        item.position = SlidingPanelStrategy.getPosition(item);
        item.popupOptions.workspaceWidth = item.position.width;
        item.popupOptions.slidingPanelData = this._getPopupTemplatePosition(item);
        item.dragOffset = offset;
        this._fixIosBug(item, container);
    }

    popupDragEnd(item: ISlidingPanelItem): void {
        // Если драгали по горизонтали возвращаем первоначальную высоту,
        // чтобы не двигали шторку случайно при горизонтальном свайпе(например горизонтальный скролл)
        const finishHeight = this._isVerticalDrag(item.dragOffset) ? item.position.height : item.dragStartHeight;
        item.position.height = finishHeight;

        if (finishHeight < SlidingPanelStrategy.getMinHeight(item)) {
            PopupController.remove(item.id);
        } else {
            item.position = SlidingPanelStrategy.getPositionAfterDrag(item);
        }
        item.dragStartHeight = null;
        item.dragOffset = null;
    }

    orientationChanged(item: ISlidingPanelItem, container: HTMLDivElement): boolean {
        return this.elementUpdated(item, container, true);
    }

    private _finishPopupClosing(item: ISlidingPanelItem): void {
        this._removePopupFromList(item);
        if (!this._hasOpenedPopups()) {
            this._toggleCancelBodyDragging(false);
        }
    }

    /**
     * Попап еще не открылся, если не стрельнул elementCreated или не закончилась анимация открытия.
     * @param item
     * @private
     */
    private _isPopupOpened(item: ISlidingPanelItem): boolean {
        return item.animationState !== AnimationState.initializing && item.animationState !== AnimationState.showing;
    }

    /**
     * Определяет опцию slidingPanelOptions для шаблона попапа
     * @param {ISlidingPanelItem} item
     * @return {ISlidingPanelData}
     * @private
     */
    private _getPopupTemplatePosition(item: ISlidingPanelItem): ISlidingPanelPopupOptions['slidingPanelOptions'] {
        const {popupOptions: {slidingPanelOptions, desktopMode}} = item;
        return {
            minHeight: SlidingPanelStrategy.getMinHeight(item),
            maxHeight: SlidingPanelStrategy.getMaxHeight(item),
            height: this._getHeight(item),
            position: slidingPanelOptions.position,
            desktopMode
        };
    }

    /**
     * Возвращает признак того, что драг на шторке был вертикальный
     * Только вертикальный драг считаем драгом для движения шторки,
     * горизонтальный драг игнорируем и возвращаем шторку к изначальному значению высоты.
     * @param offset
     * @private
     */
    private _isVerticalDrag(offset: IDragOffset): boolean {
        return Math.abs(offset.y) > Math.abs(offset.x);
    }

    private _addPopupToList(item: ISlidingPanelItem): void {
        this._panels.push(item);
    }

    private _removePopupFromList(item: ISlidingPanelItem): void {
        const index = this._panels.indexOf(item);
        if (index > -1) {
            this._panels.splice(index, 1);
        }
    }

    private _hasOpenedPopups(): boolean {
        return !!this._panels.length;
    }

    private _isTopPopup(item: ISlidingPanelItem): boolean {
        return this._panels.indexOf(item) === this._panels.length - 1;
    }

    protected _updatePopupSizes(item: ISlidingPanelItem, container: HTMLDivElement): void {
        item.previousSizes = item.sizes;
        item.sizes = this._getPopupSizes(item, container);
    }

    /**
     * Нужно для:
     * 1. Сафари, чтобы body не тянулся
     * 2. Для Android, чтобы при закрытии шторки не вызывалось обновление страницы(свайп вниз)
     * https://online.sbis.ru/opendoc.html?guid=2e549898-5980-49bc-b4b7-e0a27f02bf55
     * @param state
     * @private
     */
    private _toggleCancelBodyDragging(state: boolean): void {
        if (constants.isBrowserPlatform) {
            document.documentElement.style.overflow = state ? 'hidden' : '';
        }
    }

    /**
     * Получение текущей высоты шторки.
     * Если включена опция autoHeight и пользователь сам не менял высоту шторки,
     * то в позиции её не будет, берём с контейнера.
     * @param item
     * @private
     */
    private _getHeight(item: ISlidingPanelItem): number {
        return item.position.height || item.sizes?.height;
    }
}

export default new Controller();
