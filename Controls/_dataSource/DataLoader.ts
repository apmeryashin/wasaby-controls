import {default as NewSourceController, IControllerState} from 'Controls/_dataSource/Controller';
import {ControllerClass as FilterController} from 'Controls/filter';
import {Logger} from 'UI/Utils';
import {loadAsync, loadSync, isLoaded} from 'WasabyLoader/ModulesLoader';
import {Guid} from 'Types/entity';
import {ControllerClass as SearchController} from 'Controls/search';
import {constants} from 'Env/Constants';
import ListProvider, {
    ILoadDataResult,
    ILoadDataConfig
} from 'Controls/_dataSource/DataLoader/ListProvider';
import CustomProvider, {
    ILoadDataCustomConfig,
    TCustomResult
} from 'Controls/_dataSource/DataLoader/CustomProvider';
import Storage from 'Controls/_dataSource/DataLoader/Storage';

const DEFAULT_LOAD_TIMEOUT = 10000;
const DEBUG_DEFAULT_LOAD_TIMEOUT = 30000;
const DATA_PROVIDERS_BY_TYPE = {
    list: ListProvider,
    custom: CustomProvider
};

export interface IDataLoaderOptions {
    loadDataConfigs?: ILoadDataConfig[];
}
export type TLoadersConfigsMap = Record<string, TLoadConfig>;
type TLoadConfig = ILoadDataConfig|ILoadDataCustomConfig;
type TLoadResult = ILoadDataResult|TCustomResult|boolean;
type TLoadPromiseResult = Promise<TLoadResult>;
type TLoadPromiseResultMap = Record<string, Promise<TLoadResult>>;
export type TLoadResultMap = Record<string, TLoadResult>;

function getLoadTimeout(loadConfig: ILoadDataConfig): number {
    return loadConfig?.loadTimeout || (constants.isProduction ? DEFAULT_LOAD_TIMEOUT : DEBUG_DEFAULT_LOAD_TIMEOUT);
}

export default class DataLoader {
    private _loadedConfigStorage: Storage = new Storage();
    private _loadDataConfigs: TLoadConfig[] | TLoadersConfigsMap;
    private _originLoadDataConfigs: TLoadConfig[];

    constructor(options: IDataLoaderOptions = {}) {
        if (options.loadDataConfigs instanceof Array) {
            this._originLoadDataConfigs = options.loadDataConfigs || [];
            this._loadDataConfigs = this._getConfigsWithKeys(this._originLoadDataConfigs);
            this._loadDataConfigs.forEach((config, index) => {
                // Сеттим оригинальные конфиги, чтобы в SourceController не попал id, если его не задавали
                this._loadedConfigStorage.set(this._originLoadDataConfigs[index], config.id);
            });
        } else {
            this._loadDataConfigs = options.loadDataConfigs || {};
            Object.keys(this._loadDataConfigs).forEach((key) => {
                this._loadedConfigStorage.set(this._loadDataConfigs[key], key);
            });
        }
    }

    load<T extends ILoadDataResult>(
        sourceConfigs?: TLoadConfig[]
    ): Promise<TLoadResult[]> | Promise<TLoadResultMap> {
        const loadResult = this.loadEvery<T>(sourceConfigs);
        if (loadResult instanceof Array) {
            return Promise.all(loadResult);
        } else {
            return new Promise((resolve, reject) => {
                const result = {};
                const promises = [];
                Object.keys(loadResult).forEach((key) => {
                    promises.push(
                        loadResult[key].then((loaderResult) => {
                            result[key] = loaderResult;
                        })
                    );
                });
                Promise.all(promises).then(() => {
                    resolve(result);
                }).catch(reject);
            });
        }
    }

    loadEvery<T extends ILoadDataConfig|ILoadDataCustomConfig>(
        sourceConfigs: TLoadConfig[] | TLoadersConfigsMap = this._loadDataConfigs,
        loadTimeout?: number,
        listConfigStoreId?: string
    ): TLoadPromiseResult[] | TLoadPromiseResultMap {
        if (sourceConfigs instanceof Array) {
            const configsWithKeys = this._getConfigsWithKeys(sourceConfigs);
            const loadersMap = this._getLoadersMap(
                configsWithKeys,
                sourceConfigs ? sourceConfigs as TLoadConfig[] : this._originLoadDataConfigs
            );
            return this._loadLoadersArray(configsWithKeys, loadersMap, loadTimeout, listConfigStoreId);
        } else {
            return this._loadLoadersMap(sourceConfigs, loadTimeout, listConfigStoreId);
        }
    }

