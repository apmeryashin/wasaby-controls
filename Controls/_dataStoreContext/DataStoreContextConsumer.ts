import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dataStoreContext/DataStoreContextConsumer';
import Context from './DataStoreContext';
import {IDataStore} from 'Controls/_dataStoreContext/dataStoreInitializer';

interface IPrefetchOptionsConsumerContext {
    dataStore: typeof Context;
}

export default class ControllerContextConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _dataStoreValue: IDataStore;

    protected _beforeMount(options: unknown, context: IPrefetchOptionsConsumerContext): void {
        this._dataStoreValue = context.dataStore.getValue();
    }

    protected _beforeUpdate(newOptions: unknown, newContext: IPrefetchOptionsConsumerContext): void {
        this._dataStoreValue = newContext.dataStore.getValue();
    }

    static contextTypes(): object {
        return {
            dataStore: Context
        };
    }
}
