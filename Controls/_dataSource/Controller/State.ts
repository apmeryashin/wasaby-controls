import {TKey} from 'Controls/interface';
export interface IDataSourceControllerState {
    searchValue?: string;
    selectedKeys?: TKey[];
    excludedKeys?: TKey[];
    expandedItems?: TKey[];
}

const STATE = {};

export function saveState(id: string, state: IDataSourceControllerState): void {
    STATE[id] = state;
}

export function getState(id: string): IDataSourceControllerState|void {
    return STATE[id];
}
