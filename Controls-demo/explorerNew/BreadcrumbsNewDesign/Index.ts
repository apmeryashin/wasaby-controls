import {IColumn} from 'Controls/grid';
import {RecordSet} from 'Types/collection';
import {HierarchicalMemory} from 'Types/source';
import {Control, TemplateFunction} from 'UI/Base';
import {Gadgets} from '../DataHelpers/DataCatalog';
import * as Template from 'wml!Controls-demo/explorerNew/BreadcrumbsNewDesign/Index';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = Template;

   // Источник для списка
   protected _viewSource: HierarchicalMemory;
   // Отдельный источник для PathButton как пример возможности
   protected _pathButtonSource: HierarchicalMemory;

   protected _root: string | number | null = 121;
   protected _columns: IColumn[] = Gadgets.getColumns();

   protected _backButtonFontSize: string = '3xl';
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
         data: Gadgets.getData()
      });

      this._pathButtonSource = new HierarchicalMemory({
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
}
