import { DataSet, CrudEntityKey } from 'Types/source';
import { UserConfig } from 'EnvConfig/Config';
import { Logger } from 'UI/Utils';

export const nodeHistoryUtil = {
    /**
     * Store state of expandable items to UserConfig
     * @param items Array of expandable items
     * @param storeKey Key to store list of expandable items
     */
    store(items: CrudEntityKey[], storeKey: string): Promise<DataSet | boolean> {
        const preparedGroups = JSON.stringify(items);
        return UserConfig.setParam(storeKey, preparedGroups);
    },

    /**
     * Restore state of expandable items from UserConfig
     * @param storeKey Key to store array of expandable items
     */
    restore(storeKey: string): Promise<CrudEntityKey[]> {
        return new Promise<CrudEntityKey[]>((resolve, reject) => {
            const preparedStoreKey = storeKey;
            UserConfig.getParam(preparedStoreKey).addCallback((storedGroups) => {
                try {
                    if (storedGroups !== undefined) {
                        resolve(JSON.parse(storedGroups));
                    } else {
                        resolve();
                    }
                } catch (e) {
                    const msg = 'nodeHistoryUtil: Invalid value format for key "' + preparedStoreKey + '"';
                    Logger.error(msg, this);
                    reject(msg);
                }
            }).catch((e) => {
                const msg = `nodeHistoryUtil: An error occurred while getting data.\nError: ${e.message}`;
                Logger.warn(msg);
                reject(msg);
            });
        });
    }
};
