import {IDataLoadProvider, IBaseLoadDataConfig} from 'Controls/_dataSource/DataLoader/IDataLoadProvider';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';

export interface ILoadDataCustomConfig extends IBaseLoadDataConfig {
    id?: string;
    type: 'custom';
    loadDataMethod: Function;
    loadDataMethodArguments?: object;
    dependencies?: string[];
}

export type TCustomResult = unknown;

/**
 * Provider обеспечивающих предзагрузку данных для кастомного загрузчика
 */
class CustomProvider implements IDataLoadProvider<ILoadDataCustomConfig, TCustomResult> {
    load(
        loadConfig: ILoadDataCustomConfig,
        loadDataTimeout?: number,
        listConfigStoreId?: string,
        dependencies?: unknown[]
    ): Promise<TCustomResult> {
        const customPromise = loadConfig.loadDataMethod(
            loadConfig.loadDataMethodArguments,
            dependencies
        );
        return wrapTimeout(
            customPromise,
            loadDataTimeout
        ).catch((error) => error);
    }
}

export default CustomProvider;
