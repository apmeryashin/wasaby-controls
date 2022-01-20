import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/MasterDetail/MasterDetail');
import columnTemplate = require('wml!Controls-demo/DragNDrop/MasterDetail/itemTemplates/masterItemTemplate');
import * as data from 'Controls-demo/DragNDrop/MasterDetail/Data';
import cInstance = require('Core/core-instance');
import {Memory, CrudEntityKey} from 'Types/source';
import {ItemsEntity, ListItems} from 'Controls/dragnDrop';
import * as TaskEntity from 'Controls-demo/DragNDrop/MasterDetail/TasksEntity';
import { TItemsReadyCallback } from 'Controls-demo/types';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import { IColumn } from 'Controls/grid';
import {INavigationOptionValue, INavigationSourceConfig, ISelectionObject} from 'Controls/interface';

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;
    protected gridColumns: IColumn[] = [{
        displayProperty: 'name',
        width: '1fr',
        template: columnTemplate
    }];
    protected _navigation: INavigationOptionValue<INavigationSourceConfig>;
    protected _selectedKeys: CrudEntityKey[];
    protected _detailSource: Memory;
    protected _masterSource: Memory;
    protected _itemsReadyCallbackMaster: TItemsReadyCallback;
    protected _itemsReadyCallbackDetail: TItemsReadyCallback;
    protected _itemsMaster: RecordSet;
    protected _itemsDetail: RecordSet;

    protected _dataArray: Array<{key: number, title: string, description: string}>;

    _initSource(): void {
        this._detailSource = new Memory({
            keyProperty: 'id',
            data: data.detail
        });

        this._masterSource = new Memory({
            keyProperty: 'id',
            data: data.master
        });
    }

    protected _beforeMount(): void {
        this._initSource();
        this._itemsReadyCallbackMaster = this._itemsReadyMaster.bind(this);
        this._itemsReadyCallbackDetail = this._itemsReadyDetail.bind(this);
    }
    _afterMount(): void {
        this._initSource();
    }
    _itemsReadyMaster(items: RecordSet): void {
        this._itemsMaster = items;
    }

    _itemsReadyDetail(items: RecordSet): void {
        this._itemsDetail = items;
    }

    _dragEnterMaster(_: SyntheticEvent, entity: ItemsEntity): boolean {
        return cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/MasterDetail/TasksEntity');
    }

    _dragStartMaster(_: SyntheticEvent, items: RecordSet): ListItems {
        const firstItem = this._itemsMaster.getRecordById(items[0]);
        return new ListItems({
            items,
            mainText: firstItem.get('name')
        });
    }

    _dragStartDetail(_: SyntheticEvent, items: CrudEntityKey[]): TaskEntity {
        const firstItem = this._itemsDetail.getRecordById(items[0]);
        return new TaskEntity({
            items,
            mainText: firstItem.get('name'),
            image: firstItem.get('img'),
            additionalText: firstItem.get('shortMsg')
        });
    }

    _dragEndMaster(_: SyntheticEvent, entity: ItemsEntity, target: Model, position: string): void {
        let targetId = null;
        const items = entity.getItems();

        if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/MasterDetail/TasksEntity')) {
            targetId = target.get('key');
            items.forEach((key: string | number): void => {
                const item = this._itemsDetail.getRecordById(key);
                item.set('parent', targetId);
                this._detailSource.update(item);
            }, this);
            this._children.detailList.reload();
            this._selectedKeys = [];
        } else {
            const selection: ISelectionObject = {
                selected: entity.getItems(),
                excluded: []
            };
            this._children.masterList.moveItems(selection, target.getKey(), position).then(() => {
                this._children.masterList.reload();
            });
        }
    }

    _dragEndDetail(_: SyntheticEvent, entity: ItemsEntity, target: Model, position: string): void {
        const selection: ISelectionObject = {
            selected: entity.getItems(),
            excluded: []
        };
        this._children.detailList.moveItems(selection, target.getKey(), position).then(() => {
            this._children.detailList.reload();
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/DragNDrop/MasterDetail/MasterDetail'];
}
