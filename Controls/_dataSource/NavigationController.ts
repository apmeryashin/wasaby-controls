import {RecordSet, List} from 'Types/collection';
import {Logger} from 'UI/Utils';

import * as cClone from 'Core/core-clone';

import INavigationStore from './NavigationController/interface/INavigationStore';
import IParamsCalculator from './NavigationController/interface/IParamsCalculator';
import {default as PageNavigationStore, IPageNavigationState} from './NavigationController/PageNavigationStore';
import PageParamsCalculator from './NavigationController/PageParamsCalculator';
import {default as PositionNavigationStore, IPositionNavigationState} from './NavigationController/PositionNavigationStore';
import PositionParamsCalculator from './NavigationController/PositionParamsCalculator';

import {IQueryParams} from 'Controls/_interface/IQueryParams';
import {TNavigationSource, IBaseSourceConfig, INavigationSourceConfig, TNavigationDirection, TNavigationPagingMode} from 'Controls/interface';
import {IHashMap} from 'Types/declarations';
import {applied, Record as EntityRecord, Model, relation} from 'Types/entity';
import {isEqual} from 'Types/object';
import * as ArrayUtil from 'Controls/Utils/ArraySimpleValuesUtil';

/**
 * Вспомогательный интерфейс для определения типа typeof object.
 * @interface IType
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Additional interface to set typeof types
 * @interface IType
 * @private
 * @author Аверкиев П.А.
 */
type IType<T> = new(...args: unknown[]) => T;
interface INavigationStoresListItem {
    id: TKey;
    store: INavigationStore;
}
interface IAdditionalParamsItem {
    id: TKey;
    addParams: IQueryParams;
}
type TStoreNavigationState = IPositionNavigationState | IPageNavigationState;
/**
 * Фабрика для создания экземпляра контроллера запроса навигации.
 * @remark
 * Поддерживает два варианта - 'page' и 'position'.
 * @class Controls/_source/NavigationControllerFactory
 * @example
 * const cName:INavigationOptionValue<INavigationPageSourceConfig> = {source: 'page'};
 * const controller = NavigationControllerFactory.resolve(cName);
 * @private
 * @author Аверкиев П.А.
 */
/*
 * Navigation query controller instance Factory
 * @remark
 * Supports two variants of navigation query controllers - 'page' and 'position'
 * @class Controls/_source/NavigationControllerFactory
 * @example
 * const cName:INavigationOptionValue<INavigationPageSourceConfig> = {source: 'page'};
 * const controller = NavigationControllerFactory.resolve(cName);
 * @private
 * @author Аверкиев П.А.
 */

class NavigationStoreFactory {
    static factorySource: IHashMap<IType<INavigationStore>> = {
        page: PageNavigationStore,
        position: PositionNavigationStore
    };

    static resolve(type: TNavigationSource, config: INavigationSourceConfig): INavigationStore {
        if (type && type in this.factorySource) {
            return new this.factorySource[type](config);
        }
        Logger.error('NavigationController: Undefined navigation source type "' + type + '"');
        return;
    }
}

export interface INavigationControllerOptions {
    /**
     * @name Controls/_source/NavigationController#navigation
     * @cfg {Types/source:INavigationOptionValue<INavigationSourceConfig>} Опции навигации.
     */
    /*
     * @name Controls/_source/NavigationController#navigation
     * @cfg {Types/source:INavigationOptionValue} Navigation options
     */
    navigationType: TNavigationSource;
    navigationConfig?: INavigationSourceConfig;
    navigationParamsChangedCallback?: Function;
}

type TKey = string | number | null; // TODO общий тип
type NavigationRecord = EntityRecord<{
    id: TKey,
    nav_result: object | number | boolean
}>;

/**
 * Контроллер постраничной навигации.
 * @remark
 * Хранит состояние навигации INavigationOptionValue<INavigationSourceConfig> и вычисляет на его основании параметры для построения запроса Query.
 *
 * @class Controls/dataSource/NavigationController
 *
 *
 * @public
 * @author Аверкиев П.А.
 */
/*
 * Per-page navigation controller
 * @remark
 * Stores the navigation state and calculates on its base params to build Query
 *
 * @class Controls/dataSource/NavigationController
 *
 *
 * @public
 * @author Аверкиев П.А.
 */

export default class NavigationController {

    private _navigationType: TNavigationSource;
    private _navigationConfig: INavigationSourceConfig;
    private _navigationParamsChangedCallback: Function;
    private _navigationStores: List<INavigationStoresListItem> = null;
    private _paramsCalculator: IParamsCalculator = null;

    constructor(cfg: INavigationControllerOptions) {
        this._navigationType = cfg.navigationType;
        this._navigationConfig = cfg.navigationConfig;
        this._navigationParamsChangedCallback = cfg.navigationParamsChangedCallback;

        if (this._navigationType) {
            this._navigationStores = new List();
        } else {
            Logger.error('NavigationController: navigationType option is undefined');
        }
    }

