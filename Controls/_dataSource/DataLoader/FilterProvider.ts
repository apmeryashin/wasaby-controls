import {IDataLoadProvider, IBaseLoadDataConfig} from 'Controls/_dataSource/DataLoader/IDataLoadProvider';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {ControllerClass as FilterController, IFilterItem} from 'Controls/filter';
import {TFilter} from 'Controls/_interface/IFilter';
import {isEqual} from 'Types/object';
import {object} from 'Types/util';
import PropertyGridProvider from 'Controls/_dataSource/DataLoader/PropertyGridProvider';

interface IFilterHistoryLoaderResult {
    filterButtonSource: IFilterItem[];
    filter: TFilter;
    historyItems: IFilterItem[];
}

export interface IFilterLoadDataConfig extends IBaseLoadDataConfig {
    id?: string;
    type?: 'filter';
    filter?: TFilter;
    filterSource?: IFilterItem[];
    historyId?: string;
    historyItems?: IFilterItem[];
    filterHistoryLoader?: (filterButtonSource: object[], historyId: string) => Promise<IFilterHistoryLoaderResult>;
}

interface IFilterLoaderResult {
    controller: FilterController;
}

function isPropertyChanged(property: Record<string, any>): boolean {
    return !isEqual(property.value, property.resetValue);
}

function getFilter(
    property: Record<string, any>,
    filter: Record<string, any>,
    propertyChanged: boolean
): Record<string, any> {
    const resultFilter = filter || {};
    const editorOptions = property.editorOptions;
    if (propertyChanged) {
        resultFilter[editorOptions.keyProperty] = property.value;
    }
    if (editorOptions.historyId) {
        resultFilter.historyIds = [editorOptions.historyId];
    }
    return resultFilter;
}

export function prepareDescription(
    description: Array<Record<string, any>>
): Array<Record<string, any>> {
    const resultDescription = object.clone(description);
    return resultDescription.map((property) => {
        if (property.type === 'list') {
            const propertyChanged = isPropertyChanged(property);
            property.editorOptions.filter = getFilter(property, property.editorOptions.filter, propertyChanged);
        }
        return property;
    });
}

/**
 * Provider обеспечивающих предзагрузку данных для фильтров на странице
 */
class FilterProvider implements IDataLoadProvider<IFilterLoadDataConfig, IFilterLoaderResult> {
    private _getFilterSource(
        {
            filterSource,
            filter,
            historyId,
            historyItems,
            filterHistoryLoader
        }: IFilterLoadDataConfig): Promise<IFilterItem[]> {
        const filterController = new FilterController({
            filterButtonSource: filterSource,
            filter,
            historyId
        });
        if (historyItems) {
            filterController.setFilterItems(historyItems);
            return Promise.resolve(filterController.getFilterButtonItems());
        } else if (filterHistoryLoader) {
            return filterHistoryLoader(filterSource, historyId).then((loaderResult) => {
                if (loaderResult.filterButtonSource) {
                    return Promise.resolve(loaderResult.filterButtonSource);
                }
            });
        } else if (historyId) {
            return filterController.loadFilterItemsFromHistory().then(() => {
                return filterController.getFilterButtonItems();
            });
        } else {
            Promise.resolve(filterSource);
        }
    }

    load(loadConfig: IFilterLoadDataConfig, loadDataTimeout?: number): Promise<IFilterLoaderResult> {
        const loadPromise = this._getFilterSource(loadConfig).then((filterItems: IFilterItem[]) => {
            const filterLoaderConfig = LoadConfigGetter(loadConfig.id, filterItems);
            return new PropertyGridProvider().load({
                typeDescription: filterLoaderConfig.typeDescription,
                afterLoadCallback: loadConfig.afterLoadCallback,
                id: loadConfig.id
            });
        });
        return wrapTimeout(
            loadPromise,
            loadDataTimeout
        ).catch((error) => error);
    }
}

export default FilterProvider;
