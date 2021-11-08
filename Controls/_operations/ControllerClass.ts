import {RegisterClass} from 'Controls/event';
import {Control} from 'UI/Base';
import {Model, OptionsToPropertyMixin, SerializableMixin, ObservableMixin} from 'Types/entity';
import {ISelectionObject, TKey, ISourceOptions, INavigationSourceConfig} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IAction} from 'Controls/actions';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {isEqual} from 'Types/object';
import {mixin} from 'Types/util';

interface IKeysByList {
    [key: string]: TKey[];
}

interface ISelectedKeyCountByList {
    count: number;
    allSelected: boolean;
}

interface ISelectedKeysCountByList {
    [key: string]: ISelectedKeyCountByList;
}

interface IOperationsControllerOptions {
    selectedKeys: TKey[];
    excludedKeys: TKey[];
    root: TKey;
    selectionViewMode: string;
}

export interface IExecuteCommandParams extends ISourceOptions {
    target: SyntheticEvent;
    selection: ISelectionObject;
    item: Model;
    filter: Record<string, any>;
    parentProperty?: string;
    nodeProperty?: string;
    navigation?: INavigationSourceConfig;
    sourceController?: SourceController;
    operationsController: OperationsController;
    selectedKeysCount?: number;
    toolbarItem: Model;
}

