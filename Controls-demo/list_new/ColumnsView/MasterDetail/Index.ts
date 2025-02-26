import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/MasterDetail/MasterDetail');
import columnTemplate = require('wml!Controls-demo/DragNDrop/MasterDetail/itemTemplates/masterItemTemplate');
import * as data from 'Controls-demo/DragNDrop/MasterDetail/Data';
import cInstance = require('Core/core-instance');
import {Memory, CrudEntityKey} from 'Types/source';
import {ItemsEntity, ListItems} from 'Controls/dragnDrop';
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
    private _detailRoot: CrudEntityKey;

    protected _dataArray: Array<{key: number, title: string, description: string}>;

    protected _beforeMount(): void {
        this._detailRoot = '0';
        this._masterSource = new Memory({
            keyProperty: 'id',
            data: data.master
        });
        this._detailSource = new Memory({
            keyProperty: 'id',
            data: data.detail,
            filter: (item, queryFilter) => {
                const parent = item.get('parent');
                return parent === this._detailRoot;
            }
        });
        this._itemsReadyCallbackMaster = this._itemsReadyMaster.bind(this);
        this._itemsReadyCallbackDetail = this._itemsReadyDetail.bind(this);
    }

    protected _masterItemClick(event: SyntheticEvent, item: Model): void {
        this._detailRoot = item.getKey();
        this._children.detailList.reload();
    }

    protected _itemsReadyMaster(items: RecordSet): void {
        this._itemsMaster = items;
    }

    protected _itemsReadyDetail(items: RecordSet): void {
        this._itemsDetail = items;
    }

    protected _dragEnterMaster(_: SyntheticEvent, entity: ItemsEntity): boolean {
        return cInstance.instanceOfModule(entity, 'Controls/dragnDrop:ListItems');
    }

    protected _dragStartMaster(_: SyntheticEvent, items: RecordSet): ListItems {
        const firstItem = this._itemsMaster.getRecordById(items[0]);
        return new ListItems({
            items,
            mainText: firstItem.get('name')
        });
    }

    protected _dragStartDetail(_: SyntheticEvent, items: CrudEntityKey[]): ListItems {
        const firstItem = this._itemsDetail.getRecordById(items[0]);
        return new ListItems({
            items,
            mainText: firstItem.get('name'),
            image: firstItem.get('img'),
            additionalText: firstItem.get('shortMsg'),
            detail: true
        });
    }

    protected _dragEndMaster(_: SyntheticEvent, entity: ItemsEntity, target: Model, position: string): void {
        let targetId = null;
        const items = entity.getItems();

        // Пернос из правого реестра
        if (entity.getOptions().detail) {
            targetId = target.getKey();
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

    protected _dragEndDetail(_: SyntheticEvent, entity: ItemsEntity, target: Model, position: string): void {
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
