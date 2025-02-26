// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_explorer/View/View';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as cInstance from 'Core/core-instance';
import {EventUtils} from 'UI/Events';
import { addPageDeps } from 'UICommon/Deps';
import * as randomId from 'Core/helpers/Number/randomId';
import {constants} from 'Env/Env';
import {Logger} from 'UI/Utils';
import {descriptor, Model} from 'Types/entity';
import {IItemPadding, IList, IReloadItemOptions, ListView} from 'Controls/list';
import {SingleColumnStrategy, MultiColumnStrategy} from 'Controls/marker';
import {isEqual} from 'Types/object';
import {CrudEntityKey, DataSet, ICrudPlus, LOCAL_MOVE_POSITION} from 'Types/source';
import {
    IBasePageSourceConfig, IBaseSourceConfig,
    IDraggableOptions, IFilterOptions,
    IHierarchyOptions,
    INavigationOptions,
    INavigationOptionValue,
    INavigationPageSourceConfig,
    ISelectionObject, ISortingOptions, ISourceOptions,
    TKey,
    INavigationPositionSourceConfig, TTextTransform
} from 'Controls/interface';
import {JS_SELECTORS as EDIT_IN_PLACE_JS_SELECTORS} from 'Controls/editInPlace';
import {RecordSet} from 'Types/collection';
import {NewSourceController, Path} from 'Controls/dataSource';
import {SearchView, SearchViewTable} from 'Controls/searchBreadcrumbsGrid';
import {TreeGridView, TreeGridViewTable } from 'Controls/treeGrid';
import {SyntheticEvent} from 'UI/Vdom';
import {IDragObject} from 'Controls/_dragnDrop/Container';
import {ItemsEntity} from 'Controls/dragnDrop';
import {TBreadcrumbsVisibility, TExplorerViewMode} from 'Controls/_explorer/interface/IExplorer';
import {TreeControl} from 'Controls/tree';
import {IEditableList} from 'Controls/list';
import 'css!Controls/explorer';
import { isFullGridSupport } from 'Controls/display';
import PathController from 'Controls/_explorer/PathController';
import {Object as EventObject} from 'Env/Event';
import {IColumn, IGridControl, IHeaderCell} from 'Controls/grid';
import { executeSyncOrAsync } from 'UICommon/Deps';
import {getHeaderVisibility} from './utils';

const HOT_KEYS = {
    _backByPath: constants.key.backspace
};
const ITEM_TYPES = {
    node: true,
    hiddenNode: false,
    leaf: null
};
const DEFAULT_VIEW_MODE = 'table';

// Тип, описывающий возможные внутренние значения viewMode
type TInnerViewMode = TExplorerViewMode | 'columns';

const VIEW_NAMES = {
    search: SearchView,
    tile: null,
    table: TreeGridView,
    list: ListView,
    columns: null
};

const ITEMS_SELECTOR: {[k in TInnerViewMode]: string} = {
    columns: null,
    list: '.controls-ListView__itemV',
    tile: '.controls-ListView__itemV',
    table: '.controls-ListView__itemV',
    search: '.controls-ListView__itemV'
};

const MARKER_STRATEGY = {
    list: SingleColumnStrategy,
    tile: SingleColumnStrategy,
    table: SingleColumnStrategy,
    columns: MultiColumnStrategy
};

const ITEM_GETTER = {
    list: undefined,
    columns: undefined
};

const VIEW_TABLE_NAMES = {
    search: SearchViewTable,
    tile: null,
    table: TreeGridViewTable,
    list: ListView,
    columns: null
};
const VIEW_MODEL_CONSTRUCTORS = {
    search: 'Controls/searchBreadcrumbsGrid:SearchGridCollection',
    tile: null,
    table: 'Controls/treeGrid:TreeGridCollection',
    list: 'Controls/treeGrid:TreeGridCollection',
    columns: null
};

const EXPLORER_CONSTANTS = {
    DEFAULT_VIEW_MODE,
    ITEM_TYPES,
    VIEW_NAMES,
    VIEW_MODEL_CONSTRUCTORS
};

type IEditableListOptions = IEditableList['_options'];

interface IExplorerOptions
    extends
        IControlOptions,
        IHierarchyOptions,
        IDraggableOptions,
        IList,
        IEditableListOptions,
        INavigationOptions<IBasePageSourceConfig>,
        IGridControl,
        ISourceOptions,
        IFilterOptions,
        ISortingOptions {
    nodeTypeProperty: string;
    root?: TKey;

    viewMode?: TExplorerViewMode;
    searchNavigationMode?: string;
    displayMode?: string;
    itemTemplate?: TemplateFunction;
    items?: RecordSet;
    itemOpenHandler?: Function;
    searchValue?: string;
    searchStartingWith?: 'root' | 'current';
    sourceController?: NewSourceController;
    expandByItemClick?: boolean;
    /**
     * Задает видимость крошек и кнопки назад. Если explorer их выводить не должен, то нужно указать
     * 'hidden'.
     */
    breadcrumbsVisibility?: TBreadcrumbsVisibility;
    /**
     * Задает режим вывода строки с хлебными крошками в результатах поиска
     *  * row - все ячейки строки с хлебными крошками объединяются в одну ячейку в которой выводятся хлебные крошки.
     *  * cell - ячейки строки с хлебными крошками не объединяются, выводятся в соответствии с заданной конфигурацией колонок. При таком режиме прикладной разработчик может задать кастомное содержимое для ячеек строки с хлебными крошками.
     */
    breadCrumbsMode?: 'row' | 'cell';
    useColumns?: boolean;
    groupTemplate?: string | TemplateFunction;
    /**
     * Кастомный шаблон, который выводится перед заголовком кнопки назад в хлебных крошках.
     * В шаблон передается опция item в которой содержится запись хлебной крошки.
     */
    backButtonBeforeCaptionTemplate?: string | TemplateFunction;
    /**
     * Вместе с установкой преобразования текста, меняется так же расстояние между буквами.
     */
    backButtonTextTransform?: TTextTransform;
    /**
     * Источник данных для кнопки навигационного меню, которая отображается
     * в блоке с хлебными крошками.
     */
    pathButtonSource?: ICrudPlus;
}

interface IMarkedKeysStore {
    [p: string]: { markedKey: TKey, parent?: TKey, cursorPosition?: unknown };
}

export default class Explorer extends Control<IExplorerOptions> {
    //region protected fields
    protected _template: TemplateFunction = template;
    // не видит WebStorm _options у базового контрола
    protected _options: IExplorerOptions;
    protected _viewName: string;
    protected _markerStrategy: string;
    protected _viewMode: TExplorerViewMode;
    protected _viewModelConstructor: string;
    private _navigation: INavigationOptionValue<any>;
    protected _itemTemplate: TemplateFunction;
    protected _groupTemplate: string | TemplateFunction;
    protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;
    protected _backgroundStyle: string;
    protected _itemsReadyCallback: Function;
    protected _itemsSetCallback: Function;
    protected _itemPadding: object;
    protected _dragOnBreadCrumbs: boolean = false;
    protected _needSetMarkerCallback: (item: Model, domEvent: Event) => boolean;
    protected _breadCrumbsDragHighlighter: Function;
    protected _canStartDragNDrop: Function;
    /**
     * Флаг идентифицирует нужно или нет пересоздавать коллекцию для списка.
     * Прокидывается в TreeControl (BaseControl).
     */
    protected _recreateCollection: boolean = false;

    /**
     * Текущее применяемое значение строки поиска
     */
    protected _searchValue: string = '';
    /**
     * Новое значение строки поиска, которое будет применено после загрузки данных и
     * смены viewMode
     */
    private _newSearchValue: string;

