define([
   'Controls/validate',
   'Core/Deferred',
   'ControlsUnit/resources/ProxyCall',
   'Types/function'
], function(validateMod, Deferred, ProxyCall, types) {
   'use strict';

   function getValidator(validateResult, readOnly) {
      let validator = {
         _validateCall: false,
         _activateCall: false,
         _validationResult: false,
         _isValidCall: false,
         _isOpened: false,
         _options: {
            readOnly: readOnly
         },
         validate: () => {
            validator._validateCall = true;
            return (new Deferred()).callback(validateResult);
         },
         activate: () => {
            validator._activateCall = true;
         },
         openInfoBox: () => {
            validator._isOpened = true;
         },
         setValidationResult: (result) => {
            validator._validationResult = result;
         },
         isValid: () => {
            validator._isValidCall = true; return !validator._validationResult;
         }
      };

      return validator;
   }

   describe('Validate/Container', () => {
       var stubP;
       var calls = [];
       var validCtrl = new validateMod.Container();
       validCtrl._notify = ProxyCall.apply(validCtrl._notify, 'notify', calls, true);
       beforeEach(function() {
           stubP = sinon.stub(validCtrl, '_callInfoBox').callsFake(() => undefined);
       });
       afterEach(function() {
           stubP.restore();
       });
      it('closeInfoBox', () => {
         validCtrl._isOpened = false;
         validCtrl._validationResult = 'error';
         validCtrl._openInfoBox(validCtrl);
         validCtrl._openInfoBox(validCtrl);
         validCtrl._onOpenHandler();
         validCtrl._mouseInfoboxHandler({type: 'mouseenter'});
         assert.deepEqual(validCtrl._isOpened, true);
         validCtrl._mouseInfoboxHandler({type: 'close'});
         assert.deepEqual(validCtrl._isOpened, false);
         validCtrl.destroy();
      });
      it('cleanValid', () => {
         validCtrl = new validateMod.Container();
         const event = {
            stopImmediatePropagation: () => {}
         };
         validCtrl._callInfoBox = () => {};
         validCtrl._valueChangedHandler(event, 'test');
         assert.deepEqual(validCtrl._validationResult, null);
         validCtrl._validationResult = 'Error';
         validCtrl._valueChangedHandler(event, 'test');
         assert.deepEqual(validCtrl._validationResult, 'Error');
         validCtrl.destroy();
      });
      it('setValidResult', () => {
         var validCtrl = new validateMod.Container();
         validCtrl._callInfoBox = () => {};
         var validConfig = {
            hideInfoBox: true,
         };
         validCtrl._isOpened = false;
         validCtrl.setValidationResult('Error 404');
         validCtrl._onOpenHandler();
         assert.deepEqual(validCtrl._isOpened, true);

         // вызов с hideInfobox = true не закрывает инфобокс
         validCtrl.setValidationResult(null, validConfig);
         assert.deepEqual(validCtrl._isOpened, true);

         // вызов с hideInfobox = true не октрывает инфобокс
         validCtrl._isOpened = false;
         validCtrl.setValidationResult('Error 404', validConfig);
         assert.deepEqual(validCtrl._isOpened, false);
         validCtrl.destroy();
      });
   });
   describe('Validate/ControllerClass', () => {
      it('add/remove validator', () => {
         let Controller = new validateMod.ControllerClass();
         let validator1 = getValidator();
         let validator2 = getValidator();

         Controller.addValidator(validator1);
         Controller.addValidator(validator2);

         assert.equal(Controller._validates.length, 2);

         Controller.removeValidator(validator1);
         Controller.removeValidator(validator2);

         assert.equal(Controller._validates.length, 0);

         Controller.destroy();
      });

      it('isValid', () => {
         let Controller = new validateMod.ControllerClass();
         let validator1 = getValidator();
         let validator2 = getValidator();
         Controller.addValidator(validator1);
         Controller.addValidator(validator2);

         let isValid = Controller.isValid();
         assert.equal(validator1._isValidCall, true);
         assert.equal(validator2._isValidCall, true);
         assert.equal(isValid, true);

         let validator3 = getValidator();
         validator3.setValidationResult('Error');
         Controller.addValidator(validator3);
         isValid = Controller.isValid();
         assert.equal(validator3._isValidCall, true);
         assert.equal(isValid, false);

         Controller.destroy();
      });
      it('activateFirstValidField', (done) => {
         let Controller = new validateMod.ControllerClass();
         Controller.scrollToInvalidContainer = () => {};
         let validator1 = getValidator();
         let validator2 = getValidator(null, true);
         let validator3 = getValidator('Error');
         let validator4 = getValidator('Error');

         Controller._validates.push(validator1, validator2, validator3, validator4);
         Controller.submit().then(() => {
            assert.equal(validator3._activateCall, true);
            Controller.destroy();
            done();
         });
      });

      it('openInfoBox at first valid container', (done) => {
         let Controller = new validateMod.ControllerClass();
         Controller.scrollToInvalidContainer = () => {};
         let validator1 = getValidator('Error');

         const sandBox = sinon.createSandbox();

         // Deal with propery getter
         const delay = types.delay;
         delete types.delay;
         types.delay = delay;

         sandBox.replace(types, 'delay', () => {validator1.openInfoBox()});
         Controller._validates.push(validator1);
         Controller.submit().then(() => {
            assert.equal(validator1._activateCall, true);
            assert.equal(validator1._isOpened, true);
            Controller.destroy();
            sandBox.restore();
            done();
         });
      });

      it('setValidationResult', () => {
         let Controller = new validateMod.ControllerClass();
         let validator1 = getValidator();
         let validator2 = getValidator();
         Controller.addValidator(validator1);
         Controller.addValidator(validator2);

         Controller.setValidationResult();
         assert.equal(validator1._validationResult, null);
         assert.equal(validator2._validationResult, null);

         Controller.destroy();
      });

      it('config for openInfoBox', () => {
         let validCtrl = new validateMod.Container();
         validCtrl.saveOptions({
            errorTemplate: 'myTemplate'
         });
         validCtrl._validationResult = 'Error';
         validCtrl._container = 'myContainer';
         let newCfg = {
            target: 'myContainer',
            validationStatus: 'invalid',
            template: 'myTemplate',
            templateOptions: {
               errors: 'Error'
            },
            eventHandlers: {},
            closeOnOutsideClick: false,
         };

         validCtrl._callInfoBox = (cfg) => {
            cfg.eventHandlers = {};
            assert.deepEqual(newCfg, cfg);
         };
         validCtrl._openInfoBox();
      });

      it('submit', (done) => {
         let Controller = new validateMod.ControllerClass();
         Controller.scrollToInvalidContainer = () => {};
         let validator1 = getValidator(true);
         let validator2 = getValidator(false);
         Controller.addValidator(validator1);
         Controller.addValidator(validator2);
         const sandBox = sinon.createSandbox();
         sandBox.replace(types, 'delay', () => {validator1.openInfoBox()});

         Controller.submit().then((result) => {
            assert.equal(validator1._validateCall, true, 'is validate1 call');
            assert.equal(validator2._validateCall, true, 'is validate2 call');

            assert.equal(result[0], false, 'validate1 result');
            assert.equal(result[1], true, 'validate2 result');

            assert.equal(validator1._activateCall, true, 'is validate1 activate');
            assert.equal(validator2._activateCall, false, 'is validate2 activate');
            Controller.destroy();
            sandBox.restore();
            done();
         }).catch((error) => {
            done(error);
         });
      });
      it('closeInfobox by submit ', (done) => {
         let validCtrl = new validateMod.Container();
         let Controller = new validateMod.ControllerClass();
         validCtrl._isOpened = true;
         validCtrl._validationResult = true;
         Controller._validates.push(validCtrl);
         Controller.submit().then(() => {
            assert.strictEqual(validCtrl._isOpened, false);
            Controller.destroy();
            done();
         }).catch((error) => {
            done(error);
         });
      });
   });
});
