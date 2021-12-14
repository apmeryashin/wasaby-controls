import {Control, IControlOptions} from 'UI/Base';
import {RecordSet, List} from 'Types/collection';
import {default as LookupController, ILookupBaseControllerOptions, SelectedItems} from './BaseControllerClass';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor, Model} from 'Types/entity';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import {TKey} from 'Controls/interface';
// @ts-ignore
import * as isEmpty from 'Core/helpers/Object/isEmpty';
import * as ArrayUtil from 'Controls/Utils/ArraySimpleValuesUtil';
import {getDefaultBorderVisibilityOptions} from 'Controls/input';
import 'css!Controls/lookup';
import 'css!Controls/CommonClasses';

type LookupReceivedState = SelectedItems|null;

export interface ILookupOptions extends ILookupBaseControllerOptions, IControlOptions {
    maxVisibleItems?: number;
    items?: RecordSet;
}

export default abstract class
    BaseLookup<T extends ILookupOptions> extends Control<T, LookupReceivedState> {
    protected _lookupController: LookupController;
    protected _items: SelectedItems;

    protected _beforeMount(
        options: ILookupOptions,
        context: object,
        receivedState: LookupReceivedState
    ): Promise<LookupReceivedState|Error> | void {
        this._lookupController = new LookupController(options);

        if (receivedState && !isEmpty(receivedState)) {
            options.dataLoadCallback?.(receivedState);
            this._setItems(receivedState);
            this._inheritorBeforeMount(options);
        } else if (options.items) {
            this._setItems(options.items);
            this._inheritorBeforeMount(options);
        } else if (options.selectedKeys && options.selectedKeys.length && options.source) {
            return this._lookupController.loadItems().then((items) => {
                this._setItems(items as SelectedItems);
                this._inheritorBeforeMount(options);
                return items;
            });
        } else {
            this._items = this._lookupController.getItems();
            this._inheritorBeforeMount(options);
        }
    }

    protected _beforeUpdate(newOptions: ILookupOptions): Promise<SelectedItems>|void|boolean {
        const updateResult = this._lookupController.update(newOptions);
        const updateResultCallback = () => {
            this._afterItemsChanged(newOptions);
        };

        if (updateResult instanceof Promise) {
            updateResult.then((items) => {
                this._lookupController.setItems(items);
                updateResultCallback();
            });
        } else if (updateResult) {
            updateResultCallback();
        }
        this._inheritorBeforeUpdate(newOptions);
        return updateResult;
    }

    protected _afterMount(): void {
        if (this._options.items && this._options.hasOwnProperty('selectedKeys')) {
            this._notifySelectedKeysChanged(this._lookupController.getSelectedKeys());
        }
    }

    protected _updateItems(items: RecordSet|List<Model>): void {
        this._lookupController.setItems(items);
        this._afterItemsChanged();
    }

    protected _addItem(item: Model): void {
        if (this._lookupController.addItem(item)) {
            this._afterItemsChanged();
        }
    }

    protected _removeItem(item: Model): void {
        if (this._lookupController.removeItem(item)) {
            this._afterItemsChanged();
        }
    }

    protected _showSelector(event: SyntheticEvent, popupOptions?: IStackPopupOptions): void|boolean {
        if (this._notify('showSelector', [event]) !== false) {
            return this.showSelector(popupOptions);
        }

        return false;
    }

    protected _closeHandler(): void {
        this.activate();
    }

    protected _selectCallback(event: SyntheticEvent, result: SelectedItems|Promise<SelectedItems>): void {
        const selectResult =
            this._notify('selectorCallback', [this._lookupController.getItems(), result]) ||
            result;
        const selectCallback = (result) => {
            this._lookupController.setItemsAndSaveToHistory(result as SelectedItems);
            this._afterItemsChanged();
        };

        if (this._options.value) {
            this._notify('valueChanged', ['']);
        }
        if (selectResult instanceof Promise) {
            selectResult.then((items) => {
                selectCallback(items);
            });
        } else {
            selectCallback(selectResult);
        }
    }

    protected _getSelectedKeys(options: ILookupOptions): TKey[] {
        let selectedKeys;

        if (options.selectedKeys !== undefined) {
            selectedKeys = options.selectedKeys;
        } else {
            selectedKeys = this._lookupController.getSelectedKeys();
        }

        return selectedKeys;
    }

    private _afterItemsChanged(options?: ILookupOptions): void {
        this._itemsChanged(this._items = this._lookupController.getItems());
        this._notifyChanges(options);
    }

    private _setItems(items: SelectedItems): void {
        this._items = items;
        this._lookupController.setItems(items);
    }

    private _notifyChanges(options?: ILookupOptions): void {
        const controller = this._lookupController;
        this._notifySelectedKeysChanged(controller.getSelectedKeys(), options);
        this._notify('itemsChanged', [controller.getItems()]);
        this._notify('textValueChanged', [controller.getTextValue()]);
    }

    protected _notifySelectedKeysChanged(newSelectedKeys: TKey[], options?: ILookupOptions): void {
        const {added, removed} =
            ArrayUtil.getArrayDifference(this._getSelectedKeys(options ?? this._options), newSelectedKeys);
        if (added?.length || removed?.length) {
            this._notify('selectedKeysChanged', [newSelectedKeys, added, removed]);
        }
    }

    abstract showSelector(popupOptions?: IStackPopupOptions): void;

    protected abstract _inheritorBeforeMount(options: ILookupOptions): void;

    protected abstract _inheritorBeforeUpdate(options: ILookupOptions): void;

    protected abstract _itemsChanged(items: SelectedItems): void;

    static getDefaultOptions(): object {
        return {
            ...getDefaultBorderVisibilityOptions(),
            multiSelect: false,
            contrastBackground: false
        };
    }

    static getOptionTypes(): object {
        return {
            multiSelect: descriptor(Boolean),
            selectedKeys: descriptor(Array)
        };
    }
}

Object.defineProperty(BaseLookup, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return BaseLookup.getDefaultOptions();
   }
});