    /**
     * Текущая применяемая конфигурация колонок
     */
    protected _columns: IColumn[];
    /**
     * Новая конфигурация колонок, которую мы задерживаем до выполнения асинхронной операции.
     */
    protected _newColumns: IColumn[];

    /**
     * Текущая применяемая конфигурация заголовков колонок
     */
    protected _header: IHeaderCell[];
    /**
     * Новая конфигурация заголовков колонок, которую мы задерживаем до выполнения асинхронной операции.
     */
    protected _newHeader: IHeaderCell[];
    /**
     * Конфигурация видимости заголовка, которую мы задерживаем до выполнения
     * асинхронной операции
     */
    protected _headerVisibility: string;

    protected _itemActionsPosition: string;
    protected _searchInitialBreadCrumbsMode: 'row' | 'cell';

    protected _children: {
        treeControl: TreeControl,
        pathController: PathController
    };

    protected _itemsSelector: string = '.controls-ListView__itemV';
    protected _itemContainerGetter: string;
    //endregion

    //region private fields
    /**
     * Идентификатор узла данные которого отображаются в текущий момент.
     */
    private _root: TKey = null;
    /**
     * Идентификатор самого верхнего корневого элемента.
     * Вычисляется на основании хлебных крошек либо на основании текущего root
     * если хлебные крошки отсутствуют.
     */
    private _topRoot: TKey;
    private _hoveredBreadCrumb: string;
    private _dragControlId: string;
    private _markerForRestoredScroll: TKey;
    private _resetScrollAfterViewModeChange: boolean = false;
    private _isMounted: boolean = false;
    private _restoredMarkedKeys: IMarkedKeysStore = {};
    private _potentialMarkedKey: TKey;
    private _newItemPadding: IItemPadding;
    private _newItemActionsPosition: string;
    private _newItemTemplate: TemplateFunction;
    private _newBackgroundStyle: string;
    private _isGoingBack: boolean;
    // Восстановленное значение курсора при возврате назад по хлебным крошкам
    private _restoredCursor: unknown;
    private _pendingViewMode: TExplorerViewMode;

    private _items: RecordSet;
    // Флаг идентифицирует что идет проваливание в папку. Именно проваливание, а не возврат по крошкам
    private _isGoingFront: boolean;
    //endregion

    protected _beforeMount(cfg: IExplorerOptions): Promise<void> | void {
        if (cfg.itemPadding) {
            this._itemPadding = cfg.itemPadding;
        }
        if (cfg.itemTemplate) {
            this._itemTemplate = cfg.itemTemplate;
        }
        if (cfg.groupTemplate) {
            this._groupTemplate = cfg.groupTemplate;
        }
        if (cfg.backgroundStyle) {
            this._backgroundStyle = cfg.backgroundStyle;
        }
        if (cfg.header) {
            // нужно проставить и _header и _newHeader иначе здесь ниже в _setViewMode
            // при _applyNewVisualOptions проставится this._newHeader в _header, т.к.
            // они сейчас сравниваются на равенство
            // TODO: Нужно отрефакторить эту логику. Сейчас заголовок нужен только
            //  при viewMode === 'search' || 'table' + на него завязана проверка видимости
            //  шапки с хлебными крошками в PathWrapper, но эту проверку можно также на viewMode сделать
            this._newHeader = this._header = cfg.viewMode === 'tile' ? undefined : cfg.header;
        }
        if (cfg.columns) {
            this._columns = this._newColumns = cfg.columns;
        }
        if (cfg.searchValue) {
            this._searchValue = cfg.searchValue;
        }

        this._itemActionsPosition = cfg.itemActionsPosition;

        this._itemsReadyCallback = this._itemsReadyCallbackFunc.bind(this);
        this._itemsSetCallback = this._itemsSetCallbackFunc.bind(this);
        this._canStartDragNDrop = this._canStartDragNDropFunc.bind(this);
        this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);
        this._needSetMarkerCallback = (item: Model, domEvent: Event): boolean => {
            return !!(domEvent.target as HTMLElement).closest('.js-controls-ListView__checkbox')
                || item instanceof Array || item.get(this._options.nodeProperty) !== ITEM_TYPES.node;
        };
        this._onCollectionChange = this._onCollectionChange.bind(this);

        this._dragControlId = cfg.dragControlId || randomId();
        this._navigation = cfg.navigation;

        const root = this._getRoot(cfg.root);
        this._headerVisibility = getHeaderVisibility(
            root,
            this._topRoot,
            cfg.header,
            cfg.headerVisibility,
            cfg.breadcrumbsVisibility
        );

        // TODO: для 20.5100. в 20.6000 можно удалить
        if (cfg.displayMode) {
            Logger.error(`${this._moduleName}: Для задания многоуровневых хлебных крошек вместо displayMode используйте опцию breadcrumbsDisplayMode`, this);
        }

        // Это нужно для попадания стилей плитки в bundle на сервере
        // https://online.sbis.ru/opendoc.html?guid=f9cf5faa-15cf-4286-9721-a2e4439c0b5d
        if (cfg.viewMode === 'tile') {
            addPageDeps(['css!Controls/tile']);
        } else if (cfg.viewMode === 'list' && cfg.useColumns) {
            addPageDeps(['css!Controls/columns']);
        }

