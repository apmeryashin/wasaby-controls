import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/PropertyGrid';
import {SyntheticEvent} from 'Vdom/Vdom';
import {GroupItem, CollectionItem} from 'Controls/display';
import {IObservable, RecordSet} from 'Types/collection';
import {Model, Record as entityRecord} from 'Types/entity';
import {factory} from 'Types/chain';
import {object} from 'Types/util';
import {default as renderTemplate} from 'Controls/_propertyGrid/Render';
import {default as gridRenderTemplate} from 'Controls/_propertyGrid/GridRender';
import {IPropertyGridOptions} from 'Controls/_propertyGrid/IPropertyGrid';
import {default as IPropertyGridItem} from './IProperty';
import {
    PROPERTY_GROUP_FIELD,
    PROPERTY_TOGGLE_BUTTON_ICON_FIELD
} from './Constants';
import {groupConstants as constView} from '../list';
import PropertyGridCollection from './PropertyGridCollection';
import PropertyGridCollectionItem from './PropertyGridCollectionItem';
import {IItemAction, Controller as ItemActionsController} from 'Controls/itemActions';
import {StickyOpener} from 'Controls/popup';
import 'css!Controls/itemActions';
import 'css!Controls/propertyGrid';
import {
    FlatSelectionStrategy,
    IFlatSelectionStrategyOptions,
    ISelectionStrategy,
    ITreeSelectionStrategyOptions,
    SelectionController,
    TreeSelectionStrategy
} from 'Controls/multiselection';
import {isEqual} from 'Types/object';
import {ISelectionObject} from 'Controls/interface';

export type TToggledEditors = Record<string, boolean>;
type TPropertyGridCollection = PropertyGridCollection<PropertyGridCollectionItem<Model>>;

interface IPropertyGridValidatorArguments {
    item: PropertyGridCollectionItem<Model>;
}

/**
 * Контрол, который позволяет пользователям просматривать и редактировать свойства объекта.
 *
 * @remark
 * Вы можете использовать стандартные редакторы PropertyGrid или специальные редакторы.
 * По умолчанию propertyGrid будет автоматически генерировать все свойства для данного объекта.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/interface/IPropertyGrid
 * @implements Controls/propertyGrid:IProperty
 * @implements Controls/propertyGrid:IPropertyGrid
 * @implements Controls/interface:ISource
 * @demo Controls-demo/PropertyGridNew/Group/Expander/Index
 *
 * @public
 * @author Герасимов А.М.
 */

/*
 * Represents a control that allows users to inspect and edit the properties of an object.
 * You can use the standard editors that are provided with the PropertyGrid or you can use custom editors.
 * By default the propertyGrid will autogenerate all the properties for a given object
 * @extends UI/Base:Control
 * @implements Controls/interface/IPropertyGrid
 * @mixes Controls/propertyGrid:IPropertyGrid
 *
 * @public
 * @author Герасимов А.М.
 */
export default class PropertyGridView extends Control<IPropertyGridOptions> {
    protected _template: TemplateFunction = template;
    protected _listModel: TPropertyGridCollection;
    protected _render: TemplateFunction = renderTemplate;
    protected _collapsedGroups: Record<string, boolean> = {};
    protected _toggledEditors: TToggledEditors = {};
    private _selectionController: SelectionController;
    private _itemActionsController: ItemActionsController;
    private _itemActionSticky: StickyOpener;
    private _collapsedGroupsChanged: boolean = false;
    private _editingObject: Record<string, unknown> | entityRecord = null;

    protected _beforeMount(options: IPropertyGridOptions): void {
        this._collapsedGroups = this._getCollapsedGroups(options.collapsedGroups);
        this._toggledEditors = this._getToggledEditors(options.typeDescription, options.keyProperty);

        this._collectionChangedHandler = this._collectionChangedHandler.bind(this);
        this._listModel = this._getCollection(options);
        this._subscribeOnModelChanged();

        if (options.captionColumnOptions || options.editorColumnOptions) {
            this._render = gridRenderTemplate;
        }
        this._editingObject = options.editingObject;
    }

