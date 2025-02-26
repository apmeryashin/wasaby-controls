import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_browser/resources/BrowserTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {ControllerClass as SearchController} from 'Controls/search';
import {IFilterItem} from 'Controls/filter';
import FilterControllerClass, {IFilterControllerOptions, IFilterHistoryData} from 'Controls/_filter/ControllerClass';
import {EventUtils} from 'UI/Events';
import {RecordSet} from 'Types/collection';
import { IContextOptionsValue } from 'Controls/context';
import {RegisterClass} from 'Controls/event';
import {
    ISourceControllerOptions,
    NewSourceController as SourceController
} from 'Controls/dataSource';
import {
    Direction,
    IFilterOptions,
    IHierarchyOptions,
    ISearchOptions,
    ISourceOptions,
    TSelectionType,
    ISearchValueOptions,
    TKey,
    ISelectFieldsOptions,
    IExpandedItemsOptions
} from 'Controls/interface';
import {ErrorViewMode, ErrorViewConfig} from 'Controls/error';
import Store from 'Controls/Store';
import {SHADOW_VISIBILITY} from 'Controls/scroll';
import {detection} from 'Env/Env';
import {ICrud, ICrudPlus, IData, PrefetchProxy, QueryWhereExpression, QueryOrderSelector} from 'Types/source';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import {IMarkerListOptions} from 'Controls/_marker/interface';
import {IShadowsOptions} from 'Controls/_scroll/Container/Interface/IShadows';
import {IControllerState} from 'Controls/_dataSource/Controller';
import {isEqual} from 'Types/object';
import {DataLoader, IDataLoaderOptions, ILoadDataResult, saveControllerState} from 'Controls/dataSource';
import {Logger} from 'UI/Utils';
import {descriptor, Model} from 'Types/entity';
import {loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';
import {ITreeControlOptions} from 'Controls/tree';

type Key = string|number|null;

type TViewMode = 'search' | 'tile' | 'table' | 'list';

export interface IListConfiguration extends IControlOptions, ISearchOptions, ISourceOptions,
    Required<IFilterOptions>, Required<IHierarchyOptions>, IHierarchySearchOptions,
    IMarkerListOptions, IShadowsOptions, ISelectFieldsOptions, ISearchValueOptions, IExpandedItemsOptions,
    ITreeControlOptions {
    searchNavigationMode?: string;
    groupHistoryId?: string;
    filterButtonSource?: IFilterItem[];
    useStore?: boolean;
    dataLoadCallback?: Function;
    dataLoadErrback?: Function;
    viewMode?: TViewMode;
    root?: Key;
    sorting?: QueryOrderSelector;
    fastFilterSource?: unknown;
    historyItems?: IFilterItem[];
    sourceController?: SourceController;
    filterController?: FilterControllerClass;
    id?: string;
    displayProperty?: string;
}

export interface IBrowserOptions extends IListConfiguration {
    listsOptions: IListConfiguration[];
    sourceControllerId?: string;
    operationsController?: OperationsController;
    _dataOptionsValue?: IContextOptionsValue;
    stateStorageId?: string;
}

interface IReceivedState {
    data: RecordSet | void | Error;
    historyItems: IFilterItem[] | IFilterHistoryData;
}

type TReceivedState = IReceivedState[] | Error | void;

type TErrbackConfig = ErrorViewConfig & { error: Error };

/**
 * Контрол "Браузер" обеспечивает связь между списком (см. {@link Controls/list:View Плоский список}, {@link Controls/grid:View Таблица}, {@link Controls/treeGrid:View Дерево}, {@link Controls/tile:View Плитка} и {@link Controls/explorer:View Иерархический проводник}) и контролами его окружения, таких как {@link Controls/search:Input Строка поиска}, {@link Controls/breadcrumbs:Path Хлебные крошки}, {@link Controls/operations:Panel Панель действий} и {@link Controls/filter:View Объединенный фильтр}.
 * @class Controls/browser:Browser
 * @public
 * @author Герасимов А.М.
 * @implements Controls/browser:IBrowser
 * @implements Controls/filter:IPrefetch
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IExpandedItems
 *
 * @demo Controls-demo/Search/FlatList/Index
 */
export default class Browser extends Control<IBrowserOptions, TReceivedState> {
    protected _template: TemplateFunction = template;
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    private _isMounted: boolean;

    protected _topShadowVisibility: SHADOW_VISIBILITY | 'gridauto' = SHADOW_VISIBILITY.AUTO;
    protected _bottomShadowVisibility: SHADOW_VISIBILITY | 'gridauto' = SHADOW_VISIBILITY.AUTO;
    protected _contextState: IContextOptionsValue;

    protected _listMarkedKey: Key = null;
    private _root: Key = null;
    private _deepReload: boolean = undefined;

    protected _sourceControllerState: IControllerState;
    protected _items: RecordSet;

    private _filter: QueryWhereExpression<unknown>;
    protected _filterButtonItems: IFilterItem[];
    protected _fastFilterItems: IFilterItem[];

    protected _groupHistoryId: string;
    private _errorRegister: RegisterClass;
    private _rootChangedRegister: RegisterClass;
    private _storeCallbackIds: string[];
    private _storeCtxCallbackId: string;

    private _source: ICrudPlus | ICrud & ICrudPlus & IData;
    private _dataLoader: DataLoader = null;
    private _loading: boolean = false;

    private _operationsController: OperationsController = null;
    protected _selectedKeysCount: number | null = 0;
    protected _selectionType: TSelectionType = 'all';
    protected _isAllSelected: boolean = false;

    private _previousViewMode: TViewMode = null;
    private _viewMode: TViewMode = undefined;
    private _inputSearchValue: string = '';
    private _searchValue: string = '';
    private _misspellValue: string = '';
    private _returnedOnlyByMisspellValue: boolean = false;
    private _listsOptions: IListConfiguration[];

    protected _beforeMount(options: IBrowserOptions,
                           _: unknown,
                           receivedState?: TReceivedState): void | Promise<TReceivedState | Error | void> {
        this._initStates(options, receivedState);
        this._dataLoader = new DataLoader(this._getDataLoaderOptions(options, receivedState));
        this._operationsPanelOpen = this._operationsPanelOpen.bind(this);

        return this._loadDependencies<TReceivedState | Error | void>(options, () => {
            return this._beforeMountInternal(options, undefined, receivedState);
        });
    }

    private _selectionViewModeChanged(event: SyntheticEvent, type: string): void {
        this._notify('selectionViewModeChanged', [type]);
    }

    private _beforeMountInternal(options: IBrowserOptions,
                                 _: unknown,
                                 receivedState?: TReceivedState): void | Promise<TReceivedState | Error | void> {
        if (Browser._checkLoadResult(options, receivedState as IReceivedState[])) {
            this._updateFilterAndFilterItems(options);
            const items = receivedState?.[0].data || options.sourceController?.getItems();
            this._defineShadowVisibility(items);
            this._setItemsAndUpdateContext(options);
            if (options.source && options.dataLoadCallback) {
                options.dataLoadCallback(items);
            }
        } else if (options.source || options.filterButtonSource || options.fastFilterSource || options.listsOptions) {
            if (options.fastFilterSource) {
                Logger.warn('Browser: контрол Controls/deprecatedFilter:Fast является устаревшим и будет удалён в 21.3100', this);
            }
            return this._dataLoader.load<ILoadDataResult>().then((result) => {
                this._updateFilterAndFilterItems(options);
                this._defineShadowVisibility(result[0].data);

                if (Browser._checkLoadResult(options, result as IReceivedState[])) {
                    this._setItemsAndUpdateContext(options);
                    return result.map(({data, historyItems}) => {
                        return {
                            historyItems,
                            data
                        };
                    });
                } else {
                    this._subscribeOnControllersEvents(options);
                    this._updateContext();
                    return result[0].error;
                }
            });
        } else {
            this._updateContext();
        }
    }

    private _loadDependencies<T>(options: IBrowserOptions, callback: Function): Promise<T>|void {
        const deps = [];

        if (Browser._hasSearchParamInOptions(options) && !isLoaded('Controls/search')) {
            deps.push(loadAsync('Controls/search'));
        }

        if (this._hasFilterSourceInOptions(options) && !isLoaded('Controls/filter')) {
            deps.push(loadAsync('Controls/filter'));
        }

        if (deps.length) {
            return Promise.all(deps).then(() => {
               return callback();
            });
        } else {
            return callback();
        }
    }

    private _initStates(options: IBrowserOptions, receivedState: TReceivedState): void {
        this._itemOpenHandler = this._itemOpenHandler.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._dataLoadErrback = this._dataLoadErrback.bind(this);
        this._rootChanged = this._rootChanged.bind(this);
        this._dataLoadStart = this._dataLoadStart.bind(this);
        this._sortingChanged = this._sortingChanged.bind(this);
        this._notifyNavigationParamsChanged = this._notifyNavigationParamsChanged.bind(this);
        this._searchStartCallback = this._searchStartCallback.bind(this);
        this._itemsChanged = this._itemsChanged.bind(this);
        this._selectionViewModeChanged = this._selectionViewModeChanged.bind(this);
        this._operationsPanelExpandedChanged = this._operationsPanelExpandedChanged.bind(this);
        this._actionClick = this._actionClick.bind(this);
        if (options.operationsController) {
            this._operationsController = this._createOperationsController(options);
        }

        if (options.root !== undefined) {
            this._root = options.root;
        }

        this._source = receivedState ? this._getOriginalSource(options) : options.source;

        if (options.useStore) {
            this._inputSearchValue = this._searchValue = Store.getState().searchValue as unknown as string || '';
        } else if (options.searchValue) {
            this._inputSearchValue = this._searchValue = options.searchValue;
        }

        this._filter = options.filter || {};
        this._groupHistoryId = options.groupHistoryId;

        // на mount'e не доступен searchController, т.к. он грузится асинхронно, поэтому логика тут нужна
        this._previousViewMode = this._viewMode = options.viewMode;
        if (this._inputSearchValue && this._inputSearchValue.length >= options.minSearchLength) {
            this._updateViewMode('search');
        } else {
            this._updateViewMode(options.viewMode);
        }
        this._listsOptions = Browser._getListsOptions(options);
    }

    protected _afterMount(options: IBrowserOptions): void {
        this._isMounted = true;
        if (options.useStore) {
            this._subscribeOnStoreChanges(options);
        }
    }

    private _subscribeOnStoreChanges(options: IBrowserOptions): void {
        this._storeCallbackIds = this._createNewStoreObservers();
        this._storeCtxCallbackId = Store.onPropertyChanged('_contextName', () => {
            this._storeCallbackIds.forEach((id) => Store.unsubscribe(id));
            this._storeCallbackIds = this._createNewStoreObservers();
            if (!options.hasOwnProperty('searchValue') && this._searchValue) {
                this._setSearchValueAndNotify('');
                this._getSearchControllerSync()?.reset(true);
            }
        }, true);
    }

    private _unsubscribeFromStoreChanges(): void {
        if (this._storeCallbackIds) {
            this._storeCallbackIds.forEach((id) => Store.unsubscribe(id));
        }
        if (this._storeCtxCallbackId) {
            Store.unsubscribe(this._storeCtxCallbackId);
        }
    }

    private _validateSearchOptions(options: IBrowserOptions): void {
        if (options.hasOwnProperty('searchValue') && options.searchValue === undefined) {
            Logger.error('Controls/browser:Browser опция searchValue имеет некорректный тип, необходимо передавать строкой', this);
        }
    }

    protected _createNewStoreObservers(): string[] {
        const sourceCallbackId = Store.onPropertyChanged('filterSource', (filterSource: IFilterItem[]) => {
                this._filterItemsChanged(null, filterSource);
        });
        const selectedTypeChangedCallbackId = Store.onPropertyChanged('selectedType', (type: string) => {
            this._selectedTypeChangedHandler(null, type);
        });
        const filterSourceCallbackId = Store.onPropertyChanged('filter',
           (filter: QueryWhereExpression<unknown>) => this._filterChanged(null, filter));
        const searchValueCallbackId = Store.onPropertyChanged('searchValue',
           (searchValue: string) => {
                if (searchValue) {
                    this._search(null, searchValue);
                } else {
                    this._searchResetHandler();
                }
           });
        return [
            sourceCallbackId,
            filterSourceCallbackId,
            searchValueCallbackId,
            selectedTypeChangedCallbackId
        ];
    }

    protected _beforeUpdate(newOptions: IBrowserOptions): void | Promise<RecordSet> {
        const currentOptions = this._options;
        return this._loadDependencies(newOptions, () => {
            return this._beforeUpdateInternal(newOptions, currentOptions);
        });
    }

    protected _beforeUpdateInternal(
        newOptions: IBrowserOptions,
        currentOptions: IBrowserOptions
    ): void | Promise<RecordSet> {
        if (newOptions.listsOptions) {
            const listsIdsAreEqual = newOptions.listsOptions.every(({id}) => {
                return this._listsOptions.find((listOption) => {
                    return listOption.id === id;
                });
            });
            if (!isEqual(newOptions.listsOptions, currentOptions.listsOptions)) {
                this._listsOptions = Browser._getListsOptions(newOptions);
            }
            if (!listsIdsAreEqual) {
                this._dataLoader = new DataLoader(this._getDataLoaderOptions(newOptions));
            }
            this._listsOptions.forEach((options, index) => {
                this._update(
                    {...currentOptions, ...currentOptions.listsOptions[index]},
                    {...newOptions, ...options},
                    options.id
                );
            });
        } else {
            this._listsOptions = Browser._getListsOptions(newOptions);
            return this._update(currentOptions, newOptions);
        }
    }

    private _update(options: IBrowserOptions, newOptions: IBrowserOptions, id?: string): void | Promise<RecordSet> {
        const sourceChanged = options.source !== newOptions.source;
        const hasSearchValueInOptions = newOptions.searchValue !== undefined;
        const isInputSearchValueLongerThenMinSearchLength = this._inputSearchValue?.length >= options.minSearchLength;
        const searchValueOptionsChanged = options.searchValue !== newOptions.searchValue;
        const searchValueChanged = this._searchValue !== newOptions.searchValue;
        const rootChanged = newOptions.root !== options.root;
        const searchController = this._getSearchControllerSync(id);
        let methodResult;

        if (newOptions.useStore !== options.useStore) {
            newOptions.useStore ?
                this._subscribeOnStoreChanges(newOptions) :
                this._unsubscribeFromStoreChanges();
        }

        this._getOperationsController().update(newOptions);
        if (newOptions.hasOwnProperty('markedKey') && newOptions.markedKey !== undefined) {
            this._listMarkedKey = this._getOperationsController().setListMarkedKey(newOptions.markedKey);
        }
        this._updateFilterController(options, newOptions, id);

        if (options.sourceController !== newOptions.sourceController) {
            this._dataLoader.setSourceController(id, newOptions.sourceController);
            this._subscribeOnSourceControllerEvents();
        }

        if (sourceChanged) {
            this._source = newOptions.source;
        }

        if (rootChanged) {
            this._root = newOptions.root;
        }

        if (rootChanged || Browser._hasRootInOptions(newOptions) && searchController?.getRoot() !== newOptions.root) {
            searchController?.setRoot(newOptions.root);
        }

        if (options.viewMode !== newOptions.viewMode) {
            if (this._isSearchViewMode()) {
                this._previousViewMode = newOptions.viewMode;
            } else {
                this._updateViewMode(newOptions.viewMode);
            }
        }

        const sourceController = this._getSourceController(id);
        let source;
        if (sourceChanged) {
            source = newOptions.source;
        } else if (sourceController.getSource() !== newOptions.source) {
            source = this._getOriginalSource(newOptions);
        } else {
            source = newOptions.source;
        }
        const isChanged = sourceController.updateOptions({
            ...newOptions,
            ...this._getSourceControllerOptions(newOptions),
            source
        });

        if (searchValueOptionsChanged && searchValueChanged) {
            this._inputSearchValue = newOptions.searchValue;

            if (!newOptions.searchValue && (sourceChanged || rootChanged) && searchController) {
                // сброс поиска производим без выполнения запроса с новым фильтров
                // из-за смены корня/источника и так будет перезапрос данных
                this._resetSearch(false);
                sourceController.setFilter(this._filter);
            }
        }

        if (isChanged && newOptions.source) {
            methodResult = this._reload(newOptions, id);
        } else if (isChanged) {
            this._afterSourceLoad(sourceController, newOptions);
        } else {
            this._updateItemsOnState();
        }

        const selectedKeysChanged = !isEqual(options.selectedKeys, newOptions.selectedKeys);
        const excludedKeysChanged = !isEqual(options.excludedKeys, newOptions.excludedKeys);
        const expandedItemsChanged = !isEqual(options.expandedItems, newOptions.expandedItems);
        if (selectedKeysChanged || excludedKeysChanged || expandedItemsChanged) {
            this._saveState(newOptions);

            if (!isChanged) {
                this._updateContext();
            }
        }
        if (expandedItemsChanged) {
            sourceController.setExpandedItems(newOptions.expandedItems);
        }

        if (
            isChanged &&
            isInputSearchValueLongerThenMinSearchLength &&
            hasSearchValueInOptions &&
            !newOptions.searchValue) {
            this._inputSearchValue = '';
        }

        if (
            (hasSearchValueInOptions && searchValueOptionsChanged) ||
            options.searchParam !== newOptions.searchParam ||
            options.startingWith !== newOptions.startingWith
        ) {
            if (!methodResult && newOptions.searchParam) {
                methodResult = this._updateSearchController(newOptions).catch((error) => {
                    this._processLoadError(error);
                    return error;
                });
            }
        }

        return methodResult;
    }

    private _updateFilterController(options: IBrowserOptions, newOptions: IBrowserOptions, id?: string): void {
        const filterController = this._dataLoader.getFilterController(id);
        const filterControllerOptions = this._getFilterControllerOptions(newOptions);
        const filterChanged = !isEqual(options.filter, newOptions.filter);

        if (filterController?.update(filterControllerOptions) || filterChanged) {
            const currentFilter = this._filter;
            this._updateFilterAndFilterItems(newOptions);

            if (!isEqual(options.filterButtonSource, newOptions.filterButtonSource) &&
                !isEqual(currentFilter, this._filter)) {
                this._notify('filterChanged', [this._filter]);
            }
        }
    }

    private _updateSearchController(newOptions: IBrowserOptions): Promise<unknown> {
        return this._getSearchController().then((searchController): unknown => {
            if (this._destroyed) {
                return Promise.resolve();
            }
            this._validateSearchOptions(newOptions);
            const updateSearchControllerResult = searchController.update({
                ...newOptions,
                sourceController: this._getSourceController(),
                root: this._root
            });

            if (updateSearchControllerResult) {
                if (newOptions.searchValue) {
                    return this._search(null, newOptions.searchValue);
                } else {
                    return Promise.resolve(this._resetSearch());
                }
            } else {
                return Promise.resolve(updateSearchControllerResult);
            }
        });
    }

    private _afterSourceLoad(sourceController: SourceController, options: IBrowserOptions): void {
        // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._filter = sourceController.getState().filter;
        this._updateContext();
        this._groupHistoryId = options.groupHistoryId;
    }

    protected _operationsPanelExpandedChanged(event: SyntheticEvent, state: boolean): void {
        this._notify('operationsPanelExpandedChanged', [state]);
    }

    protected _actionClick(event: SyntheticEvent, item: Model, nativeEvent: MouseEvent): void {
        this._notify('operationsPanelItemClick', [item, nativeEvent, this._operationsController.getSelection()]);
    }

    protected _beforeUnmount(): void {
        if (this._operationsController) {
            this._operationsController.destroy();
            this._operationsController.unsubscribe('selectionViewModeChanged', this._selectionViewModeChanged);
            this._operationsController.unsubscribe('operationsPanelVisibleChanged',
                this._operationsPanelExpandedChanged);
            this._operationsController.unsubscribe('actionClick', this._actionClick);
            this._operationsController = null;
        }

        const {sourceController} = this._options;
        if (sourceController) {
            sourceController.unsubscribe('rootChanged', this._rootChanged);
            sourceController.unsubscribe('dataLoadStarted', this._dataLoadStart);
            sourceController.unsubscribe('sortingChanged', this._sortingChanged);
            sourceController.unsubscribe('itemsChanged', this._itemsChanged);
        }

        this._dataLoader.each((config, id) => {
            this._getSourceController(id).unsubscribe('rootChanged', this._rootChanged);
        });

        if (this._errorRegister) {
            this._errorRegister.destroy();
            this._errorRegister = null;
        }

        this._unsubscribeFromStoreChanges();
        this._dataLoader.destroy();
    }

    private _getErrorRegister(): RegisterClass {
        if (!this._errorRegister) {
            this._errorRegister = new RegisterClass({register: 'dataError'});
        }
        return this._errorRegister;
    }

    private _getRootChangedRegister(): RegisterClass {
        if (!this._rootChangedRegister) {
            this._rootChangedRegister = new RegisterClass({register: 'rootChanged'});
        }
        return this._rootChangedRegister;
    }

    private _setItemsAndUpdateContext(options: IBrowserOptions): void {
        this._updateItemsOnState();
        this._subscribeOnControllersEvents(options);
        this._updateContext();
    }

    private _subscribeOnSourceControllerEvents(): void {
        const sourceController = this._getSourceController();
        this._dataLoader.each((config, id) => {
            this._getSourceController(id).subscribe('rootChanged', this._rootChanged);
        });
        sourceController.subscribe('dataLoadStarted', this._dataLoadStart);
        sourceController.subscribe('sortingChanged', this._sortingChanged);
        sourceController.subscribe('itemsChanged', this._itemsChanged);
    }

    private _subscribeOnFilterControllerEvents(options: IBrowserOptions): void {
        // Для совместимости, пока контролы вынуждены работать и от опций и от настроек на странице
        // + пока нет виджета filter/View
        this._dataLoader.getFilterController().subscribe('filterSourceChanged', () => {
            this._updateFilterAndFilterItems(options);
        });
    }

    private _subscribeOnControllersEvents(options: IBrowserOptions): void {
        this._subscribeOnSourceControllerEvents();

        if (this._hasFilterSourceInOptions(options)) {
            this._subscribeOnFilterControllerEvents(options);
        }
    }

    private _updateItemsOnState(): void {
        // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        const sourceControllerItems = this._getSourceController().getItems();
        if (!this._items || this._items !== sourceControllerItems) {
            this._items = sourceControllerItems;
        }
    }

    private _itemsChanged(): void {
        this._updateContext();
    }

    protected _getSourceController(id?: string): SourceController {
        return this._dataLoader.getSourceController(id);
    }

    protected _cancelLoading(): void {
        this._dataLoader.each(({sourceController}) => {
            sourceController?.cancelLoading();
        });
    }

    private _getSearchController(): Promise<SearchController> {
        return this._dataLoader.getSearchController();
    }

    private _getSearchControllerSync(id?: string): SearchController {
        return this._dataLoader.getSearchControllerSync(id);
    }

    private _callSearchController<T>(callback: (controller: SearchController) => T): T|Promise<T> {
        const dataLoader = this._dataLoader;
        if (dataLoader.getSearchControllerSync()) {
            return callback(dataLoader.getSearchControllerSync());
        } else {
            return this._getSearchController().then(callback);
        }
    }

    protected _handleItemOpen(root: Key, items: RecordSet): void {
        const currentRoot = this._root;
        const searchController = this._getSearchControllerSync();

        if (this._isSearchViewMode() && this._options.searchNavigationMode === 'expand') {
            this._notify(
                'expandedItemsChanged', [this._getSearchControllerSync().getExpandedItemsForOpenRoot(root, items)]
            );

            if (!this._deepReload) {
                this._deepReload = true;
            }
        } else if (!this._options.hasOwnProperty('root')) {
            searchController?.setRoot(root);
            this._root = root;
        }
        if (root !== currentRoot && searchController) {
            this._inputSearchValue = '';

            if (this._searchValue) {
                searchController.resetSavedRootBeforeSearch();
                this._resetSearch();
                if (this._options.useStore) {
                    Store.sendCommand('resetSearch');
                }
            }
        }
    }

    private _isSearchViewMode(): boolean {
        return this._viewMode === 'search';
    }

    protected _dataLoadStart(event: SyntheticEvent, direction: Direction): void {
        if (!direction) {
            this._loading = true;
        }
    }

    protected _filterChanged(event: SyntheticEvent, filter: QueryWhereExpression<unknown>, id?: string): void {
        event?.stopPropagation();

        const hasFilterInOptions = Browser._hasInOptions(this._options, ['filter']);
        const listOptions = this._getListOptionsById(id);
        this._dataLoader.getFilterController()?.setFilter(filter);
        if (listOptions && id) {
            listOptions.filter = listOptions.filter || filter;
        }
        if (!hasFilterInOptions || !this._options.task1182865383) {
            this._filter = filter;
        }
        if (!hasFilterInOptions) {
            // _filter - состояние, которое используется, когда не передают опцию filter.
            // это состояние не рекативное, т.к. в шаблоне не используется
            // из-за этого необходимо звать _forceUpdate
            this._forceUpdate();
        }
        this._notify('filterChanged', [filter, id]);
    }

    protected _breadCrumbsItemClick(event: SyntheticEvent, root: Key): void {
        this._getRootChangedRegister().start(root);
    }

    protected _rootChanged(event: SyntheticEvent, root: Key, id?: string): void {
        let currentRoot;

        if (id && this._getListOptionsById(id)?.root !== undefined) {
            currentRoot = this._getListOptionsById(id)?.root;
        } else {
            currentRoot = this._root;
        }

        if (!Browser._hasRootInOptions(this._options)) {
            this._setRoot(root, id);
            // Стейт _root не реактивный, поэтому необходимо звать forceUpdate
            this._forceUpdate();
        }
        if (this._isMounted && currentRoot !== root) {
            this._notify('rootChanged', [root, id]);
        }
    }

    protected _setRoot(root: Key, id?: string): void {
        const listOptions = this._getListOptionsById(id);
        if (listOptions && id) {
            listOptions.root = root;
        } else {
            this._root = root;
        }
    }

    protected _getListOptionsById(id: string): IListConfiguration|void {
        return this._listsOptions.find((options: IBrowserOptions) => {
            return options.id === id;
        });
    }

    protected _sortingChanged(event: SyntheticEvent, sorting: Key, id?: string): void {
        this._notify('sortingChanged', [sorting, id]);
    }

    protected _historySaveCallback(historyData: Record<string, any>, items: IFilterItem[]): void {
        if (this._mounted && !this._destroyed) {
            this?._notify('historySave', [historyData, items]);
        }
    }

    protected _filterItemsChanged(event: SyntheticEvent, items: IFilterItem[]): void {
        if (!this._hasFilterSourceInOptions(this._options)) {
            Logger.error(
                'Browser: для корректной работы фильтра необходимо передать опцию filterButtonSource',
                this
            );
        }
        this._listsOptions.forEach(({id, filterButtonSource, fastFilterSource}) => {
            if (filterButtonSource || fastFilterSource) {
                const filterController = this._dataLoader.getFilterController(id);
                filterController.updateFilterItems(items);
                const filter = filterController.getFilter();
                this._contextState = {
                    ...this._contextState,
                    filter
                };
                this._notify('filterChanged', [filter, id]);
            }
        });
    }

    private _updateContext(): void {
        const sourceControllerState = this._getSourceController().getState();
        const operationsController = this._getOperationsController();
        const dataLoader = this._dataLoader;

        this._contextState = {
            ...sourceControllerState,
            listsConfigs: dataLoader.getState(),
            listsSelectedKeys: operationsController.getSelectedKeysByLists(),
            listsExcludedKeys: operationsController.getExcludedKeysByLists(),
            operationsController,
            filterController: dataLoader.getFilterController()
        };
        this._sourceControllerState = sourceControllerState;
    }

    protected _filterHistoryApply(event: SyntheticEvent, history: IFilterItem[]): void {
        this._dataLoader.getFilterController().updateHistory(history);
    }

    private _updateFilterAndFilterItems(options: IBrowserOptions): void {
        if (this._hasFilterSourceInOptions(options)) {
            const filterController = this._dataLoader.getFilterController();
            this._filter = filterController.getFilter() as QueryWhereExpression<unknown>;
            this._filterButtonItems = filterController.getFilterButtonItems();
            this._fastFilterItems = filterController.getFastFilterItems();
        } else {
            this._filter = options.filter || {};
        }
    }

    protected _processLoadError(error: Error): void {
        if (error && !error.isCanceled) {
            this._onDataError(null, {
                error,
                mode: ErrorViewMode.include
            } as TErrbackConfig);
        }
    }

    protected _onDataError(event: SyntheticEvent, errbackConfig: TErrbackConfig): void {
        this._getErrorRegister().start(errbackConfig);
    }

    protected _registerHandler(event: Event, registerType: string,
                               component: unknown, callback: Function, config: object): void {
        this._getErrorRegister().register(event, registerType, component, callback, config);
        this._getOperationsController().registerHandler(event, registerType, component, callback, config);
        this._getRootChangedRegister().register(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event: Event, registerType: string, component: unknown, config: object): void {
        this._getErrorRegister().unregister(event, registerType, component, config);
        this._getOperationsController().unregisterHandler(event, registerType, component, config);
        this._getRootChangedRegister().unregister(event, registerType, component, config);
    }

    protected _selectedTypeChangedHandler(event: SyntheticEvent<null>, typeName: string, limit?: number): void {
        this._getOperationsController().selectionTypeChanged(typeName, limit);
    }

    protected _selectedKeysCountChanged(e: SyntheticEvent,
                                        count: number|null,
                                        isAllSelected: boolean, id?: string): void {
        e.stopPropagation();
        const result = this._getOperationsController().updateSelectedKeysCount(count, isAllSelected, id);
        this._selectedKeysCount = result.count;
        this._isAllSelected = result.isAllSelected;
    }

    protected _listSelectionTypeForAllSelectedChanged(event: SyntheticEvent, selectionType: TSelectionType): void {
        event.stopPropagation();
        this._selectionType = selectionType;
    }

    protected _excludedKeysChanged(event: SyntheticEvent, ...args: [TKey[], TKey[], TKey[], string?]): void {
        args[0] = args[3] ? this._getOperationsController().updateExcludedKeys(...args) : args[0];
        this._notify('excludedKeysChanged', args);
    }

    protected _selectedKeysChanged(event: SyntheticEvent, ...args: [TKey[], TKey[], TKey[], string?]): void {
        args[0] = args[3] ? this._getOperationsController().updateSelectedKeys(...args) : args[0];
        this._notify('selectedKeysChanged', args);
    }

    protected _itemOpenHandler(newCurrentRoot: Key, items: RecordSet, dataRoot: Key = null): void {
        this._getOperationsController().itemOpenHandler(newCurrentRoot, items, dataRoot);
        this._handleItemOpen(newCurrentRoot, items, dataRoot);
        if (this._options.itemOpenHandler instanceof Function) {
            return this._options.itemOpenHandler(newCurrentRoot, items, dataRoot);
        }
    }

    protected _listMarkedKeyChangedHandler(event: SyntheticEvent<null>, markedKey: Key): unknown {
        this._listMarkedKey = this._getOperationsController().setListMarkedKey(markedKey);
        return this._notify('markedKeyChanged', [markedKey]);
    }

    protected _markedKeyChangedHandler(event: SyntheticEvent<null>): void {
        event.stopPropagation();
    }

    protected _operationsPanelOpen(): void {
        this._listMarkedKey = this._getOperationsController().setOperationsPanelVisible(true);
    }

    protected _operationsPanelClose(): void {
        this._getOperationsController().setOperationsPanelVisible(false);
    }

    private _createOperationsController(options: IBrowserOptions): OperationsController {
        const controller = options.operationsController || new OperationsController({...options});
        controller.subscribe('selectionViewModeChanged', this._selectionViewModeChanged);
        controller.subscribe('operationsPanelVisibleChanged',
            this._operationsPanelExpandedChanged);
        controller.subscribe('actionClick', this._actionClick);
        return controller;
    }

    private _getOperationsController(): OperationsController {
        if (!this._operationsController) {
            this._operationsController = this._createOperationsController(this._options);
        }

        return this._operationsController;
    }

    private _defineShadowVisibility(items: RecordSet|Error|void): void {
        if (detection.isMobilePlatform) {
            // На мобильных устройствах тень верхняя показывается, т.к. там есть уже загруженные данные вверху
            return;
        }

        if (items instanceof RecordSet) {
            const more = items.getMetaData().more;
            if (more) {
                this._topShadowVisibility = more.before ? 'gridauto' : SHADOW_VISIBILITY.AUTO;
                this._bottomShadowVisibility = more.after ? 'gridauto' : SHADOW_VISIBILITY.AUTO;
            }
        }
    }

    private _getSourceControllerOptions(options: IListConfiguration): ISourceControllerOptions {
        const root = options.id ? options.root : this._root;
        const filter = options.id && this._listsOptions?.length > 1 ? options.filter : this._filter;
        return {
            filter,
            navigationParamsChangedCallback: this._notifyNavigationParamsChanged,
            dataLoadErrback: this._dataLoadErrback,
            dataLoadCallback: this._dataLoadCallback,
            root,
            sorting: options.sorting
        };
    }

    private _getDataLoaderOptions(
        options: IBrowserOptions,
        receivedState?: TReceivedState
    ): IDataLoaderOptions {
        const loadDataConfigs = (Browser._getListsOptions(options)).map((listOptions, index) => {
            return {
                ...listOptions,
                ...this._getSourceControllerOptions(listOptions),
                searchValue: this._getSearchValue(options),
                items: receivedState?.[index]?.data,
                historyItems: receivedState?.[index]?.historyItems || listOptions.historyItems,
                source: receivedState ? this._getOriginalSource(listOptions as IBrowserOptions) : listOptions.source,
                searchStartCallback: this._searchStartCallback,
                sourceController: Browser._getSourceControllerForDataLoader(options, listOptions)
            };
        });

        return {loadDataConfigs} as IDataLoaderOptions;
    }

    private _getSearchValue(options: IBrowserOptions): string {
        return options.hasOwnProperty('searchValue') ? options.searchValue : this._searchValue;
    }

    private _getFilterControllerOptions(options: IBrowserOptions): IFilterControllerOptions {
        const {filterButtonSource, filterController} = options;
        return {
            ...options,
            searchValue: this._getSearchValue(options),
            historySaveCallback: this._historySaveCallback.bind(this),
            filterButtonSource: filterButtonSource || filterController?.getFilterButtonItems()
        } as IFilterControllerOptions;
    }

    private _notifyNavigationParamsChanged(params: unknown): void {
        if (this._isMounted) {
            this._notify('navigationParamsChanged', [params]);
        }
    }

    private _searchStartCallback(filter: QueryWhereExpression<unknown>): void {
        if (this._isMounted) {
            this._notify('searchStart', [filter]);
        }
    }

    private _getOriginalSource(options: IBrowserOptions): ICrudPlus | ICrud & ICrudPlus & IData {
        let source;

        if (options.source instanceof PrefetchProxy) {
            source = options.source.getOriginal();
        } else {
            source = options.source;
        }

        return source;
    }

    protected _search(event: SyntheticEvent, value: string): Promise<Error|RecordSet[]|void> {
        const searchPromises = [];

        this._inputSearchValue = value;
        event?.stopPropagation();
        this._listsOptions.forEach(({searchParam, id}, index) => {
            if (searchParam) {
                this._loading = true;
                searchPromises.push(this._dataLoader.getSearchController(id).then((searchController) => {
                    if (!this._destroyed) {
                        return searchController.search(value).finally(() => {
                            if (!this._destroyed) {
                                this._loading = false;
                                this._afterSourceLoad(
                                    this._getSourceController(id),
                                    this._listsOptions[index] as IBrowserOptions
                                );
                                this._updateItemsOnState();
                            }
                        });
                    }
                }));
            }
        });

        return Promise.all(searchPromises).catch((error) => {
            return this._processSearchError(error);
        });
    }

    private _resetSearch(sendRequestWithNewFilter: boolean = !!this._options.sourceController): void {
        const configsCount = Object.keys(this._dataLoader.getState()).length;

        if (configsCount > 1) {
            this._dataLoader.each(({searchController, sourceController, id}) => {
                const newFilter = searchController?.reset(true);
                if (searchController && !isEqual(sourceController?.getFilter(), newFilter)) {
                    this._filterChanged(null, newFilter, id);
                }
            });
        } else {
            // Если Browser строится по sourceController'у со страницы, то и фильтр должен обновляться на странице
            // в противном случае происходит рассинхрон фильтров в контексте и в контроллере
            // Решается тут https://online.saby.ru/opendoc.html?guid=6c15ea37-fdf6-4dc8-a8fa-d54bd7be01bb
            const searchController = this._getSearchControllerSync();
            if (sendRequestWithNewFilter) {
                searchController.reset().catch((error) => error);
            } else {
                searchController.reset(true);
            }
            const filter = searchController.getFilter();
            if (!isEqual(this._filter, filter)) {
                this._filterChanged(null, filter);
            }
        }

        this._setSearchValue('');
        this._returnedOnlyByMisspellValue = false;
    }

    protected _inputSearchValueChanged(event: SyntheticEvent, value: string): void {
        this._inputSearchValue = value;
        this._getSearchControllerSync()?.setInputSearchValue(value);
    }

    private _processSearchError(error: Error): void|Error {
        if (!error.isCanceled) {
            this._loading = false;
            this._updateParams();
            this._filterChanged(null, this._dataLoader.getSearchControllerSync().getFilter());
            this._getErrorRegister().start({
                error,
                mode: ErrorViewMode.include
            });
            return error;
        }
    }

    private _searchResetHandler(): void {
        this._cancelLoading();
        this._callSearchController(() => {
            if (!this._destroyed) {
                this._resetSearch();
                this._updateRootAfterSearch();
            }
        });
    }

    private _afterSearch(recordSet: RecordSet, id?: string): void {
        this._updateParams();
        this._filterChanged(null, this._getSearchControllerSync().getFilter(), id);
        this._returnedOnlyByMisspellValue =
            this._getSearchControllerSync().needChangeSearchValueToSwitchedString(recordSet) &&
            !!this._misspellValue;
        this._updateContext();
    }

    private _setSearchValue(value: string): void {
        this._setSearchValueAndNotify(value);
        this._saveState();
    }

    private _setSearchValueAndNotify(value: string): void {
        this._searchValue = value;
        this._notify('searchValueChanged', [value]);
    }

    private _updateParams(): void {
        if (this._viewMode !== 'search') {
            this._updateViewMode('search');
            this._updateRootAfterSearch();
        }
        this._setSearchValue(this._getSearchControllerSync().getSearchValue());
    }

    private _updateRootAfterSearch(): void {
        const newRoot = this._getSearchControllerSync().getRoot();

        if (newRoot !== this._root) {
            this._rootChanged(null, newRoot);
        }
    }

    private _updateViewMode(newViewMode: TViewMode): void {
        this._previousViewMode = this._viewMode;
        this._viewMode = newViewMode;
    }

    private _handleDataLoad(data: RecordSet, direction?: Direction, id?: string): void {
        const searchController = this._getSearchControllerSync(id);

        if (this._deepReload) {
            this._deepReload = undefined;
        }

        if (this._loading) {
            this._afterSourceLoad(this._getSourceController(id), this._options);
            this._loading = false;
        }

        if (searchController) {
            this._misspellValue = searchController.getMisspellValue();
            if (searchController.isSearchInProcess() || searchController.getSearchValue() !== this._searchValue) {
                this._afterSearch(data, id);
            }
        }

        if (this._isSearchViewMode() && !this._searchValue) {
            this._updateViewMode(this._previousViewMode);
            this._previousViewMode = null;
        }
    }

    private _dataLoadCallback(data: RecordSet, direction?: Direction, id?: string): void {
        this._dataLoader.getFilterController()?.handleDataLoad(data);
        this._handleDataLoad(data, direction, id);

        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(data, direction, id);
        }
    }

    private _dataLoadErrback(error: Error): void {
        this._dataLoader.getFilterController()?.handleDataError();
        if (this._options.dataLoadErrback) {
            this._options.dataLoadErrback(error);
        }
    }

    private _reload(options: IBrowserOptions, id?: string): Promise<RecordSet> {
        const sourceController = this._getSourceController(id);

        return sourceController.reload()
            .then((items) => {
                this._updateItemsOnState();
                return items;
            })
            .catch((error) => {
                this._processLoadError(error);
                return error;
            })
            .finally(() => {
                if (!this._destroyed) {
                    this._loading = false;
                    this._afterSourceLoad(sourceController, options);
                }
            })
            .then((result) => {
                if (!this._destroyed && options.searchParam) {
                    return this._updateSearchController(options).then(() => result);
                }
            });
    }

    _misspellCaptionClick(): void {
        if (this._options.useStore) {
            Store.dispatch('searchValue', this._misspellValue);
        } else {
            this._search(null, this._misspellValue);
        }
        this._misspellValue = '';
    }

    _saveState(options: IBrowserOptions = this._options): void {
        if (options.stateStorageId) {
            saveControllerState(options.stateStorageId, {
                searchValue: this._getSearchValue(options),
                selectedKeys: options.selectedKeys,
                excludedKeys: options.excludedKeys,
                expandedItems: this._getSourceController().getExpandedItems()
            });
        }
    }

    resetPrefetch(): void {
        if (!this._getSourceController().isLoading()) {
            const filterController = this._dataLoader.getFilterController();
            filterController.resetPrefetch();
            this._filter = filterController.getFilter() as QueryWhereExpression<unknown>;
            this._notify('filterChanged', [this._filter]);
            // Состояние _filter - не реактивное, и в случае,
            // если не задают опцию filter, то _beforeUpdate не будет вызван и данные не перезагрузятся,
            // т.к. sourceController обновляется только на _beforeUpdate
            this._forceUpdate();
        }
    }

    private _hasFilterSourceInOptions(options: IBrowserOptions): boolean {
        return Browser._hasInOptions(options, ['filterButtonSource', 'fastFilterSource', 'selectionViewMode']) ||
               (!!this._getSearchValue(options) && !options.filter?.[options.searchParam]);
    }

    private static _getSourceControllerForDataLoader(
        {sourceController, sourceControllerId, _dataOptionsValue}: IBrowserOptions,
        listOptions?: IListConfiguration
    ): SourceController|void {
        let browserSourceController;

        if (sourceController) {
            browserSourceController = sourceController;
        }

        if (!sourceController) {
            if (_dataOptionsValue && sourceControllerId && _dataOptionsValue.listsConfigs[sourceControllerId]) {
                browserSourceController = _dataOptionsValue.listsConfigs[sourceControllerId].sourceController;
            } else if (_dataOptionsValue?.sourceController) {
                browserSourceController = _dataOptionsValue.sourceController;
            }
        }

        if (!browserSourceController && listOptions) {
            browserSourceController = listOptions.sourceController;
        }

        return browserSourceController;
    }

    private static _checkLoadResult(
        options: IBrowserOptions,
        loadResult: IReceivedState[] = []
    ): boolean {
        const listsOptions = Browser._getListsOptions(options);
        return loadResult?.filter((result, index) =>
                (!listsOptions[index].filterButtonSource || result.historyItems !== undefined) &&
                result.data !== undefined && !result.error
        ).length > 0 || !!options.sourceController;
    }

    private static _getListsOptions(options: IBrowserOptions): IListConfiguration[] {
        return options.listsOptions || [options];
    }

    private static _hasInOptions(browserOptions: IBrowserOptions, options: string[]): boolean {
        return options.some((option) => {
            return Browser._getListsOptions(browserOptions).filter((listOptions) => {
                return listOptions[option] !== undefined;
            }).length > 0;
        });
    }

    private static _hasSearchParamInOptions(options: IBrowserOptions): boolean {
        return Browser._hasInOptions(options, ['searchParam']);
    }

    private static _hasRootInOptions(options: IBrowserOptions): boolean {
        return Browser._hasInOptions(options, ['root']);
    }

    static getDefaultOptions(): object {
        return {
            minSearchLength: 3,
            searchDelay: 500,
            startingWith: 'root',
            filter: {}
        };
    }

    static getOptionTypes(): object {
        return {
            searchValue: descriptor(String)
        };
    }
}

Object.defineProperty(Browser, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Browser.getDefaultOptions();
   }
});