        return this._setViewMode(cfg.viewMode, cfg);
    }

    protected _afterMount(): void {
        this._isMounted = true;
        this._notify('register', ['rootChanged', this, this._setRootOnBreadCrumbsClick.bind(this)], {bubbling: true});
    }

    protected _beforeUpdate(cfg: IExplorerOptions): void {
        const isViewModeChanged = cfg.viewMode !== this._options.viewMode;
        // Проверяем именно root в опциях
        // https://online.sbis.ru/opendoc.html?guid=4b67d75e-1770-4e79-9629-d37ee767203b
        const isRootChanged = cfg.root !== this._options.root;

        // Нужно пересоздавать коллекцию если viewMode меняют со списка на таблицу.
        // Т.к. у списка и таблицы заданы одинаковые коллекции, то изменение набора колонок
        // с прикладной стороны в режиме list не приводит к прокидыванию новых колонок в модель
        // и в итоге таблица разъезжается при переключении в режим таблицы
        this._recreateCollection = this._needRecreateCollection(this._options.viewMode, cfg.viewMode, cfg.useColumns);

        // Мы не должны ставить маркер до проваливания, т.к. это лишняя синхронизация.
        // Но если отменили проваливание, то нужно поставить маркер.
        if (this._potentialMarkedKey !== undefined && !isRootChanged) {
            this._children.treeControl.setMarkedKey(this._potentialMarkedKey);
        }
        if (!this._isGoingBack) {
            this._potentialMarkedKey = undefined;
        }

        const isSourceControllerLoading = cfg.sourceController && cfg.sourceController.isLoading();
        this._resetScrollAfterViewModeChange = isViewModeChanged && !isRootChanged;
        // Видимость заголовка зависит непосредственно от рута и от данных в нем.
        // Поэтому при смене рута мы не можем менять видимость прямо тут, нужно дождаться получения данных
        // иначе перерисовка может быть в два этапа. Например, показываем пустые результаты поиска в режиме
        // searchStartingWith === 'root', после сбрасываем поиск и возвращаем root в предыдущую папку после чего
        // этот код покажет заголовок и только после получения данных они отрисуются
        if (!isRootChanged) {
            this._headerVisibility = getHeaderVisibility(
                this._getRoot(cfg.root),
                this._topRoot,
                cfg.header,
                cfg.headerVisibility,
                cfg.breadcrumbsVisibility
            );
        }

        if (!isEqual(cfg.itemPadding, this._options.itemPadding)) {
            this._newItemPadding = cfg.itemPadding;
        }

        if (cfg.itemTemplate !== this._options.itemTemplate) {
            this._newItemTemplate = cfg.itemTemplate;
        }

        if (cfg.backgroundStyle !== this._options.backgroundStyle) {
            this._newBackgroundStyle = cfg.backgroundStyle;
        }

        if (cfg.header !== this._options.header || isViewModeChanged) {
            this._newHeader = cfg.viewMode === 'tile' ? undefined : cfg.header;
        }

        if (cfg.columns !== this._options.columns) {
            this._newColumns = cfg.columns;
        }

        if (cfg.searchValue !== this._options.searchValue) {
            this._newSearchValue = cfg.searchValue || '';
        }

        if (cfg.itemActionsPosition !== this._options.itemActionsPosition) {
            /* Нужно задерживать itemActionsPosition, потому что добавляется дополнительная колонка в гриде
               Если сменить таблицу на плитку, то на время загрузки вьюхи таблица разъедется
            */
            this._newItemActionsPosition = cfg.itemActionsPosition;
        }

        const navigationChanged = !isEqual(cfg.navigation, this._options.navigation);
        if (navigationChanged) {
            this._navigation = cfg.navigation;
        }

        if ((isViewModeChanged && isRootChanged && !cfg.sourceController) ||
            this._pendingViewMode && cfg.viewMode !== this._pendingViewMode) {
            // Если меняется и root и viewMode, не меняем режим отображения сразу,
            // потому что тогда мы перерисуем explorer в новом режиме отображения
            // со старыми записями, а после загрузки новых получим еще одну перерисовку.
            // Вместо этого запомним, какой режим отображения от нас хотят, и проставим
            // его, когда новые записи будут установлены в модель (itemsSetCallback).
            this._setPendingViewMode(cfg.viewMode, cfg);
        } else if (isViewModeChanged && !this._pendingViewMode) {
            // Также отложенно необходимо устанавливать viewMode, если при переходе с viewMode === "search" на "table"
            // или "tile" будет перезагрузка. Этот код нужен до тех пор, пока не будут спускаться данные сверху-вниз.
            // https://online.sbis.ru/opendoc.html?guid=f90c96e6-032c-404c-94df-cc1b515133d6
            const filterChanged = !isEqual(cfg.filter, this._options.filter);
            const recreateSource = cfg.source !== this._options.source ||
                (isSourceControllerLoading && this._options.viewMode === 'search');
            const sortingChanged = !isEqual(cfg.sorting, this._options.sorting);
            if ((filterChanged || recreateSource || sortingChanged || navigationChanged) && !cfg.sourceController) {
                this._setPendingViewMode(cfg.viewMode, cfg);
            } else {
                this._checkedChangeViewMode(cfg.viewMode, cfg);
            }
        } else if (!isViewModeChanged &&
            this._pendingViewMode &&
            cfg.viewMode === this._pendingViewMode &&
            cfg.sourceController) {
            // https://online.sbis.ru/opendoc.html?guid=7d20eb84-51d7-4012-8943-1d4aaabf7afe
            if (!VIEW_MODEL_CONSTRUCTORS[this._pendingViewMode]) {
                // Делаю синхронным установку viewMode, что требуется для отрисовки без моргания, когда библиотека
                // Controls/columns или Controls/treeTile уже загружены HOC'ом (например, newBrowser'ом)
                // https://online.sbis.ru/opendoc.html?guid=88261118-1965-41ec-ac73-b0a32caa26ed
                const res = this._loadTileViewMode();
                if (res instanceof Promise) {
                    res.then(() => {
                        this._setViewModeSync(this._pendingViewMode, cfg);
                    });
                } else {
                    this._setViewModeSync(this._pendingViewMode, cfg);
                }
            } else {
                this._setViewModeSync(this._pendingViewMode, cfg);
            }
        } else if (VIEW_MODEL_CONSTRUCTORS[cfg.viewMode]) {
            // Применяем опции только если уже загружен текущий viewMode, иначе в момент попадания в данную точку
            // мы уже загружаем viewMode и _applyNewVisualOptions будет вызван в каллбеке после его загрузки
            // https://online.sbis.ru/opendoc.html?guid=2785c4f9-f339-4536-b531-b59e0890d894
            this._applyNewVisualOptions();
        }
    }

    protected _beforeRender(): void {
        // Сбрасываем скролл при режима отображения
        // https://online.sbis.ru/opendoc.html?guid=d4099117-ef37-4cd6-9742-a7a921c4aca3
        if (this._resetScrollAfterViewModeChange) {
            this._notify('doScroll', ['top'], {bubbling: true});
            this._resetScrollAfterViewModeChange = false;
        }
    }

    protected _afterRender(): void {
        if (this._markerForRestoredScroll !== null) {
            this.scrollToItem(this._markerForRestoredScroll);
            this._markerForRestoredScroll = null;
        }

        // Сбрасываем флаг, который прокидывается в TreeControl иначе модель будет постоянно пересоздаваться
        if (this._recreateCollection) {
            this._recreateCollection = false;
        }
    }

    protected _beforeUnmount(): void {
        this._unsubscribeOnCollectionChange();
        this._notify('unregister', ['rootChanged', this], {bubbling: true});
    }

    protected _documentDragEnd(event: SyntheticEvent, dragObject: IDragObject): void {
        if (this._hoveredBreadCrumb !== undefined) {
            this._notify('dragEnd', [dragObject.entity, this._hoveredBreadCrumb, 'on']);
        }
        this._dragOnBreadCrumbs = false;
    }

    protected _documentDragStart(event: SyntheticEvent, dragObject: IDragObject<ItemsEntity>): void {
        // TODO: Sometimes at the end of dnd, the parameter is not reset. Will be fixed by:
        //  https://online.sbis.ru/opendoc.html?guid=85cea965-2aa6-4f1b-b2a3-1f0d65477687
        this._hoveredBreadCrumb = undefined;

        if (
            this._options.itemsDragNDrop &&
            this._options.parentProperty &&
            cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity') &&
            dragObject.entity.dragControlId === this._dragControlId
        ) {
            // Принудительно показываем "домик" в хлебных крошках если находимся не в корневом узле
            // или не все перетаскиваемые итемы лежат в корне
            this._dragOnBreadCrumbs =
                this._getRoot(this._options.root) !== this._topRoot ||
                !this._dragItemsFromRoot(dragObject.entity.getItems());
        }
    }

    protected _hoveredCrumbChanged(event: SyntheticEvent, item: Model): void {
        this._hoveredBreadCrumb = item ? item.getKey() : undefined;

        // If you change hovered bread crumb, must be called installed in the breadcrumbs highlighter,
        // but is not called, because the template has no reactive properties.
        this._forceUpdate();
    }

    protected _onCollectionChange(
        event: EventObject,
        action: string,
        newItems: unknown[],
        newItemsIndex: number,
        oldItems: unknown[],
        oldItemsIndex: number,
        reason: string
    ): void {
        // После получения данных обновим видимость заголовка т.к. мы не можем это сделать на
        // beforeUpdate в следствии того, что между сменой root и получением данных есть задержка
        // и в противном случае перерисовка будет в два этапа, сначала обновится видимость заголовка,
        // а потом придут и отрисуются данные
        if (reason === 'assign') {
            this._updateHeaderVisibility();
        }
    }

    protected _updateHeaderVisibility(): void {
        const curRoot = this._options.sourceController
            ? this._options.sourceController.getRoot()
            : this._getRoot(this._options.root);

        this._headerVisibility = getHeaderVisibility(
            curRoot,
            this._topRoot,
            this._options.header,
            this._options.headerVisibility,
            this._options.breadcrumbsVisibility
        );
    }

    protected _subscribeOnCollectionChange(): void {
        this._items.subscribe('onCollectionChange', this._onCollectionChange);
    }

    protected _unsubscribeOnCollectionChange(): void {
        if (this._items) {
            this._items.unsubscribe('onCollectionChange', this._onCollectionChange);
        }
    }

    protected _onItemClick(
        event: SyntheticEvent,
        item: Model|Model[],
        clickEvent: SyntheticEvent,
        columnIndex?: number
    ): boolean {
        if (item instanceof Array) {
            item = item[item.length - 1];
        }

        const res = this._notify('itemClick', [item, clickEvent, columnIndex]) as boolean;
        event.stopPropagation();

        const changeRoot = () => {
            // Перед проваливанием запомним значение курсора записи, т.к. в крошках могут его не прислать
            const currRootInfo = this._restoredMarkedKeys[this._getRoot(this._options.root)];
            if (currRootInfo && this._isCursorNavigation(this._navigation)) {
                const cursorValue = this._getCursorValue(item as Model, this._navigation);
                if (cursorValue) {
                    currRootInfo.cursorPosition = cursorValue;
                }
            }

            // При проваливании нужно сбросить восстановленное значение курсора
            // иначе данные загрузятся не корректные
            if (
                this._isCursorNavigation(this._navigation) &&
                this._restoredCursor === this._navigation.sourceConfig.position
            ) {
                this._navigation.sourceConfig.position = null;
            }

            this._setRoot(item.getKey());
            // При search не должны сбрасывать маркер, так как он встанет на папку
            if (this._options.searchNavigationMode !== 'expand') {
                this._isGoingFront = true;
            }
        };

        // Не нужно проваливаться в папку, если должно начаться ее редактирование.
        // TODO: После перехода на новую схему редактирования это должен решать baseControl или treeControl.
        //    в данной реализации получается, что в дереве с возможностью редактирования не получится
        //    развернуть узел кликом по нему (expandByItemClick).
        //    https://online.sbis.ru/opendoc.html?guid=f91b2f96-d6e7-45d0-b929-a0030f0a2788
        const isNodeEditable = () => {
            const hasEditOnClick = !!this._options.editingConfig && !!this._options.editingConfig.editOnClick;
            return hasEditOnClick && !clickEvent.target.closest(`.${EDIT_IN_PLACE_JS_SELECTORS.NOT_EDITABLE}`);
        };

        const shouldHandleClick = res !== false && !isNodeEditable();

        if (shouldHandleClick) {
            const itemType = item.get(this._options.nodeProperty);
            const isGroupNode = this._options.nodeTypeProperty ?
                                item.get(this._options.nodeTypeProperty) === 'group' : false;
            const isSearchMode = this._viewMode === 'search';

            // Проваливание возможно только в узел (ITEM_TYPES.node).
            // Проваливание невозможно, если по клику следует развернуть узел/скрытый узел.
            if (
                (!isSearchMode && this._options.expandByItemClick && itemType !== ITEM_TYPES.leaf) ||
                (itemType !== ITEM_TYPES.node) || isGroupNode
            ) {
                return res;
            }

            // Если в списке запущено редактирование, то проваливаемся только после успешного завершения.
            if (!this._children.treeControl.isEditing()) {
                changeRoot();
            } else {
                this.commitEdit().then((result) => {
                    if (!(result && result.canceled)) {
                        changeRoot();
                    }
                    return result;
                });
            }

            // Проваливание в папку и попытка проваливания в папку не должны вызывать разворот узла.
            // Мы не можем провалиться в папку, пока на другом элементе списка запущено редактирование.
            return false;
        }

        return res;
    }

    /**
     * Обрабатываем изменение хлебных крошек от внутреннего DataContainer.
     * Сейчас хлебные крошки используются:
     *  * для вычисления topRoot
     *  * для вычисления id записи, которая должна быть помечена при возврате
     *  назад по хлебным крошкам.
     *
     * TODO: нужно подумать над вариантами избавления от breadcrumbs для этого функционала
     *  https://online.sbis.ru/opendoc.html?guid=b08d48ac-b6c2-4278-b48e-cb58618c7ffd
     */
    protected _onBreadcrumbsChanged(event: SyntheticEvent, breadcrumbs: Path): void {
        if (this._isGoingBack) {
            const curRoot = this._getRoot(this._options.root);

            if (this._restoredMarkedKeys[curRoot]) {
                this._potentialMarkedKey = this._restoredMarkedKeys[curRoot].markedKey;
            }
        }

        const parentProperty = this._options.parentProperty;
        this._topRoot = this._getTopRoot(breadcrumbs, parentProperty, this._options.root);

        // На основании новых данных заполним хранилище в котором хранятся идентификаторы
        // помеченных записей для каждого корня
        this._initMarkedKeys(
            this._getRoot(this._options.root),
            this._topRoot,
            breadcrumbs,
            parentProperty,
            this._options.navigation
        );
    }

    protected _onBreadCrumbsClick(event: SyntheticEvent, item: Model): void {
        const newRoot = item.getKey();
        this._setRootOnBreadCrumbsClick(newRoot);

    }

    private _setRootOnBreadCrumbsClick(root: TKey): void {
        const rootChanged = this._setRoot(root);

        // Если смену root отменили, то и делать ничего не надо, т.к.
        // остаемся в текущей папке
        if (rootChanged === false) {
            return;
        }

        this._isGoingBack = true;

        // При переходе назад нужно проставить сохраненный маркер для этого корня.
        // По факту он конечно сейчас не проставится, но это вызовет событие об изменении
        // markerKey и если у прикладника был bind, то это обновит значение опции и все
        // последующие синхронизации будут идти с актуальным markedKey.
        // В противном случае setMarkedKey в itemsSetCallback может не сработать в этом же
        // цикле синхронизации если сверху был передан markedKey !== undefined. Т.к. в
        // BaseControl метод setMarkedKey проставляет маркер синхронно только если в опциях
        // не указан markedKey
        const markedKey = this._restoredMarkedKeys[root]?.markedKey;
        if (markedKey) {
            this._potentialMarkedKey = markedKey;
            this._children.treeControl.setMarkedKey(markedKey);
        }

        /**
         * Позиция скрола при выходе из папки восстанавливается через скроллирование к отмеченной записи.
         * Чтобы список мог восстановить позицию скрола по отмеченой записи, она должна быть в наборе данных.
         * Чтобы обеспечить ее присутствие, нужно загружать именно ту страницу, на которой она есть.
         * Восстановление работает только при курсорной навигации.
         *
         * Далее какой-то странный сценарий, непонятно на сколько он актуальный:
         * Если в момент возвращения из папки был изменен тип навигации, не нужно восстанавливать, иначе будут
         * смешаны опции курсорной и постраничной навигаций.
         */
        // Если загрузка данных осуществляется снаружи explorer и включена навигация по курсору,
        // то нужно восстановить курсор что бы тот, кто грузит данные сверху выполнил запрос с
        // корректным значением курсора
        if (this._isCursorNavigation(this._options.navigation)) {
            this._restoredCursor = this._restorePositionNavigation(root);
        }
    }

    protected _onExternalKeyDown(event: SyntheticEvent): void {
        this._onExplorerKeyDown(event);
        if (!event.stopped && event._bubbling !== false) {
            this._children.treeControl.handleKeyDown(event);
        }
    }

    protected _onExplorerKeyDown(event: SyntheticEvent): void {
        // Хитрая система обработки нажатия клавиш.
        // В данном случае обрабатываем только Backspace, вызывая наш метод _backByPath,
        // в который первым аргументом придет null (4й аргумент ф-ии keysHandler),
        // а вторым объект события (1й аргумент ф-ии keysHandler)
        EventUtils.keysHandler(event, HOT_KEYS, this, null, false);
    }

    /**
     * Обработчик нажатия клавиши Backspace
     * @see _onExplorerKeyDown
     */
    protected _backByPath(scope: unknown, event: Event): void {
        this._children.pathController.goBack(event);
    }

    protected _onArrowClick(e: SyntheticEvent): void {
        const item = this._children.treeControl.getViewModel().getMarkedItem().getContents();
        this._notifyHandler(e, 'arrowClick', item);
    }

    //region proxy methods to TreeControl
    scrollToItem(key: string | number, position?: string, force?: boolean): void {
        if (this._children.treeControl) {
            this._children.treeControl.scrollToItem(key, position, force);
        }
    }

    reloadItem(key: TKey, options: IReloadItemOptions = {}): Promise<Model | RecordSet> {
        return this._children.treeControl.reloadItem(key, options);
    }

    /**
     * Перезагружает указанные записи списка. Для этого отправляет запрос query-методом
     * со значением текущего фильтра в поле [parentProperty] которого передаются идентификаторы
     * родительских узлов.
     */
    reloadItems(ids: TKey[]): Promise<RecordSet | Error> {
        return this._children.treeControl.reloadItems(ids);
    }

    //region edit
    beginEdit(options: object): Promise<void | {canceled: true}> {
        return this._children.treeControl.beginEdit(options);
    }

    beginAdd(options: object): Promise<void | { canceled: true }> {
        return this._children.treeControl.beginAdd(options);
    }

    cancelEdit(): Promise<void | { canceled: true }> {
        return this._children.treeControl.cancelEdit();
    }

    commitEdit(): Promise<void | { canceled: true }> {
        return this._children.treeControl.commitEdit();
    }
    //endregion

    reload(keepNavigation: boolean = false, sourceConfig?: IBaseSourceConfig): Promise<unknown> {
        return this._children.treeControl.reload(keepNavigation, sourceConfig);
    }

    getItems(): RecordSet {
        return this._children.treeControl.getItems();
    }

    // todo removed or documented by task:
    // https://online.sbis.ru/opendoc.html?guid=24d045ac-851f-40ad-b2ba-ef7f6b0566ac
    toggleExpanded(id: TKey): Promise<unknown> {
        return this._children.treeControl.toggleExpanded(id);
    }

    // region mover

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet> {
        return this._children.treeControl.moveItems(selection, targetKey, position);
    }

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.treeControl.moveItemUp(selectedKey);
    }

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.treeControl.moveItemDown(selectedKey);
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet> {
        return this._children.treeControl.moveItemsWithDialog(selection);
    }

    // endregion mover

    // region remover

    removeItems(selection: ISelectionObject): Promise<string | void> {
        return this._children.treeControl.removeItems(selection);
    }

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<string | void> {
        return this._children.treeControl.removeItemsWithConfirmation(selection);
    }

    // endregion remover

    // TODO удалить по https://online.sbis.ru/opendoc.html?guid=2ad525f0-2b48-4108-9a03-b2f9323ebee2
    _clearSelection(): void {
        this._children.treeControl.clearSelection();
    }

    getMarkedNodeKey(): TKey {
        return this._children.treeControl.getMarkedNodeKey();
    }
    //endregion

    /**
     * Возвращает идентификатор текущего корневого узла
     */
    protected _getRoot(newRoot?: TKey): TKey {
        return typeof newRoot !== 'undefined' ? newRoot : this._root;
    }

    private _dragHighlighter(itemKey: TKey, hasArrow: boolean): string {
        return this._dragOnBreadCrumbs && this._hoveredBreadCrumb === itemKey && itemKey !== 'dots'
            ? 'controls-BreadCrumbsView__dropTarget_' + (hasArrow ? 'withArrow' : 'withoutArrow') : '';
    }

    /**
     * Посылает событие о смене root и возвращает результат обработки этого события
     */
    private _setRoot(root: TKey, dataRoot: TKey = null): boolean {
        let result = true;

        if (!this._options.hasOwnProperty('root')) {
            this._root = root;
        } else {
            // часть механизма простановки маркера вместе с this._needSetMarkerCallback
            // https://online.sbis.ru/opendoc.html?guid=aa51a7c3-7813-4af5-a9ea-eb703ce15e76
            this._potentialMarkedKey = root;
        }

        if (typeof this._options.itemOpenHandler === 'function') {
            this._options.itemOpenHandler(root, this._items, dataRoot);
        }

        if (this._isMounted) {
            result = this._notify('rootChanged', [root]);
        }

        this._forceUpdate();
        return result;
    }

    private _initMarkedKeys(
        root: TKey,
        topRoot: TKey,
        breadcrumbs: Path,
        parentProperty: string,
        navigation: INavigationOptionValue<INavigationPageSourceConfig>
    ): void {

        const store = this._restoredMarkedKeys;

        if (!store[root]) {
            store[root] = {markedKey: null};
        }

        if (!store[topRoot]) {
            store[topRoot] = {markedKey: null};
        }

        // Если хлебных крошек нет, то дальше идти нет смысла
        if (!breadcrumbs?.length) {
            this._restoredMarkedKeys = store;
            return;
        }

        const actualIds = [root + '', topRoot + ''];
        breadcrumbs?.forEach((crumb) => {
            const crumbKey = crumb.getKey();
            const parentKey = crumb.get(parentProperty);

            actualIds.push(crumbKey + '');
            store[crumbKey] = {
                parent: parentKey,
                markedKey: null,
                // В крошке может не быть информации о курсоре, но она могла быть
                // в самой записи в которую провалились
                cursorPosition: store[crumbKey]?.cursorPosition
            };

            if (store[parentKey]) {
                store[parentKey].markedKey = crumbKey;

                if (this._isCursorNavigation(navigation)) {
                    const cursorValue = this._getCursorValue(crumb, navigation);
                    if (cursorValue) {
                        store[parentKey].cursorPosition = cursorValue;
                    }
                }
            }
        });

        // Пробежимся по ключам сформированного store и выкинем
        // все ключи, которых нет в текущих крошках
        Object
            .keys(store)
            .forEach((storeKey) => {
                if (!actualIds.includes(storeKey)) {
                    delete store[storeKey];
                }
            });
        this._restoredMarkedKeys = store;
    }

    private _needRecreateCollection(
        oldViewMode: TExplorerViewMode,
        newViewMode: TExplorerViewMode,
        useColumns: boolean
    ): boolean {
        if (useColumns) {
            return false;
        }

        if (oldViewMode === 'list' && newViewMode === 'table') {
            return true;
        }

        if (oldViewMode === 'table' && newViewMode === 'list') {
            return true;
        }

        return false;
    }

    private _itemsReadyCallbackFunc(items: RecordSet): void {
        if (this._items) {
            this._unsubscribeOnCollectionChange();
        }
        this._items = items;
        this._subscribeOnCollectionChange();
        this._updateHeaderVisibility();
        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    private _itemsSetCallbackFunc(items: RecordSet, newOptions: IExplorerOptions): void {
        if (this._isGoingBack) {
            if (this._potentialMarkedKey) {
                this._children.treeControl.setMarkedKey(this._potentialMarkedKey);
                this._markerForRestoredScroll = this._potentialMarkedKey;
                this._potentialMarkedKey = undefined;

                // Вызывает _forceUpdate иначе у нас может не стрельнуть _afterRender
                // и _markerForRestoredScroll не применится
                this._forceUpdate();
            }

            if (
                this._isCursorNavigation(this._navigation) &&
                this._restoredCursor === this._navigation.sourceConfig.position
            ) {
                this._navigation.sourceConfig.position = null;
            }

            this._isGoingBack = false;
        }

        if (this._isGoingFront) {
            // Проверить. Возможно, больше этот код не нужен.
            // До перевода на наследование работало так:
            // 1. При входе в папку через хлебные крошки маркер контроллер устанавливал новую опцию
            // 2. baseControl стрелял событие markedKeyChanged, контрол-родитель(в кейсе - демка),
            // забиндивший опцию ловил его и менял у себя состояние.
            // 3. Происходил еще один цикл синхронизации, в котором старое и новое значение ключа разные.
            // 4. По иерархии, шло обновление treeControl, который тут устанавливал снова новый ключ
            // маркера - null (в itemsSetCallback от эксплорера).
            // 5. update доходит до BaseControl'a и ключ маркера устанавливается по новым опциям
            // (ключ папки в которую вошли).
            // [ ключ папки -> обновление бинда -> цикл -> treeControl: ключ null (itemsSetCallback) ->
            // baseControl: ключ по бинду ]

            // При проваливании в папку маркер нужно сбрасывать
            this._children.treeControl.setMarkedKey(null);

            // После перехода на наследование, между обновлением treeControl и baseControl разрыва нет, более того,
            // поменялся порядок апдейтов контролов. После перевода на наследование сначала обновляется BaseControl.
            this._isGoingFront = false;
        }

        if (this._pendingViewMode) {
            this._checkedChangeViewMode(this._pendingViewMode, this._options);
            this._pendingViewMode = null;
        }
    }

    private _resolveViewMode(viewMode: TExplorerViewMode, useColumns: boolean): TExplorerViewMode | 'columns' {
        return viewMode === 'list' && useColumns ? 'columns' : viewMode;
    }

    private _setViewConfig(viewMode: TExplorerViewMode, useColumns: boolean): void {
        const resolvedViewMode = this._resolveViewMode(viewMode, useColumns);

        if (isFullGridSupport()) {
            this._viewName = VIEW_NAMES[resolvedViewMode];
        } else {
            this._viewName = VIEW_TABLE_NAMES[resolvedViewMode];
        }

        this._setInitBreadCrumbsMode();
        this._markerStrategy = MARKER_STRATEGY[resolvedViewMode];
        this._viewModelConstructor = VIEW_MODEL_CONSTRUCTORS[resolvedViewMode];
        this._itemContainerGetter = ITEM_GETTER[resolvedViewMode];
        this._itemsSelector = ITEMS_SELECTOR[resolvedViewMode];
    }

    private _setViewModeSync(viewMode: TExplorerViewMode, cfg: IExplorerOptions): void {
        this._viewMode = viewMode;
        this._setViewConfig(this._viewMode, cfg.useColumns);
        this._applyNewVisualOptions();

        if (this._isMounted) {
            this._notify('viewModeChanged', [viewMode]);
        }
    }

    private _setViewMode(viewMode: TExplorerViewMode, cfg: IExplorerOptions): Promise<void> | void {
        if (viewMode === 'search' && cfg.searchStartingWith === 'root') {
            this._updateRootOnViewModeChanged(viewMode, cfg);
        }
        let action: Promise<void> | void;

        const resolvedViewMode = this._resolveViewMode(viewMode, cfg.useColumns);

        if (!VIEW_MODEL_CONSTRUCTORS[resolvedViewMode]) {
            if (resolvedViewMode === 'columns') {
                action = this._loadColumnsViewMode();
            } else {
                action = this._loadTileViewMode();
            }
        } else {
            return this._setViewModeSync(viewMode, cfg);
        }

        if (action instanceof Promise) {
            return action.then(() => {
                this._setViewModeSync(viewMode, cfg);
            });
        }

        return this._setViewModeSync(viewMode, cfg);
    }

    private _applyNewVisualOptions(): void {
        if (this._newItemPadding) {
            this._itemPadding = this._newItemPadding;
            this._newItemPadding = null;
        }
        if (this._newItemTemplate) {
            this._itemTemplate = this._newItemTemplate;
            this._newItemTemplate = null;
        }
        if (this._newBackgroundStyle) {
            this._backgroundStyle = this._newBackgroundStyle;
            this._newBackgroundStyle = null;
        }

        // _newHeader может измениться на undefined при смене с табличного представления
        if (this._newHeader !== this._header) {
            this._header = this._newHeader;
            // Не надо занулять this._newHeader иначе при следующем вызове
            // _applyNewVisualOptions это может вызвать сброс шапки
            /*this._newHeader = null;*/
        }

        if (this._newColumns !== this._columns) {
            this._columns = this._newColumns;
        }

        if (this._newItemActionsPosition) {
            this._itemActionsPosition = this._newItemActionsPosition;
            this._newItemActionsPosition = null;
        }

        if (this._newSearchValue !== undefined) {
            this._searchValue = this._newSearchValue;
            this._newSearchValue = undefined;
        }
    }

    protected _getItemTemplate(
        viewMode: string,
        itemTemplate: TemplateFunction,
        listItemTemplate: TemplateFunction,
        tileItemTemplate: TemplateFunction
    ) {
        if (viewMode === 'tile') {
            return tileItemTemplate;
        } else if (viewMode === 'list') {
            return listItemTemplate || itemTemplate;
        }
        return itemTemplate;
    }

    protected _getEmptyTemplate(
        viewMode: string,
        emptyTemplate: TemplateFunction,
        listEmptyTemplate: TemplateFunction
    ) {
        if (viewMode === 'list' && listEmptyTemplate) {
            return listEmptyTemplate;
        }
        return emptyTemplate;
    }

    /**
     * Возвращает идентификатор самого верхнего известного корневого узла.
     */
    private _getTopRoot(breadcrumbs: Path, parentProperty: string, root: TKey): TKey {
        let result;

        // Если есть хлебные крошки, то получаем top root из них.
        // В противном случае просто возвращаем текущий root
        if (breadcrumbs?.length) {
            result = breadcrumbs[0].get(parentProperty);
        } else {
            result = this._getRoot(root);
        }

        return result;
    }

    /**
     * Вернет true если все перетаскиваемые итемы лежат в корне
     */
    private _dragItemsFromRoot(dragItems: TKey[]): boolean {
        let itemFromRoot = true;

        for (let i = 0; i < dragItems.length; i++) {
            const item = this._items.getRecordById(dragItems[i]);

            if (!item || item.get(this._options.parentProperty) !== this._topRoot) {
                itemFromRoot = false;
                break;
            }
        }

        return itemFromRoot;
    }

    private _loadTileViewMode(): Promise<void> | void {
        return executeSyncOrAsync(['Controls/treeTile'], (tile) => {
            VIEW_NAMES.tile = tile.TreeTileView;
            VIEW_TABLE_NAMES.tile = tile.TreeTileView;
            VIEW_MODEL_CONSTRUCTORS.tile = 'Controls/treeTile:TreeTileCollection';
        });
    }

    private _loadColumnsViewMode(): Promise<void> | void {
        return executeSyncOrAsync(['Controls/columns'], (columns) => {
            VIEW_NAMES.columns = columns.ViewTemplate;
            VIEW_TABLE_NAMES.columns = columns.ViewTemplate;
            ITEM_GETTER.columns = columns.ItemContainerGetter;
            VIEW_MODEL_CONSTRUCTORS.columns = 'Controls/columns:ColumnsCollection';
            ITEMS_SELECTOR.columns = columns.ViewTemplate.itemsSelector;
        });
    }

    private _canStartDragNDropFunc(): boolean {
        return this._viewMode !== 'search';
    }

    private _checkedChangeViewMode(viewMode: TExplorerViewMode, cfg: IExplorerOptions): void {
        Promise.resolve(this._setViewMode(viewMode, cfg)).then(() => { //
            // Обрабатываем searchNavigationMode только после того как
            // проставится setViewMode, т.к. он может проставится асинхронно
            // а код ниже вызывает изменение версии модели что приводит к лишней
            // перерисовке до изменения viewMode
            const isAllExpanded = cfg.expandedItems && cfg.expandedItems[0] === null;
            if (cfg.searchNavigationMode !== 'expand' && !isAllExpanded) {
                this._children.treeControl.resetExpandedItems();
            }
        });
    }

    /**
     * На основании настроек навигации определяет используется ли навигация по курсору.
     */
    private _isCursorNavigation(navigation: INavigationOptionValue<unknown>): boolean {
        return !!navigation && navigation.source === 'position';
    }

    /**
     * Собирает курсор для навигации относительно заданной записи.
     * @param item - запись, для которой нужно "собрать" курсор
     * @param navigation - конфигурация курсорной навигации
     */
    private _getCursorValue(
        item: Model,
        navigation: INavigationOptionValue<INavigationPositionSourceConfig>
    ): unknown[] {

        const position: unknown[] = [];
        const optField = navigation.sourceConfig.field;
        const fields: string[] = (optField instanceof Array) ? optField : [optField];

        let noData = true;
        fields.forEach((field) => {
            const fieldValue = item.get(field);

            position.push(fieldValue);
            noData = noData && fieldValue === undefined;
        });

        // Если все поля курсора undefined, значит курсора нет
        if (noData) {
            return undefined;
        }

        return position;
    }

    /**
     * Восстанавливает значение курсора для курсорной навигации при выходе из папки.
     * Одна из частей механизма сохранения позиции скролла и отмеченной записи
     * при проваливании в папку и выходе назад.
     *
     * @param rootId id узла в который возвращаемся
     */
    private _restorePositionNavigation(rootId: TKey): unknown {
        const rootInfo = this._restoredMarkedKeys[rootId];
        if (!rootInfo) {
            return;
        }

        let cursor;
        if (typeof rootInfo?.cursorPosition !== 'undefined') {
            cursor = rootInfo.cursorPosition;
        } else {
            cursor = this._options._navigation?.sourceConfig?.position;
        }

        this._navigation.sourceConfig.position = cursor || null;
        return cursor;
    }

    private _setPendingViewMode(viewMode: TExplorerViewMode, options: IExplorerOptions): void {
        this._pendingViewMode = viewMode;

        if (viewMode === 'search') {
            this._updateRootOnViewModeChanged(viewMode, options);
        }
    }

    private _updateRootOnViewModeChanged(viewMode: string, options: IExplorerOptions): void {
        if (viewMode === 'search' && options.searchStartingWith === 'root') {
            const currentRoot = this._getRoot(options.root);

            if (this._topRoot !== currentRoot) {
                this._setRoot(this._topRoot, this._topRoot);
            }
        }
    }

    private _setInitBreadCrumbsMode(): void {
        if ('treeControl' in this._children && this._children.treeControl.isColumnScrollVisible()) {
            this._searchInitialBreadCrumbsMode = 'cell';
        } else {
            this._searchInitialBreadCrumbsMode = undefined;
        }
    }

    static _constants: object = EXPLORER_CONSTANTS;

    static getOptionTypes(): object {
        return {
            viewMode: descriptor(String).oneOf([
                'table',
                'search',
                'tile',
                'list'
            ])
        };
    }

    static getDefaultOptions(): object {
        return {
            multiSelectVisibility: 'hidden',
            viewMode: DEFAULT_VIEW_MODE,
            backButtonIconStyle: 'primary',
            backButtonFontColorStyle: 'secondary',
            columnsCount: 1,
            stickyHeader: true,
            stickyResults: true,
            searchStartingWith: 'root',
            showActionButton: false,
            isFullGridSupport: isFullGridSupport(),
            breadCrumbsMode: 'row'
        };
    }
}

