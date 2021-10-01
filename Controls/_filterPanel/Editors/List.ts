import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as ListTemplate from 'wml!Controls/_filterPanel/Editors/List';
import * as ColumnTemplate from 'wml!Controls/_filterPanel/Editors/resources/ColumnTemplate';
import * as AdditionalColumnTemplate from 'wml!Controls/_filterPanel/Editors/resources/AdditionalColumnTemplate';
import {StackOpener, DialogOpener} from 'Controls/popup';
import {Model} from 'Types/entity';
import {
    IFilterOptions,
    ISourceOptions,
    INavigationOptions,
    INavigationOptionValue,
    IItemActionsOptions,
    ISelectorDialogOptions
} from 'Controls/interface';
import {IList, MultiSelectCircleTemplate} from 'Controls/list';
import {IColumn} from 'Controls/grid';
import {List, RecordSet} from 'Types/collection';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import * as Clone from 'Core/core-clone';
import { TItemActionShowType, IItemAction } from 'Controls/itemActions';
import {create as DiCreate} from 'Types/di';
import 'css!Controls/toggle';
import 'css!Controls/filterPanel';

export interface IListEditorOptions extends IControlOptions, IFilterOptions, ISourceOptions,
    INavigationOptions<unknown>, IItemActionsOptions, IList, IColumn, ISelectorDialogOptions {
    propertyValue: number[]|string[];
    additionalTextProperty: string;
    imageProperty?: string;
    multiSelect: boolean;
    historyId?: string;
    emptyKey: string;
    emptyText?: string;
    selectAllKey: string;
    selectAllText?: string;
}

/**
 * Контрол используют в качестве редактора для выбора значений из списка на {@link Controls/filterPanel:View панели фильтров}.
 * @class Controls/_filterPanel/Editors/List
 * @extends Core/Control
 * @implements Controls/grid:IGridControl
 * @implements Controls/interface:INavigation
 * @author Мельникова Е.А.
 * @public
 */

/**
 * @name Controls/_filterPanel/Editors/List#additionalTextProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе дополнительного столбца в списке.
 * @demo Controls-demo/filterPanel/ListEditor/AdditionalTextProperty/Index
 */

/**
 * @name Controls/_filterPanel/Editors/List#imageProperty
 * @cfg {String} Имя свойства, содержащего ссылку на изображение для элемента списка.
 * @demo Controls-demo/filterPanel/View/Index
 */

/**
 * @name Controls/_filterPanel/Editors/List#style
 * @cfg {String} Стиль отображения чекбокса в списке.
 * @variant default
 * @variant master
 * @default default
 */

/**
 * @name Controls/_filterPanel/Editors/List#multiSelect
 * @cfg {boolean} Определяет, установлен ли множественный выбор.
 * @demo Controls-demo/filterPanel/ListEditor/MultiSelect/Index
 * @default false
 */

/**
 * @name Controls/_filterPanel/Editors/List#emptyKey
 * @cfg {string} Ключ для пункта списка, который используется для сброса параметра фильтрации.
 * @see emptyText
 * @demo Controls-demo/filterPanel/EmptyKey/Index
 */

/**
 * @name Controls/_filterPanel/Editors/List#emptyText
 * @cfg {string} Добавляет в начало списка элемент с заданным текстом.
 * Используется для сброса параметра фильтрации, когда в панели фильтров отключено отображение кнопки "Сбросить".
 * @remark При активации снимает отметку чекбоксами со всех записей в списке
 * @demo Controls-demo/filterPanel/EmptyKey/Index
 */

/**
 * @name Controls/_filterPanel/Editors/List#selectAllKey
 * @cfg {string} Ключ для пункта списка, который используется для установки фильтрации по всем доступным значениям для данного параметра.
 * @see selectAllText
 */

/**
 * @name Controls/_filterPanel/Editors/List#selectAllText
 * @cfg {string} Добавляет в начало списка элемент с заданным текстом.
 * Используется для установки фильтрации по всем доступным значениям для данного параметра.
 * @remark При активации снимает отметку чекбоксами со всех записей в списке
 */

class ListEditor extends Control<IListEditorOptions> {
    protected _template: TemplateFunction = ListTemplate;
    protected _circleTemplate: TemplateFunction = MultiSelectCircleTemplate;
    protected _columns: object[] = null;
    protected _popupOpener: StackOpener|DialogOpener = null;
    protected _items: RecordSet = null;
    protected _selectedKeys: string[]|number[] = [];
    protected _filter: object = {};
    protected _navigation: INavigationOptionValue<unknown> = null;
    protected _editorTarget: HTMLElement | EventTarget;
    protected _historyService: unknown;
    protected _itemActions: IItemAction[];
    private _itemsReadyCallback: Function = null;

