import {
    AbstractObserversController,
    TIntersectionEvent,
    IDirectionNew as IDirection
} from 'Controls/baseList';

import {EdgeIntersectionObserver} from 'Controls/scroll';
import {Control} from 'UI/Base';

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
            undefined, undefined, backwardTriggerElement, forwardTriggerElement
        );
    }

    protected _applyTriggerOffset(element: HTMLElement, direction: IDirection, offset: number): void {
        if (direction === 'backward') {
            element.style.left = `${offset}px`;
        } else {
            element.style.right = `${offset}px`;
        }
    }
}
