import {default as NewSourceController, IControllerState} from 'Controls/_dataSource/Controller';
import ListProvider, {ILoadDataResult} from 'Controls/_dataSource/DataLoader/ListProvider';
import {ControllerClass as FilterController, IFilterControllerOptions} from 'Controls/filter';
import {isLoaded, loadSync} from 'WasabyLoader/ModulesLoader';
import {ControllerClass as SearchController} from 'Controls/search';
import {ISearchControllerOptions} from 'Controls/_search/ControllerClass';
import {Guid} from 'Types/entity';
import {Logger} from 'UI/Utils';

/**
 * Класс реализующий хранилище предзагруженных данных
 */
export class Storage {
    private _storage: Map<string, ILoadDataResult> = new Map();

    getSourceController(id?: string): NewSourceController {
        const config = this.get(id);
        let {sourceController} = config;
        const {items, filterButtonSource, fastFilterSource} = config;

        if (!sourceController) {
            sourceController = config.sourceController = ListProvider.getSourceController(config);

            if (items) {
                sourceController.setItems(items);
            }

            if (filterButtonSource || fastFilterSource) {
                sourceController.setFilter(this.getFilterController(id).getFilter());
            }
        }

        return sourceController;
    }

    setSourceController(id: string, sourceController: NewSourceController): void {
        this.get(id).sourceController = sourceController;
    }

    getFilterController(id?: string): FilterController {
        const config = this.get(id);
        let {filterController} = config;
        const {historyItems} = config;

        if (!filterController) {
            if (isLoaded('Controls/filter')) {
                filterController = config.filterController =
                    ListProvider.getFilterController(config as IFilterControllerOptions);

                if (historyItems) {
                    filterController.setFilterItems(config.historyItems);
                }
            }
        }
        return filterController;
    }

    getSearchController(id?: string): Promise<SearchController> {
        const config = this.get(id);
        if (!config.searchController) {
            if (!config.searchControllerCreatePromise) {
                config.searchControllerCreatePromise = import('Controls/search').then((result) => {
                    config.searchController = new result.ControllerClass(
                        {...config} as ISearchControllerOptions
                    );

                    return config.searchController;
                });
            }
            return config.searchControllerCreatePromise;
        }

        return Promise.resolve(config.searchController);
    }

    getSearchControllerSync(id?: string): SearchController {
        const config = this.get(id);

        if (
            !config?.searchController &&
            config?.searchParam &&
            config?.sourceController &&
            isLoaded('Controls/search')
        ) {
            const searchControllerClass = loadSync<typeof import('Controls/search')>('Controls/search').ControllerClass;
            config.searchController = new searchControllerClass(
                {...config} as ISearchControllerOptions
            );
        }
        return config?.searchController;
    }

    getState(): Record<string, IControllerState> {
        const state = {};
        this.each((config, id) => {
            state[id] = {...config, ...this.getSourceController(id).getState()};
        });
        return state;
    }

    destroy(): void {
        this.each(({sourceController}) => {
            sourceController?.destroy();
        });
        this._storage.clear();
    }

    each(callback: Function): void {
        this._storage.forEach((config: ILoadDataResult, id) => {
            callback(config, id);
        });
    }

    set(
        data: ILoadDataResult,
        id?: string
    ): void {
        this._storage.set(id || Guid.create(), data);
    }

    get(id?: string): ILoadDataResult {
        let config;

        if (!id) {
            config = this._storage.entries().next().value[1];
        } else if (id) {
            config = this._storage.get(id);
        } else {
            Logger.error('Controls/dataSource:loadData: ????');
        }

        return config;
    }
}

export default Storage;
