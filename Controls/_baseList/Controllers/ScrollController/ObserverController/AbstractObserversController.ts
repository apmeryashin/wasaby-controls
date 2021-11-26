import type { EdgeIntersectionObserver } from 'Controls/scroll';
import { Control } from 'UI/Base';
import type { IDirection } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

export type TIntersectionEvent = 'bottomIn' | 'bottomOut' | 'topIn' | 'topOut';

export interface ITriggersOffsets {
    backward: number;
    forward: number;
}

export interface ITriggersVisibility {
    backward: boolean;
    forward: boolean;
}

export type TObserversCallback = (event: TIntersectionEvent) => void;

export interface IAbstractObserversControllerBaseOptions {
    listControl: Control;
    listContainer: HTMLElement;
    viewportSize: number;
    triggersQuerySelector: string;
    triggersVisibility: ITriggersVisibility;
    topTriggerOffsetCoefficient: number;
    bottomTriggerOffsetCoefficient: number;
}

export interface IAbstractObserversControllerOptions extends IAbstractObserversControllerBaseOptions {
    observersCallback: TObserversCallback;
}

export const DEFAULT_TRIGGER_OFFSET = 0.3;

/**
 * Класс предназначен для управления observer, срабатывающим при достижении границ контента списка.
 */
export abstract class AbstractObserversController {
    private _listControl: Control;
    private _listContainer: HTMLElement;
    private _triggers: HTMLElement[] = [];
    private _triggersQuerySelector: string;
    private _viewportSize: number;

    private _backwardTriggerOffsetCoefficient: number;
    private _forwardTriggerOffsetCoefficient: number;

    private _triggersVisibility: ITriggersVisibility;
    private _triggersOffsets: ITriggersOffsets = {
        backward: 0,
        forward: 0
    };

    /**
     * Сбрасываем оффсет триггеров в 0 пр помощи этих переменных.
     * Это нужно для того, чтобы изначально не произошло лишних подгрузок и чтобы триггер работал, если список пустой.
     * @private
     */
    private _resetBackwardTriggerOffset: boolean = true;
    private _resetForwardTriggerOffset: boolean = true;

    private _observer: EdgeIntersectionObserver;
    private _observersCallback: TObserversCallback;

    constructor(options: IAbstractObserversControllerOptions) {
        this._listControl = options.listControl;
        this._listContainer = options.listContainer;
        this._viewportSize = options.viewportSize;
        this._triggersQuerySelector = options.triggersQuerySelector;
        this._triggersVisibility = options.triggersVisibility;
        this._observersCallback = options.observersCallback;

        this._backwardTriggerOffsetCoefficient = options.topTriggerOffsetCoefficient;
        this._forwardTriggerOffsetCoefficient = options.bottomTriggerOffsetCoefficient;

        if (this._listContainer) {
            this._updateTriggers();
            this._recalculateOffsets();
        }
    }

    setListContainer(newListContainer: HTMLElement): void {
        this._listContainer = newListContainer;
        if (this._observer) {
            this._observer.destroy();
        }
        this._updateTriggers();
        this._recalculateOffsets();
    }

    setTriggersQuerySelector(newTriggersQuerySelector: string): void {
        this._triggersQuerySelector = newTriggersQuerySelector;
        if (this._observer) {
            this._observer.destroy();
        }
        this._updateTriggers();
        this._recalculateOffsets();
    }

    setViewportSize(size: number): ITriggersOffsets {
        if (this._viewportSize !== size) {
            this._viewportSize = size;
            if (this._listContainer) {
                this._recalculateOffsets();
            }
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

    // region TriggerVisibility

    setTriggersVisibility(triggersVisibility: ITriggersVisibility): void {
        if (this._triggersVisibility.backward !== triggersVisibility.backward) {
            this._setTriggerVisibility('backward', triggersVisibility.backward);
        }
        if (this._triggersVisibility.forward !== triggersVisibility.forward) {
            this._setTriggerVisibility('backward', triggersVisibility.forward);
        }

        this._triggersVisibility = triggersVisibility;
    }

    private _setTriggerVisibility(direction: IDirection, visible: boolean): void {
        const trigger = direction === 'forward' ? this._triggers[1] : this._triggers[0];

        if (trigger.style.display !== 'none' && trigger.style.display !== '') {
            throw new Error('Controls/_baseList/Controllers/ScrollController/AbstractObserversController::_setTriggerVisibility | ' +
                'В стиле триггера невозможное значение display. ' +
                'Нужно проверить стили и классы навешанные на триггеры.');
        }

        const currentVisible = trigger.style.display === '';
        if (!currentVisible && visible) {
            trigger.style.display = '';
        } else if (currentVisible && !visible) {
            trigger.style.display = 'none';
        }
    }

    // endregion TriggerVisibility

    // region OnCollectionChange

    resetItems(totalCount: number): ITriggersOffsets {
        // Сбрасываем оффсет у триггеров, чтобы после перезагрузки первая подгрузка была при скролле к самому краю
        this.setResetBackwardTriggerOffset(true);
        this.setResetForwardTriggerOffset(true);
        return this.getTriggersOffsets();
    }

    // endregion OnCollectionChange

    private _recalculateOffsets(): void {
        const newTopTriggerOffset = this._resetBackwardTriggerOffset
            ? 0
            : this._viewportSize * this._backwardTriggerOffsetCoefficient;
        const newBottomTriggerOffset = this._resetForwardTriggerOffset
            ? 0
            : this._viewportSize * this._forwardTriggerOffsetCoefficient;

        this._triggersOffsets = {
            backward: newTopTriggerOffset,
            forward: newBottomTriggerOffset
        };

        if (this._triggers && this._triggers.length) {
            this._applyTriggerOffset(this._triggers[0], 'backward', this._triggersOffsets.backward);
            this._applyTriggerOffset(this._triggers[1], 'forward', this._triggersOffsets.forward);
        }
    }

    private _updateTriggers(): void {
        this._triggers = Array.from(
            this._listContainer.querySelectorAll(this._triggersQuerySelector)
        );

        this._triggers[0].style.display = this._triggersVisibility.backward ? '' : 'none';
        this._triggers[1].style.display = this._triggersVisibility.forward ? '' : 'none';

        this._observer = this._createTriggersObserver(this._listControl, this._observersCallback, ...this._triggers);
    }

    protected abstract _createTriggersObserver(component: Control,
                                               handler: Function,
                                               backwardTriggerElement?: HTMLElement,
                                               forwardTriggerElement?: HTMLElement): EdgeIntersectionObserver;

    protected abstract _applyTriggerOffset(element: HTMLElement, direction: IDirection, offset: number): void;
}
