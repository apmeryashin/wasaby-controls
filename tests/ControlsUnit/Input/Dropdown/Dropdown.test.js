define(
   [
      'Controls/dropdown',
      'Core/core-clone',
      'Types/source',
      'Types/collection',
      'Types/entity',
      'Controls/popup',
      'Controls/_dropdown/Util'
],
   (dropdown, Clone, sourceLib, collection, entity, popup, dropdownUtil) => {
      describe('Controls/_dropdown:Selector', () => {
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
               title: 'Запись 3'
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
               icon: 'icon-16 icon-Admin icon-primary'
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
            rawData: items
         });

         let config = {
            selectedKeys: ['2'],
            displayProperty: 'title',
            keyProperty: 'id',
            maxVisibleItems: 1,
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: items
            }),
            closeMenuOnOutsideClick: true
         };


         let getDropdown = function(config) {
            let dropdownList = new dropdown.Selector(config);
            dropdownList.saveOptions(config);
            return dropdownList;
         };
         let dropdownList = new dropdown.Selector(config);

         it('data load callback', () => {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState(config, [itemsRecords.at(5)]);
            assert.equal(ddl._text, 'Запись 6');
            assert.equal(ddl._icon, 'icon-16 icon-Admin icon-primary');
            ddl._prepareDisplayState(config, [{ id: null }]);
            assert.equal(ddl._icon, null);
         });

         it('_beforeMount loadSelectedItems', function() {
            const ddl = getDropdown(config);
            let isSelectedItemsLoad = false;
            dropdownUtil.loadSelectedItems = () => {
               isSelectedItemsLoad = true;
            };
            ddl._beforeMount({
               navigation: true
            });
            assert.isFalse(isSelectedItemsLoad);

            ddl._beforeMount({
               navigation: true,
               selectedKeys: [1, 2, 3]
            });
            assert.isTrue(isSelectedItemsLoad);
         });

         it('_beforeMount items', function() {
            const ddl = getDropdown(config);
            ddl._beforeMount({
               ...config,
               source: null,
               items: itemsRecords
            });
            assert.equal(ddl._text, 'Запись 2');
         });

         it('_getMoreText', () => {
            let ddl = getDropdown(config);

            // maxVisibleItems = null
            let moreText = ddl._getMoreText([itemsRecords.at(1), itemsRecords.at(3), itemsRecords.at(5)], null);
            assert.equal(moreText, '');

            // maxVisibleItems = 1
            moreText = ddl._getMoreText([itemsRecords.at(1), itemsRecords.at(3), itemsRecords.at(5)], 1);
            assert.equal(moreText, ', еще 2');

            // maxVisibleItems = 2
            moreText = ddl._getMoreText([itemsRecords.at(1), itemsRecords.at(3), itemsRecords.at(5)], 2);
            assert.equal(moreText, ', еще 1');

            // maxVisibleItems = 2
            moreText = ddl._getMoreText([itemsRecords.at(1), itemsRecords.at(3)], 2);
            assert.equal(moreText, '');
         });

         it('_getText', () => {
            let ddl = getDropdown(config);
            let selectedItems = [itemsRecords.at(0), itemsRecords.at(2), itemsRecords.at(4)];
            const options = {
               maxVisibleItems: 1,
               displayProperty: 'title'
            };

            // maxVisibleItems = null
            let text = ddl._getText([], {
               emptyText: 'emptyText',
               emptyKey: null
            });
            assert.equal(text, 'emptyText');

            // maxVisibleItems = 1
            text = ddl._getText(selectedItems, options);
            assert.equal(text, 'Запись 1');

            // maxVisibleItems = 2
            options.maxVisibleItems = 2;
            text = ddl._getText(selectedItems, options);
            assert.equal(text, 'Запись 1, Запись 3');

            // maxVisibleItems = null
            options.maxVisibleItems = null;
            text = ddl._getText(selectedItems, options);
            assert.equal(text, 'Запись 1, Запись 3, Запись 5');
         });

         it('check selectedItemsChanged event', () => {
            let ddl = getDropdown(config);
            let keys, text, isKeysChanged;
            ddl._notify = (e, data) => {
               if (e === 'selectedKeysChanged') {
                  isKeysChanged = true;
                  keys = data[0];
               }
               if (e === 'textValueChanged') {
                  text = data[0];
               }
            };
            ddl._selectedItemsChangedHandler([itemsRecords.at(5)], ['6']);
            assert.deepEqual(keys, ['6']);
            assert.strictEqual(text, 'Запись 6');
            assert.isTrue(isKeysChanged);

            isKeysChanged = false;
            ddl._options.selectedKeys = ['6'];
            ddl._selectedItemsChangedHandler([itemsRecords.at(5)], ['6']);
            assert.isFalse(isKeysChanged);
         });

         it('_handleMouseDown', () => {
            let isOpened = false;
            let ddl = getDropdown(config);
            ddl.openMenu = () => { isOpened = true; };

            const event = { nativeEvent: { button: 2 }, stopPropagation: () => {} };
            ddl._handleMouseDown(event);
            assert.isFalse(isOpened);

            event.nativeEvent.button = 0;
            ddl._handleMouseDown(event);
            assert.isTrue(isOpened);
         });

         it('openMenu', async () => {
            let actualOptions = null;
            let target;
            let ddl = getDropdown(config);
            ddl._controller = {
               setMenuPopupTarget: () => { target = 'test'; },
               openMenu: (popupConfig) => { actualOptions = popupConfig; return Promise.resolve(); }
            };

            ddl.openMenu();
            assert.isOk(actualOptions.templateOptions);
            assert.equal(target, 'test');

            ddl.openMenu({ newOptionsPopup: 'test2', templateOptions: { customTemplateOption: 'test2' } });
            assert.isOk(actualOptions.templateOptions.selectorDialogResult);
            assert.equal(actualOptions.templateOptions.customTemplateOption, 'test2');
            assert.equal(actualOptions.newOptionsPopup, 'test2');

            let actualKey;
            const item = new entity.Model({ rawData: { id: 1 } });
            ddl._controller.openMenu = () => Promise.resolve([item]);
            ddl._selectedItemsChangedHandler = (items, keys) => {
               actualKey = keys[0];
            };
            await ddl.openMenu();
            assert.equal(actualKey, 1);
         });

         it('_dataLoadCallback', () => {
            let ddl = getDropdown(config);
            ddl._dataLoadCallback(new collection.RecordSet({
               rawData: [1, 2, 3]
            }));
            assert.equal(ddl._countItems, 3);

            ddl._options.emptyText = 'empty text';
            ddl._dataLoadCallback(new collection.RecordSet({
               rawData: [1, 2, 3]
            }));
            assert.equal(ddl._countItems, 4);
         });

         it('_prepareDisplayState empty items', () => {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState(config, []);
            assert.equal(ddl._text, '');
         });

         it('_prepareDisplayState emptyText=true', () => {
            let newConfig = Clone(config);
            newConfig.emptyText = true;
            let ddl = getDropdown(newConfig);
            ddl._prepareDisplayState(newConfig, [null]);
            assert.equal(ddl._text, 'Не выбрано');
            assert.isNull(ddl._icon);

            const emptyItem = new entity.Model({
               rawData: { id: null }
            });
            ddl._prepareDisplayState(newConfig, [emptyItem]);
            assert.equal(ddl._text, 'Не выбрано');
            assert.isNull(ddl._icon);
         });

         it('_private::getTooltip', function() {
            let ddl = getDropdown(config);
            ddl._prepareDisplayState(config, [null]);
            assert.equal(ddl._tooltip, '');

            const selectedItems = [
               new entity.Model({
                  rawData: items[0]
               }),
               new entity.Model({
                  rawData: items[1]
               }),
               new entity.Model({
                  rawData: items[2]
               })
            ];
            ddl._prepareDisplayState(config, selectedItems);
            assert.equal(ddl._tooltip, 'Запись 1, Запись 2, Запись 3');
         });

         it('_selectorTemplateResult', () => {
            let opened;
            let newConfig = Clone(config);
            let ddl = getDropdown(newConfig);
            ddl._beforeMount(config);
            popup.Sticky.closePopup = () => { opened = false; };
            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
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
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  },
                  {
                     id: '9',
                     title: 'Запись 9'
                  },
                  {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            ddl._controller._items = curItems;
            ddl._controller._source = config.source;
            let newItems = [ {
               id: '9',
               title: 'Запись 9'
            },
            {
               id: '10',
               title: 'Запись 10'
            },
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
               title: 'Запись 3'
            }
            ];

            ddl._selectorTemplateResult('selectorResult', selectedItems);
            assert.deepEqual(newItems, ddl._controller._items.getRawData());
         });

         it('_selectorTemplateResult selectorCallback', () => {
            let newConfig = Clone(config);
            let ddl = getDropdown(newConfig);
            let opened;
            ddl._beforeMount(config);
            ddl._notify = (event, data) => {
               if (event === 'selectorCallback') {
                  data[1].at(0).set({id: '11', title: 'Запись 11'});
               }
            };
            popup.Sticky.closePopup = () => { opened = false; };

            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
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
                  keyProperty: 'id',
                  rawData: [{
                     id: '1',
                     title: 'Запись 1'
                  },
                  {
                     id: '9',
                     title: 'Запись 9'
                  },
                  {
                     id: '10',
                     title: 'Запись 10'
                  }]
               });
            ddl._controller._items = curItems;
            ddl._controller._source = config.source;
            let newItems = [
               { id: '11', title: 'Запись 11' },
               { id: '9', title: 'Запись 9' },
               { id: '10', title: 'Запись 10' },
               { id: '1', title: 'Запись 1' },
               { id: '2', title: 'Запись 2' },
               { id: '3', title: 'Запись 3' }
            ];

            ddl._selectorTemplateResult('selectorResult', selectedItems);
            assert.deepEqual(newItems, ddl._controller._items.getRawData());
         });

         it('_selectorResult', function() {
            let newConfig = Clone(config);
            let ddl = getDropdown(newConfig);
            ddl._beforeMount(config);
            let curItems = new collection.RecordSet({
                  keyProperty: 'id',
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
               selectedItems = new collection.List({
                  items: [new entity.Model({
                     keyProperty: 'key',
                     rawData: {
                        id: '1',
                        title: 'Запись 1'
                     }
                  }),
                  new entity.Model({
                     keyProperty: 'key',
                     rawData: {
                        id: '9',
                        title: 'Запись 9'
                     }
                  })]
               });
            let selectedKeys;
            ddl._controller._items = curItems;
            ddl._notify = (e, data) => {
               if (e === 'selectedKeysChanged') {
                  selectedKeys = data[0];
               }
            };
            let newItems = [ {
               id: '9',
               title: 'Запись 9'
            },
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
               title: 'Запись 3'
            }
            ];
            ddl._controller._source = config.source;
            ddl._selectorResult(selectedItems);
            assert.deepEqual(newItems, ddl._controller._items.getRawData());
            assert.isOk(ddl._controller._menuSource);
            assert.deepEqual(selectedKeys, ['1', '9']);
         });

         describe('controller options', function() {
            const ddl = getDropdown(config);

            it('check options', () => {
               const result = ddl._getControllerOptions({
                  nodeFooterTemplate: 'testNodeFooterTemplate'
               });

               assert.equal(result.nodeFooterTemplate, 'testNodeFooterTemplate');
               assert.isOk(result.selectorOpener);
               assert.include(result.popupClassName, 'controls-DropdownList__margin');
            });

            it('popupClassName with header', () => {
               const result = ddl._getControllerOptions({
                  nodeFooterTemplate: 'testNodeFooterTemplate',
                  headerContentTemplate: 'template'
               });

               assert.include(result.popupClassName, 'controls-DropdownList__margin');
            });

            it('emptyTemplate', () => {
               const result = ddl._getControllerOptions({
                  emptyTemplate: 'testEmptyTemplate'
               });

               assert.equal(result.emptyTemplate, 'testEmptyTemplate');
            });

            it('popupClassName with multiSelect', () => {
               const result = ddl._getControllerOptions({
                  nodeFooterTemplate: 'testNodeFooterTemplate',
                  multiSelect: true
               });

               assert.include(result.popupClassName, 'controls-DropdownList_multiSelect__margin');
            });
         });

         it('_deactivated', function() {
            let opened = true;
            const ddl = getDropdown(config);
            ddl._beforeMount(config);
            ddl._controller.closeMenu = () => { opened = false; };
            ddl._deactivated();
            assert.isFalse(opened);
         });
      });
   }
);
