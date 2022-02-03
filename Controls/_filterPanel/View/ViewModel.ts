import {IFilterItem} from 'Controls/filter';
import {TemplateFunction} from 'UI/Base';
import IExtendedPropertyValue from '../_interface/IExtendedPropertyValue';
import {isEqual} from 'Types/object';
import {VersionableMixin} from 'Types/entity';
import {mixin} from 'Types/util';
import {FilterUtils} from 'Controls/filter';
import * as coreClone from 'Core/core-clone';
import {MAX_COLLAPSED_COUNT_OF_VISIBLE_ITEMS} from 'Controls/_filterPanel/Constants';
import {RecordSet} from 'Types/collection';
import {NewSourceController, ISourceControllerOptions} from 'Controls/dataSource';

interface IFilterViewModelOptions {
    source: IFilterItem[];
    collapsedGroups?: string[] | number[];
    filterViewMode?: string;
    style?: string;
}

interface IFilterGroup {
    afterEditorTemplate: TemplateFunction | string;
}

export default class FilterViewModel extends mixin<VersionableMixin>(VersionableMixin) {
    protected _source: IFilterItem[] = null;
    protected _editingObject: Record<string, unknown> = {};
    protected _collapsedGroups: string[] | number[] = [];
    protected _groupItems: Record<string, IFilterGroup>;
    protected _options: IFilterViewModelOptions;

    constructor(options: IFilterViewModelOptions) {
        super(options);
        VersionableMixin.call(this, options);
        this._options = options;
        this._source = this._getSource(options.source);
        this._collapsedGroups = options.collapsedGroups || [];
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._groupItems = this._getGroupItemsBySource(this._source);
    }

    update(options: IFilterViewModelOptions): void {
        if (!isEqual(this._options.source, options.source)) {
            this._source = this._getSource(options.source);
            this._editingObject = this._getEditingObjectBySource(this._source);
            this.setEditingObject(this._editingObject);
            this._nextVersion();
        }

        if (!isEqual(this._options.collapsedGroups, options.collapsedGroups)) {
            this._collapsedGroups = options.collapsedGroups;
            this._nextVersion();
        }

        this._options = options;
    }

    private _getSource(source: IFilterItem[]): IFilterItem[] {
        return source.map((item, index) => {
            const newItem = {...item};
            const editorOptions = newItem.editorOptions;
            // Пока не перешли на предзагрузку фильтров (22.1100)
            let sourceController = this._source?.[index]?.name === newItem.name ?
                this._source?.[index]?.editorOptions?.sourceController :
                editorOptions?.sourceController;

            if (!sourceController && editorOptions?.items && editorOptions?.items instanceof RecordSet) {
                sourceController = new NewSourceController({...editorOptions} as ISourceControllerOptions);
            }

            if (!newItem.hasOwnProperty('editorCaption')) {
                newItem.editorCaption = typeof item.caption !== undefined ? item.caption : item.group;
            }
            newItem.caption = '';
            newItem.viewMode = isEqual(item.value, item.resetValue) && editorOptions?.extendedCaption ?
                               'extended' : newItem.viewMode;
            newItem.editorOptions = {
                ...editorOptions,
                viewMode: item.viewMode,
                filterViewMode: this._options.filterViewMode,
                name: item.name,
                resetValue: item.resetValue,
                style: this._options.style,
                emptyText: item.emptyText,
                emptyKey: item.emptyKey,
                selectedAllText: item.selectedAllText,
                selectedAllKey: item.selectedAllKey,
                sourceController,
                items: editorOptions?.items || sourceController?.getItems(),
                dataLoadCallback: (items, direction) => {
                    if (!direction) {
                        this._updateEditorOptionsByLoadedItems(index, items);
                    }
                }
            };
            return newItem;
        });
    }

    private _updateEditorOptionsByLoadedItems(itemIndex: number, items: RecordSet): void {
        const newItem = {...this._source[itemIndex]};

        if (!newItem.editorOptions?.sourceController) {
            newItem.editorOptions.sourceController = new NewSourceController({
                ...newItem.editorOptions,
                items
            } as ISourceControllerOptions);

            this._source = [...this._source];
            this._source[itemIndex] = newItem;
            this._nextVersion();
        }
    }

    private _getEditingObjectBySource(source: IFilterItem[]): Record<string, unknown> {
        const editingObject = {};
        source.forEach((item) => {
            editingObject[item.name] = item.value;
        });

        return editingObject;
    }

    private _getGroupItemsBySource(source: IFilterItem[]): Record<string, IFilterGroup> {
        const groupsItems = {};
        source.forEach((item, itemIndex) => {
            groupsItems[item.name] = {
                caption: item.editorCaption,
                expanderVisible: item.expanderVisible,
                resetButtonVisible: !isEqual(item.value, item.resetValue),
                groupVisible: typeof item.editorCaption === 'string',
                afterEditorTemplate: item.editorOptions?.afterEditorTemplate
            };
        });

        return groupsItems;
    }

