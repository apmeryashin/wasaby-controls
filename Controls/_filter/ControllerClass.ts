import {IPrefetchHistoryParams} from './IPrefetch';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';

import Store from 'Controls/Store';
import Prefetch from 'Controls/_filter/Prefetch';
import isEqualItems from 'Controls/_filter/Utils/isEqualItems';
import {updateFilterDescription} from 'Controls/_filter/Utils/CallbackUtils';
import mergeSource from 'Controls/_filter/Utils/mergeSource';
import {getHistorySource} from 'Controls/_filter/HistoryUtils';
import {_assignServiceFilters} from '../_search/Utils/FilterUtils';
import {selectionToRecord} from 'Controls/operations';
import {TKeysSelection, TFilter} from 'Controls/interface';

import * as clone from 'Core/core-clone';
import {CrudWrapper} from 'Controls/dataSource';
import {object, mixin} from 'Types/util';
import {isEqual} from 'Types/object';
import {Model, ObservableMixin, SerializableMixin, OptionsToPropertyMixin} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import * as Deferred from 'Core/Deferred';
import {ICrud, PrefetchProxy, Rpc} from 'Types/source';
import getFilterByFilterDescription from 'Controls/_filter/filterCalculator';
import isFilterItemChanged from 'Controls/_filter/Utils/isFilterItemChanged';

import {updateUrlByFilter, getFilterFromUrl} from 'Controls/_filter/Utils/Url';

export interface IFilterHistoryData {
    items: IFilterItem[];
    prefetchParams?: IPrefetchHistoryParams;
}

type THistoryData = IFilterHistoryData | IFilterItem[];

export interface IFilterControllerOptions {
    prefetchParams?: IPrefetchHistoryParams;
    filter?: TFilter;
    useStore?: boolean;
    filterButtonSource: IFilterItem[];
    fastFilterSource?: IFilterItem[];
    historyItems?: IFilterItem[];
    historyId?: string;
    searchValue?: string;
    searchParam?: string;
    minSearchLength?: number;
    parentProperty?: string;
    selectedKeys?: TKeysSelection;
    excludedKeys?: TKeysSelection;
    source?: ICrud;
    selectionViewMode?: string;
    historySaveCallback?: (historyData: Record<string, unknown>, filterButtonItems: IFilterItem[]) => void;
}

export interface ICalculateFilterParams {
    historyId: string;
    historyItems?: IFilterItem[];
    prefetchParams?: IPrefetchHistoryParams;
    filter: TFilter;
    filterButtonSource: IFilterItem[];
}
export interface ICalculatedFilter {
    filter: TFilter;
    historyItems: IFilterItem[];
    filterButtonItems: IFilterItem[];
}

const getPropValue = object.getPropertyValue;
const setPropValue = object.setPropertyValue;

const ACTIVE_HISTORY_FILTER_INDEX = 0;
const SELECTION_PATH_FILTER_FIELD = 'SelectionWithPath';
const MIN_SEARCH_LENGTH = 3;

