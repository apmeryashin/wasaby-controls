define(
   [
      'Controls/menu',
      'Types/source',
      'Core/core-clone',
      'Controls/display',
      'Types/collection',
      'Types/entity',
      'Controls/list',
      'Controls/popup',
      'Env/Touch'
   ],
   function(menu, source, Clone, display, collection, entity, ControlsConstants, popup, EnvTouch) {
      describe('Menu:Control', function() {
         function getDefaultItems() {
            return [
               { key: 0, title: 'все страны' },
               { key: 1, title: 'Россия' },
               { key: 2, title: 'США' },
               { key: 3, title: 'Великобритания' }
            ];
         }

         function getDefaultOptions() {
            return {
               displayProperty: 'title',
               keyProperty: 'key',
               selectedKeys: [],
               root: null,
               source: new source.Memory({
                  keyProperty: 'key',
                  data: getDefaultItems()
               }),
               itemPadding: {},
               subMenuLevel: 0,
               maxHistoryVisibleItems: 10
            };
         }

         let defaultItems = getDefaultItems();
         let defaultOptions = getDefaultOptions();

         let getListModel = function(items) {
            return new display.Collection({
               collection: new collection.RecordSet({
                  rawData: items || defaultItems,
                  keyProperty: 'key'
               }),
               keyProperty: 'key'
            });
         };

         let getMenu = function(config) {
            const menuControl = new menu.Control(config);
            menuControl.saveOptions(config || defaultOptions);
            menuControl._stack = new popup.StackOpener();
            return menuControl;
         };

         describe('loadItems', () => {
            it('loadItems returns items', async() => {
               const menuControl = getMenu();
               const items = await menuControl._loadItems(defaultOptions);
               assert.deepEqual(items.getRawData().length, defaultItems.length);
            });

            it('with root', () => {
               const menuOptions = Clone(defaultOptions);
               menuOptions.source = new source.Memory({
                  keyProperty: 'key',
                  data: [
                     { key: 'all', title: 'все страны', node: true },
                     { key: '1', title: 'Россия', parent: 'all' },
                     { key: '2', title: 'США', parent: 'all' }
                  ]
               });
               menuOptions.root = 'all';
               menuOptions.parentProperty = 'parent';
               menuOptions.nodeProperty = 'node';
               const menuControl = getMenu(menuOptions);
               return menuControl._loadItems(menuOptions).addCallback((items) => {
                  assert.equal(items.getCount(), 2);
               });
            });

            it('with filter', () => {
               const menuOptions = Clone(defaultOptions);
               menuOptions.filter = {
                  title: 'все страны'
               };
               const menuControl = getMenu(menuOptions);
               return menuControl._loadItems(menuOptions).addCallback((items) => {
                  assert.equal(items.getCount(), 1);
               });
            });

            it('with navigation', () => {
               const menuOptions = Clone(defaultOptions);
               menuOptions.navigation = {
                  view: 'page',
                  source: 'page',
                  sourceConfig: { pageSize: 2, page: 0, hasMore: false }
               };
               const menuControl = getMenu(menuOptions);
               return new Promise((resolve) => {
                  menuControl._loadItems(menuOptions).addCallback((items) => {
                     assert.equal(items.getCount(), 2);
                     resolve();
                  });
               });
            });

            it('with dataLoadCallback in options', () => {
               let isDataLoadCallbackCalled = false;
               let menuControl = getMenu();
               let menuOptions = Clone(defaultOptions);
               menuOptions.dataLoadCallback = () => {
                  isDataLoadCallbackCalled = true;
               };
               return new Promise((resolve) => {
                  menuControl._loadItems(menuOptions).addCallback(() => {
                     assert.isFalse(isDataLoadCallbackCalled);
                     resolve();
                  });
               });
            });

            it('query returns error', async() => {
               const options = Clone(defaultOptions);
               const menuControl = getMenu();

               options.source.query = () => {
                  const error = new Error();
                  error.processed = true;
                  return Promise.reject(error);
               };

               await menuControl._loadItems(options).catch(() => {
                  assert.isNotNull(menuControl._errorConfig);
               });
            });

            it('dataLoadErrback', async () => {
               let isDataLoadErrbackCalled = false;
               const options = Clone(defaultOptions);
               const menuControl = getMenu();
               menuControl._options.dataLoadErrback = () => {
                  isDataLoadErrbackCalled = true;
               };

               options.source.query = () => {
                  const error = new Error();
                  error.processed = true;
                  return Promise.reject(error);
               };

               await menuControl._loadItems(options).catch(() => {
                  assert.isNotNull(menuControl._errorConfig);
                  assert.isTrue(isDataLoadErrbackCalled);
               });
            });
         });

         describe('_beforeUpdate', () => {
            it('source is changed', async() => {
               let isClosed = false;
               const menuControl = getMenu();
               const newMenuOptions = { ...defaultOptions };

               menuControl._closeSubMenu = () => { isClosed = true; };
               newMenuOptions.source = new source.Memory();
               await menuControl._beforeUpdate(newMenuOptions);
               assert.isTrue(menuControl._notifyResizeAfterRender);
               assert.isTrue(isClosed);
            });

            it('source is changed, update markerController', async() => {
               let isClosed = false;
               let isMarkerControllerUpdated = false;
               const menuControl = getMenu();
               menuControl._markerController = 'markerController';
               menuControl._updateMarkerController = () => {
                  isMarkerControllerUpdated = true;
               };
               const newMenuOptions = { ...defaultOptions };

               menuControl._closeSubMenu = () => { isClosed = true; };
               newMenuOptions.source = new source.Memory();
               await menuControl._beforeUpdate(newMenuOptions);
               assert.isTrue(menuControl._notifyResizeAfterRender);
               assert.isTrue(isClosed);
               assert.isTrue(isMarkerControllerUpdated);
            });

            it('searchValue is changed', async() => {
               let isClosed = false;
               let isViewModelCreated = false;
               let isSelectionControllerUpdated = false;
               const menuControl = getMenu();
               menuControl._listModel = getListModel();
               const newMenuOptions = { ...defaultOptions, searchParam: 'title' };

               menuControl._closeSubMenu = () => { isClosed = true; };
               menuControl._createViewModel = () => {
                  isViewModelCreated = true;
               };
               menuControl._selectionController = {
                  updateOptions: () => {
                     isSelectionControllerUpdated = true;
                  }
               };
               newMenuOptions.sourceController = {
                  getItems: () => 'test'
               };
               newMenuOptions.searchValue = '123';
               await menuControl._beforeUpdate(newMenuOptions);
               assert.isTrue(menuControl._notifyResizeAfterRender);
               assert.isTrue(isClosed);
               assert.isTrue(isViewModelCreated);
               assert.isTrue(isSelectionControllerUpdated);
            });
         });

         describe('_beforeMount', () => {
            const menuControl = getMenu();
            const menuOptions = { ...defaultOptions };
            menuControl._markerController = null;

            it('_loadItems return error', async() => {
               menuControl._loadItems = () => {
                  const error = new Error();
                  error.processed = true;
                  return Promise.reject(error);
               };
               await menuControl._beforeMount(menuOptions);

               assert.isNull(menuControl._markerController);
            });

            it('_loadItems return items', async() => {
               menuControl._listModel = {
                  setMarkedKey: () => {},
                  getItemBySourceKey: () => null
               };
               menuControl._loadItems = () => {
                  return new Promise((resolve) => {
                     resolve(new collection.RecordSet({
                        rawData: [
                           { key: 1, title: 'Test' },
                        ],
                        keyProperty: 'key'
                     }));
                  });
               };
               await menuControl._beforeMount(menuOptions);
               assert.isNotNull(menuControl._markerController);
            });

            it('sourceController don`t return items', () => {
               let isErrorProcessed = false;
               let isDataLoadCallbackSetted = false;
               menuControl._listModel = {
                  setMarkedKey: () => {},
                  getItemBySourceKey: () => null
               };
               menuOptions.sourceController = {
                  getLoadError: () => new Error('error'),
                  setDataLoadCallback: () => {isDataLoadCallbackSetted = true;}
               };
               menuControl._processError = () => {
                  isErrorProcessed = true;
               };
               menuControl._beforeMount(menuOptions);
               assert.isTrue(isErrorProcessed);
               assert.isTrue(isDataLoadCallbackSetted);
            });
         });

         it('_beforeUnmount', () => {
            const items = Clone(defaultItems);
            const menuControl = getMenu();
            menuControl._options = {
               searchValue: '123'
            };
            menuControl._listModel = getListModel(items);
            let listModelItems = menuControl._listModel.getCollection();
            menuControl._beforeUnmount();
            assert.equal(listModelItems.getCount(), 0);
         });

         describe('getCollection', function() {
            let menuControl = new menu.Control();
            let items = new collection.RecordSet({
               rawData: defaultItems.map((item) => {
                  item.group = item.key < 2 ? '1' : '2';
                  return item;
               }),
               keyProperty: 'key'
            });

            it ('check group', function() {
               let listModel = menuControl._getCollection(items, {
                  groupProperty: 'group',
                  itemPadding: {}
               });
               assert.instanceOf(listModel.at(0), display.GroupItem);
            });

            it ('check uniq', function() {
               let doubleItems = new collection.RecordSet({
                  rawData: [
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' },
                     { key: 1, title: 'Россия' }
                  ],
                  keyProperty: 'key'
               });
               let listModel = menuControl._getCollection(doubleItems, { keyProperty: 'key', itemPadding: {} });
               assert.equal(listModel.getCount(), 1);
            });

            it ('check history filter', function() {
               let isFilterApply = false;
               menuControl._limitHistoryFilter = () => {
                  isFilterApply = true;
               };
               menuControl._getCollection(items, {
                  allowPin: true,
                  root: null,
                  itemPadding: {}
               });

               assert.isTrue(isFilterApply);
            });
         });


         it('_getLeftPadding', function() {
            const menu = getMenu();
            let menuOptions = {
               itemPadding: {},
               markerVisibility: 'hidden'
            };
            let leftSpacing = menu._getLeftPadding(menuOptions);
            assert.equal(leftSpacing, 's');

            menuOptions.multiSelect = true;
            leftSpacing = menu._getLeftPadding(menuOptions);
            assert.equal(leftSpacing, 's');

            menuOptions.itemPadding.left = 'xs';
            leftSpacing = menu._getLeftPadding(menuOptions);
            assert.equal(leftSpacing, 'xs');

            menuOptions.itemPadding.left = undefined;
            menuOptions.markerVisibility = 'visible';
            leftSpacing = menu._getLeftPadding(menuOptions);
            assert.equal(leftSpacing, 's');
         });

         describe('_addEmptyItem', function() {
            let menuRender, menuOptions, items;
            beforeEach(function() {
               menuRender = getMenu();
               items = new collection.RecordSet({
                  rawData: {
                     _type: 'recordset',
                     d: [],
                     s: [
                        { n: 'id', t: 'Строка' },
                        { n: 'title', t: 'Строка' },
                        { n: 'parent', t: 'Строка' },
                        { n: 'node', t: 'Строка' }
                     ]
                  },
                  keyProperty: 'id',
                  adapter: new entity.adapter.Sbis()
               });
               menuOptions = {
                  emptyText: 'Not selected',
                  emptyKey: null,
                  keyProperty: 'id',
                  displayProperty: 'title',
                  selectedKeys: []
               };
            });

            it('check items count', function() {
               menuRender._addSingleSelectionItem('Not selected', null, items, menuOptions);
               assert.equal(items.getCount(), 1);
               assert.equal(items.at(0).get('title'), 'Not selected');
               assert.equal(items.at(0).get('id'), null);
            });

            it('check parentProperty', function() {
               menuRender._addSingleSelectionItem('text', null, items, {...menuOptions, parentProperty: 'parent', root: null});
               assert.equal(items.getCount(), 1);
               assert.equal(items.at(0).get('parent'), null);
            });

            it('check nodeProperty', function() {
               menuRender._addSingleSelectionItem('text', null, items, {...menuOptions, nodeProperty: 'node'});
               assert.equal(items.at(0).get('node'), false);
            });

            it('check model', function() {
               let isCreatedModel;
               let sandbox = sinon.createSandbox();
               sandbox.replace(menuRender, '_createModel', (model, config) => {
                  isCreatedModel = true;
                  return new entity.Model(config);
               });

               items = new collection.RecordSet({
                  rawData: Clone(defaultItems),
                  keyProperty: 'id'
               });

               menuRender._addSingleSelectionItem('emptyText', null, items, menuOptions);
               assert.equal(items.at(0).get('id'), null);
               assert.isTrue(isCreatedModel);
               sandbox.restore();
            });
         });

         describe('_isExpandButtonVisible', function() {
            let menuControl, items;
            beforeEach(() => {
               const records = [];
               for (let i = 0; i < 15; i++) {
                  records.push({ key: String(i), doNotSaveToHistory: undefined });
               }
               menuControl = getMenu();
               items = new collection.RecordSet({
                  rawData: records,
                  keyProperty: 'key'
               });
            });

            it('expandButton visible, history menu', () => {
               const newMenuOptions = { allowPin: true, root: null, maxHistoryVisibleItems: 10 };

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isTrue(result);
               assert.equal(menuControl._visibleIds.length, 10);
            });

            it('expandButton visible, history menu with fixed item', () => {
               const newMenuOptions = { allowPin: true, root: null, maxHistoryVisibleItems: 10 };
               items.append([new entity.Model({
                  rawData: { key: 'doNotSaveToHistory', doNotSaveToHistory: true },
                  keyProperty: 'key'
               })]);

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isTrue(result);
               assert.equal(menuControl._visibleIds.length, 11);
            });

            it('expandButton hidden, visibleItems.length = 11, history menu with fixed item', () => {
               const newMenuOptions = { allowPin: true, root: null, maxHistoryVisibleItems: 10 };
               const itemsData = [];
               for (let i = 0; i < 11; i++) {
                  itemsData.push({ key: String(i), doNotSaveToHistory: undefined });
               }
               itemsData.push({ key: 'doNotSaveToHistory', doNotSaveToHistory: true });
               items = new collection.RecordSet({
                  rawData: itemsData,
                  keyProperty: 'key'
               });

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isFalse(result);
               assert.equal(menuControl._visibleIds.length, 12);
            });

            it('expandButton hidden, history menu', () => {
               const newMenuOptions = { allowPin: true, subMenuLevel: 1, maxHistoryVisibleItems: 10 };

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isFalse(result, 'level is not first');
               assert.equal(menuControl._visibleIds.length, 0);
            });

            it('expandButton hidden, history menu, with parent', () => {
               let records = [];
               for (let i = 0; i < 20; i++) {
                  records.push({ parent: i < 15 });
               }
               items = new collection.RecordSet({
                  rawData: records,
                  keyProperty: 'key'
               });
               const newMenuOptions = { allowPin: true, root: null, parentProperty: 'parent', maxHistoryVisibleItems: 10 };

               const result = menuControl._isExpandButtonVisible(items, newMenuOptions);
               assert.isFalse(result);
               assert.equal(menuControl._visibleIds.length, 5);
            });
         });

         describe('_toggleExpanded', function() {
            let menuControl;
            let filterIsRemoved;
            let filterIsAdded;
            let isClosed;

            beforeEach(() => {
               isClosed = false;
               filterIsRemoved = false;
               filterIsAdded = false;
               menuControl = getMenu();
               menuControl._listModel = {
                  removeFilter: () => { filterIsRemoved = true; },
                  addFilter: () => { filterIsAdded = true; }
               };
               menuControl._closeSubMenu = () => {
                  isClosed = true;
               };
            });

            it('expand', function() {
               menuControl._expander = false;
               menuControl._toggleExpanded();

               assert.isTrue(isClosed);
               assert.isTrue(menuControl._expander);
               assert.isTrue(filterIsRemoved);
               assert.isFalse(filterIsAdded);
            });

            it('collapse', function() {
               menuControl._expander = true;
               menuControl._toggleExpanded();

               assert.isTrue(isClosed);
               assert.isFalse(menuControl._expander);
               assert.isFalse(filterIsRemoved);
               assert.isTrue(filterIsAdded);
            })
         });

         describe('_itemClick', function() {
            let menuControl;
            let selectedItem, selectedKeys, pinItem, item, sandbox;
            let isTouchStub;

            beforeEach(function() {
               menuControl = getMenu();
               menuControl._listModel = getListModel();
               sandbox = sinon.createSandbox();
               isTouchStub = sandbox.stub(EnvTouch.TouchDetect.getInstance(), 'isTouch').returns(false);

               menuControl._notify = (e, data) => {
                  if (e === 'selectedKeysChanged') {
                     selectedKeys = data[0];
                  } else if (e === 'itemClick') {
                     selectedItem = data[0];
                  } else if (e === 'pinClick') {
                     pinItem = data[0];
                  }
               };
               item = new entity.Model({
                  rawData: defaultItems[1],
                  keyProperty: 'key'
               });
            });
            afterEach(function() {
               sandbox.restore();
            });
            it('check selected item', function() {
               menuControl._markerController = null;
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);
               assert.isNull(menuControl._markerController);
            });

            it('multiSelect=true', function() {
               menuControl._options.multiSelect = true;

               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);

               menuControl._selectionChanged = true;
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);
            });

            it('multiSelect=true, click on fixed item', function() {
               menuControl._options.multiSelect = true;
               item = item.clone();
               item.set('pinned', true);

               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);

               menuControl._selectionChanged = true;
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);
            });

            it('multiSelect=true, click on history item', function() {
               menuControl._options.multiSelect = true;
               item = item.clone();
               item.set('pinned', true);
               item.set('HistoryId', null);

               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedItem.getKey(), 1);

               menuControl._selectionChanged = true;
               menuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);
            });

            it('check pinClick', function() {
               let isPinClick = false;
               let nativeEvent = {
                  target: { closest: () => isPinClick }
               };
               menuControl._itemClick('itemClick', item, nativeEvent);
               assert.isUndefined(pinItem);

               isPinClick = true;
               menuControl._itemClick('itemClick', item, nativeEvent);
               assert.equal(pinItem.getId(), item.getId());
            });

            it('select empty item', function() {
               let emptyMenuControl = getMenu({...defaultOptions, emptyKey: null, emptyText: 'Not selected', multiSelect: true});
               let emptyItems = Clone(defaultItems);
               emptyItems.push({
                  key: null,
                  title: 'Not selected'
               });
               emptyMenuControl._listModel = getListModel(emptyItems);
               emptyMenuControl._notify = (e, data) => {
                  if (e === 'selectedKeysChanged') {
                     selectedKeys = data[0];
                  }
               };

               emptyMenuControl._selectionChanged = true;
               emptyMenuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);

               emptyMenuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], null);

               emptyMenuControl._itemClick('itemClick', item, {});
               assert.equal(selectedKeys[0], 1);
            });

            describe('check touch devices', function() {
               beforeEach(() => {
                  isTouchStub.returns(true);
                  selectedItem = null;
               });

               it('submenu is not open, item is list', function() {
                  sinon.stub(menuControl, '_handleCurrentItem');
                  menuControl._itemClick('itemClick', item, {});
                  assert.equal(selectedItem.getKey(), 1);
               });

               it('submenu is not open, item is node', function() {
                  sinon.stub(menuControl, '_handleCurrentItem');
                  item.set('node', true);
                  menuControl._options.nodeProperty = 'node';
                  menuControl._itemClick('itemClick', item, {});
                  sinon.assert.calledOnce(menuControl._handleCurrentItem);
                  assert.isNull(selectedItem);
                  sinon.restore();
               });

               it('submenu is open', function() {
                  menuControl._subDropdownItem = menuControl._listModel.at(1);
                  menuControl._itemClick('itemClick', menuControl._listModel.at(1).getContents(), {});
                  assert.equal(selectedItem.getKey(), 1);
               });
            });
         });

         describe('_itemMouseMove', function() {
            let menuControl, handleStub;
            let sandbox;
            let isTouchStub;
            let target = {
               closest: () => 'container'
            };
            let collectionItem = new display.CollectionItem({
               contents: new entity.Model()
            });

            beforeEach(() => {
               sandbox = sinon.createSandbox();
               menuControl = getMenu();
               menuControl._listModel = getListModel();
               menuControl._container = 'container';
               isTouchStub = sandbox.stub(EnvTouch.TouchDetect.getInstance(), 'isTouch').returns(false);
               handleStub = sandbox.stub(menuControl, '_startOpeningTimeout');
            });
            afterEach(() => {
               sandbox.restore();
            });

            it('menu:Control in item', function() {
               menuControl._itemMouseMove('mousemove', collectionItem, { target: {closest: () => 'newContainer'}, nativeEvent: 'nativeEvent' });
               assert.isTrue(handleStub.notCalled);
            });

            it('on groupItem', function() {
               menuControl._itemMouseMove('mousemove', new display.GroupItem());
               assert.isTrue(handleStub.notCalled);
            });

            it('on collectionItem', function() {
               menuControl._itemMouseEnter('mouseenter', collectionItem, { target, nativeEvent: 'nativeEvent' });
               assert.deepEqual(menuControl._hoveredTarget, target);
               menuControl._itemMouseMove('mousemove', collectionItem, { target: {closest: () => 'container'}, nativeEvent: 'nativeEvent' });
               assert.isTrue(handleStub.calledOnce);
               assert.equal(menuControl._enterEvent, 'nativeEvent');
            });

            it('on touch devices', function() {
               isTouchStub.returns(true);
               menuControl._itemMouseMove('mousemove', collectionItem, {target});
               assert.isTrue(handleStub.notCalled);
            });

            describe('close opened menu', function() {
               let isClosed = false;
               beforeEach(() => {
                  menuControl._children.Sticky = {
                     close: () => { isClosed = true; }
                  };
                  menuControl._subMenu = true;
               });

               it('subMenu is close', function() {
                  menuControl._itemMouseMove('mousemove', collectionItem, { target, nativeEvent: 'nativeEvent' });
                  assert.isTrue(handleStub.calledOnce);
                  assert.isFalse(isClosed);
               });

               it('subMenu is open, mouse on current item = subDropdownItem', function() {
                  this._subDropdownItem = collectionItem;
                  menuControl._itemMouseMove('mousemove', collectionItem, { target, nativeEvent: 'nativeEvent' });
                  assert.isTrue(handleStub.calledOnce);
                  assert.isFalse(isClosed);
               });
            });

            sinon.restore();
         });

         it('_startOpeningTimeout', () => {
            let isHandledItem = false;
            const clock = sinon.useFakeTimers();
            let menuControl = getMenu();
            menuControl._handleCurrentItem = () => {
               isHandledItem = true;
            };
            menuControl._startOpeningTimeout();
            clock.tick(400);
            assert.isTrue(isHandledItem);
            clock.restore();
         });

         it('getTemplateOptions', async function() {
            let menuControl = getMenu();
            menuControl._isLoadedChildItems = () => true;
            menuControl._listModel = getListModel();

            let item = menuControl._listModel.at(1);

            const expectedOptions = Clone(defaultOptions);
            expectedOptions.root = 1;
            expectedOptions.bodyContentTemplate = 'Controls/_menu/Control';
            expectedOptions.dataLoadCallback = null;
            expectedOptions.items = undefined;
            expectedOptions.source = new source.PrefetchProxy({
               target: menuControl._options.source,
               data: {
                  query: menuControl._listModel.getCollection()
               }
            });
            expectedOptions.footerContentTemplate = defaultOptions.nodeFooterTemplate;
            expectedOptions.footerItemData = {
               item: item.getContents(),
               key: expectedOptions.root
            };
            expectedOptions.emptyText = null;
            expectedOptions.closeButtonVisibility = false;
            expectedOptions.showClose = false;
            expectedOptions.showHeader = false;
            expectedOptions.headerContentTemplate = null;
            expectedOptions.headerTemplate = null;
            expectedOptions.headingCaption = defaultOptions.headingCaption;
            expectedOptions.additionalProperty = null;
            expectedOptions.itemPadding = undefined;
            expectedOptions.searchParam = null;
            expectedOptions.subMenuLevel = 1;
            expectedOptions.draggable = false;
            expectedOptions.iWantBeWS3 = false;
            expectedOptions.sourceController = undefined;

            let resultOptions = await menuControl._getTemplateOptions(item);
            assert.deepEqual(resultOptions, expectedOptions);
         });

         it('getTemplateOptions sourceProperty', async function() {
            let actualConfig;
            let menuControl = getMenu();
            menuControl._options.sourceProperty = 'source';
            menuControl._listModel = getListModel();
            const item = new display.CollectionItem({
               contents: new entity.Model({
                  rawData: {
                     source: 'testSource'
                  }
               })
            });
            menuControl._getSourceSubMenu = (isLoadedChildItems, config) => {
               actualConfig = config;
               return Promise.resolve('source');
            };

            await menuControl._getTemplateOptions(item);
            assert.equal(actualConfig, 'testSource');
         });

         it('getMenuPopupOffset', async function() {
            const menuControl = getMenu();
            menuControl._listModel = getListModel();
            const item = new display.CollectionItem({
               contents: new entity.Model({
                  rawData: {
                     source: 'testSource',
                     icon: 'icon',
                     iconSize: 'm'
                  }
               })
            });
            const iconSize = item.contents.get('iconSize');
            const paddingSize = menuControl._listModel.getLeftPadding().toLowerCase();
            const options = Clone(defaultOptions);
            options.subMenuDirection = 'bottom';
            options.theme = 'default';

            const expectedOffset = ` controls_dropdownPopup_theme-${options.theme}` +
               ` controls-Menu__alignSubMenuDown_iconSize_${iconSize}_offset_${paddingSize}`;

            const menuPopupOffset = menuControl._getMenuPopupOffsetClass(item, options);
            assert.deepEqual(menuPopupOffset, expectedOffset);
         });

         it('isSelectedKeysChanged', function() {
            let menuControl = getMenu();
            let initKeys = [];
            let result = menuControl._isSelectedKeysChanged([], initKeys);
            assert.isFalse(result);

            result = menuControl._isSelectedKeysChanged([2], initKeys);
            assert.isTrue(result);

            initKeys = [2, 1];
            result = menuControl._isSelectedKeysChanged([1, 2], initKeys);
            assert.isFalse(result);
         });

         it('_getSelectedItems', () => {
            const menuControl = getMenu({...defaultOptions, emptyKey: null, emptyText: 'emptyText'});
            const emptyItem = {
               key: null,
               title: 'Not selected'
            };
            let itemsWithEmpty = Clone(defaultItems);
            itemsWithEmpty.push(emptyItem);
            menuControl._listModel = getListModel(itemsWithEmpty);
            const result = menuControl._getSelectedItems();
            assert.isNull(result[0].getKey());
         });

         it('_getMarkedKey', function() {
            let menuControl = getMenu();
            menuControl._listModel = getListModel(
               [{ key: 1, title: 'Россия' },
                  { key: 2, title: 'США', pinned: true }]
            );

            // empty item
            let result = menuControl._getMarkedKey([],
               {emptyKey: 'emptyKey', multiSelect: true, emptyText: 'emptyText'});
            assert.equal(result, 'emptyKey');

            // fixed item
            result = menuControl._getMarkedKey([2], {emptyKey: 'emptyKey', multiSelect: true});
            assert.equal(result, 2);

            // item out of list
            result = menuControl._getMarkedKey([123], {emptyKey: 'emptyKey', multiSelect: true});
            assert.isUndefined(result);

            // single selection
            result = menuControl._getMarkedKey([1, 2], {emptyKey: 'emptyKey', multiSelect: false});
            assert.equal(result, 1);

            result = menuControl._getMarkedKey([],
               {emptyKey: 'emptyKey', multiSelect: false, emptyText: 'emptyText'});
            assert.equal(result, 'emptyKey');
         });

         it('setSubMenuPosition', function() {
            let menuControl = getMenu();
            menuControl._openSubMenuEvent = {
               clientX: 25
            };

            menuControl._subMenu = {
               getBoundingClientRect: () => ({
                  left: 10,
                  top: 10,
                  height: 200,
                  width: 100
               })
            };

            menuControl._setSubMenuPosition();
            assert.deepEqual(menuControl._subMenuPosition, {

               // т.к. left < clientX, прибавляем ширину к left
               left: 110,
               top: 10,
               height: 200
            });
         });

         describe('_updateSwipeItem', function() {
            let menuControl = getMenu();
            menuControl._listModel = getListModel();

            const item1 = menuControl._listModel.at(0);
            const item2 = menuControl._listModel.at(1);

            it('swipe to the left', () => {
               menuControl._updateSwipeItem(item1, true);
               assert.isTrue(item1.isSwiped());
            });

            it('swipe to the left another item', () => {
               menuControl._updateSwipeItem(item2, true);
               assert.isTrue(item2.isSwiped(), 'swipe to the left');
               assert.isFalse(item1.isSwiped(), 'swipe to the left');
            });

            it('swipe to the right', () => {
               menuControl._updateSwipeItem(item2, false);
               assert.isFalse(item1.isSwiped(), 'swipe to the right');
            });
         });

         describe('_separatorMouseEnter', function() {
            let isClosed, isMouseInArea = true, menuControl = getMenu();
            beforeEach(() => {
               isClosed = false;
               menuControl._children = {
                  Sticky: { close: () => { isClosed = true; } }
               };

               menuControl._subMenu = true;
               menuControl._setSubMenuPosition = function() {};
               menuControl._isMouseInOpenedItemAreaCheck = function() {
                  return isMouseInArea;
               };
            });

            it('isMouseInOpenedItemArea = true', function() {
               menuControl._subDropdownItem = true;
               menuControl._separatorMouseEnter('mouseenter', { nativeEvent: {} });
               assert.isFalse(isClosed);
            });

            it('isMouseInOpenedItemArea = true, subMenu is close', function() {
               menuControl._subDropdownItem = false;
               menuControl._separatorMouseEnter('mouseenter', { nativeEvent: {} });
               assert.isFalse(isClosed);
            });

            it('isMouseInOpenedItemArea = false', function() {
               menuControl._subDropdownItem = true;
               isMouseInArea = false;
               menuControl._separatorMouseEnter('mouseenter', { nativeEvent: {} });
               assert.isTrue(isClosed);
            });
         });

         it('_footerMouseEnter', function() {
            let isClosed = false;
            let menuControl = getMenu();
            menuControl._subMenu = true;
            let event = {
               nativeEvent: {}
            };

            menuControl._children = {
               Sticky: { close: () => { isClosed = true; } }
            };
            menuControl._isMouseInOpenedItemAreaCheck = function() {
               return false;
            };
            menuControl._setSubMenuPosition = function() {};
            menuControl._subDropdownItem = true;
            menuControl._footerMouseEnter(event);
            assert.isTrue(isClosed);

            menuControl._isMouseInOpenedItemAreaCheck = function() {
               return true;
            };
            menuControl._subDropdownItem = true;
            isClosed = false;
            menuControl._footerMouseEnter(event);
            assert.isFalse(isClosed);
         });

         it('_openSelectorDialog', function() {
            let menuOptions = Clone(defaultOptions);
            menuOptions.selectorTemplate = {
               templateName: 'DialogTemplate.wml',
               templateOptions: {
                  option1: '1',
                  option2: '2'
               },
               isCompoundTemplate: false
            };
            let menuControl = getMenu(menuOptions);
            menuControl._listModel = getListModel();

            let selectCompleted = false, closed = false, opened = false, actualOptions;

            let sandbox = sinon.createSandbox();
            sandbox.replace(popup.Stack, '_openPopup', (tplOptions) => {
               opened = true;
               actualOptions = tplOptions;
               return Promise.resolve();
            });
            sandbox.replace(popup.Stack, 'closePopup', () => { closed = true; });

            menuControl._options.selectorDialogResult = () => {selectCompleted = true};
            menuControl._options.selectorOpener = 'testSelectorOpener';

            menuControl._openSelectorDialog(menuOptions);

            assert.strictEqual(actualOptions.template, menuOptions.selectorTemplate.templateName);
            assert.strictEqual(actualOptions.isCompoundTemplate, menuOptions.isCompoundTemplate);
            assert.deepStrictEqual(actualOptions.templateOptions.selectedItems.getCount(), 0);
            assert.strictEqual(actualOptions.templateOptions.option1, '1');
            assert.strictEqual(actualOptions.templateOptions.option2, '2');
            assert.isOk(actualOptions.eventHandlers.onResult);
            assert.isTrue(actualOptions.hasOwnProperty('opener'));
            assert.equal(actualOptions.opener, 'testSelectorOpener');
            assert.isTrue(actualOptions.closeOnOutsideClick);
            assert.isTrue(opened);

            actualOptions.eventHandlers.onResult();
            assert.isTrue(closed);
            sandbox.restore();
         });

         it('_openSelectorDialog with empty item', () => {
            let emptyMenuControl = getMenu({
               ...defaultOptions,
               emptyKey: null,
               emptyText: 'Not selected',
               multiSelect: true,
               selectedKeys: ['Not selected'],
               selectorTemplate: {}
            });
            let items = Clone(defaultItems);
            let selectorOptions = {};
            const emptyItem = {
               key: null,
               title: 'Not selected'
            };
            items.push(emptyItem);
            let sandbox = sinon.createSandbox();
            sandbox.replace(popup.Stack, '_openPopup', (tplOptions) => {
               selectorOptions = tplOptions;
               return Promise.resolve();
            });
            emptyMenuControl._listModel = getListModel(items);
            emptyMenuControl._openSelectorDialog({});
            assert.strictEqual(selectorOptions.templateOptions.selectedItems.getCount(), 0);

            sandbox.restore();
         });

         describe('displayFilter', function() {
            let menuControl = getMenu();
            let hierarchyOptions = {
               root: null
            };
            let item = new entity.Model({
               rawData: {key: '1', parent: null},
               keyProperty: 'key'
            });
            let isVisible;

            hierarchyOptions = {
               parentProperty: 'parent',
               nodeProperty: 'node',
               root: null
            };
            it('item parent = null, root = null', function() {
               isVisible = menuControl.constructor._displayFilter(hierarchyOptions, item);
               assert.isTrue(isVisible);
            });

            it('item parent = undefined, root = null', function() {
               item.set('parent', undefined);
               isVisible = menuControl.constructor._displayFilter(hierarchyOptions, item);
               assert.isTrue(isVisible);
            });

            it('item parent = 1, root = null', function() {
               item.set('parent', '1');
               const items = new collection.RecordSet({
                  rawData: defaultItems,
                  keyProperty: 'key'
               });
               items.add(item);
               isVisible = menuControl.constructor._displayFilter(hierarchyOptions, items, item);
               assert.isFalse(isVisible);
            });
         });

         describe('historyFilter', () => {
            let menuControl = getMenu();
            menuControl._visibleIds = [2, 6, 8];
            let itemKey;
            const item = { getKey: () => itemKey };

            it('group item', function() {
               const isVisible = menuControl._limitHistoryCheck('group');
               assert.isTrue(isVisible);
            });

            it('invisible item', function() {
               itemKey = 1;
               const isVisible = menuControl._limitHistoryCheck(item);
               assert.isFalse(isVisible, "_visibleIds doesn't include it");
            });

            it('visible item', function() {
               itemKey = 6;
               const isVisible = menuControl._limitHistoryCheck(item);
               assert.isTrue(isVisible, '_visibleIds includes it');
            });
         });

         describe('groupMethod', function() {
            let menuControl = getMenu();
            let menuOptions = {groupProperty: 'group', root: null};
            let groupId;
            let item = new entity.Model({
               rawData: {key: '1'},
               keyProperty: 'key'
            });

            it('item hasn`t group', function() {
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, ControlsConstants.groupConstants.hiddenGroup);
            });

            it('group = 0', function() {
               item.set('group', 0);
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, 0);
            });

            it('item is history', function() {
               item.set('pinned', true);
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, ControlsConstants.groupConstants.hiddenGroup);
            });

            it('item is history, root = 2', function() {
               menuOptions.root = 2;
               groupId = menuControl._groupMethod(menuOptions, item);
               assert.equal(groupId, ControlsConstants.groupConstants.hiddenGroup);
            });
         });

         describe('itemActions', function() {
            it('_openItemActionMenu', () => {
               let isOpened = false;
               let actualConfig;
               let menuControl = getMenu();
               menuControl._itemActionsController = {
                  prepareActionsMenuConfig: () => ({ param: 'menuConfig' }),
                  setActiveItem: () => {}
               };
               menuControl._itemActionSticky = {
                  open: (menuConfig) => {
                     actualConfig = menuConfig;
                     isOpened = true;
                  }
               };
               menuControl._openItemActionMenu('item', {}, null);
               assert.isTrue(isOpened);
               assert.isOk(actualConfig.eventHandlers);
            });

            it('_onItemActionsMenuResult', () => {
               let isItemHandled = false;
               let isClosed = false;
               const actionModel = new entity.Model({
                  rawData: {
                     key: '1',
                     handler: () => { isItemHandled = true; }
                  },
                  keyProperty: 'key'
               });
               let menuControl = getMenu();
               menuControl._itemActionsController = {
                  getActiveItem: () => ({ getContents: () => {} })
               };
               menuControl._itemActionSticky = {
                  close: () => {
                     isClosed = true;
                  }
               };
               menuControl._onItemActionsMenuResult('itemClick', actionModel, null);
               assert.isTrue(isItemHandled);
               assert.isTrue(isClosed);
            });
         });

         it('_changeIndicatorOverlay', function() {
            let menuControl = getMenu();
            let indicatorConfig = {
               delay: 100,
               overlay: 'default'
            };
            menuControl._changeIndicatorOverlay('showIndicator', indicatorConfig);
            assert.equal(indicatorConfig.overlay, 'none');
         });

         it('getCollection', function() {
            let menuControl = getMenu();
            let listModel = menuControl._getCollection(new collection.RecordSet(), {
               searchParam: 'title',
               searchValue: 'searchText',
               itemPadding: {}
            });
            assert.instanceOf(listModel, display.Search);
         });
         // TODO тестируем только публичные методы
         // it('_itemActionClick', function() {
         //    let isHandlerCalled = false;
         //    let menuControl = getMenu();
         //    menuControl._listModel = getListModel();
         //    let action = {
         //       id: 1,
         //       icon: 'icon-Edit',
         //       iconStyle: 'secondary',
         //       title: 'edit',
         //       showType: 2,
         //       handler: function() {
         //          isHandlerCalled = true;
         //       }
         //    };
         //    let clickEvent = {
         //       stopPropagation: () => {}
         //    };
         //
         //    menuControl._itemActionClick('itemActionClick', menuControl._listModel.at(1), action, clickEvent);
         //    assert.isTrue(isHandlerCalled);
         // });

         describe('_subMenuResult', function() {
            let menuControl, stubClose, eventResult, nativeEvent, sandbox;
            beforeEach(() => {
               menuControl = getMenu();
               menuControl._notify = (event, data) => {
                  eventResult = data[0];
                  nativeEvent = data[1];
               };
               sandbox = sinon.createSandbox();
               stubClose = sandbox.stub(menuControl, '_closeSubMenu');
            });
            afterEach(() => {
               sandbox.restore();
            });

            it('menuOpened event', function() {
               const data = { container: 'subMenu' };
               menuControl._subDropdownItem = {isFirstItem: () => false};
               menuControl._subMenuResult('click', 'menuOpened', data);
               assert.deepEqual(menuControl._subMenu, data.container);
            });
            it('pinClick event', function() {
               menuControl._subMenuResult('click', 'pinClick', { item: 'item1' });
               assert.deepEqual(eventResult, { item: 'item1' });
               assert.isTrue(stubClose.calledOnce);
            });
            it('itemClick event', function() {
               menuControl._subMenuResult('click', 'itemClick', { item: 'item2' }, 'testEventName');
               assert.equal(nativeEvent, 'testEventName');
               assert.deepEqual(eventResult, { item: 'item2' });
               assert.isTrue(stubClose.calledOnce);
            });
            it('itemClick event return false', function() {
               menuControl._notify = (event, data) => {
                  eventResult = data[0];
                  nativeEvent = data[1];
                  return false;
               };
               menuControl._subMenuResult('click', 'itemClick', { item: 'item2' }, 'testEvent');
               assert.equal(nativeEvent, 'testEvent');
               assert.deepEqual(eventResult, { item: 'item2' });
               assert.isTrue(stubClose.notCalled);
            });
         });

         it('_subMenuDataLoadCallback', function() {
            const menuControl = getMenu();
            const listModelItems = getDefaultItems();
            menuControl._listModel = {
               getCollection: () => new collection.RecordSet({
                  rawData: listModelItems
               })
            };
            let items = new collection.RecordSet({
               rawData: [{
                  key: '1',
                  icon: 'icon',
                  caption: 'caption'
               }]
            });

            menuControl._subMenuDataLoadCallback(items);
            assert.equal(menuControl._listModel.getCollection().getFormat().getCount(), 4);
         });

         describe('multiSelect: true', () => {
            it('_beforeUpdate hook', async() => {
               const options = {
                  ...getDefaultOptions(),
                  selectedKeys: [null]
               };
               const menuControl = new menu.Control(options);
               await menuControl._beforeMount(options);
               menuControl.saveOptions(options);

               menuControl._beforeUpdate(options);
               assert.equal(menuControl._markerController.getMarkedKey(), null);
            });
         });

      });
   }
);
