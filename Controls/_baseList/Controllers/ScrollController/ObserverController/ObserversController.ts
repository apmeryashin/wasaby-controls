import {AbstractObserversController, IAbstractObserversControllerOptions, TIntersectionEvent} from './AbstractObserversController';
import {EdgeIntersectionObserver} from 'Controls/scroll';
import {Control} from 'UI/Base';
import {IDirection} from './../ScrollController';

export {IAbstractObserversControllerOptions as IObserversControllerOptions};

export class ObserversController extends AbstractObserversController {
    protected _createTriggersObserver(component: Control,
                                      handler: Function,
                                      backwardTriggerElement?: HTMLElement,
                                      forwardTriggerElement?: HTMLElement): EdgeIntersectionObserver {
        return new EdgeIntersectionObserver(
            component,
            (eventName: TIntersectionEvent) => {
                handler(eventName);
            },
            backwardTriggerElement, forwardTriggerElement
        );
    }

    protected _applyTriggerOffset(element: HTMLElement, direction: IDirection, offset: number): void {
        if (direction === 'backward') {
            element.style.top = `${offset}px`;
        } else {
            element.style.bottom = `${offset}px`;
        }
    }
}
