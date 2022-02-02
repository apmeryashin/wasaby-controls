import type { EdgeIntersectionObserver } from 'Controls/scroll';
import { Control } from 'UI/Base';
import type {IDirection, IHasItemsOutRange} from 'Controls/_baseList/Controllers/ScrollController/ScrollController';
import { Logger } from 'UI/Utils';
import {isEqual} from 'Types/object';

const ERROR_PATH = 'Controls/_baseList/Controllers/ScrollController/ObserversController/AbstractObserversController';
const COUNT_TRIGGERS = 2;

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

export interface IAdditionalTriggersOffsets {
    backward: number;
    forward: number;
}

export type TObserversCallback = (direction: IDirection) => void;

export interface IAbstractObserversControllerBaseOptions {
    listControl: Control;
    listContainer?: HTMLElement;
    viewportSize?: number;
    triggersQuerySelector: string;
    triggersVisibility: ITriggersVisibility;
    triggersOffsetCoefficients: ITriggersOffsetCoefficients;
    triggersPositions: ITriggersPositions;
    additionalTriggersOffsets: IAdditionalTriggersOffsets;
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

    private _scrollPosition: number = 0;
    private _contentSize: number = 0;
    private _hasItemsOutRange: IHasItemsOutRange;

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

    /**
     * Размеры дополнительного отступа для триггеров.
     * Используется, чтобы позиционировать триггер от ромашки, а не от края списка.
     * Можно избавиться, если позиционировать триггер с помощью transform=`translateY({offset}px), но
     * нужн решить проблему с пробелом перед списком, если триггер релативный https://jsfiddle.net/hg7qc8s1/49/
     * @private
     */
    private _additionalTriggersOffsets: IAdditionalTriggersOffsets = {
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
        if (options.additionalTriggersOffsets) {
            this._additionalTriggersOffsets = options.additionalTriggersOffsets;
        }
        if (this._listContainer) {
            this._updateTriggers();
        }
    }

    destroy(): void {
        if (this._observer) {
            this._observer.destroy();
            this._observer = null;
        }
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
            if (this._listContainer) {
                this._recalculateOffsets();
            }
        }

