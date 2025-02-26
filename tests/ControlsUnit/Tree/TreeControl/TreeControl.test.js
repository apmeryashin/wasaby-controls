define([
   'Controls/tree',
   'Controls/treeGrid',
   'Controls/list',
   'Core/Deferred',
   'Core/core-merge',
   'Core/core-instance',
   'Env/Env',
   'Types/collection',
   'Types/source',
   'Controls/Application/SettingsController',
   'Controls/listDragNDrop',
   'Controls/dataSource',
   'ControlsUnit/CustomAsserts',
   'Types/entity'
], function(
   tree,
   treeGrid,
   listMod,
   Deferred,
   cMerge,
   cInstance,
   Env,
   collection,
   sourceLib,
   SettingsController,
   listDragNDrop,
   dataSource,
   asserts,
   entity
) {
   function correctCreateTreeControl(cfg, returnCreatePromise) {
      var
         treeControl,
         createPromise,
         cfgTreeControl = cfg;

      if (!cfg.hasOwnProperty('viewModelConstructor')) {
         cfgTreeControl = cMerge(cfg, {
            viewModelConstructor: 'Controls/treeGrid:TreeGridCollection'
         });
      }

      cfgTreeControl = Object.assign(tree.TreeControl.getDefaultOptions(), cfgTreeControl);
      // Костыль с получением данных из источника по приватному полю
      // Т.к. сейчас все тесты ожидают построение по источнику, а не по sourceController'у
      // Единственный способ оживить массово тесты
      if (cfgTreeControl.source && !cfgTreeControl.sourceController) {
         cfgTreeControl.sourceController = new dataSource.NewSourceController({
            source: cfgTreeControl.source,
            navigation: cfgTreeControl.navigation,
            expandedItems: cfgTreeControl.expandedItems,
            root: cfgTreeControl.root,
            keyProperty: cfgTreeControl.keyProperty || (cfgTreeControl.source && cfgTreeControl.source.getKeyProperty()),
            nodeLoadCallback: cfgTreeControl.nodeLoadCallback
         });

         if (cfgTreeControl.source._$data) {
            cfgTreeControl.sourceController.setItems(new collection.RecordSet({
               rawData: cfgTreeControl.source._$data
            }));
         }
      }
      treeControl = new tree.TreeControl(cfgTreeControl);
      treeControl._children = {};
      treeControl.saveOptions(cfgTreeControl);
      createPromise = treeControl._beforeMount(cfgTreeControl);

      if (returnCreatePromise) {
         return {
            treeControl,
            createPromise
         };
      } else {
         return treeControl;
      }
   }

   async function correctCreateTreeControlAsync(cfg) {
      let cloneCfg = {...cfg};
      if (cloneCfg.source) {
         cloneCfg.sourceController = new dataSource.NewSourceController({
            source: cloneCfg.source,
            navigation: cloneCfg.navigation,
            expandedItems: cloneCfg.expandedItems,
            parentProperty: cloneCfg.parentProperty,
            root: cloneCfg.root,
            keyProperty: cloneCfg.keyProperty || (cloneCfg.source && cloneCfg.source.getKeyProperty()),
            dataLoadCallback: cloneCfg.dataLoadCallback
         });

         await cloneCfg.sourceController.reload();
      }
      const createResult = correctCreateTreeControl(cloneCfg, true);
      await createResult.createPromise;
      return createResult.treeControl;
   }

   function getHierarchyData() {
      return [
         {id: 0, 'Раздел@': true, "Раздел": null},
         {id: 1, 'Раздел@': false, "Раздел": 0},
         {id: 2, 'Раздел@': null, "Раздел": 0},
         {id: 3, 'Раздел@': null, "Раздел": 1},
         {id: 4, 'Раздел@': null, "Раздел": null}
      ];
   }

   describe('Controls.tree.TreeControl', function() {
      it('TreeControl creating with expandedItems', async function() {
         let loadResult;
         const treeControlConfig = {
            columns: [],
            source: new sourceLib.Memory({
               data: [{
                  id: 111,
                  parent: null
               },
                  {
                     id: 111111,
                     parent: 111
                  },
                  {
                     id: 777,
                     parent: null
                  },
                  {
                     id: 777777,
                     parent: 777
                  }],
               keyProperty: 'id',
               filter: function(item, filter) {
                  for (var i = 0; i < filter.parent.length; i++) {
                     if (item.get('parent') === filter.parent[i]) {
                        return true;
                     }
                  }
                  return false;
               }
            }),
            expandedItems: [777],
            keyProperty: 'id',
            parentProperty: 'parent',
            dataLoadCallback: function(items) {
               loadResult = items;
            }
         };
         await correctCreateTreeControlAsync(treeControlConfig);
         assert.deepEqual(loadResult.getRawData(), [{
            id: 111,
            parent: null
         },
            {
               id: 777,
               parent: null
            },
            {
               id: 777777,
               parent: 777
            }], 'Invalid items value after reload with expandedItems');
      });

      it('TreeControl._private.toggleExpanded', async function() {
         var
            nodeLoadCallbackCalled = false,
            treeControl = correctCreateTreeControl({
               columns: [],
               source: new sourceLib.Memory({
                  data: [],
                  keyProperty: 'id'
               }),
               nodeLoadCallback: function() {
                  nodeLoadCallbackCalled = true;
               },
               navigation: {
                  source: 'page',
                  sourceConfig: {
                     pageSize: 10,
                     page: 0,
                     hasMore: true
                  }
               }
            });
         var isSourceControllerUsed = false;

         //viewmodel moch
         treeControl._listViewModel = {
            getExpandedItems: function() {
               return [1];
            },
            setExpandedItems: function() {},
            setCollapsedItems: function() {},
            toggleExpanded: function(){},
            isExpandAll: function() {
               return false;
            },
            resetExpandedItems: function() {},
            isExpanded: function() {
               return false;
            },
            getChildren: function() {
               return [{
                  getContents: () => ({
                     getKey: () => 1
                  })
               }];
            },
            getIndexByKey: function() {

            },
            getRoot: function() {},
            getCount: function(){
               return 2;
            },
            setHasMoreStorage: function() {},
            getHasMoreStorage: function() {return {
               '1': false
            }},
            appendItems: function() {},
            mergeItems: function() {},
            getItemBySourceKey: () => ({
               setExpanded: () => null,
               isRoot: () => false
            }),
            getCollection: () => new collection.RecordSet(),
            getChildrenByRecordSet: () => false
         };
         treeControl._expandController.updateOptions({model: treeControl._listViewModel});

         treeControl.getVirtualScroll = function(){
            return {
               ItemsCount: 0,
               updateItemsIndexesOnToggle: function() {
               }
            };
         };
         const originLoad = treeControl.getSourceController().load;
         treeControl.getSourceController().load = function() {
            isSourceControllerUsed = true;
            return originLoad.apply(this, arguments);
         };

         treeControl.getSourceController().hasMoreData = function() {
            return false;
         };

         treeControl.getSourceController().hasLoaded = function(key) {
            return key === 1;
         };
         // Test
         await tree.TreeControl._private.toggleExpanded(treeControl, {
            getContents: () => ({
               getKey: () => 1
            }),
            isRoot: () => false,
            isExpanded: () => false
         });
         assert.isFalse(isSourceControllerUsed);
         assert.isFalse(nodeLoadCallbackCalled);

         await tree.TreeControl._private.toggleExpanded(treeControl, {
            getContents: () => ({
               getKey: () => 2
            }),
            isRoot: function() {
               return false;
            },
            isExpanded: () => false
         });
         assert.isTrue(isSourceControllerUsed);
         assert.isTrue(nodeLoadCallbackCalled);
      });
      it('expandMarkedItem', async function() {
         var
            toggleExpandedStack = [],
            rawData =  [{
               key: 1,
               parent: null,
               type: true
            }, {
               key: 2,
               parent: null,
               type: false
            }, {
               key: 3,
               parent: null,
               type: null
            }],
            cfg = {
               columns: [],
               source: new sourceLib.HierarchicalMemory({
                  data: rawData,
                  keyProperty: 'key'
               }),
               keyProperty: 'key',
               nodeProperty: 'type',
               parentProperty: 'parent',
               markerVisiblity: 'visible'
            },
            treeControl = await correctCreateTreeControlAsync(cfg);
         treeControl.toggleExpanded = function(key) {
            toggleExpandedStack.push(key);
         };
         var model = treeControl.getViewModel();
         model.setCollection(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'key'
         }), cfg);
         treeControl.setMarkedKey(1);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         treeControl.setMarkedKey(2);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         treeControl.setMarkedKey(3);
         tree.TreeControl._private.expandMarkedItem(treeControl);
         assert.deepEqual(toggleExpandedStack, [1, 2]);
      });

      it('_private.shouldLoadChildren', async function() {
         let treeControl;
         const
            source = new sourceLib.Memory({
               keyProperty: 'id',
               data: [
                  {
                     id: 'leaf',
                     title: 'Leaf',
                     parent: null,
                     nodeType: null,
                     hasChildren: false
                  },
                  {
                     id: 'node_has_loaded_children',
                     title: 'Has Loaded Children',
                     parent: null,
                     nodeType: true,
                     hasChildren: true
                  },
                  {
                     id: 'node_has_unloaded_children',
                     title: 'Has Unloaded Children',
                     parent: null,
                     nodeType: true,
                     hasChildren: true
                  },
                  {
                     id: 'node_has_no_children',
                     title: 'Has No Children',
                     parent: null,
                     nodeType: true,
                     hasChildren: false
                  },
                  {
                     id: 'leaf_2',
                     title: 'Leaf 2',
                     parent: 'node_has_loaded_children',
                     nodeType: null,
                     hasChildren: false
                  },
                  {
                     id: 'leaf_3',
                     title: 'Leaf 3',
                     parent: 'node_has_unloaded_children',
                     nodeType: null,
                     hasChildren: false
                  }
               ],
               filter: function(item, where) {
                  if (!where.parent) {
                     // Эмулируем метод БЛ, который по запросу корня возвращает еще и подзаписи родителя
                     // с ключом node_has_loaded_children
                     return !item.get('parent') || item.get('parent') === 'node_has_loaded_children';
                  }
                  return item.get('parent') === where.parent;
               }
            }),
            originalQuery = source.query;
         source.query = function() {
            return originalQuery.apply(this, arguments).addCallback(function(items) {
               let moreDataRs = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: [
                     {
                        id: 'node_has_loaded_children',
                        nav_result: false
                     },
                     {
                        id: 'node_has_no_children',
                        nav_result: true
                     }
                  ]
               });
               let rawData = items.getRawData();
               rawData.meta.more = moreDataRs;
               items.setRawData(rawData);
               return items;
            });
         };
         const treeControlConfig = {
            columns: [],
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            hasChildrenProperty: 'hasChildren',
            source: source,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 10,
                  page: 0,
                  hasMore: true
               }
            }
         };
         const shouldLoadChildrenResult = {
            'node_has_loaded_children': false,
            'node_has_unloaded_children': true,
            'node_has_no_children': false
         };

         treeControl = await correctCreateTreeControlAsync(treeControlConfig);

         for (const nodeKey in shouldLoadChildrenResult) {
            const
                expectedResult = shouldLoadChildrenResult[nodeKey];
            assert.strictEqual(
                tree.TreeControl._private.shouldLoadChildren(treeControl, nodeKey),
                expectedResult,
                '_private.shouldLoadChildren returns unexpected result for ' + nodeKey
            );
         }
      });

      it('_private.shouldLoadChildren without navigation', async function() {
         let treeControl;
         const
             source = new sourceLib.Memory({
                keyProperty: 'id',
                data: [
                   {
                      id: 'leaf',
                      parent: 'node',
                      nodeType: null,
                      hasChildren: false
                   },

                   {
                      id: 'node',
                      parent: null,
                      nodeType: true,
                      hasChildren: false
                   }
                ],
                filter: function() {
                   return true;
                }
             });
         const treeControlConfig = {
            columns: [],
            parentProperty: 'parent',
            nodeProperty: 'nodeType',
            hasChildrenProperty: 'hasChildren',
            source: source
         };

         treeControl = await correctCreateTreeControlAsync(treeControlConfig);
         assert.isFalse(tree.TreeControl._private.shouldLoadChildren(treeControl, 'node'));
      });

      it('toggleExpanded does not load if shouldLoadChildren===false', function() {
         const
            treeControl = correctCreateTreeControl({
               columns: [],
               root: null,
               sorting: [{sortField: 'DESC'}],
               source: new sourceLib.Memory({
                  data: [],
                  keyProperty: 'id'
               })
            }),
            originalCreateSourceController = tree.TreeControl._private.createSourceController,
            originalShouldLoadChildren = tree.TreeControl._private.shouldLoadChildren,
            fakeDispItem = {
               getContents: function() {
                  return {
                     getKey: function() {
                        return 1;
                     }
                  };
               },
               isRoot: function() {
                  return false;
               },
               isExpanded: () => false
            };

         let loadedDataFromServer = false;

         tree.TreeControl._private.createSourceController = function() {
            return {
               load: function() {
                  loadedDataFromServer = true;
                  return Deferred.success([]);
               },
               hasMoreData: function () {
                  return false;
               }
            };
         };

         tree.TreeControl._private.shouldLoadChildren = function() {
            return false;
         };

         tree.TreeControl._private.toggleExpanded(treeControl, fakeDispItem);

         tree.TreeControl._private.createSourceController = originalCreateSourceController;
         tree.TreeControl._private.shouldLoadChildren = originalShouldLoadChildren;

         assert.isFalse(loadedDataFromServer);
         assert.isTrue(treeControl._expandController.isItemExpanded(fakeDispItem.getContents().getKey()));
      });

      // it('TreeControl.reload', async function() {
      //    var createControlResult = correctCreateTreeControl({
      //         parentProperty: '',
      //         columns: [],
      //          source: new sourceLib.Memory({
      //             data: [],
      //             keyProperty: 'id'
      //          })
      //       }, true);
      //    var vmHasMoreStorage = null;
      //
      //    //viewmodel moch
      //    createControlResult.treeControl._listViewModel = {
      //          setHasMoreStorage: function (hms) {
      //             vmHasMoreStorage = hms;
      //          },
      //          getHasMoreStorage: () => {
      //             return {};
      //          },
      //          getExpandedItems: function() {
      //             return [1];
      //          },
      //          isExpandAll: function() {
      //             return false;
      //          },
      //          resetExpandedItems: function() {
      //
      //          },
      //          getRoot: function() {},
      //          getItems: function() {
      //             return {
      //                at: function () {}
      //             };
      //          },
      //          getItemBySourceKey: () => undefined
      //    };
      //
      //    await createControlResult.createPromise;
      //    await createControlResult.treeControl.reload();
      //    assert.deepEqual({1: false}, vmHasMoreStorage);
      // });

      it('TreeControl.afterReloadCallback resets expanded items and hasMoreStorage on set root', function () {
         const source = new sourceLib.Memory({
            data: [],
            idProperty: 'id'
         });
         const treeControl = correctCreateTreeControl({
            columns: [],
            root: null,
            parentProperty: 'testParentProperty',
            source: source
         });
         const treeViewModel = treeControl.getViewModel();
         let modelRoot;

         // Mock TreeViewModel and TreeControl

         treeControl._model = {
            setFilter: () => undefined,
            getCollapsedGroups: () => undefined,
            unsubscribe: () => {},
            destroy: () => {},
            getKeyProperty: () => 'id',
            setRoot: (root) => {
               modelRoot = root;
            },
            getRoot: () => modelRoot,
            getCount: () => 1,
            getItemBySourceKey: () => undefined
         };

         treeControl._needResetExpandedItems = true;
         treeControl._afterReloadCallback(treeControl._options);
         assert.deepEqual([], treeViewModel.getExpandedItems());
         assert.deepEqual({}, treeViewModel.getHasMoreStorage());
      });

      describe('List navigation', function() {
         var stubScrollToItem;

         before(function() {
            stubScrollToItem = sinon.stub(listMod.BaseControl._private, 'scrollToItem');
            stubScrollToItem.callsFake(function() {
               // mock function working with DOM
            });
         });

         after(function() {
            stubScrollToItem.restore();
            stubScrollToItem = undefined;
         });

         it('by keys', async function() {
            var
               stopImmediateCalled = false,

               lnSource = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: [
                     { id: 1, type: true, parent: null },
                     { id: 2, type: true, parent: 1 }
                  ]
               }),
               lnCfg = {
                  viewName: 'Controls/List/TreeGridView',
                  source: lnSource,
                  keyProperty: 'id',
                  parentProperty: 'parent',
                  nodeProperty: 'type',
                  columns: [],
                  viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
                  navigation: {
                     source: 'page',
                     sourceConfig: {
                        pageSize: 2,
                        page: 0,
                        hasMore: false
                     }
                  }
               },
               lnTreeControl = await correctCreateTreeControlAsync(lnCfg);

            assert.deepEqual([], lnTreeControl._expandController.getExpandedItems());

            await lnTreeControl.setMarkedKey(1);

            return new Promise((resolve) => {
               setTimeout(async function() {
                  assert.deepEqual([], lnTreeControl._expandController.getExpandedItems());

                  await lnTreeControl.setMarkedKey(1);

                  lnTreeControl._onTreeViewKeyDown({
                     stopImmediatePropagation: function() {
                        stopImmediateCalled = true;
                     },
                     target: {closest() { return false; }},
                     nativeEvent: {
                        keyCode: Env.constants.key.right
                     }
                  });
                  setTimeout(function () {
                     assert.deepEqual([1], lnTreeControl._expandController.getExpandedItems());

                     lnTreeControl._onTreeViewKeyDown({
                        stopImmediatePropagation: function() {
                           stopImmediateCalled = true;
                        },
                        target: {closest() { return false; }},
                        nativeEvent: {
                           keyCode: Env.constants.key.left
                        }
                     });
                     assert.deepEqual([], lnTreeControl._expandController.getExpandedItems());

                     assert.isTrue(stopImmediateCalled, 'Invalid value "stopImmediateCalled"');
                     resolve();
                  }, 10);
               }, 10);
            });
         });
      });
      it('TreeControl._beforeUpdate name of property', function() {
         return new Promise(async(resolve, reject) => {
            var
               source = new sourceLib.Memory({
                  data: [
                     { id: 1, type: true, parentKey: null },
                     { id: 2, type: true, parentKey: null },
                     { id: 11, type: null, parentKey: 1 }
                  ],
                  keyProperty: 'id'
               }),
               treeControl = await correctCreateTreeControlAsync({
                  columns: [],
                  source: source,
                  items: new collection.RecordSet({
                     rawData: [],
                     keyProperty: 'id'
                  }),
                  keyProperty: 'id',
                  parentProperty: 'parent',
                  nodeProperty: 'type'
               }),
               treeGridViewModel = treeControl.getViewModel();
            setTimeout(() => {
               const newOptions = {
                  viewModelConstructor: treeControl._options.viewModelConstructor,
                  root: 'testRoot',
                  parentProperty: 'parentKey',
                  nodeProperty: 'itemType',
                  multiSelectVisibility: 'hidden',
                  selectedKeys: [],
                  excludedKeys: [],
                  selectionType: 'all',
                  hasChildrenProperty: 'hasChildren',
                  source: source
               };
               treeControl._sourceController.updateOptions(newOptions);
               treeControl._beforeUpdate(newOptions);
               try {
                  assert.equal(treeGridViewModel.getParentProperty(), 'parentKey');
                  assert.equal(treeGridViewModel.getNodeProperty(), 'itemType');
                  assert.equal(treeGridViewModel.getHasChildrenProperty(), 'hasChildren');
                  resolve();
               } catch (e) {
                  reject(e);
               }
            }, 10);
         });
      });
      describe('propStorageId', function() {
         let origSaveConfig = SettingsController.saveConfig;
         afterEach(() => {
            SettingsController.saveConfig = origSaveConfig;
         });
         it('saving sorting', async function() {
            var saveConfigCalled = false;
            SettingsController.saveConfig = function() {
               saveConfigCalled = true;
            };
            var source = new sourceLib.Memory({
               data: [],
               keyProperty: 'id'
            });
            var cfg = {
               columns: [],
               viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
               source: source,
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               keyProperty: 'id',
               parentProperty: 'parent',
               sorting: [1],
               selectedKeys: [],
               excludedKeys: []
            };
            var cfg1 = {...cfg, propStorageId: '1'};
            cfg1.sorting = [2];
            var treeControl = await correctCreateTreeControlAsync(({...cfg}));
            treeControl.saveOptions(cfg);
            treeControl._beforeUpdate(cfg);
            assert.isFalse(saveConfigCalled);
            treeControl._beforeUpdate({...cfg, sorting: [3]});
            assert.isFalse(saveConfigCalled);
            treeControl._beforeUpdate(cfg1);
            assert.isTrue(saveConfigCalled);

         });
      });

      describe('_beforeUpdate', () => {
         it('_beforeUpdate with new expandedItems', async () => {
            let options = {
               expandedItems: [],
               keyProperty: 'id',
               source: new sourceLib.Memory()
            };
            const treeControl = await correctCreateTreeControlAsync(options);
            delete treeControl._expandController._options.loader;

            options = {...treeControl._options};
            options.expandedItems = ['testId'];
            treeControl._beforeUpdate(options);
            assert.deepStrictEqual(treeControl._options.sourceController.getExpandedItems(), ['testId']);
         });

         it('_afterReloadCallback called after data loaded by sourceController', async () => {
            const source = new sourceLib.Memory();
            const items = new collection.RecordSet({
               rawData: [],
               idProperty: 'id'
            });
            const sourceController = new dataSource.NewSourceController({
               source: 'id'
            });
            sourceController.setItems(items);
            let cfg = {
               columns: [],
               source,
               sourceController,
               root: 'test',
               keyProperty: 'id',
               selectionType: 'all'
            };
            let afterReloadCallbackCalled = false;
            const treeCreateObject = correctCreateTreeControl(cfg, true);
            const treeControl = treeCreateObject.treeControl;
            await treeControl.createPromise;

            cfg = {...cfg};
            cfg.source = new sourceLib.Memory();
            treeControl.saveOptions(cfg);
            treeControl._afterReloadCallback = () => {
                afterReloadCallbackCalled = true;
            };
            treeControl._beforeUpdate(cfg);
            await sourceController.reload();
            assert.isTrue(afterReloadCallbackCalled);
         });

      });

      it('TreeControl._private.prepareHasMoreStorage', function() {
         const sourceController = new dataSource.NewSourceController({
            source: new sourceLib.Memory(),
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0,
                  hasMore: true
               }
            }
         });
         const recordSet = new collection.RecordSet({});
         const moreDataRecordSet = new collection.RecordSet({
            keyProperty: 'id',
            rawData: [
               {
                  id: 1,
                  nav_result: true
               },
               {
                  id: 2,
                  nav_result: false
               }
            ]
         });
         recordSet.setMetaData({ more: moreDataRecordSet });
         sourceController._updateQueryPropertiesByItems(recordSet);
         const hasMoreResult = {
            1: {
               forward: true,
               backward: false
            },
            2: {
               forward: false,
               backward: false
            }
         };
         assert.deepEqual(hasMoreResult, tree.TreeControl._private.prepareHasMoreStorage(sourceController, [1, 2]),
            'Invalid value returned from "prepareHasMoreStorage(sourceControllers)".');
      });

      it('TreeControl._private.loadNodeChildren', async function () {
         let dataLoadCallbackCalled = false;
         const options = {
            filter: {
               testParam: 11101989
            },
            dataLoadCallback: function () {
               dataLoadCallbackCalled = true;
            },
            sorting: [{'test': 'ASC'}],
            parentProperty: 'parent',
            uniqueKeys: true,
            source: new sourceLib.Memory()
         };
         options.sourceController = new dataSource.NewSourceController({...options});
         options.sourceController.setItems(new collection.RecordSet());
         var
             hasMore = false,
             loadNodeId,
             loadMoreDirection,
             mockedTreeControlInstance = {
                _options: options,
                _expandController: {
                   getExpandedItems: () => ([1])
                },
                _indicatorsController: {
                   displayGlobalIndicator: () => null,
                   shouldHideGlobalIndicator: () => null,
                   hideGlobalIndicator: () => null
                },
                _displayGlobalIndicator: () => null,
                _listViewModel: {
                   setHasMoreStorage: function (hasMoreStorage) {
                      hasMore = hasMoreStorage;
                   },
                   getExpandedItems: () => [1],
                   getCollection: () => new collection.RecordSet()
                },
                stopBatchAdding() {
                },
                getSourceController() {
                   return {
                      load: (direction, key) => {
                         loadNodeId = key;
                         loadMoreDirection = direction;
                         return options.sourceController.load(direction, key);
                      },
                      hasMoreData: () => true
                   };
                }
             },
             dispItem = {
                getContents: function () {
                   return {
                      getId: function () {
                         return 1;
                      }
                   };
                }
             };
         dataLoadCallbackCalled = false;
         await tree.TreeControl._private.loadNodeChildren(mockedTreeControlInstance, dispItem.getContents().getId());
         assert.deepEqual({
                testParam: 11101989
             }, mockedTreeControlInstance._options.filter,
             'Invalid value "filter" after call "TreeControl._private.loadNodeChildren(...)".');
         // assert.deepEqual(hasMore, {1: true}); Не вызовется т.к. криво замокан триКонтрол
         assert.equal(loadNodeId, 1);
         assert.equal(loadMoreDirection, 'down');
      });

      describe('EditInPlace', function() {
         it('cancelEdit on change root', async function () {
            const options = {
               columns: [],
               source: new sourceLib.Memory(),
               items: new collection.RecordSet({
                  rawData: [],
                  idProperty: 'id'
               }),
               root: 'test',
               selectionType: 'all',
               selectedKeys: [],
               excludedKeys: [],
               keyProperty: 'id',
               viewModelConstructor: 'Controls/treeGrid:TreeGridCollection'
            };
            const newOptions1 = {
               ...options,
               root: 'test2'
            };
            const newOptions2 = {
               ...options,
               root: 'test3'
            };
            let cancelEditCalled = false;
            const treeControl = await correctCreateTreeControlAsync({...options, editingConfig: undefined});
            treeControl.cancelEdit = () => {
               cancelEditCalled = true;
            };

            treeControl.isEditing = () => true;
            treeControl._beforeUpdate({ ...newOptions1 });
            assert.isTrue(cancelEditCalled);
            cancelEditCalled = false;
            treeControl.saveOptions({ ...newOptions1 });

            treeControl.isEditing = () => false;
            treeControl._beforeUpdate({ ...newOptions2 });
            assert.isFalse(cancelEditCalled);
         });
      });

      it('All items collapsed after reload', async function() {
         var
            treeControl = await correctCreateTreeControlAsync({
               expandedItems: [2246, 452815, 457244, 471641],
               columns: [],
               source: new sourceLib.Memory(),
               items: new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               }),
               keyProperty: 'id'
            });
         treeControl.reload();
         assert.deepEqual([2246, 452815, 457244, 471641], treeControl.getViewModel().getExpandedItems());
      });

      it('expandedItems binding 2', async function(){
         const _cfg = {
            source: new sourceLib.Memory({
               data: [
                  { id: 1, type: true, parent: null },
                  { id: 2, type: true, parent: null },
                  { id: 11, type: null, parent: 1 }
               ],
               keyProperty: 'id'
            }),
            columns: [],
            selectionType: 'all',
            selectedKeys: [],
            excludedKeys: [],
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'type',
         };
         const treeControl = await correctCreateTreeControlAsync(_cfg);
         const treeGridViewModel1 = treeControl.getViewModel();

         assert.deepEqual([], treeGridViewModel1.getExpandedItems(), 'wrong expandedItems');

         await treeControl.toggleExpanded(1);
         treeControl._beforeUpdate({..._cfg, viewModelConstructor: treeControl._viewModelConstructor});
         assert.deepEqual([1], treeGridViewModel1.getExpandedItems(), 'wrong expandedItems after _breforeUpdate');
      });

      it('collapsedItems bindind', async function(){
         // collapsedItems задана, и после обновления контрола, должна соответствовать начальной опции
         const _cfg = {
            source: new sourceLib.Memory({
               data: [
                  { id: 1, type: true, parent: null },
                  { id: 2, type: true, parent: null },
                  { id: 11, type: null, parent: 1 }
               ],
               keyProperty: 'id'
            }),
            columns: [],
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'type',
            expandedItems: [null],
            collapsedItems: [],
            selectionType: 'all',
            selectedKeys: [],
            excludedKeys: []
         };
         const treeControl = await correctCreateTreeControlAsync(_cfg);
         const treeGridViewModel1 = treeControl.getViewModel();

         assert.deepEqual([], treeGridViewModel1.getCollapsedItems(), 'wrong collapsedItems');

         await treeControl.toggleExpanded(1);
         treeControl._beforeUpdate({ ..._cfg, viewModelConstructor: treeControl._viewModelConstructor });
         assert.deepEqual([], treeControl.getViewModel().getCollapsedItems(),'wrong collapsedItems after _breforeUpdate');
      });
      it('markItemByExpanderClick true', function() {
         var
            savedMethod = tree.TreeControl._private.toggleExpanded,
            rawData = [
               { id: 1, type: true, parent: null },
               { id: 2, type: true, parent: null },
               { id: 11, type: null, parent: 1 }
            ],
            source = new sourceLib.Memory({
               rawData: rawData,
               keyProperty: 'id'
            }),
            sourceController = new dataSource.NewSourceController({
               source: source,
               keyProperty: 'id'
            }),
            cfg = {
               source: source,
               markerVisibility: 'visible',
               columns: [],
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               markItemByExpanderClick: true
            },
            e = {
               nativeEvent: {
                  buttons: 1,
                  button: 0
               },
               stopImmediatePropagation: function(){}
            },
            treeControl = new tree.TreeControl(cfg),
            treeGridViewModel = new treeGrid.TreeGridCollection(cMerge(cfg, {
               root: null,
               collection: new collection.RecordSet({
                  rawData: rawData,
                  keyProperty: 'id'
               })
            }));
         sourceController.setItems(new collection.RecordSet({
            rawData: rawData,
            keyProperty: 'id'
         }));
         treeControl.saveOptions(cfg);

         treeControl._listViewModel = treeGridViewModel;
         treeControl.isLoading = () => false;

         tree.TreeControl._private.toggleExpanded = function(){};

         treeControl._mouseDownExpanderKey = 1;
         treeControl._onExpanderMouseUp(e.nativeEvent, 1, treeGridViewModel.at(0));
         assert.isTrue(treeGridViewModel.at(0).isMarked());

         treeControl._mouseDownExpanderKey = 2;
         treeControl._onExpanderMouseUp(e.nativeEvent, 2, treeGridViewModel.at(1));
         assert.isTrue(treeGridViewModel.at(1).isMarked());

         tree.TreeControl._private.toggleExpanded = savedMethod;
      });

      it('markItemByExpanderClick false', function() {

         var
            savedMethod = tree.TreeControl._private.toggleExpanded,
            baseControlFocused = false,
            rawData = [
               { id: 1, type: true, parent: null },
               { id: 2, type: true, parent: null },
               { id: 11, type: null, parent: 1 }
            ],
            source = new sourceLib.Memory({
               rawData: rawData,
               keyProperty: 'id'
            }),
            cfg = {
               source: source,
               columns: [],
               collection: new collection.RecordSet({
                  rawData: rawData,
                  keyProperty: 'id'
               }),
               root: null,
               markerVisibility: 'visible',
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               markItemByExpanderClick: false
            },
            e = {
               nativeEvent: {
                  buttons: 1,
                  button: 0
               },
               stopImmediatePropagation: function(){}
            },
            treeControl = new tree.TreeControl(cfg),
            treeGridViewModel = new treeGrid.TreeGridCollection(cfg),
            expectedMarkedKey = 1;
         treeControl.saveOptions(cfg);

         treeControl._children = {
            baseControl: {
               getViewModel: function() {
                  return treeGridViewModel;
               },
               setMarkedKey(key) {
                  assert.equal(key, expectedMarkedKey);
               },
               isLoading: () => false
            }
         };

         tree.TreeControl._private.toggleExpanded = function(){};

         treeControl._mouseDownExpanderKey = 0;
         treeControl._onExpanderMouseUp(e.nativeEvent, 0, treeGridViewModel.at(0));

         treeControl._mouseDownExpanderKey = 1;
         treeControl._onExpanderMouseUp(e.nativeEvent, 1, treeGridViewModel.at(1));

         tree.TreeControl._private.toggleExpanded = savedMethod;
      });


      it('don\'t toggle node by click if handler returns false', async function() {
         const treeControlConfig = {
            source: new sourceLib.Memory({
               data: [
                  { id: 1, type: true, parent: null },
                  { id: 2, type: true, parent: null }
               ],
               keyProperty: 'id'
            }),
            columns: [],
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'type'
         };
         const treeControl = await correctCreateTreeControlAsync(treeControlConfig);
         const model = treeControl.getViewModel();
         treeControl._notify = (eName) => {
            if (eName === 'itemClick') {
               return false;
            }
         };

         // Initial
         assert.deepEqual(model.getExpandedItems(), []);

         const fakeEvent = {
            stopPropagation: () => {},
            isStopped: () => {}
         };
         const origin = {
            target: {
               closest: () => {}
            }
         };

         treeControl._notifyItemClick([fakeEvent, model.at(0).getContents(), origin]);
         assert.deepEqual(model.getExpandedItems(), []);

         treeControl._notifyItemClick([fakeEvent, model.at(1).getContents(), origin]);
         assert.deepEqual(model.getExpandedItems(), []);
      });

      it('don\'t toggle node by click on breadcrumbs', async function() {
         const savedMethod = tree.TreeControl._private.createSourceController;
         const data = [
            {id: 0, 'Раздел@': true, "Раздел": null},
            {id: 1, 'Раздел@': false, "Раздел": null},
            {id: 2, 'Раздел@': null, "Раздел": null}
         ];
         const source = new sourceLib.Memory({
            keyProperty: 'id',
            rawData: data,
         });
         const cfg = {
            source: source,
            columns: [{}],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            filter: {},
            expandByItemClick: true
         };
         const fakeEvent = {
            stopPropagation: () => {},
            isStopped: () => false
         };

         const treeGridViewModel = new treeGrid.TreeGridCollection(cMerge(cfg, {
            collection: new collection.RecordSet({
               rawData: data,
               keyProperty: 'id'
            }),
            root: null
         }));
         let treeControl;

         treeControl = new tree.TreeControl(cfg);
         treeControl.saveOptions(cfg);
         treeControl._listViewModel = treeGridViewModel;

         const breadcrumb = new collection.RecordSet({
            rawData: [
               {
                  id: 1,
                  title: 'Путь до его то',
                  'Раздел@': true
               }
            ],
            keyProperty: 'id'
         }).at(0);

         // Initial
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);
         treeControl._notifyItemClick([fakeEvent, breadcrumb, {
            target: { closest: () => {} }
         }]);
         assert.deepEqual(treeGridViewModel.getExpandedItems(), []);

         tree.TreeControl._private.createSourceController = savedMethod;
      });

      it('itemClick sends right args', function() {
         let isEventRaised = false;

          const data = new collection.RecordSet({
              rawData: [{ id: 1 }],
              keyProperty: 'id'
          });

          const treeControl = correctCreateTreeControl({
              source: new sourceLib.Memory({
                  data,
                  keyProperty: 'id'
              }),
              readOnly: true,
              keyProperty: 'id'
          });
          const item = data.at(0);
         const nativeEvent = {
            target: { closest: () => {} }
         };
         const event = {
            stopPropagation: () => {},
            isStopped: () => false
         };
         const columnIndex = 12;
         treeControl._notify = (eName, args) => {
            if (eName === 'itemClick') {
               isEventRaised = true;
               assert.equal(args[0], item);
               assert.equal(args[1], nativeEvent);
               assert.equal(args[2], columnIndex);
               return false;
            }
         };

         treeControl._notifyItemClick([event, item, nativeEvent, columnIndex]);
         assert.isTrue(isEventRaised);
      });

      it('goToNext, goToPrev', async function() {
         const rs = new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });
         const source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            viewModelConstructor: 'Controls/display:Tree',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            markerMoveMode: 'leaves',
            expandedItems: [],
            markedKey: 4
         };
         const treeControl = await correctCreateTreeControlAsync(cfg);
         let newCfg = {...treeControl._options};
         treeControl._notify = (event, args) => {
            if (event === 'expandedItemsChanged') {
               newCfg.expandedItems = args[0];
               treeControl.getSourceController().setExpandedItems(newCfg.expandedItems);
            }
            if (event === 'markedKeyChanged') {
               newCfg.markedKey = args[0];
            }
         };
         treeControl.getViewModel().setCollection(rs);
         treeControl._afterItemsSet(cfg);
         treeControl._afterMount();
         assert.equal(treeControl._markedLeaf, 'last');
         await treeControl.goToPrev();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'middle');
         await treeControl.goToPrev();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'first');
         await treeControl.goToNext();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'middle');
         await treeControl.goToNext();
         treeControl._beforeUpdate(newCfg);
         treeControl.saveOptions(newCfg);
         assert.equal(treeControl._markedLeaf, 'last');

         // Если не нашли элемент, значит, еще рано менять состояние.
         assert.equal(treeControl._getMarkedLeaf(-1, treeControl.getViewModel()), 'last');
      });

      describe('_notifyItemClick', async () => {
         const source = new sourceLib.Memory({
            rawData: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source: source,
            columns: [],
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            markerMoveMode: 'leaves',
            expandedItems: [],
            markedKey: 4
         };
         const treeControl = await correctCreateTreeControlAsync(cfg);

         it('not should notify itemActivate when click on expander', () => {
            const event = {
               target: {
                  closest: (s) => {
                     return s === '.js-controls-Tree__row-expander';
                  }
               },
               stopImmediatePropagation: () => null
            };
            const spyNotify = sinon.spy(treeControl._notify);

            const item = treeControl._listViewModel.getItemBySourceKey(0);
            treeControl._onItemClick({isStopped: () => false, isBubbling: () => false, stopImmediatePropagation: () => null}, item, event);
            assert.isFalse(spyNotify.withArgs('itemActivate').called);
         });
      });

      describe('toggleExpanded', () => {
         const items = new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            items,
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            viewModelConstructor: 'Controls/display:Tree',
            selectedKeys: [],
            excludedKeys: []
         };
         let treeControl, model, notifySpy;

         beforeEach(async() => {
            treeControl = await correctCreateTreeControlAsync(cfg);
            notifySpy = sinon.spy(treeControl, '_notify');
            model = treeControl.getViewModel();

            treeControl._sourceController = {
               setExpandedItems: () => null,
               getExpandedItems: () => null,
               getState: () => {
                  return {
                     parentProperty: 'Раздел'
                  };
               },
               updateOptions: () => null,
               hasLoaded: () => true,
               getKeyProperty: () => 'id',
               hasMoreData: () => false,
               isLoading: () => false,
               getLoadError: () => null,
               isDeepReload: () => false,
               wasResetExpandedItems: () => false,
               setNodeDataMoreLoadCallback: () => false
            };
         });

         it('expanded items is [null]', async() => {
            treeControl._beforeUpdate({...cfg, expandedItems: [null]});

            await treeControl.toggleExpanded(0);
            assert.isFalse(model.getItemBySourceKey(0).isExpanded());

            await treeControl.toggleExpanded(0);
            assert.isTrue(model.getItemBySourceKey(0).isExpanded());
         });

         it('check expandedItems and collapsedItems options', async() => {
            treeControl._expandController.setExpandedItems([0]);
            treeControl._expandController.applyStateToModel();
            treeControl.saveOptions({...cfg, expandedItems: [0], collapsedItems: []});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);

            treeControl._expandController.setCollapsedItems([0]);
            treeControl._expandController.applyStateToModel();
            treeControl.saveOptions({...cfg, expandedItems: [], collapsedItems: [0]});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[0]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);

            treeControl._expandController.setExpandedItems([null]);
            treeControl._expandController.setCollapsedItems([]);
            treeControl._expandController.applyStateToModel();
            treeControl.saveOptions({...cfg, expandedItems: [null], collapsedItems: []});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[null]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[0, 1]]).called);

            treeControl._expandController.setExpandedItems([null]);
            treeControl._expandController.setCollapsedItems([0]);
            treeControl._expandController.applyStateToModel();
            treeControl.saveOptions({...cfg, expandedItems: [null], collapsedItems: [0]});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);

            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[null]]).called);
            assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);
         });

         it('remove child keys from expanded items', async () => {
            treeControl._expandController.setExpandedItems([0, 1]);
            treeControl._expandController.applyStateToModel();
            treeControl.saveOptions({...cfg, expandedItems: [0, 1], collapsedItems: []});
            notifySpy.resetHistory();
            await treeControl.toggleExpanded(0);
            assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[]]).called);
         });

         it('reset flag _needResetExpandedItems', async () => {
            const source = new sourceLib.Memory({
               rawData: getHierarchyData(),
               keyProperty: 'id',
               filter: () => true
            });

            treeControl._beforeUpdate({...cfg, root: null, expandedItems: [1], source });
            treeControl.saveOptions({...cfg, root: null, expandedItems: [1], source });
            treeControl._beforeUpdate({...cfg, root: 0, expandedItems: [1], source });
            await treeControl.toggleExpanded(2);
            treeControl._beforeUpdate({...cfg, root: 0, expandedItems: [1, 2], source });
            assert.deepEqual(treeControl._expandController.getExpandedItems(), [1, 2]);
         });
      });

      describe('_getFooterSpacingClasses', () => {
         const items = new collection.RecordSet({
            rawData: getHierarchyData(),
            keyProperty: 'id'
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            items,
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            viewModelConstructor: 'Controls/display:Tree',
            selectedKeys: [],
            excludedKeys: []
         };
         let treeControl;

         it('expanderIcon is none', () => {
            const options = {...cfg, expanderIcon: 'none'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.notInclude(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });

         it('expanderVisibility is hasChildren', () => {
            const options = {...cfg, expanderVisibility: 'hasChildren'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.include(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });

         it('expanderVisibility is visible', () => {
            const options = {...cfg, expanderVisibility: 'visible'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.include(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });

         it('expanderVisibility is visible and not has node', () => {
            const items = new collection.RecordSet({
               rawData: [{id: 1, 'Раздел@': null, "Раздел": null}],
               keyProperty: 'id'
            });
            const options = {...cfg, expanderVisibility: 'visible', items};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.notInclude(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });

         it('expanderPosition is custom', () => {
            const options = {...cfg, expanderVisibility: 'visible', expanderPosition: 'custom'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.notInclude(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });

         it('expanderPosition is right', () => {
            const options = {...cfg, expanderVisibility: 'visible', expanderPosition: 'right'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.notInclude(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });

         it('expanderPosition is default', () => {
            const options = {...cfg, expanderVisibility: 'visible', expanderPosition: 'default'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.include(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });

         it('expanderPosition is undefined', () => {
            const options = {...cfg, expanderVisibility: 'visible'};
            treeControl = correctCreateTreeControl(options);
            asserts.CssClassesAssert.include(treeControl._getFooterSpacingClasses(options), 'controls-TreeGridView__expanderPadding-default');
         });
      });

      describe('expandedItems', () => {
         const source = new sourceLib.Memory({
            data: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source,
            filter: {},
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 20,
                  page: 0,
                  hasMore: false
               }
            },
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            columns: [],
            viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
            selectedKeys: [],
            excludedKeys: []
         };
         let treeControl, notifySpy;

         describe('expandedItems is [null]', () => {
            beforeEach(async() => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [null]});
               notifySpy = sinon.spy(treeControl, '_notify');
            });

            it('remove node, expandedItems and collapsed items are not changed', () => {
               const rs = treeControl.getViewModel().getCollection();
               rs.remove(rs.getRecordById(1));
               assert.isFalse(notifySpy.withArgs('expandedItemsChanged').called);
               assert.isFalse(notifySpy.withArgs('collapsedItemsChanged').called);
            });

            it('remove node when set collapsedItems', async () => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [null], collapsedItems: [1]});
               notifySpy = sinon.spy(treeControl, '_notify');

               const rs = treeControl.getViewModel().getCollection();
               rs.remove(rs.getRecordById(1));
               assert.isFalse(notifySpy.withArgs('expandedItemsChanged').called);
               assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[]]).called);
            });
         });

         describe('expanded specific items', () => {
            beforeEach(async() => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [0, 1]});
               notifySpy = sinon.spy(treeControl, '_notify');
            });

            it('remove node, expandedItems is changed', () => {
               const rs = treeControl.getViewModel().getCollection();
               rs.remove(rs.getRecordById(1));
               assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[0]]).called);
               assert.isFalse(notifySpy.withArgs('collapsedItemsChanged').called);
            });
         });

         describe('_beforeUpdate', () => {
            beforeEach(async() => {
               treeControl = await correctCreateTreeControlAsync({...cfg, expandedItems: [], collapsedItems: []});
               treeControl._expandController._options.loader = null;
            });

            it('expandedItems', () => {
               const methodSpy = sinon.spy(treeControl._expandController, 'setExpandedItems');
               treeControl._beforeUpdate({...cfg, expandedItems: [1]});
               assert.isTrue(methodSpy.withArgs([1]).called);
            });

            it('collapsedItems', () => {
               const methodSpy = sinon.spy(treeControl._expandController, 'setCollapsedItems');
               treeControl._beforeUpdate({...cfg, collapsedItems: [1]});
               assert.isTrue(methodSpy.withArgs([1]).called);
            });
         });

         describe('remove from expanded items all childs of collapsed node', () => {
            const source = new sourceLib.Memory({
               data: [
                  {id: 0, 'Раздел@': true, "Раздел": null},
                  {id: 1, 'Раздел@': false, "Раздел": 0},
                  {id: 2, 'Раздел@': false, "Раздел": 1},
                  {id: 3, 'Раздел@': false, "Раздел": 2},
                  {id: 4, 'Раздел@': false, "Раздел": 3},
                  {id: 5, 'Раздел@': false, "Раздел": 4},
                  {id: 11, 'Раздел@': null, "Раздел": 1},
                  {id: 12, 'Раздел@': null, "Раздел": 1},
               ],
               keyProperty: 'id',
               filter: () => true
            });

            it('expand specific items', async () => {
               treeControl = await correctCreateTreeControlAsync({...cfg, source, expandedItems: [0, 1, 2, 3, 4, 5]});
               notifySpy = sinon.spy(treeControl, '_notify');

               await treeControl.toggleExpanded(0);

               assert.isTrue(notifySpy.withArgs('expandedItemsChanged', [[]]).called);
            });

            it('expand all items', async () => {
               treeControl = await correctCreateTreeControlAsync({...cfg, source, expandedItems: [null]});
               notifySpy = sinon.spy(treeControl, '_notify');

               await treeControl.toggleExpanded(0);

               assert.isTrue(notifySpy.withArgs('collapsedItemsChanged', [[0, 1, 2, 3, 4, 5]]).called);
            });
         });
      });

      describe('hasMoreStorage', () => {
         const source = new sourceLib.Memory({
            data: getHierarchyData(),
            keyProperty: 'id',
            filter: () => true
         });

         // 0
         // |-1
         // | |-3
         // |-2
         // 4
         const cfg = {
            source,
            filter: {},
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 20,
                  page: 0,
                  hasMore: false
               }
            },
            keyProperty: 'id',
            parentProperty: 'Раздел',
            nodeProperty: 'Раздел@',
            columns: [],
            viewModelConstructor: 'Controls/treeGrid:TreeGridCollection',
            selectedKeys: [],
            excludedKeys: [],
            expandedItems: [null]
         };
         let treeControl;

         beforeEach(async() => {
            treeControl = await correctCreateTreeControlAsync(cfg);
         });

         it('set has more for nodes and hidden nodes', async () => {
             const localSandbox = sinon.createSandbox();
             const methodSpy = localSandbox.spy(treeControl.getViewModel(), 'setHasMoreStorage');

             localSandbox.replace(treeControl, '_resolveSourceLoadPromise', (resolver) => {
                 resolver();
             });
             await treeControl.reload();
             assert.isTrue(methodSpy.withArgs({
                0: { forward: false, backward: false },
                1: { forward: false, backward: false }
             }).called);
             localSandbox.reset();
         });
      });
   });
});