Object.defineProperty(Explorer, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Explorer.getDefaultOptions();
    }
});

/**
 * Контрол "Иерархический проводник" позволяет отображать данные из различных источников данных в одном из четырех режимов: плоский список, дерево, плитка и поиск.
 * В режимах отображения "дерево" и "поиск" над контролом отображаются хлебные крошки, используемые для навигации по разделам.
 * В контроле можно включить поведение проваливания в узел, когда при клике по узлу — такой узел становится корнем иерархии.
 * При этом контрол будет отображать только содержимое выбранного узла.
 * Если для контрола настроена навигация, тогда после проваливания в узел начинает работать подгрузка дочерних элементов по скроллу.
 *
 * @remark
 * Сортировка применяется к запросу к источнику данных. Полученные от источника записи дополнительно не сортируются.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_explorer.less переменные тем оформления explorer}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_list.less переменные тем оформления list}
 *
 * @demo Controls-demo/Explorer/Explorer
 * @demo Controls-demo/Explorer/Search
 *
 * @class Controls/_explorer/View
 * @extends UI/Base:Control
 * @implements Controls/list:IReloadableList
 * @implements Controls/interface:ISource
 * @implements Controls/interface/ITreeGridItemTemplate
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/grid:IEditableGrid
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/interface:IHierarchy
 * @implements Controls/tree:ITree
 * @implements Controls/explorer:IExplorer
 * @implements Controls/interface:IDraggable
 * @implements Controls/tile:ITile
 * @implements Controls/list:IVirtualScroll
 * @implements Controls/interface/IGroupedGrid
 * @implements Controls/grid:IGridControl
 * @implements Controls/list:IClickableView
 * @implements Controls/list:IMovableList
 * @implements Controls/list:IRemovableList
 * @implements Controls/marker:IMarkerList
 * @implements Controls/tile:ITreeTile
 * @implements Controls/error:IErrorControllerOptions
 *
 * @public
 * @author Авраменко А.С.
 */

