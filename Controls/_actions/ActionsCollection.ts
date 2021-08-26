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
interface IPrefetchResult  {
    key: string | number;
    prefetchResult: ILoadDataResult;
}

interface IActionsCollectionOptions {
    listActions: IAction[];
    actions: IAction[];
    prefetch: IPrefetchResult[];
}

const BASE_ACTION_MODULE = 'Controls/actions:BaseAction';
const MAX_VISIBLE_BASIC_ACTIONS_WITH_OPERATION_PANEL = 5;

export default class ActionsCollection extends mixin<ObservableMixin>(
    ObservableMixin
) {
    protected _actions: IBaseAction[];
    protected _listActions: IBaseAction[] = [];
    protected _toolbarItems: IAction[] = [];
    protected _prefetchData: Record<string | number, ILoadDataResult> = {};
    protected _options: IActionsCollectionOptions;
    protected _childItems: Record<unknown, any> = {};
    protected _operationsPanelVisible: boolean = false;

    constructor(options: IActionsCollectionOptions) {
        super();
        EventRaisingMixin.call(this, options);
        this._options = options;
        this._actions = this._createActions(options.actions);
        this._toolbarItems = this._getToolbarItemsByActions(this._actions);
        if (options.prefetch) {
            options.prefetch.forEach((result) => {
                this._prefetchData[result.key] = result.prefetchResult;
            });
        }
    }

    update(options: IActionsCollectionOptions): void {
        if (!isEqual(this._options, options)) {
            this._options = options;
            this._updateToolbarItems();
        }
    }

    getAction(item: Model<IAction>): IBaseAction {
        return this.getActionById(item.getKey());
    }

    getExecuteAction(item: Model<IAction>): IBaseAction {
        return this.getActionByItem(item);
    }

    getActionByItem(item: Model<IAction>): IBaseAction {
        let action = this.getActionById(item.getKey());
        if (action) {
            return action;
        } else {
            const parentKey = item.get('parent');
            const parentItem = Object.values(this._childItems).find((childs) => {
                return childs.getRecordById(parentKey);
            });
            if (!parentItem) {
                return this.getActionById(parentKey);
            } else {
                return this.getActionByItem(parentItem);
            }
        }
    }

    protected _updateToolbarItems(): void {
        this._actions = this._createActions(this._options.actions);
        this._toolbarItems = this._getToolbarItemsByActions(this._actions);
        this._childItems = {};
        this._notify('toolbarConfigChanged', this._toolbarItems);
    }

    addChildItems(id: string, items: RecordSet): void {
        this._childItems[id] = items;
    }

    getActionById(id: unknown): IBaseAction {
        return this._actions.find((action) => action.id === id);
    }

    collectionChange(items: RecordSet, selection: ISelectionObject): void {
        this._callChangeAction('onCollectionChanged', items, selection);
    }

    selectionChange(items: RecordSet, selection: ISelectionObject): void {
        this._callChangeAction('onSelectionChanged', items, selection);
    }

    setOperationsPanelVisible(state: boolean): void {
        this._operationsPanelVisible = state;
        if (this._operationsPanelVisible) {
            this._listActions = this._createActions(this._options.listActions);
            this._actions = this._actions.concat(this._listActions);
        } else {
            this._actions = this._actions.filter((action) => {
                return !this._listActions.includes(action);
            });
        }
        this._toolbarItems = this._getToolbarItemsByActions(this._actions);
    }

    private _callChangeAction(methodName: string, items: RecordSet, selection?: ISelectionObject): void {
        this._actions.forEach((action) => {
            if (action[methodName]) {
                action[methodName].call(action, items, selection);
            }
        });
    }

    getToolbarItems(): IAction[] {
        return this._toolbarItems;
    }

    protected _getToolbarItemsByActions(actions: IBaseAction[]): IAction[] {
        const result = [];
        actions.forEach((action, index) => {
            let countBasicActions = 0;
            if (action.visible) {
                const isListAction = this._listActions.includes(action);
                const state = {...action.getState()};
                if (isListAction) {
                    state.showType = showType.MENU;
                    result.push(state);
                } else if (countBasicActions <= MAX_VISIBLE_BASIC_ACTIONS_WITH_OPERATION_PANEL - 1) {
                    state.showType = this._operationsPanelVisible ? showType.TOOLBAR : showType.MENU_TOOLBAR;
                    countBasicActions++;
                    result.push(state);
                }
            }
        });
        return result.sort((operationFirst, operationSecond) => {
            return operationFirst.order === operationSecond.order ? 0 :
                operationFirst.order > operationSecond.order ? -1 : 1;
        });
    }

    private _createActions(actions: IAction[] = [], listActions: IAction[] = []): IBaseAction[] {
        const items = actions.concat(listActions);
        const result = [];
        items.forEach((item) => {
            const actionName = item.actionName || BASE_ACTION_MODULE;
            if (!isLoaded(actionName)) {
                Logger.error(`ActionsCollection::Во время создания коллекции произошла ошибка.
                                   Action ${actionName} не был загружен до создания коллекции`);
            } else {
                const action = loadSync(actionName);
                const actionClass = new action({...item, prefetchResult: this._prefetchData[item.prefetchResultId]});
                actionClass.subscribe('itemChanged', this._notifyChanges.bind(this));
                result.push(actionClass);
            }
        });
        return result;
    }

    private _notifyChanges(event, item): void {
        const index = this._toolbarItems.findIndex((toolbarItem) => toolbarItem.id === item.id);
        if (index !== -1) {
            if (!item.visible) {
                this._toolbarItems.splice(index, 1);
            } else {
                this._toolbarItems[index] = item;
            }
        } else {
            this._toolbarItems.push(item);
        }
        this._notify('toolbarConfigChanged', this._toolbarItems.slice());
    }
}
