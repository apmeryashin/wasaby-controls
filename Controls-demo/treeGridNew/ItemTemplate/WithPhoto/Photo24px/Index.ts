import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/Photo24px/Photo24px';
import {CrudEntityKey, Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {WithPhoto} from "Controls-demo/treeGridNew/DemoHelpers/Data/WithPhoto";
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control<IControlOptions> {
   protected _template: TemplateFunction = Template;
   protected _viewSource: Memory;
   protected _columns: IColumn[] = WithPhoto.getGridColumnsWithPhoto();
   // tslint:disable-next-line
   protected _expandedItems: CrudEntityKey[] = [ 1, 15, 153 ];

   protected _beforeMount(options: IControlOptions): void {
      if (options.hasOwnProperty('collapseNodes')) {
         this._expandedItems = [];
      }
      const data = Flat.getData();
      data.push({
         id: 6,
         title: 'Subtask',
         rating: '',
         country: '',
         parent: null,
         type: false,
         subtask: true
      });
      this._viewSource = new Memory({
         keyProperty: 'id',
         data
      });
   }

   static _styles: string[] = ['Controls-demo/treeGridNew/ItemTemplate/WithPhoto/styles', 'Controls-demo/Controls-demo'];
}
