import { EdgeIntersectionObserver } from 'Controls/scroll';
import { Control } from 'UI/Base';

export interface ITriggersVisibility {
    top: boolean;
    bottom: boolean;
}

export type TIntersectionEvent = 'bottomIn' | 'bottomOut' | 'topIn' | 'topOut';

export interface ITriggersOffsets {
    top: number;
    bottom: number;
}

export type TObserversCallback = (event: TIntersectionEvent) => void;

export interface IObserversControllerBaseOptions {
    listControl: Control;
    listContainer: HTMLElement;
    viewportSize: number;
    triggersQuerySelector: string;
    // TODO нужно ли
    triggersVisibility: ITriggersVisibility;
    topTriggerOffsetCoefficient: number;
    bottomTriggerOffsetCoefficient: number;
}

export interface IObserversControllerOptions extends IObserversControllerBaseOptions {
    observersCallback: TObserversCallback;
}

export const DEFAULT_TRIGGER_OFFSET = 1/3;

/**
 * Класс предназначен для управления observer, срабатывающим при достижении границ контента списка.
 */
export class ObserversController {
    private _listControl: Control;
    private _listContainer: HTMLElement;
    private _triggers: HTMLElement[] = [];
    private _triggersQuerySelector: string;
    private _viewportSize: number;

    private _backwardTriggerOffsetCoefficient: number;
    private _forwardTriggerOffsetCoefficient: number;

    private _triggersOffsets: ITriggersOffsets = {
        top: 0,
        bottom: 0
    };

    /**
     * Сбрасываем оффсет триггеров в 0 пр помощи этих переменных.
     * Это нужно для того, чтобы изначально не произошло лишних подгрузок и чтобы триггер работал, если список пустой.
     * @private
     */
    private _resetBackwardTriggerOffset: boolean;
    private _resetForwardTriggerOffset: boolean;

    private _observer: EdgeIntersectionObserver;
    private _observersCallback: TObserversCallback;

    constructor(options: IObserversControllerOptions) {
        this._listControl = options.listControl;
        this._listContainer = options.listContainer;
        this._viewportSize = options.viewportSize;
        this._triggersQuerySelector = options.triggersQuerySelector;
        this._observersCallback = options.observersCallback;

        this._backwardTriggerOffsetCoefficient = options.topTriggerOffsetCoefficient;
        this._forwardTriggerOffsetCoefficient = options.bottomTriggerOffsetCoefficient;

        this._updateTriggers();

        this._resetBackwardTriggerOffset = true;
        this._resetForwardTriggerOffset = true;

        this._recalculateOffsets();
    }

    setListContainer(newListContainer: HTMLElement): void {
        this._listContainer = newListContainer;
        if (this._observer) {
            this._observer.destroy();
        }
        this._updateTriggers();
    }

    setTriggersQuerySelector(newTriggersQuerySelector: string): void {
        this._triggersQuerySelector = newTriggersQuerySelector;
        if (this._observer) {
            this._observer.destroy();
        }
        this._updateTriggers();
    }

    setViewportSize(size: number): ITriggersOffsets {
        if (this._viewportSize !== size) {
            this._viewportSize = size;
            this._recalculateOffsets();
        }

        return this.getTriggersOffsets();
    }

    setResetBackwardTriggerOffset(reset: boolean): ITriggersOffsets {
        if (this._resetBackwardTriggerOffset !== reset) {
            this._resetBackwardTriggerOffset = reset;
            this._recalculateOffsets();
        }

        return this.getTriggersOffsets();
    }

    setResetForwardTriggerOffset(reset: boolean): ITriggersOffsets {
        if (this._resetForwardTriggerOffset !== reset) {
            this._resetForwardTriggerOffset = reset;
            this._recalculateOffsets();
        }

        return this.getTriggersOffsets();
    }

    getTriggersOffsets(): ITriggersOffsets {
        return this._triggersOffsets;
    }

    private _recalculateOffsets(): void {
        const newTopTriggerOffset = this._resetBackwardTriggerOffset
            ? 0
            : this._viewportSize * this._backwardTriggerOffsetCoefficient;
        const newBottomTriggerOffset = this._resetForwardTriggerOffset
            ? 0
            : this._viewportSize & this._forwardTriggerOffsetCoefficient;

        this._triggersOffsets = {
            top: newTopTriggerOffset,
            bottom: newBottomTriggerOffset
        }

        // TODO нужна будет поодержка left, right для горизонтального скролла
        this._triggers[0].style.top = `${this._triggersOffsets.top}px`;
        this._triggers[1].style.bottom = `${this._triggersOffsets.bottom}px`;
    }

    private _updateTriggers(): void {
        this._triggers = Array.from(
            this._listContainer.querySelectorAll(this._triggersQuerySelector)
        );

        this._observer = new EdgeIntersectionObserver(
            this._listControl,
            (eventName: TIntersectionEvent) => {
                this._observersCallback(eventName);
            },
            this._triggers[0],
            this._triggers[1]
        );
    }
}
