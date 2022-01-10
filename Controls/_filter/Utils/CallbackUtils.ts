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

function callCallbacksOnFilterDescriptionItems(changedFilters: object,
                                               updatedFilter: TFilter,
                                               items: IFilterItem[],
                                               updateCallback: Function): void {
    const newFilterDescription = items?.map((item) => {
        item.visibility = getItemVisivbility(item, updatedFilter, changedFilters, item.filterVisibilityCallback);
        return getItemOnFilterChangedCallback(item, updatedFilter, changedFilters, item.filterChangedCallback);
    });
    updateCallback(newFilterDescription);
}

function loadCallbacks(items: IFilterItem[]): Promise<any[]> {
    return Promise.all(
        items?.map((item) => {
            const callBackPromises = [];
            callBackPromises.push(getCallBackByName(item, 'filterVisibilityCallback'));
            callBackPromises.push(getCallBackByName(item, 'filterChangedCallback'));
            return Promise.all(callBackPromises);
        })
    );
}

function getCallBackByName(item: IFilterItem, callbackName: string): Promise<Function|void> {
    if (item.hasOwnProperty(callbackName)) {
        return loadAsync(item[callbackName]);
    }
    return Promise.resolve();
}

function isCallbacksLoaded(items: IFilterItem[]): boolean {
    return items?.every((item) => {
        return (item.hasOwnProperty('filterVisibilityCallback') ? isLoaded(item.filterVisibilityCallback) : true) &&
               (item.hasOwnProperty('filterChangedCallback') ? isLoaded(item.filterChangedCallback) : true);
    });
}
