import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/OperationsPanelNew/BaseConfig/Index';
import {Memory} from 'Types/source';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _panelSource: Memory;
   protected _source: Memory;
   protected _selectedKeys: string[] = [];
   protected _excludedKeys: string[] = [];

   protected _beforeMount(): void {
      this._panelSource = new Memory({
         keyProperty: 'id',
         data: [
            {
               id: 'print',
               title: 'Распечатать'
            }
         ]
      });

      this._source = new Memory({
         keyProperty: 'id',
         data: [
            {
               id: '1',
               title: 'Element'
            }
         ]
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
