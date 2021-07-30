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
const AVAILABLE_ZOOM_VALUES = [0.75, 0.85, 1, 1.15, 1.3];

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

export type TZoomSize = 0.75 | 0.85 | 1 | 1.15 | 1.3;
/**
 * Модуль для измерения размеров элементов
 */
class DimensionsMeasurer {
    private _zoomValue: number = DEFAULT_ZOOM_VALUE;

    setZoomValue(zoom: TZoomSize): void {
        if (AVAILABLE_ZOOM_VALUES.includes(zoom)) {
            this._zoomValue = zoom;
        } else {
            this._zoomValue = DEFAULT_ZOOM_VALUE;
            Logger.error('DimensionsMeasurer: value of zoom option doesn\'t supported.');
        }
    }

    getBoundingClientRect(element: HTMLElement): DOMRect {
        const defaultDimensions = element.getBoundingClientRect();
        if (this._needScaleByZoom(element)) {
            return this._getScaledElementDimensions<DOMRect>(defaultDimensions, SCALABLE_DIMENSIONS_VALUES);
        }
        return defaultDimensions;
    }

    /**
     * Расчет размеров и оффсетов элемента с учетом зума
     * @param element
     */
    getElementDimensions(element: HTMLElement): IElementDimensions {
        if (this._needScaleByZoom(element)) {
            return this._getScaledElementDimensions<IElementDimensions>(element, ELEMENT_DIMENSIONS);
        } else {
            return element;
        }
    }

    /**
     * Размеры и оффсеты window с учетом zoom
     */
    getWindowDimensions(): IWindowDimensions {
        if (this._zoomValue !== DEFAULT_ZOOM_VALUE) {
            return this._getScaledElementDimensions<IWindowDimensions>(window, WINDOW_DIMENSIONS_FIELDS);
        } else {
            return window;
        }
    }

    /**
     * Получение координат мышки/тача по нативному событию
     * Необходимо т.к. координаты считаются на странице, а заскейлен только боди
     * @param event
     */
    getMouseCoordsByMouseEvent(event: MouseEvent | TouchEvent): {x: number, y: number} {
        const zoom = this._zoomValue;
        if (event instanceof MouseEvent) {
            return {
                x: event.pageX / zoom,
                y: event.pageY / zoom
            };
        } else if (event instanceof TouchEvent) {
            let touches = event.touches;
            if (event.type === 'touchend') {
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
     * Получение координат и размеров visualViewport с учетом zoom
     */
    getVisualViewportDimensions(): IVisualViewportDimensions {
        const visualViewport = this._getVisualViewport();
        if (this._zoomValue !== DEFAULT_ZOOM_VALUE) {
            return this._getScaledElementDimensions<IVisualViewportDimensions>(visualViewport, VISUAL_VIEWPORT_FIELDS);
        } else {
            return visualViewport;
        }
    }

    /**
     * Скалирует необходимые поля размеров и координат элемента относительно зума
     * @param element
     * @param fields
     * @private
     */
    protected _getScaledElementDimensions<T>(element: Partial<T>, fields: string[]): T {
        const zoom = this._zoomValue;
        return fields.reduce((accumulator, field) => {
            accumulator[field] = element[field] / zoom;
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

    /**
     * Определяем необходимость скейла размеров элемента относительно зума
     * Всё что выше body должно скейлиться, т.к. zoom на body
     * @param element
     * @private
     */
    protected _needScaleByZoom(element: HTMLElement): boolean {
        return this._zoomValue !== DEFAULT_ZOOM_VALUE &&
            (element === document.documentElement || !element.closest('body'));
    }
}

export default new DimensionsMeasurer();