export default class FilterControllerClass extends mixin<
    ObservableMixin,
    SerializableMixin,
    OptionsToPropertyMixin
    >(
    ObservableMixin,
    SerializableMixin,
    OptionsToPropertyMixin
) {
    private _crudWrapper: CrudWrapper;
    private _$filterButtonItems: IFilterItem[] = null;
    private _$fastFilterItems: IFilterItem[] = null;
    private _$filter: TFilter = {};

    /* Флаг необходим, т.к. добавлять запись в историю после изменения фильтра
   необходимо только после загрузки данных, т.к. только в ответе списочного метода
   можно получить идентификатор закэшированных данных для этого фильтра */
    private _isFilterChanged: boolean = false;

    constructor(options: Partial<IFilterControllerOptions>) {
        super(options);
        SerializableMixin.call(this);
        ObservableMixin.call(this, options);
        OptionsToPropertyMixin.call(this, options);
        this._options = options;
        this._$filter = options.filter || {};

        if (options.prefetchParams) {
            this._$filter = Prefetch.prepareFilter(this._$filter, options.prefetchParams);
        }
        this._$fastFilterItems = this._$fastFilterItems || options.fastFilterSource;
        this._updateFilter(options);
    }

    setFilterItems(historyItems: THistoryData): void {
        const filterFromUrl = getFilterFromUrl();
        // TODO: storefix207100
        if (this._options.useStore && !this._options.filterButtonSource) {
            const state = Store.getState();
            this._setFilterItems(
                state.filterSource,
                (!state.filterSource && this._options.fastFilterSource) || [],
                historyItems,
                filterFromUrl
            );
        } else {
            this._setFilterItems(
                this._options.filterButtonSource,
                this._options.fastFilterSource,
                historyItems,
                filterFromUrl
            );
        }
        this._applyItemsToFilter(Prefetch.applyPrefetchFromHistory(this._$filter, historyItems),
            this._$filterButtonItems, this._$fastFilterItems);

        if (this._options.prefetchParams && (historyItems instanceof Array) && historyItems.length) {
            this._isFilterChanged = true;
        }
    }

    loadFilterItemsFromHistory(): Promise<THistoryData> {
        // TODO: storefix207100
        if (this._options.useStore && !this._options.filterButtonSource) {
            const state = Store.getState();
            const loadedSources = state && state.loadedSources && state.loadedSources[0];
            if (loadedSources) {
                return this._resolveItemsWithHistory(loadedSources, loadedSources.filter);
            } else {
                return this._resolveItemsWithHistory({
                    historyId: state.historyId || this._options.historyId,
                    filterButtonSource: state.filterSource || this._options.filterButtonSource,
                    historyItems: this._options.historyItems
                }, state.filter || this._options.filter);
            }
        } else {
            return this._resolveItemsWithHistory(this._options, this._$filter);
        }
    }

    update(newOptions: IFilterControllerOptions): void | boolean {
        let filterButtonChanged;
        let fastFilterChanged;
        let filterChanged;
        let selectionViewModeChanged;

        filterButtonChanged = this._options.filterButtonSource !== newOptions.filterButtonSource;
        fastFilterChanged = this._options.fastFilterSource !== newOptions.fastFilterSource;
        filterChanged = !isEqual(this._options.filter, newOptions.filter);
        selectionViewModeChanged = this._options.selectionViewMode !== newOptions.selectionViewMode;

        if (filterButtonChanged || fastFilterChanged) {
            this._setFilterItems(
                filterButtonChanged ? newOptions.filterButtonSource : this._$filterButtonItems,
                fastFilterChanged ? newOptions.fastFilterSource : this._$fastFilterItems);

            this._applyItemsToFilter(this._$filter, this._$filterButtonItems, this._$fastFilterItems);
        }

        if (filterChanged) {
            this._applyItemsToFilter(
                Prefetch.prepareFilter(newOptions.filter, newOptions.prefetchParams),
                this._$filterButtonItems,
                this._$fastFilterItems
            );
            if (newOptions.prefetchParams) {
                this._isFilterChanged = true;
            }
        }

        if (filterButtonChanged && newOptions.prefetchParams) {
            this._$filter = Prefetch.clearPrefetchSession(this._$filter);
        }

        if (newOptions.historyId !== this._options.historyId) {
            this._crudWrapper = null;
        }

        this._options = newOptions;
        if (filterChanged || selectionViewModeChanged) {
            this._updateFilter(this._options);
        }
        return filterChanged || filterButtonChanged || fastFilterChanged || selectionViewModeChanged;
    }

    resetPrefetch(): void {
        const filter = clone(this._$filter);
        this._isFilterChanged = true;
        this._setFilter(Prefetch.clearPrefetchSession(filter));
    }

    updateHistory(history: THistoryData): void {
        if (this._options.prefetchParams) {
            this._processHistoryOnItemsChanged(history.items || history, this._options);
        }
    }

    updateFilterItems(items: IFilterItem[]): void {
        const currentFilterButtonItems = this._$filterButtonItems;
        const currentFastFilterItems = this._$fastFilterItems;
        const currentFilter = this._$filter;

        this._updateFilterItems(items);
        this._applyItemsToFilter(this._$filter, items);
        this._addToUrl(this._$filterButtonItems);
        if (this._options.historyId) {
            if (this._options.prefetchParams) {
                if (!this._isFilterChanged) {
                    this._deleteCurrentFilterFromHistory();
                    Prefetch.clearPrefetchSession(this._$filter);
                }
                this._isFilterChanged = true;
            } else  if (this._options.historyId) {
                this._addToHistory(this._$filterButtonItems, this._$fastFilterItems, this._options.historyId);
            }
        }

        if (
            !isEqual(currentFilterButtonItems, this._$filterButtonItems) ||
            !isEqual(currentFastFilterItems, this._$fastFilterItems)
        ) {
            updateFilterDescription(items, currentFilter, this._$filter,
                                    this._updateFilterButtonItems.bind(this));
        }
    }

    setFilter(filter: object): void {
        this._setFilter(Prefetch.prepareFilter(filter, this._options.prefetchParams));
    }

    handleDataLoad(items: RecordSet): void {
        if (this._options.historyId) {
            if (this._isFilterChanged) {
                if (getHistorySource({
                    historyId: this._options.historyId,
                    favorite: !!this._options.prefetchParams
                }).historyReady()) {
                    this._deleteCurrentFilterFromHistory();
                }
                this._addToHistory(
                    this._$filterButtonItems,
                    this._$fastFilterItems,
                    this._options.historyId,
                    Prefetch.getPrefetchParamsForSave(items));
            }

            // Намеренное допущение, что меняем объект по ссылке.
            // Сейчас по-другому не сделать, т.к. контроллер фильтрации находится над
            // контейнером и списком, которые владеют данными.
            // А изменение фильтра вызывает повторный запрос за данными.
            Prefetch.applyPrefetchFromItems(this._$filter, items);
        }

        this._isFilterChanged = false;
    }

    handleDataError(): void {
        if (this._options.historyId && this._isFilterChanged) {
            const currentAppliedHistoryItems =
                this._getHistoryByItems(this._options.historyId, this._$filterButtonItems);

            if (currentAppliedHistoryItems) {
                Object.assign(
                    this._$filter,
                    Prefetch.applyPrefetchFromHistory(this._$filter, currentAppliedHistoryItems.data)
                );
            }
        }
    }

    getFilter(): TFilter {
        return this._$filter;
    }

    getFilterButtonItems(): IFilterItem[] {
        return this._$filterButtonItems;
    }

    getFastFilterItems(): IFilterItem[] {
        return  this._$fastFilterItems;
    }

    getCalculatedFilter(config) {
        return getCalculatedFilter.call(this, config);
    }

    saveFilterToHistory(config) {
        return saveFilterToHistory.call(this, config);
    }

    private _updateFilterButtonItems(newFilterButtonItems: IFilterItem[]): void {
        this._updateFilterItems(newFilterButtonItems);
        this._notify('filterSourceChanged', this._$filterButtonItems);
    }

    private _updateFilterItems(newItems: IFilterItem[]): void {
        if (this._$filterButtonItems) {
            this._$filterButtonItems = FilterControllerClass._cloneItems(this._$filterButtonItems);
            mergeSource(this._$filterButtonItems, newItems);
        }

        if (this._$fastFilterItems) {
            this._$fastFilterItems = FilterControllerClass._cloneItems(this._$fastFilterItems);
            mergeSource(this._$fastFilterItems, newItems);
        }

        this._setIsFastProperty(this._$filterButtonItems, this._$fastFilterItems);
    }

    private _updateFilter(options: Partial<IFilterControllerOptions>): void {
        if (options.searchParam && options.searchValue) {
            this._prepareSearchFilter(this._$filter, options);
        }
        if (options.selectedKeys && options.selectedKeys.length) {
            this._prepareOperationsFilter(this._$filter, options);
        }
    }

    private _resolveItemsWithHistory(options: Partial<IFilterControllerOptions>,
                                     filter: object): Promise<THistoryData> {
        return this._resolveHistoryItems(options).then((history) => {
            const filterFromUrl = getFilterFromUrl();
            this._setFilterItems(options.filterButtonSource, options.fastFilterSource, history, filterFromUrl);
            this._applyItemsToFilter(
                Prefetch.applyPrefetchFromHistory(filter, history),
                this._$filterButtonItems,
                this._$fastFilterItems);
            if (options.historyItems && options.historyItems.length && options.historyId && options.prefetchParams) {
                this._processHistoryOnItemsChanged(options.historyItems, options as IFilterControllerOptions);
            }
            return history;
        });
    }

    // Получает итемы с учетом истории.
    private _resolveHistoryItems({
                                     historyId,
                                     historyItems,
                                     prefetchParams,
                                     filterButtonSource
    }: {
        historyId: string,
        historyItems: IFilterItem[],
        prefetchParams: IPrefetchHistoryParams,
        filterButtonSource: IFilterItem[]
    }): Promise<THistoryData> {
        if (historyItems && prefetchParams && historyItems?.length) {
            return this._loadHistoryItems(historyId, filterButtonSource, prefetchParams).then((result) => {
                return historyItems ? historyItems : result;
            });
        } else {
            return historyItems ? Promise.resolve(historyItems) :
                this._loadHistoryItems(historyId, filterButtonSource, prefetchParams);
        }
    }

    private _loadHistoryItems(historyId: string,
                              filterSource: IFilterItem[],
                              prefetchParams?: IPrefetchHistoryParams): Promise<THistoryData> {
        let result;

        if (!historyId) {
            result = Promise.resolve([]);
        } else {
            const historyIds = [];
            const filterButtonItems = FilterControllerClass._getFilterButtonItems(filterSource);
            if (filterButtonItems) {
                filterButtonItems.forEach((filterItem) => {
                    if (filterItem.historyId) {
                        historyIds.push(filterItem.historyId);
                    }
                });
            }
            const source = getHistorySource({historyId, favorite: !!prefetchParams, historyIds});

            if (!this._crudWrapper) {
                this._crudWrapper = new CrudWrapper({
                    source
                });
            }

            result = this._loadHistorySource(source);
        }

        return result;
    }

    private _loadHistorySource(source): Promise<THistoryData> {
        return new Promise((resolve) => {
            this._crudWrapper.query({filter: { $_history: true }})
                .then((res) => {
                    let historyResult;
                    const recent = source.getRecent();

                    if (recent.getCount()) {
                        const lastFilter = recent.at(ACTIVE_HISTORY_FILTER_INDEX);
                        historyResult = source.getDataObject(lastFilter) || [];
                    } else {
                        historyResult = [];
                    }
                    historyResult = this._mergeHistoryParams(historyResult, source);
                    resolve(historyResult);
                    return res;
                })
                .catch((error) => {
                    error.processed = true;
                    resolve([]);
                    return error;
                });
        });
    }

    private _mergeHistoryParams(filterSource: IFilterItem[], source): IFilterItem[] {
        const paramsHistoryIds = source.getParams();
        const history = filterSource.items ? filterSource.items : filterSource;
        for (const historyId in paramsHistoryIds) {
            if (paramsHistoryIds.hasOwnProperty(historyId)) {
                history.push(source.getDataObject(paramsHistoryIds[historyId]));
            }
        }
        return filterSource;
    }

    private _deleteCurrentFilterFromHistory(): void {
        const history = this._getHistoryByItems(this._options.historyId, this._$filterButtonItems);

        if (history) {
            FilterControllerClass._deleteFromHistory(history.item, this._options.historyId);
        }
    }

    private _getHistoryByItems(historyId: string, items: IFilterItem[]): IFilterItem | null {
        let result;
        this._updateMeta = null;

        result = this._findItemInHistory(historyId, items);

        // Метод используется для поиска элемента для удаления и последующего
        // сохранения нового элемента с новыми данными
        // Если элемент запинен или добавлен в избранное, его нельзя удалять.
        if (result) {
            const isPinned = result.item.get('pinned');
            const isFavorite = result.item.get('client');
            if (isFavorite || isPinned) {
                this._updateMeta = {
                    item: result.item,
                    isClient: result.data.isClient
                };
                if (isPinned) {
                    this._updateMeta.$_pinned = true;
                } else {
                    this._updateMeta.$_favorite = true;
                }
                result = null;
            }
        }
        return result;
    }

    private _findItemInHistory(historyId: string, items: IFilterItem[]): void {
        let result;
        let historyData;
        let minimizedItemFromHistory;
        let minimizedItemFromOption;

        const historySource = getHistorySource({historyId});
        /* На сервере historySource не кэшируется и история никогда не будет проинициализирована
           Нужно переводить кэширование на сторы Санникова
           https://online.sbis.ru/opendoc.html?guid=4ca5d3b8-65a7-4d98-8ca4-92ed1fbcc0fc
         */
        if (!historySource.historyReady()) {
            return;
        }
        const historyItems = historySource.getItems();
        if (historyItems && historyItems.getCount()) {
            historyItems.each((item, index) => {
                if (!result) {
                    historyData = historySource.getDataObject(item);

                    if (historyData) {
                        const itemsToSave = items.filter((itemToSave) => !itemToSave.doNotSaveToHistory);
                        minimizedItemFromOption = this._minimizeFilterItems(itemsToSave);
                        minimizedItemFromHistory = this._minimizeFilterItems(historyData.items || historyData);
                        if (isEqual(minimizedItemFromOption, minimizedItemFromHistory)) {
                            result = {
                                item,
                                data: historyData,
                                index
                            };
                        }
                    }
                }
            });
        }

        return result;
    }

    private _minimizeFilterItems(items: IFilterItem[]): IFilterItem[] {
        const minItems = [];
        items.forEach((item) => {
            minItems.push(FilterControllerClass._minimizeItem(item));
        });
        return minItems;
    }

    private _addToHistory(filterButtonItems: IFilterItem[],
                          fastFilterItems: IFilterItem[],
                          historyId: string,
                          prefetchParams?: IPrefetchHistoryParams): Promise<any> {
        const meta = this._updateMeta || { $_addFromData: true };

        const update = () => {
            let historyData;
            if (this._updateMeta) {
                historyData = this._updateMeta.item;
                if (historyData && prefetchParams) {
                    const historyItems = JSON.parse(historyData.get('ObjectData'));
                    const currentSessionId = historyItems.prefetchParams.PrefetchSessionId;
                    const newSessionId = prefetchParams?.PrefetchSessionId;
                    if (newSessionId && currentSessionId !== newSessionId) {
                        historyItems.prefetchParams.PrefetchSessionId = newSessionId;
                        historyData.set('ObjectData', JSON.stringify(historyItems));
                    }
                }
            } else {
                historyData = this._getHistoryData(filterButtonItems, fastFilterItems, prefetchParams);
                if (this._options.historySaveCallback instanceof Function) {
                    this._options.historySaveCallback(historyData, filterButtonItems);
                }
            }

            return getHistorySource({historyId}).update(historyData, meta);
        };

        if (!getHistorySource({historyId}).historyReady()) {
            // Getting history before updating if it hasn’t already done
            return this._loadHistoryItems(historyId, filterButtonItems).then(() => {
                return update();
            });
        } else {
            return update();
        }
    }

    private _addToUrl(filterButtonItems: IFilterItem[]): void {
        if (!filterButtonItems) {
            return;
        }

        const items: IFilterItem[] = filterButtonItems.filter((item) => {
            return item.saveToUrl || (this._options.saveToUrl && !item.hasOwnProperty('saveToUrl'));
        });

        if (items.length) {
            updateUrlByFilter(items);
        }
    }

    private _getHistoryData(filterButtonItems: IFilterItem[],
                            fastFilterItems: IFilterItem[],
                            prefetchParams?: IPrefetchHistoryParams): THistoryData {
        let result = {} as IFilterHistoryData;

        /* An empty filter should not appear in the history,
           but should be applied when loading data from the history.
           To understand this, save an empty object in history. */
        if (this._isFilterItemsChanged(filterButtonItems, fastFilterItems)) {
            result = Prefetch.addPrefetchToHistory(result, prefetchParams);
            result.items = this._prepareHistoryItems(filterButtonItems, fastFilterItems);

        }
        return result;
    }

    private _prepareHistoryItems(filterButtonItems: IFilterItem[],
                                 fastFilterItems: IFilterItem[]): IFilterItem[] {
        let historyItems = FilterControllerClass._cloneItems(filterButtonItems);
        this._setTextValueProperty(filterButtonItems, fastFilterItems, historyItems);

        historyItems = historyItems.filter((item) => {
            return !item.doNotSaveToHistory;
        });

        return this._minimizeFilterItems(historyItems);
    }

    private _processHistoryOnItemsChanged(items: IFilterItem[], options: IFilterControllerOptions): void {
        this._processPrefetchOnItemsChanged(options, items);
        this._isFilterChanged = true;
    }

    private _processPrefetchOnItemsChanged(options: IFilterControllerOptions,
                                           items: IFilterItem[]): void {
        // Меняют фильтр с помощью кнопки фильтров,
        // но такой фильтр уже может быть сохранён в истории и по нему могут быть закэшированные данные,
        // поэтому ищем в истории такой фильтр, если есть, смотрим валидны ли ещё закэшированные данные,
        // если валидны, то просто добавляем идентификатор сессии в фильтр,
        // если данные не валидны, то такую запись из истории надо удалить
        const history = this._getHistoryByItems(options.historyId, items || this._$filterButtonItems);
        let filter = this._$filter;
        let needDeleteFromHistory = false;
        let needApplyPrefetch = false;

        if (history) {
            const prefetchParams = Prefetch.getPrefetchFromHistory(history.data);
            const needInvalidate = prefetchParams && Prefetch.needInvalidatePrefetch(history.data);

            if (needInvalidate) {
                needDeleteFromHistory = true;
            }

            if (prefetchParams && !needInvalidate) {
                needApplyPrefetch = true;
            }
        }

        if (needApplyPrefetch) {
            filter = Prefetch.applyPrefetchFromHistory(this._$filter, history.data);

            if (!isEqual(filter, this._$filter)) {
                needDeleteFromHistory = true;
            }
        } else {
            filter = Prefetch.clearPrefetchSession(this._$filter);
        }

        if (needDeleteFromHistory) {
            FilterControllerClass._deleteFromHistory(history.item, options.historyId);
        }

        this._setFilter(filter);
    }

    // мержит историю в итемы кнопки и итемы быстрых фильтров.
    private _setFilterItems(filterButtonOption: IFilterItem[],
                            fastFilterOption: IFilterItem[],
                            history?: THistoryData,
                            filterFromUrl?: IFilterItem[]): void {
        let historyItems;

        if (history) {
            historyItems = history.items || (Array.isArray(history) ? history : []);
        }

        this._$filterButtonItems = FilterControllerClass._getItemsByOption(
            filterButtonOption,
            historyItems,
            filterFromUrl
        );
        this._$fastFilterItems = FilterControllerClass._getItemsByOption(fastFilterOption, historyItems);
        this._setIsFastProperty(this._$filterButtonItems, this._$fastFilterItems);
    }

    private _isFilterItemsChanged(filterButtonItems: IFilterItem[], fastFilterItems: IFilterItem[]): boolean {
        let isChanged = false;
        (filterButtonItems || fastFilterItems).forEach((filterItem) => {
            if (!isChanged) {
                isChanged = isFilterItemChanged(filterItem);
            }
        });
        return isChanged;
    }

    // Для итемов быстрого фильтра в кнопке пишет поле isFast = true.
    // Для того, чтобы текст быстрых фильтров не устанавливался и не сбрасывался в кнопке,
    // FIXME удалить после перевода всех на filter:View
    private _setIsFastProperty(filterButtonItems: IFilterItem[], fastFilterItems: IFilterItem[]): void {
        if (filterButtonItems && fastFilterItems) {
            const prepareFastFilterItem = (index) => {
                // Fast filters could not be reset from the filter button.
                // We set flag for filters duplicated in the fast filter.
                filterButtonItems[index].isFast = true;
            };
            FilterControllerClass._equalItemsIterator(filterButtonItems, fastFilterItems, prepareFastFilterItem);
        }
    }

    // FIXME удалить после перевода всех на filter:View
    private _setTextValueProperty(filterButtonItems: IFilterItem[],
                                  fastFilterItems: IFilterItem[],
                                  historyItems: IFilterItem[]): void {
        const setTextValue = (index, item) => {
            setPropValue(historyItems[index], 'textValue', getPropValue(item, 'textValue'));
        };

        if (filterButtonItems && fastFilterItems) {
            FilterControllerClass._equalItemsIterator(filterButtonItems, fastFilterItems, setTextValue);
        }
    }

    private _applyItemsToFilter(filter: object,
                                filterButtonItems: IFilterItem[],
                                fastFilterItems?: IFilterItem[]): void {
        this._setFilter(getFilterByFilterDescription(filter, filterButtonItems || fastFilterItems));
    }

    private _prepareSearchFilter(filter: object,
                                 {
                                     searchValue,
                                     searchParam,
                                     minSearchLength = MIN_SEARCH_LENGTH,
                                     parentProperty
                                 }: Partial<IFilterControllerOptions>): void {
        const preparedFilter = {...filter} || {};
        if (searchValue && searchParam &&
            searchValue.length >= minSearchLength) {
            preparedFilter[searchParam] = searchValue;
            _assignServiceFilters({}, preparedFilter, parentProperty);
        }
        this._setFilter(preparedFilter);
    }

    private _prepareOperationsFilter(filter: object,
                                     {
                                         selectedKeys= [],
                                         excludedKeys= [],
                                         source,
                                         selectionViewMode
                                     }: Partial<IFilterControllerOptions>): object {
        const preparedFilter = {...filter} || {};

        if (selectionViewMode === 'selected') {
            const listSource = (source as PrefetchProxy).getOriginal ? (source as PrefetchProxy).getOriginal() : source;
            preparedFilter[SELECTION_PATH_FILTER_FIELD] = selectionToRecord({
                selected: selectedKeys || [],
                excluded: excludedKeys || []
            }, (listSource as Rpc).getAdapter(), 'all', false);
        } else {
            delete preparedFilter[SELECTION_PATH_FILTER_FIELD];
        }

        this._setFilter(preparedFilter);
        return preparedFilter;
    }

    private _setFilter(filter: object): void {
        this._$filter = filter;
        this._notify('filterChanged', this._$filter);
    }

    private static _getFilterButtonItems(filterSource: IFilterItem[]): IFilterItem[] {
        return FilterControllerClass._getItemsByOption(
            filterSource,
            [],
            getFilterFromUrl()
        );
    }

    private static _minimizeItem(item: IFilterItem): IFilterItem {
        const textValue = getPropValue(item, 'textValue');
        // Two case of saving filter in history
        // 1 case - need to hide textValue in line near button, but save value in history
        // 2 case - need to hide textValue in line near button and not save value in history
        // if textValue is empty string (''), save filter in history
        // if textValue is null, do not save
        const isNeedSaveHistory = textValue !== undefined && textValue !== null;
        const visibility = !isNeedSaveHistory && getPropValue(item, 'visibility') ? false : getPropValue(item, 'visibility');
        const minimizedItem = {} as IFilterItem;
        const value = getPropValue(item, 'value');
        const isNeedSaveValue = getPropValue(item, 'resetValue') !== undefined ?
            value !== undefined && isNeedSaveHistory :
            true;

        if (visibility !== undefined) {
            minimizedItem.visibility = visibility;
        }

        if (isNeedSaveValue) {
            minimizedItem.value = getPropValue(item, 'value');
        }

        if (visibility !== false && textValue !== getPropValue(item, 'resetTextValue')) {
            if (isEqual(value, getPropValue(item, 'resetValue'))) {
                minimizedItem.textValue = '';
            } else {
                minimizedItem.textValue = getPropValue(item, 'textValue');
            }
        }

        if (getPropValue(item, 'id')) {
            minimizedItem.id = getPropValue(item, 'id');
        } else {
            minimizedItem.name = getPropValue(item, 'name');
            minimizedItem.viewMode = getPropValue(item, 'viewMode');
        }

        if (getPropValue(item, 'historyId')) {
            minimizedItem.historyId = getPropValue(item, 'historyId');
        }
        return minimizedItem;
    }

    private static _deleteFromHistory(item: Model, historyId: string): void {
        getHistorySource({historyId}).destroy(item.getKey(), {$_history: true});
    }

    // Возвращает итемы смерженнные с историей.
    private static _getItemsByOption(option: IFilterItem[] | Function,
                                     history?: IFilterItem[],
                                     filterFromUrl?: IFilterItem[]): IFilterItem[] {
        let result;

        if (option) {
            if (typeof option === 'function') {
                result = option(history);
            } else if (filterFromUrl) {
                result = mergeSource(FilterControllerClass._cloneItems(option), filterFromUrl);
            } else if (history) {
                result = mergeSource(FilterControllerClass._cloneItems(option), history);
            } else {
                result = FilterControllerClass._cloneItems(option);
            }
        }

        return result;
    }

    private static _equalItemsIterator(filterButtonItems: IFilterItem[],
                                       fastFilterItems: IFilterItem[],
                                       prepareCallback: Function): void {
        filterButtonItems.forEach((buttonItem, index) => {
            fastFilterItems.forEach((fastItem) => {
                if (isEqualItems(buttonItem, fastItem)
                    && fastItem.hasOwnProperty('textValue') && buttonItem.hasOwnProperty('textValue')) {
                    prepareCallback(index, fastItem);
                }
            });
        });
    }

    private static _cloneItems(items: IFilterItem[]|RecordSet<IFilterItem>): IFilterItem[] {
        let resultItems;

        if (items['[Types/_entity/CloneableMixin]']) {
            resultItems = (items as RecordSet<IFilterItem>).clone();
        } else {
            resultItems = [];
            items.forEach((item) => {
                resultItems.push({...item});
            });
        }
        return resultItems;
    }

    // Методы добавлены для совместимости, чтобы не сломался код у прикладных программистов,
    // которые используют статический метод getCalculatedFilter у Controls/filter:Controller
    // будет исправлено по задаче https://online.sbis.ru/opendoc.html?guid=8bd01598-d6cd-4581-ae3a-2a6915b34b79
    static getCalculatedFilter(cfg: object): Promise<any> {
        return new FilterControllerClass({}).getCalculatedFilter(cfg);
    }

    static updateFilterHistory(cfg: object): Promise<any> {
        return new FilterControllerClass({}).saveFilterToHistory(cfg);
    }
}

