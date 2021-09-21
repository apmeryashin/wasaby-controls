import {IDataLoadProvider, IBaseLoadDataConfig} from 'Controls/_dataSource/DataLoader/IDataLoadProvider';
import {default as NewSourceController} from 'Controls/_dataSource/Controller';
import {ControllerClass as FilterController, IFilterControllerOptions, IFilterItem} from 'Controls/filter';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {RecordSet} from 'Types/collection';
import {ControllerClass as SearchController} from 'Controls/search';
import {TArrayGroupId} from 'Controls/list';
import {PrefetchProxy} from 'Types/source';
import {
    ISortingOptions,
    ISourceOptions,
    TSortingOptionValue,
    INavigationOptions,
    INavigationSourceConfig,
    TFilter,
    TKey
} from 'Controls/interface';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {getState} from 'Controls/_dataSource/Controller/State';
import {isLoaded, loadAsync, loadSync} from 'WasabyLoader/ModulesLoader';
import {Logger} from 'UI/Utils';
import {loadSavedConfig} from 'Controls/Application/SettingsController';

const QUERY_PARAMS_LOAD_TIMEOUT = 5000;

interface IFilterHistoryLoaderResult {
    filterButtonSource: IFilterItem[];
    filter: TFilter;
    historyItems: IFilterItem[];
}

interface IFilterResult {
    historyItems: IFilterItem[];
    controller: FilterController;
}

export interface ILoadDataConfig extends
    IBaseLoadDataConfig,
    ISourceOptions,
    INavigationOptions<INavigationSourceConfig> {
    id?: string;
    type?: 'list';
    sorting?: TSortingOptionValue;
    sourceController?: NewSourceController;
    filterController?: FilterController;
    filter?: TFilter;
    filterButtonSource?: IFilterItem[];
    fastFilterSource?: object[];
    historyId?: string;
    groupHistoryId?: string;
    nodeHistoryId?: string;
    historyItems?: IFilterItem[];
    propStorageId?: string;
    stateStorageId?: string;
    root?: string;
    parentProperty?: string;
    expandedItems?: TKey[];
    searchParam?: string;
    searchValue?: string;
    filterHistoryLoader?: (filterButtonSource: object[], historyId: string) => Promise<IFilterHistoryLoaderResult>;
    error?: Error;
    historySaveCallback?: (historyData: Record<string, unknown>, filterButtonItems: IFilterItem[]) => void;
    minSearchLength?: number;
    searchDelay?: number;
    items?: RecordSet;
    loadTimeout?: number;
}

export interface ILoadDataResult extends ILoadDataConfig {
    data: RecordSet;
    error: Error;
    sourceController: NewSourceController;
    filterController?: FilterController;
    searchController?: SearchController;
    collapsedGroups?: TArrayGroupId;
    source: PrefetchProxy;
    operationsController?: OperationsController;
}

/**
 * Provider обеспечивающих предзагрузку данных списка
 */
class ListProvider implements IDataLoadProvider<ILoadDataConfig, ILoadDataResult> {

