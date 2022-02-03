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
import * as rk from 'i18n!Controls';

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
    itemActions?: IItemAction[];
    editArrowClickCallback?: Function;
}

/**
 * Контрол используют в качестве редактора для выбора значений из списка на {@link Controls/filterPanel:View панели фильтров}.
 * @class Controls/_filterPanel/Editors/List
 * @extends Core/Control
 * @implements Controls/grid:IGridControl
 * @implements Controls/interface:INavigation
 * @implements Controls/itemActions:IItemActions
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanel/Base/Index
 * @public
 */

/**
 * @name Controls/_filterPanel/Editors/List#additionalTextProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе дополнительного столбца в списке.
 * @demo Controls-demo/filterPanel/ListEditor/AdditionalTextProperty/Index
 * @remark Для задания цвета текста дополнительного столбца добавьте в записи поле additionalTextStyleProperty
 * @see Controls/interface:IFontColorStyle#fontColorStyle
 */

/**
 * @name Controls/_filterPanel/Editors/List#additionalTextStyleProperty
 * @cfg {String} Поле записи, содержащее цвет текста дополнительного столбца записи.
 * @see Controls/interface:IFontColorStyle#fontColorStyle
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
 * @name Controls/_filterPanel/Editors/List#counterTemplate
 * @cfg {string} Задаёт шаблон счётчика для элемента списка.
 * @example
 * <pre class="brush: html; highlight: [9]">
 * this._filterButtonData = [{
 *    caption: 'Ответственный',
 *    name: 'owner',
 *    resetValue: [],
 *    value: [],
 *    textValue: '',
 *    editorTemplateName: 'Controls/filterPanel:ListEditor',
 *    editorOptions: {
 *        counterTemplate: 'Controls-demo/filterPanel/CompositeFilter/resources/CheckboxEditor',
 *        source: new Memory({...})
 *    }
 * }]
 * </pre>
 * @see additionalTextProperty
 */

/**
 * @name Controls/_filterPanel/Editors/List#selectedAllText
 * @cfg {string} Добавляет в начало списка элемент с заданным текстом.
 * Используется для установки фильтрации по всем доступным значениям для данного параметра.
 * @remark При активации снимает отметку чекбоксами со всех записей в списке
 */

/**
 * @name Controls/_filterPanel/Editors/List#selectedAllText
 * @cfg {string} Добавляет в начало списка элемент с заданным текстом.
 * Используется для установки фильтрации по всем доступным значениям для данного параметра.
 * @remark При активации снимает отметку чекбоксами со всех записей в списке
 */

