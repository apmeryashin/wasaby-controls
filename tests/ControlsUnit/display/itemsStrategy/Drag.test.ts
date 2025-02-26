import { assert } from 'chai';

import IItemsStrategy from 'Controls/_display/IItemsStrategy';

import {
   Collection,
   Collection as CollectionDisplay, CollectionItem, Tree
} from 'Controls/display';
import Drag from 'Controls/_display/itemsStrategy/Drag';
import { Model } from 'Types/entity';
import {RecordSet} from 'Types/collection';
import Direct from 'Controls/_display/itemsStrategy/Direct';
import AdjacencyList from 'Controls/_display/itemsStrategy/AdjacencyList';

describe('Controls/_display/itemsStrategy/Drag', () => {
   function wrapItem<S extends Model = Model, T = CollectionItem>(item: S): T {
      return new CollectionItem({
         contents: item
      });
   }

   function getSource<S = Model, T = CollectionItem>(wraps: T[]): IItemsStrategy<S, T> {
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

   const items = [
      { id: 1, name: 'Ivan' },
      { id: 2, name: 'Alexey' },
      { id: 3, name: 'Olga' }
   ];
   let rs;
   let source;
   let strategy;
   let display;

   beforeEach(() => {
      rs = new RecordSet({
         rawData: items,
         keyProperty: 'id'
      });
      display = new CollectionDisplay({
         collection: rs
      });
      source = getSource(display.getItems());
      strategy = new Drag({
         source,
         display,
         draggableItem: display.getItemBySourceKey(1),
         draggedItemsKeys: [1],
         targetIndex: 0
      });
   });

   afterEach(() => {
      source = undefined;
      strategy = undefined;
   });

   it('.options', () => {
      const options = strategy.options;

      assert.equal(options.source, source);
      assert.equal(options.display, display);
      assert.equal(options.draggableItem, display.getItemBySourceKey(1));
      assert.deepEqual(options.draggedItemsKeys, [1]);
      assert.equal(options.targetIndex, 0);
   });

   it('.source', () => {
      assert.equal(strategy.source, source);
   });

   describe('.getDisplayIndex', () => {
      it('default', () => {
         assert.equal(strategy.getDisplayIndex(1), 1);
      });

      it('drag some items', () => {
         display = new Tree({
            collection: new RecordSet({
               rawData: [
                  { id: 1, node: null, parent: null },
                  { id: 2, node: null, parent: null },
                  { id: 3, node: true, parent: null },
                  { id: 31, node: null, parent: 3 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id',
            nodeProperty: 'node',
            parentProperty: 'parent',
            root: null,
            expandedItems: [3]
         });
         display.setDraggedItems(display.getItemBySourceKey(2), [1, 2]);

         assert.equal(display.getIndexBySourceIndex(2), 1);
      });

      it('drag some items separately', () => {
         display = new Tree({
            collection: new RecordSet({
               rawData: [
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });
         display.setDraggedItems(display.getItemBySourceKey(3), [2, 3, 5]);

         assert.equal(display.getIndexBySourceIndex(1), -1);
         assert.equal(display.getIndexBySourceIndex(2), 1);
         assert.equal(display.getIndexBySourceIndex(3), 2);
         assert.equal(display.getIndexBySourceIndex(5), 3);
      });
   });

   it('.getCollectionIndex', () => {
      assert.equal(strategy.getCollectionIndex(1), 1);
   });

   it('.count', () => {
      assert.equal(strategy.count, 3);
   });

   it('.at', () => {
      assert.equal(strategy.at(0).getContents(), display.getItemBySourceKey(1).getContents());
   });

   describe('items', () => {
      it('default', () => {
         const items = strategy.items;
         assert.equal(items[0].getContents(), display.getItemBySourceKey(1).getContents());
         assert.equal(items[1].getContents(), display.getItemBySourceKey(2).getContents());
         assert.equal(items[2].getContents(), display.getItemBySourceKey(3).getContents());
      });

      it('drag some items separately', () => {
         display = new Tree({
            collection: new RecordSet({
               rawData: [
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });
         source = getSource(display.getItems());
         display.setDraggedItems(display.getItemBySourceKey(2), [2, 3, 5]);

         const keys = [];
         display.each((it) => keys.push(it.getContents().getKey()));
         assert.deepEqual(keys, [1, 2, 4, 6]);
      });

      it('collection has filtered items', () => {
         display = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id',
            filter: (item, index) => index % 2 === 0 // скрыты все нечетные записи
         });
         source = getSource(display.getItems());
         strategy = new Drag({
            source,
            display,
            draggableItem: display.getItemBySourceKey(2),
            draggedItemsKeys: [2],
            targetIndex: 1
         });

         let keys = [];
         display.each((it) => keys.push(it.getContents().getKey()));
         assert.deepEqual(keys, [0, 2, 4]);

         strategy.setPosition({index: 2, position: 'after'});
         keys = [];
         display.each((it) => keys.push(it.getContents().getKey()));
         assert.deepEqual(keys, [0, 2, 4]);

         strategy.setPosition({index: 1, position: 'before'});
         keys = [];
         display.each((it) => keys.push(it.getContents().getKey()));
         assert.deepEqual(keys, [0, 2, 4]);
      });
   });

   it('setPosition', () => {
      // move down
      strategy.setPosition({index: 1, position: 'after', dispItem: display.getItemBySourceKey(2)});
      let items = strategy.items;
      assert.equal(items[0].getContents(), display.getItemBySourceKey(2).getContents());
      assert.equal(items[1].getContents(), display.getItemBySourceKey(1).getContents());
      assert.equal(items[2].getContents(), display.getItemBySourceKey(3).getContents());

      // move up
      strategy.setPosition({index: 0, position: 'before', dispItem: display.getItemBySourceKey(1)});
      items = strategy.items;
      assert.equal(items[0].getContents(), display.getItemBySourceKey(1).getContents());
      assert.equal(items[1].getContents(), display.getItemBySourceKey(2).getContents());
      assert.equal(items[2].getContents(), display.getItemBySourceKey(3).getContents());
   });

   it('.avatarItem', () => {
      assert.isNotOk(strategy.avatarItem);
       // tslint:disable-next-line:no-unused-expression
      strategy.items;
      assert.equal(strategy.avatarItem.getContents(), display.getItemBySourceKey(1).getContents());
   });

   it('drag several items', () => {
      display.setDraggedItems(display.getItemBySourceKey(1), [1, 2]);

      const keys = [];
      display.each((it) => keys.push(it.getContents().getKey()));
      assert.equal(keys.length, 2);
      assert.equal(display.at(0).key, 1);
      assert.equal(display.at(1).key, 3);
   });

   it('splice', () => {
      strategy.splice(0, 1, []);
      assert.isNull(strategy._items);
      assert.equal(strategy.count, 2);
   });

   it('drag all items', () => {
      display.setDraggedItems(display.getItemBySourceKey(1), [1, 2, 3]);

      const keys = [];
      display.each((it) => keys.push(it.getContents().getKey()));
      assert.equal(keys.length, 1);
   });

   it('remove item when drag', () => {
      strategy = new Drag({
         source,
         display,
         draggableItem: display.getItemBySourceKey(3),
         draggedItemsKeys: [3],
         targetIndex: 2
      });

      let items = strategy.items;
      assert.equal(items.length, 3);

      strategy.splice(1, 1, [], 'rm');
      strategy.invalidate();
      items = strategy.items;
      assert.equal(items.length, 2);
   });

   it('test drag strategy with adjacency strategy', () => {
      const recordSet = new RecordSet({
         rawData: [{
            id: 1,
            parent: null,
            node: true
         }, {
            id: 2,
            parent: 1,
            node: false
         }, {
            id: 3,
            parent: null,
            node: true
         }],
         keyProperty: 'id'
      });
      const tree = new Tree({
         collection: recordSet,
         root: null,
         keyProperty: 'id',
         parentProperty: 'parent',
         nodeProperty: 'node'
      });
      const directStrategy = new Direct({
         display: tree
      });
      const adjacencyListStrategy = new AdjacencyList({
         source: directStrategy,
         keyProperty: 'id',
         parentProperty: 'parent'
      });
      const dragStrategy = new Drag({
         source: adjacencyListStrategy,
         display,
         draggableItem: display.getItemBySourceKey(1),
         draggedItemsKeys: [1],
         targetIndex: 0
      });

      const newItem = new Model({rawData: {id: 4, parent: 1, node: false}, keyProperty: 'id'});
      dragStrategy.splice(2, 0, [newItem]);

      const adjacencyKeys = adjacencyListStrategy.items.map((it) => it.key);
      const dragKeys = dragStrategy.items.map((it) => it.key);

      assert.deepEqual(adjacencyKeys, dragKeys);
   });

   it('drag without avatar item', () => {
      strategy = new Drag({
         source,
         display,
         draggedItemsKeys: [1234],
         targetIndex: 0
      });

      assert.equal(strategy.items.length, 3);
      assert.isNotOk(strategy.avatarItem);
   });

   it('drag some last items', () => {
      display.setDraggedItems(display.getItemBySourceKey(3), [2, 3]);

      const keys = [];
      display.each((it) => keys.push(it.getContents().getKey()));
      assert.equal(keys.length, 2);
   });
});
