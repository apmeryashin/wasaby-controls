import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/explorerNew/BreadCrumbsInHeader/Default/Default';
import {Gadgets} from '../../DataHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import {TRoot} from 'Controls-demo/types';
import { IHeaderCell } from 'Controls/grid';
import {HierarchicalMemory} from 'Types/source';
import {IItemAction} from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Gadgets.getGridColumns();
    protected _viewMode: string = 'table';
    protected _root: TRoot = 1;
    protected _header: IHeaderCell[] = Gadgets.getHeader();
    protected _itemActions: IItemAction[];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getData()
        });

        this._itemActions = [
            {
                id: 1,
                icon: 'icon-PhoneNull',
                title: 'phone',
                showType: 2
            },
            {
                id: 2,
                icon: 'icon-EmptyMessage',
                title: 'message',
                showType: 2
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