/**
 * @name Controls/_filterPanel/Editors/List#editArrowClickCallback
 * @cfg {Function} Функция обратного вызова, вызывается при клике на "шеврон" элемента.
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
    protected _hiddenItemsCount: number = null;

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
        this._itemActions = this._getItemActions(options.historyId, options.itemActions);

        if (options.expandedItems) {
            this._expandedItems = options.expandedItems;
        }

        if (sourceController && !isEqual(sourceController.getFilter(), this._filter)) {
            sourceController.setFilter(this._filter);
            return sourceController.reload() as Promise<RecordSet>;
        }
    }

    protected _beforeUpdate(options: IListEditorOptions): void {
        const {propertyValue, sourceController, filter, additionalTextProperty, displayProperty, source} = options;
        const valueChanged =
            !isEqual(propertyValue, this._options.propertyValue) &&
            !isEqual(propertyValue, this._selectedKeys);
        let filterChanged = !isEqual(filter, this._options.filter);
        const displayPropertyChanged = displayProperty !== this._options.displayProperty;
        const additionalDataChanged = additionalTextProperty !== this._options.additionalTextProperty;
        const sourceChanged = source !== this._options.source;
        if (additionalDataChanged || valueChanged || displayPropertyChanged) {
            this._selectedKeys = propertyValue;
            this._setColumns(options);
            this._navigation = this._getNavigation(options);
            this._setHiddenItemsCount(this._selectedKeys);
        }
        if (filterChanged || valueChanged) {
            const currentFilter = this._filter;
            this._setFilter(valueChanged ? this._selectedKeys : null, options);
            filterChanged = !isEqual(currentFilter, this._filter);
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
            isActionVisible = action.id !== 'PinNull';
        } else {
            isActionVisible = action.id !== 'PinOff';
        }
        return isActionVisible && itemKey !== emptyKey && itemKey !== selectedAllKey;
    }

    protected _handleItemsReadyCallback(items: RecordSet): void {
        this._items = items;
        this._addSyntheticItemsToOriginItems(items, this._options);
        this._items.subscribe('onCollectionChange', this._onCollectionChange);
        this._setHiddenItemsCount(this._selectedKeys);
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

        // Будет удалено после перехода всеми прикладными программистами на новую стики панель
        const textValue = this._getTextValueFromSelectorResult(result);

        this._processPropertyValueChanged(selectedKeys, textValue);
    }

    /**
     * Добавляет элементы, выбранные из окна выбора в список
     * @param items
     * @protected
     */
    protected _addItemsFromSelector(items: RecordSet): void {
        const maxItemsCount = this._getMaxItemsCount();
        // Выбранные элементы надо добавлять после запиненных записей и записей для сброса параметра фильтрации
        let addIndex = this._getLastFixedItemIndex();
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
                // Если записи нет, она добавляется в начало списка, запись внизу списка удаляется,
                // если она вышла за пределы навигации
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

    protected _getLastFixedItemIndex(): number {
        let lastIndex = this._getLastHistoryItemIndex();
        if (this._options.emptyText || this._options.selectedAllText) {
            lastIndex++;
        }
        return lastIndex;
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

    protected _processPropertyValueChanged(value: string[] | number[], textValue?: string): void {
        this._selectedKeys = this._getValue(value);
        if (!this._selectedKeys.length) {
            this._handleResetItems();
        }
        this._setMarkedKey(this._selectedKeys, this._options);
        this._setColumns(this._options);
        this._setHiddenItemsCount(this._selectedKeys);
        const listValue = this._getValue(this._selectedKeys);
        const extendedValue = {
            value: listValue,
            textValue: textValue || this._getTextValue(listValue)
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _registerHandler(event: SyntheticEvent, type: string): void {
        // Если среди родителей панели фильтров будет Browser, то все команды ПМО, посылаемые через
        // Register будут долетать до списков внутри панели фильтров
        if (event.type === 'register' && type === 'selectedTypeChanged') {
            event.stopPropagation();
        }
    }

    protected _handleEditArrowClick(event: SyntheticEvent, item: Model): void {
        this._options.editArrowClickCallback(item);
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

    private _getTextValueFromSelectorResult(items: RecordSet): string {
        const textArray = [];

        items?.each((item) => {
            textArray.push(item.get(this._options.displayProperty));
        });
        return textArray.join(', ');
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
            additionalTextProperty,
            markerStyle,
            counterTemplate
        }: IListEditorOptions
    ): void {
        this._columns = [{
            displayProperty,
            keyProperty,
            textOverflow: 'ellipsis',
            fontSize: markerStyle !== 'primary' ? 'm' : 'l',
            width: 'auto',
            template: TitleColumn
        }];
        if (imageProperty) {
            this._columns.unshift({
                template: ImageColumn,
                imageProperty,
                width: 'min-content',
                compatibleWidth: '30px'
            });
        }
        if (additionalTextProperty || counterTemplate) {
            this._columns.push({
                template: AdditionalColumnTemplate,
                align: 'right',
                displayProperty: additionalTextProperty,
                width: 'min-content',
                templateOptions: {
                    counterTemplate
                }
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

    private _getItemActions(historyId?: string, itemActions: IItemAction[]): IItemAction[] {
        const itemActionsList = itemActions;
        if (historyId) {
            itemActionsList.concat(
                [
                    {
                        id: 'PinOff',
                        icon: 'icon-PinOff',
                        iconSize: 's',
                        tooltip: rk('Открепить'),
                        showType: TItemActionShowType.TOOLBAR,
                        handler: this._handlePinClick.bind(this)
                    }, {
                        id: 'PinNull',
                        icon: 'icon-PinNull',
                        iconSize: 's',
                        tooltip: rk('Закрепить'),
                        showType: TItemActionShowType.TOOLBAR,
                        handler: this._handlePinClick.bind(this)
                    }
                ]
            );
        }
        return itemActionsList;
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
        {emptyText, emptyKey, selectedAllText, selectedAllKey}: IListEditorOptions
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

    private _setFilter(selectedKeys: string[]|number[],
                       {filter, historyId, keyProperty, resetValue}: IListEditorOptions): void {
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

    private _getPopupOpener(mode?: string): StackOpener|DialogOpener {
        if (!this._popupOpener) {
            this._popupOpener = mode === 'dialog' ? new DialogOpener() : new StackOpener();
        }
        return this._popupOpener;
    }

    private _setHiddenItemsCount(selectedKeys: string[]): void {
        if (this._options.navigation) {
            const hiddenItems = selectedKeys.filter((itemId) => !this._items.getRecordById(itemId));
            this._hiddenItemsCount = hiddenItems.length;
        }
    }

    static getDefaultOptions(): object {
        return {
            propertyValue: [],
            style: 'default',
            itemPadding: {
                right: 'm'
            },
            itemActions: []
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