    protected _beforeMount(options: IListEditorOptions): void {
        this._selectedKeys = options.propertyValue;
        this._setColumns(options, options.propertyValue);
        this._itemsReadyCallback = this._handleItemsReadyCallback.bind(this);
        this._setFilter(this._selectedKeys, options);
        this._navigation = this._getNavigation(options);
        this._itemActions = this._getItemActions(options.historyId);
        this._itemActionVisibilityCallback = this._itemActionVisibilityCallback.bind(this);
    }

    protected _afterMount(): void {
        // В 5000 поправится при переходе на новый стандарт по задаче: https://online.sbis.ru/opendoc.html?guid=d1ad38ec-0c45-4ec9-a7b5-fd4782207c6a
        if (this._selectedKeys.length) {
            this._notify('propertyValueChanged', [this._getExtendedValue()], {bubbling: true});
        }
    }

    protected _beforeUpdate(options: IListEditorOptions): void {
        const valueChanged =
            !isEqual(options.propertyValue, this._options.propertyValue) &&
            !isEqual(options.propertyValue, this._selectedKeys);
        const filterChanged = !isEqual(options.filter, this._options.filter);
        const displayPropertyChanged = options.displayProperty !== this._options.displayProperty;
        const additionalDataChanged = options.additionalTextProperty !== this._options.additionalTextProperty;
        if (additionalDataChanged || valueChanged || displayPropertyChanged) {
            this._selectedKeys = options.propertyValue;
            this._setColumns(options, options.propertyValue);
            this._navigation = this._getNavigation(options);
        }
        if (filterChanged || valueChanged) {
            this._setFilter(this._selectedKeys, options);
        }
    }

    protected _itemActionVisibilityCallback(action: IItemAction, item: Model): boolean {
        if (item.get('pinned')) {
            return action.id === 'PinOff';
        }
        return action.id === 'PinNull';
    }

    protected _handleItemsReadyCallback(items: RecordSet): void {
        this._items = items;
        if (this._options.emptyText && !items.getRecordById(this._options.emptyKey)) {
            this._addFilterItem(this._options.emptyText, this._options.emptyKey);
        }

        if (this._options.selectAllText && !items.getRecordById(this._options.selectAllKey)) {
            this._addFilterItem(this._options.selectAllText, this._options.selectAllKey);
        }
    }

    protected _handleItemClick(event: SyntheticEvent, item: Model, nativeEvent: SyntheticEvent): void {
        const contentClick = nativeEvent.target.closest('.controls-ListEditor__columns');
        if (contentClick) {
            const selectedKeysArray = this._options.multiSelect ? Clone(this._selectedKeys) : [];
            const itemkey = item.get(this._options.keyProperty);
            if (!selectedKeysArray.includes(itemkey)) {
                selectedKeysArray.unshift(item.get(this._options.keyProperty));
            }
            this._editorTarget = this._getEditorTarget(nativeEvent);
            this._processPropertyValueChanged(selectedKeysArray);
        }
    }

    protected _handleSelectedKeysChanged(event: SyntheticEvent, keys: string[]|number[]): void {
        this._processPropertyValueChanged(keys);
    }

    protected _handleCheckBoxClick(event: SyntheticEvent, keys: string[]|number[]): void {
        this._editorTarget = this._getEditorTarget(event);
    }

    protected _handleSelectedKeyChanged(event: SyntheticEvent, key: string|number): void {
        this._processPropertyValueChanged([key]);
    }

    protected _handleSelectorResult(result: Model[]): void {
        const selectedKeys = [];
        result.forEach((item) => {
            selectedKeys.push(item.get(this._options.keyProperty));
        });
        if (selectedKeys.length) {
            this._items.assign(result);
            this._setFilter(selectedKeys, this._options);
        }
        this._navigation = this._getNavigation(this._options, selectedKeys);
        this._processPropertyValueChanged(selectedKeys);
    }

    protected _handleFooterClick(event: SyntheticEvent): void {
        const selectorOptions = this._options.selectorTemplate;
        this._getPopupOpener(selectorOptions.mode).open({
            ...{
                opener: this,
                templateOptions: {
                    ...selectorOptions.templateOptions,
                    ...{
                        selectedKeys: this._selectedKeys,
                        selectedItems: this._getSelectedItems(),
                        multiSelect: this._options.multiSelect
                    }
                },
                template: selectorOptions.templateName,
                eventHandlers: {
                    onResult: this._handleSelectorResult.bind(this)
                }
            },
            ...selectorOptions.popupOptions
        });
    }

    protected _processPropertyValueChanged(value: string[] | number[]): void {
        this._selectedKeys = value;
        this._setColumns(this._options, this._selectedKeys);
        this._notify('propertyValueChanged', [this._getExtendedValue()], {bubbling: true});
    }

    protected _getExtendedValue(): object {
        const value = this._getValue(this._selectedKeys);
        return {
            value,
            textValue: this._getTextValue(this._selectedKeys)
        };
    }

