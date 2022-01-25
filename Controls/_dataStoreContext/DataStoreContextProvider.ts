import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_dataStoreContext/DataStoreContextProvider';
import Context from './DataStoreContext';
import {isEqual} from 'Types/object';
import {default as dataStoreInitializer, IDataStore} from 'Controls/_dataStoreContext/dataStoreInitializer';
import {ILoadDataResult} from 'Controls/dataSource';

interface IPrefetchProviderOptions extends IControlOptions {
    value: ILoadDataResult;
}

export default class ControllerContextProvider extends Control<IPrefetchProviderOptions> {
    _template: TemplateFunction = template;
    protected _dataStoreContext: typeof Context;

    protected _beforeMount(options: IPrefetchProviderOptions): void {
        const contextValue = this._initStore(options.value);
        this._dataStoreContext = new Context({value: contextValue});
    }

    protected _beforeUpdate(newOptions: IPrefetchProviderOptions): void {
        if (!isEqual(this._options.value, newOptions.value)) {
            const contextValue = this._initStore(newOptions.value);
            this._dataStoreContext.updateValue({value: contextValue});
        }
    }

    private _initStore(storeValue: ILoadDataResult): IDataStore {
        return dataStoreInitializer(storeValue, (newStoreState) => {
            this._dataStoreContext.updateValue(newStoreState);
        });
    }

    _getChildContext(): object {
        return {
            dataStore: this._dataStoreContext
        };
    }
}
