import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as ListTemplate from 'wml!Controls/_filterPanel/Editors/List';
import * as ImageColumn from 'wml!Controls/_filterPanel/Editors/resources/ImageColumn';
import * as AdditionalColumnTemplate from 'wml!Controls/_filterPanel/Editors/resources/AdditionalColumnTemplate';
import * as TitleColumn from 'wml!Controls/_filterPanel/Editors/resources/TitleColumn';
import {StackOpener, DialogOpener} from 'Controls/popup';
import {Model} from 'Types/entity';
import {
    IFilterOptions,
    ISourceOptions,
    INavigationOptions,
    INavigationOptionValue,
    ISelectorDialogOptions,
    TFilter,
    TKey,
    IHierarchyOptions, INavigationSourceConfig
} from 'Controls/interface';
import {IList} from 'Controls/list';
import {IColumn} from 'Controls/grid';
import {List, RecordSet} from 'Types/collection';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import * as Clone from 'Core/core-clone';
import {
    TItemActionShowType,
    IItemAction,
    IItemActionsOptions
} from 'Controls/itemActions';
import {create as DiCreate} from 'Types/di';
import 'css!Controls/toggle';
import 'css!Controls/filterPanel';
import {NewSourceController as SourceController} from 'Controls/dataSource';

export interface IListEditorOptions extends
    IControlOptions,
    IFilterOptions,
    ISourceOptions,
    INavigationOptions<INavigationSourceConfig>,
    IItemActionsOptions,
    IList,
    IColumn,
    ISelectorDialogOptions,
    IHierarchyOptions {
    propertyValue: number[]|string[];
    additionalTextProperty: string;
    imageProperty?: string;
    multiSelect: boolean;
    historyId?: string;
    emptyKey: string;
    emptyText?: string;
    selectedAllKey: string;
    selectedAllText?: string;
    resetValue?: number[]|string[];
    sourceController?: SourceController;
    expandedItems?: TKey[];
}

/**
 * Контрол используют в качестве редактора для выбора значений из списка на {@link Controls/filterPanel:View панели фильтров}.
 * @class Controls/_filterPanel/Editors/List
 * @extends Core/Control
 * @implements Controls/grid:IGridControl
 * @implements Controls/interface:INavigation
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanel/Base/Index
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
 * @name Controls/_filterPanel/Editors/List#markerStyle
 * @cfg {String} Стиль отображения маркера в списке.
 * @variant default - маркер в виде радиокнопки;
 * @variant primary - обычный маркер.
 * @default default
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
 * @name Controls/_filterPanel/Editors/List#selectedAllKey
 * @cfg {string} Ключ для пункта списка, который используется для установки фильтрации по всем доступным значениям для данного параметра.
 * @see selectedAllText
 */

/**
 * @name Controls/_filterPanel/Editors/List#selectedAllText
 * @cfg {string} Добавляет в начало списка элемент с заданным текстом.
 * Используется для установки фильтрации по всем доступным значениям для данного параметра.
 * @remark При активации снимает отметку чекбоксами со всех записей в списке
 */

class ListEditor extends Control<IListEditorOptions> {
    protected _template: TemplateFunction = ListTemplate;
    protected _columns: object[] = null;
    protected _popupOpener: StackOpener|DialogOpener = null;
    protected _items: RecordSet = null;
    private _selectedItems: RecordSet = null;
    protected _selectedKeys: string[]|number[] = [];
    protected _filter: TFilter = {};
    protected _navigation: INavigationOptionValue<unknown> = null;
    protected _editorTarget: HTMLElement | EventTarget;
    protected _historyService: unknown;
    protected _itemActions: IItemAction[];
    protected _itemsReadyCallback: Function = null;
    protected _markedKey: string|number;
    protected _expandedItems: TKey[] = [];

