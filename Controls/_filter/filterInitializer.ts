import {ILoadDataResult} from 'Controls/dataSource';
import {IFilterItem} from 'Controls/filter';
import {IFilterOptions} from 'Controls/interface';

export interface IFilterStore extends IFilterOptions {
    filterDescription: IFilterItem[];
    isFilterDetailPanelVisible: boolean;
    openFilterDetailPanel: () => void;
    getFilterDescription: () => IFilterItem[];
    applyFilterDescription: (filterDescription: IFilterItem[]) => void;
}

export default function getState(initialState: ILoadDataResult, storeChangedCallback: Function): IFilterStore {
    const filterController = initialState.filterController;

    function openFilterDetailPanel(): void {
        const state = {...initialState};
        state.isFilterDetailPanelVisible = true;
        storeChangedCallback(state);
    }

    function getFilterDescription(): IFilterItem[] {
        return filterController.getFilterButtonItems();
    }

    function applyFilterDescription(filterDescription: IFilterItem[]): void {
        const state = {...initialState};
        filterController.updateFilterItems(filterDescription);
        const filter = filterController.getFilter();
        initialState.listStore.setFilter(filter);
        initialState.listStore
            .reload()
            .then(() => {
                state.filter = filter;
                state.filterButtonSource = filterController.getFilterButtonItems();
                storeChangedCallback(state);
            });
    }

    return {
        filter: initialState.filter,
        filterDescription: initialState.filterButtonSource,
        isFilterDetailPanelVisible: initialState.isFilterDetailPanelVisible || false,
        openFilterDetailPanel,
        getFilterDescription,
        applyFilterDescription
    };
}