    private _getConfigsWithKeys(configs: TLoadConfig[]): TLoadConfig[] {
        return configs.map((config) => {
            return {
                id: config.id || Guid.create(),
                ...config
            };
        });
    }

    private _getLoadersMap(configsWithKeys: TLoadConfig[], originConfigs: TLoadConfig[]): TLoadersConfigsMap {
        const configsMap = {};
        configsWithKeys.forEach((config, index) => {
            // Сеттим оригинальные конфиги, чтобы в SourceController не попал id, если его не задавали
            configsMap[config.id] = originConfigs[index];
        });
        return configsMap;
    }

    getSourceController(id?: string): NewSourceController {
        return this._loadedConfigStorage.getSourceController(id);
    }

    setSourceController(id: string, sourceController: NewSourceController): void {
        return this._loadedConfigStorage.setSourceController(id, sourceController);
    }

    getFilterController(id?: string): FilterController {
        return this._loadedConfigStorage.getFilterController(id);
    }

    getSearchController(id?: string): Promise<SearchController> {
        return this._loadedConfigStorage.getSearchController(id);
    }

    getSearchControllerSync(id?: string): SearchController {
        return this._loadedConfigStorage.getSearchControllerSync(id);
    }

    getState(): Record<string, IControllerState> {
        const state = {};
        this._loadedConfigStorage.each((config, id) => {
            state[id] = {...config, ...this.getSourceController(id).getState()};
        });
        return state;
    }

    destroy(): void {
        this._loadedConfigStorage.destroy();
    }

    each(callback: Function): void {
        this._loadedConfigStorage.each((config: ILoadDataResult, id) => {
            callback(config, id);
        });
    }

    getStorage(): Storage {
        return this._loadedConfigStorage;
    }

    /**
     * Запускает лоадеры, конфиг которых задан в виде объекта
     * @param sourceConfigs
     * @param loadTimeout
     * @param listConfigStoreId
     * @private
     */
    private _loadLoadersMap(
        sourceConfigs?: TLoadersConfigsMap,
        loadTimeout?: number,
        listConfigStoreId?: string
    ): TLoadPromiseResultMap {
        const startedLoaders: {[loaderKey: string]: TLoadPromiseResult} = {};
        const loadResult = {};
        Object.keys(sourceConfigs).forEach((loaderKey) => {
            let loadPromise;
            if (startedLoaders[loaderKey]) {
                loadPromise = startedLoaders[loaderKey];
            } else {
                loadPromise =
                    this._callLoaderWithDependencies(loaderKey, sourceConfigs, startedLoaders,
                        loadTimeout, listConfigStoreId);
            }
            loadResult[loaderKey] = loadPromise;
        });
        return loadResult;
    }

    /**
     * Запускает лоадеры, конфиг которых задан массивом
     * @param sourceConfigs
     * @param loadersMap
     * @param loadTimeout
     * @param listConfigStoreId
     * @private
     */
    private _loadLoadersArray(
        sourceConfigs: TLoadConfig[],
        loadersMap: TLoadersConfigsMap,
        loadTimeout?: number,
        listConfigStoreId?: string
    ): TLoadPromiseResult[] {
        const loadDataPromises = [];
        const startedLoaders: {[loaderKey: string]: TLoadPromiseResult} = {};

        sourceConfigs.forEach((loadConfig, index) => {
            if (startedLoaders[loadConfig.id]) {
                loadDataPromises.push(startedLoaders[loadConfig.id]);
            } else {
                loadDataPromises.push(
                    this._callLoaderWithDependencies(loadConfig.id, loadersMap, startedLoaders,
                        loadTimeout, listConfigStoreId)
                );
            }
        });

        return loadDataPromises;
    }

