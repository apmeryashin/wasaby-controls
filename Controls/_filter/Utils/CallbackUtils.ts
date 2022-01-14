import {IFilterItem} from 'Controls/_filter/View/interface/IFilterItem';
import {TFilter} from 'Controls/_interface/IFilter';
import {isEqual} from 'Types/object';
import {loadAsync, loadSync, isLoaded} from 'WasabyLoader/ModulesLoader';

export function getChangedFilters(currentFilter: TFilter, updatedFilter: TFilter): object {
    const changedFilters = {};
    for (const filterName in currentFilter) {
        if (!isEqual(currentFilter[filterName], updatedFilter[filterName])) {
            changedFilters[filterName] = updatedFilter[filterName];
        }
    }
    return changedFilters;
}

export function getItemOnFilterChangedCallback(item: IFilterItem,
                                               updatedFilter: TFilter,
                                               changedFilters: object,
                                               callbackPath: string): IFilterItem {
    let newItem = {...item};
    const filterChangedCallback = callbackPath && loadSync(callbackPath);
    if (filterChangedCallback) {
        newItem = filterChangedCallback(item, updatedFilter, changedFilters);
    }
    return newItem;
}

export function getItemVisivbility(item: IFilterItem,
                                   updatedFilter: TFilter,
                                   changedFilters: object,
                                   callbackPath: string): boolean {
    const filterVisibilityCallback = callbackPath && loadSync(callbackPath);
    if (filterVisibilityCallback) {
        return filterVisibilityCallback(item, updatedFilter, changedFilters);
    }
}

export function updateFilterDescription(items: IFilterItem[],
                                        currentFilter: TFilter,
                                        updatedFilter: TFilter,
                                        updateCallback: Function): void {
    const changedFilters = getChangedFilters(currentFilter, updatedFilter);
    if (Object.keys(changedFilters).length) {
        if (isCallbacksLoaded(items)) {
            callCallbacksOnFilterDescriptionItems(changedFilters, updatedFilter, items, updateCallback);
        } else {
            loadCallbacks(items).then(() => {
                callCallbacksOnFilterDescriptionItems(changedFilters, updatedFilter, items, updateCallback);
            });
        }
    } else {
        updateCallback(items);
    }
}

export function loadCallbacks(items: IFilterItem[]): Promise<any[]> {
    const callBackPromises = [];
    items?.forEach((item) => {
        callBackPromises.push(getCallBackByName(item, 'filterVisibilityCallback'));
        callBackPromises.push(getCallBackByName(item, 'filterChangedCallback'));
    });
    return Promise.all(callBackPromises);
}

export function callCallbacksOnFilterDescriptionItems(changedFilters: object,
                                                      updatedFilter: TFilter,
                                                      items: IFilterItem[],
                                                      updateCallback: Function): void {
    const newFilterDescription = [];
    items?.forEach((item) => {
        if (item.filterVisibilityCallback) {
            item.visibility = getItemVisivbility(item, updatedFilter, changedFilters, item.filterVisibilityCallback);
        }
        newFilterDescription.push(getItemOnFilterChangedCallback(item, updatedFilter, changedFilters,
                                                                 item.filterChangedCallback));
    });
    updateCallback(newFilterDescription);
}

function getCallBackByName(item: IFilterItem, callbackName: string): Promise<Function|void> {
    if (item.hasOwnProperty(callbackName)) {
        return loadAsync(item[callbackName]);
    }
    return Promise.resolve();
}

function isCallbacksLoaded(items: IFilterItem[]): boolean {
    let isCallbackLoaded = true;
    items?.forEach((item) => {
        if ((item.hasOwnProperty('filterVisibilityCallback') && !isLoaded(item.filterVisibilityCallback)) ||
            (item.hasOwnProperty('filterChangedCallback') && !isLoaded(item.filterChangedCallback))) {
            isCallbackLoaded = false;
        }
    });
    return isCallbackLoaded;
}
