define(['Controls/lookupPopup', 'Types/entity', 'Types/source', 'Types/collection', 'Controls/operations', 'Controls/_lookupPopup/Container'], function(lookupPopup, entity, sourceLib, collection, operations, LookupPopupContainer) {

   var getRawData = function(id) {
      return {
         id: id
      };
   };

   var getItems = function() {
      var items = [];
      var i;

      for (i = 0; i < 5; i++) {
         items.push(new entity.Model(
            {
               rawData: getRawData(i),
               keyProperty: 'id'
            })
         );
      }

      return items;
   };

   describe('Controls/_lookupPopup/Container', function() {

      it('_beforeUnmount', () => {
         const container = new LookupPopupContainer();

         container._loadingIndicatorId = 'testId';
         container._beforeUnmount();

         assert.isNull(container._loadingIndicatorId);
      });

      it('_private::getInitialSelectedItems', () => {
         const self = {};
         self._selectedKeys = [1];
         const options = {
            selectedItems: new collection.List({items: getItems()}),
            _dataOptionsValue: {
               keyProperty: 'id'
            }
         };

         assert.equal(LookupPopupContainer._private.getInitialSelectedItems(self, options).getCount(), 1);
      });

      it('getFilteredItems', function() {
         var items = ['toRemoveItem', 'toSaveItem', 'toSaveItem'];
         var filterFunc = function(item) {
            return item !== 'toRemoveItem';
         };
         var retTrue = function() {
            return true;
         };

         assert.deepEqual(LookupPopupContainer._private.getFilteredItems(items, retTrue), items);
         assert.deepEqual(LookupPopupContainer._private.getFilteredItems(items, filterFunc), ['toSaveItem', 'toSaveItem']);
      });

      it('getKeysByItems', function() {
         assert.deepEqual(LookupPopupContainer._private.getKeysByItems(getItems(), 'id'), [0, 1, 2, 3, 4]);
      });

      it('getEmptyItems', function() {
         var listWithItems = new collection.List({items: getItems()});

         assert.equal(LookupPopupContainer._private.getEmptyItems(listWithItems).getCount(), 0);
         assert.equal(LookupPopupContainer._private.getEmptyItems(listWithItems)._moduleName, 'Types/collection:List');
      });


      it('getValidSelectionType', function() {
         assert.equal(LookupPopupContainer._private.getValidSelectionType('all'), 'all');
         assert.equal(LookupPopupContainer._private.getValidSelectionType('leaf'), 'leaf');
         assert.equal(LookupPopupContainer._private.getValidSelectionType('node'), 'node');
         assert.equal(LookupPopupContainer._private.getValidSelectionType('test'), 'all');
      });

      it('getFilterFunction', function() {
         var retFalse = function() {
            return false;
         }

         assert.isTrue(LookupPopupContainer._private.getFilterFunction()());
         assert.isFalse(LookupPopupContainer._private.getFilterFunction(retFalse)());
      });

      it('getSelectedKeys', function() {
         var options = {
            selectionFilter: function(item) {
               var id = item.get('id');
               return id !== 1 && id !== 3;
            },
            _dataOptionsValue: {
               keyProperty: 'id'
            }
         };

         options.selectedItems = new collection.List({items: getItems()});
         options.selectedItems.at(0).set('id', 'testId');
         assert.deepEqual(LookupPopupContainer._private.getSelectedKeys(options), ['testId', 2, 4]);

         options.selectedItems = null;
         options.selectedKeys = ['testId'];
         assert.deepEqual(LookupPopupContainer._private.getSelectedKeys(options), ['testId']);
      });

      describe('prepareFilter', () => {
         let filter, source;

         beforeEach(() => {
            source = new sourceLib.Memory();
            filter = {
               searchParam: 'test',
               parent: 123
            };
         });

         it('searchParam and parentProperty are deleted from filter on select', () => {
            const selection = operations.selectionToRecord({ selected: [1, 2], excluded: [3, 4] }, source.getAdapter());
            const preparedFilter = LookupPopupContainer._private.prepareFilter({
               filter,
               selection,
               searchParam: 'searchParam',
               parentProperty: 'parent'
            });

            assert.deepEqual(preparedFilter.selection.get('marked'), ['1', '2']);
            assert.deepEqual(preparedFilter.selection.get('excluded'), ['3', '4']);
            assert.isTrue(preparedFilter !== filter);
            assert.isTrue(!preparedFilter.searchParam);
            assert.isTrue(!preparedFilter.parent);
         });

         it('searchParam not deleted from filter on select all', () => {
            const selection = operations.selectionToRecord({ selected: [null], excluded: [null] }, source.getAdapter());
            const preparedFilter = LookupPopupContainer._private.prepareFilter({
               filter,
               selection,
               searchParam: 'searchParam'
            });
            assert.deepEqual(preparedFilter.selection.get('marked'), [null]);
            assert.deepEqual(preparedFilter.selection.get('excluded'), [null]);
            assert.isTrue(preparedFilter !== filter);
            assert.isTrue(preparedFilter.searchParam === 'test');
         });

         it('searchParam not deleted from filter on select all in hierarchy list', () => {
            let selection = operations.selectionToRecord({ selected: ['testRoot'], excluded: [null] }, source.getAdapter());
            let preparedFilter = LookupPopupContainer._private.prepareFilter({
               filter,
               selection,
               searchParam: 'searchParam',
               root: 'testRoot'
            });
            assert.isTrue(preparedFilter.searchParam === 'test');

            selection = operations.selectionToRecord({ selected: [1], excluded: [null] }, source.getAdapter());
            preparedFilter = LookupPopupContainer._private.prepareFilter({
               filter,
               selection,
               searchParam: 'searchParam',
               root: 1
            });
            assert.isTrue(preparedFilter.searchParam === 'test');
         });

         it('entries and selectionWithPath are deleted from filter on select', () => {
            filter = {
               searchParam: 'test',
               parent: 123,
               entries: [],
               selectionWithPath: []
            };
            source = new sourceLib.Memory();
            const selection = operations.selectionToRecord({ selected: [1, 2], excluded: [3, 4] }, source.getAdapter());
            const preparedFilter = LookupPopupContainer._private.prepareFilter({
               filter,
               selection,
               searchParam: 'searchParam',
               parentProperty: 'parent'
            });
            assert.isUndefined(preparedFilter.entries);
            assert.isUndefined(preparedFilter.selectionWithPath);
         });

         it('prepare filter with selected node and searchParam', () => {
            const selection = operations.selectionToRecord({ selected: [1, 2], excluded: [3, 4] }, source.getAdapter());
            const items = new collection.RecordSet({
               rawData: [
                  {
                     id: 1,
                     isNode: true
                  }
               ]
            });
            const preparedFilter = LookupPopupContainer._private.prepareFilter({
               filter,
               selection,
               searchParam: 'searchParam',
               root: 1,
               nodeProperty: 'isNode',
               items
            });
            assert.equal(preparedFilter.searchParam, 'test');
         });

         it('prepare filter with selected node and searchParam, selectionType is node', () => {
            const selection = operations.selectionToRecord({ selected: [1, 2], excluded: [3, 4] }, source.getAdapter());
            const items = new collection.RecordSet({
               rawData: [
                  {
                     id: '1',
                     isNode: true
                  }
               ]
            });
            const preparedFilter = LookupPopupContainer._private.prepareFilter({
               filter,
               selection,
               searchParam: 'searchParam',
               root: 'testRoot',
               nodeProperty: 'isNode',
               items,
               selectionType: 'node'
            });
            assert.isUndefined(preparedFilter.searchParam);
         });
      });

      it('prepareResult', function() {
         var result = 'result';
         var selectedKeys = [];
         var keyProperty = 'id';
         var selectCompleteInitiator = true;

         assert.deepEqual(LookupPopupContainer._private.prepareResult(result, selectedKeys, keyProperty, selectCompleteInitiator), {
            resultSelection: result,
            initialSelection: selectedKeys,
            keyProperty: keyProperty,
            selectCompleteInitiator: selectCompleteInitiator
         });
      });

      it('getCrudWrapper', function() {
         var source = new sourceLib.Memory();
         var navigation = {};
         var crudWrapper = LookupPopupContainer._private.getCrudWrapper(source);

         assert.include(
            ['Controls/dataSource:CrudWrapper', 'Controls/_dataSource/CrudWrapper'],
             crudWrapper._moduleName
         );
      });

      it('_selectedKeysChanged', function() {
         let container = new LookupPopupContainer();
         let eventFired = false;

         container._notify = (e) => {
            if (e === 'selectedKeysChanged') {
               eventFired = true;
            }
         };

         container._selectedKeysChanged();
         assert.isTrue(eventFired);
      });

      it('_excludedKeysChanged', function() {
         let container = new LookupPopupContainer();
         let eventFired = false;

         container._notify = (e) => {
            if (e === 'excludedKeysChanged') {
               eventFired = true;
            }
         };

         container._excludedKeysChanged();
         assert.isTrue(eventFired);
      });


      it('_private::prepareRecursiveSelection', () => {
         let items = new collection.RecordSet({
            rawData: [
               {
                  'id': 0,
                  'parent': null,
                  '@parent': false
               },
               {
                  'id': 1,
                  'parent': null,
                  '@parent': true
               },
               {
                  'id': 2,
                  'parent': null,
                  '@parent': true
               },
               {
                  'id': 3,
                  'parent': 2,
                  '@parent': false
               },
               {
                  'id': 4,
                  'parent': 2,
                  '@parent': false
               }
            ],
            keyProperty: 'id'
         });
         let selection = {
            selected: [0, 1, 2, 'notInRecordSet'],
            excluded: [3]
         };

         let preparedSelection = LookupPopupContainer._private.prepareNotRecursiveSelection(
            selection,
            items,
            'id',
            'parent',
            '@parent'
         );

         assert.deepEqual(preparedSelection, {
            selected: [0, 1, 2, 'notInRecordSet'],
            excluded: [3, 2]
         });
      });

      it('_private::prepareRecursiveSelection for all selected', () => {
         let items = new collection.RecordSet({
            rawData: [
               {
                  'id': 0,
                  'parent': null,
                  '@parent': false
               },
               {
                  'id': 1,
                  'parent': null,
                  '@parent': true
               },
               {
                  'id': 2,
                  'parent': null,
                  '@parent': true
               },
               {
                  'id': 3,
                  'parent': 2,
                  '@parent': false
               },
               {
                  'id': 4,
                  'parent': 2,
                  '@parent': false
               }
            ],
            keyProperty: 'id'
         });
         let selection = {
            selected: [null],
            excluded: [null, 3]
         };

         let preparedSelection = LookupPopupContainer._private.prepareNotRecursiveSelection(
             selection,
             items,
             'id',
             'parent',
             '@parent',
             null
         );

         assert.deepEqual(preparedSelection, {
            selected: [null, 2],
            excluded: [null, 3, 2]
         });
      });

      it('_private::getSelection', () => {
         let selectionType = 'invalidSelectionType';
         let selection = {
            selected: [1, 2, 3],
            excluded: [1]
         };
         let adapter = (new sourceLib.Memory()).getAdapter();
         let selectionRecord = LookupPopupContainer._private.getSelection(selection, adapter, selectionType, false);

         assert.deepEqual(
            selectionRecord.getRawData(),
            {
               marked: ['1', '2', '3'],
               excluded: ['1'],
               type: 'all',
               recursive: false
            });

         selectionType = 'node';
         selectionRecord = LookupPopupContainer._private.getSelection(selection, adapter, selectionType, true);
         assert.deepEqual(
            selectionRecord.getRawData(),
            {
               marked: ['1', '2', '3'],
               excluded: ['1'],
               type: 'node',
               recursive: true
            });
      });

      describe('_selectComplete', function() {
         const getContainer = () => {
            let
               container = new LookupPopupContainer(),
               isSelectionLoad = false,
               items = getItems(),
               recordSet = new collection.List({ items: items });

            container.saveOptions({
               recursiveSelection: true,
               selectionLoadMode: true,
               _dataOptionsValue: {
                  source: new sourceLib.Memory(),
                  items: recordSet,
                  filter: {}
               }
            });

            recordSet.getRecordById = function(id) {
               return items[id];
            };

            container._selectedKeys = [];
            container._excludedKeys = [];

            container._notify = function(eventName, result) {
               if (eventName === 'selectionLoad') {
                  container.isSelectionLoad = true;
                  container.loadDef = result[0];
               }
            };
            return container;
         };

         it('selected keys is empty', function() {
            let container = getContainer();
            let clearRecordSet = new collection.List({items: getItems().slice()});

            clearRecordSet.clear();
            container._selectComplete();

            assert.isTrue(container.isSelectionLoad);

            return new Promise((resolve) => {
               container.loadDef.then((result) => {
                  assert.deepEqual(result.resultSelection, clearRecordSet);
                  resolve();
               });
            });
         });

         it('single select', function() {
            let container = getContainer();
            container._selectedKeys = [1];
            container._selectCompleteInitiator = true;
            container._selectComplete();

            return new Promise((resolve) => {
               container.loadDef.then((result) => {
                  assert.deepEqual(result.resultSelection.at(0).getRawData(), getItems()[1].getRawData());


                  container._selectCompleteInitiator = false;
                  container._selectComplete();

                  container.loadDef.then((result) => {
                     assert.equal(result.resultSelection.getCount(), 0);
                     resolve();
                  });
               });
            });
         });

         it('selectionLoadMode: false', function() {
            let container = getContainer();
            container._selectedKeys = [1];
            container._options.selectionLoadMode = false;
            container._selectComplete();

            return new Promise((resolve) => {
               container.loadDef.then((result) => {
                  assert.deepEqual(result.selection.get('marked'), ['1']);
                  resolve();
               });
            });
         });

         it('multi select, check toggle indicator', function() {
            let
               hideIndicatorParam,
               indicatorId = 'fw54dw54d46q46d5',
               isShowIndicator = false,
               isHideIndicator = false,
               container = getContainer(),
               loadDef;

            container._notify = function(eventName, result) {
               switch (eventName){
                  case 'showIndicator':
                     isShowIndicator = true;
                     return indicatorId;

                  case 'hideIndicator':
                     isHideIndicator = true;
                     hideIndicatorParam = result[0];
                     break;

                  case 'selectionLoad':
                     loadDef = result[0];
                     break;
               }
            };
            container._selectedKeys = [1];
            container._options.multiSelect = true;
            container._selectComplete();

            assert.isTrue(isShowIndicator);

            return new Promise((resolve) => {
               loadDef.then(() => {
                  assert.isTrue(isHideIndicator);
                  assert.equal(hideIndicatorParam, indicatorId);
                  resolve();
               });
            });
         });

         it('query returns error', async function() {
            let isIndicatorHidden = false;
            const container = getContainer();
            const source = new sourceLib.Memory();

            source.query = () => Promise.reject(new Error('testError'));

            container._options._dataOptionsValue = {
               source: source,
               items: new collection.List(),
               filter: {}
            };

            container._notify = function(eventName) {
               if (eventName === 'hideIndicator') {
                  isIndicatorHidden = true;
               }
               if (eventName === 'showIndicator') {
                  isIndicatorHidden = false;
                  return 'testId';
               }
            };
            container._selectedKeys = [1, 2];
            container._options.multiSelect = true;
            await container._selectComplete().catch(error => error);
            assert.isTrue(isIndicatorHidden);
         });
      });
   });

});