        return this.getTriggersOffsets();
    }

    setScrollPosition(position: number): void {
        if (this._scrollPosition !== position) {
            this._scrollPosition = position;
        }
    }

    setContentSize(size: number): void {
        if (this._contentSize !== size) {
            this._contentSize = size;
        }
    }

    setHasItemsOutRange(hasItemsOutRange: IHasItemsOutRange) {
        this._hasItemsOutRange = hasItemsOutRange;
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

    setAdditionalTriggersOffsets(additionalTriggersOffsets: IAdditionalTriggersOffsets): ITriggersOffsets {
        if (!isEqual(this._additionalTriggersOffsets, additionalTriggersOffsets)) {
            this._additionalTriggersOffsets = additionalTriggersOffsets;
            this._recalculateOffsets();
        }

        return this.getTriggersOffsets();
    }

    getTriggersOffsets(): ITriggersOffsets {
        return this._triggersOffsets;
    }

    checkTriggersVisibility(): void {
        // если список скрыт, то не нужно проверять видимость триггеров
        if (!this._listContainer || !this._listContainer.offsetParent) {
            return;
        }

        // Сперва смотрим триггер в конце списка, т.к. в первую очередь должны в эту сторону отображать записи.
        if (this._isTriggerVisible('forward')) {
            this._intersectionObserverHandler('bottomIn');
        }
        if (this._isTriggerVisible('backward')) {
            this._intersectionObserverHandler('topIn');
        }
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
        if (!trigger) {
            return;
        }

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
        // Прижимаем триггер к краю, чтобы после перезагрузки не было лишних подгрузок
        this.setBackwardTriggerPosition('null');
        this.setForwardTriggerPosition('null');
        this.setAdditionalTriggersOffsets({
            forward: 0,
            backward: 0
        });
        return this.getTriggersOffsets();
    }

    // endregion OnCollectionChange

    private _intersectionObserverHandler(eventName: TIntersectionEvent): void {
        if (eventName === 'bottomOut' || eventName === 'topOut') {
            return;
        }

        let direction: IDirection;
        if (eventName === 'bottomIn') {
            direction = 'forward';
        }
        if (eventName === 'topIn') {
            direction = 'backward';
        }

        // Если у нас и так виден триггер вниз, то вверх не нужно вызывать обсервер.
        // Это нужно, чтобы в первую очередь отображались записи вниз.
        const shouldHandleTrigger = direction === 'forward' ||
            direction === 'backward' && (!this._hasItemsOutRange.forward || !this._isTriggerVisible('forward'));
        if (shouldHandleTrigger) {
            this._observersCallback(direction);
        }
    }

    private _recalculateOffsets(): void {
        let newBackwardTriggerOffset = this._triggersPositions.backward === 'null'
            ? 0
            : this._viewportSize * this._triggersOffsetCoefficients.backward;
        let newForwardTriggerOffset = this._triggersPositions.forward === 'null'
            ? 0
            : this._viewportSize * this._triggersOffsetCoefficients.forward;

        newBackwardTriggerOffset += this._additionalTriggersOffsets.backward;
        newForwardTriggerOffset += this._additionalTriggersOffsets.forward;

        const backwardTriggerOffsetChanged = this._triggersOffsets.backward !== newBackwardTriggerOffset;
        const forwardTriggerOffsetChanged = this._triggersOffsets.forward !== newForwardTriggerOffset;

        this._triggersOffsets = {
            backward: newBackwardTriggerOffset,
            forward: newForwardTriggerOffset
        };

        if (this._triggers && this._triggers.length) {
            if (backwardTriggerOffsetChanged) {
                this._applyTriggerOffset(this._triggers[0], 'backward', this._triggersOffsets.backward);
            }
            if (forwardTriggerOffsetChanged) {
                this._applyTriggerOffset(this._triggers[1], 'forward', this._triggersOffsets.forward);
            }
        }
    }

    private _updateTriggers(): void {
        // нужно править юниты
        if (!this._listContainer) {
            return;
        }

        this._triggers = this._getTriggers();

        this._triggers[0].style.display = this._triggersVisibility.backward ? '' : 'none';
        this._triggers[1].style.display = this._triggersVisibility.forward ? '' : 'none';
        this._applyTriggerOffset(this._triggers[0], 'backward', this._triggersOffsets.backward);
        this._applyTriggerOffset(this._triggers[1], 'forward', this._triggersOffsets.forward);

        this._observer = this._createTriggersObserver(
            this._listControl,
            this._intersectionObserverHandler.bind(this),
            ...this._triggers
        );
    }

    /**
     * Возвращает DOM-элементы триггеров.
     * @remark
     * Возвращает триггеры только из текущего списка, исключая триггеры вложенных списков.
     * Для этого сперва получает только первый триггер, который точно находится в этом списке,
     * т.к. лежит до itemsContainer. И уже получает все сестринские элементы к первому триггера
     * и из них выбирает только триггеры.
     * @private
     */
    private _getTriggers(): HTMLElement[] {
        const allTriggers = Array.from(this._listContainer.querySelectorAll(this._triggersQuerySelector));
        // Исключаем триггеры из вложенных списков. Триггеры текущего списка будут находиться в начале и в конце всегда,
        // т.к. элементы, которые могут содержать списки, находятся между триггерами.
        const triggersOfThisList = [allTriggers.shift(), allTriggers.pop()].filter((it) => !!it) as HTMLElement[];
        if (triggersOfThisList.length !== COUNT_TRIGGERS) {
            Logger.error('Неверное кол-во триггеров в списке.'
                + ` Убедитесь, что на всех триггерах есть класс: ${this._triggersQuerySelector}`);
        }
        return triggersOfThisList;
    }

    private _isTriggerVisible(direction: IDirection): boolean {
        const scrollPosition = this._scrollPosition;
        const contentSize = this._contentSize;
        const viewportSize = this._viewportSize;

        if (direction === 'backward') {
            const backwardViewportPosition = scrollPosition;
            const backwardTriggerPosition = this._triggersOffsets.backward;
            return this._triggersVisibility.backward && backwardTriggerPosition >= backwardViewportPosition;
        } else {
            const forwardViewportPosition = scrollPosition + viewportSize;
            const forwardTriggerPosition = contentSize - this._triggersOffsets.forward;
            return this._triggersVisibility.forward && forwardTriggerPosition <= forwardViewportPosition;
        }
    }

    protected abstract _createTriggersObserver(component: Control,
                                               handler: Function,
                                               backwardTriggerElement?: HTMLElement,
                                               forwardTriggerElement?: HTMLElement): EdgeIntersectionObserver;

    protected abstract _applyTriggerOffset(element: HTMLElement, direction: IDirection, offset: number): void;
}