/*
 * Hierarchical list that can expand and go inside the folders. Can load data from data source.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FExplorer">Demo example</a>.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExplorer%2FSearch">Demo example with search</a>.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/explorer/'>here</a>.
 *
 * @class Controls/_explorer/View
 * @extends UI/Base:Control
 * @implements Controls/list:IReloadableList
 * @implements Controls/interface:ISource
 * @implements Controls/interface/ITreeGridItemTemplate
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/grid:IEditableGrid
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IList
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/interface:IHierarchy
 * @implements Controls/tree:ITree
 * @implements Controls/explorer:IExplorer
 * @implements Controls/interface:IDraggable
 * @implements Controls/tile:ITile
 * @implements Controls/list:IVirtualScroll
 * @implements Controls/interface/IGroupedGrid
 * @implements Controls/grid:IGridControl
 * @implements Controls/list:IClickableView
 * @implements Controls/list:IMovableList
 * @implements Controls/list:IRemovableList
 * @implements Controls/marker:IMarkerList
 *
 * @public
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_explorer/View#displayProperty
 * @cfg {string} Имя свойства элемента, содержимое которого будет отображаться.
 * @remark Поле используется для вывода хлебных крошек.
 * @example
 * <pre class="brush: html; highlight: [2]">
 * <!-- WML -->
 * <Controls.explorer:View source="{{_viewSource}}" columns="{{_columns}}" viewMode="table" displayProperty="title" parentProperty="parent" nodeProperty="parent@">
 *     ...
 * </Controls.explorer:View>
 * </pre>
 */

