import cClone = require('Core/core-clone');

import {SyntheticEvent} from 'UI/Vdom';
import {EventUtils} from 'UI/Events';

import {constants} from 'Env/Env';

import {CrudEntityKey, QueryWhereExpression} from 'Types/source';
import {isEqual} from 'Types/object';
import {IObservable, RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

import {
    Direction,
    IBaseSourceConfig,
    ISelectionObject,
    TKey
} from 'Controls/interface';
import {
    BaseControl,
    checkReloadItemArgs,
    IDirection,
    IReloadItemOptions,
    ISiblingStrategy
} from 'Controls/baseList';
import {Collection, CollectionItem, IDragPosition, Tree, TreeItem} from 'Controls/display';
import {ISourceControllerOptions, NewSourceController} from 'Controls/dataSource';
import {MouseButtons, MouseUp} from 'Controls/popup';
import 'css!Controls/list';
import 'css!Controls/itemActions';
import 'css!Controls/CommonClasses';
import 'css!Controls/treeGrid';
import {TreeSiblingStrategy} from './Strategies/TreeSiblingStrategy';
import {ExpandController} from 'Controls/expandCollapse';
import {Logger} from 'UI/Utils';
import {
    applyReloadedNodes,
    getReloadItemsHierarchy,
    getRootsForHierarchyReload
} from 'Controls/_tree/utils';
import {IHasMoreStorage} from 'Controls/_display/Tree';
import {IDragObject} from 'Controls/dragnDrop';
import {IOptions as ITreeControlOptions} from './interface/ITree';

const HOT_KEYS = {
    expandMarkedItem: constants.key.right,
    collapseMarkedItem: constants.key.left
};

const EXPAND_ON_DRAG_DELAY = 1000;
const DEFAULT_COLUMNS_VALUE = [];

const _private = {
    expandMarkedItem(self: TreeControl): void {
        const markerController = self._markerController;
        const markedKey = markerController?.getMarkedKey() || null;

        if (markedKey === null) {
            return;
        }

        const markedItem = self.getViewModel().getItemBySourceKey(markedKey);
        if (markedItem && markedItem.isNode() !== null && self._expandController.isItemCollapsed(markedKey)) {
            self.toggleExpanded(markedKey);
        }
    },

    collapseMarkedItem(self: TreeControl): void {
        const markerController = self._markerController;
        const markedKey = markerController?.getMarkedKey() || null;

        if (markedKey === null) {
            return;
        }

        const markedItem = self.getViewModel().getItemBySourceKey(markedKey);
        if (markedItem && markedItem.isNode() !== null && self._expandController.isItemExpanded(markedKey)) {
            self.toggleExpanded(markedKey);
        }
    },

    toggleExpanded(self: TreeControl, dispItem: TreeItem): Promise<void> {
        if (self._options.supportExpand === false || self.getViewModel().SupportExpand === false) {
            return Promise.resolve();
        }

        const item = dispItem.getContents();
        const nodeKey = item.getKey();
        const expanded = !self._expandController.isItemExpanded(nodeKey);

        // Если вызвали разворот узла, то сбрасывать развернутые узлы уже точно не нужно
        self._needResetExpandedItems = false;

        const expandToFirstLeafIfNeed = () => {
            // Если узел сворачивается - автоматически высчитывать следующий разворачиваемый элемент не требуется.
            // Ошибка: https://online.sbis.ru/opendoc.html?guid=98762b51-6b69-4612-9468-1c38adaa2606
            if (self._options.markerMoveMode === 'leaves' && expanded !== false && self._goToNextAfterExpand) {
                self._tempItem = nodeKey;
                return self.goToNext();
            }
        };

        const eventResult = self._notify(expanded ? 'beforeItemExpand' : 'beforeItemCollapse', [item]);
        if (eventResult instanceof Promise) {
            self._displayGlobalIndicator();
            return eventResult.then(
                () => {
                    if (self._indicatorsController.shouldHideGlobalIndicator()) {
                        self._indicatorsController.hideGlobalIndicator();
                    }
                    return _private.doExpand(self, dispItem).then(expandToFirstLeafIfNeed).catch((e) => e);
                },
                () => {
                    if (self._indicatorsController.shouldHideGlobalIndicator()) {
                        self._indicatorsController.hideGlobalIndicator();
                    }
                }
            );
        } else {
            return _private.doExpand(self, dispItem).then(expandToFirstLeafIfNeed).catch((e) => e);
        }
    },

    doExpand(self: TreeControl, dispItem: TreeItem): Promise<unknown> {
        const item = dispItem.getContents();
        const nodeKey = item.getKey();
        const expandController = self._expandController;
        const expanded = !expandController.isItemExpanded(nodeKey);

        function doExpand(): Promise<unknown> {
            return Promise
                .resolve(expandController.toggleItem(nodeKey) as Promise<RecordSet[]>)
                .then((results?: RecordSet[]) => {
                    if (self._destroyed) {
                        return Promise.reject();
                    }
                    //region Применим новое состояние развернутости к моделе
                    // Проставляем hasMoreStorage до простановки expandedItems,
                    // чтобы футеры узлов правильно посчитать за один раз
                    self.getViewModel().setHasMoreStorage(
                        _private.prepareHasMoreStorage(
                            self.getSourceController(),
                            expandController.getExpandedItems(),
                            self.getViewModel().getHasMoreStorage()
                        )
                    );
                    expandController.applyStateToModel();
                    //endregion

                    //region Уведомим об изменении expandedItems
                    const expandedItems = expandController.getExpandedItems();
                    // Актуализируем информацию по раскрытым узлам в sourceController, иначе на beforeUpdate
                    // применится старое состояние из sourceController
                    self.getSourceController()?.setExpandedItems(expandedItems);
                    self._notify('expandedItemsChanged', [expandedItems]);
                    self._notify('collapsedItemsChanged', [expandController.getCollapsedItems()]);
                    self._notify(expanded ? 'afterItemExpand' : 'afterItemCollapse', [item]);
                    //endregion
                });
        }

        // todo: удалить события itemExpand и itemCollapse в 20.2000.
        self._notify(expanded ? 'itemExpand' : 'itemCollapse', [item]);

        // Если сворачивается узел, внутри которого запущено редактирование, то его следует закрыть
        let shouldCancelEditing = false;
        if (self._editingItem) {
            const listViewModel = self.getViewModel();
            shouldCancelEditing = _private.hasInParents(
                listViewModel,
                self._editingItem.getContents().getKey(),
                dispItem.contents.getKey()
            );
        }

        self._collectionChangeCauseByNode = true;

        // TODO: Переписать
        //  https://online.sbis.ru/opendoc.html?guid=974ac162-4ee4-48b5-a2b7-4ff75dccb49c
        if (shouldCancelEditing) {
            return self.cancelEdit().then((result) => {
                if (!(result && result.canceled)) {
                    return doExpand();
                }
                return result;
            });
        } else {
            return doExpand();
        }
    },

    hasInParents(collection: Collection, childKey, stepParentKey): boolean {
        const child = collection.getItemBySourceKey(childKey);
        const targetParent = collection.getItemBySourceKey(stepParentKey);

        let current = child;
        do {
            current = current.getParent();
            if (!current.isRoot() && current === targetParent) {
                return true;
            }
        } while (!current.isRoot());
        return false;
    },

    shouldLoadChildren(self: TreeControl, nodeKey: TKey): boolean {
        // загружаем узел только если он не был загружен ранее
        // (проверяем через sourceController, была ли выполнена загрузка)
        const sourceController = self.getSourceController();
        return sourceController ? !sourceController.hasLoaded(nodeKey) : !self._options.items;
    },

    updateHaseMoreStorage(collection: Tree, sourceController: NewSourceController): void {
        const hasMore = _private.prepareHasMoreStorage(
            sourceController,
            collection.getExpandedItems(),
            collection.getHasMoreStorage()
        );
        collection.setHasMoreStorage(hasMore);
    },

    prepareHasMoreStorage(
        sourceController: NewSourceController,
        expandedItems: TKey[],
        currentHasMore: IHasMoreStorage
    ): IHasMoreStorage {
        const hasMore = {...currentHasMore};

        expandedItems.forEach((nodeKey) => {
            hasMore[nodeKey] = {
                backward: sourceController ? sourceController.hasMoreData('up', nodeKey) : false,
                forward: sourceController ? sourceController.hasMoreData('down', nodeKey) : false
            };
        });

        return hasMore;
    },

    loadNodeChildren(self: TreeControl, nodeKey: CrudEntityKey, direction: IDirection = 'down'): Promise<RecordSet> {
        const sourceController = self.getSourceController();

        self._displayGlobalIndicator();
        self._collectionChangeCauseByNode = true;
        return sourceController.load(direction, nodeKey).then((list) => {
            return list;
        }).catch((error) => {
            return error;
        }).finally(() => {
            if (self._indicatorsController.shouldHideGlobalIndicator()) {
                self._indicatorsController.hideGlobalIndicator();
            }
        });
    },

    resetExpandedItems(self: TreeControl): void {
        const viewModel = self.getViewModel() as Tree;
        const reset = () => {
            viewModel.setHasMoreStorage({});
            self._expandController.resetExpandedItems();

            if (self._isMounted) {
                self._notify('expandedItemsChanged', [self._expandController.getExpandedItems()]);
                self._notify('collapsedItemsChanged', [self._expandController.getCollapsedItems()]);
            }
        };

        if (!viewModel) {
            return;
        }

        let shouldCancelEditing = false;
        if (self._editingItem) {
            const editingKey = self._editingItem.getContents().getKey();
            self._expandController.getExpandedItems().forEach((itemKey) => {
                shouldCancelEditing = shouldCancelEditing || _private.hasInParents(
                    viewModel,
                    editingKey,
                    itemKey
                );
            });
        }

        if (shouldCancelEditing) {
            self.cancelEdit().then((result) => {
                if (!(result && result.canceled)) {
                    reset();
                }
                return result;
            });
        } else {
            reset();
        }

        self._expandController.applyStateToModel();
    },

    /**
     * Выполняет запрос на перезагрузку указанной записи, всех её родительских и развернутых дочерних узлов.
     * @param {TKey} key - id перезагружаемой записи
     * @param {Tree} collection - коллекция к которой принадлежит перезагружаемый итем
     * @param {QueryWhereExpression<unknown>} filter - фильтр с которым будет выполнен запрос на перезагрузку
     * @param {NewSourceController} sourceController - sourceController через который будет выполнен запрос на
     * перезагрузку
     */
    reloadItem(
        key: TKey,
        collection: Tree,
        filter: QueryWhereExpression<unknown>,
        sourceController: NewSourceController
    ): Promise<RecordSet | Error> {
        const reloadFilter = cClone(filter);
        reloadFilter[collection.getParentProperty()] = getRootsForHierarchyReload(collection, key);

        return sourceController
            .load(undefined, key, reloadFilter)
            .then((items: RecordSet) => {
                applyReloadedNodes(collection, key, items);

                const meta = items.getMetaData();
                if (meta.results) {
                    collection.setMetaResults(meta.results);
                }

                _private.updateHaseMoreStorage(collection, sourceController);

                return items;
            });
    },

    getOriginalSource<T = unknown>(source: T & {getOriginal?: () => T}): T {
        let src = source;

        while (src.getOriginal) {
            src = source.getOriginal();
        }

        return src;
    },

    /**
     * Возвращает идентификаторы раскрытых узлов. В случае если переданные expandedItems не равны
     * [ALL_EXPANDED_VALUE], то вернутся копия переданного массива. В противном случае вернутся идентификаторы
     * всех узлов, присутствующих в указанных items
     */
    getExpandedItems(
        self: TreeControl,
        options: ITreeControlOptions,
        items: RecordSet,
        expandedItems: CrudEntityKey[]
    ): CrudEntityKey[] {

        if (!items) {
            return [];
        }
        let realExpandedItems;

        if (self._expandController.isAllExpanded() && options.nodeProperty) {
            realExpandedItems = [];
            items.each((item) => {
                if (item.get(options.nodeProperty) !== null) {
                    realExpandedItems.push(item.get(self._keyProperty));
                }
            });
        } else {
            realExpandedItems = expandedItems.slice();
        }

        return realExpandedItems;
    }
};

/**
 * Hierarchical list control with custom item template. Can load data from data source.
 *
 * @class Controls/_tree/TreeControl
 * @implements Controls/list:IEditableList
 * @implements Controls/list:IMovableList
 * @extends Controls/_list/BaseControl
 *
 * @private
 */

export class TreeControl<TOptions extends ITreeControlOptions = ITreeControlOptions>
    extends BaseControl<ITreeControlOptions> {
    private _root = null;
    private _needResetExpandedItems: boolean = false;
    private _updateExpandedItemsAfterReload: boolean = false;
    private _currentItem = null;
    private _tempItem = null;
    private _markedLeaf = '';
    private _doAfterItemExpanded = null;
    private _goToNextAfterExpand: true;
    private _scrollToLeaf: boolean = null;
    private _scrollToLeafOnDrawItems: boolean = false;
    protected _plainItemsContainer: boolean = true;

    /**
     * Флаг, означающий что изменение коллекции было спровоцировано изменением узла(развернули/свернули)
     * @private
     */
    private _collectionChangeCauseByNode: boolean = false;

    private _timeoutForExpandOnDrag: number = null;
    private _loadedRoot: TKey;

    _expandController: ExpandController;
    private _mouseDownExpanderKey: TKey;
    private _expandedItemsToNotify: TKey[];

    protected _listViewModel: Tree = null;

    constructor(options: TOptions, context?: object) {
        super(options, context);
        this._nodeDataMoreLoadCallback = this._nodeDataMoreLoadCallback.bind(this);
        if (typeof options.root !== 'undefined') {
            this._root = options.root;
        }
    }

    protected _beforeMount(...args: [TOptions, object]): void {
        const options = args[0];

        // Создаем _expandController до вызова super._beforeMount, т.к. во время
        // отработки super._beforeMount уже будет нужен
        this._expandController = new ExpandController({
            singleExpand: options.singleExpand,
            expandedItems: options.expandedItems,
            collapsedItems: options.collapsedItems,
            loader: this._expandLoader.bind(this)
        });

        const superResult = super._beforeMount(...args);
        const doBeforeMount = () => {
            // После отработки super._beforeMount создастся модель, обновим её в контроллере
            this._expandController.updateOptions({model: this.getViewModel()});
            this._plainItemsContainer = options.plainItemsContainer;
            if (options.sourceController) {
                // FIXME для совместимости, т.к. сейчас люди задают опции, которые требуетюся для запроса
                //  и на списке и на Browser'e
                const sourceControllerState = options.sourceController.getState();

                if (options.parentProperty && sourceControllerState.parentProperty !== options.parentProperty ||
                    options.root !== undefined && options.root !== sourceControllerState.root) {
                    options.sourceController.updateOptions({...options, keyProperty: this._keyProperty});
                }

                options.sourceController.setNodeDataMoreLoadCallback(this._nodeDataMoreLoadCallback);
            }
        };
        return !superResult ? doBeforeMount() : superResult.then(doBeforeMount);
    }

    protected _afterMount() {
        super._afterMount(...arguments);

        if (this._expandedItemsToNotify) {
            this._notify('expandedItemsChanged', [this._expandedItemsToNotify]);
            this._expandedItemsToNotify = null;
        } else if (this._options.nodeHistoryId) {
            this._notify('expandedItemsChanged', [this._expandController.getExpandedItems()]);
        }
    }

    /**
     * Проверяет можно ли для переданного узла загрузить его данные автоматически.
     * Можно загружать если direction === 'down' и item это раскрытый узел в котором есть не загруженные данные
     * и не задан футер списка и нет данных для загрузки в дочернем узле
     * @param {Direction} direction - текущее направление подгрузки
     * @param {TreeItem} item - проверяемая запись
     * @param {CrudEntityKey} parentKey - идентификатор родительского узла (TODO зачем его передавать если он есть в item?)
     * @private
     */
    private _canLoadNodeDataOnScroll(direction: Direction, item: TreeItem, parentKey: CrudEntityKey): boolean {
        // Иногда item это breadcrumbsItemRow, он не TreeItem
        if (!item || !item['[Controls/_display/TreeItem]'] || direction !== 'down') {
            return false;
        }

        const hasMoreParentData = !!this._sourceController && this._sourceController.hasMoreData('down', parentKey);

        // Можно грузить если это раскрытый узел в котором есть не загруженные данные и не задан футер списка и нет
        // данных для загрузки в дочернем узле
        return item.isNode() !== null && item.isExpanded() && item.hasMoreStorage('forward') &&
            !this._options.footerTemplate && !hasMoreParentData;
    }

    /**
     * Загружает рекурсивно данные последнего раскрытого узла
     * @param item
     * @private
     */
    private _loadNodeChildrenRecursive(item: TreeItem): Promise<RecordSet|void> {
        const nodeKey = item.getContents().getKey();
        const hasMoreData = this._sourceController?.hasMoreData('down', nodeKey);

        if (hasMoreData) {
            // Вызов метода, который подгружает дочерние записи узла
            return _private.loadNodeChildren(this, nodeKey);
        } else {
            const lastItem = item.getLastChildItem();
            if (this._canLoadNodeDataOnScroll('down', lastItem, nodeKey)) {
                return this._loadNodeChildrenRecursive(lastItem);
            }

            return Promise.resolve();
        }
    }

    /**
     * Метод, вызываемый после срабатывания триггера подгрузки данных.
     *
     * В случае если последняя корневая запись это раскрытый узел у которого есть данные для подгрузки,
     * то загружаются его дочерние элементы. В противном случае вызываем загрузку корневых итемов.
     *
     * TODO Необходимо провести рефакторинг механизма подгрузки данных по задаче
     *  https://online.sbis.ru/opendoc.html?guid=8a5f7598-c7c2-4f3e-905f-9b2430c0b996
     *
     * @param {Direction} direction - текущее направление подгрузки
     * @private
     */
    protected _loadMore(direction: Direction): void | Promise<RecordSet|void> {
        const lastRootItem = this._listViewModel.getRoot().getLastChildItem();

        // Если последняя корневая запись это раскрытый узел у которого есть данные для подгрузки,
        // то загружаем его дочерние элементы
        if (this._canLoadNodeDataOnScroll(direction, lastRootItem, this._options.root)) {
            this._addItemsByLoadToDirection = true;
            return this._loadNodeChildrenRecursive(lastRootItem).then((result) => {
                this._addItemsByLoadToDirection = false;
                return result;
            });
        } else {
            // Вызов метода подгрузки данных по умолчанию (по сути - loadToDirectionIfNeed).
            return super._loadMore(direction);
        }
    }

    private _updateTreeControlModel(newOptions): void {
        const viewModel = this.getViewModel();

        if (!viewModel) {
            return;
        }

        if (this._options.markedKey !== newOptions.markedKey) {
            if (newOptions.markerMoveMode === 'leaves') {
                this._applyMarkedLeaf(newOptions.markedKey, viewModel, this.getMarkerController());
            }
        }

        // nodeFooterVisibilityCallback нужно проставлять раньше nodeFooterTemplate, т.к.
        // изменение темплейта вызовет пересчет футеров, а в колбэке уже может быть изменено условие,
        // поэтому нужно сперва пересчитаться по актуальному колбэку
        if (newOptions.nodeFooterVisibilityCallback !== this._options.nodeFooterVisibilityCallback) {
            viewModel.setNodeFooterVisibilityCallback(newOptions.nodeFooterVisibilityCallback);
        }

        if (newOptions.nodeFooterTemplate !== this._options.nodeFooterTemplate) {
            viewModel.setNodeFooterTemplate(newOptions.nodeFooterTemplate);
        }

        if (newOptions.expanderVisibility !== this._options.expanderVisibility) {
            viewModel.setExpanderVisibility(newOptions.expanderVisibility);
        }

        if (newOptions.expanderSize !== this._options.expanderSize) {
            viewModel.setExpanderSize(newOptions.expanderSize);
        }

        if (newOptions.expanderIconSize !== this._options.expanderIconSize) {
            viewModel.setExpanderIconSize(newOptions.expanderIconSize);
        }

        if (newOptions.expanderIconStyle !== this._options.expanderIconStyle) {
            viewModel.setExpanderIconStyle(newOptions.expanderIconStyle);
        }

        if (newOptions.nodeProperty !== this._options.nodeProperty) {
            viewModel.setNodeProperty(newOptions.nodeProperty);
        }

        if (newOptions.parentProperty !== this._options.parentProperty) {
            viewModel.setParentProperty(newOptions.parentProperty);
        }

        if (newOptions.hasChildrenProperty !== this._options.hasChildrenProperty) {
            viewModel.setHasChildrenProperty(newOptions.hasChildrenProperty);
        }
    }

    protected _startBeforeUpdate(newOptions: TOptions): void {
        super._startBeforeUpdate(newOptions);
        const sourceController = this.getSourceController();
        const viewModelConstructorChanged = newOptions.viewModelConstructor !== this._options.viewModelConstructor ||
            (this._listViewModel && this._keyProperty !== this._listViewModel.getKeyProperty());

        if (typeof newOptions.root !== 'undefined' && this._root !== newOptions.root) {
            this._root = newOptions.root;

            if (this._listViewModel && !viewModelConstructorChanged) {
                this._listViewModel.setRoot(this._root);
            }

            if (this._options.itemsSetCallback) {
                const items = sourceController?.getItems() || newOptions.items;
                this._options.itemsSetCallback(items, newOptions);
            }

            // При смене корне, не надо запрашивать все открытые папки,
            // т.к. их может не быть и мы загрузим много лишних данных.
            // Так же учитываем, что вместе со сменой root могут поменять и expandedItems - тогда не надо их сбрасывать.
            // Если данные для нового рута уже загружены, то выставлять флаг нет смысла, т.к. _afterReloadCallback
            // уже отработал и флаг _needResetExpandedItems будет обработан и сброшен только при следующем релоаде
            // списка и не факт что это будет актуально
            if (
                this._loadedRoot !== newOptions.root &&
                isEqual(newOptions.expandedItems, this._options.expandedItems)
            ) {
                this._needResetExpandedItems = true;
            }

            if (this.isEditing()) {
                this.cancelEdit();
            }
        }
    }

    protected _endBeforeUpdate(newOptions: TOptions): void {
        super._endBeforeUpdate(newOptions);

        let updateSourceController = false;
        const sourceController = this.getSourceController();

        if (typeof newOptions.root !== 'undefined' && this._root !== newOptions.root) {
            const sourceControllerRoot = sourceController?.getState().root;
            if (sourceControllerRoot === undefined || sourceControllerRoot !== newOptions.root) {
                updateSourceController = true;
            }
        }

        const viewModel = this.getViewModel() as Tree;
        const searchValueChanged = this._options.searchValue !== newOptions.searchValue;
        const isSourceControllerLoading = sourceController && sourceController.isLoading();
        this._plainItemsContainer = newOptions.plainItemsContainer;

        this._expandController.updateOptions({
            model: viewModel,
            singleExpand: newOptions.singleExpand,
            collapsedItems: newOptions.collapsedItems
        });

        const currentExpandedItems = this._expandController.getExpandedItems();
        const expandedItemsFromSourceCtrl = sourceController && sourceController.getExpandedItems();
        // expandedItems в sourceController приоритетнее чем наши. Поэтому Если в sourceController
        // нет expandedItems, а у нас есть, значит нужно сбросить раскрытые узлы
        const wasResetExpandedItems = !isSourceControllerLoading &&
            expandedItemsFromSourceCtrl && !expandedItemsFromSourceCtrl.length &&
            currentExpandedItems && currentExpandedItems.length;

        if (wasResetExpandedItems) {
            _private.resetExpandedItems(this);
        } else if (newOptions.expandedItems && !isEqual(newOptions.expandedItems, currentExpandedItems)) {
            if (
                (newOptions.source === this._options.source || newOptions.sourceController) &&
                !isSourceControllerLoading ||
                (searchValueChanged && newOptions.sourceController)
            ) {
                if (viewModel) {
                    // Отключаем загрузку данных контроллером, т.к. все данные уже загружены
                    // нужно только проставить новое состояние в контроллер
                    this._expandController.disableLoader();
                    this._expandController.setExpandedItems(newOptions.expandedItems);
                    this._expandController.enableLoader();

                    const expandedItems = _private.getExpandedItems(
                        this,
                        newOptions,
                        viewModel.getCollection(),
                        newOptions.expandedItems
                    );

                    // Проставляем hasMoreStorage до простановки expandedItems,
                    // чтобы футеры узлов правильно посчитать за один раз
                    viewModel.setHasMoreStorage(
                        _private.prepareHasMoreStorage(sourceController, expandedItems, viewModel.getHasMoreStorage())
                    );
                    this._expandController.applyStateToModel();

                    if (newOptions.markerMoveMode === 'leaves') {
                        this._applyMarkedLeaf(newOptions.markedKey, viewModel, this.getMarkerController());
                    }
                }
            } else {
                this._updateExpandedItemsAfterReload = true;
            }

            if (sourceController && !isEqual(newOptions.expandedItems, sourceController.getExpandedItems())) {
                sourceController.setExpandedItems(newOptions.expandedItems);
            }
        }

        if (newOptions.parentProperty !== this._options.parentProperty) {
            updateSourceController = true;
        }

        this._updateTreeControlModel(newOptions);

        if (sourceController) {
            sourceController.setNodeDataMoreLoadCallback(this._nodeDataMoreLoadCallback);

            const sourceControllerState = sourceController.getState();
            if (newOptions.parentProperty && sourceControllerState.parentProperty !== newOptions.parentProperty) {
                Logger.error('TreeControl: для корректной работы опцию parentProperty необходимо задавать ' +
                    'на Controls/list:DataContainer (Layout/browsers:Browser)', this);
                updateSourceController = true;
            }
        }
        if (sourceController && updateSourceController) {
            sourceController.updateOptions({...newOptions, keyProperty: this._keyProperty});
        }
    }

    protected _afterRender() {
        super._afterRender(...arguments);
        if (this._scrollToLeaf && !this._scrollToLeafOnDrawItems) {
            this._scrollToLeaf();
            this._scrollToLeaf = null;
        }
    }
    protected _afterUpdate(oldOptions: TOptions) {
        super._afterUpdate(...arguments);

        if (this._expandedItemsToNotify) {
            this._notify('expandedItemsChanged', [this._expandedItemsToNotify]);
            this._expandedItemsToNotify = null;
        }
    }

    protected _beforeUnmount(): void {
        this._scrollToLeaf = null;
        this._clearTimeoutForExpandOnDrag();
        if (this.getSourceController()) {
            this.getSourceController().setNodeDataMoreLoadCallback(null);
        }
        super._beforeUnmount(...arguments);
    }

    protected _onDrawItems(): void {
        super._onDrawItems();
        if (this._scrollToLeaf && this._scrollToLeafOnDrawItems) {
            this._scrollToLeaf();
            this._scrollToLeaf = null;
            this._scrollToLeafOnDrawItems = false;
        }
    }

    resetExpandedItems(): void {
        _private.resetExpandedItems(this);
    }

    toggleExpanded(key: TKey): Promise<void> {
        const item = this.getViewModel().getItemBySourceKey(key);
        return _private.toggleExpanded(this, item);
    }

    protected _onloadMore(e, dispItem?, direction?: IDirection): void {
        if (dispItem) {
            const nodeKey = dispItem.getContents().getKey();
            _private.loadNodeChildren(this, nodeKey, direction);
        } else {
            super._onloadMore(e);
        }
    }

    reload(keepNavigation: boolean = false, sourceConfig?: IBaseSourceConfig): Promise<unknown> {
        return super.reload(keepNavigation, sourceConfig);
    }

    reloadItem(key: TKey, options: IReloadItemOptions = {}): Promise<Model | RecordSet> {
        checkReloadItemArgs(...arguments);

        return options.hierarchyReload
            ? _private.reloadItem(key, this.getViewModel() as Tree, this._options.filter, this.getSourceController())
            : super.reloadItem.apply(this, [key, options]);
    }

    /**
     * Перезагружает указанные записи списка. Для этого отправляет запрос query-методом
     * со значением текущего фильтра в поле [parentProperty] которого передаются идентификаторы
     * родительских узлов.
     */
    reloadItems(ids: TKey[]): Promise<RecordSet | Error> {
        const filter = cClone(this._options.filter);
        const collection = this.getViewModel() as Tree;
        const sourceController = this.getSourceController();

        filter[this._options.parentProperty] = getReloadItemsHierarchy(collection, ids);

        return sourceController
            .load(undefined, undefined, filter)
            .then((items: RecordSet) => {
                const meta = items.getMetaData();
                if (meta.results) {
                    collection.setMetaResults(meta.results);
                }

                _private.updateHaseMoreStorage(collection, sourceController);

                return items;
            });
    }

    // region Drag

    /**
     * Реализует автоматическое раскрытие узла дерева когда при перетаскивании записи
     * курсор на некоторое время ({@link EXPAND_ON_DRAG_DELAY}) задерживается над ним.
     */
    protected _draggingItemMouseMove(item: TreeItem, event: MouseEvent): boolean {
        const changedPosition = super._draggingItemMouseMove(item, event);
        if (
            !changedPosition ||
            !item['[Controls/_display/TreeItem]'] ||
            item.isNode() === null ||
            !this._options.supportExpand
        ) {
            return changedPosition;
        }

        const dndListController = this.getDndListController();
        const position = dndListController.getDragPosition();
        this._clearTimeoutForExpandOnDrag();

        if (!item.isExpanded() && position.position === 'on') {
            this._timeoutForExpandOnDrag = setTimeout(
                () => _private.toggleExpanded(this, item),
                EXPAND_ON_DRAG_DELAY
            );
        }

        return changedPosition;
    }

    protected _beforeStartDrag(draggedKey: CrudEntityKey): void {
        super._beforeStartDrag(draggedKey);
        const draggedItem = this._listViewModel.getItemBySourceKey(draggedKey);
        // сворачиваем перетаскиваемый узел
        if (draggedItem && draggedItem.isNode() !== null) {
            this._expandController.collapseItem(draggedKey);

            if (this._options.expandedItems &&
                !isEqual(this._options.expandedItems, this._expandController.getExpandedItems())) {
                this._notify('expandedItemsChanged', [this._expandController.getExpandedItems()]);
            }
            if (this._options.collapsedItems &&
                !isEqual(this._options.collapsedItems, this._expandController.getCollapsedItems())) {
                this._notify('collapsedItemsChanged', [this._expandController.getCollapsedItems()]);
            }
            this._expandController.applyStateToModel();
        }
    }

    protected _dragLeave(): void {
        super._dragLeave();
        this._clearTimeoutForExpandOnDrag();
    }

    protected _notifyDragEnd(dragObject: IDragObject, targetPosition: IDragPosition<CollectionItem>): unknown {
        this._clearTimeoutForExpandOnDrag();
        return super._notifyDragEnd(dragObject, targetPosition);
    }

    protected _getSourceControllerOptionsForGetDraggedItems(selection: ISelectionObject): ISourceControllerOptions {
        const options = super._getSourceControllerOptionsForGetDraggedItems(selection);

        options.deepReload = true;
        options.expandedItems = this._expandController.getExpandedItems();
        options.root = this._root;

        // Нам не нужен multiNavigation, т.к. мы хотим получить записи именно по selection, независимо от развернутости.
        delete options.multiNavigation;

        return options;
    }

    private _clearTimeoutForExpandOnDrag(): void {
        clearTimeout(this._timeoutForExpandOnDrag);
        this._timeoutForExpandOnDrag = null;
    }

    // endregion Drag

    protected _notifyItemClick([e, item, originalEvent, columnIndex]: [SyntheticEvent, Model, SyntheticEvent, number?],
                               returnExpandResult: boolean /* for tests */) {
        if (originalEvent.target.closest('.js-controls-Tree__row-expander')) {
            e?.stopImmediatePropagation();
            return false;
        }
        const superResult = super._notifyItemClick(...arguments);
        if (e.isStopped()) {
            return;
        }
        if (this.isLoading()) {
            return;
        }
        const eventResult = superResult;

        if (eventResult !== false && this._options.expandByItemClick && item.get(this._options.nodeProperty) !== null) {
            const display = this._listViewModel;
            const dispItem = display.getItemBySourceItem(item);

            // Если в проекции нет такого элемента, по которому произошел клик, то это хлебная крошка, а не запись.
            // После исправления ошибки событие itemClick не будет стрелять при клике на крошку.
            // https://online.sbis.ru/opendoc.html?guid=4017725f-9e22-41b9-adab-0d79ad13fdc9
            if (dispItem && (
                (eventResult !== false && this._options.expandByItemClick && dispItem.isNode() !== null) ||
                dispItem.GroupNodeItem)) {
                const expandResult = _private.toggleExpanded(this, dispItem);

                if (returnExpandResult) {
                    return expandResult;
                }
            }
        }
        return eventResult;
    }

    protected _itemMouseDown(event, itemData, domEvent) {
        if (domEvent.target.closest('.js-controls-Tree__row-expander')) {
            event.stopImmediatePropagation();
            this._onExpanderMouseDown(domEvent.nativeEvent, itemData.key);
        } else {
            super._itemMouseDown(event, itemData, domEvent);
        }
    }

    protected _itemMouseUp(e, itemData, domEvent): void {
        if (domEvent.target.closest('.js-controls-Tree__row-expander')) {
            e.stopImmediatePropagation();
            this._onExpanderMouseUp(domEvent.nativeEvent, itemData.key, itemData);
        } else {
            super._itemMouseUp(e, itemData, domEvent);
        }
    }

    private _onExpanderMouseDown(nativeEvent: MouseEvent, key: TKey): void {
        if (this.isLoading()) {
            return;
        }

        if (MouseUp.isButton(nativeEvent, MouseButtons.Left)) {
            this._mouseDownExpanderKey = key;
        }
    }

    private _onExpanderMouseUp(nativeEvent: MouseEvent, key: TKey, itemData: { dispItem: CollectionItem }): void {
        if (this.isLoading()) {
            return;
        }

        if (this._mouseDownExpanderKey === key && MouseUp.isButton(nativeEvent, MouseButtons.Left)) {
            _private.toggleExpanded(this, itemData);

            if (this._options.markItemByExpanderClick) {
                this.setMarkedKey(key);
            }
        }

        this._mouseDownExpanderKey = undefined;
    }

    _onViewKeyDown(event): void {
        if (this._options.supportExpand !== false && this._listViewModel.SupportExpand !== false) {
            this._onTreeViewKeyDown(event);
        }
        if (!event.stopped && event._bubbling !== false) {
            super._onViewKeyDown(event);
        }
    }

    _onTreeViewKeyDown(event) {
        EventUtils.keysHandler(event, HOT_KEYS, _private, this);
    }

    protected _afterReloadCallback(options: TOptions, loadedList?: RecordSet) {
        if (this._listViewModel) {
            // На _beforeUpdate уже поздно обновлять контроллер, т.к. данный метод вызовется
            // из BaseControl::_beforeUpdate до логики в TreeControl::_beforeUpdate
            // и он заюзает expandController со старой моделью
            // TODO удалить после https://online.sbis.ru/opendoc.html?guid=961081b9-a94d-4694-9165-cd56cc843ab2
            this._expandController.updateOptions({model: this._listViewModel});

            const modelRoot = this._listViewModel.getRoot();
            const root = this._options.root !== undefined ? this._options.root : this._root;
            const viewModelRoot = modelRoot ? modelRoot.getContents() : root;

            // Всегда нужно пересчитывать hasMoreStorage, т.к. даже если нет загруженных элементов или не deepReload,
            // то мы должны сбросить hasMoreStorage
            const sourceController = this.getSourceController();
            const expandedItems = _private.getExpandedItems(
                this, options, loadedList,
                this._updateExpandedItemsAfterReload
                    ? options.expandedItems
                    : this._expandController.getExpandedItems()
            );
            if (sourceController) {
                // Вызываем метод с флагом reBuildNodeFooters, т.к. после перезагрузки не будет события с добавлением
                // элементов и футеры без флага не посчитаются
                this._listViewModel.setHasMoreStorage(
                    _private.prepareHasMoreStorage(
                        sourceController, expandedItems, this._listViewModel.getHasMoreStorage()
                    ),
                    true
                );
            }

            if (this._updateExpandedItemsAfterReload) {
                this._expandController.disableLoader();
                this._expandController.setExpandedItems(options.expandedItems);
                this._expandController.applyStateToModel();
                this._expandController.enableLoader();

                this._updateExpandedItemsAfterReload = false;
            }

            if (this._needResetExpandedItems) {
                _private.resetExpandedItems(this);
                this._needResetExpandedItems = false;
            }

            if (viewModelRoot !== root) {
                this._listViewModel.setRoot(root);
            }

            this._loadedRoot = sourceController?.getRoot();
        }
    }

    protected _afterItemsSet(options): void {
        super._afterItemsSet.apply(this, arguments);
        if (options.markerMoveMode === 'leaves') {
            this.setMarkerOnFirstLeaf(options, options.markedKey);
        }
    }
    protected _afterCollectionReset(): void {
        super._afterCollectionReset.apply(this, arguments);
        if (this._options.markerMoveMode === 'leaves') {
            this.setMarkerOnFirstLeaf(this._options);
        }
    }
    protected _afterCollectionRemove(removedItems: Array<CollectionItem<Model>>, removedItemsIndex: number): void {
        super._afterCollectionRemove(removedItems, removedItemsIndex);

        const result = this._expandController.onCollectionRemove(removedItems);
        if (result.expandedItems) {
            this.getSourceController().setExpandedItems(result.expandedItems);
            this._notify('expandedItemsChanged', [result.expandedItems]);
        }
        if (result.collapsedItems) {
            this._notify('collapsedItemsChanged', [result.collapsedItems]);
        }
    }

    protected _onCollectionChangedScroll(
        action: string,
        newItems: TreeItem[],
        newItemsIndex: number,
        removedItems: TreeItem[],
        removedItemsIndex: number
    ) {
        // Если развернули или свернули узел,
        // то скролл нужно восстанавливать относительно первой полностью видимой записи.
        if (
            (action === IObservable.ACTION_ADD || action === IObservable.ACTION_REMOVE)
            && this._collectionChangeCauseByNode
        ) {
            this._collectionChangeCauseByNode = false;
            this._listVirtualScrollController.setPredicatedRestoreDirection('backward');
        }
        super._onCollectionChangedScroll(action, newItems, newItemsIndex, removedItems, removedItemsIndex);
    }

    protected _beforeDataLoadCallback(items: RecordSet, direction: IDirection): void {
        super._beforeDataLoadCallback(items, direction);

        const collection = this._listViewModel;
        const expandedItems
            = _private.getExpandedItems(this, this._options, items, this._expandController.getExpandedItems());
        const hasMoreStorage
            = _private.prepareHasMoreStorage(this._sourceController, expandedItems, collection.getHasMoreStorage());
        collection.setHasMoreStorage(hasMoreStorage, false);
    }

    private setMarkerOnFirstLeaf(options, startKey) {
        const markerController = this.getMarkerController();
        const model = this._listViewModel;
        const list = model.getCollection();
        const current = list.getRecordById(startKey) || list.at(0);
        if (current) {
            if (current.get(this._options.nodeProperty) !== null) {
                this._tempItem = current.getKey();
                this._currentItem = this._tempItem;
                this._doAfterItemExpanded = (itemKey) => {
                    this._doAfterItemExpanded = null;
                    this._applyMarkedLeaf(itemKey, model, markerController);
                };
                const eventResult = this._notify('beforeItemExpand', [current]);
                if (eventResult instanceof Promise) {
                        eventResult.then(() => {
                            this._expandedItemsToNotify = this._expandToFirstLeaf(this._tempItem, list, options);
                        });
                } else {
                    this._expandedItemsToNotify = this._expandToFirstLeaf(this._tempItem, list, options);
                }
            } else {
                this._applyMarkedLeaf(current.getKey(), model, markerController);
            }
        }
    }

    // раскрытие узлов будет отрефакторено по задаче
    // https://online.sbis.ru/opendoc.html?guid=2a2d9bc6-86e0-43fa-9bea-b636c45c0767
    _keyDownHandler(event): boolean {
        if (this._options.markerMoveMode === 'leaves') {
            switch (event.nativeEvent.keyCode) {
                case constants.key.up:
                    this.goToPrev();
                    return false;
                case constants.key.down:
                    this.goToNext();
                    return false;
            }
        }
    }

    private _expandToFirstLeaf(key: CrudEntityKey, items, options): CrudEntityKey[] {
        if (items.getCount()) {
            const model = this._listViewModel;
            const expanded = [key];
            const item = model.getItemBySourceKey(key);
            let curItem = model.getChildrenByRecordSet(item.getContents())[0];
            while (curItem && curItem.get(options.nodeProperty) !== null) {
                expanded.push(curItem.getKey());
                curItem = model.getChildrenByRecordSet(curItem)[0];
            }
            if (curItem && this._doAfterItemExpanded) {
                this._doAfterItemExpanded(curItem.getKey());
            }
            return expanded;
        }
    }

    private _getMarkedLeaf(key: CrudEntityKey, model): 'first' | 'last' | 'middle' | 'single' {
        const index = model.getIndexByKey(key);

        // Если не нашли элемент, значит, еще рано менять состояние.
        if (index === -1) {
            return this._markedLeaf;
        }
        const hasNextLeaf = (model.getLast('Markable') !== model.getItemBySourceKey(key)) || model.hasMoreData();
        let hasPrevLeaf = false;
        for (let i = index - 1; i >= 0; i--) {
            if (model.at(i).isNode() === null || !this._isExpanded(model.at(i).getContents())) {
                hasPrevLeaf = true;
                break;
            }
        }
        if (hasNextLeaf && hasPrevLeaf) {
            return 'middle';
        }
        if (!hasNextLeaf && !hasPrevLeaf) {
            return 'single';
        }
        if (!hasNextLeaf && hasPrevLeaf) {
            return 'last';
        }
        if (hasNextLeaf && !hasPrevLeaf) {
            return 'first';
        }
    }
    goToNext(listModel?, mController?): Promise {
        return new Promise((resolve) => {
            // Это исправляет ошибку плана 0 || null
            const key = this._tempItem === undefined || this._tempItem === null ? this._currentItem : this._tempItem;
            const model = listModel || this._listViewModel;
            const goToNextItem = () => {
                const item = this.getNextItem(key, model);
                const markerController = mController || this.getMarkerController();
                if (item) {
                    this._tempItem = item.getKey();
                    if (item.get(this._options.nodeProperty) !== null) {
                        this._doAfterItemExpanded = () => {
                            this._doAfterItemExpanded = null;
                            this.goToNext(model, markerController);
                        };
                        if (this._isExpanded(item)) {
                            this._doAfterItemExpanded();
                            resolve();
                        } else {
                            this._scrollToLeafOnDrawItems = true;
                            const expandResult = this.toggleExpanded(this._tempItem, model);
                            if (expandResult instanceof Promise) {
                                expandResult.then(() => {
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        }
                    } else {
                        const itemKey = this._tempItem;
                        this._applyMarkedLeaf(this._tempItem, model, markerController);
                        this._scrollToLeaf = () => {
                            this.scrollToItem(itemKey, 'bottom');
                        };
                        resolve();
                    }
                } else {
                    this._tempItem = null;
                    resolve();
                }
            };
            goToNextItem();
        });
    }

    goToPrev(listModel?, mController?): Promise {
        return new Promise((resolve) => {
            const item = this.getPrevItem(this._tempItem || this._currentItem, listModel);
            const model = listModel || this._listViewModel;
            const markerController = mController || this.getMarkerController();
            if (item) {
                const itemKey = item.getKey();
                const dispItem = model.getItemBySourceKey(item.getKey());
                if (item.get(this._options.nodeProperty) !== null) {
                    this._doAfterItemExpanded = () => {
                        this._doAfterItemExpanded = null;
                        this.goToPrev(model, markerController);
                    };
                    if (this._isExpanded(item)) {
                        this._tempItem = itemKey;
                        this._doAfterItemExpanded();
                        resolve();
                    } else {
                        this._goToNextAfterExpand = false;
                        this._scrollToLeafOnDrawItems = true;
                        const expandResult = this.toggleExpanded(itemKey);
                        if (expandResult instanceof Promise) {
                            expandResult.then(() => {
                                this._expandToFirstLeaf(itemKey, model.getCollection(), this._options);
                                resolve();
                            });
                        } else {
                            this._expandToFirstLeaf(itemKey, model.getCollection(), this._options);
                            resolve();
                        }
                    }
                } else {
                    this._tempItem = itemKey;
                    this._applyMarkedLeaf(this._tempItem, model, markerController);
                    this._scrollToLeaf = () => {
                        this.scrollToItem(itemKey, 'top');
                    };
                    resolve();
                }
            } else {
                this._tempItem = null;
                resolve();
            }
        });
    }

    /**
     * Метод для определения позиции добавляемой записи по-умолчанию.
     * Если в дереве маркер стоит на развернутом узле или на его дочерних записях/свёрнутых узлах,
     * то позиция по-умолчанию для добавляемой записи - этот раскрытый узел.
     * Во всех остальных случаях позицией будет текущий корень дерева.
     *
     * @return {TKey} Ключ розительского узла для добавления по-умолчанию.
     */
    getMarkedNodeKey(): TKey {
        const markedKey = this.getMarkerController().getMarkedKey();

        if (typeof markedKey !== 'undefined') {
            const markedRecord = this.getViewModel().getItemBySourceKey(markedKey);

            if (markedRecord) {
                if (markedRecord.isExpanded && markedRecord.isExpanded()) {
                    // Узел раскрыт.
                    return markedRecord.contents.getKey();
                } else if (!markedRecord.getParent().isRoot()) {
                    // Если запись вложена, то добавлять нужно в родителя, т.к. он - развернутый узел.
                    return markedRecord.getParent().contents.getKey();
                }
            }
        }

        const currentRoot = this.getViewModel().getRoot();
        return currentRoot.isRoot() ? currentRoot.contents : currentRoot.contents.getKey();
    }

    private _applyMarkedLeaf(key: CrudEntityKey, model, markerController): void {
        this._currentItem = key;
        const newMarkedLeaf = this._getMarkedLeaf(this._currentItem, model);
        if (this._markedLeaf !== newMarkedLeaf) {
            if (this._options.markedLeafChangeCallback) {
                this._options.markedLeafChangeCallback(newMarkedLeaf);
            }
            this._markedLeaf = newMarkedLeaf;
        }

        if (this._isMounted) {
            this._changeMarkedKey(this._currentItem);
        } else {
            markerController.setMarkedKey(this._currentItem);
        }

        this._tempItem = null;
        this._goToNextAfterExpand = true;
    }

    protected _changeMarkedKey(newMarkedKey: CrudEntityKey,
                               shouldFireEvent: boolean = false): Promise<CrudEntityKey> | CrudEntityKey {
        const item = this.getViewModel().getItemBySourceKey(newMarkedKey);
        if (this._options.markerMoveMode === 'leaves' && (item && item.isNode() !== null)) {
            return;
        }

        return super._changeMarkedKey(newMarkedKey, shouldFireEvent);
    }

    getNextItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._listViewModel;
        const nextItem = listModel.getNextInRecordSetProjection(key, this._expandController.getExpandedItems());
        return nextItem || null;
    }

    getPrevItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._listViewModel;
        const prevItem = listModel.getPrevInRecordSetProjection(key, this._expandController.getExpandedItems());
        return prevItem || null;
    }

    private _isExpanded(item: Model): boolean {
        return this._expandController.isItemExpanded(item.getKey());
    }

    protected _getFooterSpacingClasses(options): string {
        let result = super._getFooterSpacingClasses(options);

        if (this._listViewModel && this._listViewModel['[Controls/_display/Tree]']) {
            const expanderVisibility = this._listViewModel.getExpanderVisibility();
            const expanderPosition = options.expanderPosition || 'default';
            const hasExpander = expanderPosition === 'default'
                && this._listViewModel.getExpanderIcon() !== 'none'
                && (expanderVisibility === 'hasChildren' && this._listViewModel.hasNodeWithChildren()
                || expanderVisibility !== 'hasChildren' && this._listViewModel.hasNode());
            if (hasExpander) {
                result += ` controls-TreeGridView__expanderPadding-${options.expanderSize || 'default'}`;
            }
        }

        return result;
    }

    protected _getSiblingsStrategy(): ISiblingStrategy {
        return new TreeSiblingStrategy({
            collection: this._listViewModel
        });
    }

    /**
     * Ф-ия, которая дёргается expandController'ом при раскрытии узла
     */
    private _expandLoader(nodeKey: TKey): void | Promise<RecordSet | void> {
        const listViewModel = this.getViewModel();
        const baseSourceController = this.getSourceController();
        const dispItem = listViewModel.getItemBySourceKey(nodeKey);

        if (
            dispItem?.isRoot() ||
            baseSourceController?.hasLoaded(nodeKey) ||
            !_private.shouldLoadChildren(this, nodeKey) ||
            this._expandController.isAllExpanded()
        ) {
            return;
        }

        this._displayGlobalIndicator();
        return baseSourceController
            .load(undefined, nodeKey)
            .then((list) => {
                if (this._indicatorsController.shouldHideGlobalIndicator()) {
                    this._indicatorsController.hideGlobalIndicator();
                }
                return list as RecordSet;
            })
            .catch((error: Error) => {
                if (error.isCanceled) {
                    return;
                }
                if (this._indicatorsController.shouldHideGlobalIndicator()) {
                    this._indicatorsController.hideGlobalIndicator();
                }
                throw error;
            });
    }

    protected _nodeDataMoreLoadCallback(): void {
        // пересчитываем hasMoreStorage до того, как элементы засетятся в модель,
        // чтобы в модели был только один пересчет элементов
        const expandedItems = _private.getExpandedItems(
            this, this._options, this._listViewModel.getCollection(), this._listViewModel.getExpandedItems()
        );
        this._listViewModel.setHasMoreStorage(
            _private.prepareHasMoreStorage(
                this.getSourceController(), expandedItems, this._listViewModel.getHasMoreStorage()
            )
        );
    }

    static getDefaultOptions() {
        return {
            ...BaseControl.getDefaultOptions(),
            filter: {},
            markItemByExpanderClick: true,
            expandByItemClick: false,
            root: null,
            columns: DEFAULT_COLUMNS_VALUE,
            selectDescendants: true,
            selectAncestors: true,
            expanderPosition: 'default',
            selectionType: 'all',
            markerMoveMode: 'all',
            supportExpand: true
        };
    }
}

Object.defineProperty(TreeControl, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return TreeControl.getDefaultOptions();
   }
});

TreeControl._private = _private;

export default TreeControl;

/**
 * @event Событие контрола.
 * @name Controls/_tree/TreeControl#expandedItemsChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} expandedItems Массив с идентификаторами развернутых элементов.
 */
