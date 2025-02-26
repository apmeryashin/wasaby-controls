import {Model} from 'Types/entity';
import {SyntheticEvent} from 'UI/Vdom';
import {RecordSet} from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {IOptions} from 'Controls/_newBrowser/interfaces/IOptions';
import {DetailViewMode, IDetailOptions} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {IExplorerOptions} from 'Controls/_newBrowser/interfaces/IExplorerOptions';
import {MasterVisibilityEnum} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {IBrowserViewConfig, NodesPosition} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {isEqual} from 'Types/object';
import {EventUtils} from 'UI/Events';
import {TExplorerViewMode, View as ExplorerView} from 'Controls/explorer';
import {loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';
import {getListConfiguration} from 'Controls/_newBrowser/utils';
import * as ViewTemplate from 'wml!Controls/_newBrowser/View/View';
import {TColumns} from 'Controls/grid';
import 'css!Controls/listTemplates';
import {ContextOptions as dataContext} from 'Controls/context';
import {default as TileController} from 'Controls/_newBrowser/TemplateControllers/Tile';
import {default as ListController} from 'Controls/_newBrowser/TemplateControllers/List';
import {default as TableController} from 'Controls/_newBrowser/TemplateControllers/Table';
import {object} from 'Types/util';
import 'css!Controls/newBrowser';
import {TKey} from 'Controls/interface';
import {IReloadItemOptions} from 'Controls/list';

//endregion

interface IReceivedState {
    masterItems?: RecordSet;
    detailItems: RecordSet;
}

const DEFAULT_BACKGROUND_COLOR = '#ffffff';

/**
 * Компонент реализует стандартную раскладку и поведение двухколоночного реестра с master и detail списками:
 *  * синхронное изменение списков при изменении корневой директории в одном из них
 *  * возможность задавать режим отображения detail списка (список|плитка|дерево)
 *  * возможность поиска с последующим отображением результатов в detail списке
 *  * возможность конфигурирования стандартных шаблонов итема списка и плитки
 *
 * @demo Controls-demo/NewBrowser/Index
 *
 * @private
 * @author Михайлов С.Е
 * @class Controls/newBrowser:View
 */
export default class View extends Control<IOptions, IReceivedState> {

    /**
     * Текущий режим отображения списка в detail-колонке.
     */
    get viewMode(): DetailViewMode {
        // Режим 'search' самый приоритетный. Во всех остальных случаях
        // используем либо явно заданный _userViewMode либо текущий _viewMode,
        // полученный из метаданных
        return this._viewMode === DetailViewMode.search
            ? this._viewMode
            : (this._userViewMode || this._viewMode);
    }

    //region ⽥ fields

    /**
     * Поля для режима "expandedCompositeTree"
     */
    _activeElement: TKey = null;

    /**
     * Шаблон отображения компонента
     */
    protected _template: TemplateFunction = ViewTemplate;
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    protected _defaultTileItemTemplate: TemplateFunction = 'Controls/tile:RichTemplate';
    protected _defaultListItemTemplate: TemplateFunction = 'Controls/listTemplates:ListItemTemplate';
    protected _detailDataSource: SourceController = null;
    protected _tableCfg: TableController = null;
    protected _columns: TColumns;

    /**
     * Enum со списком доступных вариантов отображения контента в detail-колонке.
     * Используется в шаблоне компонента.
     */
    protected _viewModeEnum: typeof DetailViewMode = DetailViewMode;

    /**
     * Enum со списком доступных вариантов отображения master-колонки.
     * Используется в шаблоне компонента.
     */
    protected _masterVisibilityEnum: typeof MasterVisibilityEnum = MasterVisibilityEnum;

    /**
     * Регулирует видимость master-колонки
     */
    protected _masterVisibility: MasterVisibilityEnum;
    protected _newMasterVisibility: MasterVisibilityEnum;

    // Пользовательский режим отображения, задается опцией сверху
    private _userViewMode: DetailViewMode;
    // Текущий режим отображения, полученный их метаданных ответа,
    // либо выставленный нами явно в 'search' при поиске
    private _viewMode: DetailViewMode;
    protected _appliedViewMode: DetailViewMode;
    protected _children: {
        detailList: ExplorerView
        masterList: ExplorerView
    };
    /**
     * В случае если для detail-списка указана опция searchStartingWith === 'root'
     * то после поиска сбрасывается текущее значение root, которое на время отображения
     * результатов поиска хранится в этом поле для того, что бы после сброса поиска
     * вернуть представление к исходному виду
     */
    //endregion

    //region templates options
    /**
     * Текущая конфигурация списков, полученная из метаданных последнего запроса
     * к данным для detail-колонки. Заполняется в {@link _applyListConfiguration}
     */
    protected _listConfiguration: IBrowserViewConfig;
    protected _tileCfg: TileController = null;
    protected _listCfg: ListController = null;
    protected _dataContext: Record<string, any> = null;
    protected _masterDataSource: SourceController = null;
    protected _contrastBackground: boolean = true;
    protected _listLoaded: boolean = false;
    protected _tileLoaded: boolean = false;
    protected _masterLoading: boolean = false;
    protected _detailLoading: boolean = false;
    protected _detailRootChanged: boolean = false;
    protected _masterDataLoadResolver: Function = null;
    protected _newDetailOptions: IExplorerOptions = null;

    /**
     * Опции для Controls/explorer:View в master-колонке
     */
    protected _masterExplorerOptions: IExplorerOptions;
    protected _contextVersion: number = 0;

    /**
     * Опции для Controls/explorer:View в detail-колонке
     */
    protected _detailExplorerOptions: IExplorerOptions;

    protected _detailBgColor: string = '#ffffff';
    //endregion

    //region private fields
    /**
     * true если контрол смонтирован в DOM
     */
    private _isMounted: boolean = false;
    //endregion
    //endregion

    constructor(options: IOptions, context?: object) {
        super(options, context);
        this._changeActiveElement = this._changeActiveElement.bind(this);
        this._onDetailDataLoadCallback = this._onDetailDataLoadCallback.bind(this);
        this._onMasterDataLoadCallback = this._onMasterDataLoadCallback.bind(this);
    }

    protected _beforeMount(
        options?: IOptions,
        contexts?: object
    ): Promise<IReceivedState> | void {
        this._dataContext = contexts.dataContext;
        if (this._dataContext.listsConfigs) {
            this._contextVersion = this._dataContext.getVersion?.();
            this._initState(options);
            this._processItemsMetadata(this._detailDataSource.getItems(), options);
            if (options.searchValue && options.viewMode === DetailViewMode.search) {
                this._viewMode = DetailViewMode.search;
            }
            this._afterViewModeChanged(options);
        }
    }

    protected _componentDidMount(options?: IOptions, contexts?: unknown): void {
        this._isMounted = true;
    }

    protected _calculateViewByViewMode(viewMode: DetailViewMode, useColumns: boolean = false): string {
        if (viewMode === DetailViewMode.list) {
            return useColumns ? 'Controls/columns' : 'Controls/list';
        }
        if (viewMode === DetailViewMode.tile) {
            return 'Controls/treeTile';
        }
        if (viewMode === DetailViewMode.table) {
            return 'Controls/treeGrid';
        }
    }

    protected _isViewModeLoaded(viewMode: DetailViewMode, useColumns: boolean): boolean {
        const viewModule = this._calculateViewByViewMode(viewMode, useColumns);
        return isLoaded(viewModule);
    }

    //region ⇑ events handlers
    private _onDetailDataLoadCallback(event: SyntheticEvent, items: RecordSet, direction: string): void {
        const searchController = this._dataContext.listsConfigs.detail.searchController;
        const needApplyConfiguration = !direction && (!searchController || !searchController.isSearchInProcess());
        if (needApplyConfiguration) {
            this._processItemsMetadata(items);
        }
        if (this._masterDataLoadResolver) {
            this._masterDataLoadResolver();
            this._masterDataLoadResolver = null;
        }

        if (this._newMasterVisibility) {
            this._masterVisibility = this._newMasterVisibility;
            this._newMasterVisibility = null;
        }
        if (this._detailExplorerOptions.dataLoadCallback) {
            this._detailExplorerOptions.dataLoadCallback(items, direction, 'detail');
        }
    }

    protected _updateContextVersion(context: typeof dataContext): boolean {
        const currentVersion = this._contextVersion;
        const contextVersion = context.getVersion();
        this._contextVersion = contextVersion;
        return currentVersion !== contextVersion;
    }

    protected _setDetailOptions(options: IExplorerOptions) {
        const oldColumns = this._detailExplorerOptions.columns;
        this._detailExplorerOptions = options;
        if (!isEqual(oldColumns, this._detailExplorerOptions.columns)) {
            this._columns = this._getPatchedColumns(this._detailExplorerOptions.columns);
        }
    }

    protected _beforeUpdate(newOptions?: IOptions, contexts?: unknown): void {
        this._dataContext = contexts.dataContext;
        const contextVersionChanged = this._updateContextVersion(this._dataContext);
        const detailOptionsChanged = !isEqual(newOptions.detail, this._options.detail);
        const masterOptionsChanged = !isEqual(newOptions.master, this._options.master);
        const isDetailRootChanged = this._dataContext.listsConfigs.detail.root !== this._detailDataSource.getRoot();
        const viewModeChanged = this._userViewMode !== newOptions.userViewMode;
        const newViewModeLoaded = this._isViewModeLoaded(newOptions.userViewMode,
            this._detailExplorerOptions.useColumns);
        if (isDetailRootChanged) {
            this._detailRootChanged = true;
        }
        if (detailOptionsChanged || contextVersionChanged) {
            const newDetailOptions = this._getListOptions(
                this._dataContext.listsConfigs.detail,
                newOptions.detail
            );
            if ((viewModeChanged && newViewModeLoaded) || !viewModeChanged) {
                this._setDetailOptions(newDetailOptions);
            } else {
                this._newDetailOptions = newDetailOptions;
            }
        }
        if (masterOptionsChanged || contextVersionChanged) {
            this._masterExplorerOptions = this._getListOptions(
                this._dataContext.listsConfigs.master,
                newOptions.master
            );
        }
        // Пока viewMode не распространяется по контексту
        // FIXME: https://online.sbis.ru/opendoc.html?guid=577201e1-e388-4ed0-bcb7-cda0b026c03e
        if (!this._detailDataSource?.isLoading()) {
            this._viewMode = newOptions.viewMode;
        }

        if (newOptions.listConfiguration && !isEqual(this._options.listConfiguration, newOptions.listConfiguration)) {
            this._createTemplateControllers(newOptions.listConfiguration, newOptions);
        }
        if (this._userViewMode !== newOptions.userViewMode) {
            this._loadViewMode(newOptions.userViewMode,
                this._detailExplorerOptions.useColumns, (viewMode: DetailViewMode) => {
                this._userViewMode = viewMode;
                if (this._newDetailOptions) {
                    this._setDetailOptions(this._newDetailOptions);
                    this._newDetailOptions = null;
                }
                this._forceUpdate();
                this._updateDetailBgColor();
            });
            // Если поменялся вьюмод вне списка и вьюха еще не загружена, то ждем события от explorer'a о смене вьюмода
            if (this.viewMode === DetailViewMode.list && this._listLoaded ||
                this.viewMode === DetailViewMode.tile && this._tileLoaded ||
                this.viewMode === DetailViewMode.table ||
                this.viewMode === DetailViewMode.search
            ) {
                this._updateDetailBgColor();
            }
        }

        //region update master
        const newMasterVisibility = View.calcMasterVisibility({
            master: newOptions.master,
            userViewMode: newOptions.userViewMode,
            listConfiguration: newOptions.listConfiguration || this._listConfiguration
        });
        const masterVisibilityChanged = this._masterVisibility !== newMasterVisibility;

        if (masterVisibilityChanged) {
            if (isDetailRootChanged) {
                this._newMasterVisibility = newMasterVisibility;
            } else {
                this._masterVisibility = newMasterVisibility;
            }
        }

        if (newOptions.loading !== this._options.loading) {
            if (newOptions.loading) {
                this._masterLoading = this._masterDataSource?.isLoading();
                this._detailLoading = this._detailDataSource.isLoading();
            } else {
                this._masterLoading = false;
                this._detailLoading = false;
            }
        }
    }

    protected _beforeUnmount(): void {
        this._detailDataSource.unsubscribe('dataLoad', this._onDetailDataLoadCallback);
        this._detailDataSource.destroy();
        this._masterDataSource?.unsubscribe('dataLoad', this._onMasterDataLoadCallback);
        this._masterDataSource?.destroy();
    }

    private _loadViewMode(viewMode: DetailViewMode, useColumns: boolean, loadCallback: Function): void {
        if (this._isViewModeLoaded(viewMode, useColumns)) {
            loadCallback(viewMode);
        } else {
            loadAsync(this._calculateViewByViewMode(viewMode, useColumns)).then(() => {
                loadCallback(viewMode);
            });
        }
    }

    private _setViewMode(value: DetailViewMode): void {
        let result = value;

        // Если задан пользовательский вид отображения, то всегда используем его.
        // Но если хотят переключится в режим DetailViewMode.search, то позволяем,
        // т.к. он обладает наивысшим приоритетом
        if (this._userViewMode && result !== DetailViewMode.search) {
            result = this._userViewMode;
        }

        if (this._viewMode === result) {
            return;
        }
        if (this._isMounted) {
            this._loadViewMode(result,
                this._detailExplorerOptions.useColumns,
                (viewMode: DetailViewMode) => {
                    this._viewMode = viewMode;
                    if (this._newDetailOptions) {
                        this._setDetailOptions(this._newDetailOptions);
                        this._newDetailOptions = null;
                    }
                    this._forceUpdate();
                });
        } else {
            this._viewMode = result;
        }
    }

    /**
     * Постобработчик смены viewMode т.к. explorer может менять его не сразу и нам нужно
     * дождаться {@link _onDetailExplorerChangedViewMode| подтверждения смены viewMode от него}.
     * Также используется в {@link _beforeMount} т.к. на сервере событие о смене viewMode не генерится.
     */
    private _afterViewModeChanged(options: IOptions = this._options): void {
        this._appliedViewMode = this.viewMode;
        this._updateMasterVisibility(options);
        this._updateDetailBgColor(options);
        if (this.viewMode === DetailViewMode.list) {
            this._listLoaded = true;
        } else if (this.viewMode === DetailViewMode.tile) {
            this._tileLoaded = true;
        }
        this._notify('viewModeChanged', [this.viewMode]);
    }

    private _processItemsMetadata(items: RecordSet, options: IOptions = this._options): void {
        if (items) {
            this._applyListConfiguration(options.listConfiguration || getListConfiguration(items), options);
        }
    }

    /**
     * Обновляет состояние контрола в соответствии с переданной настройкой отображения списков
     */
    private _applyListConfiguration(cfg: IBrowserViewConfig, options: IOptions = this._options): void {
        if (!cfg) {
            return;
        } else {
            this._createTemplateControllers(cfg, options);
        }

        this._setViewMode(cfg.settings.clientViewMode);
        this._updateMasterVisibility(options);

        this._notify('listConfigurationChanged', [cfg]);
    }

    /**
     * Обрабатываем смену viewMode в explorer т.к. она может быть асинхронная если после загрузки
     * переключаются в плиточный режим представления, т.к. шаблон и модель для плитки подтягиваются
     * по требованию отдельной функцией
     */
    protected _onDetailExplorerChangedViewMode(): void {
        this._afterViewModeChanged();
    }

    protected _getViewModeForItemTemplate(): string {
        return this.viewMode;
    }

    protected _getListOptions(
        listConfig: Partial<IExplorerOptions> = {},
        listOptions: Partial<IExplorerOptions> = {}
    ): IExplorerOptions {
        return {...listConfig, ...listOptions};
    }

    protected _onMasterItemClick(
        event: SyntheticEvent,
        item: Model,
        clickEvent: unknown,
        columnIndex?: number
    ) {
        return this._notify('masterItemClick', [item, clickEvent, columnIndex]);
    }

    protected _onDetailItemClick(
        event: SyntheticEvent,
        item: Model,
        clickEvent: unknown,
        columnIndex?: number
    ): unknown {
        return this._notify('detailItemClick', [item, clickEvent, columnIndex]);
    }

    protected _createTemplateControllers(cfg: IBrowserViewConfig, options: IOptions): void {
        this._listConfiguration = cfg;
        const templateProperties = {
            imageProperty: options.detail.imageProperty,
            gradientColorProperty: options.detail.gradientColorProperty,
            descriptionProperty: options.detail.descriptionProperty
        };
        this._tileCfg = new TileController({
            listConfiguration: this._listConfiguration,
            templateProperties
        });
        this._listCfg = new ListController({
            listConfiguration: this._listConfiguration,
            templateProperties
        });
        this._tableCfg = new TableController({
            listConfiguration: this._listConfiguration,
            templateProperties
        });
        this._columns = this._getPatchedColumns(this._columns);
    }

    protected _getImageViewMode(viewMode: DetailViewMode): string {
        switch (viewMode) {
            case DetailViewMode.search:
            case DetailViewMode.table:
                return this._tableCfg.imageViewMode;
            case DetailViewMode.tile:
                return this._tileCfg.imageViewMode;
            case DetailViewMode.list:
            default:
                return this._listCfg.imageViewMode;
        }
    }

    protected _getNodeImageViewMode(viewMode: DetailViewMode): string {
        switch (viewMode) {
            case DetailViewMode.search:
            case DetailViewMode.table:
                return this._tableCfg.nodeImageViewMode;
            case DetailViewMode.tile:
                return this._tileCfg.nodeImageViewMode;
            case DetailViewMode.list:
            default:
                return this._listCfg.imageViewMode;
        }
    }

    protected _getImagePosition(viewMode: DetailViewMode): string {
        switch (viewMode) {
            case DetailViewMode.search:
            case DetailViewMode.table:
                return null;
            case DetailViewMode.tile:
                return this._tileCfg.imagePosition;
            case DetailViewMode.list:
            default:
                return this._listCfg.imagePosition;
        }
    }

    protected _getPatchedColumns(columns: TColumns): TColumns {
        let newColumns = columns;
        if (columns) {
            newColumns = object.clone(columns);
            newColumns.forEach((column) => {
                const templateOptions = column.templateOptions || {};
                templateOptions.tableCfg = this._tableCfg;
                templateOptions.imageViewMode = this._tableCfg.imageViewMode;
                column.templateOptions = templateOptions;
            });
        }
        return newColumns;
    }

    //endregion

    //region 🗘 update state
    /**
     * Обновляет текущее состояние контрола в соответствии с переданными опциями
     */
    private _initState(options: IOptions): void {
        this._userViewMode = options.userViewMode;
        this._appliedViewMode = options.userViewMode;
        const listsConfigs = this._dataContext.listsConfigs;
        this._detailExplorerOptions = this._getListOptions(listsConfigs.detail, options.detail);
        this._masterExplorerOptions = this._getListOptions(listsConfigs.master, options.master);
        this._columns = this._detailExplorerOptions.columns;
        this._detailDataSource = listsConfigs.detail.sourceController;
        this._detailDataSource.subscribe('dataLoad', this._onDetailDataLoadCallback);
        this._masterDataSource = listsConfigs.master?.sourceController;
        this._masterDataSource?.subscribe('dataLoad', this._onMasterDataLoadCallback);
        if (options.listConfiguration) {
            this._createTemplateControllers(options.listConfiguration, options);
        }
        this._updateMasterVisibility(options);
    }

    protected _onMasterDataLoadCallback(event): Promise<void> | void {
        if (this._detailRootChanged && this._detailDataSource.isLoading()) {
            event.setResult(new Promise((resolve) => {
                this._masterDataLoadResolver = resolve;
            }));
        }
        this._detailRootChanged = false;
    }

    protected _getDetailBreadCrumbsVisibility(detailOptions: IDetailOptions): string {
        if (detailOptions.breadcrumbsVisibility) {
            return detailOptions.breadcrumbsVisibility;
        } else {
            return (this._masterVisibility === this._masterVisibilityEnum.visible ||
            (this._appliedViewMode === this._viewModeEnum.search)
                ? 'hidden' : 'visible');
        }
    }

    /**
     * Обновляет видимость master-колонки на основании опций и текущей конфигурации представления.
     * Если конфигурация не задана, то видимость вычисляется на основании опций, в противном
     * случае на основании конфигурации.
     */
    private _updateMasterVisibility(options: IOptions = this._options): void {
        // В режиме поиска не обновляем видимость мастера, т.к. если он был, то должен остаться
        // если нет, то нет
        if (this._appliedViewMode === DetailViewMode.search) {
            return;
        }

        this._masterVisibility = View.calcMasterVisibility({
            master: options.master,
            userViewMode: this._appliedViewMode,
            listConfiguration: this._listConfiguration
        });
    }

    private _updateDetailBgColor(options: IOptions = this._options): void {
        // Для таблицы и режима поиска (по сути та же таблица) фон должен быть белый
        if (!options.detail.hasOwnProperty('contrastBackground')) {
            if (this.viewMode === DetailViewMode.search || this.viewMode === DetailViewMode.table) {
                this._detailBgColor = DEFAULT_BACKGROUND_COLOR;
            } else {
                this._detailBgColor = options.detail.backgroundColor || DEFAULT_BACKGROUND_COLOR;
            }
            this._updateContrastBackground();
        } else {
            this._contrastBackground = options.detail.contrastBackground;
            this._detailBgColor = DEFAULT_BACKGROUND_COLOR;
        }
    }

    private _updateContrastBackground(): void {
        this._contrastBackground = this.viewMode !== DetailViewMode.tile && this.viewMode !== DetailViewMode.list;
    }

    //endregion

    //region public methods
    /**
     * Вызывает перезагрузку данных в detail-колонке
     */
    reload(): Promise<RecordSet> {
        const detailExplorer = this._children.detailList;
        return detailExplorer.reload.apply(detailExplorer, arguments);
    }

    // нужно уметь реагировать на результат выполнения команд самостоятельно.
    reloadMaster(): Promise<RecordSet> {
        if (this._masterVisibility === MasterVisibilityEnum.visible) {
            const masterExplorer = this._children.masterList;
            return masterExplorer.reload.apply(masterExplorer, arguments);
        }
    }

    reloadItem(key: TKey, options: IReloadItemOptions = {}): Promise<Model | RecordSet> {
        return this._children.detailList.reloadItem(key, options);
    }

    moveItemsWithDialog(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItemsWithDialog.apply(detailExplorer, arguments);
    }

    moveItems(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItems.apply(detailExplorer, arguments);
    }

    moveItemUp(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItemUp.apply(detailExplorer, arguments);
    }

    moveItemDown(): unknown {
        const detailExplorer = this._children.detailList;
        return detailExplorer.moveItemDown.apply(detailExplorer, arguments);
    }

    //endregion

    //region expandedCompositeTree
    protected _isExpandedCompositeTreeMode(listConfiguration: unknown, viewMode: DetailViewMode): boolean {
        if (listConfiguration && viewMode) {
            const nodesPosition = listConfiguration[viewMode]?.node?.position;
            return nodesPosition === NodesPosition.composite;
        }
        return false;
    }

    protected _changeActiveElement(activeElement: TKey): void {
        this._activeElement = activeElement;
        this._children.detailList.scrollToItem(activeElement, 'top', true);
    }

    protected _detailActiveElementChanged(event: unknown, activeElement: TKey): void {
        this._activeElement = activeElement;
    }
    //endregion expandedCompositeTree

    //region base control overrides
    protected _notify(eventName: string, args?: unknown[], options?: { bubbling?: boolean }): unknown {
        if (!this._isMounted) {
            return;
        }

        return super._notify(eventName, args, options);
    }

    static defaultProps: Partial<IOptions> = {
        master: {
            visibility: MasterVisibilityEnum.hidden
        },
        detail: {
            compositeItemTemplate: 'Controls/list:ItemTemplate'
        }
    };

    //endregion

    //region • static utils

    static calcMasterVisibility(options: Partial<IOptions>): MasterVisibilityEnum {
        if (options.master?.visibility) {
            return options.master.visibility;
        }

        if (options.listConfiguration && options.userViewMode) {
            const nodesPosition = options.listConfiguration[options.userViewMode]?.node?.position;
            return nodesPosition === NodesPosition.left
                ? MasterVisibilityEnum.visible
                : MasterVisibilityEnum.hidden;
        }

        return MasterVisibilityEnum.hidden;
    }

    //endregion
    static contextTypes(): object {
        return {
            dataContext
        };
    }
}
