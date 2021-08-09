import {loadSync, isLoaded} from 'WasabyLoader/ModulesLoader';
import {EventRaisingMixin, ObservableMixin, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {mixin} from 'Types/util';
import {IBaseAction} from './BaseAction';
import {IAction} from './IAction';
import {ISelectionObject} from 'Controls/interface';
import {isEqual} from 'Types/object';
import { Logger } from 'UI/Utils';

/**
 * @public
 * @author Золотова Э.Е.
 */

interface IActionsCollectionOptions {
    listActions: IAction[];
    actions: IAction[];
}

const BASE_ACTION_MODULE = 'Controls/actions:BaseAction';

export default class ActionsCollection extends mixin<ObservableMixin>(
    ObservableMixin
) {
    protected _actions: IBaseAction[];
    protected _toolbarItems: IAction[] = [];
    protected _options: IActionsCollectionOptions;

    constructor(options: IActionsCollectionOptions) {
        super();
        EventRaisingMixin.call(this, options);
        this._options = options;
        this._actions = this._createActions(options.actions, options.listActions);
        this._toolbarItems = this._getToolbarItemsByActions(this._actions);
    }

    update(options: IActionsCollectionOptions): void {
        if (!isEqual(this._options, options)) {
            this._actions = this._createActions(options.actions, options.listActions);
            this._toolbarItems = this._getToolbarItemsByActions(this._actions);
            this._notify('toolbarConfigChanged', this._toolbarItems);
        }
    }

    getAction(item: Model<IAction>): IBaseAction {
        return this._actions.find((action) => action.id === item.getKey());
    }

    collectionChange(items: RecordSet): void {
        this._callChangeAction('onCollectionChanged', items);
    }

    selectionChange(items: RecordSet, selection: ISelectionObject): void {
        this._callChangeAction('onSelectionChanged', items, selection);
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
        actions.forEach((action) => {
            if (action.visible) {
                result.push(action.getState());
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
                const actionClass = new action(item);
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
