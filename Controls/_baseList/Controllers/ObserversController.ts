import {Collection, DEFAULT_BOTTOM_TRIGGER_OFFSET, DEFAULT_TOP_TRIGGER_OFFSET, ITriggerOffset} from 'Controls/display';
import {EdgeIntersectionObserver} from 'Controls/scroll';
import {Control} from 'UI/Base';

export type TIntersectionEvent = 'bottomIn'|'bottomOut'|'topIn'|'topOut';

export interface IObserversControllerOptions {
    model: Collection;
    viewHeight: number;
    viewportHeight: number;
    scrollTop: number;

    topTriggerOffsetCoefficient: number;
    bottomTriggerOffsetCoefficient: number;
    resetTopTriggerOffset: boolean;
    resetBottomTriggerOffset: boolean;

    viewElement?: Control;
    topTriggerElement?: HTMLElement;
    bottomTriggerElement?: HTMLElement;
    intersectionHandler: (event: TIntersectionEvent) => void
}

export const DEFAULT_TRIGGER_OFFSET = 0.3;

export default class ObserversController {
    private _model: Collection;
    private _viewHeight: number;
    private _viewportHeight: number;
    private _scrollTop: number;

    private _topTriggerOffsetCoefficient: number;
    private _bottomTriggerOffsetCoefficient: number;
    private _resetTopTriggerOffset: boolean;
    private _resetBottomTriggerOffset: boolean;

    private _intersectionHandler: (event: TIntersectionEvent) => void;
    private _intersectionObserver: EdgeIntersectionObserver;

    constructor(options: IObserversControllerOptions) {
        this._model = options.model;
        this._viewHeight = options.viewHeight;
        this._viewportHeight = options.viewportHeight;
        this._scrollTop = options.scrollTop;
        this._intersectionHandler = options.intersectionHandler;

        this._topTriggerOffsetCoefficient = options.topTriggerOffsetCoefficient;
        this._bottomTriggerOffsetCoefficient = options.bottomTriggerOffsetCoefficient;
        this._resetTopTriggerOffset = options.resetTopTriggerOffset;
        this._resetBottomTriggerOffset = options.resetBottomTriggerOffset;

        // изначально скрываем верхний триггер, чтобы не произошло лишних подгрузок. Покажем по необходимости.
        this.hideTopTrigger(options.topTriggerElement);

        if (options.topTriggerElement && options.bottomTriggerElement) {
            this.applyTriggerOffsets(options.topTriggerElement, options.bottomTriggerElement);

            if (options.viewElement) {
                this.registerIntersectionObserver(
                    options.viewElement,
                    options.topTriggerElement,
                    options.bottomTriggerElement
                );
            }
        }
    }

    updateOptions(options: IObserversControllerOptions): void {
        const willBeReload = this._model !== options.model;
        const shouldRecountOffsets = this._viewHeight !== options.viewHeight ||
            this._viewportHeight !== options.viewportHeight ||
            this._scrollTop !== options.scrollTop ||
            this._topTriggerOffsetCoefficient !== options.topTriggerOffsetCoefficient ||
            this._bottomTriggerOffsetCoefficient !== options.bottomTriggerOffsetCoefficient;

        this._model = options.model;
        this._viewHeight = options.viewHeight;
        this._viewportHeight = options.viewportHeight;
        this._scrollTop = options.scrollTop;
        this._intersectionHandler = options.intersectionHandler;

        this._topTriggerOffsetCoefficient = options.topTriggerOffsetCoefficient;
        this._bottomTriggerOffsetCoefficient = options.bottomTriggerOffsetCoefficient;

        if (willBeReload) {
            this.hideTopTrigger(options.topTriggerElement);
            this.setResetTriggerOffsets(
                true,
                true,
                options.topTriggerElement,
                options.bottomTriggerElement
            );
        }
        if (shouldRecountOffsets) {
            this.applyTriggerOffsets(options.topTriggerElement, options.bottomTriggerElement);
        }
    }

    setScrollTop(scrollTop: number, topTrigger: HTMLElement, bottomTrigger: HTMLElement): void {
        if (this._scrollTop !== scrollTop) {
            this._scrollTop = scrollTop;
            this.applyTriggerOffsets(topTrigger, bottomTrigger);
        }
    }

    setViewportHeight(viewportHeight: number, topTrigger: HTMLElement, bottomTrigger: HTMLElement): void {
        if (this._viewportHeight !== viewportHeight) {
            this._viewportHeight = viewportHeight;
            this.applyTriggerOffsets(topTrigger, bottomTrigger);
        }
    }

    setViewHeight(viewHeight: number, topTrigger: HTMLElement, bottomTrigger: HTMLElement): void {
        if (this._viewHeight !== viewHeight) {
            this._viewHeight = viewHeight;
            this.applyTriggerOffsets(topTrigger, bottomTrigger);
        }
    }

    registerIntersectionObserver(view: Control, topTrigger: HTMLElement, bottomTrigger: HTMLElement): void {
        this._intersectionObserver = new EdgeIntersectionObserver(
            view,
            this._intersectionHandler,
            topTrigger,
            bottomTrigger
        );
    }