    private _getValue(value: string[] | number[]): string[] | number[] {
        return this._isEmptyKeySelected(value) ? [] : value;
    }

    private _isEmptyKeySelected(value: string[] | number[]): boolean {
        return value.includes(this._options.emptyKey);
    }

    protected _setColumns(options: IListEditorOptions, propertyValue: string[]|number[]): void {
        this._columns = [{
            template: ColumnTemplate,
            selected: propertyValue,
            displayProperty: options.displayProperty,
            keyProperty: options.keyProperty,
            imageProperty: options.imageProperty,
            filterViewMode: options.filterViewMode
        }];
        if (options.additionalTextProperty) {
            this._columns.push({
                template: AdditionalColumnTemplate,
                align: 'right',
                displayProperty: options.additionalTextProperty,
                width: 'auto'});
        }
    }

    protected _beforeUnmount(): void {
        if (this._popupOpener) {
            this._popupOpener.destroy();
        }
    }

    private _getItemActions(historyId?: string): IItemAction[] {
        if (historyId) {
            return [
                {
                    id: 'PinOff',
                    icon: 'icon-PinOff',
                    size: 's',
                    showType: TItemActionShowType.TOOLBAR,
                    handler: this._handlePinClick.bind(this)
                }, {
                    id: 'PinNull',
                    icon: 'icon-PinNull',
                    size: 's',
                    showType: TItemActionShowType.TOOLBAR,
                    handler: this._handlePinClick.bind(this)
                }
            ];
        }
        return [];
    }

    private _getItemModel(items: RecordSet, keyProperty: string): Model {
        const model = items.getModel();
        const modelConfig = {
            keyProperty,
            format: items.getFormat(),
            adapter: items.getAdapter()
        };
        if (typeof model === 'string') {
            return DiCreate(model, modelConfig);
        } else {
            return new model(modelConfig);
        }
    }

    private _addFilterItem(additionalText: string, additionalKey: string): void {
        const emptyItem = this._getItemModel(this._items, this._options.keyProperty);

        const data = {};
        data[this._options.keyProperty] = additionalKey;
        data[this._options.displayProperty] = additionalText;
        emptyItem.set(data);
        this._items.prepend([emptyItem]);
    }

    private _setFilter(selectedKeys: string[]|number[], options: IListEditorOptions): void {
        this._filter = {...options.filter};
        if (selectedKeys && selectedKeys.length) {
            this._filter[options.keyProperty] = selectedKeys;
        }
        if (options.historyId) {
            this._filter.historyId = options.historyId;
        }
    }

    private _getEditorTarget(event: SyntheticEvent): HTMLElement | EventTarget {
        return event.target.closest('.controls-Grid__row').lastChild;
    }

    private _getNavigation(options: IListEditorOptions, selectedKeys?: string[]): INavigationOptionValue<unknown> {
        const selectedKeysArray = selectedKeys || this._selectedKeys;
        return selectedKeysArray?.length ? null : options.navigation;
    }

    private _getSelectedItems(): List<Model> {
        const selectedItems = [];
        factory(this._selectedKeys).each((key) => {
            const record = this._items.getRecordById(key);
            if (record) {
                selectedItems.push(record);
            }
        });
        return new List({
            items: selectedItems
        });
    }

    private _handlePinClick(item: Model): void {
        this._getHistoryService().then((historyService) => {
            historyService.update(item, {$_pinned: !item.get('pinned')}).then(() => {
                this._children.gridView.reload();
            });
            return historyService;
        });
    }

    private _getHistoryService(): Promise<unknown> {
        if (!this._historyService) {
             return import('Controls/history').then((history) => {
                 this._historyService = new history.Service({
                    historyId: this._options.historyId,
                     pinned: true
                });
                 return this._historyService;
            });
        }
        return Promise.resolve(this._historyService);
    }

    private _getTextValue(selectedKeys: number[]|string[]|Model[]): string {
        const textArray = [];
        selectedKeys.forEach((item, index) => {
            const record = this._items.getRecordById(item);
            if (record) {
                textArray.push(record.get(this._options.displayProperty));
            } else {
                textArray.push(item.get(this._options.displayProperty));
            }
        });
        return textArray.join(', ');
    }

    private _getPopupOpener(mode?: string): StackOpener|DialogOpener {
        if (!this._popupOpener) {
            this._popupOpener = mode === 'dialog' ? new DialogOpener() : new StackOpener();
        }
        return this._popupOpener;
    }

    static getDefaultOptions(): object {
        return {
            propertyValue: [],
            style: 'default',
            itemPadding: {
                right: 'm'
            }
        };
    }
}

Object.defineProperty(ListEditor, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ListEditor.getDefaultOptions();
   }
});

export default ListEditor;
