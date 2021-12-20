import {IFilterItem} from 'Controls/_filter/View/interface/IFilterItem';
import {object} from 'Types/util';
import {TFilter} from 'Controls/_interface/IFilter';
import {isEqual} from 'Types/object';

const getPropValue = object.getPropertyValue;

function getChangedFilters(currentFilter: TFilter, updatedFilter: TFilter): object {
    const changedFilters = {};
    for (const filterName in currentFilter) {
        if (!isEqual(currentFilter[filterName], updatedFilter[filterName])) {
            changedFilters[filterName] = updatedFilter[filterName];
        }
    }
    return changedFilters;
}

function getItemOnFilterChangedCallback(item: IFilterItem,
                                        updatedFilter: TFilter,
                                        changedFilters: object): IFilterItem {
    let newItem = {...item};
    if (item.filterChangedCallback) {
        newItem = item.filterChangedCallback(item, updatedFilter, changedFilters);
    }
    return newItem;
}

function getItemVisivbility(item: IFilterItem, updatedFilter: TFilter, changedFilters: object): boolean {
    if (item.filterVisibilityCallback) {
        return item.filterVisibilityCallback(item, updatedFilter, changedFilters);
    }
    return true;
}

function getLoadedCallback(item: IFilterItem, callbackName: string): Promise<IFilterItem> {
    return new Promise((resolve) => {
        if (item[callbackName] && typeof item[callbackName] === 'string') {
            require([item[callbackName]], (callback) => {
                item[callbackName] = callback.default;
                resolve(item);
            });
        } else {
            resolve(item);
        }
    });
}

function setItemsCallbacks(updatedFilterConfig: IFilterItem[]): Promise[] {
    const itemsPromises = [];
    updatedFilterConfig.forEach((item) => {
        itemsPromises.push(getLoadedCallback(item,
                                'filterVisibilityCallback').then((resultItem) => {
            return getLoadedCallback(resultItem, 'filterChangedCallback');
        }));
    });
    return itemsPromises;
}

export function getFilterByItems(filterItems: IFilterItem[]): object {
    const filter = {};
    filterItems?.forEach((item) => {
        const prop: string = getPropValue(item, 'id') ? getPropValue(item, 'id')
                                                               : getPropValue(item, 'name');
        filter[prop] = getPropValue(item, 'value');
    });
    return filter;
}

export function getFilterItemsAfterCallback(currentFilter: TFilter,
                                            updatedFilter: TFilter,
                                            updatedFilterConfig: IFilterItem[]): Promise<IFilterItem[]> {
    const changedFilters = getChangedFilters(currentFilter, updatedFilter);
    if (Object.keys(changedFilters).length) {
        const itemPromises = setItemsCallbacks(updatedFilterConfig);
        return Promise.all(itemPromises).then((items) => {
            return items.map((item) => {
                item.visibility = getItemVisivbility(item, updatedFilter, changedFilters);
                return getItemOnFilterChangedCallback(item, updatedFilter, changedFilters);
            });
        });
    }
    return Promise.resolve(updatedFilterConfig);
}
