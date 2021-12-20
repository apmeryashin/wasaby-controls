import {IFilterItem} from 'Controls/filter';

export default(filterDescriptionItem: IFilterItem, filter: object, changedFilters: object): IFilterItem => {
    const filterItem = {...filterDescriptionItem};
    if (changedFilters.hasOwnProperty('amount')) {
        filterItem.value = filterDescriptionItem.resetValue;
    }
    return filterItem;
};