    private _getItemsByViewMode(viewMode: IFilterItem['viewMode']): IFilterItem[] {
        return this._source.filter((item) => {
            return item.viewMode === viewMode || (viewMode === 'basic' && !item.viewMode);
        });
    }

    private _setValueToSourceItem(item: IFilterItem, editorValue: object): void {
        item.value = editorValue?.value === undefined ? editorValue : editorValue?.value;
        if (editorValue?.textValue !== undefined) {
            item.textValue = editorValue.textValue;
        }
    }

    private _resetSourceViewMode(): void {
        this._source.forEach((item) => {
            item.viewMode = item.editorOptions?.extendedCaption ? 'extended' : item.viewMode;
        });
    }

    private _expandGroup(group: string): void {
        this._collapsedGroups = this._collapsedGroups.slice();
        if (this._collapsedGroups.length && this._collapsedGroups.includes(group)) {
            this._collapsedGroups = this._collapsedGroups.filter((item) => group !== item);
            this._nextVersion();
        }
    }

    getAdditionalColumns(isAdditionalListExpanded: boolean): object {
        const extendedItems = this.getExtendedFilterItems();
        const countColumnItems = extendedItems.length / 2;
        const maxCountVisibleItems = isAdditionalListExpanded ? countColumnItems : MAX_COLLAPSED_COUNT_OF_VISIBLE_ITEMS;
        const columns = {
            right: [],
            left: []
        };

        extendedItems.forEach((item, index) => {
            if (columns.left.length < maxCountVisibleItems && !(index % 2)) {
                columns.left.push(item);
            } else if (columns.right.length < maxCountVisibleItems) {
                columns.right.push(item);
            }
        });

        return columns;
    }

    needToCutColumnItems(): boolean {
        const extendedItems = this.getExtendedFilterItems();
        return extendedItems.length / 2 > MAX_COLLAPSED_COUNT_OF_VISIBLE_ITEMS;
    }

    getBasicFilterItems(): IFilterItem[] {
        return this._getItemsByViewMode('basic');
    }

    getExtendedFilterItems(): IFilterItem[] {
        return this._getItemsByViewMode('extended');
    }

    setEditingObject(editingObject: Record<string, IExtendedPropertyValue>): void {
        this._editingObject = editingObject;
        this._source = this._getSource(this._source);
        this._source = this._source.filter((item) => {
            return item.visibility !== false;
        });
        this._source.forEach((item) => {
            const editingItemProperty = editingObject[item.name];
            this._setValueToSourceItem(item, editingItemProperty);
            const newViewMode = editingItemProperty?.viewMode;
            const viewModeChanged = newViewMode && newViewMode !== item.viewMode;
            if (viewModeChanged) {
                if (item.viewMode === 'basic') {
                    item.value = item.resetValue;
                }
                item.viewMode = newViewMode;
            } else if (item.viewMode === 'extended' && !isEqual(item.value, item.resetValue)) {
                item.viewMode = 'basic';
            }
        });
        this._groupItems = this._getGroupItemsBySource(this._source);
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._nextVersion();
    }

    setEditingObjectValue(editorName: string, editorValue: object): void {
        const source = coreClone(this._source);
        const item = source.find((sItem) => {
            return sItem.name === editorName;
        });
        if (item.viewMode === 'extended') {
            item.viewMode = 'basic';
        }
        this._setValueToSourceItem(item, editorValue);
        this._source = this._getSource(source);
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._nextVersion();
    }

    collapseGroup(group: string | number): void {
        this._collapsedGroups = this._collapsedGroups.slice();
        this._collapsedGroups.push(group);
        this._nextVersion();
    }

    isFilterReseted(): boolean {
        return !this._source.some((item) => {
            return !isEqual(item.value, item.resetValue);
        });
    }

    hasExtendedItems(): boolean {
        return !!this.getExtendedFilterItems().length;
    }

    hasBasicItems(): boolean {
        return !!this.getBasicFilterItems().length;
    }

    getGroupItems(): Record<string, IFilterGroup> {
        return this._groupItems;
    }

    getCollapsedGroups(): string[] | number[] {
        return this._collapsedGroups;
    }

    getEditingObject(): Record<string, unknown> {
        return this._editingObject;
    }

    getSource(): IFilterItem[] {
        return this._source;
    }

    resetFilter(): void {
        this._source = coreClone(this._source);
        FilterUtils.resetFilter(this._source);
        this._resetSourceViewMode();
        this._collapsedGroups = [];
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._groupItems = this._getGroupItemsBySource(this._source);
        this._nextVersion();
    }

    resetFilterItem(name: string): void {
        this._source = coreClone(this._source);
        const item = this._source.find((filterItem) => filterItem.name === name);
        item.value = item.resetValue;
        item.textValue = '';
        this._editingObject = this._getEditingObjectBySource(this._source);
        this._groupItems = this._getGroupItemsBySource(this._source);
        this._nextVersion();
    }

    handleGroupClick(group: string, isExpanderClick?: boolean): void {
        const groupCollapsed = this._collapsedGroups.includes(group);
        if (isExpanderClick && !groupCollapsed) {
            this.collapseGroup(group);
        } else {
            this._expandGroup(group);
        }
    }
}