    /**
     * Запускает лоадер
     * Если у него есть зависимости, то так же рекурсивно запускает их
     * @param id
     * @param loadersMap мапа лоадеров id -> конфиг
     * @param startedLoaders мапа из промисов запущенных лоадеров
     * @param loadTimeout
     * @param listConfigStoreId
     * @private
     */
    private _callLoaderWithDependencies(
        id: string,
        loadersMap: TLoadersConfigsMap,
        startedLoaders: Record<string, TLoadPromiseResult>,
        loadTimeout?: number,
        listConfigStoreId?: string
    ): TLoadPromiseResult {
        const loadConfig = loadersMap[id];
        let loadPromise;
        if ('dependencies' in loadConfig) {
            const dependencies = loadConfig.dependencies;
            const dependenciesErrors = this._getDependenciesValidationErrors(id, loadersMap);
            if (dependenciesErrors.length) {
                // Если dependencies заполнены некорректно кидаем ошибку и не запускаем лоадер
                dependenciesErrors.forEach((errorText) => {
                    Logger.error(errorText);
                });
                loadPromise = Promise.reject(new Error(dependenciesErrors.join(' ')));
            } else {
                loadPromise = Promise.all(
                    this._loadDependencies(loadersMap, startedLoaders, dependencies, loadTimeout)
                ).then((results) => {
                    return this._callLoader(id, loadConfig, loadTimeout, results, listConfigStoreId);
                });
            }
        } else {
            loadPromise = this._callLoader(id, loadConfig, loadTimeout, void 0, listConfigStoreId);
        }
        startedLoaders[id] = loadPromise;
        return loadPromise;
    }

    /**
     * Вызывает лоадер по конфигу
     * @param id
     * @param loaderConfig
     * @param loadTimeout
     * @param dependencies
     * @param listConfigStoreId
     * @private
     */
    private _callLoader(
        id: string,
        loaderConfig: TLoadConfig,
        loadTimeout?: number,
        dependencies?: TLoadResult[],
        listConfigStoreId?: string
    ): TLoadPromiseResult {
        const dataLoadTimeout = loadTimeout || getLoadTimeout(loaderConfig);
        const Loader = DATA_PROVIDERS_BY_TYPE[loaderConfig.type] || DATA_PROVIDERS_BY_TYPE.list;
        const loadPromise = new Loader().load(loaderConfig, dataLoadTimeout, listConfigStoreId, dependencies);
        if (loaderConfig.afterLoadCallback) {
            const afterReloadCallbackLoadPromise = loadAsync(loaderConfig.afterLoadCallback);
            loadPromise.then((result) => {
                if (isLoaded(loaderConfig.afterLoadCallback)) {
                    loadSync<Function>(loaderConfig.afterLoadCallback)(result);
                    return result;
                } else {
                    return afterReloadCallbackLoadPromise.then((afterLoadCallback: Function) => {
                        afterLoadCallback(result);
                        return result;
                    });
                }
            });
        }
        return loadPromise.then((result) => {
            this._loadedConfigStorage.set(result, id);
            return result;
        });
    }

    /**
     * Возвращает список промисов для зависимостей лоадера
     * @param loadersMap мапа лоадеров id -> конфиг
     * @param startedLoaders мапа из промисов запущенных лоадеров
     * @param dependencies
     * @param loadTimeout
     * @private
     */
    private _loadDependencies(
        loadersMap: TLoadersConfigsMap,
        startedLoaders: Record<string, TLoadPromiseResult>,
        dependencies: string[],
        loadTimeout?: number
    ): TLoadPromiseResult[] {
        return dependencies.map((loaderKey) => {
            if (startedLoaders[loaderKey]) {
                return startedLoaders[loaderKey];
            } else {
                return this._callLoaderWithDependencies(loaderKey, loadersMap, startedLoaders, loadTimeout);
            }
        });
    }

    private _getDependenciesValidationErrors(id: string, loadersMap: TLoadersConfigsMap): string[] {
        const dependencies = loadersMap[id]?.dependencies || [];
        const missedLoaders = dependencies.reduce((result, key) => {
            if (!loadersMap[key]) {
                result.push(key);
            }
            return result;
        }, []);
        const circularDependencies = dependencies.reduce((result, depKey) => {
            const depConfig = loadersMap[depKey];
            if (depConfig.dependencies?.includes(id)) {
                result.push(depKey);
            }
            return result;
        }, []);
        const errors = [];
        if (missedLoaders.length) {
            errors.push(`Ошибка при запуске загрузчика с ключом ${id}.
                В списке загрузчиков отсутствуют зависимости данного загрузчика с ключами ${missedLoaders.join(', ')}`);
        }
        if (circularDependencies.length) {
            errors.push(`Ошибка при запуске загрузчика с ключом ${id}.
                Обнаружены циклические зависимости с загрузчиками с ключами ${circularDependencies.join(', ')}`);
        }
        return errors;
    }
}