/*
 * @name Controls/_explorer/View#displayProperty
 * @cfg {string} sets the property to be displayed in search results
 * @example
 * <pre class="brush: html; highlight: [2]">
 * <!-- WML -->
 * <Controls.explorer:View source="{{_viewSource}}" columns="{{_columns}}" viewMode="table" displayProperty="title" parentProperty="parent" nodeProperty="parent@">
 *     ...
 * </Controls.explorer:View>
 * </pre>
 */

/**
 * @name Controls/_explorer/View#breadcrumbsDisplayMode
 * @cfg {String} Отображение крошек в несколько строк {@link Controls/breadcrumbs:HeadingPath#displayMode}
 * @variant default
 * @variant multiline
 * @default default
 * @see afterBreadCrumbsTemplate
 */

/**
 * @name Controls/_explorer/View#afterBreadCrumbsTemplate
 * @cfg {TemplateFunction|string} Пользовательский шаблон, который будет выведен справа от {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/breadcrumbs/ хлебных крошек}.
 * @see breadcrumbsDisplayMode
 */

/**
 * @name Controls/_explorer/View#tileItemTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения элемента в режиме "Плитка".
 * @default undefined
 * @markdown
 * @remark
 * Позволяет установить пользовательский шаблон отображения элемента (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/tile:ItemTemplate}.
 *
 * Также шаблон Controls/tile:ItemTemplate поддерживает {@link Controls/tile:ItemTemplate параметры}, с помощью которых можно изменить отображение элемента.
 *
 * В разделе "Примеры" показано как с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию tileItemTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/tile:ItemTemplate.
 *
 * Дополнительно о работе с шаблоном вы можете прочитать в {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/item/ руководстве разработчика}.
 * @example
 * <pre class="brush: html; highlight: [3-5]">
 * <!-- WML -->
 * <Controls.explorer:View source="{{_viewSource}}" columns="{{_columns}}" viewMode="table" displayProperty="title" parentProperty="parent" nodeProperty="parent@">
 *     <ws:tileItemTemplate>
 *         <ws:partial template="Controls/tile:ItemTemplate" highlightOnHover="{{false}}" />
 *     </ws:tileItemTemplate>
 * </Controls.explorer:View>
 * </pre>
 * @see itemTemplate
 * @see itemTemplateProperty
 */

