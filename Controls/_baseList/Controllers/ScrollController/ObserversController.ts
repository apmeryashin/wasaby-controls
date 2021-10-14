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
    listControl: Control,
    listContainer: HTMLElement;
    triggersQuerySelector: string;
    triggersVisibility: ITriggersVisibility;
}

export interface IObserversControllerOptions extends IObserversControllerBaseOptions {
    observersCallback: TObserversCallback;
}

/**
 * Класс предназначен для управления observer, срабатывающим при достижении границ контента списка.
 */
export class ObserversController {
    _listControl: Control;
    _listContainer: HTMLElement;
    _triggers: HTMLElement[] = [];
    _triggersQuerySelector: string;
    _triggersVisibility: ITriggersVisibility;

    _triggersOffsets: ITriggersOffsets = {
        top: 0,
        bottom: 0
    };

    _observer: EdgeIntersectionObserver;
    _observersCallback: TObserversCallback;

    constructor(options: IObserversControllerOptions) {
        this._listControl = options.listControl;
        this._listContainer = options.listContainer;
        this._triggersQuerySelector = options.triggersQuerySelector;
        this._triggersVisibility = options.triggersVisibility;
        this._observersCallback = options.observersCallback;

        this._updateTriggers();

        // add to here calc and recalculate offset
    }

    setListContainer(newListContainer: HTMLElement): void {
        this._listContainer = newListContainer;
        this._updateTriggers();
    }

    setTriggersQuerySelector(newTriggersQuerySelector: string): void {
        this._triggersQuerySelector = newTriggersQuerySelector;
        this._updateTriggers();
    }

    getTriggersOffsets(): ITriggersOffsets {
        return this._triggersOffsets;
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