    protected _beforeUpdate(newOptions: IPropertyGridOptions): void {
        if (newOptions.editingObject !== this._options.editingObject) {
            this._listModel.setEditingObject(newOptions.editingObject);
            this._editingObject = newOptions.editingObject;
        }
        if (newOptions.typeDescription !== this._options.typeDescription) {
            this._toggledEditors = this._getToggledEditors(newOptions.typeDescription, newOptions.keyProperty);
            this._listModel = this._getCollection(newOptions);
        } else if (newOptions.itemPadding !== this._options.itemPadding) {
            this._listModel.setItemPadding(newOptions.itemPadding);
        }
        if (newOptions.collapsedGroups !== this._options.collapsedGroups) {
            this._collapsedGroups = this._getCollapsedGroups(newOptions.collapsedGroups);
            this._listModel.setFilter(this._displayFilter.bind(this));
        }
        if (newOptions.captionPosition !== this._options.captionPosition) {
            this._listModel.setCaptionPosition(newOptions.captionPosition);
        }

        if (newOptions.multiSelectAccessibilityProperty !== this._options.multiSelectAccessibilityProperty) {
            this._listModel.setMultiSelectAccessibilityProperty(newOptions.multiSelectAccessibilityProperty);
        }
        this._updateSelectionController(newOptions);
    }

    protected _afterUpdate(oldOptions: IPropertyGridOptions): void {
        if (this._collapsedGroupsChanged) {
            this._notify('controlResize', [], {bubbling: true});
            this._collapsedGroupsChanged = false;
        }
    }

    private _getCollection(options: IPropertyGridOptions): TPropertyGridCollection {
        const propertyGridItems = this._getPropertyGridItems(options.typeDescription, options.keyProperty);
        return new PropertyGridCollection({
            collection: propertyGridItems,
            editingObject: options.editingObject,
            parentProperty: options.parentProperty,
            nodeProperty: options.nodeProperty,
            keyProperty: propertyGridItems.getKeyProperty(),
            root: null,
            group: this._groupCallback.bind(this, options.groupProperty),
            filter: this._displayFilter.bind(this),
            toggledEditors: this._toggledEditors,
            itemPadding: options.itemPadding,
            multiSelectAccessibilityProperty: options.multiSelectAccessibilityProperty,
            multiSelectTemplate: options.multiSelectTemplate,
            multiSelectVisibility: options.multiSelectVisibility
        });
    }

    private _getToggledEditors(
        source: IPropertyGridItem[] | RecordSet<IPropertyGridItem>,
        keyProperty: string
    ): TToggledEditors {
        const toggledEditors = {};

        source.forEach((item) => {
            if (object.getPropertyValue(item, PROPERTY_TOGGLE_BUTTON_ICON_FIELD)) {
                toggledEditors[object.getPropertyValue<string>(item, keyProperty)] = false;
            }
        });
        return toggledEditors;
    }

    private _groupCallback(groupProperty: string, item: Model): string {
        return item.get(PROPERTY_TOGGLE_BUTTON_ICON_FIELD) ?
            'propertyGrid_toggleable_editors_group' :
            item.get(groupProperty);
    }

    private _displayFilter(
        itemContents: Model | string,
    ): boolean {
        if (itemContents instanceof Model) {
            const group = itemContents.get(PROPERTY_GROUP_FIELD);
            const name = itemContents.get(itemContents.getKeyProperty());

            return !this._collapsedGroups[group] && this._toggledEditors[name] !== false;
        }
        return itemContents !== constView.hiddenGroup;
    }

    private _getCollapsedGroups(collapsedGroups: Array<string | number> = []): Record<string, boolean> {
        return collapsedGroups.reduce((acc: Record<string, boolean>, key: string): Record<string, boolean> => {
            acc[key] = true;
            return acc;
        }, {});
    }

    private _getPropertyGridItems(
        items: IPropertyGridItem[] | RecordSet<IPropertyGridItem>,
        keyProperty: string
    ): RecordSet<IPropertyGridItem> {
        if (items instanceof RecordSet) {
            return items;
        }
        return new RecordSet({
            rawData: items,
            keyProperty
        });
    }

    protected _updatePropertyValue(
        editingObject: Record<string, unknown> | entityRecord,
        name: string,
        value: unknown
    ): Record<string, unknown> | entityRecord {
        let resultEditingObject;
        if (editingObject instanceof entityRecord) {
            resultEditingObject = editingObject;

            if (!resultEditingObject.has(name)) {
                const newEditingObject = factory(editingObject).toObject();
                newEditingObject[name] = value;
                const format = Model.fromObject(newEditingObject, resultEditingObject.getAdapter()).getFormat();
                const propertyFormat = format.at(format.getFieldIndex(name));
                resultEditingObject.addField({
                    name: propertyFormat.getName(),
                    type: propertyFormat.getType(),
                    defaultValue: value
                });
            }
            resultEditingObject.set(name, value);
            this._listModel.setEditingObject(resultEditingObject);
        } else {
            resultEditingObject = object.clone(editingObject);
            resultEditingObject[name] = value;
        }
        return resultEditingObject;
    }

