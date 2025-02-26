// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { FlatSelectionStrategy, SelectionController, TreeSelectionStrategy, ISelectionItem } from 'Controls/multiselection';
import { MultiSelectAccessibility } from 'Controls/list';
import { RecordSet } from 'Types/collection';
import { Collection, CollectionItem, Tree } from 'Controls/display';
import { Model } from 'Types/entity';
import * as ListData from 'ControlsUnit/ListData';
import { TreeGridCollection } from 'Controls/treeGrid';
import { SearchGridCollection } from 'Controls/searchBreadcrumbsGrid';

describe('Controls/_multiselection/Controller', () => {
   const items = new RecordSet({
      rawData: [
         { id: 1 },
         { id: 2 },
         { id: 3 }
      ],
      keyProperty: 'id'
   });

   let controller;
   let model;
   let strategy;

   beforeEach(() => {
      model = new Collection({
         collection: items,
         keyProperty: 'id'
      });

      strategy = new FlatSelectionStrategy({model });

      controller = new SelectionController({
         model,
         strategy,
         filter: {},
         selectedKeys: [],
         excludedKeys: []
      });
   });

   describe('updateOptions', () => {
      it('update model state when changed root', () => {
         const model = new Tree({
            collection: new RecordSet({
               keyProperty: ListData.KEY_PROPERTY,
               rawData: ListData.getItems()
            }),
            root: new Model({ rawData: { id: 2 }, keyProperty: ListData.KEY_PROPERTY }),
            keyProperty: ListData.KEY_PROPERTY,
            parentProperty: ListData.PARENT_PROPERTY,
            nodeProperty: ListData.NODE_PROPERTY,
            hasChildrenProperty: ListData.HAS_CHILDREN_PROPERTY
         });

         strategy = new TreeSelectionStrategy({
            model,
            selectDescendants: true,
            selectAncestors: true,
            rootId: 2,
            entryPath: [],
            selectionType: 'all'
         });

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [],
            excludedKeys: []
         });

         controller.setSelection({ selected: [2], excluded: [2] });
         model.setRoot(new Model({ rawData: { id: null }, keyProperty: ListData.KEY_PROPERTY }));

         controller.updateOptions({
            model,
            rootId: null,
            selectionType: 'all',
            strategyOptions: {
               model,
               selectionType: 'all',
               rootId: null,
               selectDescendants: true,
               selectAncestors: true
            }
         });

         assert.isNull(model.getItemBySourceKey(1).isSelected());
         assert.isNull(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.isFalse(model.getItemBySourceKey(7).isSelected());
      });
   });

   describe('toggleItem', () => {
      it ('toggle', () => {
         const result = controller.toggleItem(1);
         assert.deepEqual(result, { selected: [1], excluded: [] });
      });

      it('toggle breadcrumbs', () => {
         model = new SearchGridCollection({
            collection: new RecordSet({
               rawData: [{
                  id: 1,
                  parent: null,
                  nodeType: true,
                  title: 'test_node'
               }, {
                  id: 2,
                  parent: 1,
                  nodeType: null,
                  title: 'test_leaf'
               }],
               keyProperty: 'id'
            }),
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            columns: [{}]
         });
         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [],
            excludedKeys: []
         });

         const result = controller.toggleItem(2);
         assert.deepEqual(result, { selected: [2], excluded: [] });
      });

      it('select pack, select one item and select pack, unselect it item => item shoul be unselected', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 },
                  { id: 7 },
                  { id: 8 },
                  { id: 9 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         let selection = controller.selectAll(2);
         controller.setSelection(selection);

         selection = controller.toggleItem(7);
         controller.setSelection(selection);

         selection = controller.selectAll(2);
         controller.setSelection(selection);

         selection = controller.toggleItem(7);
         controller.setSelection(selection);

         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.isFalse(model.getItemBySourceKey(7).isSelected());
         assert.isFalse(model.getItemBySourceKey(8).isSelected());
         assert.isFalse(model.getItemBySourceKey(9).isSelected());

         assert.equal(controller.getCountOfSelected(), 4);
      });

      it('select pack, select one item and select pack, unselect item in pack => item should be unselected', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 },
                  { id: 7 },
                  { id: 8 },
                  { id: 9 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         let selection = controller.selectAll(2);
         controller.setSelection(selection);

         selection = controller.toggleItem(7);
         controller.setSelection(selection);

         selection = controller.selectAll(2);
         controller.setSelection(selection);

         selection = controller.toggleItem(3);
         controller.setSelection(selection);

         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isFalse(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.isTrue(model.getItemBySourceKey(7).isSelected());
         assert.isFalse(model.getItemBySourceKey(8).isSelected());
         assert.isFalse(model.getItemBySourceKey(9).isSelected());

         assert.equal(controller.getCountOfSelected(), 4);
      });
   });

   describe('selectRange', () => {
      it ('no lastCheckedKey', () => {
         const result = controller.selectRange(1);
         assert.deepEqual(result, { selected: [1], excluded: [] });
      });
      it ('lastCheckedKey = 1, new selected = 3', () => {
         controller.toggleItem(1);
         const result = controller.selectRange(3);
         assert.deepEqual(result, { selected: [1, 2, 3], excluded: [] });
      });
      it ('lastCheckedKey = 3, new selected = 1', () => {
         controller.toggleItem(3);
         const result = controller.selectRange(1);
         assert.deepEqual(result, { selected: [1, 2, 3], excluded: [] });
      });
      it ('lastCheckedKey = 2, new selected = 3, not empty selection', () => {
         controller.setSelection({selected: [1], excluded: []});
         controller.toggleItem(2);
         const result = controller.selectRange(3);
         assert.deepEqual(result, { selected: [2, 3], excluded: [] });
      });
      it ('select checkbox in selected range', () => {
         controller.setSelection({selected: [1, 2, 3], excluded: []});
         controller.toggleItem(1);
         const result = controller.selectRange(2);
         assert.deepEqual(result, { selected: [1, 2], excluded: [] });
      });
      it ('change direction', () => {
         controller.setSelection({selected: [2, 3], excluded: []});
         controller.toggleItem(2);
         const result = controller.selectRange(1);
         assert.deepEqual(result, { selected: [1, 2], excluded: [] });
      });

      it('expand and collapse node, then select range', () => {
         const tree = new TreeGridCollection({
            collection: new RecordSet({
               keyProperty: ListData.KEY_PROPERTY,
               rawData: ListData.getItems()
            }),
            root: new Model({ rawData: { id: null }, keyProperty: ListData.KEY_PROPERTY }),
            keyProperty: ListData.KEY_PROPERTY,
            parentProperty: ListData.PARENT_PROPERTY,
            nodeProperty: ListData.NODE_PROPERTY
         });

         const controller = new SelectionController({
            model: tree,
            strategy: new TreeSelectionStrategy({
               model: tree,
               selectDescendants: true,
               selectAncestors: true,
               rootId: null,
               entryPath: [],
               selectionType: 'all',
               selectionCountMode: 'all',
               recursiveSelection: true
            }),
            selectedKeys: [],
            excludedKeys: [],
            filter: {},
            searchValue: '',
            rootId: null
         });

         tree.setExpandedItems([1]);
         tree.setExpandedItems([]);

         controller.toggleItem(6);
         const result = controller.selectRange(7);
         assert.deepEqual(result, { selected: [6, 7], excluded: [] });
      });
   });

   describe('isAllSelected', () => {
      it('not all selected', () => {
         const result = controller.isAllSelected();
         assert.isFalse(result);
      });

      it('all selected not by every item', () => {
         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [null],
            excludedKeys: []
         });

         const result = controller.isAllSelected(false);
         assert.isTrue(result);
      });

      it('is all selected in new selection', () => {
         const result = controller.isAllSelected(true, {selected: [null], excluded: []});
         assert.isTrue(result);
      });
   });

   describe('select all with limit', () => {
      it('not should unselect item, when it selected after pack', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 },
                  { id: 7 },
                  { id: 8 },
                  { id: 9 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         let selection = controller.toggleItem(7);
         controller.setSelection(selection);
         selection = controller.selectAll(5);
         controller.setSelection(selection);

         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.isTrue(model.getItemBySourceKey(7).isSelected());
         assert.isFalse(model.getItemBySourceKey(8).isSelected());
         assert.isFalse(model.getItemBySourceKey(9).isSelected());

         assert.equal(controller.getCountOfSelected(), 6);
      });

      it('fill spaces and not includes separated selected items in pack', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 },
                  { id: 7 },
                  { id: 8 },
                  { id: 9 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         let selection = controller.toggleItem(0);
         controller.setSelection(selection);
         selection = controller.toggleItem(2);
         controller.setSelection(selection);
         selection = controller.toggleItem(4);
         controller.setSelection(selection);

         selection = controller.selectAll(5);
         controller.setSelection(selection);

         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
         assert.isTrue(model.getItemBySourceKey(5).isSelected());
         assert.isTrue(model.getItemBySourceKey(6).isSelected());
         assert.isTrue(model.getItemBySourceKey(7).isSelected());
         assert.isFalse(model.getItemBySourceKey(8).isSelected());
         assert.isFalse(model.getItemBySourceKey(9).isSelected());

         assert.equal(controller.getCountOfSelected(), 8);
      });

      it('select separated item after pack and select second pack', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 },
                  { id: 7 },
                  { id: 8 },
                  { id: 9 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         let result = controller.selectAll(2);
         controller.setSelection(result);

         result = controller.toggleItem(3);
         controller.setSelection(result);

         result = controller.selectAll(2);
         controller.setSelection(result);

         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.isFalse(model.getItemBySourceKey(7).isSelected());
         assert.isFalse(model.getItemBySourceKey(8).isSelected());
         assert.isFalse(model.getItemBySourceKey(9).isSelected());

         assert.equal(controller.getCountOfSelected(), 5);
      });

      it('not unselect one selected item after select pack before this item', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 },
                  { id: 7 },
                  { id: 8 },
                  { id: 9 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         let selection = controller.toggleItem(7);
         controller.setSelection(selection);

         selection = controller.selectAll(2);
         controller.setSelection(selection);

         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isFalse(model.getItemBySourceKey(2).isSelected());
         assert.isFalse(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.isTrue(model.getItemBySourceKey(7).isSelected());
         assert.isFalse(model.getItemBySourceKey(8).isSelected());
         assert.isFalse(model.getItemBySourceKey(9).isSelected());

         assert.equal(controller.getCountOfSelected(), 3);
         assert.equal(controller.getLimit(), 3);
      });

      it('select pack, select one item and select pack, selected item should be selected', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 },
                  { id: 5 },
                  { id: 6 },
                  { id: 7 },
                  { id: 8 },
                  { id: 9 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         let selection = controller.selectAll(2);
         controller.setSelection(selection);

         selection = controller.toggleItem(7);
         controller.setSelection(selection);

         selection = controller.selectAll(2);
         controller.setSelection(selection);

         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.isTrue(model.getItemBySourceKey(7).isSelected());
         assert.isFalse(model.getItemBySourceKey(8).isSelected());
         assert.isFalse(model.getItemBySourceKey(9).isSelected());

         assert.equal(controller.getCountOfSelected(), 5);
      });

      it('select 2 packs, unselect 2/3 packs, select pack => should be selected only first pack', () => {
         model = new Collection({
            collection: new RecordSet({
               rawData: [
                  { id: 0 },
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

         strategy = new FlatSelectionStrategy({ model });

         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });

         // выбираем 2 пачки
         let selection = controller.selectAll(2);
         controller.setSelection(selection);
         selection = controller.selectAll(2);
         controller.setSelection(selection);

         // снимаем выбор со всей первой пачки и с части 2-ой пачки
         selection = controller.toggleItem(0);
         controller.setSelection(selection);
         selection = controller.toggleItem(1);
         controller.setSelection(selection);
         selection = controller.toggleItem(2);
         controller.setSelection(selection);

         // выбираем пачку
         selection = controller.selectAll(2);
         controller.setSelection(selection);

         // выбираем еще пачку
         selection = controller.selectAll(2);
         controller.setSelection(selection);

         // ожидаем что выбрано 2 пачки по 2 элемента + 1 элемент = 5 элементов
         assert.isTrue(model.getItemBySourceKey(0).isSelected());
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
         assert.isFalse(model.getItemBySourceKey(5).isSelected());
         assert.isFalse(model.getItemBySourceKey(6).isSelected());
         assert.equal(controller.getCountOfSelected(), 5);
      });
   });

   it('selectAll', () => {
      let result = controller.selectAll();
      assert.deepEqual(result, { selected: [null], excluded: [] });

      controller.setSelection({ selected: [null], excluded: [3] });
      controller.updateOptions({
         model,
         strategy,
         filter: {searchValue: 'a'},
         strategyOptions: {
            model
         }
      });

      result = controller.selectAll();
      assert.deepEqual(result, { selected: [null], excluded: [] });
   });

   describe('toggleAll', () => {
      it('default', () => {
         const result = controller.toggleAll();
         assert.deepEqual(result, { selected: [null], excluded: [] });
      });

      describe('filter is changed', () => {
         /* Првоеряем сценарии, что после изменения фильтрации и инвертировании выбранности отфильтрованные
            записи не будут выбраны.

            1, 2, 3, 4, 5
            selection={s: [1, 2, 3], e: []}

            фильтрация
            2, 3, 4

            toggleAll
            selection={s: [null], e: [1, 2, 3]}
          */

         it('selected one item, after filter it exists', () => {
            controller.setSelection({ selected: [3], excluded: [] });
            controller.updateOptions({
               model,
               strategy,
               filter: {searchValue: 'a'},
               strategyOptions: {
                  model
               }
            });

            let result = controller.toggleAll();
            assert.deepEqual(result, { selected: [null], excluded: [3] });

            controller.setSelection(result);
            result = controller.toggleAll();
            assert.deepEqual(result, { selected: [3], excluded: [] });
         });

         it('selected one item, after filter it not exists', () => {
            controller.setSelection({ selected: [2222], excluded: [] });
            controller.updateOptions({
               model,
               strategy,
               filter: {searchValue: 'aф'},
               strategyOptions: {
                  model
               }
            });

            let result = controller.toggleAll();
            assert.deepEqual(result, { selected: [null], excluded: [2222] });

            controller.setSelection(result);
            result = controller.toggleAll();
            assert.deepEqual(result, { selected: [2222], excluded: [] });
         });

         it('selected items, after filter one of there not exists', () => {
            controller.setSelection({ selected: [2, 3, 2222], excluded: [] });
            controller.updateOptions({
               model,
               strategy,
               filter: {searchValue: 'aф'},
               strategyOptions: {
                  model
               }
            });

            let result = controller.toggleAll();
            assert.deepEqual(result, { selected: [null], excluded: [2, 3, 2222] });

            controller.setSelection(result);
            result = controller.toggleAll();
            assert.deepEqual(result, { selected: [2, 3, 2222], excluded: [] });
         });

         it('tree, selected items, after filter one of there not exists', () => {
            const model = new Tree({
               collection: new RecordSet({
                  keyProperty: ListData.KEY_PROPERTY,
                  rawData: ListData.getItems()
               }),
               root: new Model({ rawData: { id: null }, keyProperty: ListData.KEY_PROPERTY }),
               keyProperty: ListData.KEY_PROPERTY,
               parentProperty: ListData.PARENT_PROPERTY,
               nodeProperty: ListData.NODE_PROPERTY,
               hasChildrenProperty: ListData.HAS_CHILDREN_PROPERTY
            });

            strategy = new TreeSelectionStrategy({
               model,
               selectDescendants: true,
               selectAncestors: true,
               rootId: null,
               entryPath: [],
               selectionType: 'all'
            });

            controller = new SelectionController({
               model,
               strategy,
               selectedKeys: [],
               excludedKeys: []
            });

            controller.setSelection({ selected: [3, 5], excluded: [] });
            controller.updateOptions({
               model,
               strategy,
               filter: {searchValue: 'aф'},
               strategyOptions: {
                  model,
                  selectDescendants: true,
                  selectAncestors: true,
                  rootId: null,
                  entryPath: [],
                  selectionType: 'all'
               }
            });

            let result = controller.toggleAll();
            assert.deepEqual(result, { selected: [null], excluded: [null, 3, 5] });

            controller.setSelection(result);
            result = controller.toggleAll();
            assert.deepEqual(result, { selected: [3, 5], excluded: [] });
         });
      });

      it('filter is changed and selected all items', () => {
         // сценарий: нет выделения, сменили фильтр, выбрали все записи, нажали инвертировать
         controller.setSelection({ selected: [], excluded: [] });
         controller.updateOptions({
            model,
            strategy,
            filter: {searchValue: 'a'},
            strategyOptions: {
               model
            }
         });

         controller.setSelection({ selected: [null], excluded: [] });
         const result = controller.toggleAll();
         assert.deepEqual(result, { selected: [], excluded: [] });
      });
   });

   it('unselectAll', () => {
      controller.toggleItem(1);
      const result = controller.unselectAll();
      assert.deepEqual(result, { selected: [], excluded: [] });
   });

   describe('onCollectionAdd', () => {
      it('set selected on added items if it is selected', () => {
         model.setCollection(new RecordSet({
            rawData: [
               { id: 1 },
               { id: 2 },
               { id: 3 },
               { id: 4 }
            ],
            keyProperty: 'id'
         }), {});

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [null],
            excludedKeys: []
         });

         const addedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(2)];
         controller.onCollectionAdd(addedItems);

         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
      });

      it('limit', () => {
         // проверяем что не проставим селекшин для новых элементов, если уперлись в лимит
         let newSelection = controller.selectAll(3);
         controller.setSelection(newSelection);
         model.setCollection(new RecordSet({
            rawData: [
               { id: 1 },
               { id: 2 },
               { id: 3 },
               { id: 4 }
            ],
            keyProperty: 'id'
         }), {});
         model.getItemBySourceKey(1).setSelected(true);
         model.getItemBySourceKey(2).setSelected(true);

         newSelection = controller.onCollectionAdd([model.getItemBySourceKey(3), model.getItemBySourceKey(4)], 2);
         controller.setSelection(newSelection);

         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
      });

      it('limit, new items filled all limit', () => {
         const newSelection = controller.selectAll(4);
         controller.setSelection(newSelection);
         model.setCollection(new RecordSet({
            rawData: [
               { id: 1 },
               { id: 2 },
               { id: 3 },
               { id: 4 }
            ],
            keyProperty: 'id'
         }), {});

         controller.onCollectionAdd([model.getItemBySourceKey(3), model.getItemBySourceKey(4)], 2);

         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
      });

      it('limit, items count was more limit', () => {
         let newSelection = controller.selectAll(1);
         controller.setSelection(newSelection);
         model.setCollection(new RecordSet({
            rawData: [
               { id: 1 },
               { id: 2 },
               { id: 3 },
               { id: 4 }
            ],
            keyProperty: 'id'
         }), {});

         newSelection = controller.onCollectionAdd([model.getItemBySourceKey(3), model.getItemBySourceKey(4)], 2);
         assert.deepEqual(newSelection, {selected: [null], excluded: [2, 3, 4]});
         controller.setSelection(newSelection);

         assert.isFalse(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
      });
   });

   describe('onCollectionRemove', () => {
      it('remove item', () => {
         controller.toggleItem(1);

         const expectedResult = {
            selected: [], excluded: []
         };
         const removedItem = {
            getKey: () => 1
         };
         const result = controller.onCollectionRemove([removedItem]);
         assert.deepEqual(result, expectedResult);
      });

      it('remove all', () => {
         const model = new Collection({
            collection: items,
            keyProperty: 'id'
         });
         model.setCollection(new RecordSet({
            rawData: [],
            keyProperty: 'id'
         }), {});

         const result = controller.onCollectionRemove([]);
         assert.deepEqual(result, {selected: [], excluded: []});
      });
   });

   describe('onCollectionReset', () => {
      it('default', () => {
         const model = new Tree({
            collection: new RecordSet({
               keyProperty: ListData.KEY_PROPERTY,
               rawData: ListData.getItems()
            }),
            root: new Model({ rawData: { id: null }, keyProperty: ListData.KEY_PROPERTY }),
            keyProperty: ListData.KEY_PROPERTY,
            parentProperty: ListData.PARENT_PROPERTY,
            nodeProperty: ListData.NODE_PROPERTY,
            hasChildrenProperty: ListData.HAS_CHILDREN_PROPERTY
         });

         strategy = new TreeSelectionStrategy({
            model,
            selectDescendants: true,
            selectAncestors: true,
            rootId: null,
            entryPath: [],
            selectionType: 'all'
         });

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [1, 8],
            excludedKeys: []
         });

         controller.onCollectionReset([{id: 8, parent: 6}]);

         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isNull(model.getItemBySourceKey(6).isSelected());
      });

      it('clear selection if selected all and filter changed', () => {
         controller.setSelection({selected: [null], excluded: []});
         controller.updateOptions({
            model,
            strategy,
            filter: {searchValue: 'a'},
            strategyOptions: {
               model
            }
         });
         const result = controller.onCollectionReset();
         assert.deepEqual(result, {selected: [], excluded: []});
      });

      it('not clear selection if selected all by every item and filter changed', () => {
         controller.setSelection({selected: [1, 2, 3], excluded: []});
         controller.updateOptions({
            model,
            strategy,
            filter: {searchValue: 'a'},
            strategyOptions: {
               model
            }
         });
         const result = controller.onCollectionReset();
         // метод ничего не вернул => selection не пересчитался
         assert.isUndefined(result);
      });
   });

   describe ('getCountOfSelected', () => {
      const items = new RecordSet({
         rawData: [
            {id: 1, parent: null, node: null},
            {id: 2, parent: null, node: null},
            {id: 3, parent: null, node: true, accessibilitySelect: MultiSelectAccessibility.hidden, hasChildren: false}
         ],
         keyProperty: 'id'
      });

      it('getCountOfSelected', () => {
         const list = new Collection({
            collection: items,
            keyProperty: 'id',
            multiSelectAccessibilityProperty: 'accessibilitySelect'
         });
         const flatController = new SelectionController({
            model: list,
            strategy: new FlatSelectionStrategy({model: list }),
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });
         assert.equal(flatController.getCountOfSelected({selected: [1], excluded: []}), 1);
         flatController.setSelection({selected: [1], excluded: []});
         assert.equal(flatController.getCountOfSelected(), 1);
      });

      it('same work in tree and flat when same data', () => {
         const list = new Collection({
            collection: items,
            keyProperty: 'id',
            multiSelectAccessibilityProperty: 'accessibilitySelect'
         });

         const tree = new TreeGridCollection({
            collection: items,
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren',
            columns: [],
            multiSelectAccessibilityProperty: 'accessibilitySelect'
         });

         const flatController = new SelectionController({
            model: list,
            strategy: new FlatSelectionStrategy({model: list }),
            filter: {},
            selectedKeys: [null],
            excludedKeys: []
         });

         const treeController = new SelectionController({
            model: tree,
            strategy: new TreeSelectionStrategy({
               model: tree,
               selectDescendants: true,
               selectAncestors: true,
               rootId: null,
               entryPath: [],
               selectionType: 'all',
               selectionCountMode: 'all'
            }),
            selectedKeys: [null],
            excludedKeys: []
         });

         assert.equal(flatController.getCountOfSelected(), 2);
         assert.equal(flatController.getCountOfSelected({selected: [1, 2, 3], excluded: []}), 2);

         assert.equal(treeController.getCountOfSelected(), 2);
         assert.equal(treeController.getCountOfSelected({selected: [1, 2, 3], excluded: []}), 2);
      });
   });

   describe('getSelectedItems', () => {
      let model;
      beforeEach(() => {
         model = new Collection({
            collection:  new RecordSet({
               rawData: [
                  { id: 1 },
                  { id: 2 },
                  { id: 3 },
                  { id: 4 }
               ],
               keyProperty: 'id'
            }),
            keyProperty: 'id'
         });
         strategy = new FlatSelectionStrategy({model });
         controller = new SelectionController({
            model,
            strategy,
            filter: {},
            selectedKeys: [],
            excludedKeys: []
         });
      });

      it('should return one selected item', () => {
         model.at(0).setSelected(true);
         const items = controller.getSelectedItems();
         assert.strictEqual(items[0], model.at(0));
         assert.strictEqual(items.length, 1);
      });

      it('should return two selected items', () => {
         model.at(0).setSelected(true);
         model.at(1).setSelected(true);
         const items = controller.getSelectedItems();
         for (let i = 0; i < items.length; i++) {
            assert.notEqual(model.getIndex(items[i]), -1);
         }
         assert.strictEqual(items.length, 2);
      });
   });

   describe('readonly checkboxes', () => {
      const readonlyItems = new RecordSet({
         rawData: [
            { id: 1, checkboxState: true },
            { id: 2, checkboxState: false },
            { id: 3, checkboxState: null }
         ],
         keyProperty: 'id'
      });
      let readonlyModel;
      let controllerWithReadonly;

      beforeEach(() => {
         readonlyModel = new Collection({
            keyProperty: 'id',
            collection: readonlyItems,
            multiSelectAccessibilityProperty: 'checkboxState'
         });

         controllerWithReadonly = new SelectionController({
            model: readonlyModel,
            strategy: new FlatSelectionStrategy({
               model: readonlyModel
            }),
            selectedKeys: [],
            excludedKeys: []
         });
      });

      it('toggleItem', () => {
         let result = controllerWithReadonly.toggleItem(1);
         assert.deepEqual(result, { selected: [1], excluded: [] });

         result = controllerWithReadonly.toggleItem(2);
         assert.deepEqual(result, { selected: [], excluded: [] });

         result = controllerWithReadonly.toggleItem(3);
         assert.deepEqual(result, { selected: [], excluded: [] });
      });

      describe('setSelection', () => {
         it('all are selected', () => {
            controllerWithReadonly.setSelection({selected: [null], excluded: []});
            assert.isTrue(readonlyModel.getItemBySourceKey(1).isSelected());
            assert.isFalse(readonlyModel.getItemBySourceKey(2).isSelected());
            assert.isFalse(readonlyModel.getItemBySourceKey(3).isSelected());
         });

         it('readonly selected', () => {
            controllerWithReadonly.setSelection({selected: [2], excluded: []});
            assert.isFalse(readonlyModel.getItemBySourceKey(1).isSelected());
            assert.isTrue(readonlyModel.getItemBySourceKey(2).isSelected());
            assert.isFalse(readonlyModel.getItemBySourceKey(3).isSelected());
         });

         it('empty selection reset limit', () => {
            controllerWithReadonly.setLimit(10);
            controllerWithReadonly.setSelection({selected: [], excluded: []});
            assert.isTrue(controllerWithReadonly.getLimit() === 0);
         });

         it('not pass excluded', () => {
            controller.setSelection({selected: [1]});
            assert.deepEqual(controller.getSelection(), {selected: [1], excluded: []});
         });
      });
   });

   it('with limit', () => {
      let result = controller.selectAll(1);
      controller.setSelection(result);
      assert.equal(controller.getCountOfSelected(), 1);
      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isFalse(model.getItemBySourceKey(2).isSelected());
      assert.isFalse(model.getItemBySourceKey(3).isSelected());

      result = controller.toggleItem(3);
      controller.setSelection(result);
      assert.equal(controller.getCountOfSelected(), 2);
      assert.isTrue(model.getItemBySourceKey(1).isSelected());
      assert.isFalse(model.getItemBySourceKey(2).isSelected());
      assert.isTrue(model.getItemBySourceKey(3).isSelected());
   });

   it('setSelection', () => {
      controller.toggleItem(1);
      controller.setSelection({selected: [1], excluded: []});
      assert.isTrue(model.getItemBySourceKey(1).isSelected());
   });

   // При вызове startItemAnimation нужно устанавливать в коллекцию анимацию right-swiped и isSwiped
   it('should right-swipe item on startItemAnimation() method', () => {
      controller.startItemAnimation(1);
      const item1 = model.getItemBySourceKey(1);
      assert.isTrue(item1.isAnimatedForSelection());
   });

   it('method getAnimatedItem() should return right swiped item', () => {
      // @ts-ignore
      const item: CollectionItem<Record> = model.getItemBySourceKey(1);
      let swipedItem: ISelectionItem;

      controller.startItemAnimation(1);
      // @ts-ignore
      swipedItem = controller.getAnimatedItem() as CollectionItem<Record>;
      assert.equal(swipedItem, item, 'right-swiped item has not been found by getAnimatedItem() method');
      controller.stopItemAnimation();

      // @ts-ignore
      swipedItem = controller.getAnimatedItem() as CollectionItem<Record>;
      assert.equal(swipedItem, null, 'Current right-swiped item has not been un-swiped');
   });

   it('skip not selectable items', () => {
      const items = new RecordSet({
         rawData: [
            {id: 1, group: 1},
            {id: 2, group: 2},
            {id: 3, group: 1},
            {id: 4, group: 3}
         ],
         keyProperty: 'id'
      });
      const display = new Collection({
         collection: items,
         group: (item) => item.get('group')
      });

      const newController = new SelectionController({
         model: display,
         strategy: new FlatSelectionStrategy({model: display }),
         selectedKeys: [null],
         excludedKeys: []
      });

      // всего элементов учитывая группы 7, но выбрать можно только 4
      assert.equal(display.getCount(), 7);
      assert.equal(newController.getCountOfSelected(), 4);

   });

   describe('should work with breadcrumbs', () => {
      const items = new RecordSet({
         rawData: [
             {
               id: 1,
               parent: null,
               nodeType: true,
               title: 'test_node'
            }, {
               id: 2,
               parent: 1,
               nodeType: null,
               title: 'test_leaf'
            },
            {
               id: 3,
               parent: null,
               nodeType: true,
               title: 'test_node'
            }, {
               id: 4,
               parent: 3,
               nodeType: null,
               title: 'test_leaf'
            }
         ],
         keyProperty: 'id'
      });

      let model;
      let controller;
      let strategy;

      beforeEach(() => {
         model = new SearchGridCollection({
            root: null,
            collection: items,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            columns: [{}]
         });

         strategy = new TreeSelectionStrategy({
             model,
             selectDescendants: false,
             selectAncestors: false,
             rootId: null,
             selectionType: 'all'
         });

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [],
            excludedKeys: []
         });
      });

      it('onCollectionAdd', () => {
         model.setCollection(items, {});

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [1, 3],
            excludedKeys: []
         });

         const addedItems = [model.getItemBySourceKey(1), model.getItemBySourceKey(3)];
         controller.onCollectionAdd(addedItems);

         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isFalse(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(3).isSelected());
         assert.isFalse(model.getItemBySourceKey(4).isSelected());
      });

      it('getSelectionForModel', () => {
         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [],
            excludedKeys: [],
            searchValue: 'asdas'
         });
         controller.setSelection({ selected: [null], excluded: [null] });
         assert.isNull(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isNull(model.getItemBySourceKey(3).isSelected());
         assert.isTrue(model.getItemBySourceKey(4).isSelected());
      });

      it('select leaf by selected parent in breadcrumbs', () => {
         /*
            node-1
               leaf-13
            node-1, node-11
               leaf-111
            node-1, node-12
               leaf-121
            node-2
               leaf-21
          */
         const items = new RecordSet({
            rawData: [
               {
                  id: 1,
                  parent: null,
                  nodeType: true,
                  title: 'node-1'
               }, {
                  id: 11,
                  parent: 1,
                  nodeType: true,
                  title: 'node-11'
               }, {
                  id: 111,
                  parent: 11,
                  nodeType: null,
                  title: 'leaf-111'
               },
               {
                  id: 12,
                  parent: 1,
                  nodeType: true,
                  title: 'node-12'
               }, {
                  id: 121,
                  parent: 12,
                  nodeType: null,
                  title: 'leaf-121'
               }, {
                  id: 13,
                  parent: 1,
                  nodeType: null,
                  title: 'leaf-13'
               }, {
                  id: 2,
                  parent: null,
                  nodeType: true,
                  title: 'node-2'
               }, {
                  id: 21,
                  parent: 2,
                  nodeType: null,
                  title: 'leaf-21'
               }
            ],
            keyProperty: 'id'
         });

         model = new SearchGridCollection({
            collection: items,
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            columns: [{}]
         });

         strategy = new TreeSelectionStrategy({
            model,
            selectDescendants: true,
            selectAncestors: true,
            rootId: null,
            selectionType: 'all'
         });

         controller = new SelectionController({
            model,
            strategy,
            selectedKeys: [],
            excludedKeys: [],
            searchValue: 'aaa'
         });

         controller.setSelection({selected: [1], excluded: []});
         // Проверяем что выбраны все хлебные крошки, у которых в пути есть 1 и все дети этих хлебных крошек
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         assert.isTrue(model.getItemBySourceKey(13).isSelected());
         assert.isNull(model.getItemBySourceKey(11).isSelected());
         assert.isTrue(model.getItemBySourceKey(111).isSelected());
         assert.isNull(model.getItemBySourceKey(12).isSelected());
         assert.isTrue(model.getItemBySourceKey(121).isSelected());
         assert.isFalse(model.getItemBySourceKey(2).isSelected());
         assert.isFalse(model.getItemBySourceKey(21).isSelected());

         controller.setSelection({selected: [2], excluded: []});
         // Проверяем что выбраны все хлебные крошки, у которых в пути есть 2 и все дети этих хлебных крошек
         assert.isFalse(model.getItemBySourceKey(1).isSelected());
         assert.isFalse(model.getItemBySourceKey(13).isSelected());
         assert.isFalse(model.getItemBySourceKey(11).isSelected());
         assert.isFalse(model.getItemBySourceKey(111).isSelected());
         assert.isFalse(model.getItemBySourceKey(12).isSelected());
         assert.isFalse(model.getItemBySourceKey(121).isSelected());
         assert.isTrue(model.getItemBySourceKey(2).isSelected());
         assert.isTrue(model.getItemBySourceKey(21).isSelected());

         controller.setSelection({selected: [12], excluded: [1]});
         // Проверяем что для выбранности каждый последующий элемент крошки имеет больший вес, то есть
         // Крошка [1, 12]. 1 -исключена, но 12 - выбрана => крошка выбрана, т.к. выбрана папка на которую она указывает
         assert.isFalse(model.getItemBySourceKey(1).isSelected());
         assert.isFalse(model.getItemBySourceKey(13).isSelected());
         assert.isFalse(model.getItemBySourceKey(11).isSelected());
         assert.isFalse(model.getItemBySourceKey(111).isSelected());
         assert.isTrue(model.getItemBySourceKey(12).isSelected());
         assert.isTrue(model.getItemBySourceKey(121).isSelected());
         assert.isFalse(model.getItemBySourceKey(2).isSelected());
         assert.isFalse(model.getItemBySourceKey(21).isSelected());
      });
   });

   describe('onCollectionMove', () => {
      it('in tree recount state', () => {
         const rs = new RecordSet({
            rawData: [
               {id: 1, hasChildren: false, node: true, parent: null},
               {id: 11, hasChildren: false, node: true, parent: 1},
               {id: 2, hasChildren: false, node: true, parent: null},
               {id: 21, hasChildren: false, node: true, parent: 2}
            ],
            keyProperty: 'id'
         });
         const tree = new Tree({
            collection: rs,
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren'
         });
         const treeController = new SelectionController({
            model: tree,
            strategy: new TreeSelectionStrategy({
               model: tree,
               selectDescendants: true,
               selectAncestors: true,
               rootId: null,
               selectionType: 'all'
            }),
            selectedKeys: [null],
            excludedKeys: []
         });

         treeController.setSelection({selected: [21], excluded: []});

         rs.getRecordById(21).set('parent', 1);
         treeController.onCollectionMove();

         assert.isNull(tree.getItemBySourceKey(1).isSelected());
         assert.isFalse(tree.getItemBySourceKey(11).isSelected());
         assert.isTrue(tree.getItemBySourceKey(21).isSelected());
         assert.isFalse(tree.getItemBySourceKey(2).isSelected());
      });
   });

   describe('destroy', () => {
      it('should clear state on model', () => {
         controller.setSelection({selected: [1], excluded: []});
         assert.isTrue(model.getItemBySourceKey(1).isSelected());
         controller.destroy();
         assert.isFalse(model.getItemBySourceKey(1).isSelected());
      });

      it('should reset selected state on all items in tree', () => {
         const items = new RecordSet({
            rawData: [
               { id: 1, parent: null, node: true },
               { id: 11, parent: 1, node: null },
               { id: 12, parent: 1, node: null }
            ],
            keyProperty: 'id'
         });

         const tree = new TreeGridCollection({
            collection: items,
            root: null,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            hasChildrenProperty: 'hasChildren',
            columns: [],
            expandedItems: [1],
            multiSelectAccessibilityProperty: 'accessibilitySelect'
         });

         const controller = new SelectionController({
            model: tree,
            strategy: new TreeSelectionStrategy({
               model: tree,
               selectDescendants: true,
               selectAncestors: true,
               rootId: null,
               entryPath: [],
               selectionType: 'all',
               selectionCountMode: 'all',
               recursiveSelection: true
            }),
            selectedKeys: [null],
            excludedKeys: [],
            searchValue: '',
            filter: {}
         });

         controller.setSelection({selected: [1], excluded: []});
         tree.setExpandedItems([]);
         controller.setSelection({selected: [], excluded: []});
         tree.setExpandedItems([1]);

         assert.isFalse(tree.getItemBySourceKey(1).isSelected());
         assert.isFalse(tree.getItemBySourceKey(11).isSelected());
         assert.isFalse(tree.getItemBySourceKey(12).isSelected());
      });
   });
});
