import {Control, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {Model} from 'Types/entity';
import {IColumn} from 'Controls/grid';
import {Flat} from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';

import * as Template from 'wml!Controls-demo/treeGridNew/Expander/WithoutRootExpander/WithoutRootExpander';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _expandedItems: CrudEntityKey[] = [null];
   protected _columns: IColumn[];

   protected _beforeMount(): void {
      this._columns = [
         {
            displayProperty: 'title'
         }
      ];
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'key',
         data: Flat.getData(),
         filter: () => true,
         parentProperty: 'parent'
      });
   }

   /**
    * Принудительно скрываем иконку expander для узлов первого уровня
    * @param item
    * @private
    */
   protected _getExpanderIcon(item: Model): string {
      if (item.get('parent') === null) {
         return 'none';
      }
      return;
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
