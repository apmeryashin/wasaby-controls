import { IColumn } from 'Controls/grid';
import {HierarchicalMemory} from 'Types/source';
import {Control, TemplateFunction} from 'UI/Base';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as Template from 'wml!Controls-demo/explorerNew/BreadcrumbsNewDesign/Index';
import {RecordSet} from 'Types/collection';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = Gadgets.getColumns();
   protected _root: string | number | null = 121;

   protected _backButtonFontSize: string = 'm';
   protected _fontSizes: RecordSet = new RecordSet({
      keyProperty: 'id',
      rawData: [
         {
            id: 's',
            title: 's'
         },
         {
            id: 'm',
            title: 'm'
         },
         {
            id: 'l',
            title: 'l'
         },
         {
            id: 'xl',
            title: 'xl'
         },
         {
            id: '2xl',
            title: '2xl'
         },
         {
            id: '3xl',
            title: '3xl'
         },
         {
            id: '4xl',
            title: '4xl'
         },
         {
            id: '5xl',
            title: '5xl'
         },
         {
            id: '6xl',
            title: '6xl'
         },
         {
            id: '7xl',
            title: '7xl'
         }
      ]
   });

   protected _beforeMount(): void {
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData(),
         filter: (item, query): boolean => {
            if (query['Только узлы']) {
               return item.get('parent@') !== null;
            }

            return true;
         }
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
