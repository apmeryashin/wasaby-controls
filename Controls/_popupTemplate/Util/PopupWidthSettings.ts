import {getSettings, setSettings} from 'Controls/Application/SettingsController';

export interface IStackSavedConfig {
    width: number;
    minSavedWidth?: number;
    maxSavedWidth?: number;
}

export function getPopupWidth(propStorageId: string): Promise<IStackSavedConfig | void> {
    return new Promise((resolve) => {
        if (propStorageId) {
            getSettings([propStorageId]).then((storage) => {
                resolve(storage && storage[propStorageId]);
            });
        } else {
            resolve();
        }
    });
}

export function savePopupWidth(propStorageId: string, data: IStackSavedConfig): void {
    if (propStorageId && data) {
        setSettings({[propStorageId]: data});
    }
}
