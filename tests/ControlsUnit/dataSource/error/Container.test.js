/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource'
], function(dataSource) {
   describe('Controls/dataSource:error.Container', function() {
      const Container = dataSource.error.Container;
      let instance;

      function mockPopupHelper(popupId) {
         instance._popupHelper = {
            openDialog(config, { eventHandlers }) {
               this._onClose = eventHandlers && eventHandlers.onClose;
               return Promise.resolve(popupId);
            },
            closeDialog(id) {
               if (id === popupId && typeof this._onClose === 'function') {
                  this._onClose();
               }
            }
         };
      }

      function createInstance() {
         instance = new Container();
         sinon.stub(instance, '_notify');
         mockPopupHelper();
      }

      function getViewConfig(mode, options = {}) {
         return {
            mode,
            options,
            template: 'template',
            status: undefined,
            getVersion: () => Date.now()
         };
      }

      afterEach(() => {
         sinon.restore();
      });

      it('is defined', function() {
         assert.isDefined(Container);
      });

      it('is constructor', function() {
         assert.isFunction(Container);
         createInstance();
         assert.instanceOf(instance, Container);
      });

      // describe('_openDialog()', function() {
      //    beforeEach(() => {
      //       createInstance();
      //    });
      //
      //    it('notifies "dialogClosed" on closing opened dialog', function() {
      //       const popupId = String(Date.now());
      //       const config = {};
      //       mockPopupHelper(popupId);
      //       return instance._openDialog(config).then(() => {
      //          assert.strictEqual(instance._popupId, popupId, 'saves popupId');
      //
      //          // Диалог открылся. Теперь эмулируем закрытие диалога.
      //          instance._popupHelper.closeDialog(popupId);
      //          assert.isNotOk(instance._popupId, 'clears popupId');
      //          assert.isTrue(instance._notify.calledOnceWith('dialogClosed', []), 'notifies "dialogClosed"');
      //       });
      //    });
      // });

      describe('_beforeUpdate()', () => {
         let viewConfig;

         beforeEach(() => {
            createInstance();
            viewConfig = getViewConfig('include');
         });

         it('sets new viewConfig when it comes', () => {
            instance._viewConfig = null;
            instance._options.viewConfig = null;

            instance._beforeUpdate({ viewConfig });

            assert.isNotNull(instance._viewConfig);
         });

         it('sets new viewConfig when it comes (deep comparison)', () => {
            instance._viewConfig = null;
            instance._options.viewConfig = viewConfig;

            const newConfig = getViewConfig('include', { image: '42' });
            instance._beforeUpdate({ viewConfig: newConfig });

            assert.isNotNull(instance._viewConfig);
            assert.strictEqual(instance._viewConfig.options.image, '42');
         });

         it('resets viewConfig', () => {
            instance._viewConfig = viewConfig;
            instance._options.viewConfig = viewConfig;

            instance._beforeUpdate({ viewConfig: undefined });

            assert.isNull(instance._viewConfig);
         });

         it('does not set new viewConfig when options.viewConfig are equal', () => {
            instance._viewConfig = null;
            instance._options.viewConfig = viewConfig;
            instance._beforeUpdate({ viewConfig });

            assert.isNull(instance._viewConfig);
         });

         // it('resets new viewConfig when options.viewConfig mode is dialog', () => {
         //    instance.__viewConfig = {};
         //    viewConfig.mode = 'include';
         //    instance._options.viewConfig = viewConfig;
         //    instance._beforeUpdate({ viewConfig });
         //
         //    assert.isNotNull(instance.__viewConfig);
         //
         //    viewConfig.mode = 'dialog';
         //    instance._beforeUpdate({ viewConfig });
         //
         //    assert.isNull(instance.__viewConfig);
         // });

         it('updates list options in inlist mode', () => {
            const options = { viewConfig };
            viewConfig.mode = 'inlist';
            instance._beforeUpdate(options);
            assert.strictEqual(instance._viewConfig.options.listOptions, options);
         });

         it('inlist mode: sets new list options when options viewConfig are equal', () => {
            const options = {
               viewConfig: getViewConfig('inlist', {}),
               someListsOptions: 42
            };

            instance._viewConfig = viewConfig;
            instance._options.viewConfig = viewConfig;

            instance._beforeUpdate(options);

            assert.strictEqual(instance._viewConfig.options.listOptions, options);
         });
      });

      describe('_updateInlistOptions()', () => {
         let viewConfig;
         let options;

         beforeEach(() => {
            createInstance();
            viewConfig = getViewConfig('inlist', {});
            options = {};
            instance._viewConfig = viewConfig;
         });

         it('updates viewConfig options object', () => {
            const oldViewConfigOptions = instance._viewConfig.options;
            instance._updateInlistOptions(options);
            assert.notStrictEqual(instance._viewConfig.options, oldViewConfigOptions);
         });

         it('sets viewConfig options as passed options', () => {
            instance._updateInlistOptions(options);
            assert.strictEqual(instance._viewConfig.options.listOptions, options);
         });
      });

      describe('_updateConfig()', () => {
         let viewConfig;
         let options;

         beforeEach(() => {
            createInstance();
            viewConfig = getViewConfig('include', {});
            options = { viewConfig };
            instance._viewConfig = null;
         });

         it('sets new viewConfig from passed options', () => {
            instance._updateConfig(options.viewConfig);
            assert.isDefined(instance._viewConfig);
         });

         it('sets correct showed flag for viewConfig', () => {
            [
               [true, 'include', true],
               [true, 'dialog', true],
               [false, 'include', true],
               [false, 'dialog', false]
            ].forEach(([isShown, mode, result]) => {
               viewConfig.isShown = isShown;
               viewConfig.mode = mode;
               instance._updateConfig(viewConfig);
               assert.strictEqual(instance._viewConfig.isShown, result);
            });
         });

         it('does not update list options in non-inlist mode', () => {
            instance._updateConfig(options.viewConfig);
            assert.isUndefined(instance._viewConfig.options.listOptions);
         });
      });
   });
});
