import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/DifferentWidth/DifferentWidth';
import {Gadgets} from '../DataHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource;

   protected _beforeMount() {

      const data = Gadgets.getData();
      data.push({...data[2], id: 4, width: '30%'});
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