    load(
        loadConfig: ILoadDataConfig,
        loadDataTimeout?: number,
        listConfigStoreId?: string
    ): Promise<ILoadDataResult> {
        let filterController: FilterController;
        let operationsPromise;
        let filterHistoryItems;
        let sortingPromise;
        let filterPromise;

        if (listConfigStoreId) {
            Object.assign(loadConfig, getState(listConfigStoreId));
        }

        if (this._isNeedPrepareFilter(loadConfig)) {
            if (loadConfig.filterHistoryLoader instanceof Function) {
                filterPromise  = this._getFilterControllerWithHistoryFromLoader(loadConfig);
            } else {
                if (isLoaded('Controls/filter')) {
                    filterPromise = this._getFilterControllerWithFilterHistory(loadConfig);
                } else {
                    filterPromise = loadAsync('Controls/filter').then(() => {
                        return this._getFilterControllerWithFilterHistory(loadConfig);
                    });
                }
            }

            filterPromise
                .then(({controller, historyItems}) => {
                    filterController = loadConfig.filterController = controller;
                    filterHistoryItems = historyItems;
                })
                .catch(() => {
                    filterController = ListProvider.getFilterController(loadConfig as IFilterControllerOptions);
                });
            filterPromise = wrapTimeout(filterPromise, QUERY_PARAMS_LOAD_TIMEOUT).catch(() => {
                Logger.info('Controls/dataSource:loadData: Данные фильтрации не загрузились за 1 секунду');
            });
        }

        if (loadConfig.propStorageId) {
            sortingPromise = loadSavedConfig(loadConfig.propStorageId, ['sorting']);
            sortingPromise = wrapTimeout(sortingPromise, QUERY_PARAMS_LOAD_TIMEOUT).catch(() => {
                Logger.info('Controls/dataSource:loadData: Данные сортировки не загрузились за 1 секунду');
            });
        }

        if (loadConfig.actions) {
            operationsPromise = loadAsync('Controls/operations').then((operations) => {
                return new operations.ControllerClass({});
            });
        }

        return Promise.all([
            filterPromise,
            sortingPromise,
            operationsPromise
        ]).then(([, sortingPromiseResult, operationsController]: [TFilter, ISortingOptions, any]) => {
            const sorting = sortingPromiseResult ? sortingPromiseResult.sorting : loadConfig.sorting;
            const sourceController = ListProvider.getSourceController({
                ...loadConfig,
                sorting,
                filter: filterController ? filterController.getFilter() : loadConfig.filter,
                loadTimeout: loadDataTimeout
            });

            return new Promise((resolve) => {
                if (loadConfig.source) {
                    sourceController.reload(undefined, true)
                        .catch((error) => error)
                        .finally(() => {
                            resolve(
                                this._getLoadResult(
                                    loadConfig,
                                    sourceController,
                                    filterController,
                                    filterHistoryItems,
                                    operationsController
                                )
                            );
                        });
                } else {
                    resolve(
                        this._getLoadResult(
                            loadConfig,
                            sourceController,
                            filterController,
                            filterHistoryItems,
                            operationsController
                        )
                    );
                }
            }).then((result: ILoadDataResult) => {
                if (!result.source && result.historyItems) {
                    result.sourceController.setFilter(result.filter);
                }
                return result;
            });
        });
    }

    private _isNeedPrepareFilter(loadDataConfig: ILoadDataConfig): boolean {
        return !!(loadDataConfig.filterButtonSource || loadDataConfig.fastFilterSource || loadDataConfig.searchValue);
    }

    private _getFilterControllerWithHistoryFromLoader(loadConfig: ILoadDataConfig): Promise<IFilterResult> {
        return loadConfig.filterHistoryLoader(loadConfig.filterButtonSource, loadConfig.historyId)
            .then((result: IFilterHistoryLoaderResult) => {
                const controller = ListProvider.getFilterController({
                    ...loadConfig,
                    ...result
                } as IFilterControllerOptions);

                if (result.historyItems) {
                    controller.setFilterItems(result.historyItems);
                }
                return {
                    controller,
                    ...result
                };
            });
    }

    private _getFilterControllerWithFilterHistory(loadConfig: ILoadDataConfig): Promise<IFilterResult> {
        const controller = ListProvider.getFilterController(loadConfig as IFilterControllerOptions);
        return Promise.resolve(
            loadConfig.historyItems || controller.loadFilterItemsFromHistory()
        ).then((historyItems) => {
            controller.setFilterItems(historyItems);
            return {
                controller,
                historyItems: historyItems.items || historyItems
            };
        });
    }

    private _getLoadResult(
        loadConfig: ILoadDataConfig,
        sourceController: NewSourceController,
        filterController: FilterController,
        historyItems?: IFilterItem[],
        operationsController?: OperationsController
    ): ILoadDataResult {
        return {
            ...loadConfig,
            sourceController,
            filterController,
            historyItems,
            filterButtonSource: filterController?.getFilterButtonItems(),
            source: loadConfig.source ? new PrefetchProxy({
                target: loadConfig.source,
                data: {
                    query: sourceController.getLoadError() || sourceController.getItems()
                }
            }) : undefined,
            data: sourceController.getItems(),
            error: sourceController.getLoadError(),
            filter: sourceController.getFilter(),
            sorting:  sourceController.getSorting() as TSortingOptionValue,
            collapsedGroups: sourceController.getCollapsedGroups(),
            operationsController
        };
    }

    static getFilterController(options: IFilterControllerOptions): FilterController {
        const controllerClass = loadSync<typeof import('Controls/filter')>('Controls/filter').ControllerClass;
        return new controllerClass({...options});
    }

    static getSourceController(options: ILoadDataConfig): NewSourceController {
        let sourceController;

        if (options.sourceController) {
            sourceController = options.sourceController;
            sourceController.updateOptions(options);
        } else {
            sourceController = new NewSourceController(options);
        }

        return sourceController;
    }
}

export default ListProvider;