/**
 * @name Controls/_explorer/View#tileGroupTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения группы в режиме "Плитка".
 * @default undefined
 * @markdown@remark
 * Позволяет установить пользовательский шаблон отображения группы (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/list:GroupTemplate}.
 * @example
 * <pre class="brush: html;">
 * <!-- WML -->
 * <Controls.explorer:View source="{{_viewSource}}" columns="{{_columns}}" viewMode="table" displayProperty="title" parentProperty="parent" nodeProperty="parent@">
 *     <ws:tileGroupTemplate>
 *         <ws:partial template="Controls/list:GroupTemplate"/>
 *     </ws:tileGroupTemplate>
 * </Controls.explorer:View>
 * </pre>
 * @see itemTemplate
 * @see itemTemplateProperty
 */

/**
 * @name Controls/_explorer/View#listEmptyTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон отображения {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty/ пустого списка}, используемый в {@link Controls/_explorer/interface/IExplorer#viewMode режиме "Плоский список"}.
 * @demo Controls-demo/list_new/EmptyList/Default/Index
 * @default undefined
 * @example
 * <pre class="brush: html; highlight: [3-7]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *     <ws:emptyTemplate>
 *         <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xl" bottomSpacing="l">
 *             <ws:contentTemplate>Нет данных</ws:contentTemplate>
 *         </ws:partial>
 *     </ws:emptyTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Пользовательский шаблон получается путем конфигурации базового шаблона {@link Controls/list:EmptyTemplate}.
 */

