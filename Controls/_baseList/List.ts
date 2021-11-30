import {Model} from 'Types/entity';
import {EventUtils} from 'UI/Events';
import { RecordSet } from 'Types/collection';
import {Control, TemplateFunction} from 'UI/Base';
import {IMovableList} from './interface/IMovableList';
import {IRemovableList} from './interface/IRemovableList';
import template = require('wml!Controls/_baseList/List');
import viewName = require('Controls/_baseList/ListView');
import {default as ListControl} from 'Controls/_baseList/BaseControl';
import {default as Data} from 'Controls/_baseList/Data';
import {ISelectionObject, IBaseSourceConfig, TKey} from 'Controls/interface';
import {DataSet, CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import 'css!Controls/baseList';
import {IReloadItemOptions} from 'Controls/_baseList/interface/IList';

/**
 * Контрол "Плоский список" позволяет отображать данные из различных источников в виде упорядоченного списка.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 * @class Controls/_list/List
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IEditableList
 * @implements Controls/interface:ISorting
 * @implements Controls/interface:IDraggable
 * @implements Controls/interface/IGroupedList
 * @implements Controls/list:IVirtualScrollConfig
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/list:IClickableView
 * @implements Controls/list:IReloadableList
 * @implements Controls/marker:IMarkerList
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/list:IListNavigation
 *
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/list_new/Base/Index
 */

/*
 * Plain list with custom item template. Can load data from data source.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/'>here</a>.
 *
 * @class Controls/_list/List
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/interface/IGroupedList
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/interface:ISelectFields
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/interface:ISorting
 * @implements Controls/list:IEditableList
 * @implements Controls/interface:IDraggable
 * @implements Controls/interface/IGroupedList
 * @implements Controls/list:IClickableView
 * @implements Controls/list:IReloadableList
 * @implements Controls/marker:IMarkerList
 *
 * @implements Controls/list:IVirtualScrollConfig
 *
 *
 * @author Авраменко А.С.
 * @public
 * @demo Controls-demo/list_new/Base/Index
 */

export default class List<
    TControl extends ListControl = ListControl
> extends Control /** @lends Controls/_list/List.prototype */
implements IMovableList, IRemovableList {
    protected _template: TemplateFunction = template;
    protected _viewName = viewName;
    protected _viewTemplate: TControl = ListControl;
    protected _viewModelConstructor = null;
    protected _itemsSelector: string = '.controls-ListView__itemV';
    protected _children: {
        listControl: TControl,
        data: Data
    };

    _notifyHandler = EventUtils.tmplNotify;

    protected _beforeMount(options): void {
        this._viewModelConstructor = this._getModelConstructor();
    }

    protected _getActionsMenuConfig(e, item, clickEvent, action, isContextMenu) {
        // for override
    }

    protected _keyDownHandler() {
        /* For override  */
    }

    protected _getModelConstructor(): string|Function {
        return 'Controls/display:Collection';
    }

    reload(keepNavigation: boolean = false, sourceConfig?: IBaseSourceConfig): Promise<RecordSet|Error> {
        // listControl будет не создан, если была ошибка загрузки
        if (this._children.listControl) {
            return this._children.listControl.reload(keepNavigation, sourceConfig);
        } else {
            return this._children.data.reload(sourceConfig);
        }
    }

    reloadItem(
        key: TKey,
        options: object | IReloadItemOptions,
        replaceItem?: boolean,
        reloadType: string = 'read'
    ): Promise<Model> {
        const listControl = this._children.listControl;
        return listControl.reloadItem.apply(listControl, arguments);
    }

    getItems(): RecordSet {
        return this._children.listControl.getItems();
    }

    scrollToItem(key: string|number, position: string, force: boolean): Promise<void> {
        return this._children.listControl.scrollToItem(key, position, force);
    }

    beginEdit(options: object): Promise<void | {canceled: true}> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.beginEdit(options);
    }

    beginAdd(options: object): Promise<void | { canceled: true }> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.beginAdd(options);
    }

    cancelEdit(): Promise<void | { canceled: true }> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.cancelEdit();
    }

    commitEdit(): Promise<void | { canceled: true }> {
        return this._options.readOnly ? Promise.reject() : this._children.listControl.commitEdit();
    }

    /**
     * Замораживает hover подсветку строки для указанной записи
     */
    freezeHoveredItem(item: Model): void {
        this._children.listControl.freezeHoveredItem(item);
    }

    /**
     * Размораживает все ранее замороженные итемы
     */
    unfreezeHoveredItems(): void {
        this._children.listControl.unfreezeHoveredItems();
    }

    // region mover

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet> {
        return this._children.listControl.moveItems(selection, targetKey, position);
    }

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.listControl.moveItemUp(selectedKey);
    }

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.listControl.moveItemDown(selectedKey);
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet> {
        return this._children.listControl.moveItemsWithDialog(selection);
    }

    // endregion mover

    // region remover

    removeItems(selection: ISelectionObject): Promise<void> {
        return this._children.listControl.removeItems(selection);
    }

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<void> {
        return this._children.listControl.removeItemsWithConfirmation(selection);
    }

    // endregion remover

    // TODO удалить по https://online.sbis.ru/opendoc.html?guid=2ad525f0-2b48-4108-9a03-b2f9323ebee2
    _clearSelection(): void {
        this._children.listControl.clearSelection();
    }

    static getDefaultOptions(): object {
        return {
            multiSelectVisibility: 'hidden',
            multiSelectPosition: 'default',
            stickyHeader: true,
            stickyResults: true,
            style: 'default'
        };
    }
}

Object.defineProperty(List, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return List.getDefaultOptions();
   }
});
/**
 * @name Controls/_list/List#itemPadding
 * @cfg {Controls/_list/interface/IList/ItemPadding.typedef}
 * @demo Controls-demo/list_new/ItemPadding/DifferentPadding/Index В примере заданы горизонтальные отступы.
 * @demo Controls-demo/list_new/ItemPadding/NoPadding/Index В примере отступы отсутствуют.
 */
