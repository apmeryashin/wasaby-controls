import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_actions/Container';
import ActionsCollection from './ActionsCollection';
import {IAction} from './IAction';
import {SyntheticEvent} from 'UI/Vdom';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {Object as EventObject} from 'Env/Event';
import {TKeySelection} from 'Controls/interface';
import Store from 'Controls/Store';

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
    private _sourceController: SourceController;

    protected _beforeMount(options: IContainerOptions): void {
        this._updateActions = this._updateActions.bind(this);
        this._subscribeCollectionChange(options._dataOptionsValue);
        this._actionsCollection = new ActionsCollection({
            actions: options.actions,
            listActions: options.listActions
        });
        this._toolbarItems = this._getToolbarItems(this._actionsCollection.getToolbarItems());
        this._actionsCollection.subscribe('toolbarConfigChanged', (event, items) => {
            this._toolbarItems = this._getToolbarItems(items);
        });
    }

    protected _getToolbarItems(items: IAction[]): RecordSet {
        return new RecordSet({
            keyProperty: 'id',
            rawData: items
        });
    }

    protected _beforeUpdate(newOptions: IContainerOptions): void {
        if (newOptions.selectedKeys !== this._options.selectedKeys ||
            newOptions.excludedKeys !== this._options.excludedKeys) {
            this._actionsCollection.selectionChange(newOptions._dataOptionsValue.items, {
                selected: newOptions.selectedKeys,
                excluded: newOptions.excludedKeys
            });
        }
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
        const action = this._actionsCollection.getAction(item);
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
    }

    private _updateActions(event: EventObject, items: RecordSet): void {
        this._actionsCollection.collectionChange(items);
    }

    protected _beforeUnmount(): void {
        if (this._sourceController) {
            this._sourceController.unsubscribe('itemsChanged', this._updateActions);
        }
    }

    static defaultProps: Partial<IContainerOptions> = {
        listActions: [],
        actions: []
    };
}
