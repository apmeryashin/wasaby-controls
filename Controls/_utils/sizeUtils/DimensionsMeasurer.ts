import {Logger} from 'UI/Utils';
import {constants} from 'Env/Env';

const DEFAULT_ZOOM_VALUE = 1;

const ELEMENT_DIMENSIONS = [
    'clientHeight',
    'clientLeft',
    'clientTop',
    'clientWidth',
    'scrollLeft',
    'scrollTop',
    'offsetHeight',
    'offsetLeft',
    'offsetTop',
    'offsetWidth',
    'scrollWidth',
    'scrollHeight'
];
const VISUAL_VIEWPORT_FIELDS = ['offsetLeft', 'offsetTop', 'pageLeft', 'pageTop', 'width', 'height'];
const WINDOW_DIMENSIONS_FIELDS = ['innerHeight', 'innerWidth', 'scrollX', 'scrollY', 'pageXOffset', 'pageYOffset'];
const SCALABLE_DIMENSIONS_VALUES = ['height', 'width', 'top', 'bottom', 'right', 'left', 'x', 'y'];

interface IWindowDimensions {
    innerHeight: number;
    innerWidth: number;
    scrollX: number;
    scrollY: number;
    pageXOffset: number;
    pageYOffset: number;
}

interface IVisualViewportDimensions {
    offsetLeft: number;
    offsetTop: number;
    pageLeft: number;
    pageTop: number;
    width: number;
    height: number;
}

interface IElementDimensions {
    clientHeight: number;
    clientLeft: number;
    clientTop: number;
    clientWidth: number;
    scrollLeft: number;
    scrollTop: number;
    offsetHeight: number;
    offsetLeft: number;
    offsetTop: number;
    offsetWidth: number;
    scrollWidth: number;
    scrollHeight: number;
}

interface IMouseCoords {
    x: number;
    y: number;
}

const MOUSE_EVENTS = [
    'mousedown',
    'mouseup',
    'mouseover',
    'mouseout',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'contextmenu',
    'click',
    'dblclick'
];
const TOUCH_EVENTS = ['touchstart', 'touchend', 'touchmove'];
const ZOOM_CLASS = 'controls-Zoom';

/**
 * Модуль для измерения размеров элементов
 */
class DimensionsMeasurer {
    /**
     * Расчет getBoundingClientRect с учетом зума
     * Значения приводятся к координатной сетке body
     * Нужно для получаения координат элементов, которые нужны для позиционирования элементов в body(пример - popup)
     * @param {HTMLElement} element
     */
    getBoundingClientRect(element: HTMLElement): DOMRect {
        return this._getBoundingClientRect(element, true);
    }

    /**
     * Расчет getBoundingClientRect с учетом зума
     * Значения не скалируются к основной координатной сетке в body,
     * а возвращаются с учетом локального значения zoom на элементе
     * @param {HTMLElement} element
     */
    getRelativeBoundingClientRect(element: HTMLElement): DOMRect {
        return this._getBoundingClientRect(element, false);
    }

    /**
     * Расчет размеров и оффсетов элемента с учетом зума
     * Значения приводятся к координатной сетке body
     * Нужно для получаения размеров и смещений элемента,
     * которые нужны для позиционирования элементов в body(пример - popup)
     * @param {HTMLElement} element
     */
    getElementDimensions(element: HTMLElement): IElementDimensions {
        return this._getElementDimensions(element, true);
    }

    /**
     * Расчет размеров и оффсетов элемента с учетом зума
     * Значения не скалируются к основной координатной сетке в body,
     * а возвращаются с учетом локального значения zoom на элементе
     * @param {HTMLElement} element
     */
    getRelativeElementDimensions(element: HTMLElement): IElementDimensions {
        return this._getElementDimensions(element, false);
    }

    /**
     * Размеры и оффсеты window с учетом zoom
     * @param {HTMLElement} element Элемент относительно значения zoom которого считаются значения размеров window
     */
    getWindowDimensions(element?: HTMLElement): IWindowDimensions {
        const zoom = this.getZoomValue(element as HTMLElement);
        if (zoom !== DEFAULT_ZOOM_VALUE) {
            return this._getScaledElementDimensions<IWindowDimensions>(window, WINDOW_DIMENSIONS_FIELDS, zoom);
        } else {
            return window;
        }
    }

    /**
     * Получение координат мышки/тача внутри body по нативному событию, с учетом zoom на body
     */
    getMouseCoordsByMouseEvent(event: MouseEvent | TouchEvent): IMouseCoords {
        return this._getMouseCoordsByMouseEvent(event, true);
    }

    /**
     * Получение координат мышки/тача по нативному событию
     * Координаты возвращаются с учетом zoom элемента
     */
    getRelativeMouseCoordsByMouseEvent(event: MouseEvent | TouchEvent): IMouseCoords {
        return this._getMouseCoordsByMouseEvent(event, false);
    }

    /**
     * Получение координат и размеров visualViewport с учетом zoom
     * @param {HTMLElement} element Элемент относительно значения zoom которого считаются значения размеров visualViewport
     */
    getVisualViewportDimensions(element?: HTMLElement): IVisualViewportDimensions {
        const zoomValue = this.getZoomValue(element);
        const visualViewport = this._getVisualViewport();
        if (zoomValue !== DEFAULT_ZOOM_VALUE) {
            return this._getScaledElementDimensions<IVisualViewportDimensions>(
                visualViewport,
                VISUAL_VIEWPORT_FIELDS,
                zoomValue
            );
        } else {
            return visualViewport;
        }
    }

