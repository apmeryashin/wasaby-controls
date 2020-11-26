import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/PropertyGrid';
import SyntheticEvent from 'Vdom/Vdom';
import {Tree, Collection, GroupItem, CollectionItem} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {object} from 'Types/util';
import {default as renderTemplate} from 'Controls/_propertyGrid/Render';
import {IPropertyGridOptions} from 'Controls/_propertyGrid/IPropertyGrid';
import {default as IPropertyGridItem} from './IProperty';
import {PROPERTY_GROUP_FIELD, PROPERTY_NAME_FIELD, PROPERTY_VALUE_FIELD} from './Constants';
import {groupConstants as constView} from '../list';
import PropertyGridCollection from './PropertyGridCollection';
import { factory } from 'Types/chain';
import {IItemAction, Controller as ItemActionsController} from 'Controls/itemActions';
import {StickyOpener} from 'Controls/popup';

/**
 * Контрол, который позволяет пользователям просматривать и редактировать свойства объекта.
 *
 * @remark
 * Вы можете использовать стандартные редакторы PropertyGrid или специальные редакторы.
 * По умолчанию propertyGrid будет автоматически генерировать все свойства для данного объекта.
 *
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_propertyGrid.less">переменные тем оформления</a>
 *
 * @class Controls/_propertyGrid/PropertyGrid
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IPropertyGrid
 * @demo Controls-demo/PropertyGridNew/Group/Expander/Index
 *
 * @public
 * @author Герасимов А.М.
 */

/*
 * Represents a control that allows users to inspect and edit the properties of an object.
 * You can use the standard editors that are provided with the PropertyGrid or you can use custom editors.
 * By default the propertyGrid will autogenerate all the properties for a given object
 * @class Controls/_propertyGrid/PropertyGrid
 * @extends Core/Control
 * @mixes Controls/_propertyGrid/IPropertyGrid
 *
 * @public
 * @author Герасимов А.М.
 */

export default class PropertyGridView extends Control<IPropertyGridOptions> {
    protected _template: TemplateFunction = template;
    protected _listModel: Tree<Model> | Collection<Model>;
    protected _render: Control = renderTemplate;
    protected _collapsedGroups: Record<string, boolean> = {};
    private _itemActionsController: ItemActionsController;
    private _itemActionSticky: StickyOpener;

    protected _beforeMount(
        {
            nodeProperty,
            parentProperty,
            editingObject,
            source,
            collapsedGroups,
            itemActions
        }: IPropertyGridOptions
    ): void {
        this._collapsedGroups = this._getCollapsedGroups(collapsedGroups);
        this._listModel = this._getCollection(nodeProperty, parentProperty, editingObject, source);
    }

    protected _beforeUpdate(newOptions: IPropertyGridOptions): void {
        if (newOptions.collapsedGroups !== this._options.collapsedGroups) {
            this._collapsedGroups = this._getCollapsedGroups(newOptions.collapsedGroups);
            this._listModel.setFilter(this._displayFilter.bind(this));
        }
        if (newOptions.editingObject !== this._options.editingObject || newOptions.source !== this._options.source) {
            this._listModel = this._getCollection(
                newOptions.nodeProperty,
                newOptions.parentProperty,
                newOptions.editingObject,
                newOptions.source
            );
        }
    }

    private _getCollection(
        nodeProperty: string,
        parentProperty: string,
        editingObject: Record<string, any>,
        source: IPropertyGridItem[] | RecordSet<IPropertyGridItem>
    ): Tree<Model> | Collection<Model> {
        const propertyGridItems = this._getPropertyGridItems(source, editingObject);
        return new PropertyGridCollection({
            collection: propertyGridItems,
            parentProperty,
            nodeProperty,
            keyProperty: PROPERTY_NAME_FIELD,
            root: null,
            group: this._groupCallback,
            filter: this._displayFilter.bind(this)
        });
    }

    private _groupCallback(item: Model): string {
        return item.get(PROPERTY_GROUP_FIELD);
    }

    private _displayFilter(itemContents: Model | string): boolean {
        if (itemContents instanceof Model) {
            const group = itemContents.get(PROPERTY_GROUP_FIELD);
            return !this._collapsedGroups[group];
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
        editingObject: Record<string, any> | Model
    ): RecordSet<Model> {
        const itemsWithPropertyValue = [];
        if (items instanceof RecordSet) {
            items.forEach((item: IPropertyGridItem | Model<IPropertyGridItem>): IPropertyGridItem => {
                const sourceItem = object.clone(item);
                const defaultItem = PropertyGridView.getDefaultPropertyGridItem();
                const nameProperty: string = object.getPropertyValue(sourceItem, 'name');
                defaultItem.propertyValue = object.getPropertyValue(editingObject, nameProperty);

                factory(sourceItem).each((key: string, value: unknown) => {
                    defaultItem[key] = value;
                });

                itemsWithPropertyValue.push({
                    ...defaultItem,
                    ...(sourceItem instanceof Model ? {} : sourceItem)
                });
            });
            return new RecordSet({
                rawData: itemsWithPropertyValue,
                keyProperty: PROPERTY_NAME_FIELD
            });
        }
        return items;
    }

    protected _propertyValueChanged(event: SyntheticEvent<Event>, item: Model, value: any): void {
        const name = item.get(PROPERTY_NAME_FIELD);
        const editingObjectClone = this._options.editingObject instanceof Model ?
           this._options.editingObject : object.clone(this._options.editingObject);
        const itemClone = item.clone(true);
        object.setPropertyValue(editingObjectClone, name, value);
        itemClone.set(PROPERTY_VALUE_FIELD, value);

        (this._listModel.getCollection().getRecordById(name) as Model).set(PROPERTY_VALUE_FIELD, value);
        this._notify('editingObjectChanged', [editingObjectClone]);
    }

    protected _itemClick(
        event: SyntheticEvent<Event>,
        displayItem: GroupItem<Model> | TreeItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        if (displayItem['[Controls/_display/GroupItem]']) {
            const isExpandClick = clickEvent?.target.closest('.controls-PropertyGrid__groupExpander');
            if (isExpandClick) {
                const groupName = displayItem.getContents();
                const collapsed = this._collapsedGroups[groupName];
                displayItem.toggleExpanded();
                this._collapsedGroups[groupName] = !collapsed;
                this._listModel.setFilter(this._displayFilter.bind(this));
            }
        } else {
            this._notify('itemClick', [displayItem]);
        }
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

    private _onItemActionsMenuResult(eventName: string, actionModel: Model,
                                     clickEvent: SyntheticEvent<MouseEvent>): void {
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

    private _updateItemActions(listModel: Collection<Model>, options: IPropertyGridOptions): void {
        const itemActions: IItemAction[] = options.itemActions;

        if (!itemActions) {
            return;
        }

        const editingConfig = listModel.getEditingConfig();
        this._itemActionsController.update({
            collection: listModel,
            itemActions,
            itemActionsPosition: 'inside',
            visibilityCallback: options.itemActionVisibilityCallback,
            style: 'default',
            theme: options.theme,
            actionAlignment: 'horizontal',
            actionCaptionPosition: 'none',
            iconSize: editingConfig ? 's' : 'm'
        });
    }

    static _theme: string[] = ['Controls/propertyGrid', 'Controls/itemActions'];

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

    static getDefaultOptions(): object {
        return {
            render: renderTemplate
        };
    }
}