/**
 * @name Controls/_explorer/View#listItemTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения элемента в режиме "Список".
 * @default undefined
 * @markdown
 * @remark
 * Позволяет установить пользовательский шаблон отображения элемента (**именно шаблон**, а не контрол!). При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/list:ItemTemplate}.
 *
 * Также шаблон Controls/list:ItemTemplate поддерживает {@link Controls/list:ItemTemplate параметры}, с помощью которых можно изменить отображение элемента.
 *
 * В разделе "Примеры" показано как с помощью директивы {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-partial ws:partial} задать пользовательский шаблон. Также в опцию listItemTemplate можно передавать и более сложные шаблоны, которые содержат иные директивы, например {@link /doc/platform/developmentapl/interface-development/ui-library/template-engine/#ws-if ws:if}. В этом случае каждая ветка вычисления шаблона должна заканчиваться директивой ws:partial, которая встраивает Controls/list:ItemTemplate.
 *
 * Дополнительно о работе с шаблоном вы можете прочитать в {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/item/ руководстве разработчика}.
 * @example
 * <pre class="brush: html; highlight: [3-5]">
 * <!-- WML -->
 * <Controls.explorer:View source="{{_viewSource}}" columns="{{_columns}}" viewMode="table" displayProperty="title" parentProperty="parent" nodeProperty="parent@">
 *     <ws:listItemTemplate>
 *         <ws:partial template="Controls/list:ItemTemplate" highlightOnHover="{{false}}" />
 *     </ws:listItemTemplate>
 * </Controls.explorer:View>
 * </pre>
 * @see itemTemplate
 * @see itemTemplateProperty
 */

/**
 * @typedef {String} Controls/_explorer/View/TBreadCrumbsMode
 * @description Допустимые зачения для опции {@link breadCrumbsMode}.
 * @variant row Все ячейки строки с хлебными крошками объединяются в одну ячейку, в которой выводятся хлебные крошки.
 * @variant cell Ячейки строки с хлебными крошками не объединяются, выводятся в соответствии с заданной конфигурацией колонок. При таком режиме прикладной разработчик может задать кастомное содержимое для ячеек строки с хлебными крошками.
 */

/**
 * @name Controls/_explorer/View#breadCrumbsMode
 * @cfg {Controls/_explorer/View/TBreadCrumbsMode.typedef} Режим вывода строки с хлебными крошками в результатах поиска.
 * @default row
 * @markdown
 * @remark
 * Данная опция позволяет сконфигурировать вывод строки с хлебными крошками. Возможны 2 варианта:
 *
 * * row - все ячейки строки с хлебными крошками объединяются в одну ячейку в которой выводятся хлебные крошки.
 * * cell - ячейки строки с хлебными крошками не объединяются, выводятся в соответствии с заданной конфигурацией колонок. При таком режиме прикладной разработчик может задать кастомное содержимое для ячеек строки с хлебными крошками.
 */

/**
 * @name Controls/_explorer/View#pathButtonSource
 * @cfg {Types/source:ICrudPlus} Источник данных для кнопки навигационного меню, которая отображается в блоке с хлебными крошками.
 * По умолчанию для навигационного меню используется тот же источник данных, который был передан для работы со списком.
 * В случае если query-метод основного источника данных слишком тяжелый то для кнопки навигационного меню рекомендуется использовать отдельный источник с облегченным query-методом.
 */

/**
 * @event Происходит при клике на кнопку "Просмотр записи".
 * @name Controls/_explorer/View#arrowClick
 * @remark Кнопка отображается при наведении курсора на текущую папку хлебных крошек. Отображение кнопки "Просмотр записи" задаётся с помощью опции {@link Controls/_explorer/interface/IExplorer#showActionButton}. По умолчанию кнопка скрыта.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @name Controls/_explorer/View#itemPadding
 * @cfg {Controls/_tile/interface/ITile/TileItemPadding.typedef|Controls/_interface/IItemPadding/ItemPadding.typedef} Отступы элементов.
 * @description
 * Поведение реестра при настройке этой опции зависит от {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/view-mode/ режима отображения}.
 * В режиме плитки эта опция повлияет на отступы между записями и принимает объект {@link Controls/_tile/interface/ITile/TileItemPadding.typedef TileItemPadding}.
 * В прочих режимах эта опция повлияет на отступы внутри записи и принимает объект {@link Controls/_interface/IItemPadding/ItemPadding.typedef ItemPadding}.
 */
