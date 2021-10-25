import { EdgeIntersectionObserver } from 'Controls/scroll';
import { Control } from 'UI/Base';
import type { IDirection } from 'Controls/_baseList/Controllers/ScrollController/ScrollController';

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
    private _resetBackwardTriggerOffset: boolean = true;
    private _resetForwardTriggerOffset: boolean = true;

    private _observer: EdgeIntersectionObserver;
    private _observersCallback: TObserversCallback;

    private _firstTimeGettingTrigger: boolean = true;

    constructor(options: IObserversControllerOptions) {
        this._listControl = options.listControl;
        this._listContainer = options.listContainer;
        this._viewportSize = options.viewportSize;
        this._triggersQuerySelector = options.triggersQuerySelector;
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

    displayTrigger(direction: IDirection): void {
        const trigger = direction === 'forward' ? this._triggers[1] : this._triggers[0];
        if (trigger.style.display === 'none') {
            trigger.style.display = '';
        }
    }

    hideTrigger(direction: IDirection): void {
        const trigger = direction === 'forward' ? this._triggers[1] : this._triggers[0];
        if (trigger.style.display !== 'none') {
            trigger.style.display = 'none';
        }
    }

    getTriggersOffsets(): ITriggersOffsets {
        return this._triggersOffsets;
    }

    // region OnCollectionChange

    resetItems(totalCount: number, hasMoreToBackward: boolean, hasMoreToForward: boolean): ITriggersOffsets {
        // Если после reset коллекции элементов не осталось - необходимо сбросить отступы триггерам.
        // Делаем это именно тут, чтобы попасть в единый цикл отрисовки с коллекцией.
        // Пересчёт после отрисовки с пустой коллекцией не подходит, т.к. уже словим событие скрытия триггера.
        // Также сбрасываем triggerOffset если после ресета в сторону есть данные, чтобы
        // первая подгрузка была только при скролле к самому краю
        const hasItems = !!totalCount;
        this.setResetBackwardTriggerOffset(!hasItems || hasMoreToBackward);
        this.setResetForwardTriggerOffset(!hasItems || hasMoreToForward);
        // если есть данные и вперед и назад, то скрываем триггер назад, т.к. в первую очередь грузим вперед
        if (hasMoreToBackward && hasMoreToForward) {
            this.hideTrigger('backward');
        }
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
            top: newTopTriggerOffset,
            bottom: newBottomTriggerOffset
        };

        if (this._triggers && this._triggers.length) {
            // Для горизонтального скролла нужно будет поправить этот код (поодержка left, right)
            this._triggers[0].style.top = `${this._triggersOffsets.top}px`;
            this._triggers[1].style.bottom = `${this._triggersOffsets.bottom}px`;
        }
    }

    private _updateTriggers(): void {
        this._triggers = Array.from(
            this._listContainer.querySelectorAll(this._triggersQuerySelector)
        );

        // при первом получении триггеров сразу же скрываем верхний, чтобы избежать ненужных подгрузок.
        if (this._firstTimeGettingTrigger) {
            this.hideTrigger('backward');
            this._firstTimeGettingTrigger = false;
        }

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