    protected _propertyValueChanged(event: SyntheticEvent<Event>, item: Model, value: any): void {
        const name = item.get(this._listModel.getKeyProperty());
        this._editingObject = this._updatePropertyValue(this._editingObject, name, value);
        this._notify('editingObjectChanged', [this._editingObject]);
    }

    protected _groupClick(
        event: SyntheticEvent<Event>,
        displayItem: GroupItem<Model> | PropertyGridCollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        const isExpandClick = clickEvent?.target.closest('.controls-PropertyGrid__groupExpander');
        if (isExpandClick) {
            const groupName = displayItem.getContents();
            const collapsed = this._collapsedGroups[groupName];
            displayItem.toggleExpanded();
            this._collapsedGroups[groupName] = !collapsed;
            this._listModel.setFilter(this._displayFilter.bind(this));
            this._collapsedGroupsChanged = true;

        }
    }

    _hoveredItemChanged(e: SyntheticEvent<Event>, item: PropertyGridCollectionItem<Model>): void {
        this._listModel.setHoveredItem(item);
    }

    protected _mouseEnterHandler(): void {
        if (!this._itemActionsController) {
            import('Controls/itemActions').then(({Controller}) => {
                this._itemActionsController = new Controller();
                this._updateItemActions(this._listModel, this._options);
            });
        } else {
            this._updateItemActions(this._listModel, this._options);
        }
    }

    protected _itemActionMouseDown(event: SyntheticEvent<MouseEvent>,
                                   item: CollectionItem<Model>,
                                   action: IItemAction,
                                   clickEvent: SyntheticEvent<MouseEvent>): void {
        const contents: Model = item.getContents();
        if (action && !action['parent@'] && action.handler) {
            action.handler(contents);
        } else {
            this._openItemActionMenu(item, action, clickEvent);
        }
    }

    protected _toggleEditor(event: SyntheticEvent, item: Model, value: boolean): void {
        this._toggledEditors = {...this._toggledEditors};
        this._toggledEditors[item.get(this._listModel.getKeyProperty())] = value;
        this._listModel.setToggledEditors(this._toggledEditors);
        this._listModel.setFilter(this._displayFilter.bind(this));
    }

    private _openItemActionMenu(item: CollectionItem<Model>,
                                action: IItemAction,
                                clickEvent: SyntheticEvent<MouseEvent>): void {
        const menuConfig = this._itemActionsController.prepareActionsMenuConfig(item, clickEvent,
            action, this, false);
        if (menuConfig) {
            if (!this._itemActionSticky) {
                this._itemActionSticky = new StickyOpener();
            }
            menuConfig.eventHandlers = {
                onResult: this._onItemActionsMenuResult.bind(this),
                onClose: () => {
                    this._itemActionsController.setActiveItem(null);
                }
            };
            this._itemActionSticky.open(menuConfig);
            this._itemActionsController.setActiveItem(item);
        }
    }

    private _onItemActionsMenuResult(eventName: string, actionModel: Model): void {
        if (eventName === 'itemClick') {
            const action = actionModel && actionModel.getRawData();
            if (action && !action['parent@']) {
                const item = this._itemActionsController.getActiveItem();
                if (action.handler) {
                    action.handler(item.getContents());
                }
                this._itemActionSticky.close();
            }
        }
    }

    private _updateItemActions(listModel: TPropertyGridCollection, options: IPropertyGridOptions): void {
        const itemActions: IItemAction[] = options.itemActions;

        if (!itemActions) {
            return;
        }
        this._itemActionsController.update({
            collection: listModel,
            itemActions,
            visibilityCallback: options.itemActionVisibilityCallback,
            style: 'default',
            theme: options.theme
        });
    }

    private _getSelectionController(options: IPropertyGridOptions = this._options): SelectionController {
        if (!this._selectionController) {
            const strategy = this._createSelectionStrategy(
                options,
                this._listModel
            );
            this._selectionController = new SelectionController({
                model: this._listModel,
                selectedKeys: options.selectedKeys,
                excludedKeys: options.excludedKeys,
                strategy
            });
        }

        return this._selectionController;
    }

    private _updateSelectionController(newOptions: IPropertyGridOptions): void {
        const selectionChanged = !isEqual(this._options.selectedKeys, newOptions.selectedKeys) ||
                                 !isEqual(this._options.excludedKeys, newOptions.excludedKeys);

        if (selectionChanged) {
            const controller = this._getSelectionController(newOptions);
            const newSelection = newOptions.selectedKeys === undefined
                ? controller.getSelection()
                : {
                    selected: newOptions.selectedKeys,
                    excluded: newOptions.excludedKeys || []
                };
            controller.setSelection(newSelection);
        }
        if (newOptions.multiSelectVisibility === 'hidden' && this._selectionController) {
            this._selectionController.destroy();
            this._selectionController = null;
        }
    }