function getCalculatedFilter(config) {
    const def = new Deferred();
    this._resolveHistoryItems(config).then((items) => {
        const filterFromUrl = getFilterFromUrl();
        this._setFilterItems(clone(config.filterButtonSource), clone(config.fastFilterSource), items, filterFromUrl);
        let calculatedFilter;
        try {
            calculatedFilter = getFilterByFilterDescription(
                config.filter,
                this._$filterButtonItems || this._$fastFilterItems);

            if (config.prefetchParams && config.historyId) {
                const history = this._findItemInHistory(config.historyId, this._$filterButtonItems);

                if (history) {
                    calculatedFilter = Prefetch.applyPrefetchFromHistory(calculatedFilter, history.data);
                }
                calculatedFilter = Prefetch.prepareFilter(calculatedFilter, config.prefetchParams);
            }
        } catch (err) {
            def.errback(err);
            throw err;
        }
        def.callback({
            filter: calculatedFilter,
            historyItems: items,
            filterButtonItems: this._$filterButtonItems,
            fastFilterItems: this._$fastFilterItems
        });
        return items;
    }).addErrback((err) => {
        def.errback(err);
        return err;
    });
    return def;
}

function saveFilterToHistory(config) {
    if (!config.historyId) {
        throw new Error('Controls/filter/Controller::historyId is required');
    }
    this._setIsFastProperty(config.filterButtonItems, config.fastFilterItems);
    return this._addToHistory(config.filterButtonItems, config.fastFilterItems, config.historyId);
}

Object.assign(FilterControllerClass.prototype, {
    _moduleName: 'Controls/filter:ControllerClass'
});