    /**
     * Получение значения зума для html элемента с учетом того, что zoom может лежать не на одном родительском элементе
     * @param element
     */
    getZoomValue(element: HTMLElement = document?.body): number {
        let zoomValue = DEFAULT_ZOOM_VALUE;
        let zoomElement = element.closest(`.${ZOOM_CLASS}`);
        while (zoomElement) {
            const parentZoomValue = window?.getComputedStyle(zoomElement)?.zoom;
            if (parentZoomValue) {
                zoomValue *= parseFloat(parentZoomValue);
            }
            zoomElement = zoomElement?.parentElement?.closest(`.${ZOOM_CLASS}`);
        }
        return zoomValue;
    }

    /**
     * Скалирует необходимые поля размеров и координат элемента относительно зума
     * @private
     */
    protected _getScaledElementDimensions<T>(
        element: Partial<T>,
        fields: string[],
        zoom: number,
        scaleToBodyZoom?: boolean
    ): T {
        return fields.reduce((accumulator, field) => {
            accumulator[field] = this._calcScaledValue(element[field], zoom, scaleToBodyZoom);
            return accumulator;
        }, {} as T);
    }

    /**
     * Получение размеров visualViewport
     * @private
     */
    protected _getVisualViewport(): IVisualViewportDimensions {
        if (window?.visualViewport) {
            return window.visualViewport;
        }
        return {
            offsetLeft: 0,
            offsetTop: 0,
            pageLeft: constants.isBrowserPlatform && window.pageXOffset,
            pageTop: constants.isBrowserPlatform && window.pageYOffset,
            width: constants.isBrowserPlatform && document.body.clientWidth,
            height: constants.isBrowserPlatform && document.body.clientHeight
        };
    }

    protected _getMouseCoordsByMouseEvent(event: MouseEvent | TouchEvent, scaleToBodyZoom: boolean): IMouseCoords {
        const eventType = event.type;
        const zoom = scaleToBodyZoom ? this._getMainZoom() : this.getZoomValue(event.target as HTMLElement);
        if (MOUSE_EVENTS.includes(eventType)) {
            return {
                x: event.pageX / zoom,
                y: event.pageY / zoom
            };
        } else if (TOUCH_EVENTS.includes(eventType)) {
            let touches = event.touches;
            if (eventType === 'touchend') {
                touches = event.changedTouches;
            }
            return {
                x: touches[0].pageX / zoom,
                y: touches[0].pageY / zoom
            };
        } else {
            Logger.error('DimensionsMeasurer: Event type must be must be mouse or touch event.');
        }
    }

    /**
     * Получение boundingClientRect с учетом зума
     * @param element
     * @param scaleToBodyZoom
     * @protected
     */
    protected _getBoundingClientRect(element: HTMLElement, scaleToBodyZoom: boolean): DOMRect {
        const defaultDimensions = element.getBoundingClientRect();
        const zoomValue = this.getZoomValue(element);
        if (this._needScaleByZoom(element, zoomValue, scaleToBodyZoom)) {
            return this._getScaledElementDimensions<DOMRect>(
                defaultDimensions,
                SCALABLE_DIMENSIONS_VALUES,
                zoomValue,
                scaleToBodyZoom
            );
        }
        return defaultDimensions;
    }

    /**
     * Получение размеров и смещений элемента с учетом зума
     * @param element
     * @param scaleToBodyZoom
     * @protected
     */
    protected _getElementDimensions(element: HTMLElement, scaleToBodyZoom: boolean): IElementDimensions {
        const zoomValue = this.getZoomValue(element);
        if (this._needScaleByZoom(element, zoomValue, scaleToBodyZoom)) {
            return this._getScaledElementDimensions<IElementDimensions>(
                element,
                ELEMENT_DIMENSIONS,
                zoomValue,
                scaleToBodyZoom
            );
        } else {
            return element;
        }
    }

    /**
     * Расчет заскейленного относительно зума значения размера/оффсета элемента
     * Если передан флаг scaleToBodyZoom, то значения приводятся к значению zoom у body
     * @param value
     * @param zoom
     * @param scaleToBodyZoom
     * @private
     */
    private _calcScaledValue(value: number, zoom: number, scaleToBodyZoom: boolean): number {
        let zoomValue = zoom;
        if (scaleToBodyZoom) {
            zoomValue = this._getMainZoom() / zoom;
        }
        return value / zoomValue;
    }

    /**
     * Определяем необходимость скейла размеров элемента относительно зума
     * Всё что выше body должно скейлиться, т.к. zoom на body
     * @param element
     * @param zoomValue
     * @param scaleToBodyZoom
     * @private
     */
    protected _needScaleByZoom(element: HTMLElement, zoomValue: number, scaleToBodyZoom: boolean): boolean {
        return scaleToBodyZoom || zoomValue !== DEFAULT_ZOOM_VALUE &&
            (element === document.documentElement || !element.closest('body'));
    }

    /**
     * Получение значения zoom, с body
     * Считаем, что это самый верхний элемент на котором может быть zoom
     * @private
     */
    private _getMainZoom(): number {
        const zoomValue = window?.getComputedStyle(document?.body)?.zoom || '1';
        return  parseFloat(zoomValue);
    }
}

export default new DimensionsMeasurer();
