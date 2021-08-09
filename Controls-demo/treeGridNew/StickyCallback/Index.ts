import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/StickyCallback/Default';
import { HierarchicalMemory } from 'Types/source';
import { IHeader } from 'Controls-demo/types';
import { IColumn } from 'Controls/grid';
import 'css!Controls-demo/Controls-demo';
import { Flat } from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _header: IHeader[] = Flat.getHeader();
    protected _columns: IColumn[] = Flat.getColumns();

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            data: Flat.getData()
        });
    }

    protected _stickyCallback(item: any): boolean {
        return item.get('title') === 'Smartphones1' || item.get('title') === 'Smartphones5';
    }
}
