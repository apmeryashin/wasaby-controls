import { Control, TemplateFunction } from 'UI/Base';
import * as Template from 'wml!Controls-demo/tileNew/AddButton/Template';
import { Gadgets } from '../DataHelpers/DataCatalog';
import { HierarchicalMemory, Memory } from 'Types/source';
import { RecordSet } from 'Types/collection';
import {Model} from 'Types/entity';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';

const DELAY = 1000;

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _itemTemplateSource: Memory;
   protected _itemTemplate: string = 'Controls/tile:ItemTemplate';
   protected _items: RecordSet;

   protected _beforeMount(): void {
      this._itemTemplateSource = new Memory({
         keyProperty: 'id',
         data: [
            { id: 'Controls/tile:ItemTemplate' },
            { id: 'Controls/tile:PreviewTemplate' },
            { id: 'Controls/tile:SmallItemTemplate' },
            { id: 'Controls/tile:RichTemplate' }
         ]
      });
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data: Gadgets.getData()
      });
   }

   _itemsReadyCallback = (items: RecordSet) => {
      this._items = items;
   }

   protected _addItem(): Promise<void> {
      return new Promise((resolve) => {
         setTimeout(() => {
            const newItem = new Model({
               keyProperty: 'id',
               rawData: {
                  id: this._items.getCount() + 1,
                  title: 'Добавленная запись',
                  image: explorerImages[4]
               }
            });
            this._items.add(newItem);
            this._viewSource.update(newItem).then(() => {
               resolve();
            });
         }, DELAY);
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
