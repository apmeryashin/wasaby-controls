import {isLoaded, loadSync} from 'WasabyLoader/ModulesLoader';
import {EventRaisingMixin, Model, ObservableMixin} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {mixin} from 'Types/util';
import {IBaseAction} from './BaseAction';
import {IAction} from './IAction';
import {ISelectionObject} from 'Controls/interface';
import {isEqual} from 'Types/object';
import {showType} from 'Controls/toolbars';
import {Logger} from 'UI/Utils';
import {ILoadDataResult} from 'Controls/_dataSource/DataLoader';

/**
 * @public
 * @author Золотова Э.Е.
 */
interface IPrefetchResult {
    key: string | number;
    prefetchResult: ILoadDataResult;
}

interface IActionsCollectionOptions {
    actions: IAction[];
    prefetch: IPrefetchResult[];
}

const BASE_ACTION_MODULE = 'Controls/actions:BaseAction';

export default class ActionsCollection extends mixin<ObservableMixin>(
    ObservableMixin
) {
    protected _actions: IBaseAction[];
    protected _toolbarItems: IAction[] = [];
    protected _prefetchData: Record<string | number, ILoadDataResult> = {};
    protected _options: IActionsCollectionOptions;
    protected _childItems: Record<string | number, RecordSet> = {};
    protected _operationsPanelVisible: boolean = false;

    constructor(options: IActionsCollectionOptions) {
        super();
        EventRaisingMixin.call(this, options);
        this._options = options;
        if (options.prefetch) {
            options.prefetch.forEach((result) => {
                this._prefetchData[result.key] = result.prefetchResult;
            });
        }
        this._initActionsAndUpdateConfig();
    }

    filterChanged(filter: object): void {
        this._callChangeAction('filterChanged', [filter]);
    }

    private _initActions(options: IActionsCollectionOptions): void {
        this._childItems = {};
        this._actions = this._createActions(options.actions);
    }

    update(options: IActionsCollectionOptions): void {
        if (!isEqual(this._options, options)) {
            this._options = options;
            this._initActionsAndUpdateConfig();
        }
    }

    private _notifyConfigChanged(): void {
        this._notify('toolbarConfigChanged', this.getToolbarItems());
    }

    getAction(item: Model<IAction>): IBaseAction {
        return this.getActionById(item.getKey());
    }

    getExecuteAction(item: Model<IAction>): IBaseAction {
        return this.getActionByItem(item);
    }

    getActionByItem(item: Model<IAction>): IBaseAction {
        const action = this.getActionById(item.getKey());
        if (action) {
            return action;
        } else {
            const parentKey = item.get('parent');
            const parentRS = Object.values(this._childItems).find((childs) => {
                return childs.getRecordById(parentKey);
            });
            const parentItem = parentRS?.getRecordById(parentKey);
            if (!parentItem) {
                return this.getActionById(parentKey);
            } else {
                return this.getActionByItem(parentItem);
            }
        }
    }

    addChildItems(id: string, items: RecordSet): void {
        this._childItems[id] = items;
    }

    getActionById(id: unknown): IBaseAction {
        return this._actions.find((action) => action.id === id);
    }

    collectionChange(items: RecordSet, selection: ISelectionObject): void {
        this._callChangeAction('onCollectionChanged', [items, selection]);
    }

    selectionChange(items: RecordSet, selection: ISelectionObject): void {
        this._callChangeAction('onSelectionChanged', [items, selection]);
    }

    private _callChangeAction(methodName: string, changedArgs: unknown[]): void {
        this._actions.forEach((action) => {
            if (action[methodName]) {
                action[methodName].apply(action, changedArgs);
            }
        });
    }

    setOperationsPanelVisible(state: boolean): void {
        this._operationsPanelVisible = state;
        this._notifyConfigChanged();
    }

    getToolbarItems(): IAction[] {
        return this._toolbarItems.filter((toolbarItem) => {
            return toolbarItem.visible;
        });
    }

    getMenuItems(): IAction[] {
        return this.getToolbarItems().filter((toolbarItem) => {
            const isToolbarItem = toolbarItem.showType === showType.TOOLBAR;
            return !isToolbarItem;
        });
    }

    protected _getToolbarItemsByActions(actions: IBaseAction[]): IAction[] {
        return actions.map((action) => {
            return action.getState();
        }).sort((operationFirst, operationSecond) => {
            return operationFirst.order - operationSecond.order;
        });
    }

    private _updateToolbarItems(): void {
        this._toolbarItems = this._getToolbarItemsByActions(this._actions);
    }

    private _itemChanged(): void {
        this._updateToolbarItems();
        this._notifyConfigChanged();
    }

    setActions(actions: IAction[]): void {
        if (!isEqual(actions, this._options.actions)) {
            this._options.actions = actions;
            this._initActionsAndUpdateConfig();
        }
    }

    private _initActionsAndUpdateConfig(options: IActionsCollectionOptions = this._options): void {
        this._initActions(options);
        this._updateToolbarItems();
        this._notifyConfigChanged();
    }

    private _createAction(actionOptions: IAction): IBaseAction {
        const actionName = actionOptions.actionName || BASE_ACTION_MODULE;
        if (!isLoaded(actionName)) {
            Logger.error(`ActionsCollection::Во время создания коллекции произошла ошибка.
                                   Action ${actionName} не был загружен до создания коллекции`);
        } else {
            const action = loadSync(actionName);
            const actionClass = new action({
                ...actionOptions,
                prefetchResult: this._prefetchData[actionOptions.prefetchResultId]
            });
            actionClass.subscribe('itemChanged', this._itemChanged.bind(this));
            return actionClass;
        }
    }

    private _createActions(actions: IAction[]): IBaseAction[] {
        return actions.map((action) => {
            return this._createAction(action);
        });
    }
}
