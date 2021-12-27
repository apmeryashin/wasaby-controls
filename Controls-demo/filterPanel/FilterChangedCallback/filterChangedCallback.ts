import {IFilterItem} from 'Controls/filter';

interface IChangedFilters {
    amount?: number[];
}

export default(filterDescriptionItem: IFilterItem, filter: object, changedFilters: IChangedFilters): IFilterItem => {
    const filterItem = {...filterDescriptionItem};
    if (changedFilters.hasOwnProperty('amount')) {
        let newFilter;
        if (changedFilters.amount?.length) {
            newFilter = {
                showOnAmountChanged: true
            };
        } else {
            newFilter = {};
        }
        filterItem.editorOptions.filter = newFilter;
    }
    return filterItem;
};
