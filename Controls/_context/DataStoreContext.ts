import * as DataContext from 'Core/DataContext';
import {IDataStore} from 'Controls/_context/dataStoreInitializer';

export interface IDataStoreOptions {
    value: IDataStore;
}

const Context = DataContext.extend({
    constructor(options: IDataStoreOptions): void {
        this._$value = { ...options.value };
    },
    updateValue(options: IDataStoreOptions): void {
        this._$value = {...options.value};
        this.updateConsumers();
    },

    getValue(): IDataStoreOptions {
        return this._$value;
    },

    _moduleName: 'Controls-widgets/_context/PrefetchOptions'
});

export default Context;
