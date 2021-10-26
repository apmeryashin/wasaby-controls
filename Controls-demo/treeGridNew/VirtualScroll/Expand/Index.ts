import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/VirtualScroll/Expand/Expand';
import {HierarchicalMemory as Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { Expand } from 'Controls-demo/treeGridNew/DemoHelpers/Data/Expand';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Expand.getColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Expand.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