    protected _beforeMount(options: IListEditorOptions): void|Promise<RecordSet> {
        const {sourceController} = options;

        this._itemsReadyCallback = this._handleItemsReadyCallback.bind(this);
        this._itemActionVisibilityCallback = this._itemActionVisibilityCallback.bind(this);
        this._onCollectionChange = this._onCollectionChange.bind(this);

        this._selectedKeys = options.propertyValue;
        this._setMarkedKey(this._selectedKeys, options);
        this._setColumns(options);
        this._setFilter(this._selectedKeys, options);
        this._navigation = this._getNavigation(options);
        this._itemActions = this._getItemActions(options.historyId);

        if (options.expandedItems) {
            this._expandedItems = options.expandedItems;
        }

        if (sourceController && !isEqual(sourceController.getFilter(), this._filter)) {
            sourceController.setFilter(this._filter);
            return sourceController.reload() as Promise<RecordSet>;
        }
    }

    protected _afterMount(): void {
        // В 5000 поправится при переходе на новый стандарт по задаче: https://online.sbis.ru/opendoc.html?guid=d1ad38ec-0c45-4ec9-a7b5-fd4782207c6a
        if (this._selectedKeys.length && !isEqual(this._options.resetValue, this._selectedKeys)) {
            this._notify('propertyValueChanged', [this._getExtendedValue()], {bubbling: true});
        }
    }

    protected _beforeUpdate(options: IListEditorOptions): void {
        const {propertyValue, sourceController, filter, additionalTextProperty, displayProperty, source} = options;
        const valueChanged =
            !isEqual(propertyValue, this._options.propertyValue) &&
            !isEqual(propertyValue, this._selectedKeys);
        const filterChanged = !isEqual(filter, this._options.filter);
        const displayPropertyChanged = displayProperty !== this._options.displayProperty;
        const additionalDataChanged = additionalTextProperty !== this._options.additionalTextProperty;
        const sourceChanged = source !== this._options.source;
        if (additionalDataChanged || valueChanged || displayPropertyChanged) {
            this._selectedKeys = propertyValue;
            this._setColumns(options);
            this._navigation = this._getNavigation(options);
        }
        if (filterChanged || valueChanged) {
            this._setFilter(valueChanged ? this._selectedKeys : null, options);
        }
        if (valueChanged) {
            this._setMarkedKey(this._selectedKeys, options);
        }

        if (sourceController && (filterChanged || sourceChanged)) {
            sourceController.updateOptions({
                ...options,
                filter: this._filter
            });
            sourceController.reload();
        }
    }

    protected _itemActionVisibilityCallback(action: IItemAction, item: Model): boolean {
        let isActionVisible;
        const itemKey = item.getKey();
        const {emptyKey, selectedAllKey} = this._options;

        if (item.get('pinned')) {
            isActionVisible = action.id === 'PinOff';
        } else {
            isActionVisible = action.id === 'PinNull';
        }
        return isActionVisible && itemKey !== emptyKey && itemKey !== selectedAllKey;
    }

    protected _handleItemsReadyCallback(items: RecordSet): void {
        this._items = items;
        this._addSyntheticItemsToOriginItems(items, this._options);
        this._items.subscribe('onCollectionChange', this._onCollectionChange);
    }

    protected _onCollectionChange(): void {
        this._addSyntheticItemsToOriginItems(this._items, this._options);
    }

