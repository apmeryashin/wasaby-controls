import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/VirtualScroll/Default/Default';
import {HierarchicalMemory as Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {VirtualScrollHasMore} from 'Controls-demo/treeGridNew/DemoHelpers/Data/VirtualScrollHasMore';
import {Flat} from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _expandedItems: number[];
   protected _columns: IColumn[] = Flat.getColumns();

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'key',
         parentProperty: 'parent',
         data: VirtualScrollHasMore.getDataForVirtual()
      });
   }
   protected _expandAll(): void {
      this._expandedItems = [null];
      this._viewSource = new Memory({
         keyProperty: 'key',
         parentProperty: 'parent',
         data: VirtualScrollHasMore.getDataForVirtual(),
         filter: (): boolean => true
      });
   }
   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
