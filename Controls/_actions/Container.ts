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
import {ControllerClass as FilterController} from 'Controls/filter';

interface IContainerOptions extends IControlOptions {
    prefetchData: ILoadDataResult[];
    actions: IAction[];
    selectedKeys: TKeySelection;
    excludedKeys: TKeySelection;
    sourceController?: SourceController;
    filterController?: FilterController;
    operationsController?: OperationsController;
}

const START_ORDER_NOT_DEFAULT_ACTIONS = 1000;

export default class ActionsContainer extends Control<IContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _actionsCollection: ActionsCollection;
    protected _toolbarItems: RecordSet;
    protected _menuSource: MenuSource = null;
    private _sourceController: SourceController;
    private _operationsController: OperationsController =  null;
    private _filterController: FilterController = null;

    constructor(cfg: IControlOptions, context?: object) {
        super(cfg, context);
        this._updateActions = this._updateActions.bind(this);
        this._operationsPanelVisibleChanged = this._operationsPanelVisibleChanged.bind(this);
        this._actionsChanged = this._actionsChanged.bind(this);
        this._selectionChanged = this._selectionChanged.bind(this);
        this._filterChanged = this._filterChanged.bind(this);
    }

    protected _actionsChanged(e: SyntheticEvent, actions: IAction[]): void {
        this._actionsCollection.setActions(actions);
    }

    protected _beforeMount(options: IContainerOptions): void {
        this._subscribeControllersChanges(options);
        this._actionsCollection = new ActionsCollection({
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

    protected _filterChanged(event: SyntheticEvent, filter: object): void {
        this._actionsCollection.filterChanged(filter);
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
            action.order = action.order
                ? action.order + START_ORDER_NOT_DEFAULT_ACTIONS
                : START_ORDER_NOT_DEFAULT_ACTIONS;
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
        if (options.actions !== this._options.actions) {
            this._actionsCollection.update({
                actions: this._prepareActionsOrder(options.actions),
                prefetch: options.prefetchData
            });
        }
        if (this._options.prefetchData !== options.prefetchData) {
            this._unsubscribeFromControllers();
            this._subscribeControllersChanges(options);
        }
    }

    protected _toolbarItemClick(
        event: SyntheticEvent,
        item: Model,
        clickEvent: SyntheticEvent
    ): void {
        event.stopPropagation();
        const action = this._actionsCollection.getExecuteAction(item);
        Store.dispatch('executeOperation', {
            action,
            clickEvent,
            toolbarItem: item
        });
        this._notify('operationPanelItemClick', [action, clickEvent, item], {bubbling: true});
    }

    private _subscribeControllersChanges(options: IContainerOptions): void {
        this._filterController = options.filterController;
        this._operationsController = options.operationsController;
        this._sourceController = options.sourceController;
        if (this._filterController) {
            this._filterController.subscribe('filterChanged', this._filterChanged);
        }
        if (this._sourceController) {
            this._sourceController.subscribe('itemsChanged', this._updateActions);
        }
        if (this._operationsController) {
            this._operationsController.subscribe('operationsPanelVisibleChanged',
                this._operationsPanelVisibleChanged);
            this._operationsController.subscribe('selectionChanged', this._selectionChanged);
            this._operationsController.subscribe('actionsChanged', this._actionsChanged);
        }
    }

    private _updateActions(event: EventObject, items: RecordSet): void {
        this._actionsCollection.collectionChange(items);
    }

    protected _unsubscribeFromControllers(): void {
        if (this._sourceController) {
            this._sourceController.unsubscribe('itemsChanged', this._updateActions);
        }
        if (this._operationsController) {
            this._operationsController.unsubscribe('operationsPanelVisibleChanged',
                this._operationsPanelVisibleChanged);
            this._operationsController.unsubscribe('selectionChanged', this._selectionChanged);
            this._operationsController.unsubscribe('operationsMenuVisibleChanged', this._operationsPanelVisibleChanged);
            this._operationsController.unsubscribe('actionsChanged', this._actionsChanged);
        }
        if (this._filterController) {
            this._filterController.unsubscribe('filterChanged', this._filterChanged);
        }
    }

    protected _beforeUnmount(): void {
        this._unsubscribeFromControllers();
    }

    static defaultProps: Partial<IContainerOptions> = {
        actions: []
    };
}
