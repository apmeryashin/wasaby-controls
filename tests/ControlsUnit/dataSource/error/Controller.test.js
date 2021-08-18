/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource',
   'Env/Env',
   'Browser/Transport',
   'Types/entity',
   'UI/Utils'
], function(
   dataSource,
   { constants },
   Transport,
   { PromiseCanceledError },
   { Logger }
) {
   describe('Controls/dataSource:error.Controller', function() {
      const Controller = dataSource.error.Controller;
      let controller;
      let popupHelper;

      function createController() {
         popupHelper = {
            openConfirmation: sinon.stub().returns(Promise.resolve())
         };
         controller = new Controller({}, popupHelper);
      }

      afterEach(() => {
         sinon.restore();
      });

      it('is defined', function() {
         assert.isDefined(Controller);
      });

      it('is constructor', function() {
         assert.isFunction(Controller);
         createController();
         assert.instanceOf(controller, Controller);
      });

      describe('addHandler()', function() {
         createController();

         it('adds to options.handlers', function() {
            const handler = () => undefined;
            controller.addHandler(handler);
            assert.include(controller.options.handlers, handler);
         });

         it('doesn\'t add to options.handlers twice', function() {
            const handler = () => undefined;
            controller.addHandler(handler);
            controller.addHandler(handler);
            assert.equal(
               controller.options.handlers.indexOf(handler),
               controller.options.handlers.lastIndexOf(handler)
            );
         });
      });

      describe('removeHandler()', function() {
         createController();

         it('is function', function() {
            assert.isFunction(controller.removeHandler);
         });

         it('removes from options.handlers', function() {
            const handler = () => undefined;
            controller.addHandler(handler);
            controller.removeHandler(handler);
            assert.notInclude(controller.options.handlers, handler);
         });

         it('doesn\'t remove other handlers', function() {
            const handler1 = () => undefined;
            const handler2 = () => undefined;
            controller.addHandler(handler1);
            controller.addHandler(handler2);
            controller.removeHandler(handler1);
            assert.include(controller.options.handlers, handler2);
         });
      });

      describe('process()', function() {
         let error;

         const addHandlerPromise =
            () => new Promise(resolve => controller.addHandler(resolve));

         const addFailHandlerCheck =
            () => {
               const handler = sinon.stub();
               controller.addHandler(handler);
               return () => assert.isFalse(handler.called);
            };

         beforeEach(function() {
            createController();
            error = new Error('test error');
            sinon.stub(Logger, 'error');
         });

         afterEach(function() {
            controller.destroy();
            controller = null;
            error = null;
         });

         it('calls registered handler', function() {
            const handlerPromise = addHandlerPromise();
            return controller.process(error).then(() => handlerPromise);
         });

         it('doesn\'t call handler with processed error', function() {
            const checkHandler = addFailHandlerCheck();
            error.processed = true;
            return controller.process(error).then(checkHandler);
         });

         it('doesn\'t process error twice asynchronously', function() {
            controller.addHandler(sinon.stub().returns({}));
            return Promise.all([
               controller.process(error),
               controller.process(error)
            ]).then(([first, second]) => {
               assert.isDefined(first);
               assert.isUndefined(second);
            });
         });

         it('doesn\'t call handler with canceled error', function() {
            const checkHandler = addFailHandlerCheck();
            error.canceled = true;
            return controller.process(error).then(checkHandler);
         });

         it('doesn\'t call handlers with Abort error', function() {
            const checkHandler = addFailHandlerCheck();
            return controller.process(new Transport.fetch.Errors.Abort('test page')).then(checkHandler);
         });

         it('calls handler with current args', function() {
            const ARGS = {
               error: error,
               mode: dataSource.error.Mode.include
            };
            const handlerPromise = addHandlerPromise();
            return controller.process(ARGS)
               .then(() => handlerPromise)
               .then(args => assert.deepEqual(args, ARGS));
         });

         it('calls all registered handlers', function() {
            const promises = [];
            for (let i = 0; i < 5; i++) {
               promises.push(addHandlerPromise());
            }
            return controller.process(error).then(() => Promise.all(promises));
         });

         it('stops calling handlers after receiving an answer', function() {
            for (let i = 0; i < 5; i++) {
               controller.addHandler(() => undefined);
            }
            controller.addHandler(() => ({
               template: 'test',
               options: {}
            }));
            const checkHandler = addFailHandlerCheck();
            return controller.process(error).then(checkHandler);
         });

         it('returns current handler result', function() {
            const RESULT = {
               template: 'test',
               options: {},
               mode: dataSource.error.Mode.include
            };
            controller.addHandler(() => RESULT);
            return controller.process(error).then((result) => {
               assert.deepEqual(RESULT, {
                  mode: result.mode,
                  template: result.template,
                  options: result.options
               });
            });
         });

         it('shows default dialog if gets no result from handlers', function() {
            for (let i = 0; i < 5; i++) {
               controller.addHandler(() => undefined);
            }
            const theme = 'test';
            return controller.process({
               error,
               theme
            }).then((viewConfig) => {
               assert.isUndefined(viewConfig, 'returns undefined');
               assert.isTrue(error.processed, 'marks error as processed');
               assert.isTrue(popupHelper.openConfirmation.calledOnce, 'openConfirmation called');
               assert.include(popupHelper.openConfirmation.getCall(0).args[0], {
                  theme,
                  message: error.message
               }, 'openConfirmation called with theme and message');
            });
         });

         it('executes async handlers', () => {
            const viewConfig = {
               template: 'test',
               options: {},
               mode: dataSource.error.Mode.include
            };

            const handlerPromises = [

               // Обработчик #1 возвращает undefined.
               new Promise(resolve => controller.addHandler(() => {
                  resolve();
                  return Promise.resolve();
               })),

               // Обработчик #2 бросает исключение, оно должно игнорироваться.
               new Promise(resolve => controller.addHandler(() => {
                  resolve();
                  throw new Error('Throw test error');
               })),

               // Обработчик #3 возвращает промис с ошибкой, она должна игнорироваться.
               new Promise(resolve => controller.addHandler(() => {
                  resolve();
                  return Promise.reject(new Error('Test rejected promise'));
               }))
            ];

            // Обработчик #4 возвращает конфиг, он должен стать результатом всей цепочки.
            controller.addHandler(() => Promise.resolve(viewConfig));

            // Обработчик #5 не должен выполняться.
            const checkHandler = addFailHandlerCheck();

            return controller.process(error).then((result) => {
               checkHandler();

               assert.deepEqual({
                  mode: result.mode,
                  template: result.template,
                  options: result.options
               }, viewConfig, 'viewConfig');

               assert.isTrue(Logger.error.calledTwice, 'all handler errors were logged');

               return Promise.all(handlerPromises);
            });
         });

         it('stops processing when handler throws PromiseCanceledError', () => {
            const handlerPromises = [

               // Обработчик #1 возвращает undefined.
               addHandlerPromise(),

               // Обработчик #2 бросает исключение отмены.
               new Promise(resolve => controller.addHandler(() => {
                  resolve();
                  throw new PromiseCanceledError();
               }))
            ];

            // Обработчик #3 не должен выполняться.
            const checkHandler = addFailHandlerCheck();

            return controller.process(error).then((viewConfig) => {
               checkHandler();
               assert.isUndefined(viewConfig, 'returns undefined');
               assert.isNotOk(popupHelper.openConfirmation.called, 'openConfirmation not called');

               return Promise.all(handlerPromises);
            });
         });

         it('stops processing when handler rejects promise with PromiseCanceledError', () => {
            const handlerPromises = [

               // Обработчик #1 возвращает undefined.
               addHandlerPromise(),

               // Обработчик #2 возвращает промис с исключением отмены.
               new Promise(resolve => controller.addHandler(() => {
                  resolve();
                  return Promise.reject(new PromiseCanceledError());
               }))
            ];

            // Обработчик #3 не должен выполняться.
            const checkHandler = addFailHandlerCheck();

            return controller.process(error).then((viewConfig) => {
               checkHandler();
               assert.isUndefined(viewConfig, 'returns undefined');
               assert.isNotOk(popupHelper.openConfirmation.called, 'openConfirmation not called');

               return Promise.all(handlerPromises);
            });
         });

         // call application handler
         // default mode in handler's config
         // default mode in result
         // dafault template
      });

      describe('_isNeedHandle()', () => {
         it('returns false for Abort error', () => {
            const error = new Transport.fetch.Errors.Abort('test-url');
            assert.isFalse(Controller._isNeedHandle(error));
         });

         it('returns false for processed error', () => {
            const error = { processed: true };
            assert.isFalse(Controller._isNeedHandle(error));
         });

         it('returns false for canceled error', () => {
            const error = { canceled: true };
            assert.isFalse(Controller._isNeedHandle(error));
         });

         it('returns true for other types', () => {
            const error = new Error();
            assert.isTrue(Controller._isNeedHandle(error));
         });
      });

      describe('composeViewConfig()', () => {
         const getPriorityMapConfig = (txt, count) => {
            const map = { ...Array(count).fill(txt) };
            return {
               ...map,
               options: map
            };
         };
         const configs = {
            ViewConfig: getPriorityMapConfig('ViewConfig', 3),
            customStandardConfig: getPriorityMapConfig('customStandardConfig', 2),
            customViewConfig: getPriorityMapConfig('customViewConfig', 1)
         };
         const expectedResult = {
            0: 'customViewConfig',
            1: 'customStandardConfig',
            2: 'ViewConfig',
            options: {
               0: 'customViewConfig',
               1: 'customStandardConfig',
               2: 'ViewConfig'
            }
         };

         beforeEach(() => {
            controller = new Controller({
               viewConfig: configs.customViewConfig,
               standardViewConfigs: {
                  test: configs.customStandardConfig
               }
            });
            controller.handlerIterator = { lastHandler: { handlerType: 'test' } };
         });

         afterEach(() => {
            controller.destroy();
            controller = null;
         });

         it('returns ViewConfig, that was composed by priority', () => {
            const result = controller.composeViewConfig(configs.ViewConfig);
            assert.deepEqual(result, expectedResult);
         });

         it('returns ViewConfig with passed mode', () => {
            const mode = 'mode';
            const result = controller.composeViewConfig(configs.ViewConfig, mode);
            assert.deepEqual(result, {
               ...expectedResult,
               mode
            });
         });
      });

      describe('getHandlerConfig()', () => {
         beforeEach(() => {
            createController();
         });

         it('returns a config for an error', () => {
            const error = new Error();
            const result = controller.getHandlerConfig(error);
            assert.deepEqual(result, {
               error,
               mode: 'dialog'
            });
         });

         it('returns a config for an error with preset mode', () => {
            const error = new Error();
            controller = new Controller({
               viewConfig: {
                  mode: 'include'
               }
            }, popupHelper);
            const result = controller.getHandlerConfig(error);
            assert.deepEqual(result, {
               error,
               mode: 'include'
            });
         });

         it('returns a config with default mode', () => {
            const error = new Error();
            const config = { error };
            const result = controller.getHandlerConfig(config);
            assert.notStrictEqual(result, config, 'must return a new object');
            assert.deepEqual(result, {
               error,
               mode: 'dialog'
            });
         });

         it('returns a copy of the config', () => {
            const error = new Error();
            const config = {
               error,
               mode: 'include'
            };
            const result = controller.getHandlerConfig(config);
            assert.notStrictEqual(result, config, 'must return a new object');
            assert.deepEqual(result, config);
         });

         it('returns a config with the preset mode', () => {
            const error = new Error();
            const config = {
               error
            };
            controller = new Controller({
               viewConfig: {
                  mode: 'include'
               }
            }, popupHelper);
            const result = controller.getHandlerConfig(config);
            assert.notStrictEqual(result, config, 'must return a new object');
            assert.deepEqual(result, {
               error,
               mode: 'include'
            });
         });
      });
   });
});
