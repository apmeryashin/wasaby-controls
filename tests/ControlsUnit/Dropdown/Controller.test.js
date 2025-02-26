define(
   [
      'Controls/dropdown',
      'Types/source',
      'Core/core-clone',
      'Types/collection',
      'Controls/history',
      'Core/Deferred',
      'Types/entity',
      'Core/core-instance',
      'Controls/popup'
   ],
   (dropdown, sourceLib, clone, collection, history, Deferred, entity, cInstance, popup) => {
      describe('Dropdown/Controller', () => {
         let items = [
            {
               id: '1',
               title: 'Запись 1'
            },
            {
               id: '2',
               title: 'Запись 2'
            },
            {
               id: '3',
               title: 'Запись 3',
               icon: 'icon-16 icon-Admin icon-primary'
            },
            {
               id: '4',
               title: 'Запись 4'
            },
            {
               id: '5',
               title: 'Запись 5'
            },
            {
               id: '6',
               title: 'Запись 6',
               node: true
            },
            {
               id: '7',
               title: 'Запись 7'
            },
            {
               id: '8',
               title: 'Запись 8'
            }
         ];

         let itemsRecords = new collection.RecordSet({
            keyProperty: 'id',
            rawData: clone(items)
         });

         let config = {
            selectedKeys: [2],
            keyProperty: 'id',
            emptyText: true,
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            }),
            nodeProperty: 'node',
            itemTemplateProperty: 'itemTemplate'
         };

         let configLazyLoad = {
            lazyItemsLoading: true,
            selectedKeys: [2],
            keyProperty: 'id',
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            })
         };

         let getDropdownController = function(config) {
            let dropdownCntroller = new dropdown._Controller(config);
            return dropdownCntroller;
         };

         let sandbox;

         beforeEach(function() {
            sandbox = sinon.createSandbox();
         });

         afterEach(function() {
            sandbox.restore();
         });
         it('_onPinClickHandler', function() {
            let actualMeta;
            let newOptions = clone(config);
            const source = new history.Source({
               originSource: new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               }),
               historySource: new history.Service({
                  historyId: 'TEST_HISTORY_ID'
               }),
               parentProperty: 'parent'
            });
            source.update = function(item, meta) {
               actualMeta = meta;
               item.set('pinned', true);
               return Deferred.success(false);
            };

            let dropdownController = getDropdownController(newOptions);
            dropdownController._source = source;
            let expectedItem = new entity.Model({
               rawData: {
                  pinned: false,
                  copyOriginalId: '1'
               }
            });
            dropdownController.pinClick(expectedItem);
            assert.isTrue(expectedItem.get('pinned'));
            assert.deepEqual(actualMeta, { '$_pinned': true });
         });

         it('reload', function() {
            let newOptions = clone(config);
            const newItems = [
               {
                  id: '1',
                  title: 'Тест 1'
               },
               {
                  id: '2',
                  title: 'Тест 2'
               }
            ];
            const newSource = new sourceLib.Memory({
               keyProperty: 'id',
               data: newItems
            });

            let dropdownController = getDropdownController(newOptions);
            dropdownController._options.source = newSource;
            dropdownController.reload().then(()=> {
               assert.deepEqual(dropdownController._items.at(0).get('title'), 'Тест 1');
            });
         });

         it('handleClose', function() {
            let newOptions = clone(config);
            let dropdownController = getDropdownController(newOptions);
            dropdownController._items = new collection.RecordSet({});
            dropdownController._options.searchParam = 'title';
            dropdownController.handleClose();
            assert.isNull(dropdownController._items);
         });

         describe('update', function() {
            let dropdownController, opened, updatedItems;
            beforeEach(function() {
               opened = false;
               dropdownController = getDropdownController(config);
               dropdownController._sticky.open = () => {opened = true;};

               updatedItems = clone(items);
               updatedItems.push({
                  id: '9',
                  title: 'Запись 9'
               });
            });

            it('new templateOptions', function() {
               dropdownController._loadItemsTempPromise = {};
               dropdownController.update({ ...config, headTemplate: 'headTemplate.wml', source: undefined });
               assert.isNull(dropdownController._loadMenuTempPromise);
               assert.isFalse(opened);

               dropdownController._open = function() {
                  opened = true;
               };

               dropdownController._isOpened = true;
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = 'testSource';
               dropdownController._sourceController = {hasMoreData: ()=>{}};
               dropdownController._options = {};
               dropdownController.update({ ...config, headTemplate: 'headTemplate.wml', source: undefined })
               assert.isTrue(opened);
            });

            it('new source', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = true;

               return new Promise((resolve) => {
                  dropdownController.update({
                     selectedKeys: [2],
                     keyProperty: 'id',
                     source: new sourceLib.Memory({
                        keyProperty: 'id',
                        data: updatedItems
                     })
                  }).addCallback(() => {
                     assert.equal(dropdownController._items.getCount(), updatedItems.length);
                     assert.isTrue(cInstance.instanceOfModule(dropdownController._source, 'Types/source:Base'));
                     assert.isFalse(opened);
                     resolve();
                  });
               });
            });

            it('new source when items is loading', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = true;
               dropdownController._sourceController = { isLoading: () => true };
               dropdownController.update({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  lazyItemsLoading: true,
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: updatedItems
                  })
               });
               assert.isTrue(dropdownController._source);
               assert.isNull(dropdownController._items);
            });

            it('new source and selectedKeys', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._source = true;

               let stub = sandbox.stub(dropdownController, '_updateSelectedItems');
               return new Promise((resolve) => {
                  dropdownController.update({
                     selectedKeys: [3],
                     keyProperty: 'id',
                     source: new sourceLib.Memory({
                        keyProperty: 'id',
                        data: updatedItems
                     })
                  }).addCallback(() => {
                     assert.equal(dropdownController._items.getCount(), updatedItems.length);
                     sinon.assert.calledOnce(stub);
                     resolve();
                  });
               });
            });
            it('new source and dropdown is open', () => {
               dropdownController._items = itemsRecords.clone();
               dropdownController._isOpened = true;
               dropdownController._sourceController = { hasMoreData: () => {}, isLoading: () => {} };
               dropdownController._open = function() {
                  opened = true;
               };
               dropdownController.update({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: updatedItems
                  })
               }).addCallback(() => {
                  assert.isTrue(opened);
               });
            });

            it('change filter', (done) => {
               let configFilter = clone(config),
                  selectedItems = [];
               configFilter.selectedKeys = ['2'];
               configFilter.selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };

               dropdownController.update({...configFilter}).addCallback(function(result) {
                  assert.deepStrictEqual(selectedItems[0].getRawData(), itemsRecords.at(1).getRawData());
                  done();
               });
            });

            it('_getLoadItemsPromise', () => {
               let errorCathed = false;
               dropdownController._items = null;
               dropdownController._loadItemsPromise = null;
               dropdownController._options.source = null;
               let promise = dropdownController._getLoadItemsPromise();

               try {
                  promise.then(() => {});
               } catch (error) {
                  errorCathed = true;
               }
               assert.isFalse(errorCathed);
            });

            it('without loaded items', () => {
               let configItems = clone(config),
                  selectedItems = [];
               configItems.selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };
               dropdownController._items = null;
               var newConfig = clone(configItems);
               newConfig.source = new sourceLib.Memory({
                  keyProperty: 'id',
                  data: items
               });
               newConfig.selectedKeys = ['4'];
               return dropdownController.update(newConfig).then(function() {
                  assert.equal(selectedItems.length, 1);
               });
            });

            it('change source, lazyItemsLoading = true', (done) => {
               dropdownController.update(configLazyLoad);
               dropdownController._sourceController = { isLoading: () => false };
               items.push({
                  id: '5',
                  title: 'Запись 11'
               });

               dropdownController.update({
                  lazyItemsLoading: true,
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  })
               });
               assert.isNull(dropdownController._sourceController);
               assert.equal(dropdownController._items, null);

               dropdownController._isOpened = true;
               dropdownController.update({
                  lazyItemsLoading: true,
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  })
               }).addCallback(function() {
                  assert.isOk(dropdownController._sourceController);
                  done();
               });
            });

            it('change selectedKeys', () => {
               let selectedItems = [];
               let selectedItemsChangedCallback = function(items) {
                  selectedItems = items;
               };
               dropdownController._items = itemsRecords.clone();
               dropdownController.update({
                  selectedKeys: [6],
                  keyProperty: 'id',
                  filter: config.filter,
                  selectedItemsChangedCallback: selectedItemsChangedCallback
               });
               assert.deepEqual(selectedItems[0].getRawData(), items[5]);
            });

            it('change readOnly', () => {
               let readOnlyConfig = clone(config),
                  isClosed = false;

               dropdownController._sticky.close = () => {isClosed = true; };
               readOnlyConfig.readOnly = true;
               dropdownController.update(readOnlyConfig);
               assert.isTrue(isClosed);
            });

            it('_reloadSelectedItems', () => {
               let isReloaded = false;
               let configSelectedKeys = clone(config);
               configSelectedKeys.navigation = true;
               configSelectedKeys.selectedKeys = ['20'];
               dropdownController._items = itemsRecords;
               dropdownController._reloadSelectedItems = () => {
                  isReloaded = true;
               };

               dropdownController.update({...configSelectedKeys});
               assert.isTrue(isReloaded);
            });
         });

         it('getItemByKey', () => {
            let dropdownController = getDropdownController(config);
            let itemsWithoutKeyProperty = new collection.RecordSet({
               rawData: items
            });

            let item = dropdownController._getItemByKey(itemsWithoutKeyProperty, '1', 'id');
            assert.equal(item.get('title'), 'Запись 1');

            item = dropdownController._getItemByKey(itemsWithoutKeyProperty, 'anyTestId', 'id');
            assert.isUndefined(item);
         });

         it('loadDependencies', async() => {
            const controller = getDropdownController(config);
            let items;
            let menuSource;

            await controller.loadDependencies();
            items = controller._items;
            menuSource = controller._menuSource;

            await controller.loadDependencies();
            assert.isTrue(items === controller._items, 'items changed on second loadDependencies with same options');
            assert.isTrue(menuSource === controller._menuSource, 'source changed on second loadDependencies with same options');
         });

         it('loadDependencies, loadItemsTemplates', async() => {
            let actualOptions;
            const controller = getDropdownController(config);

            sandbox.replace(controller, '_loadItemsTemplates', (options) => {
               actualOptions = options;
               return Promise.resolve(true);
            });

            // items not loaded, loadItemsTemplates was called
            await controller.loadDependencies();
            assert.isOk(actualOptions);

            // items already loaded, loadItemsTemplates was called
            actualOptions = null;
            await controller.loadDependencies();
            assert.isOk(actualOptions);
         });

         it('loadDependencies, load rejected', async() => {
            let actualError = false;
            const controller = getDropdownController(config);

            sandbox.replace(controller, '_getLoadItemsPromise', () => {
               return Promise.resolve(true);
            });

            sandbox.replace(controller, '_loadItemsTemplates', () => {
               return Promise.resolve(true);
            });

            sandbox.replace(controller, '_loadMenuTemplates', () => {
               return Promise.reject('error');
            });

            // items is loaded, loadItemsTemplates was called
            await controller.loadDependencies().then(() => {}, (error) => {
               actualError = error;
            });
            assert.equal(actualError, 'error');
         });

         it('loadDependencies, _loadDependsPromise', async() => {
            const controller = getDropdownController(config);

            controller.loadDependencies();
            assert.isOk(controller._loadMenuTempPromise);
            assert.isOk(controller._loadDependsPromise);

            controller._loadMenuTempPromise = null;
            await controller.loadDependencies();
            assert.isNotOk(controller._loadMenuTempPromise);
         });

         it('check empty item update', () => {
            let dropdownController = getDropdownController(config),
               selectedItems = [];
            let selectedItemsChangedCallback = function(items) {
               selectedItems = items;
            };

            // emptyText + selectedKeys = [null]
            dropdownController._updateSelectedItems({
               selectedKeys: [null],
               keyProperty: 'id',
               emptyText: '123',
               emptyKey: null,
               selectedItemsChangedCallback: selectedItemsChangedCallback
            });
            assert.deepEqual(selectedItems, [null]);

            // emptyText + selectedKeys = []
            dropdownController._updateSelectedItems({
               selectedKeys: [],
               keyProperty: 'id',
               emptyText: '123',
               emptyKey: null,
               selectedItemsChangedCallback: selectedItemsChangedCallback});
            assert.deepEqual(selectedItems, [null]);

            // emptyText + selectedKeys = [] + emptyKey = 100
            dropdownController._updateSelectedItems({
               selectedKeys: [],
               keyProperty: 'id',
               emptyText: '123',
               emptyKey: 100,
               selectedItemsChangedCallback: selectedItemsChangedCallback});
            assert.deepEqual(selectedItems, [null]);

            // emptyText + selectedKeys = [123]
            dropdownController._updateSelectedItems({
               selectedKeys: [123],
               keyProperty: 'id',
               emptyText: 'text',
               selectedItemsChangedCallback: selectedItemsChangedCallback
            });
            assert.deepEqual(selectedItems, [null]);

            // emptyText + selectedKeys = [undefined] (combobox)
            dropdownController._updateSelectedItems({
               selectedKeys: [undefined],
               keyProperty: 'id',
               emptyText: 'text',
               emptyKey: null,
               selectedItemsChangedCallback: selectedItemsChangedCallback
            });
            assert.deepEqual(selectedItems, []);

            // selectedKeys = []
            let newItems = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [
                  {id: null, title: 'All'},
                  {id: '1', title: 'first'}
               ]
            });
            dropdownController._items = newItems;
            dropdownController._updateSelectedItems({
               selectedKeys: [],
               keyProperty: 'id',
               emptyText: undefined,
               emptyKey: null,
               selectedItemsChangedCallback: selectedItemsChangedCallback
            });
            assert.deepEqual(selectedItems, [newItems.at(0)]);
         });

         it('_open dropdown', () => {
            let dropdownController = getDropdownController(config),
               opened = false, menuSourceCreated = false;
            dropdownController._items = itemsRecords.clone();
            dropdownController._source = 'testSource';

            sandbox.replace(dropdownController._sticky, 'open', () => {
               opened = true;
               return Promise.resolve(true);
            });
            dropdownController._sourceController = { hasMoreData: () => false, load: () => Deferred.success(itemsRecords.clone()) };
            dropdownController._open().then(function() {
               assert.isTrue(!!dropdownController._menuSource);
               assert.isTrue(opened);
            });

            // items is empty recordSet
            opened = false;
            dropdownController._items.clear();
            dropdownController._open().then(function() {
               assert.isFalse(opened);
            });

            // items = null
            opened = false;
            dropdownController._items = null;
            dropdownController._open().then(function() {
               assert.isFalse(opened);
            });

            // items's count = 1 + emptyText
            opened = false;
            dropdownController._items = new collection.RecordSet({keyProperty: 'id', rawData: [{id: '1', title: 'first'}]});
            dropdownController._options.emptyText = 'Not selected';
            dropdownController._open().then(function() {
               assert.isTrue(opened);
            });

            // update items in _menuSource
            const newItems = new collection.RecordSet({keyProperty: 'id', rawData: [{id: '1', title: 'first'}]});
            dropdownController._menuSource = null;
            dropdownController._items = newItems;
            dropdownController._open().then(function() {
               assert.deepEqual(dropdownController._menuSource.getData().query.getRawData(), newItems.getRawData());
            });

            //new source and dropdown is open
            updatedItems = clone(items);
            dropdownController._items = itemsRecords.clone();
            dropdownController._isOpened = true;
            dropdownController.source = new sourceLib.Memory({
               keyProperty: 'id',
               data: updatedItems
            });
            dropdownController._sourceController = { hasMoreData: () => {}, isLoading: () => {} };
            dropdownController._open().then(function() {
               assert.equal(dropdownController._items.getCount(), updatedItems.length);
               assert.isTrue(opened);
            });

            //loadDependencies returns error
            dropdownController.loadDependencies = () => {
               return Promise.reject(new Error('testError'));
            };
            dropdownController._createMenuSource = () => {
               menuSourceCreated = true;
            };
            dropdownController._open().then(function() {
               assert.isFalse(menuSourceCreated);
            });
         });

         it('reloadOnOpen', () => {
            let dropdownController = getDropdownController({...config});
            dropdownController._items = itemsRecords.clone();
            dropdownController._options.reloadOnOpen = true;

            sandbox.replace(dropdownController, '_open', () => Promise.resolve());
            dropdownController.openMenu();
            assert.isNull(dropdownController._items);
            assert.isNull(dropdownController._loadDependsPromise);
         });

         it('_loadItemsTemplates', (done) => {
            let dropdownController = getDropdownController(config);
            dropdownController._items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: []
            });
            dropdownController._loadItemsTemplates(dropdownController, config).addCallback(() => {
               assert.isTrue(dropdownController._loadItemsTempPromise.isReady());
               done();
            });
         });

         it('_loadItems', async () => {
            const controllerConfig = { ...config };
            controllerConfig.dataLoadCallback = function(loadedItems) {
               const item = new entity.Record({
                  rawData: {
                     id: '9',
                     title: 'Запись 9'
                  }
               });
               loadedItems.add(item);
            };
            let dropdownController = getDropdownController(controllerConfig);
            await dropdownController._loadItems(controllerConfig).then(() => {
               dropdownController._menuSource.query().then((menuItems) => {
                  assert.isTrue(!!menuItems.getRecordById('9'));
               });
            });

            dropdownController._sourceController = {
               load: () => Promise.reject('error')
            };
            await dropdownController._loadItems(controllerConfig).then(() => {}, (error) => {
               assert.equal(error, 'error');
            });
         });

         describe('load items by selectedKeys', () => {
            let dropdownController;
            let newConfig;
            let selectedKeys;
            let selectedItems;
            beforeEach(() => {
               newConfig = { ...config };
               newConfig.selectedKeys = ['8'];
               dropdownController = getDropdownController(newConfig);

               selectedKeys = ['1', '2'];
               selectedItems = new collection.RecordSet({
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }],
                  keyProperty: 'id'
               });
            });

            it('loadSelectedItems', async () => {
               let loadConfig;
               dropdownController._loadItems = (params) => {
                  loadConfig = params;

                  // return new item;
                  return Promise.resolve(new collection.RecordSet({
                     rawData: [{
                        id: '8',
                        title: 'Запись 8'
                     }],
                     keyProperty: 'id'
                  }));
               };
               selectedKeys.push('8');
               dropdownController._source = 'testSource';
               await dropdownController.loadSelectedItems();
               assert.deepEqual(loadConfig.filter, { id: ['8'] });
               assert.equal(dropdownController._selectedItems.getCount(), 1);
               assert.equal(dropdownController._selectedItems.at(0).getKey(), '8');
               assert.isNull(dropdownController._items);
               assert.isNull(dropdownController._sourceController);
            });

            it('_resolveLoadedItems', () => {
               const loadedItems = new collection.RecordSet({
                  rawData: [{
                     id: '2',
                     title: 'Запись 2'
                  }],
                  keyProperty: 'id'
               });
               dropdownController._source = 'testSource';
               dropdownController._selectedItems = selectedItems;
               const result = dropdownController._resolveLoadedItems(newConfig, loadedItems);
               assert.equal(result.getCount(), 3);

               // reopen the dropdown, if open
               dropdownController._isOpened = true;
               let opened = false;
               dropdownController._open = () => { opened = true; };
               dropdownController._resolveLoadedItems(newConfig, loadedItems);
               assert.isTrue(opened);
            });
         });

         it('_private::getItemsTemplates', () => {
            let dropdownController = getDropdownController(config);

            dropdownController._items = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [
                  {
                     id: 1,
                     itemTemplate: 'first'
                  }, {
                     id: 2,
                     itemTemplate: 'second'
                  }, {
                     id: 3
                  }, {
                     id: 4,
                     itemTemplate: 'second'
                  }, {
                     id: 5,
                     itemTemplate: 'five'
                  }
               ]
            });
            assert.deepEqual(dropdownController._getItemsTemplates(config), ['first', 'second', 'five']);
         });

         it('_open one item', () => {
            let selectedItems;
            let oneItemConfig = clone(config);
            oneItemConfig.emptyText = undefined;
            let dropdownController = getDropdownController(oneItemConfig);
            let item = new collection.RecordSet({
               keyProperty: 'id',
               rawData: [ {id: 1, title: 'Запись 1'} ]
            });
            dropdownController._items = item;
            dropdownController._source = 'testSource';
            dropdownController._notify = (e, data) => {
               if (e === 'selectedItemsChanged') {
                  selectedItems = data[0];
               }
            };
            dropdownController._open().then(function() {
               assert.deepEqual(selectedItems, [item.at(0)]);
            });
         });

         it('_open lazyLoad', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController.update(configLazyLoad);

            dropdownController._sticky.open = setTrue.bind(this, assert);
            dropdownController._sticky.close = setTrue.bind(this, assert);
            dropdownController._open();
         });

         it('getPreparedItem', () => {
            let dropdownController = getDropdownController(configLazyLoad);
            let actualSource;

            dropdownController._prepareItem = (item, key, source) => {
               actualSource = source;
            };

            dropdownController._source = 'testSource';
            dropdownController.getPreparedItem('item', 'key');
            assert.equal(actualSource, 'testSource');
         });

         describe('menuPopupOptions', () => {
            let newConfig, dropdownController;
            beforeEach(() => {
               newConfig = clone(config);
               newConfig.menuPopupOptions = {
                  fittingMode: {
                     vertical: 'adaptive',
                     horizontal: 'overflow'
                  },
                  direction: 'top',
                  target: 'testTarget',
                  templateOptions: {
                     closeButtonVisibility: true
                  }
               };
               dropdownController = getDropdownController(newConfig);
               dropdownController._sourceController = {
                  hasMoreData: () => {}
               };
            });

            it('only popupOptions', () => {
               dropdownController._popupOptions = {
                  opener: 'test'
               };
               const resultPopupConfig = dropdownController._getPopupOptions();
               assert.deepEqual(resultPopupConfig.fittingMode,  {
                  vertical: 'adaptive',
                  horizontal: 'overflow'
               });
               assert.equal(resultPopupConfig.direction, 'top');
               assert.equal(resultPopupConfig.target, 'testTarget');
               assert.equal(resultPopupConfig.opener, 'test');
            });

            it('templateOptions', () => {
               dropdownController._menuSource = 'testSource';
               dropdownController._popupOptions = {
                  opener: 'test'
               };
               const resultPopupConfig = dropdownController._getPopupOptions();

               assert.isTrue(resultPopupConfig.templateOptions.closeButtonVisibility);
               assert.equal(resultPopupConfig.templateOptions.source, 'testSource');
               assert.isNull(resultPopupConfig.templateOptions.dataLoadCallback);
               assert.equal(resultPopupConfig.opener, 'test');
            });

            it('check merge popupOptions', () => {
               dropdownController._popupOptions = {
                  opener: 'test'
               };
               const resultPopupConfig = dropdownController._getPopupOptions({
                  testPopupOptions: 'testValue'
               });

               assert.equal(resultPopupConfig.direction, 'top');
               assert.equal(resultPopupConfig.target, 'testTarget');
               assert.equal(resultPopupConfig.testPopupOptions, 'testValue');
               assert.equal(resultPopupConfig.opener, 'test');
            });

            it('check keyProperty option', () => {
               dropdownController._popupOptions = { };
               dropdownController._options.keyProperty = 'key';
               dropdownController._source = new history.Source({});
               dropdownController._items =  new collection.RecordSet({
                  rawData: [{
                     id: '1', HistoryId: 'test'
                  }]
               });
               let resultPopupConfig = dropdownController._getPopupOptions();

               assert.equal(resultPopupConfig.templateOptions.keyProperty, 'copyOriginalId');

               dropdownController._source = 'originalSource';
               resultPopupConfig = dropdownController._getPopupOptions();

               assert.equal(resultPopupConfig.templateOptions.keyProperty, 'key');
            });
         });

         it('_beforeUnmount', function() {
            let isCanceled = false, opened = true;
            let dropdownController = getDropdownController(configLazyLoad);
            dropdownController._sticky.close = () => {opened = false;};
            dropdownController._sourceController = {cancelLoading: () => { isCanceled = true }};
            dropdownController._options.openerControl = {
               _notify: () => {}
            };
            dropdownController.destroy();
            assert.isFalse(!!dropdownController._sourceController);
            assert.isTrue(isCanceled);
            assert.isFalse(opened);
         });

         describe('openMenu', () => {
            let dropdownController = getDropdownController(config);
            let openConfig;

            before(() => {
               dropdownController._sourceController = { hasMoreData: () => false };
               dropdownController._source = 'testSource';
               dropdownController._items = new collection.RecordSet({
                  keyProperty: 'id',
                  rawData: items
               });
               sandbox.replace(popup.Sticky, '_openPopup', (popupConfig) => {
                  openConfig = popupConfig;
                  return Promise.resolve(true);
               });
            });

            it('simple', async() => {
               await dropdownController.openMenu({ testOption: 'testValue' });
               assert.equal(openConfig.testOption, 'testValue');
            });

            describe('one item', () => {
               beforeEach(() => {
                  dropdownController._items = new collection.RecordSet({
                     keyProperty: 'id',
                     rawData: [{
                        id: 1,
                        title: 'testTitle'
                     }]
                  });
                  dropdownController._options.footerContentTemplate = null;
                  dropdownController._options.emptyText = null;
                  openConfig = null;
               });

               it('with footer', async() => {
                  dropdownController._options.footerContentTemplate = {};

                  await dropdownController.openMenu({ testOption: 'testValue' });
                  assert.equal(openConfig.testOption, 'testValue');
               });

               it('with emptyText', async() => {
                  dropdownController._options.emptyText = '123';

                  await dropdownController.openMenu({ testOption: 'testValue' });
                  assert.equal(openConfig.testOption, 'testValue');
               });

               it('simple', async() => {
                  await dropdownController.openMenu().then((items) => {
                     assert.equal(items[0].get('id'), 1);
                  });
                  assert.equal(openConfig, null);
               });
            });
         });

         it('closeMenu', () => {
            let dropdownController = getDropdownController(config);
            let closed = false;
            dropdownController._sticky.close = () => {closed = true; };

            dropdownController.closeMenu();
            assert.isTrue(closed);
         });

         it('_private::getNewItems', function() {
            let curItems = new collection.RecordSet({
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '2',
                     title: 'Запись 2'
                  }, {
                     id: '3',
                     title: 'Запись 3'
                  }]
               }),
               selectedItems = new collection.RecordSet({
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  }, {
                     id: '9',
                     title: 'Запись 9'
                  }, {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            let dropdownController = getDropdownController(config);
            let newItems = [selectedItems.at(1), selectedItems.at(2)];
            let result = dropdownController._getNewItems(curItems, selectedItems, 'id');

            assert.deepEqual(newItems, result);
         });

         it('_private::getSourceController', function() {
            let dropdownController = getDropdownController(config);
            dropdownController.setItems(configLazyLoad.items);
            assert.isNotOk(dropdownController._sourceController);

            return new Promise((resolve) => {
               dropdownController.loadItems().then(() => {
                  assert.isOk(dropdownController._sourceController);

                  let historyConfig = {...config, historyId: 'TEST_HISTORY_ID'};
                  dropdownController = getDropdownController(historyConfig);
                  return dropdownController._getSourceController(historyConfig).then((sourceController) => {
                     assert.isTrue(cInstance.instanceOfModule(sourceController.getState().source, 'Controls/history:Source'));
                     assert.isOk(dropdownController._sourceController);
                     resolve();
                  });
               });
            });
         });

         let historySource,
            dropdownController;
         describe('history', ()=> {
            beforeEach(function() {
               let resultItems, testEvent;
               historySource = new history.Source({
                  originSource: new sourceLib.Memory({
                     keyProperty: 'id',
                     data: items
                  }),
                  historySource: new history.Service({
                     historyId: 'TEST_HISTORY_ID_DDL_CONTROLLER'
                  })
               });
               historySource.query = function() {
                  var def = new Deferred();
                  def.addCallback(function(set) {
                     return set;
                  });
                  def.callback(itemsRecords.clone());
                  return def;
               };
               // historySource.getItems = () => {};

               let historyConfig = { ...config, source: historySource };
               dropdownController = getDropdownController(historyConfig);
               dropdownController._items = itemsRecords.clone();
               dropdownController._children = { DropdownOpener: { close: setTrue.bind(this, assert), isOpened: setTrue.bind(this, assert) } };
            });

            it('update new historySource', function() {
               return dropdownController.update({
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: historySource,
                  filter: {}
               }).then(() => {
                  assert.deepEqual(dropdownController._filter, { $_history: true });
               });
            });

            it('_private::onResult applyClick with history', function() {
               let selectedItems;
               dropdownController._options = {
                  selectedKeys: [2],
                  keyProperty: 'id',
                  source: historySource,
                  filter: {},
                  notifySelectedItemsChanged: (d) => {
                     selectedItems = d[0];
                  }
               };
               dropdownController._items = itemsRecords.clone();
               dropdownController.loadItems().then((result) => {
                  dropdownController.setItemsOnMount(result);
                  dropdownController._onResult('applyClick', items);
                  assert.deepEqual(selectedItems, items);
               });
            });

            it('isHistoryMenu', () => {
               dropdownController._source = historySource;
               dropdownController._items = new collection.RecordSet({
                  rawData: [{
                     id: '1', title: 'title'
                  }]
               });
               let result = dropdownController._isHistoryMenu();
               assert.isFalse(result);

               dropdownController._items.at(0).set('HistoryId', 'test');
               result = dropdownController._isHistoryMenu();
               assert.isTrue(result);
            });
         });

         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   });