    private _createSelectionStrategy(
        options: IPropertyGridOptions,
        collection: TPropertyGridCollection
    ): ISelectionStrategy {
        const strategyOptions = this._getSelectionStrategyOptions(options, collection);
        if (options.parentProperty) {
            return new TreeSelectionStrategy(strategyOptions as ITreeSelectionStrategyOptions);
        } else {
            return new FlatSelectionStrategy(strategyOptions);
        }
    }

    private _getSelectionStrategyOptions(
        {parentProperty}: IPropertyGridOptions,
        collection: TPropertyGridCollection
    ): ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions {
        if (parentProperty) {
            return {
                rootId: null,
                model: collection,
                selectionType: 'all',
                recursiveSelection: false
            };
        } else {
            return { model: collection };
        }
    }

    protected _checkboxClick(event: SyntheticEvent, item: PropertyGridCollectionItem<Model>): void {
        if (!item.isReadonlyCheckbox()) {
            const newSelection = this._getSelectionController().toggleItem(item.getContents().getKey());
            this._changeSelection(newSelection);
        }
    }

    private _changeSelection(selection: ISelectionObject): void {
        const selectionController = this._getSelectionController();
        const selectionDifference = selectionController.getSelectionDifference(selection);

        if (this._options.selectedKeys === undefined) {
            this._getSelectionController().setSelection(selection);
        }

        const selectedDiff = selectionDifference.selectedKeysDifference;
        if (selectedDiff.added.length || selectedDiff.removed.length) {
            this._notify('selectedKeysChanged', [selectedDiff.keys, selectedDiff.added, selectedDiff.removed]);
        }

        const excludedDiff = selectionDifference.excludedKeysDifference;
        if (excludedDiff.added.length || excludedDiff.removed.length) {
            this._notify('excludedKeysChanged', [excludedDiff.keys, excludedDiff.added, excludedDiff.removed]);
        }
    }

    private _subscribeOnModelChanged(): void {
        this._listModel.subscribe('onCollectionChange', this._collectionChangedHandler);
    }

    private _collectionChangedHandler(
        event: SyntheticEvent,
        action: string,
        newItems: Array<CollectionItem<Model>>,
        newItemsIndex: number,
        removedItems: Array<CollectionItem<Model>>
    ): void {
        const options = this._options || {};
        const handleSelection =
            action === IObservable.ACTION_RESET &&
            options.selectedKeys &&
            options.selectedKeys.length &&
            options.multiSelectVisibility !== 'hidden';

        if (handleSelection) {
            const selectionController = this._getSelectionController();

            let newSelection;
            switch (action) {
                case IObservable.ACTION_REMOVE:
                    newSelection = selectionController.onCollectionRemove(...removedItems);
                    break;
                case IObservable.ACTION_REPLACE:
                    selectionController.onCollectionReplace(newItems);
                    break;
                case IObservable.ACTION_MOVE:
                    selectionController.onCollectionMove();
                    break;
            }

            if (newSelection) {
                this._changeSelection(newSelection);
            }
        }
    }

    validate({item}: IPropertyGridValidatorArguments): Array<string | boolean> | boolean {
        const validators = item.getValidators();
        let validatorResult: boolean | string = true;
        const validatorArgs = {
            value: item.getPropertyValue(),
            item: item.getContents(),
            items: item.getOwner().getCollection()
        };
        if (validators.length) {
            validators.some((validator) => {
                if (typeof validator === 'function') {
                    validatorResult = validator(validatorArgs);
                    if (typeof validatorResult === 'string') {
                        return true;
                    }
                }
            });
        }
        return validatorResult;
    }

    static defaultProps: Partial<IPropertyGridOptions> = {
        keyProperty: 'name',
        groupProperty: PROPERTY_GROUP_FIELD,
        withoutLevelPadding: true,
        itemsContainerPadding: {
            top: 'm',
            bottom: 'm',
            left: 'm',
            right: 'm'
        }
    };

    static getDefaultPropertyGridItem(): IPropertyGridItem {
        return {
            name: undefined,
            caption: undefined,
            editorTemplateName: undefined,
            editorOptions: undefined,
            editorClass: undefined,
            type: undefined,
            group: constView.hiddenGroup,
            propertyValue: undefined
        };
    }
}
