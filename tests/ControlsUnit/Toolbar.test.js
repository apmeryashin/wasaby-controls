define(
   [
      'Controls/toolbars',
      'Types/entity',
      'Types/collection',
      'Types/source',
      'Controls/popup'
   ],
   (toolbars, entity, collection, sourceLib, popupLib) => {
      describe('Toolbar', () => {
         let defaultItems = [
            {
               id: '1',
               title: 'Запись 1',
               parent: null,
               '@parent': null
            },
            {
               id: '2',
               title: 'Запись 2',
               parent: null,
               '@parent': true,
               icon: 'icon-Ezy',
               iconStyle: 'super'
            },
            {
               id: '3',
               title: 'Запись 3',
               icon: 'icon-medium icon-Doge icon-primary',
               parent: null,
               '@parent': null,
               showType: 2
            },
            {
               id: '4',
               title: 'Запись 4',
               buttonViewMode: 'link',
               parent: '2',
               '@parent': null,
               showType: 0
            },
            {
               id: '5',
               title: 'Запись 4',
               buttonViewMode: 'link'
            }
         ];

         let records = new collection.RecordSet({
            rawData: defaultItems
         });
         let config = {
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: defaultItems
            }),
            parentProperty: 'parent',
            nodeProperty: '@parent'
         };
         let itemWithMenu = new entity.Model({
            rawData: defaultItems[1]
         });
         let itemWithOutMenu = new entity.Model({
            rawData: defaultItems[5]
         });
         let toolbar = new toolbars.View(config);
         toolbar._beforeMount(config);

         toolbar._notify = (e, data) => {
            assert.equal(data[0].id, 'myTestItem');
            assert.equal(e, 'itemClick');
         };
         toolbar._children.menuOpener = {
            close: setTrue.bind(this, assert),
            open: setTrue.bind(this, assert)
         };
         toolbar._children.menuTarget = {
            _container: 'target'
         };

         describe('_isShowToolbar', function() {
            it('Test1', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 2
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test2', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 2
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test3', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 1
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test4', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 1
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test5', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 0
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test6', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 0
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
         });

         describe('publicMethod', function() {
            it('check received state', () => {
               toolbar._beforeMount(config, null, records);
               assert.equal(!!toolbar._needShowMenu, true);
            });
            it('need show menu', function() {
               return new Promise((resolve) => {
                  toolbar._beforeMount({
                     keyProperty: 'id',
                     source: config.source
                  }).addCallback(() => {
                     assert.equal(!!toolbar._needShowMenu, true);
                     assert.equal(toolbar._items.getCount(), defaultItems.length);
                     resolve();
                  });
               });
            });
               it('needShowMenu: one item with showType=menu-toolbar', function() {
                  return new Promise((resolve) => {
                     toolbar._beforeMount({
                        keyProperty: 'id',
                        source: new sourceLib.Memory({
                        keyProperty: 'id',
                        data: [
                           {
                              id: '1',
                              title: 'Запись 1',
                              parent: null,
                              '@parent': null
                           },
                        ]
                     }),
                     }).addCallback(() => {
                        assert.equal(!!toolbar._needShowMenu, false);
                        assert.equal(toolbar._items.getCount(), 1);
                        resolve();
                     });
                  });
               });
            it('click toolbar item', function() {
               let isNotify = false;
               let eventResult = null;
               let event = null;
               toolbar._notify = (e, data) => {
                  eventResult = e;
                  event = data[1];
                  isNotify = true;
               };
               toolbar._itemClickHandler({
                  stopPropagation: () => {
                  }, nativeEvent: 'nativeEvent'
               }, {
                  id: 'myTestItem',
                  get: () => {
                  },
                  handler: () => {
                  }
               });
               assert.equal(eventResult, 'itemClick');
               assert.equal(event, 'nativeEvent');
               assert.equal(isNotify, true);
            });
            it('click item with menu', function(done) {
               let isNotify = false;
               let eventString = '';
               toolbar._beforeMount(config, null, records);
               let isHeadConfigCorrect = false;
               let standart = {
                  icon: 'icon-Ezy',
                  caption: 'Запись 2',
                  iconStyle: 'super',
                  iconSize: 'm'
               };
               itemWithMenu = new entity.Model({
                  rawData: {
                     id: '2',
                     title: 'Запись 2',
                     parent: null,
                     '@parent': true,
                     icon: 'icon-Ezy',
                     iconStyle: 'super',
                     iconSize: 'm'
                  }
               });
                let itemConfig = (new toolbars.View())._getMenuConfigByItem.call(toolbar, itemWithMenu);
                if (standart.caption === itemConfig.templateOptions.headConfig.caption &&
                    standart.icon === itemConfig.templateOptions.headConfig.icon &&
                    standart.iconStyle === itemConfig.templateOptions.headConfig.iconStyle &&
                    standart.iconSize === itemConfig.templateOptions.headConfig.iconSize) {
                    isHeadConfigCorrect = true;
                }
                assert.isTrue(isHeadConfigCorrect);
                toolbar._notify = (e) => {
                    eventString += e;
                    isNotify = true;
                };
                toolbar._sticky = {
                   open: () => 0
                };
                toolbar._itemClickHandler({
                    stopPropagation: () => {
                    }
                }, itemWithMenu);
                setTimeout(() => {
                    assert.equal(eventString, 'itemClickbeforeMenuOpen');
                    assert.equal(isNotify, true);
                });
                done();
            });
            it('menu item click', () => {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._notify = (e) => {
                  assert.equal(e, 'itemClick');
               };
               toolbar._children.menuOpener.close = function() {
                  isMenuClosed = true;
               };
               toolbar._resultHandler({
                  action: 'itemClick', event: {
                     name: 'event', stopPropagation: () => {
                     }
                  }, data: [itemWithMenu]
               });
            });
            it('menu not closed if item has child', function() {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._children.menuOpener.close = function() {
                  isMenuClosed = true;
               };
               assert.equal(isMenuClosed, false);
            });
            it('item popup config generation', () => {
               var
                  testItem = new entity.Model({
                     rawData: {
                        buttonViewMode: 'buttonViewMode',
                        popupClassName: 'popupClassName',
                        keyProperty: 'itemKeyProperty',
                        showHeader: true,
                        icon: 'icon icon-size',
                        title: 'title',
                        iconStyle: 'iconStyle'
                     }
                  }),
                  testSelf = {
                     _options: {
                        groupTemplate: 'groupTemplate',
                        groupingKeyCallback: 'groupingKeyCallback',
                        size: 'size',
                        theme: 'default',
                        keyProperty: 'keyProperty',
                        itemTemplateProperty: 'myTemplate',
                        iconSize: 'm',
                        nodeProperty: '@parent',
                        parentProperty: 'parent',
                        source: '_options.source'
                     },
                     _source: 'items',
                     _items: { getIndexByValue: () => {} },
                     _getSourceForMenu: () => Promise.resolve(testSelf._source),
                     _getMenuOptions: () => '',
                     _notify: () => '',
                     _getMenuTemplateOptions: () => toolbar._getMenuTemplateOptions.call(testSelf)
                  },
                  expectedConfig = {
                     opener: testSelf,
                     className: 'controls-Toolbar__popup__icon popupClassName controls_popupTemplate_theme-default controls_dropdownPopup_theme-default',
                     templateOptions: {
                        groupTemplate: 'groupTemplate',
                        groupProperty: undefined,
                        groupingKeyCallback: 'groupingKeyCallback',
                        keyProperty: 'keyProperty',
                        parentProperty: 'parent',
                        nodeProperty: '@parent',
                        iconSize: 'm',
                        itemTemplateProperty: 'myTemplate',
                        showHeader: true,
                        closeButtonVisibility: true,
                        headConfig: {
                           icon: 'icon icon-size',
                           caption: 'title',
                           iconSize: undefined,
                           iconStyle: 'iconStyle'
                        }
                     },
                     targetPoint: {
                        vertical: 'top',
                        horizontal: 'left'
                     },
                     direction: {
                        horizontal: 'right'
                     }
                  };
                assert.deepEqual(JSON.stringify((new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem)), JSON.stringify(expectedConfig));

                testSelf._items = { getIndexByValue: () => { return -1; } }; // для элемента не найдены записи в списке
                assert.deepEqual(JSON.stringify((new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem)), JSON.stringify(expectedConfig));

                testItem.set('showHeader', false);
                expectedConfig.templateOptions.showHeader = false;
                expectedConfig.templateOptions.closeButtonVisibility = true;
                assert.deepEqual(JSON.stringify((new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem)), JSON.stringify(expectedConfig));
            });
            it('get button template options by item', function() {
               let item = new entity.Record(
                  {
                     rawData: {
                        id: '0',
                        icon: 'icon-Linked',
                        fontColorStyle: 'secondary',
                        viewMode: 'toolButton',
                        iconStyle: 'secondary',
                        contrastBackground: true,
                        title: 'Связанные документы',
                        '@parent': false,
                        parent: null,
                        readOnly: true
                     }
                  }
               );
               let modifyItem = {
                  _buttonStyle: 'readonly',
                  _translucent: false,
                  _caption: undefined,
                  _captionPosition: 'right',
                  _contrastBackground: true,
                  _fontColorStyle: 'secondary',
                  _fontSize: 'm',
                  _hasIcon: true,
                  _height: 'l',
                  _hoverIcon: true,
                  _icon: 'icon-Linked',
                  _iconSize: 'm',
                  _iconStyle: 'readonly',
                  _isSVGIcon: false,
                  _stringCaption: false,
                  _viewMode: 'toolButton',
                  readOnly: true
               };
               assert.deepEqual((new toolbars.View())._getSimpleButtonTemplateOptionsByItem(item), modifyItem);

            });
            it('get functionalButton template options by item', function() {
               let item = new entity.Record(
                  {
                     rawData: {
                        id: '0',
                        icon: 'icon-RoundPlus',
                        fontColorStyle: 'secondary',
                        viewMode: 'functionalButton',
                        iconStyle: 'contrast',
                        title: 'Добавить',
                        '@parent': false,
                        parent: null
                     }
                  }
               );
               let modifyItem = (new toolbars.View())._getSimpleButtonTemplateOptionsByItem(item);
               assert.strictEqual(modifyItem._iconSize, 's');
               assert.strictEqual(modifyItem._height, 'default');
               assert.strictEqual(modifyItem._icon, 'icon-RoundPlus');
            });
            it('menu popup config generation', function() {
               let itemsForMenu = [
                  {
                     id: '1',
                     icon: 'myIcon'
                  },
                  {
                     id: '2',
                     iconStyle: 'secondary'
                  }
               ];

               let recordForMenu = new collection.RecordSet({
                  rawData: itemsForMenu
               });
               var
                  testSelf = {
                     _options: {
                        theme: 'default',
                        size: 'size',
                        additionalProperty: 'additional',
                        popupClassName: 'popupClassName',
                        itemTemplateProperty: 'itp',
                        groupTemplate: 'groupTemplate',
                        groupingKeyCallback: 'groupingKeyCallback',
                        iconSize: 'm',
                        iconStyle: 'secondary',
                        keyProperty: 'id',
                        nodeProperty: '@parent',
                        parentProperty: 'parent',
                        direction: 'horizontal'
                     },
                     _notify: () => {},
                     _children: {
                        menuTarget: 'menuTarget'
                     },
                     _menuSource: recordForMenu,
                     _getMenuOptions: () => toolbar._getMenuOptions(testSelf),
                     _getMenuTemplateOptions: () => toolbar._getMenuTemplateOptions.call(testSelf)
                  },
                  templateOptions = {
                     iconSize: 'm',
                     iconStyle: 'secondary',
                     keyProperty: 'id',
                     nodeProperty: '@parent',
                     parentProperty: 'parent',
                     source: recordForMenu,
                     additionalProperty: 'additional',
                     itemTemplateProperty: 'itp',
                     groupTemplate: 'groupTemplate',
                     groupingKeyCallback: 'groupingKeyCallback',
                     groupProperty: undefined,
                     footerContentTemplate: undefined,
                     itemActions: undefined,
                     itemActionVisibilityCallback: undefined,
                     dataLoadCallback: undefined,
                     closeButtonVisibility: true,
                     dropdownClassName: 'controls-Toolbar-horizontal__dropdown',
                     draggable: undefined
                  };
               const toolbar = new toolbars.View();
               const config = toolbar._getMenuConfig.call(testSelf);
               assert.deepEqual(config.templateOptions, templateOptions);
            });
            it('toolbar closed by his parent', () => {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._sticky = {
                  close: function () {
                     isMenuClosed = true;
                  }
               };
               toolbar._sticky.isOpened = () => true;
               toolbar._notify = () => {};
               toolbar._resultHandler('itemClick', itemWithOutMenu);
               assert.equal(isMenuClosed, true, 'toolbar closed, but his submenu did not');

               isMenuClosed = false;
               toolbar._notify = () => false;
               toolbar._resultHandler('itemClick', itemWithOutMenu);
               assert.equal(isMenuClosed, false, 'menu opened if notify click result is false');
            });
            it('_closeHandler', () => {
               const toolbarInst = new toolbars.View(config);
               const sandbox = sinon.createSandbox();

               sandbox.stub(toolbarInst, '_notify');
               toolbarInst._setStateByItems = sinon.fake();
               toolbarInst._setMenuSource = sinon.fake();

               toolbarInst._closeHandler();
               sinon.assert.calledWith(toolbarInst._notify, 'dropDownClose');
            });
            it('_setMenuSource', async() => {
               let Toolbar = new toolbars.View(config);
               await Toolbar._beforeMount(config);
               Toolbar._options = config;
               Toolbar._setMenuSource();
               assert.isTrue(Toolbar._menuSource instanceof sourceLib.PrefetchProxy);
               assert.isTrue(Toolbar._menuSource._$target instanceof sourceLib.Memory);
               assert.isTrue(Toolbar._menuSource._$data.query instanceof collection.RecordSet);
            });
            it('_setMenuSource without source', async() => {
               const cfg = {
                  items: new collection.RecordSet({
                     rawData: defaultItems
                  }),
                  parentProperty: 'parent',
                  nodeProperty: '@parent'
               };
               let Toolbar = new toolbars.View(cfg);
               await Toolbar._beforeMount(cfg);
               Toolbar._options = cfg;
               Toolbar._setMenuSource();
               assert.isTrue(Toolbar._menuSource instanceof sourceLib.PrefetchProxy);
               assert.isTrue(Toolbar._menuSource._$target instanceof sourceLib.Memory);
               assert.isTrue(Toolbar._menuSource._$data.query instanceof collection.RecordSet);
            });
            it('_getMenuOptions - fittingMode', () => {
               let Toolbar = new toolbars.View(config);
               Toolbar._beforeMount(config);
               //все остальное дублируется и проверяется в _getMenuConfigByItem
               //TODO: https://online.sbis.ru/opendoc.html?guid=36b0e31d-a773-4e11-b3d5-196ffd07058c
               let fittingMode = {
                  vertical: 'adaptive',
                  horizontal: 'overflow'
               };
               assert.deepEqual(Toolbar._getMenuOptions().fittingMode, fittingMode);
            });
            it('update menuItems when items/source changed', () => {
               let options = {
                  items: records
               };
               let newOptions = {
                  items: new collection.RecordSet({
                     rawData: [{
                        id: '1',
                        title: 'Запись 1',
                        parent: null,
                        '@parent': null
                     },
                        {
                           id: '2',
                           title: 'Запись 2',
                           parent: null,
                           '@parent': true,
                           icon: 'icon-Ezy',
                           iconStyle: 'super'
                        },
                        {
                           id: '3',
                           title: 'Запись 3',
                           icon: 'icon-medium icon-Doge icon-primary',
                           parent: null,
                           '@parent': null,
                           showType: 2
                        }]
                  })
               };
               const event = {
                   nativeEvent: {
                       button: 0
                   }
               }
               let isMenuItemsChanged = false;
               let Toolbar = new toolbars.View(options);
               Toolbar._notify = () => {};
               Toolbar._openMenu = () => {};
               Toolbar._setMenuSource = () => {
                  isMenuItemsChanged = true;
                  return {
                     then: function(func) {
                        func();
                     }
                  };
               };
               Toolbar._beforeMount(options);
               Toolbar._mouseDownHandler(event);
               assert.isTrue(isMenuItemsChanged);

               Toolbar._beforeUpdate(newOptions);
               isMenuItemsChanged = false;
               assert.isFalse(Toolbar._isLoadMenuItems);
               Toolbar._mouseDownHandler(event);
               assert.isTrue(isMenuItemsChanged);
               assert.isTrue(Toolbar._isLoadMenuItems);

            });
         });
         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   }
);