    shouldRegisterIntersectionObserver(): boolean {
        return this._model && !this._intersectionObserver;
    }

    displayTopTrigger(topTrigger: HTMLElement): void {
        if (topTrigger) {
            topTrigger.style.display = '';
        }
    }

    hideTopTrigger(topTrigger: HTMLElement): void {
        if (topTrigger) {
            topTrigger.style.display = 'none';
        }
    }

    getTriggerOffsets(): ITriggerOffset {
        return this._getOffset();
    }

    setResetTriggerOffsets(
        resetTopTriggerOffset: boolean,
        resetBottomTriggerOffset: boolean,
        topTrigger: HTMLElement,
        bottomTrigger: HTMLElement
    ): void {
        let changed = false;

        if (this._resetTopTriggerOffset !== resetTopTriggerOffset) {
            this._resetTopTriggerOffset = resetTopTriggerOffset;
            changed = true;
        }
        if (this._resetBottomTriggerOffset !== resetBottomTriggerOffset) {
            this._resetBottomTriggerOffset = resetBottomTriggerOffset;
            changed = true;
        }

        if (changed) {
            this.applyTriggerOffsets(topTrigger, bottomTrigger);
        }
    }

    /**
     * Сбрасываем соятоние "Сброса оффсета триггера) в направлении direction.
     * Делаем это для того, чтобы последующие подгрузки происходили заранее.
     * @param direction
     * @param topTrigger
     * @param bottomTrigger
     */
    clearResetTriggerOffset(direction: 'up'|'down', topTrigger: HTMLElement, bottomTrigger: HTMLElement): void {
        switch (direction) {
            case 'up':
                if (this._resetTopTriggerOffset) {
                    this._resetTopTriggerOffset = false;
                    this.applyTriggerOffsets(topTrigger, bottomTrigger);
                }
                break
            case 'down':
                if (this._resetBottomTriggerOffset) {
                    this._resetBottomTriggerOffset = false;
                    this.applyTriggerOffsets(topTrigger, bottomTrigger);
                }
                break;
        }
    }

    /**
     * Устанавливает оффсет для триггеров
     * @param topTrigger DOM элемент верхнего триггера
     * @param bottomTrigger DOM элемент нижнего триггера
     */
    applyTriggerOffsets(topTrigger: HTMLElement, bottomTrigger: HTMLElement): void {
        // TODO LI кривые юниты нужно фиксить
        if (!this._model || this._model.destroyed) {
            return;
        }

        const offset = this._getOffset();
        // Устанавливаем напрямую в style, чтобы не ждать и не вызывать лишние перерисовки
        if (topTrigger && bottomTrigger) {
            topTrigger.style.top = `${offset.top}px`;
            bottomTrigger.style.bottom = `${offset.bottom}px`;
        }
    }

    destroy(): void {
        if (this._intersectionObserver) {
            this._intersectionObserver.destroy();
        }
    }

    private _getOffset(): ITriggerOffset {
        const scrollBottom = Math.max(this._viewHeight - this._scrollTop - this._viewportHeight, 0);
        const maxTopOffset = Math.min(this._scrollTop + this._viewportHeight / 2, this._viewHeight / 2);
        const maxBottomOffset =  Math.min(scrollBottom + this._viewportHeight / 2, this._viewHeight / 2);

        let topTriggerOffset = Math.min(
            (this._viewHeight && this._viewportHeight ? Math.min(this._viewHeight, this._viewportHeight) : 0) * this._topTriggerOffsetCoefficient,
            maxTopOffset
        );
        let bottomTriggerOffset = Math.min(
            (this._viewHeight && this._viewportHeight ? Math.min(this._viewHeight, this._viewportHeight) : 0) * this._bottomTriggerOffsetCoefficient,
            maxBottomOffset
        );

        topTriggerOffset = this._resetTopTriggerOffset ? 0 : topTriggerOffset;
        bottomTriggerOffset = this._resetBottomTriggerOffset ? 0 : bottomTriggerOffset;

        /*
         * Корректируем оффсет на высоту индикатора, т.к. триггер отображается абсолютно, то он рисуется от края вьюхи,
         * а надо от края индикатора.
         * Значение офссета = 0, нам не подходит, т.к. триггер находится за индикатором
         * Поэтому дефолтный оффсет должен быть 47 для верхней ромашки и 48 для нижней.
         * 47 - чтобы сразу же не срабатывала загрузка вверх, а только после скролла к ромашке.
         */
        if (this._model.getTopIndicator().isDisplayed()) {
            topTriggerOffset += DEFAULT_TOP_TRIGGER_OFFSET;
        }
        if (this._model.getBottomIndicator().isDisplayed()) {
            bottomTriggerOffset += DEFAULT_BOTTOM_TRIGGER_OFFSET;
        }

        return {top: topTriggerOffset, bottom: bottomTriggerOffset};
    }
}
