import { ControllerBase } from 'Controls/form';
import { Model } from 'Types/entity';
import * as Deferred from 'Core/Deferred';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {assert as sinonAssert} from 'sinon';

const createModel = (id) => new Model({ rawData: { id }, keyProperty: 'id'});

describe('Controls/_form/ControllerBase', () => {
   it('beforeMount', () => {
      const FC = new ControllerBase({});
      const options = {
         record: new Model()
      };
      FC._beforeMount(options);
      assert.equal(FC._record, options.record);

      options.record = null;
      FC._beforeMount(options);
      assert.equal(FC._record, options.record);

      options.record = 'random data';
      FC._beforeMount(options);
      assert.equal(FC._record, null); // previous value

      FC.destroy();
   });

   it('afterMount', () => {
      const FC = new ControllerBase({});
      const spy = sinon.spy(FC, '_notify');

      FC._afterMount();

      const [, eventArgs] = spy.getCall(0).args;
      const [, config] = eventArgs;
      const sandbox = sinon.createSandbox();
      const showMethod = sandbox.stub(FC, '_needShowConfirmation');

      config.validate();
      assert.isTrue(showMethod.called);

      FC.destroy();
   });

   it('beforeUpdate', () => {
      const FC = new ControllerBase({});
      const firstRecord = createModel(1);
      const secondRecord = createModel('1,1');
      const thirdRecord = createModel(2);
      FC._record = firstRecord;
      FC._beforeUpdate({record: secondRecord});
      assert.equal(FC._record, secondRecord);

      FC._beforeUpdate({record: thirdRecord});
      assert.equal(FC._record, thirdRecord);

      FC._beforeUpdate({record: null});
      assert.equal(FC._record, null);

      FC.destroy();
   });

   it('needShowConfirmation', () => {
      const FC = new ControllerBase({});

      assert.equal(FC._needShowConfirmation(), false);
      const record = createModel(1);
      record.set('id', 2); // Для состояния измененности
      FC._record = record;

      assert.equal(FC._needShowConfirmation(), true);

      const confirmationShowingCallback = sinon.stub().callsFake(() => 'custom value');
      FC.saveOptions({confirmationShowingCallback });
      assert.equal(FC._needShowConfirmation(), 'custom value');

      FC.destroy();
   });

   it('showConfirmDialog', () => {
      const FC = new ControllerBase({});
      const promise = Promise.resolve();
      const confirmMethod = sinon.spy(FC, '_confirmDialogResult');

      FC._showConfirmDialog(promise, true);
      sinonAssert.calledOnce(confirmMethod);

      sinon.stub(FC, '_showConfirmPopup').callsFake(() => promise);
      FC._showConfirmDialog(promise, true);
      return promise.then(() => {
         sinonAssert.calledTwice(confirmMethod);
         FC.destroy();
      });
   });

   it('showConfirmDialog', () => {
      const FC = new ControllerBase({});
      const fakeCallback = {
         isReady: () => false,
         callback: sinon.spy()
      };
      FC._confirmDialogResult(false, fakeCallback);
      assert.isTrue(fakeCallback.callback.calledWith(false));

      const notifySpy = sinon.spy(FC, '_notify');
      FC._confirmDialogResult(undefined, undefined);
      assert.equal(notifySpy.withArgs('cancelFinishingPending').called, true);

      const promise = Promise.resolve({validationErrors: true});
      sinon.stub(FC, 'update').callsFake(() => promise);
      FC._confirmDialogResult(true, fakeCallback);

      return promise.then(() => {
         assert.equal(notifySpy.withArgs('cancelFinishingPending').calledTwice, true);
         FC.destroy();
      });
   });

   it('add/remove validators', () => {
      const FC = new ControllerBase({});
      const addValidator = sinon.spy(FC._validateController, 'addValidator');
      const removeValidator = sinon.spy(FC._validateController, 'removeValidator');
      FC._onValidateCreated(null, 1);
      FC._onValidateCreated(null, 2);
      FC._onValidateDestroyed(null, 2);
      assert.isTrue(addValidator.calledTwice);
      assert.isTrue(removeValidator.calledOnce);
      assert.equal(FC._validateController._validates.length, 1);
      FC.destroy();
   });

   it('update successed', () => {
      const FC = new ControllerBase({});
      const record = createModel(1);
      record.set('id', 2); // Для состояния измененности
      FC._record = record;

      sinon.stub(FC, '_startFormOperations').callsFake(() => Promise.resolve());
      sinon.stub(FC, 'validate').callsFake(() => Promise.resolve({hasErrors: false}));
      const notifySpy = sinon.spy(FC, '_notify');

      return FC.update().then(() => {
         assert.isTrue(notifySpy.withArgs('validationSuccessed').called);
         assert.isTrue(notifySpy.withArgs('updateSuccessed').called);
         assert.isTrue(notifySpy.withArgs('recordChanged').called);
         assert.isFalse(FC._record.isChanged());
         FC.destroy();
      });
   });

   it('update failed', () => {
      const FC = new ControllerBase({});

      sinon.stub(FC, '_startFormOperations').callsFake(() => Promise.resolve());
      sinon.stub(FC, 'validate').callsFake(() => Promise.resolve({hasErrors: true}));
      const notifySpy = sinon.spy(FC, '_notify');

      return FC.update().then(() => {
         assert.isTrue(notifySpy.withArgs('validationFailed').called);
         assert.isTrue(notifySpy.withArgs('validationFailed2').called);
      }).catch(sinon.fake());
   });

   it('registerPending', async () => {
      let updatePromise;
      const FC = new ControllerBase({});
      FC._crudController = {
         hideIndicator: sinon.fake()
      };
      FC._createChangeRecordPending();
      assert.isTrue(FC._pendingPromise !== undefined);
      FC.update = () => new Promise((res) => updatePromise = res);
      FC._confirmDialogResult(true, new Deferred());
      await updatePromise({});
      assert.isTrue(FC._pendingPromise === null);

      FC._createChangeRecordPending();
      FC._beforeUnmount();
      assert.isTrue(FC._pendingPromise === null);
      FC.destroy();
   });

   it('_confirmRecordChangeHandler', async () => {
      const FC = new ControllerBase();
      let isDefaultCalled = false;
      let isNegativeCalled = false;
      let showConfirmPopupResult = false;
      const defaultAnswerCallback = () => isDefaultCalled = true;
      const negativeAnswerCallback = () => isNegativeCalled = true;
      const mokePromiseFunction = () => {
         return {
            then: (thenCallback) => thenCallback(showConfirmPopupResult)
         };
      };

      FC._needShowConfirmation = () => false;
      FC._confirmRecordChangeHandler(defaultAnswerCallback, negativeAnswerCallback);
      assert.equal(isDefaultCalled, true);
      assert.equal(isNegativeCalled, false);
      isDefaultCalled = false;

      FC._needShowConfirmation = () => true;
      FC._showConfirmPopup = mokePromiseFunction;
      FC._confirmRecordChangeHandler(defaultAnswerCallback, negativeAnswerCallback);
      assert.equal(isDefaultCalled, false);
      assert.equal(isNegativeCalled, true);
      isNegativeCalled = false;

      showConfirmPopupResult = true;
      FC.update = mokePromiseFunction;
      FC._confirmRecordChangeHandler(defaultAnswerCallback, negativeAnswerCallback);
      assert.equal(isDefaultCalled, true);
      assert.equal(isNegativeCalled, false);
      FC.destroy();
   });

   it('formOperations', () => {
      const FC = new ControllerBase();
      let isSaveCalled = false;
      let isCancelCalled = false;
      let isDestroyed = false;
      const operation = {
         save() {
            isSaveCalled = true;
         },
         cancel() {
            isCancelCalled = true;
         },
         isDestroyed() {
            return isDestroyed;
         }
      };
      FC._registerFormOperationHandler(null, operation);
      FC._registerFormOperationHandler(null, operation);
      assert.equal(FC._formOperationsStorage.length, 2);

      FC._startFormOperations('save');
      assert.equal(isSaveCalled, true);
      assert.equal(isCancelCalled, false);

      isSaveCalled = false;
      FC._startFormOperations('cancel');
      assert.equal(isSaveCalled, false);
      assert.equal(isCancelCalled, true);
      isCancelCalled = false;

      isDestroyed = true;
      FC._startFormOperations('cancel');
      assert.equal(isSaveCalled, false);
      assert.equal(isCancelCalled, false);
      assert.equal(FC._formOperationsStorage.length, 0);

      FC.destroy();
   });

   it('_confirmDialogResult', (done) => {
      const FC = new ControllerBase();
      const promise = new Promise((resolve, reject) => {
         reject('update error');
      });
      FC.update = () => promise;
      let calledEventName;
      FC._notify = (event) => {
         calledEventName = event;
      };
      FC._confirmDialogResult(true, new Promise(sinon.fake()));
      promise.catch(() => {
         assert.equal(calledEventName, 'cancelFinishingPending');
         FC.destroy();
         done();
      });
   });

   it('_needShowConfirmation', () => {
      const FC = new ControllerBase();
      FC._record = new Model({
         rawData: {
            someField: ''
         }
      });
      FC._record.set('someField', 'newValue');

      const result = FC._needShowConfirmation();
      assert.isTrue(result);
      FC._record.acceptChanges();
      FC._options.confirmationShowingCallback = () => {
         return true;
      };
      assert.isTrue(result);
   });
});
