import { assert } from 'chai';

import IItemsStrategy from 'Controls/_display/IItemsStrategy';

import {
   Tree,
   TreeItem
} from 'Controls/display';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import * as ListData from 'ControlsUnit/ListData';
import TreeDrag from 'Controls/_display/itemsStrategy/TreeDrag';

describe('Controls/_display/itemsStrategy/TreeDrag', () => {
   function wrapItem<S extends Model = Model, T = TreeItem>(item: S): T {
      return new TreeItem({
         contents: item
      });
   }

   function getSource<S = Model, T = TreeItem>(wraps: T[]): IItemsStrategy<S, T> {
      const items = wraps.slice();

      return {
         '[Controls/_display/IItemsStrategy]': true,
         source: null,
         options: {
            display: null
         },
         get count(): number {
            return items.length;
         },
         get items(): T[] {
            return items.slice();
         },
         at(index: number): T {
            return items[index];
         },
         getDisplayIndex(index: number): number {
            return index;
         },
         getCollectionIndex(index: number): number {
            return index;
         },
         splice(start: number, deleteCount: number, added?: S[]): T[] {
            return items.splice(start, deleteCount, ...added.map<T>(wrapItem));
         },
         invalidate(): void {
            this.invalidated = true;
         },
         reset(): void {
            items.length = 0;
         }
      };
   }

   const items = ListData.getItems();
   const rs = new RecordSet({
      rawData: items,
      keyProperty: 'id'
   });

   let source;
   let strategy;
   let display;

   beforeEach(() => {
      display = new Tree({
         collection: rs,
         root: new Model({ rawData: { id: null }, keyProperty: ListData.KEY_PROPERTY }),
         keyProperty: ListData.KEY_PROPERTY,
         parentProperty: ListData.PARENT_PROPERTY,
         nodeProperty: ListData.NODE_PROPERTY,
         hasChildrenProperty: ListData.HAS_CHILDREN_PROPERTY,
         groupProperty: 'group'
      });
      source = getSource(display.getItems());
      strategy = new TreeDrag({
         source,
         display,
         draggableItem: display.getItemBySourceKey(3),
         draggedItemsKeys: [3],
         targetIndex: 2
      });
   });

   afterEach(() => {
      source = undefined;
      strategy = undefined;
   });

   it('setPosition', () => {
       // tslint:disable-next-line:no-unused-expression
      strategy.items;
      assert.equal(strategy.avatarItem.getParent(), display.getItemBySourceKey(2));

      strategy.setPosition({index: 1, position: 'before', dispItem: display.getItemBySourceKey(2)});
      assert.equal(strategy.avatarItem.getParent(), display.getItemBySourceKey(1));
   });

   it('setPosition on group', () => {
       // tslint:disable-next-line:no-unused-expression
      strategy.items;
      strategy.setPosition({index: 1, position: 'before', dispItem: display.getItemBySourceKey(222)});
      assert.equal(strategy.avatarItem.getParent(), display.getRoot());
   });

   it('should be corrected parent of draggable item after hide it parent', () => {
      strategy = new TreeDrag({
         source,
         display,
         draggableItem: display.getItemBySourceKey(3),
         draggedItemsKeys: [2, 3, 4],
         targetIndex: 2
      });

       // tslint:disable-next-line:no-unused-expression
      strategy.items;
      assert.equal(strategy.avatarItem.getParent(), display.getItemBySourceKey(1));
   });

   it('drag without avatar item', () => {
      strategy = new TreeDrag({
         source,
         display,
         draggedItemsKeys: [1234],
         targetIndex: 0
      });

      assert.equal(strategy.items.length, 9);
      assert.isNotOk(strategy.avatarItem);
   });
});
