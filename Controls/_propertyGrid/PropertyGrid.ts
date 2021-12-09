import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/PropertyGrid';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as cInstance from 'Core/core-instance';
import {GroupItem, CollectionItem, TreeItem, IEditableCollectionItem} from 'Controls/display';
import {IObservable, RecordSet} from 'Types/collection';
import {Model, Record as entityRecord} from 'Types/entity';
import {factory} from 'Types/chain';
import {object} from 'Types/util';
import {default as renderTemplate} from 'Controls/_propertyGrid/Render';
import {default as gridRenderTemplate} from 'Controls/_propertyGrid/GridRender';
import {IPropertyGridOptions, TEditingObject} from 'Controls/_propertyGrid/IPropertyGrid';
import {Move as MoveViewCommand, AtomicRemove as RemoveViewCommand} from 'Controls/viewCommands';
import {Move as MoveCommand} from 'Controls/listCommands';
import {default as IPropertyGridItem} from './IProperty';
import {
    EDIT_IN_PLACE_CANCEL,
    PROPERTY_GROUP_FIELD,
    PROPERTY_TOGGLE_BUTTON_ICON_FIELD
} from './Constants';
import {groupConstants as constView} from '../list';
import PropertyGridCollection from './PropertyGridCollection';
import PropertyGridCollectionItem from './PropertyGridCollectionItem';
import {IItemAction, Controller as ItemActionsController, IItemActionsItem} from 'Controls/itemActions';
import {Confirmation, StickyOpener} from 'Controls/popup';
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
import {ISelectionObject, TKey} from 'Controls/interface';
import {CrudEntityKey, LOCAL_MOVE_POSITION, Memory} from 'Types/source';
import {detection} from 'Env/Env';
import {TouchDetect} from 'Env/Touch';
import {IDragObject, ItemsEntity} from 'Controls/dragnDrop';
import {DndController, FlatStrategy, IDragStrategyParams, TreeStrategy} from 'Controls/listDragNDrop';
import {DimensionsMeasurer} from 'Controls/sizeUtils';
import {Logger} from 'UI/Utils';
import {
    Controller as EditInPlaceController, IBeforeBeginEditCallbackParams,
    IBeforeEndEditCallbackParams,
    InputHelper as EditInPlaceInputHelper, TAsyncOperationResult
} from 'Controls/editInPlace';
import {Container as ValidateContainer, ControllerClass as ValidationController} from 'Controls/validate';

const DRAGGING_OFFSET = 10;
const DRAG_SHIFT_LIMIT = 4;
const IE_MOUSEMOVE_FIX_DELAY = 50;
const ITEM_ACTION_SELECTOR = '.js-controls-ItemActions__ItemAction';

