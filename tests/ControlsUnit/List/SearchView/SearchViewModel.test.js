define(['Controls/_treeGrid/SearchView/SearchViewModel', 'Types/collection', 'Controls/_treeGrid/TreeGridView/TreeGridView'], function(SearchViewModel, Collection, TreeGridView) {
   describe('Controls.List.SearchView.SearchViewModel', function() {
      it('getDisplayFilter', function() {
         var
            itemsFilterMethod = function() {},
            searchViewModel = new SearchViewModel({
               root: 'myTestRoot',
               items: []
            }),
            result = [
               itemsFilterMethod
            ];
         assert.deepEqual(searchViewModel.getDisplayFilter(null, {itemsFilterMethod: itemsFilterMethod}), result);
         assert.deepEqual(searchViewModel._display.getRoot().getContents(), 'myTestRoot');
      });
      it('hasItemById', function() {
         var
            searchViewModel = new SearchViewModel({
               items: new Collection.RecordSet({
                  rawData: [{
                     id: 1,
                     type: true,
                     parent: null
                  }, {
                     id: 2,
                     type: null,
                     parent: 1
                  }],
                  keyProperty: 'id'
               }),
               parentProperty: 'parent',
               nodeProperty: 'type',
               keyProperty: 'id'
            });
         assert.equal(searchViewModel.hasItemById(1), true);
         assert.equal(searchViewModel.hasItemById(2), true);
         assert.equal(searchViewModel.hasItemById(3), false);
      });
      it('itemTemplate', function() {
         var
            itemData,
            searchViewModel,
            superclassGetItemDataByItem = SearchViewModel.superclass.getItemDataByItem,
            treeView = new TreeGridView({});
         SearchViewModel.superclass.getItemDataByItem = function(breadCrumbs) {
            const itemData = {
               item: {},
               resolveBaseItemTemplate: treeView._resolveBaseItemTemplate.bind(treeView)
            };

            if (breadCrumbs) {
               itemData.item.forEach = () => {}
            }
            return itemData;
         };

         searchViewModel = new SearchViewModel({});
         itemData = searchViewModel.getItemDataByItem(false);
         assert.equal(itemData.resolveItemTemplate(itemData).name, 'Controls__treeGrid_TreeGridView_layout_grid_Item');
         itemData = searchViewModel.getItemDataByItem(true);
         assert.equal(itemData.resolveItemTemplate(itemData).name, 'Controls__treeGrid_TreeGridView_layout_grid_Item');

         searchViewModel = new SearchViewModel({
            itemTemplate: {
               prototype: {
                  _moduleName: 'testItemTemplate'
               }
            }
         });
         itemData = searchViewModel.getItemDataByItem(false);
         assert.equal(itemData.resolveItemTemplate(itemData).prototype._moduleName, 'testItemTemplate');
         itemData = searchViewModel.getItemDataByItem(true);
         assert.equal(itemData.resolveItemTemplate(itemData).name, 'Controls__treeGrid_TreeGridView_layout_grid_Item');

         SearchViewModel.superclass.getItemDataByItem = superclassGetItemDataByItem;
      });
      it('getItemActions', function() {
         var
            searchViewModel = new SearchViewModel({
               items: new Collection.RecordSet({
                  rawData: [{
                     id: 1,
                     type: true,
                     parent: null
                  }, {
                     id: 2,
                     type: null,
                     parent: 1
                  }],
                  keyProperty: 'id'
               }),
               parentProperty: 'parent',
               nodeProperty: 'type',
               keyProperty: 'id'
            }),
            item1 = searchViewModel._display.at(0).getContents(),
            item2 = searchViewModel._display.at(1).getContents();

         searchViewModel.setItemActions(item1[0], [{ id: 'action_for_node' }]);
         searchViewModel.setItemActions(item2, [{ id: 'action_for_leaf' }]);

         assert.deepEqual(searchViewModel.getItemActions(item1), [{ id: 'action_for_node' }]);
         assert.deepEqual(searchViewModel.getItemActions(item2), [{ id: 'action_for_leaf' }]);
      });

      it('_getItemVersion', function() {
         var
            searchViewModel = new SearchViewModel({
               items: new Collection.RecordSet({
                  rawData: [{
                     id: 1,
                     type: true,
                     parent: null
                  }, {
                     id: 2,
                     type: true,
                     parent: 1
                  }, {
                     id: 3,
                     type: null,
                     parent: 2
                  }],
                  keyProperty: 'id'
               }),
               parentProperty: 'parent',
               nodeProperty: 'type',
               keyProperty: 'id'
            });
         assert.equal(searchViewModel._getItemVersion(searchViewModel._display.at(0).getContents()), '0_0');
         assert.equal(searchViewModel._getItemVersion(searchViewModel._display.at(1).getContents()), '0');
      });

      it('isGroup', function() {
         let searchViewModel = new SearchViewModel({
               root: 'myTestRoot',
               items: []
            });

         let itemGroupMock = 'test';
         let breadCrumbsMock = [];

         assert.isFalse(searchViewModel._isGroup(breadCrumbsMock));
         assert.isTrue(searchViewModel._isGroup(itemGroupMock));
      });

      it('isGroup', function() {
         var cfg = {
            items: new Collection.RecordSet({
               rawData: [{
                  id: 1,
                  type: true,
                  parent: null,
               },
                  {
                     id: 2,
                     type: null,
                     parent: 1
                  },
                  {
                     id: 3,
                     type: null,
                     parent: 1
                  },
                  {
                     id: 4,
                     type: true,
                     parent: null
                  },
                  {
                     id: 5,
                     type: null,
                     parent: 4
                  },
                  {
                     id: 6,
                     type: null,
                     parent: 4
                  },
                  {
                     id: 7,
                     type: null,
                     parent: 4
                  }
               ],
               keyProperty: 'id'
            }),
            parentProperty: 'parent',
            nodeProperty: 'type',
            keyProperty: 'id'
         },
         model;

         cfg.markedKey = 3;
         model = new SearchViewModel(cfg);
         model.getItems().removeAt(2);
         assert.equal(5, model.getMarkedKey());

         cfg.markedKey = 2;
         model = new SearchViewModel(cfg);
         model.getItems().removeAt(1);
         assert.equal(5, model.getMarkedKey());

         cfg.markedKey = 7;
         model = new SearchViewModel(cfg);
         model.getItems().removeAt(4);
         assert.equal(6, model.getMarkedKey());

      });

      it('setHoveredItem', function() {
         const model = new SearchViewModel({
            root: 'myTestRoot',
            items: []
         });

         const fakeItem = { fakeItem: true };
         model.setHoveredItem(fakeItem);
         assert.strictEqual(model.getHoveredItem(), fakeItem);

         // does not fail on breadcrumbs
         const fakeCrumbs = [{ crumb: 1 }, { crumb: 2 }, { crumb: 3 }];
         model.setHoveredItem(fakeCrumbs);
         assert.strictEqual(model.getHoveredItem(), fakeCrumbs[2]);

         // does not fail when hover is removed
         model.setHoveredItem(null);
         assert.isNull(model.getHoveredItem());
      });
   });
});