    /**
     * Строит запрос данных на основе переданных параметров filter и sorting.
     * Если в опцию navigation был передан объект INavigationOptionValue<INavigationSourceConfig>, его filter, sorting и настройки пейджинации
     * также одбавляются в запрос.
     * @param userQueryParams {IQueryParams} Настройки фильтрации, сортировки.
     * @param navigationConfig {INavigationSourceConfig} Настройки навигации.
     * @param id {} Идентификатор запрашиваемого узла. По-умолчанию - корневой узел.
     * @param direction {TNavigationDirection} Направление навигации.
     * @param reset {boolean} Определяет, расчитывать ли навигацию от начального состояния.
     */

    getQueryParams(userQueryParams: IQueryParams,
                   id: TKey = null,
                   navigationConfig?: INavigationSourceConfig,
                   direction?: TNavigationDirection,
                   reset: boolean = true): IQueryParams {

        const calculator = this._getCalculator();
        const navigationQueryConfig = navigationConfig || ({} as INavigationSourceConfig);
        const mainQueryParams = NavigationController._getMainQueryParams(userQueryParams);

        // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
        const store = this._getStore(id);
        const addQueryParams = calculator.getQueryParams(
            store,
            navigationQueryConfig,
            direction,
            this._navigationParamsChangedCallback,
            reset
        );
        return NavigationController._mergeParams(mainQueryParams, addQueryParams);
    }

    getQueryParamsForHierarchy(userQueryParams: IQueryParams,
                               navigationConfig?: INavigationSourceConfig,
                               reset: boolean = true,
                               ids: TKey[] = []): IQueryParams[] {
        const calculator = this._getCalculator();
        const navigationQueryConfig = navigationConfig || ({} as INavigationSourceConfig);
        const mainQueryParams = NavigationController._getMainQueryParams(userQueryParams);

        const addQueryParamsArray = [];
        const processStoreItem = (storeItem: INavigationStoresListItem) => {
            const store = storeItem.store;

            if (!ids || !ids.length || ArrayUtil.invertTypeIndexOf(ids, storeItem.id) !== -1) {
                addQueryParamsArray.push({
                    id: storeItem.id,
                    addParams: calculator.getQueryParams(
                        store,
                        navigationQueryConfig,
                        undefined,
                        this._navigationParamsChangedCallback,
                        reset)
                });
            }
        };
        this._navigationStores.each((storeItem) => {
            processStoreItem(storeItem);
        });
        if (ids && ids.length) {
            ids.forEach((id) => {
                if (!this.hasLoaded(id)) {
                    processStoreItem({
                        store: this._getStore(id),
                        id
                    });
                }
            });
        }
        return NavigationController._mergeParamsHierarchical(mainQueryParams, addQueryParamsArray);
    }

    /**
     * Вычисляет следующее состояние контроллера параметров запроса: следующую страницу или позицию.
     * @param list {Types/collection:RecordSet} Объект, содержащий метаданные текущего запроса.
     * @param direction {TNavigationDirection} Направление навигации ('up' или 'down').
     */
    /*
     * Calculates next query params controller state: next page, or position
     * @param list {Types/collection:RecordSet} object containing meta information for current request
     * @param direction {TNavigationDirection} nav direction ('up' or 'down')
     */
    updateQueryProperties(
        list: RecordSet,
        id: TKey = null,
        navigationConfig?: IBaseSourceConfig,
        direction?: TNavigationDirection,
        hierarchyRelation?: relation.Hierarchy,
        resetNavigation: boolean = true
    ): TStoreNavigationState[] {

        const updateResult: TStoreNavigationState[] = [];
        const metaMore = list.getMetaData().more;
        const calculator = this._getCalculator();

        if (metaMore instanceof RecordSet) {
            const storesIds = [];
            metaMore.each((nav: NavigationRecord) => {
                const metaMoreItem = nav.get('nav_result');
                let storeId = nav.get('id');
                const storeIdInvertType = typeof storeId === 'string' ? Number(storeId) : String(storeId);

                // Фикс, пока Витя Абрамов не починит изменения типа идентификатора в множестенной навигации
                // https://online.sbis.ru/opendoc.html?guid=9f0b2454-3234-43f2-8a69-811d19cd8443
                if (storeId !== null && (list.getRecordById(storeIdInvertType) || storeIdInvertType === id)) {
                    storeId = storeIdInvertType;
                }

                updateResult.push(
                    calculator.updateQueryProperties(
                        this._getStore(storeId),
                        list,
                        metaMoreItem,
                        navigationConfig,
                        direction,
                        hierarchyRelation?.getChildren(storeId, list) as Model[],
                        calculator.getAdditionalMeta(list, storeId as string)
                    ) as TStoreNavigationState
                );
                storesIds.push(storeId);
            });
            if (resetNavigation) {
                this._deleteUnprocessedStores(storesIds);
            }
        } else {
            // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
            const store = this._getStore(id);
            updateResult.push(
                calculator.updateQueryProperties(
                    store,
                    list,
                    metaMore,
                    navigationConfig,
                    direction
                ) as TStoreNavigationState
            );
        }
        return updateResult;
    }

