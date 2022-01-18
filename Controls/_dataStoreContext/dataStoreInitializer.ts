import {IListStore, ILoadDataResult, listInitializer} from 'Controls/dataSource';
import {IFilterStore, filterInitializer} from 'Controls/filter';
import {loadSync} from 'WasabyLoader/ModulesLoader';

export interface IDataStore extends ILoadDataResult {
    listStore: IListStore;
    filterStore: IFilterStore;
}

export default function(initialState: IDataStore, stateChangedCallback: Function): IDataStore {
    const store = {...initialState};

    if (initialState.source) {
        const listInitializerFunc = loadSync<typeof listInitializer>('Controls/dataSource:listInitializer');
        store.listStore = listInitializerFunc(store);
    }

    if (initialState.filterController) {
        const filterInitializerFunc = loadSync<typeof filterInitializer>('Controls/filter:filterInitializer');
        store.filterStore = filterInitializerFunc(store, stateChangedCallback);
    }

    return store as IDataStore;
}
