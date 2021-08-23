import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_actions/Container';
import ActionsCollection from './ActionsCollection';
import {IAction} from './IAction';
import {SyntheticEvent} from 'UI/Vdom';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {Object as EventObject} from 'Env/Event';
import {ISelectionObject, TKeySelection} from 'Controls/interface';
import Store from 'Controls/Store';
import MenuSource from './MenuSource';
import {ControllerClass as OperationsController} from 'Controls/operations';

interface IContainerOptions extends IControlOptions {
    _dataOptionsValue: {
        sourceController?: SourceController
    };
    listActions?: IAction[];
    actions: IAction[];
    selectedKeys: TKeySelection;
    excludedKeys: TKeySelection;
}

export default class ActionsContainer extends Control<IContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _actionsCollection: ActionsCollection;
    protected _toolbarItems: RecordSet;
    protected _menuSource: MenuSource = null;
    private _sourceController: SourceController;
    private _operationsController: OperationsController =  null;

    protected _beforeMount(options: IContainerOptions): void {
        this._updateActions = this._updateActions.bind(this);
        this._operationsPanelVisibleChanged = this._operationsPanelVisibleChanged.bind(this);
        this._selectionChanged = this._selectionChanged.bind(this);
        this._subscribeCollectionChange(options._dataOptionsValue);
        this._actionsCollection = new ActionsCollection({
            actions: options.actions,
            listActions: options.listActions
        });
        this._toolbarItems = this._getToolbarItems(this._actionsCollection.getToolbarItems());
        this._actionsCollection.subscribe('toolbarConfigChanged', (event, items) => {
            this._toolbarItems = this._getToolbarItems(items);
        });
        this._menuSource = new MenuSource({
            collection: this._actionsCollection
        });
    }

    protected _getToolbarItems(items: IAction[]): RecordSet {
        return new RecordSet({
            keyProperty: 'id',
            rawData: items
        });
    }

    protected _operationsPanelVisibleChanged(e: SyntheticEvent, state: boolean): void {
        this._actionsCollection.setOperationsPanelVisible(state);
    }

    protected _selectionChanged(e: SyntheticEvent, selection: ISelectionObject): void {
        this._actionsCollection.selectionChange(this._sourceController.getItems(), selection);
    }

    protected _beforeUpdate(newOptions: IContainerOptions): void {
        if (newOptions.actions !== this._options.actions) {
            this._actionsCollection.update({
                listActions: newOptions.listActions,
                actions: newOptions.actions
            });
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
            clickEvent
        });
        this._notify('operationPanelItemClick', [action, clickEvent], {bubbling: true});
    }

    private _subscribeCollectionChange(dataContext): void {
        if (dataContext.sourceController) {
            this._sourceController = dataContext.sourceController;
            this._sourceController.subscribe('itemsChanged', this._updateActions);
        }
        if (dataContext.operationsController) {
            this._operationsController = dataContext.operationsController;
            this._operationsController.subscribe('operationsPanelVisibleChanged', this._operationsPanelVisibleChanged);
            this._operationsController.subscribe('selectionChanged', this._selectionChanged);
        }
    }

    private _updateActions(event: EventObject, items: RecordSet): void {
        this._actionsCollection.collectionChange(items);
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.unsubscribe('itemsChanged', this._updateActions);
        }
        if (this._operationsController) {
            this._operationsController.unsubscribe('operationsPanelVisibleChanged',
                this._operationsPanelVisibleChanged);
            this._operationsController.unsubscribe('selectionChanged', this._selectionChanged);
        }
    }

    static defaultProps: Partial<IContainerOptions> = {
        listActions: [],
        actions: []
    };
}
