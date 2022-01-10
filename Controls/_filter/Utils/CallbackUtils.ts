import {IFilterItem} from 'Controls/_filter/View/interface/IFilterItem';
import {TFilter} from 'Controls/_interface/IFilter';
import {isEqual} from 'Types/object';
import {loadAsync} from 'WasabyLoader/ModulesLoader';

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
                                               filterChangedCallback: Function): IFilterItem {
    let newItem = {...item};
    if (filterChangedCallback) {
        newItem = filterChangedCallback(item, updatedFilter, changedFilters);
    }
    return newItem;
}

export function getItemVisivbility(item: IFilterItem,
                                   updatedFilter: TFilter,
                                   changedFilters: object,
                                   filterVisibilityCallback: Function): boolean {
    if (filterVisibilityCallback) {
        return filterVisibilityCallback(item, updatedFilter, changedFilters);
    }
}

export function getFilterItemsAfterCallback(items: IFilterItem[],
                                            currentFilter: TFilter,
                                            updatedFilter: TFilter,
                                            updateCallback: Function): void {
    const changedFilters = getChangedFilters(currentFilter, updatedFilter);
    if (Object.keys(changedFilters).length) {
        getNewItems(changedFilters, updatedFilter, items).then((newFilterButtonItems) => {
            updateCallback(newFilterButtonItems);
        });
    } else {
        updateCallback(items);
    }
}

function getNewItems(changedFilters: object, updatedFilter: TFilter, items: IFilterItem[]): Promise<IFilterItem[]> {
    return Promise.all(
        items?.map((item) => {
            return Promise.all(getCallbackPromises(item)).then((callbacks) => {
                item.visibility = getItemVisivbility(item, updatedFilter, changedFilters, callbacks[0]);
                return getItemOnFilterChangedCallback(item, updatedFilter, changedFilters, callbacks[1]);
            });
        })
    );
}

function getCallbackPromises(item: IFilterItem): Promise[] {
    const callBackPromises = [];
    callBackPromises.push(getCallBackByName(item, 'filterVisibilityCallback'));
    callBackPromises.push(getCallBackByName(item, 'filterChangedCallback'));
    return callBackPromises;
}

function getCallBackByName(item: IFilterItem, callbackName: string): Promise<Function|void> {
    if (item.hasOwnProperty(callbackName)) {
        return loadAsync(item[callbackName]);
    }
    return Promise.resolve();
}
