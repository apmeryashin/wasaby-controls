import {getSettings, setSettings} from 'Controls/Application/SettingsController';

export function getPopupWidth(propStorageId: string): Promise<number | void> {
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

export function savePopupWidth(propStorageId: string, width: number): void {
    if (propStorageId && width) {
        setSettings({[propStorageId]: width});
    }
}
