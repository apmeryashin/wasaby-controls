import {Control} from 'UI/Base';
import SyntheticEntry from './SyntheticEntry';

export default class EdgeIntersectionObserver {
    private _component: Control;
    private _topTriggerElement: HTMLElement;
    private _bottomTriggerElement: HTMLElement;
    private _leftTriggerElement: HTMLElement;
    private _rightTriggerElement: HTMLElement;
    private _handler: Function;

    constructor(component: Control,
                handler: Function,
                topTriggerElement?: HTMLElement,
                bottomTriggerElement?: HTMLElement,
                leftTriggerElement?: HTMLElement,
                rightTriggerElement?: HTMLElement) {
        this._component = component;
        this._handler = handler;
        this._topTriggerElement = topTriggerElement;
        this._bottomTriggerElement = bottomTriggerElement;
        this._leftTriggerElement = leftTriggerElement;
        this._rightTriggerElement = rightTriggerElement;
        this._observe('bottom');
        this._observe('top');
        this._observe('left');
        this._observe('right');
    }

    private _observe(position): void {
        if (this[`_${position}TriggerElement`]) {
            this._component._notify(
                'intersectionObserverRegister',
                [{
                    instId: `${this._component.getInstanceId()}-${position}`,
                    element: this[`_${position}TriggerElement`],
                    threshold: [0, 1],
                    handler: this._observeHandler.bind(this)
                }],
                {bubbling: true});
        }
    }
    private _unobserve(position): void {
        this._component._notify(
            'intersectionObserverUnregister', [`${this._component.getInstanceId()}-${position}`], {bubbling: true}
        );
    }

    protected _observeHandler(item: SyntheticEntry): void {
        let eventName = '';
        const isBackward = item.nativeEntry.target === this._topTriggerElement ||
                           item.nativeEntry.target === this._leftTriggerElement;
        eventName += isBackward ? 'top' : 'bottom';
        eventName += item.nativeEntry.isIntersecting ? 'In' : 'Out';

        this._handler(eventName);
    }

    destroy(): void {
        this._unobserve('top');
        this._unobserve('bottom');
        this._unobserve('left');
        this._unobserve('right');
        this._component = null;
        this._topTriggerElement = null;
        this._bottomTriggerElement = null;
        this._leftTriggerElement = null;
        this._rightTriggerElement = null;
        this._handler = null;
    }
}
