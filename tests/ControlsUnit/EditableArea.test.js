define([
   'Controls/editableArea',
   'Types/entity',
   'Core/Deferred',
   'Controls/list'
], function(
   editableArea,
   entity,
   Deferred,
   Constants
) {
   'use strict';

   describe('Controls.editableArea:View', function() {
      var
         eventQueue,
         instance,
         cfg,
         cfg2;
      beforeEach(function() {
         eventQueue = [];
         instance = new editableArea.View();
         cfg = {
            autoEdit: true,
            editingObject: entity.Model.fromObject({
               text: 'qwerty'
            })
         };
         cfg2 = {
            autoEdit: false,
            editingObject: entity.Model.fromObject({
               text: 'test'
            })
         };
      });
      afterEach(function() {
         instance = null;
      });

      function mockNotify(returnValue) {
         return function(event, eventArgs, eventOptions) {
            eventQueue.push({
               event: event,
               eventArgs: eventArgs,
               eventOptions: eventOptions
            });
            return returnValue;
         };
      }

      it('_beforeMount', function() {
         instance._beforeMount(cfg);
         assert.equal(cfg.isEditing, instance.editWhenFirstRendered);
      });

      describe('_onClickHandler', function() {
         it('isEditing: true', function() {
            var result = false;
            instance.saveOptions({
               readOnly: false
            });
            instance._beforeMount(cfg);
            instance.beginEdit = function() {
               result = true;
            };
            instance._onClickHandler();
            assert.isFalse(result);
         });
         it('isEditing: false', function() {
            var result = false;
            instance.saveOptions({
               readOnly: false
            });
            instance._beforeMount(cfg2);
            instance.beginEdit = function() {
               result = true;
            };
            instance._onClickHandler();
            assert.isTrue(result);
         });
      });

      describe('_onDeactivatedHandler', function() {
         var result = null;
         beforeEach(function() {
            instance.commitEdit = function() {
               result = true;
            };
         });
         afterEach(function() {
            result = null;
         });

         it('commitOnDeactivate: true, isEditing: true', function() {
            instance.saveOptions({
               readOnly: false
            });
            instance._beforeMount(cfg);
            instance._onDeactivatedHandler();
            assert.isTrue(result);
         });

         it('if EditableArea has toolbar then changes should not commit on deactivated', function() {
            cfg = {
               readOnly: false,
               toolbarVisible: true,
               ...cfg
            };
            const event = {
               stopPropagation: () => {}
            };
            result = false;
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._onDeactivatedHandler();
            assert.isTrue(result);

            result = false;
            instance._registerEditableAreaToolbar(event);
            instance._onDeactivatedHandler();
            assert.isFalse(result);
         });
      });

      describe('_onKeyDown', function() {
         it('Enter', function() {
            var result = false;
            instance._beforeMount(cfg);
            instance.commitEdit = function() {
               result = true;
            };
            instance._onKeyDown({
               nativeEvent: {
                  keyCode: 13
               }
            });
            assert.isTrue(result);
         });
         it('Esc', function() {
            var result = false;
            instance._beforeMount(cfg);
            instance.cancelEdit = function() {
               result = true;
            };
            instance._onKeyDown({
               nativeEvent: {
                  keyCode: 27
               }
            });
            assert.isTrue(result);
         });
      });

      describe('beginEdit', function() {
         var
            event = {
               target: {
                  closest: function(selector) {
                     return selector === '.controls-EditableArea__editorWrapper';
                  }
               }
            };

         it('_beforeUpdate', () => {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance.beginEdit(event);
            assert.isTrue(instance._isEditing);
            assert.isFalse(instance._options.editingObject === instance._editingObject);
            instance._beforeUpdate(cfg);
            assert.isFalse(instance._options.editingObject === instance._editingObject);
         });

         it('without cancelling', function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance.beginEdit(event);
            assert.equal(eventQueue[0].event, 'beforeBeginEdit');
            assert.isTrue(eventQueue[0].eventArgs[0].isEqual(instance._options.editingObject));
            assert.isTrue(eventQueue[0].eventOptions.bubbling);
            assert.isTrue(instance._isEditing);
            assert.isTrue(instance._isStartEditing);
         });

         it('without arguments', function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance.beginEdit();
            assert.equal(eventQueue[0].event, 'beforeBeginEdit');
            assert.isTrue(eventQueue[0].eventArgs[0].isEqual(instance._options.editingObject));
            assert.isTrue(eventQueue[0].eventOptions.bubbling);
            assert.isTrue(instance._isEditing);
            assert.isTrue(instance._isStartEditing);
         });

         it('cancel', function() {
            instance.saveOptions(cfg2);
            instance._beforeMount(cfg2);
            instance._notify = mockNotify(Constants.editing.CANCEL);
            instance.beginEdit(event);
            assert.equal(eventQueue[0].event, 'beforeBeginEdit');
            assert.isTrue(eventQueue[0].eventArgs[0].isEqual(instance._options.editingObject));
            assert.isTrue(eventQueue[0].eventOptions.bubbling);
            assert.isFalse(instance._isEditing);
            assert.isNotOk(instance._isStartEditing);
         });
      });

      describe('cancelEdit', function() {
         it('without cancelling', function() {
            instance._beforeMount(cfg);
            instance.saveOptions(cfg);
            instance._notify = mockNotify();
            instance._editingObject.set('text', 'changed');
            instance.cancelEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editingObject);
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editingObject);
            assert.equal(instance._editingObject.get('text'), 'qwerty');
            assert.isFalse(instance._editingObject.isChanged());
            assert.isFalse(instance._options.editingObject.isChanged());
            assert.isFalse(instance._isEditing);
         });

         it('call without starting editing', function() {
            instance._beforeMount(cfg2);
            instance.saveOptions(cfg2);
            instance._notify = mockNotify();
            instance.cancelEdit();
            assert.equal(eventQueue.length, 0);
         });

         it('cancel', function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Constants.editing.CANCEL);
            instance._editingObject.set('text', 'changed');
            instance.cancelEdit();
            assert.equal(eventQueue.length, 1);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editingObject);
            assert.equal(instance._editingObject.get('text'), 'changed');
            assert.isTrue(instance._editingObject.isChanged());
            assert.isTrue(instance._options.editingObject.isChanged());
         });

         it('callback cancel', function() {
            instance.saveOptions(cfg2);
            instance._beforeMount(cfg2);
            instance._isEditing = true;
            let prom = new Promise((resolve) => {resolve(null)});
            instance._notify = mockNotify(prom.then(() => {
               return Constants.editing.CANCEL;
            }));
            instance._editingObject.set('text', 'changed');
            instance.cancelEdit();
            assert.equal(eventQueue.length, 1);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editingObject);
            assert.equal(instance._editingObject.get('text'), 'changed');
            assert.isTrue(instance._editingObject.isChanged());
            assert.isTrue(instance._options.editingObject.isChanged());
         });

         it ('clone in begitedit', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            // начинаем редактирование, делаем клон записи с подтверждением изменений.
            instance.beginEdit();
            // меняем рекорд
            instance._editingObject.set('text', 'asdf');
            // завершаем редактирование с сохранением
            await instance.commitEdit();
            // проверили, что опция поменялась
            assert.equal(cfg.editingObject.get('text'), 'asdf');

            // вновь начинаем редактирование, делаем клон записи с подтверждением изменений.
            instance.beginEdit();
            // меняем рекорд
            instance._editingObject.set('text', 'changed');
            // проверяем предыдущее состояние, к которому будем откатывать.
            assert.equal(instance._editingObject._changedFields.text, 'asdf');
            // завершаем редактирование с отменой. Не сохраняем.
            await instance.cancelEdit();
            // проверили, что опция не поменялась
            assert.equal(cfg.editingObject.get('text'), 'asdf');

         });
         it ('change options after edit-mode', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            // начинаем редактирование, делаем клон записи с подтверждением изменений.
            instance.beginEdit();
            // меняем рекорд
            instance._editingObject.set('text', 'asdf');
            // завершаем редактирование с сохранением
            await instance.commitEdit();
            // проверили, что опция поменялась
            assert.equal(cfg.editingObject.get('text'), 'asdf');

            // меняем опцию и проверяем, что поменялся _editingObject
            const newCfg = {
               editWhenFirstRendered: true,
               editingObject: entity.Model.fromObject({
                  text: 'changed'
               })
            };
            instance._beforeUpdate(newCfg);
            assert.equal(instance._editingObject.get('text'), 'changed');
         });

         it('deferred', async function() {
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Deferred.success());
            instance._editingObject.set('text', 'changed');
            await instance.cancelEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editingObject);
            assert.equal(instance._editingObject.get('text'), 'qwerty');
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editingObject);
            assert.isFalse(instance._isEditing);
            assert.isFalse(instance._editingObject.isChanged());
            assert.isFalse(instance._options.editingObject.isChanged());
         });
      });

      describe('commitEdit', function() {
         it('without cancelling, successful validation', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance._editingObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editingObject);
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editingObject);
            assert.equal(cfg.editingObject.get('text'), 'asdf');
            assert.equal(instance._editingObject, instance._options.editingObject);
            assert.isTrue(instance._options.editingObject.isChanged());
            assert.isFalse(instance._isEditing);
         });

         it('cancel, successful validation', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Constants.editing.CANCEL);
            instance._editingObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 1);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editingObject);
            assert.equal(instance._editingObject.get('text'), 'asdf');
            assert.isTrue(instance._editingObject.isChanged());
            assert.isTrue(instance._options.editingObject.isChanged());
            assert.isTrue(instance._isEditing);
         });

         it('unsuccessful validation', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({
                        0: 'Поле является обязательным для заполнения'
                     });
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify();
            instance._editingObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 0);
            assert.isTrue(instance._isEditing);
            assert.equal(instance._editingObject.get('text'), 'asdf');
            assert.isTrue(instance._editingObject.isChanged());
            assert.isTrue(instance._options.editingObject.isChanged());
         });

         it('deferred', async function() {
            instance._children = {
               formController: {
                  submit: function() {
                     return Deferred.success({});
                  }
               }
            };
            instance.saveOptions(cfg);
            instance._beforeMount(cfg);
            instance._notify = mockNotify(Deferred.success());
            instance._editingObject.set('text', 'asdf');
            await instance.commitEdit();
            assert.equal(eventQueue.length, 2);
            assert.equal(eventQueue[0].event, 'beforeEndEdit');
            assert.equal(eventQueue[0].eventArgs[0], instance._editingObject);
            assert.equal(eventQueue[1].event, 'afterEndEdit');
            assert.equal(eventQueue[1].eventArgs[0], instance._editingObject);
            assert.equal(cfg.editingObject.get('text'), 'asdf');
            assert.equal(instance._editingObject, instance._options.editingObject);
            assert.isTrue(instance._options.editingObject.isChanged());
            assert.isFalse(instance._isEditing);
         });
      });
   });
});