    protected _handleItemClick(event: SyntheticEvent, item: Model, nativeEvent: SyntheticEvent): void {
        const contentClick = nativeEvent.target.closest('.controls-ListEditor__columns');
        if (contentClick) {
            let selectedKeysArray = this._options.multiSelect ? Clone(this._selectedKeys) : [];
            const itemkey = item.get(this._options.keyProperty);
            const itemIndex = selectedKeysArray.indexOf(itemkey);
            if (itemIndex !== -1) {
                selectedKeysArray.splice(itemIndex, 1);
            } else {
                if (itemkey === this._options.emptyKey || itemkey === this._options.selectedAllKey) {
                    selectedKeysArray = [itemkey];
                } else if (!selectedKeysArray.includes(itemkey)) {
                    selectedKeysArray.unshift(item.get(this._options.keyProperty));
                }
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
        const {sourceController} = this._options;
        result.forEach((item) => {
            selectedKeys.push(item.get(this._options.keyProperty));
        });
        if (selectedKeys.length) {
            this._setFilter(selectedKeys, this._options);
        }
        this._navigation = this._getNavigation(this._options, selectedKeys);

        if (this._options.navigation) {
            this._addItemsFromSelector(result);
        } else if (sourceController) {
            sourceController.updateOptions({
                ...this._options,
                filter: this._filter
            });
            sourceController.reload();
        }

        this._processPropertyValueChanged(selectedKeys);
    }

    /**
     * Добавляет элементы, выбранные из окна выбора в список
     * @param items
     * @protected
     */
    protected _addItemsFromSelector(items: RecordSet): void {
        const maxItemsCount = this._getMaxItemsCount();
        // Выбранные элементы надо добавлять после запиненных записей
        let addIndex = this._getLastHistoryItemIndex();
        let itemsCount = this._items.getCount();
        let itemIndex;

        if (maxItemsCount) {
            this._items.setEventRaising(false, true);
            items.each((item) => {
                if (addIndex > maxItemsCount) {
                    return;
                }
                // Логика добавление записей следующая:
                // Если запись уже есть в списке, она просто перемещается вверх списка, но после запиненых записей
                // Если записи нет, она добавляется в начало списка, запись внизу списка удаляется, если она вышла за пределы навигации
                itemIndex = this._items.getIndexByValue(this._items.getKeyProperty(), item.getKey());
                if (itemIndex !== -1) {
                    if (itemIndex > addIndex) {
                        this._items.move(itemIndex, addIndex);
                    }
                } else {
                    this._items.add(item, addIndex);

                    if ((itemsCount + 1) > maxItemsCount) {
                        this._items.removeAt(itemsCount);
                    } else {
                        itemsCount++;
                    }
                }
                addIndex++;
            });
            this._items.setEventRaising(true, true);
        } else {
            this._items.assign(items);
        }
        this._selectedItems = items;
    }

    protected _getMaxItemsCount(): number|void {
        const navigation = this._options.navigation;
        let pageSize;

        if (navigation?.source === 'page') {
            pageSize = navigation.sourceConfig?.pageSize;
        }
        return pageSize;
    }

    protected _getLastHistoryItemIndex(): number {
        let lastHistoryItemIndex;

        if (this._options.historyId) {
            this._items.each((item, index) => {
                if (typeof lastHistoryItemIndex !== 'number' && !item.get('pinned')) {
                    lastHistoryItemIndex = index;
                }
            });
        } else {
            lastHistoryItemIndex = 0;
        }

        return lastHistoryItemIndex;
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
        this._selectedKeys = this._getValue(value);
        if (!this._selectedKeys.length) {
            this._handleResetItems();
        }
        this._setMarkedKey(this._selectedKeys, this._options);
        this._setColumns(this._options);
        this._notify('propertyValueChanged', [this._getExtendedValue()], {bubbling: true});
    }

    protected _getExtendedValue(): object {
        const value = this._getValue(this._selectedKeys);
        return {
            value,
            textValue: this._getTextValue(this._selectedKeys)
        };
    }

    protected _registerHandler(event: SyntheticEvent, type: string): void {
        // Если среди родителей панели фильтров будет Browser, то все команды ПМО, посылаемые через
        // Register будут долетать до списков внутри панели фильтров
        if (event.type === 'register' && type === 'selectedTypeChanged') {
            event.stopPropagation();
        }
    }

    private _getValue(value: string[] | number[]): string[] | number[] {
        return this._isEmptyKeySelected(value) ? [] : value;
    }

    private _isEmptyKeySelected(value: string[] | number[]): boolean {
        return value.includes(this._options.emptyKey);
    }

    protected _setColumns(
        {
            displayProperty,
            keyProperty,
            imageProperty,
            filterViewMode,
            additionalTextProperty,
            markerStyle
        }: IListEditorOptions
    ): void {
        this._columns = [{
            displayProperty,
            keyProperty,
            textOverflow: 'ellipsis',
            fontSize: (filterViewMode === 'filterPanelStack' || markerStyle !== 'primary') ? 'm' : 'l',
            width: 'auto',
            template: TitleColumn
        }];
        if (imageProperty) {
            this._columns.unshift({
                template: ImageColumn,
                imageProperty,
                width: 'min-content'
            });
        }
        if (additionalTextProperty) {
            this._columns.push({
                template: AdditionalColumnTemplate,
                align: 'right',
                displayProperty: additionalTextProperty,
                width: 'min-content'
            });
        }
    }

    protected _beforeUnmount(): void {
        if (this._popupOpener) {
            this._popupOpener.destroy();
        }

        if (this._items) {
            this._items.unsubscribe('onCollectionChange', this._onCollectionChange);
            this._items = null;
        }
    }

    private _handleResetItems(): void {
        this._setFilter(this._selectedKeys, this._options);
        this._navigation = this._getNavigation(this._options);
    }

    private _getItemActions(historyId?: string): IItemAction[] {
        if (historyId) {
            return [
                {
                    id: 'PinOff',
                    icon: 'icon-PinOff',
                    iconSize: 's',
                    showType: TItemActionShowType.TOOLBAR,
                    handler: this._handlePinClick.bind(this)
                }, {
                    id: 'PinNull',
                    icon: 'icon-PinNull',
                    iconSize: 's',
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

    private _addSyntheticItemsToOriginItems(
        items: RecordSet,
        {emptyText, emptyKey, selectedAllText, selectedAllKey}: IListEditorOptions,
    ): void {
        if (emptyText && !items.getRecordById(emptyKey)) {
            this._prependItem(emptyKey, emptyText);
        }

        if (selectedAllText && !items.getRecordById(selectedAllKey)) {
            this._prependItem(selectedAllKey, selectedAllText);
        }
    }

    private _prependItem(key: TKey, text: string): void {
        const {keyProperty, displayProperty} = this._options;
        const emptyItem = this._getItemModel(this._items, keyProperty);

        const data = {};
        data[keyProperty] = key;
        data[displayProperty] = text;
        emptyItem.set(data);
        this._items.prepend([emptyItem]);
    }

    private _setFilter(selectedKeys: string[]|number[], {filter, historyId, keyProperty, resetValue}: IListEditorOptions): void {
        this._filter = {...filter};
        if (selectedKeys && selectedKeys.length && !isEqual(resetValue, selectedKeys)) {
            this._filter[keyProperty] = selectedKeys;
        }
        if (historyId) {
            this._filter._historyIds = [historyId];
        }
    }

    private _setMarkedKey(
        selectedKeys: string[]|number[],
        {emptyKey, selectedAllKey, multiSelect}: IListEditorOptions
    ): void {
        let resetKey;

        if (emptyKey !== undefined) {
            resetKey = emptyKey;
        } else if (selectedAllKey !== undefined) {
            resetKey = selectedAllKey;
        } else {
            resetKey = null;
        }

        if (selectedKeys && !multiSelect) {
            this._markedKey = !selectedKeys.length || selectedKeys[0] === resetKey ? resetKey : selectedKeys[0];
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
        const getItemById = (id, items) => {
            return items?.at(items?.getIndexByValue(this._items.getKeyProperty(), id));
        };

        factory(this._selectedKeys).each((key) => {
            const record = getItemById(key, this._items) ||
                           getItemById(key, this._selectedItems);
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

    private _getTextValue(selectedKeys: number[]|string[]): string {
        const textArray = [];

        selectedKeys.forEach((item) => {
            const record = this._items.getRecordById(item);
            if (record) {
                textArray.push(record.get(this._options.displayProperty));
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