interface IEditingUserOptions {
    item?: Model;
}

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
 * @implements Controls/propertyGrid:IPropertyGrid
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/list:IRemovableList
 * @implements Controls/list:IMovableList
 * @implements Controls/interface:IItemPadding
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
    private _editingObject: TEditingObject = null;
    private _dndController: DndController;
    private _editInPlaceController: EditInPlaceController;
    private _editInPlaceInputHelper: EditInPlaceInputHelper;
    private _isPendingDeferredSubmit: boolean;
    private _validateController: ValidationController = null;

    protected _beforeMount(options: IPropertyGridOptions): void {
        const {selectedKeys} = options;
        this._collapsedGroups = this._getCollapsedGroups(options.collapsedGroups);
        this._toggledEditors = this._getToggledEditors(options);

        this._collectionChangedHandler = this._collectionChangedHandler.bind(this);
        this._listModel = this._getCollection(options);
        this._subscribeOnModelChanged();

        if (options.captionColumnOptions || options.editorColumnOptions) {
            this._render = gridRenderTemplate;
        }
        if (options.multiSelectVisibility !== 'hidden' && selectedKeys?.length > 0) {
            this._getSelectionController(options)
                .setSelection({selected: selectedKeys, excluded: options.excludedKeys});
        }
        this._editingObject = options.editingObject;
    }

    protected _beforeUpdate(newOptions: IPropertyGridOptions): void {
        const {
            editingObject,
            typeDescription,
            itemPadding,
            collapsedGroups,
            captionPosition,
            multiSelectAccessibilityProperty
        } = newOptions;

        if (editingObject !== this._options.editingObject) {
            this._listModel.setEditingObject(editingObject);
            this._editingObject = editingObject;
        }

        if (typeDescription !== this._options.typeDescription) {
            this._toggledEditors = this._getToggledEditors(newOptions);
            this._listModel = this._getCollection(newOptions);
        } else if (itemPadding !== this._options.itemPadding) {
            this._listModel.setItemPadding(itemPadding);
        }
        if (collapsedGroups !== this._options.collapsedGroups) {
            this._collapsedGroups = this._getCollapsedGroups(collapsedGroups);
            this._listModel.setFilter(this._displayFilter.bind(this));
        }
        if (captionPosition !== this._options.captionPosition) {
            this._listModel.setCaptionPosition(captionPosition);
        }

        if (multiSelectAccessibilityProperty !== this._options.multiSelectAccessibilityProperty) {
            this._listModel.setMultiSelectAccessibilityProperty(multiSelectAccessibilityProperty);
        }
        this._updateSelectionController(newOptions);
    }

    protected _afterUpdate(oldOptions: IPropertyGridOptions): void {
        if (this._collapsedGroupsChanged) {
            this._notify('controlResize', [], {bubbling: true});
            this._collapsedGroupsChanged = false;
        }

        // Запустить валидацию, которая была заказана методом commit у редактирования по месту, после
        // применения всех обновлений реактивных состояний.
        if (this._isPendingDeferredSubmit && this._validateController) {
            this._validateController.resolveSubmit();
            this._isPendingDeferredSubmit = false;
        }
    }

    protected _afterMount(): void {
        this._notify('register', ['documentDragStart', this, this._documentDragStart], {bubbling: true});
        this._notify('register', ['documentDragEnd', this, this._documentDragEnd], {bubbling: true});
    }

    protected _afterRender(oldOptions?: IPropertyGridOptions, oldContext?: any): void {
        // Активация поля ввода должна происходить после рендера.
        if (
            this._editInPlaceController &&
            this._editInPlaceController.isEditing() &&
            !this._editInPlaceController.isEndEditProcessing()
        ) {
            this._editInPlaceInputHelper.activateInput(() => true);
        }
    }

    protected _beforeUnmount(): void {
        if (this._options.itemsDragNDrop) {
            this._notify('_removeDraggingTemplate', [], {bubbling: true});
        }
        this._notify('unregister', ['documentDragStart', this], {bubbling: true});
        this._notify('unregister', ['documentDragEnd', this], {bubbling: true});
        if (this._validateController) {
            this._validateController.destroy();
            this._validateController = null;
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

    private _getToggledEditors({typeDescription, keyProperty, toggledEditors}: IPropertyGridOptions): TToggledEditors {
        const result = {};
        let key;

        typeDescription.forEach((item) => {
            if (object.getPropertyValue(item, PROPERTY_TOGGLE_BUTTON_ICON_FIELD)) {
                key = object.getPropertyValue<string>(item, keyProperty);
                result[key] = toggledEditors ? toggledEditors.includes(key) : false;
            }
        });
        return result;
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
            const group = itemContents.get(this._options.groupProperty);
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
        editingObject: TEditingObject,
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

    protected _itemMouseDown(
        event: SyntheticEvent<Event>,
        displayItem: PropertyGridCollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        if (!!clickEvent.target.closest(ITEM_ACTION_SELECTOR)) {
            event.stopPropagation();
            return;
        }
        if (this._unprocessedDragEnteredItem) {
            this._unprocessedDragEnteredItem = null;
        }
        if (!this._options.readOnly && this._options.itemsDragNDrop) {
            this._startDragNDrop(clickEvent, displayItem);
        }
    }

    protected _itemMouseUp(e, displayItem, domEvent): void {
        this._draggedKey = null;
        if (this._dndController && !this._dndController.isDragging()) {
            this._dndController = null;
        }

        this._onLastMouseUpWasDrag = this._dndController && this._dndController.isDragging();
    }

    protected _itemMouseEnter(event: SyntheticEvent<Event>,
                    displayItem: PropertyGridCollectionItem<Model>): void {
        if (this._dndController) {
            if (this._dndController.isDragging()) {
                this._listModel.setHoveredItem(null);
            }
            if (this._itemMouseEntered !== displayItem) {
                this._itemMouseEntered = displayItem;
                this._unprocessedDragEnteredItem = displayItem;
                this._processItemMouseEnterWithDragNDrop(displayItem);
            }
        } else {
            if (!this._editInPlaceController?.isEditing()) {
                this._listModel.setHoveredItem(displayItem);
            }
        }
    }

    _itemMouseMove(event, displayItem, nativeEvent) {
        if (this._dndController && this._dndController.isDragging()) {
            this._draggingItemMouseMove(displayItem, nativeEvent);
        }
    }

    protected _itemMouseLeave() {
        if (!this._editInPlaceController?.isEditing()) {
            this._listModel.setHoveredItem(null);
        }
        if (this._dndController) {
            this._unprocessedDragEnteredItem = null;
        }
    }

    protected _mouseEnterHandler(): void {
        if (this._listModel) {
            this._dragEnter(this._getDragObject());
        }
        this._getItemActionsController().then(() => {
            this._updateItemActions(this._listModel, this._options);
        });
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

    protected _itemContextMenu(event: SyntheticEvent<Event>,
                               item: CollectionItem<Model>,
                               clickEvent: SyntheticEvent<MouseEvent>): void {
        clickEvent.stopPropagation();
        this._openItemActionMenu(item, null, clickEvent);
    }

    protected _toggleEditor(event: SyntheticEvent, item: Model, value: boolean): void {
        const currentEditorName: string = item.get(this._listModel.getKeyProperty());
        this._toggledEditors = {...this._toggledEditors};
        this._toggledEditors[currentEditorName] = value;
        this._listModel.setToggledEditors(this._toggledEditors);

        const toggledEditorsNames = Object.keys(this._toggledEditors)
            .reduce((acc, key) => !this._toggledEditors[key] ? acc.concat([key]) : acc, []);
        const hidden = toggledEditorsNames.indexOf(currentEditorName) !== -1 ? [toggledEditorsNames] : [];
        const shown = toggledEditorsNames.indexOf(currentEditorName) === -1 ? [toggledEditorsNames] : [];

        this._notify('toggledEditorsChanged', [toggledEditorsNames, hidden, shown]);
        this._listModel.setFilter(this._displayFilter.bind(this));
    }

    private _openItemActionMenu(item: CollectionItem<Model>,
                                action: IItemAction,
                                clickEvent: SyntheticEvent<MouseEvent>): void {
        const isContextMenu = !action;
        const menuConfig = this._itemActionsController.prepareActionsMenuConfig(item, clickEvent,
            action, this, isContextMenu);
        if (menuConfig) {
            if (isContextMenu) {
                clickEvent.preventDefault();
            }
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

    private _getItemActionsController(): Promise<ItemActionsController> {
        if (!this._itemActionsController) {
            return import('Controls/itemActions').then(({Controller}) => {
                this._itemActionsController = new Controller();
                return this._itemActionsController;
            });
        }
        return Promise.resolve(this._itemActionsController);
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

    private _updateItemActions(listModel: TPropertyGridCollection,
                               options: IPropertyGridOptions,
                               editingItem?: IEditableCollectionItem & IItemActionsItem): void {
        const itemActions: IItemAction[] = options.itemActions;
        if (!itemActions && !editingItem) {
            return;
        }
        this._itemActionsController.update({
            collection: listModel,
            itemActions,
            editingToolbarVisible: !!editingItem,
            editingItem,
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
        const {selectedKeys, excludedKeys} = newOptions;
        const isTypeDescriptionChanged = newOptions.typeDescription !== this._options.typeDescription;
        const isUpdateNeeded = !isEqual(this._options.selectedKeys, selectedKeys) ||
                               !isEqual(this._options.excludedKeys, excludedKeys) ||
                               isTypeDescriptionChanged;

        if (isTypeDescriptionChanged || newOptions.multiSelectVisibility === 'hidden') {
            this._destroySelectionController();
        }

        if (isUpdateNeeded) {
            const controller = this._getSelectionController(newOptions);
            const newSelection = selectedKeys === undefined
                ? controller.getSelection()
                : {
                    selected: selectedKeys,
                    excluded: excludedKeys || []
                };
            controller.setSelection(newSelection);
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
        {parentProperty, selectionType}: IPropertyGridOptions,
        collection: TPropertyGridCollection
    ): ITreeSelectionStrategyOptions | IFlatSelectionStrategyOptions {
        if (parentProperty) {
            return {
                rootId: null,
                model: collection,
                selectionType: selectionType || 'all',
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

    private _destroySelectionController(): void {
        if (this._selectionController) {
            this._selectionController.destroy();
            this._selectionController = null;
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

    _documentDragStart(dragObject: IDragObject): void {
        if (this._options.readOnly || !this._options.itemsDragNDrop || !(dragObject && dragObject.entity)) {
            return;
        }

        if (this._insideDragging) {
            this._dragStart(dragObject, this._draggedKey);
        }
        this._documentDragging = true;
    }

    _dragStart(dragObject: IDragObject, draggedKey: CrudEntityKey): void {
        this._dndController.startDrag(dragObject.entity);

        if (this._unprocessedDragEnteredItem) {
            this._processItemMouseEnterWithDragNDrop(this._unprocessedDragEnteredItem);
        }

        if (this._options.draggingTemplate && this._listModel.isDragOutsideList()) {
            this._notify('_updateDraggingTemplate', [dragObject, this._options.draggingTemplate], {bubbling: true});
        }
    }

    _dragLeave(): void {
        this._insideDragging = false;
        if (this._dndController && this._dndController.isDragging()) {
            const draggableItem = this._dndController.getDraggableItem();
            if (draggableItem && this._listModel.getItemBySourceKey(draggableItem.getContents().getKey())) {
                const newPosition = this._dndController.calculateDragPosition({targetItem: null});
                this._dndController.setDragPosition(newPosition);
            } else {
                this._dndController.endDrag();
            }
        }
        this._listModel.setDragOutsideList(true);
    }

    _dragEnter(dragObject: IDragObject): void {
        this._insideDragging = true;
        if (this._documentDragging) {
            this._notify('_removeDraggingTemplate', [], {bubbling: true});
        }
        this._listModel.setDragOutsideList(false);

        if (this._dndController?.isDragging()) {
            return;
        }

        if (this._documentDragging) {
            if (dragObject && cInstance.instanceOfModule(dragObject.entity, 'Controls/dragnDrop:ItemsEntity')) {
                const dragEnterResult = this._notify('dragEnter', [dragObject.entity]);

                if (cInstance.instanceOfModule(dragEnterResult, 'Types/entity:Record')) {
                    const draggableItem = this._listModel.createItem({contents: dragEnterResult});
                    this._dndController = this._createDndController(this._listModel, draggableItem, this._options);
                    this._dndController.startDrag(dragObject.entity);

                    let startPosition;
                    if (this._listModel.getCount()) {
                        const lastItem = this._listModel.getLast();
                        startPosition = {
                            index: this._listModel.getIndex(lastItem),
                            dispItem: lastItem,
                            position: 'after'
                        };
                    } else {
                        startPosition = {
                            index: 0,
                            dispItem: draggableItem,
                            position: 'before'
                        };
                    }

                    this._dndController.setDragPosition(startPosition);
                } else if (dragEnterResult === true) {
                    this._dndController = this._createDndController(this._listModel, null, this._options);
                    this._dndController.startDrag(dragObject.entity);
                }
            }
        }
    }

    _documentDragEnd(dragObject: IDragObject): void {
        this._documentDragging = false;

        if (!this._listModel || !this._dndController || !this._dndController.isDragging()) {
            return;
        }

        let dragEndResult: Promise<any> | undefined;
        if (this._insideDragging && this._dndController) {
            const targetPosition = this._dndController.getDragPosition();
            if (targetPosition && targetPosition.dispItem) {
                dragEndResult = this._notify('dragEnd', [
                    dragObject.entity,
                    targetPosition.dispItem.getContents(),
                    targetPosition.position
                ]);
            }
        }

        const endDrag = () => {
            this._dndController.endDrag();
            this._dndController = null;
        };

        if (this._dndController) {
            if (dragEndResult instanceof Promise) {
                dragEndResult.finally(() => {
                    endDrag();
                });
            } else {
                endDrag();
            }
        }

        this._insideDragging = false;
        this._draggedKey = null;
        this._listModel.setDragOutsideList(false);
    }

    private _startDragNDrop(event: SyntheticEvent<MouseEvent>, draggableItem: PropertyGridCollectionItem<Model>): void {
        if (DndController.canStartDragNDrop(undefined, event, TouchDetect.getInstance().isTouch())) {
            const draggableKey = draggableItem.getContents().getKey();

            this._dndController = this._createDndController(this._listModel, draggableItem, this._options);
            let dragStartResult = this._notify('dragStart', [[draggableKey], draggableKey]);

            if (dragStartResult === undefined) {
                dragStartResult = new ItemsEntity({items: [draggableKey]});
            }

            if (dragStartResult) {
                if (this._options.dragControlId) {
                    dragStartResult.dragControlId = this._options.dragControlId;
                }

                this._dragEntity = dragStartResult;
                this._draggedKey = draggableKey;
                this._startEvent = event.nativeEvent;

                this._clearSelectedText(this._startEvent);
                if (this._startEvent && this._startEvent.target) {
                    this._startEvent.target.classList.add('controls-DragNDrop__dragTarget');
                }

                this._registerMouseMove();
                this._registerMouseUp();
            }
        }
    }

    private _clearSelectedText(event): void {
        if (event.type === 'mousedown') {
            const selection = window.getSelection();
            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            } else if (selection.empty) {
                selection.empty();
            }
        }
    }

    private _dragNDropEnded(event: SyntheticEvent): void {
        if (this._dndController && this._dndController.isDragging()) {
            const dragObject = this._getDragObject(event.nativeEvent, this._startEvent);
            this._notify('_documentDragEnd', [dragObject], {bubbling: true});
        }
        if (this._startEvent && this._startEvent.target) {
            this._startEvent.target.classList.remove('controls-DragNDrop__dragTarget');
        }
        this._unregisterMouseMove();
        this._unregisterMouseUp();
        this._dragEntity = null;
        this._startEvent = null;
    }

    private _getDragObject(mouseEvent?, startEvent?): IDragObject {
        const result: IDragObject = {
            entity: this._dragEntity
        };
        if (mouseEvent && startEvent) {
            result.domEvent = mouseEvent;
            result.position = this._getPageXY(mouseEvent);
            result.offset = this._getDragOffset(mouseEvent, startEvent);
            result.draggingTemplateOffset = DRAGGING_OFFSET;
        }
        return result;
    }

    private _registerMouseMove(): void {
        this._notify('register', ['mousemove', this, this._onMouseMove], {bubbling: true});
        this._notify('register', ['touchmove', this, this._onTouchMove], {bubbling: true});
    }

    private _unregisterMouseMove(): void {
        this._notify('unregister', ['mousemove', this], {bubbling: true});
        this._notify('unregister', ['touchmove', this], {bubbling: true});
    }

    private _registerMouseUp(): void {
        this._notify('register', ['mouseup', this, this._onMouseUp], {bubbling: true});
        this._notify('register', ['touchend', this, this._onMouseUp], {bubbling: true});
    }

    private _unregisterMouseUp(): void {
        this._notify('unregister', ['mouseup', this], {bubbling: true});
        this._notify('unregister', ['touchend', this], {bubbling: true});
    }

    private _onMouseMove(event): void {
        if (event.nativeEvent) {
            if (detection.isIE) {
                this._onMouseMoveIEFix(event);
            } else {
                if (!event.nativeEvent.buttons) {
                    this._dragNDropEnded(event);
                }
            }
            if (event.nativeEvent.buttons) {
                this._onMove(event.nativeEvent);
            }
        }
    }

    private _onMove(nativeEvent): void {
        if (this._startEvent) {
            const dragObject = this._getDragObject(nativeEvent, this._startEvent);
            if ((!this._dndController || !this._dndController.isDragging()) && this._isDragStarted(this._startEvent, nativeEvent)) {
                this._insideDragging = true;
                this._notify('_documentDragStart', [dragObject], {bubbling: true});
            }
            if (this._dndController && this._dndController.isDragging()) {
                const moveOutsideList = !this._container.contains(nativeEvent.target);
                if (moveOutsideList !== this._listModel.isDragOutsideList()) {
                    this._listModel.setDragOutsideList(moveOutsideList);
                }

                this._notify('dragMove', [dragObject]);
                if (this._options.draggingTemplate && this._listModel.isDragOutsideList()) {
                    this._notify('_updateDraggingTemplate', [dragObject, this._options.draggingTemplate], {bubbling: true});
                }
            }
        }
    }

    private _getPageXY(event): object {
        return DimensionsMeasurer.getMouseCoordsByMouseEvent(event.nativeEvent ? event.nativeEvent : event);
    }

    private _isDragStarted(startEvent, moveEvent): boolean {
        const offset = this._getDragOffset(moveEvent, startEvent);
        return Math.abs(offset.x) > DRAG_SHIFT_LIMIT || Math.abs(offset.y) > DRAG_SHIFT_LIMIT;
    }

    private _getDragOffset(moveEvent, startEvent): object {
        const moveEventXY = this._getPageXY(moveEvent),
            startEventXY = this._getPageXY(startEvent);

        return {
            y: moveEventXY.y - startEventXY.y,
            x: moveEventXY.x - startEventXY.x
        };
    }

    private _onMouseUp(event): void {
        if (this._startEvent) {
            this._dragNDropEnded(event);
        }
    }

    private _onMouseMoveIEFix(event): void {
        if (!event.nativeEvent.buttons && !this._endDragNDropTimer) {
            this._endDragNDropTimer = setTimeout(() => {
                this._dragNDropEnded(event);
            }, IE_MOUSEMOVE_FIX_DELAY);
        } else {
            clearTimeout(this._endDragNDropTimer);
            this._endDragNDropTimer = null;
        }
    }

    private _createDndController(
        model: TPropertyGridCollection,
        draggableItem: CollectionItem,
        options: any
    ): DndController<IDragStrategyParams> {
        let strategy;
        if (options.parentProperty) {
            strategy = TreeStrategy;
        } else {
            strategy = FlatStrategy;
        }
        return new DndController(model, draggableItem, strategy);
    }

    private _processItemMouseEnterWithDragNDrop(item): void {
        let dragPosition;
        const targetItem = item;
        if (this._dndController.isDragging()) {
            dragPosition = this._dndController.calculateDragPosition({targetItem});
            if (dragPosition) {
                const changeDragTarget = this._notify('changeDragTarget', [this._dndController.getDragEntity(), dragPosition.dispItem.getContents(), dragPosition.position]);
                if (changeDragTarget !== false) {
                    this._dndController.setDragPosition(dragPosition);
                }
            }
            this._unprocessedDragEnteredItem = null;
        }
    }

    private _calculateMouseOffsetInItem(event: SyntheticEvent<MouseEvent>, targetElement: Element): {top: number, bottom: number} {
        let result = null;

        if (targetElement) {
            const dragTargetRect = targetElement.getBoundingClientRect();
            result = { top: null, bottom: null };

            const mouseCoords = DimensionsMeasurer.getMouseCoordsByMouseEvent(event.nativeEvent);
            result.top = (mouseCoords.y - dragTargetRect.top) / dragTargetRect.height;
            result.bottom = (dragTargetRect.top + dragTargetRect.height - mouseCoords.y) / dragTargetRect.height;
        }

        return result;
    }

    private _draggingItemMouseMove(itemData: TreeItem, event: SyntheticEvent<MouseEvent>): void {
        const dispItem = itemData;
        const targetIsNotDraggableItem = this._dndController.getDraggableItem()?.getContents() !== dispItem.getContents();
        if (dispItem['[Controls/_display/TreeItem]'] && dispItem.isNode() !== null && targetIsNotDraggableItem) {
            const targetElement = this._getTargetRow(event);
            const mouseOffsetInTargetItem = this._calculateMouseOffsetInItem(event, targetElement);
            const dragTargetPosition = this._dndController.calculateDragPosition({
                targetItem: dispItem,
                mouseOffsetInTargetItem
            });

            if (dragTargetPosition) {
                const result = this._notify('changeDragTarget', [
                    this._dndController.getDragEntity(),
                    dragTargetPosition.dispItem.getContents(),
                    dragTargetPosition.position
                ]);

                if (result !== false) {
                    this._dndController.setDragPosition(dragTargetPosition);
                }
            }
        }
    }

    private _getTargetRow(event: SyntheticEvent): Element {
        if (!event.target || !event.target.classList || !event.target.parentNode || !event.target.parentNode.classList) {
            return event.target;
        }

        const startTarget = event.target;
        let target = startTarget;

        const condition = () => {
            return !target.parentNode.classList.contains('controls-ListView__itemV');
        };

        while (condition()) {
            target = target.parentNode;

            // Условие выхода из цикла, когда controls-ListView__itemV не нашелся в родительских блоках
            if (!target.classList || !target.parentNode || !target.parentNode.classList
                || target.classList.contains('controls-BaseControl')) {
                target = startTarget;
                break;
            }
        }
        return target;
    }

    startValidation({item}: IPropertyGridValidatorArguments): Array<string | boolean> | boolean {
        const validators = item.getValidators();
        let validatorResult: boolean | string = true;
        const validatorArgs = {
            value: item.getPropertyValue(),
            item: item.getContents(),
            items: item.getOwner().getCollection(),
            editingObject: item.getOwner().getEditingObject()
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

    _getRemoveViewCommand(selection: ISelectionObject): RemoveViewCommand {
        return new RemoveViewCommand({
            keyProperty: this._listModel.getKeyProperty(),
            nodeProperty: this._listModel.getNodeProperty(),
            parentProperty: this._listModel.getParentProperty(),
            items: this._listModel.getCollection(),
            selection
        });
    }

    _getMoveViewCommand(keys: TKey[],
                        direction: LOCAL_MOVE_POSITION,
                        target?: Model): MoveViewCommand {
        return new MoveViewCommand({
            parentProperty: this._options.parentProperty,
            nodeProperty: this._options.nodeProperty,
            collection: this._listModel.getCollection(),
            items: keys,
            root: null,
            direction,
            target,
            keyProperty: this._listModel.getKeyProperty()
        });
    }

    removeItems(selection: ISelectionObject, removeConfirmationText?: string): Promise<void | string> {
        const resultSelection = {
            selected: selection.selected || [],
            excluded: selection.excluded || []
        };

        // Будет поправлено по: https://online.sbis.ru/opendoc.html?guid=3fa1742e-6d85-4689-b7d1-c08d7923a15a
        if (removeConfirmationText) {
            return Confirmation.openPopup({
                type: 'yesno',
                style: 'default',
                message: removeConfirmationText
            }).then((result) => result && this._getRemoveViewCommand(resultSelection).execute({}));
        }
        return this._getRemoveViewCommand(resultSelection).execute({});
    }

    moveItems(keys: TKey[], target: Model, position: LOCAL_MOVE_POSITION): void {
        return this._getMoveViewCommand(keys, position, target).execute();
    }

    moveItemUp(key: TKey): void {
        return this._getMoveViewCommand([key], LOCAL_MOVE_POSITION.Before).execute();
    }

    moveItemDown(key: TKey): void {
        return this._getMoveViewCommand([key], LOCAL_MOVE_POSITION.After).execute();
    }

    moveWithDialog(selection: ISelectionObject): Promise<void> {
        let movedItems = [];
        let resultTarget = null;
        const displayProperty = 'caption';
        const source = new Memory({
            keyProperty: this._listModel.getKeyProperty(),
            data: this._listModel.getCollection().getRawData(),
            filter: (item, where): boolean => {
                const searchFilterValue = where[displayProperty];
                return !!item.get(this._options.nodeProperty) &&
                       (!searchFilterValue || item.get(displayProperty)?.toLowerCase().includes(searchFilterValue.toLowerCase()));
            }
        });
        const moveCommand = new MoveCommand({
            source,
            selection,
            parentProperty: this._options.parentProperty,
            popupOptions: {
                template: 'Controls/moverDialog:Template',
                opener: this,
                templateOptions: {
                    parentProperty: this._options.parentProperty,
                    nodeProperty: this._options.nodeProperty,
                    keyProperty: this._listModel.getKeyProperty(),
                    rootVisible: true,
                    displayProperty,
                    columns: [{
                        displayProperty
                    }],
                    searchParam: displayProperty,
                    source
                },
                beforeMoveCallback: (selection: ISelectionObject, target: Model): void => {
                    movedItems = selection.selected;
                    resultTarget = target;
                }
            }
        });
        return moveCommand.execute({}).then(() => {
            this._getMoveViewCommand(movedItems, LOCAL_MOVE_POSITION.On, resultTarget).execute();
        });
    }

    // region editInPlace

    protected _commitEditActionHandler(): TAsyncOperationResult {
        return this._commitEdit();
    }

    protected _cancelEditActionHandler(): TAsyncOperationResult {
        return this._cancelEdit();
    }

    protected _itemClick(e: SyntheticEvent, item: Model, originalEvent: SyntheticEvent): void {
        const canEditByClick = !this._options.readOnly && item.get('isEditable');
        if (canEditByClick) {
            e.stopPropagation();

            this._beginEdit({ item }).then((result) => {
                if (!(result && result.canceled)) {
                    this._editInPlaceInputHelper.setClickInfo(originalEvent.nativeEvent, item);
                }
                return result;
            });
        } else {
            if (this._editInPlaceController) {
                this._commitEdit();
            }
            this._notify('itemClick', [item, originalEvent]);
        }
    }

    beginAdd(userOptions: IEditingUserOptions): Promise<void | {canceled: true}> {
        if (this._options.readOnly) {
            return PropertyGridView._rejectEditInPlacePromise('beginAdd');
        }
        return this._beginAdd(userOptions);
    }

    beginEdit(userOptions: IEditingUserOptions): Promise<void | {canceled: true}> {
        return this._beginEdit(userOptions);
    }

    protected _onValidateCreated(e: Event, control: ValidateContainer): void {
        this._getValidationController().then((controller: ValidationController) => {
            controller.addValidator(control);
        });
    }

    protected _onValidateDestroyed(e: Event, control: ValidateContainer): void {
        if (this._validateController) {
            this._validateController.removeValidator(control);
        }
    }

    private _cancelEdit(force: boolean = false): TAsyncOperationResult {
        if (!this._editInPlaceController) {
            return Promise.resolve();
        }
        if (this._options.readOnly) {
            return PropertyGridView._rejectEditInPlacePromise('cancelEdit');
        }
        return this._getEditInPlaceController().then((controller) => {
            controller.cancel(force).finally(() => {
                if (this._selectionController) {
                    this._selectionController.setSelection(this._selectionController.getSelection());
                }
            });
        });
    }

    private _commitEdit(commitStrategy?: 'hasChanges' | 'all'): TAsyncOperationResult {
        if (!this._editInPlaceController) {
            return Promise.resolve();
        }
        if (this._options.readOnly) {
            return PropertyGridView._rejectEditInPlacePromise('commitEdit');
        }
        return this._getEditInPlaceController()
            .then((controller) => controller.commit(commitStrategy));
    }

    /**
     * Метод, фактически начинающий редактирование
     * @param userOptions
     * @private
     */
    private _beginEdit(userOptions: IEditingUserOptions): TAsyncOperationResult {
        return this._getEditInPlaceController()
            .then((controller) => controller.edit(userOptions))
            .then((result) => {
                if (!result?.canceled) {
                    this._editInPlaceInputHelper.shouldActivate();
                    this._forceUpdate();
                }
                return result;
            });
    }

    /**
     * Метод, фактически начинающий добавление по месту
     * @param userOptions
     * @private
     */
    private _beginAdd(userOptions: IEditingUserOptions): TAsyncOperationResult {
        return this._getEditInPlaceController()
            .then((controller) => controller.add(userOptions, {
                addPosition: 'bottom',
                columnIndex: 0,
                targetItem: undefined
            }))
            .then((addResult) => {
                if (addResult && addResult.canceled) {
                    return addResult;
                }
                this._editInPlaceInputHelper.shouldActivate();
                this._forceUpdate();
            });
    }

    private _getEditInPlaceController(): Promise<EditInPlaceController> {
        if (!this._editInPlaceController) {
            return import('Controls/editInPlace').then(({InputHelper, Controller}) => {
                this._editInPlaceInputHelper = new InputHelper();
                this._editInPlaceController = new Controller({
                    mode: 'row',
                    collection: this._listModel,
                    onBeforeBeginEdit: this._beforeBeginEditCallback.bind(this),
                    onAfterBeginEdit: this._afterBeginEditCallback.bind(this),
                    onBeforeEndEdit: this._beforeEndEditCallback.bind(this)
                });
                return this._editInPlaceController;
            });
        }
        return Promise.resolve(this._editInPlaceController);
    }

    private _beforeBeginEditCallback(params: IBeforeBeginEditCallbackParams): Promise<void> {
        // Если к нам не пришел новый добавляемый итем, то ругаемся
        if (!params.options?.item) {
            throw new Error('You use list without source. So you need to manually create new item when processing an event beforeBeginEdit');
        }
        return;
    }

    private _afterBeginEditCallback(item: IEditableCollectionItem, isAdd: boolean): Promise<void> {
        item.getContents().addField({name: 'editingValue', type: 'string', defaultValue: item.getPropertyValue()});
        return this._getItemActionsController()
            .then(() => {
                this._listModel.setHoveredItem(item);
                this._updateItemActions(this._listModel, this._options, item);
            });
    }

    private _beforeEndEditCallback(params: IBeforeEndEditCallbackParams): Promise<unknown> {
        if (!params.willSave) {
            return ;
        }

        return this._getValidationController()
            .then((controller: ValidationController) => {
                const submitPromise = controller.deferSubmit();
                this._isPendingDeferredSubmit = true;
                this._forceUpdate();
                return submitPromise;
            })
            .then((validationResult) => {
                for (const key in validationResult) {
                    if (validationResult.hasOwnProperty(key) && validationResult[key]) {
                        return EDIT_IN_PLACE_CANCEL;
                    }
                }
                const editingObject = this._listModel.getEditingObject();
                const name = params.item.get(this._listModel.getKeyProperty());

                const editingValue = params.item.get('editingValue');
                if (params.item.getFormat().getFieldIndex('editingValue') !== -1) {
                    params.item.removeField('editingValue');
                }

                if (params.willSave && params.isAdd) {
                    const collection = this._listModel.getCollection() as undefined as RecordSet;
                    if (typeof params.sourceIndex === 'number') {
                        collection.add(params.item, params.sourceIndex);
                    } else {
                        collection.append([params.item]);
                    }
                }
                if (params.willSave && editingValue !== editingObject[name]) {
                    this._propertyValueChanged(null, params.item, editingValue);
                }

                this._notify('typeDescriptionChanged', [this._listModel.getCollection()]);
            });
    }

    private _getValidationController(): Promise<ValidationController> {
        if (!this._validateController) {
            return import('Controls/validate').then(({ControllerClass}) => {
                this._validateController = new ControllerClass();
                return this._validateController;
            });
        }
        return Promise.resolve(this._validateController);
    }

    private static _rejectEditInPlacePromise(methodName: string): Promise<void> {
        const msg = `PropertyGrid is in readOnly mode. Can't use ${methodName}()!`;
        Logger.warn(msg);
        return Promise.reject(msg);
    }

    // endregion editInPlace

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