export default class OperationsController extends mixin<SerializableMixin, OptionsToPropertyMixin, ObservableMixin>(
    SerializableMixin,
    OptionsToPropertyMixin,
    ObservableMixin
) {
    protected _$selectedKeys: TKey[] = null;
    protected _$excludedKeys: TKey[] = null;
    protected _$root: TKey = null;
    protected _$selectionViewMode: string = '';
    private _listMarkedKey: TKey = null;
    private _savedListMarkedKey: TKey = null;
    private _isOperationsPanelVisible: boolean = false;
    private _selectedTypeRegister: RegisterClass = null;
    private _selectedKeysCount: number = null;
    private _selectedKeysByList: IKeysByList = {};
    private _excludedKeysByList: IKeysByList = {};
    private _selectedKeysCountByList: ISelectedKeysCountByList = {};
    private _operationsMenuVisible: boolean = false;
    protected _options: IOperationsControllerOptions;

    constructor(options: Partial<IOperationsControllerOptions>) {
        super();
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
        ObservableMixin.call(this);
        this._$selectedKeys = options.selectedKeys?.slice() || [];
        this._$excludedKeys = options.excludedKeys?.slice() || [];
        this._$root = OperationsController._getRoot(options);
        this._options = options;
    }

    destroy(): void {
        if (this._selectedTypeRegister) {
            this._selectedTypeRegister.destroy();
            this._selectedTypeRegister = null;
        }
    }

    update(options: IOperationsControllerOptions): void {
        const selectedKeysChanged = !isEqual(options.selectedKeys, this._options.selectedKeys);
        const excludedKeysChanged = !isEqual(options.excludedKeys, this._options.excludedKeys);
        if (selectedKeysChanged || excludedKeysChanged) {
            this._$selectedKeys = options.selectedKeys;
            this._$excludedKeys = options.excludedKeys;
            this._notify('selectionChanged', {
                selected: this._$selectedKeys,
                excluded: this._$excludedKeys
            });
        }
        this._$root = OperationsController._getRoot(options);
        this._$selectionViewMode = options.selectionViewMode;
        this._options = options;
    }

    setListMarkedKey(key: TKey): TKey {
        return this._setListMarkedKey(key);
    }

    setOperationsMenuVisible(state: boolean): void {
        if (state !== this._operationsMenuVisible) {
            this._operationsMenuVisible = state;
            this._notify('operationsMenuVisibleChanged', state);
        }
    }

    setOperationsPanelVisible(visible: boolean): TKey {
        let markedKey;
        if (visible !== this._isOperationsPanelVisible) {
            this._isOperationsPanelVisible = visible;
            this._notify('operationsPanelVisibleChanged', this._isOperationsPanelVisible);
        }

        if (visible && this._savedListMarkedKey !== null) {
            markedKey = this.setListMarkedKey(this._savedListMarkedKey);
        } else {
            markedKey = this.setListMarkedKey(this._listMarkedKey);
        }
        return markedKey;
    }

    registerHandler(
        event: SyntheticEvent,
        registerType: string,
        component: Control,
        callback: Function,
        config: object
    ): void {
        this._getRegister().register(event, registerType, component, callback, config);
    }

    unregisterHandler(
        event: SyntheticEvent,
        registerType: string,
        component: Control,
        callback: Function,
        config: object
    ): void {
        this._getRegister().unregister(event, registerType, component, config);
    }

    selectionTypeChanged(type: string, limit: number): void {
        if (type === 'all' || type === 'selected') {
            this._notify('selectionViewModeChanged', type);
        } else {
            this._getRegister().start(type, limit);
        }
    }

    itemOpenHandler(newCurrentRoot: TKey): void {
        if (newCurrentRoot !== this._$root && this._$selectionViewMode === 'selected') {
            this._notify('selectionViewModeChanged', 'all');
        }
    }

    executeAction(params: IExecuteCommandParams): Promise<void> | void {
        if (params.action) {
            params.action.execute && params.action.execute(params);
        }
    }

    updateSelectedKeys(values: TKey[],
                       added: TKey[],
                       deleted: TKey[],
                       listId: string): TKey[] {
        this._selectedKeysByList[listId] = values.slice();
        let result = this._updateListKeys(this._$selectedKeys, added, deleted);
        if (added.length && added[0] === null) {
            result = [null];
        }
        this._$selectedKeys = result;
        return result;
    }

    setListActions(actions: IAction[]): void {
        this._notify('listActionsChanged', actions);
    }

    setActions(actions: IAction[]): void {
        this._notify('actionsChanged', actions);
    }

    setSelectedKeysCount(count: number): void {
        this._selectedKeysCount = count;
    }

    getSelectedKeysCount(): number {
        return this._selectedKeysCount;
    }

    getOperationsPanelVisible(): boolean {
        return this._isOperationsPanelVisible;
    }

    getOperationsMenuVisible(): boolean {
        return this._operationsMenuVisible;
    }

    updateExcludedKeys(values: TKey[],
                       added: TKey[],
                       deleted: TKey[],
                       listId: string): TKey[] {
        this._excludedKeysByList[listId] = values.slice();
        let result = this._updateListKeys(this._$excludedKeys, added, deleted);
        if (deleted.length && deleted[0] === null) {
            result = [];
        }
        this._$excludedKeys = result;
        return result;
    }

    updateSelectedKeysCount(count: number, allSelected: boolean, listId: string): {
        count: number,
        isAllSelected: boolean
    } {
        this._selectedKeysCountByList[listId] = {count, allSelected};

        let isAllSelected = true;
        let selectedCount = 0;
        for (const index in this._selectedKeysCountByList) {
            if (this._selectedKeysCountByList.hasOwnProperty(index)) {
                const item = this._selectedKeysCountByList[index];
                if (!item.allSelected) {
                    isAllSelected = false;
                }
                if (typeof item.count === 'number' && selectedCount !== null) {
                    selectedCount += item.count;
                } else {
                    selectedCount = null;
                }
            }
        }
        const counterResult = {
            count: selectedCount,
            isAllSelected
        };
        this._notify('counterChanged', counterResult);
        return counterResult;
    }

    getSelectedKeysByLists(): IKeysByList {
        return this._selectedKeysByList;
    }

    getExcludedKeysByLists(): IKeysByList {
        return this._excludedKeysByList;
    }

    private _updateListKeys(listKeys: TKey[], added: TKey[], deleted: TKey[]): TKey[] {
        const result = listKeys.slice();

        if (added.length) {
            this._updateKeys(result, added, true);
        }
        if (deleted.length) {
            this._updateKeys(result, deleted, false);
        }
        return result;
    }

    private _updateKeys(listForUpdate: TKey[],
                        changedIds: TKey[],
                        insert: boolean): void {
        changedIds.forEach((key) => {
            const index = listForUpdate.indexOf(key);
            if (index === -1 && insert) {
                listForUpdate.push(key);
            } else if (index !== -1 && !insert) {
                listForUpdate.splice(index, 1);
            }
        });
    }

    private _getRegister(): RegisterClass {
        if (!this._selectedTypeRegister) {
            this._selectedTypeRegister = new RegisterClass({register: 'selectedTypeChanged'});
        }
        return this._selectedTypeRegister;
    }

    private _setListMarkedKey(key: TKey): TKey {
        if (this._isOperationsPanelVisible) {
            this._listMarkedKey = key;
            this._savedListMarkedKey = null;
        } else {
            this._savedListMarkedKey = key;
        }

        return this._listMarkedKey;
    }

    private static _getRoot(options: Partial<IOperationsControllerOptions>): TKey {
        return 'root' in options ? options.root : null;
    }
}

Object.assign(OperationsController.prototype, {
    _moduleName: 'Controls/operations:ControllerClass'
});
