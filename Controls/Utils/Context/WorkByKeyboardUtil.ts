import {Control} from 'UI/Base';
import {default as WorkByKeyboardContext} from './WorkByKeyboardContext';

export function getFocusedStatus(self: Control): string {
    if (self.context?.get('workByKeyboard')?.status) {
        return 'active';
    }
    return 'default';
}

export function getContextTypes(): object {
    return {
        workByKeyboard: WorkByKeyboardContext
    };
}
