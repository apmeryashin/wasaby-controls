define([
   'Controls/List/EditInPlace',
   'WS.Data/Collection/RecordSet',
   'WS.Data/Entity/Model',
   'Core/Deferred',
   'WS.Data/Source/Memory',
   'Controls/List/ListViewModel'
], function(
   EditInPlace,
   RecordSet,
   Model,
   Deferred,
   Memory,
   ListViewModel
) {
   describe('Controls.List.EditInPlace', function() {
      var eip, items, newItem, listModel, listModelWithGroups, data;
      beforeEach(function() {
         data = [
            {
               id: 1,
               title: 'Первый',
               type: 'goods'
            },
            {
               id: 2,
               title: 'Второй',
               type: 'goods'
            },
            {
               id: 3,
               title: 'Третий',
               type: 'services'
            }
         ];
         items = new RecordSet({
            rawData: data,
            idProperty: 'id'
         });
         newItem = new Model({
            rawData: {
               id: 4,
               title: 'Четвёртый'
            },
            idProperty: 'id'
         });
         listModel = new ListViewModel({
            items: items.clone(),
            keyProperty: 'id',
            displayProperty: 'title'
         });
         listModelWithGroups = new ListViewModel({
            items: items.clone(),
            keyProperty: 'id',
            displayProperty: 'title',
            itemsGroup: {
               method: function(item) {
                  return item.get('type');
               }
            }
         });
         eip = new EditInPlace();
         eip._children = {
            formController: {
               submit: function() {
                  return Deferred.success();
               }
            }
         };
      });

      afterEach(function() {
         eip.destroy();
         listModel.destroy();
         listModelWithGroups.destroy();
         eip = undefined;
         listModel = undefined;
         listModelWithGroups = undefined;
         newItem = undefined;
         items = undefined;
      });

      describe('_beforeMount', function() {
         it('Edit', function() {
            eip._beforeMount({
               listModel: listModel,
               editingConfig: {
                  item: listModel.at(0).getContents()
               }
            });
            assert.equal(listModel.at(0).getContents(), eip._editingItem);
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('Add', function() {
            eip._beforeMount({
               listModel: listModel,
               editingConfig: {
                  item: newItem
               }
            });
            assert.equal(newItem, eip._editingItem);
            assert.isTrue(eip._isAdd);
         });
      });

      describe('beginEdit', function() {
         it('Cancel', function() {
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return 'Cancel';
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            var result = eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isFalse(result.isSuccessful());
         });

         it('Without handler', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(listModel.at(0).getContents().isEqual(eip._editingItem));
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('Deferred', function() {
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return Deferred.success({
                     item: listModel.at(1).getContents()
                  });
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(listModel.at(1).getContents().isEqual(eip._editingItem));
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('Record', function() {
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     item: listModel.at(1).getContents()
                  };
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            assert.isTrue(listModel.at(1).getContents().isEqual(eip._editingItem));
            assert.equal(listModel.at(0).getContents(), eip._originalItem);
         });

         it('afterBeginEdit', function(done) {
            var source = new Memory({
               idProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip._notify = function(event, args) {
               if (event === 'afterBeginEdit') {
                  assert.equal(eip._editingItem, args[0]);
                  assert.isNotOk(args[1]);
                  done();
               }
            };

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
         });
      });

      describe('beginAdd', function() {
         it('Without handler', function(done) {
            var source = new Memory({
               idProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginAdd().addCallback(function() {
               assert.instanceOf(eip._editingItem, Model);
               assert.isTrue(eip._isAdd);
               done();
            });
         });

         it('Object without item', function(done) {
            var source = new Memory({
               idProperty: 'id',
               data: items
            });
            eip._notify = function(e) {
               if (e === 'beforeBeginEdit') {
                  return {
                     addPosition: 'bottom'
                  };
               }
            };

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginAdd().addCallback(function() {
               assert.instanceOf(eip._editingItem, Model);
               assert.isTrue(eip._isAdd);
               done();
            });
         });

         it('afterBeginEdit', function(done) {
            var source = new Memory({
               idProperty: 'id',
               data: items
            });

            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip._notify = function(event, args) {
               if (event === 'afterBeginEdit') {
                  assert.equal(eip._editingItem, args[0]);
                  assert.isTrue(args[1]);
                  done();
               }
            };

            eip.beginAdd({
               item: newItem
            });
         });
      });

      describe('commitEdit', function() {
         it('Without editing item', function() {
            eip.saveOptions({
               listModel: listModel
            });

            var result = eip.commitEdit();
            assert.isTrue(result.isSuccessful());
         });

         it('Without handler', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            eip._editingItem.set('title', '1234');
            var result = eip.commitEdit();
            assert.isTrue(result.isSuccessful());
            assert.equal(listModel.at(0).getContents().get('title'), '1234');
         });

         it('Cancel', function() {
            eip._notify = function(e) {
               if (e === 'beforeEndEdit') {
                  return 'Cancel';
               }
            };

            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            var result = eip.commitEdit();

            assert.isFalse(result.isSuccessful());
         });

         it('Deferred', function() {
            eip._notify = function(e) {
               if (e === 'beforeEndEdit') {
                  return Deferred.success();
               }
            };
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            var result = eip.commitEdit();
            assert.isTrue(result.isSuccessful());
         });

         it('With source', function(done) {
            var source = new Memory({
               idProperty: 'id',
               data: data
            });
            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            eip._editingItem.set('title', '1234');
            eip.commitEdit().addCallback(function() {
               assert.equal(listModel.at(0).getContents().get('title'), '1234');
               source.read(1).addCallback(function(result) {
                  assert.equal(result.get('title'), '1234');
                  done();
               });
            });
         });

         it('Add item', function(done) {
            var source = new Memory({
               idProperty: 'id',
               data: data
            });
            eip.saveOptions({
               listModel: listModel,
               source: source
            });

            eip.beginAdd({
               item: newItem
            });

            eip._editingItem.set('title', '1234');
            eip.commitEdit().addCallback(function() {
               assert.equal(listModel.at(3).getContents().get('title'), '1234');
               assert.equal(listModel.getCount(), 4);
               source.read(4).addCallback(function(result) {
                  assert.equal(result.get('title'), '1234');
                  done();
               }).addErrback(function(err) {
                  console.log(err);
               });
            });
         });

         it('Validation fail', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginAdd({
               item: newItem
            });
            eip._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({
                        0: [{
                           0: 'Поле обязательно для заполнения'
                        }]
                     });
                  }
               }
            };
            var result = eip.commitEdit();
            assert.isFalse(result.isSuccessful());
         });

         describe('afterEndEdit', function() {
            it('add item', function(done) {
               var source = new Memory({
                  idProperty: 'id',
                  data: data
               });
               eip.saveOptions({
                  listModel: listModel,
                  source: source
               });

               eip.beginAdd({
                  item: newItem
               });

               eip._editingItem.set('title', '1234');

               eip._notify = function(event, args) {
                  if (event === 'afterEndEdit') {
                     assert.equal(eip._editingItem, args[0]);
                     assert.isTrue(args[1]);
                     done();
                  }
               };
               eip.commitEdit();
            });

            it('edit item', function(done) {
               var source = new Memory({
                  idProperty: 'id',
                  data: data
               });
               eip.saveOptions({
                  listModel: listModel,
                  source: source
               });

               eip.beginEdit({
                  item: listModel.at(0).getContents()
               });

               eip._editingItem.set('title', '1234');

               eip._notify = function(event, args) {
                  if (event === 'afterEndEdit') {
                     assert.equal(listModel.at(0).getContents(), args[0]);
                     assert.isNotOk(args[1]);
                     done();
                  }
               };
               eip.commitEdit();
            });
         });
      });

      describe('cancelEdit', function() {
         it('Without editing item', function() {
            eip.saveOptions({
               listModel: listModel
            });

            var result = eip.cancelEdit();
            assert.isTrue(result.isSuccessful());
         });

         it('With item', function() {
            eip.saveOptions({
               listModel: listModel
            });

            eip.beginEdit({
               item: listModel.at(0).getContents()
            });
            eip._editingItem.set('title', '1234');
            var result = eip.cancelEdit();
            assert.isTrue(result.isSuccessful());
            assert.equal(listModel.at(0).getContents().get('title'), 'Первый');
         });
      });

      describe('_onKeyDown', function() {
         it('Enter', function() {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModel.at(1).getContents());
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel);
            eip._onKeyDown({
               nativeEvent: {
                  keyCode: 13
               }
            });
         });

         it('Enter on last item', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel);
            eip._onKeyDown({
               nativeEvent: {
                  keyCode: 13
               }
            });
         });


         it('Enter on last item, autoAdd', function(done) {
            eip.beginAdd = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  autoAdd: true
               }
            });
            eip._sequentialEditing = true;
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel);
            eip._onKeyDown({
               nativeEvent: {
                  keyCode: 13
               }
            });
         });

         it('Enter, sequentialEditing: false', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  sequentialEditing: false
               }
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel);
            eip._onKeyDown({
               nativeEvent: {
                  keyCode: 13
               }
            });
         });

         it('Esc', function(done) {
            eip.cancelEdit = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  sequentialEditing: false
               }
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel);
            eip._onKeyDown({
               nativeEvent: {
                  keyCode: 27
               }
            });
         });

         it('Tab', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModel.at(1).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab but next item is a group', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModelWithGroups.at(4).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on last item', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on third to last item but next two items are groups', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            eip.beginAdd = function() {
               throw new Error('beginAdd shouldn\'t be called.');
            };
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            listModelWithGroups.toggleGroup('services');
            listModelWithGroups.toggleGroup('whatever');
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on last item, autoAdd', function(done) {
            eip.beginAdd = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModel,
               editingConfig: {
                  autoAdd: true
               }
            });
            eip._editingItem = listModel.at(2).getContents();
            eip._setEditingItemData(listModel.at(2).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Tab on third to last item but next two items are groups, autoAdd: true', function(done) {
            eip.commitEdit = function() {
               throw new Error('commitEdit shouldn\'t be called.');
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            eip.beginAdd = function() {
               done();
            };
            eip.saveOptions({
               listModel: listModelWithGroups,
               editingConfig: {
                  autoAdd: true
               }
            });
            listModelWithGroups.toggleGroup('services');
            listModelWithGroups.toggleGroup('whatever');
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true
            });
         });

         it('Shift+Tab', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, eip._options.listModel.at(0).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(1).getContents();
            eip._setEditingItemData(listModel.at(1).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         it('Shift+Tab but previous item is a group', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, listModelWithGroups.at(2).getContents());
               done();
            };
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            eip._editingItem = listModelWithGroups.at(4).getContents();
            eip._setEditingItemData(listModelWithGroups.at(4).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         it('Shift+Tab on first item', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            eip.saveOptions({
               listModel: listModel
            });
            eip._editingItem = listModel.at(0).getContents();
            eip._setEditingItemData(listModel.at(0).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });

         it('Shift+Tab on third item, but first two items are groups', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called.');
            };
            eip.saveOptions({
               listModel: listModelWithGroups
            });
            listModelWithGroups.toggleGroup('goods');
            eip._editingItem = listModelWithGroups.at(2).getContents();
            eip._setEditingItemData(listModelWithGroups.at(2).getContents(), eip._options.listModel);
            eip._onRowDeactivated({
               stopPropagation: function() {

               }
            }, {
               isTabPressed: true,
               isShiftKey: true
            });
         });
      });

      describe('_onItemClick', function() {
         it('clickItemInfo', function() {
            eip.beginEdit = function() {};
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               }
            });
            eip._onItemClick({}, newItem, {
               target: {
                  closest: function() {
                     return false;
                  }
               },
               nativeEvent: {
                  clientX: 10,
                  clientY: 20
               }
            });
            assert.equal(eip._clickItemInfo.item, newItem);
            assert.equal(eip._clickItemInfo.clientX, 10);
            assert.equal(eip._clickItemInfo.clientY, 20);
         });

         it('editOnClick: true, notEditable element', function(done) {
            eip.commitEdit = function() {
               done();
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               }
            });

            eip._onItemClick({}, newItem, {
               target: {
                  closest: function() {
                     return true;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               }
            });
         });

         it('editOnClick: true', function(done) {
            eip.beginEdit = function(options) {
               assert.equal(options.item, newItem);
               done();
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               }
            });

            eip._onItemClick({}, newItem, {
               target: {
                  closest: function() {
                     return false;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               }
            });
         });

         it('editOnClick: false', function() {
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called if editOnClick is false');
            };
            eip._onItemClick({}, newItem);
         });

         it('readOnly, commitEdit', function() {
            eip.commitEdit = function() {
               throw new Error('commitEdit shouldn\'t be called if EditInPlace is readOnly');
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               },
               readOnly: true
            });

            eip._onItemClick({}, newItem, {
               target: {
                  closest: function() {
                     return true;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               }
            });
         });

         it('readOnly, beginEdit', function() {
            eip.beginEdit = function() {
               throw new Error('beginEdit shouldn\'t be called if EditInPlace is readOnly');
            };
            eip.saveOptions({
               editingConfig: {
                  editOnClick: true
               },
               readOnly: true
            });

            eip._onItemClick({}, newItem, {
               target: {
                  closest: function() {
                     return false;
                  }
               },
               nativeEvent: {
                  clientX: 0,
                  clientY: 0
               }
            });
         });
      });

      describe('_beforeUpdate', function() {
         it('editingConfig has sequential editing', function() {
            eip._beforeUpdate({
               editingConfig: {
                  sequentialEditing: false
               }
            });
            assert.isFalse(eip._sequentialEditing);
            eip._beforeUpdate({
               editingConfig: {
                  sequentialEditing: true
               }
            });
            assert.isTrue(eip._sequentialEditing);
         });

         it('editingConfig doesn\'t have sequential editing', function() {
            eip._beforeUpdate({
               editingConfig: {

               }
            });
            assert.isTrue(eip._sequentialEditing);
         });

         it('editing config doesn\'t exist', function() {
            eip._beforeUpdate({});
            assert.isTrue(eip._sequentialEditing);
         });
      });
   });
});