    updateQueryRange(list: RecordSet, id: TKey = null, firstItem?: Model | void, lastItem?: Model | void): void {
        const calculator = this._getCalculator();
        const store = this._getStore(id);
        calculator.updateQueryRange(store, list, firstItem, lastItem);
    }

    shiftToEdge(
        direction: TNavigationDirection,
        id: TKey = null,
        shiftMode?: TNavigationPagingMode
    ): IBaseSourceConfig {
        const calculator = this._getCalculator();
        const store = this._getStore(id);
        return calculator.shiftToEdge(store, direction, shiftMode, this._navigationConfig);
    }
    // Если id не передан то берется стор для корневого раздела, для которого жесткий id = null
    hasMoreData(direction?: TNavigationDirection, id: TKey = null): boolean {
        let hasMoreResult = false;

        if (this.hasLoaded(id)) {
            const store = this._getStore(id);
            const calculator = this._getCalculator();
            hasMoreResult = calculator.hasMoreData(store, direction);
        }

        return hasMoreResult;
    }

    hasLoaded(id: TKey): boolean {
        return this._navigationStores.getIndexByValue('id', id) !== -1;
    }

    updateOptions(newOptions: INavigationControllerOptions): void {
        if ((newOptions.navigationType !== this._navigationType) ||
            !isEqual(newOptions.navigationConfig, this._navigationConfig)) {
            // при передаче новых опций все сбрасываем
            this._navigationStores.each((navigationStore) => {
                navigationStore.store.destroy();
            });
            this._navigationStores = new List();
            this._paramsCalculator?.destroy();
            this._paramsCalculator = null;
            this._navigationType = newOptions.navigationType;
            this._navigationConfig = newOptions.navigationConfig;
        }

        this._navigationParamsChangedCallback = newOptions.navigationParamsChangedCallback;
    }

    private _deleteUnprocessedStores(processedStores: TKey[]): void {
        const storesToDelete = [];
        this._navigationStores.forEach(({id}) => {
            if (ArrayUtil.invertTypeIndexOf(processedStores, id) === -1) {
                storesToDelete.push(id);
            }
        });
        storesToDelete.forEach((id) => {
            this._navigationStores.removeAt(this._navigationStores.getIndexByValue('id', id));
        });
    }

    private _getStore(id: TKey): INavigationStore {
        const storeIndex = this._navigationStores.getIndexByValue('id', id);
        let resStoreItem: INavigationStoresListItem = this._navigationStores.at(storeIndex);

        if (!resStoreItem) {
            resStoreItem = {
                id,
                store: NavigationStoreFactory.resolve(this._navigationType, this._navigationConfig)
            };
            this._navigationStores.add(resStoreItem);
        }
        return resStoreItem.store;
    }

    private _getCalculator(): IParamsCalculator {
        if (!this._paramsCalculator) {
            let resCalculator;
            switch (this._navigationType) {
                case 'page':
                    resCalculator = PageParamsCalculator;
                    break;
                case 'position':
                    resCalculator = PositionParamsCalculator;
                    break;
            }
            this._paramsCalculator = new resCalculator();
        }
        return this._paramsCalculator;
    }

    /**
     * разрушает NavigationController
     */
    /*
     * destroy current NavigationController
     */
    destroy(): void {
        this._navigationStores.each((navigationStore) => {
            navigationStore.store.destroy();
        });
        this._navigationStores = null;
        this._paramsCalculator?.destroy();
        this._paramsCalculator = null;
        this._navigationType = null;
        this._navigationConfig = null;
    }

    private static _mergeParams(main: IQueryParams, additional: IQueryParams): IQueryParams {
        const resultParams = main;

        resultParams.limit = additional.limit;
        resultParams.offset = additional.offset;

        if (additional.filter) {
            // we can't modify original filter
            resultParams.filter = cClone(resultParams.filter);
            const navFilter = additional.filter;
            for (const i in navFilter) {
                if (navFilter.hasOwnProperty(i)) {
                    resultParams.filter[i] = navFilter[i];
                }
            }
        }

        if (additional.meta) {
            resultParams.meta = additional.meta;
        }

        return resultParams;
    }

    private static _mergeParamsHierarchical(main: IQueryParams,
                                            additional: IAdditionalParamsItem[]): IQueryParams[] {

        const resultParamsArray = [] as IQueryParams[];
        additional.forEach((addItem) => {
            const resultParams = NavigationController._mergeParams({...main}, addItem.addParams);

            // we can't modify original filter
            resultParams.filter = cClone(resultParams.filter);

            // Добавляем в фильтр раздел и помечаем это поле, как первичный ключ
            // Оно используется для формирования множественной навигации,
            // Само поле будет удалено из фильтра перед запросом.
            (resultParams.filter as Record<string, unknown>).__root = new applied.PrimaryKey(addItem.id);

            resultParamsArray.push(resultParams);
        });

        return resultParamsArray;
    }

    private static _getMainQueryParams(userQueryParams: IQueryParams): IQueryParams {
        return {
            filter: userQueryParams.filter || {},
            sorting: userQueryParams.sorting,
            select: userQueryParams.select,
            limit: undefined,
            offset: undefined
        };
    }
}
