import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';
import {IColumn, IHeaderCell} from 'Controls/grid';
import {TRoot} from 'Controls-demo/types';
import {IItemAction} from 'Controls/itemActions';

import {Gadgets} from '../DataHelpers/DataCatalog';
import {memoryFilter} from 'Controls-demo/treeGridNew/DemoHelpers/Filter/memoryFilter';

import * as Template from 'wml!Controls-demo/explorerNew/SearchWithActions/SearchWithActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Gadgets.getSearchColumnsWithColumnScroll();
    protected _root: TRoot = null;
    // tslint:disable-next-line
    protected _filter: object = {demo: 123};
    protected _header: IHeaderCell[] = Gadgets.getSearchHeader();

    protected _itemActions: IItemAction[] = [
        {
            id: 0,
            icon: 'icon-Erase',
            iconStyle: 'danger',
            title: 'delete pls',
            showType: 0,
            handler: (item) => {
                this._children.explorer.removeItems({
                    selected: [item.getKey()],
                    excluded: []
                }).then(() => {
                    this._children.explorer.reload();
                });
            }
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getSearchDataLongFolderName(),
            filter(item, filter): boolean {
                return memoryFilter.call(this, item, filter, 'id');
            }
        });
    }

    protected _onToggle(): void {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
