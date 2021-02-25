import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/Falling/Falling';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import { IColumn } from 'Controls/interface';
import { TRoot } from 'Controls-demo/types';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: MemorySource;
   protected _columns: IColumn[] = Gadgets.getColumns();
   protected _viewMode: string = 'table';
   protected _root: TRoot = 1;

   protected _beforeMount(): void {
      this._viewSource = new MemorySource({
         keyProperty: 'id',
         data: Gadgets.getData()
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
