import type { EdgeIntersectionObserver } from 'Controls/scroll';
import { Control } from 'UI/Base';
import type { IDirection } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import { Logger } from 'UI/Utils';

const ERROR_PATH = 'Controls/_baseList/Controllers/ScrollController/ObserversController/AbstractObserversController';

export type TIntersectionEvent = 'bottomIn' | 'bottomOut' | 'topIn' | 'topOut';

export interface ITriggersOffsets {
    backward: number;
    forward: number;
}

export interface ITriggersVisibility {
    backward: boolean;
    forward: boolean;
}

export type ITriggerPosition = 'null' | 'offset';

export interface ITriggersPositions {
    backward: ITriggerPosition;
    forward: ITriggerPosition;
}

export interface ITriggersOffsetCoefficients {
    backward: number;
    forward: number;
}

export type TObserversCallback = (event: TIntersectionEvent) => void;

export interface IAbstractObserversControllerBaseOptions {
    listControl: Control;
    listContainer?: HTMLElement;
    viewportSize?: number;
    triggersQuerySelector: string;
    triggersVisibility: ITriggersVisibility;
    triggersOffsetCoefficients: ITriggersOffsetCoefficients;
    triggersPositions: ITriggersPositions;
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

    private _triggersOffsetCoefficients: ITriggersOffsetCoefficients;

    /**
     * Сбрасываем оффсет триггеров в 0 пр помощи этих переменных.
     * Это нужно для того, чтобы изначально не произошло лишних подгрузок и чтобы триггер работал, если список пустой.
     * @private
     */
    private _triggersPositions: ITriggersPositions;

    private _triggersVisibility: ITriggersVisibility;
    private _triggersOffsets: ITriggersOffsets = {
        backward: 0,
        forward: 0
    };

    private _observer: EdgeIntersectionObserver;
    private readonly _observersCallback: TObserversCallback;

    constructor(options: IAbstractObserversControllerOptions) {
        this._listControl = options.listControl;
        this._listContainer = options.listContainer;
        this._viewportSize = options.viewportSize || 0;
        this._triggersQuerySelector = options.triggersQuerySelector;
        this._triggersVisibility = options.triggersVisibility;
        this._observersCallback = options.observersCallback;

        this._triggersOffsetCoefficients = options.triggersOffsetCoefficients;
        this._triggersPositions = options.triggersPositions;

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

    setBackwardTriggerPosition(position: ITriggerPosition): ITriggersOffsets {
        if (this._triggersPositions.backward !== position) {
            this._triggersPositions.backward = position;
            this._recalculateOffsets();
        }

        return this.getTriggersOffsets();
    }

    setForwardTriggerPosition(position: ITriggerPosition): ITriggersOffsets {
        if (this._triggersPositions.forward !== position) {
            this._triggersPositions.forward = position;
            this._recalculateOffsets();
        }

        return this.getTriggersOffsets();
    }

    getTriggersOffsets(): ITriggersOffsets {
        return this._triggersOffsets;
    }

    // region TriggerVisibility

    setBackwardTriggerVisible(visible: boolean): void {
        if (this._triggersVisibility.backward !== visible) {
            this._setTriggerVisible('backward', visible);
            this._triggersVisibility.backward = visible;
        }
    }

    setForwardTriggerVisible(visible: boolean): void {
        if (this._triggersVisibility.forward !== visible) {
            this._setTriggerVisible('forward', visible);
            this._triggersVisibility.forward = visible;
        }
    }

    private _setTriggerVisible(direction: IDirection, visible: boolean): void {
        const trigger = direction === 'forward' ? this._triggers[1] : this._triggers[0];

        if (trigger.style.display !== 'none' && trigger.style.display !== '') {
            Logger.error(`${ERROR_PATH}::_setTriggerVisibility | ` +
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
        // Прижимаем к триггер к краю, чтобы после перезагрузки не было лишних подгрузок
        this.setBackwardTriggerPosition('null');
        this.setForwardTriggerPosition('null');
        return this.getTriggersOffsets();
    }

    // endregion OnCollectionChange

    private _recalculateOffsets(): void {
        const newTopTriggerOffset = this._triggersPositions.backward === 'null'
            ? 0
            : this._viewportSize * this._triggersOffsetCoefficients.backward;
        const newBottomTriggerOffset = this._triggersPositions.forward === 'null'
            ? 0
            : this._viewportSize * this._triggersOffsetCoefficients.forward;

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
        // нужно править юниты
        if (!this._listContainer) {
            return;
        }

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
