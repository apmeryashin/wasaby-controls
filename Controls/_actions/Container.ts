import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_actions/Container';
import ActionsCollection from './ActionsCollection';
import {IAction} from './IAction';
import {SyntheticEvent} from 'UI/Vdom';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {NewSourceController as SourceController, ILoadDataResult} from 'Controls/dataSource';
import {Object as EventObject} from 'Env/Event';
import {ISelectionObject, TKeySelection} from 'Controls/interface';
import Store from 'Controls/Store';
import MenuSource from './MenuSource';
import {ControllerClass as OperationsController} from 'Controls/operations';

interface IContainerOptions extends IControlOptions {
    _dataOptionsValue: {
        sourceController?: SourceController
    };
    prefetchData: ILoadDataResult[];
    listActions?: IAction[];
    actions: IAction[];
    selectedKeys: TKeySelection;
    excludedKeys: TKeySelection;
}

const INVERT_ACTION_CONFIG = {
    actionName: 'Controls/actions:InvertSelection',
    order: 1
};

const DEFAULT_LIST_ACTIONS = [INVERT_ACTION_CONFIG];
const START_ORDER_NOT_DEFAULT_ACTIONS = 1000;

export default class ActionsContainer extends Control<IContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _actionsCollection: ActionsCollection;
    protected _toolbarItems: RecordSet;
    protected _menuSource: MenuSource = null;
    private _sourceController: SourceController;
    private _operationsController: OperationsController =  null;

    constructor() {
        super();
        this._updateActions = this._updateActions.bind(this);
        this._operationsPanelVisibleChanged = this._operationsPanelVisibleChanged.bind(this);
        this._operationsMenuVisibleChanged = this._operationsMenuVisibleChanged.bind(this);
        this._selectionChanged = this._selectionChanged.bind(this);
    }

    protected _beforeMount(options: IContainerOptions): void {
        this._subscribeControllersChanges(options._dataOptionsValue, options.prefetchData);
        this._actionsCollection = new ActionsCollection({
            listActions: this._prepareActionsOrder(options.listActions).concat(DEFAULT_LIST_ACTIONS),
            actions: this._prepareActionsOrder(options.actions),
            prefetch: options.prefetchData
        });
        this._toolbarItems = this._getToolbarItems(this._actionsCollection.getToolbarItems());
        this._actionsCollection.subscribe('toolbarConfigChanged', (event, items) => {
            this._toolbarItems = this._getToolbarItems(items);
            this._menuSource = new MenuSource({
                collection: this._actionsCollection
            });
        });
        this._menuSource = new MenuSource({
            collection: this._actionsCollection
        });
    }

    protected _operationsMenuVisibleChanged(e: SyntheticEvent, state: boolean): void {
        if (state) {
            this._children.toolbar.openMenu();
        } else {
            this._children.toolbar.closeMenu();
        }
    }

    protected _beforeMenuOpen(e: SyntheticEvent, item: Model): object | void {
        if (this._operationsController.getOperationsPanelVisible() && !item) {
            return {
                templateOptions: {
                    backgroundStyle: 'secondary',
                    hoverBackgroundStyle: 'secondary',
                    itemTemplateProperty: 'itemTemplate'
                }
            };
        } else {
            return {
                popupOptions: {
                    closeOnOutsideClick: true
                }
            };
        }
    }

    protected _getToolbarItems(items: IAction[]): RecordSet {
        return new RecordSet({
            keyProperty: 'id',
            rawData: items
        });
    }

    protected _prepareActionsOrder(actions: IAction[]): IAction[] {
        const resultActions = [...actions];
        return resultActions.map((action) => {
            action.order = action.order ? action.order + START_ORDER_NOT_DEFAULT_ACTIONS : START_ORDER_NOT_DEFAULT_ACTIONS;
            return action;
        });
    }

    protected _operationsPanelVisibleChanged(e: SyntheticEvent, state: boolean): void {
        this._actionsCollection.setOperationsPanelVisible(state);
    }

    protected _selectionChanged(e: SyntheticEvent, selection: ISelectionObject): void {
        this._actionsCollection.selectionChange(this._sourceController.getItems(), selection);
    }

    protected _beforeUpdate(options: IContainerOptions): void {
        if (options.actions !== this._options.actions ||
            this._options.listActions !== options.listActions
        ) {
            this._actionsCollection.update({
                listActions: this._prepareActionsOrder(options.listActions).concat(DEFAULT_LIST_ACTIONS),
                actions: this._prepareActionsOrder(options.actions),
                prefetch: options.prefetchData
            });
        }
    }

    protected _toolbarItemClick(
        event: SyntheticEvent,
        item: Model,
        clickEvent: SyntheticEvent
    ): boolean {
        event.stopPropagation();
        const isOperationsPanelVisible = this._operationsController.getOperationsPanelVisible();
        const action = this._actionsCollection.getExecuteAction(item);
        Store.dispatch('executeOperation', {
            action,
            clickEvent,
            toolbarItem: item
        });
        this._notify('operationPanelItemClick', [action, clickEvent, item], {bubbling: true});
        return !isOperationsPanelVisible || !!item.get('parent');
    }

    getSourceController(dataValue, prefetch: ILoadDataResult[]): SourceController {
        if (prefetch) {
            return prefetch[0].prefetchResult?.sourceController;
        } else {
            return dataValue.sourceController;
        }
    }

    getOperationController(dataValue, prefetch: ILoadDataResult[]): OperationsController {
        if (prefetch) {
            return prefetch[0].prefetchResult?.operationsController;
        } else {
            return dataValue.operationsController;
        }
    }

    private _subscribeControllersChanges(dataContext, prefetch: ILoadDataResult[]): void {
        if (prefetch || dataContext) {
            this._sourceController = this.getSourceController(dataContext, prefetch);
            this._operationsController = this.getOperationController(dataContext, prefetch);
            this._sourceController.subscribe('itemsChanged', this._updateActions);
            this._operationsController.subscribe('operationsPanelVisibleChanged', this._operationsPanelVisibleChanged);
            this._operationsController.subscribe('selectionChanged', this._selectionChanged);
            this._operationsController.subscribe('operationsMenuVisibleChanged', this._operationsMenuVisibleChanged);
        }
    }

    private _updateActions(event: EventObject, items: RecordSet): void {
        this._actionsCollection.collectionChange(items);
    }

    protected _toolbarMenuOpened(): void {
        if (this._operationsController.getOperationsPanelVisible()) {
            this._operationsController.setOperationsMenuVisible(true);
        }
    }

    protected _toolbarMenuClosed(): void {
        this._operationsController.setOperationsMenuVisible(false);
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.unsubscribe('itemsChanged', this._updateActions);
        }
        if (this._operationsController) {
            this._operationsController.unsubscribe('operationsPanelVisibleChanged',
                this._operationsPanelVisibleChanged);
            this._operationsController.unsubscribe('selectionChanged', this._selectionChanged);
            this._operationsController.unsubscribe('operationsMenuVisibleChanged', this._operationsPanelVisibleChanged);
        }
    }

    static defaultProps: Partial<IContainerOptions> = {
        listActions: [],
        actions: []
    };
}
