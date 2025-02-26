import {Control} from 'UI/Base';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {goUpByControlTree} from 'UI/Focus';
import {TTarget} from 'Controls/_popup/interface/ISticky';
import * as cInstance from 'Core/core-instance';

const getTargetForSubscribe = (target: TTarget): Control => {
    const baseControlName = 'UI/Base:Control';
    if (cInstance.instanceOfModule(target, baseControlName)) {
        return target as Control;
    } else if (target instanceof HTMLElement) {
        return goUpByControlTree(target)[0];
    }
};

export const toggleActionOnScroll = (target: TTarget, toggle: boolean, callback?: Function): void => {
    const targetForSubscribe = getTargetForSubscribe(target);
    if (targetForSubscribe) {
        if (toggle) {
            RegisterUtil(targetForSubscribe, 'scroll', callback);
        } else {
            UnregisterUtil(targetForSubscribe, 'scroll');
        }
    }
};
