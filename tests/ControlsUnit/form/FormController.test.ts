import {Controller, CrudController, INITIALIZING_WAY} from 'Controls/form';
import * as Deferred from 'Core/Deferred';
import {Model, Record} from 'Types/entity';
import {assert} from 'chai';

const createModel = (id) => new Model({ rawData: { id }, keyProperty: 'id'});

describe('FormController', () => {
   it('initializingWay', (done) => {
      const FC = new Controller({});

      let cfg = {
         record: new Record()
      };

      let isReading = false;
      let isCreating = false;

      FC._readRecordBeforeMount = () => {
         isReading = true;
         return Promise.resolve({ data: true });
      };

      FC._createRecordBeforeMount = () => {
         isCreating = true;
         return Promise.resolve({ data: true });
      };

      const p1 = new Promise((resolve) => {
         const beforeMountResult = FC._beforeMount(cfg);
         assert.equal(isReading, false);
         assert.equal(isCreating, false);
         assert.notEqual(beforeMountResult, true);
         resolve();
      });

      const p2 = new Promise((resolve) => {
         cfg.key = '123';
         const beforeMountResult = FC._beforeMount(cfg);
         assert.equal(isReading, true);
         assert.equal(isCreating, false);
         assert.notEqual(beforeMountResult, true);
         resolve();
      }).catch((error) => {
         done(error);
      });

      const p3 = new Promise((resolve) => {
         cfg = {
            key: 123
         };
         isReading = false;
         const beforeMountResult = FC._beforeMount(cfg);
         assert.equal(isReading, true);
         assert.equal(isCreating, false);
         assert.isTrue(
             beforeMountResult instanceof Deferred ||
             beforeMountResult instanceof Promise
         );
         beforeMountResult.then(({ data }) => {
            assert.equal(data, true);
            resolve();
         }).catch((error) => {
            done(error);
         });
      });
      const p4 = new Promise((resolve) => {
         isReading = false;
         isCreating = false;
         const beforeMountResult = FC._beforeMount({});
         assert.equal(isReading, false);
         assert.equal(isCreating, true);
         assert.isTrue(
             beforeMountResult instanceof Deferred ||
             beforeMountResult instanceof Promise
         );
         beforeMountResult.then(({ data }) => {
            assert.equal(data, true);
            resolve();
         });
      });

      Promise.all([p1, p2, p3, p4]).then(() => {
         FC.destroy();
         done();
      });
   });
   it('beforeUpdate', async () => {
      const FC = new Controller({});
      let setRecordCalled = false;
      let readCalled = false;
      let createCalled = false;
      let createPromiseResolver;
      let createPromiseResolverUpdate;
      let createPromiseResolverShow;
      let createPromiseResolverReed;
      let createPromiseResolverDelete;
      let createPromise;
      const originConfirmationCallback = FC._confirmRecordChangeHandler;
      const record = {
         isChanged: () => false
      };
      const diffRecord = {
         isChanged: () => false
      };

      FC._setRecord = (record) => {
         FC._record = record;
         setRecordCalled = true;
      };
      FC.read = () => {
         readCalled = true;
         return new Promise((res) => {
            createPromiseResolverReed = res;
         });
      };
      FC.create = () => {
         createCalled = true;
         createPromise = new Promise((res) => { createPromiseResolver = res; });
         return createPromise;
      };
      FC._confirmRecordChangeHandler = (positiveCallback, negativeCallback) => {
         return positiveCallback();
      };
      FC._crudController = {
         _source: null,
         setDataSource(source) {
            this._source = source;
         }
      };

      FC._beforeUpdate({
         record: 'record'
      });
      assert.equal(setRecordCalled, true);
      assert.equal(readCalled, false);
      assert.equal(createCalled, false);

      setRecordCalled = false;
      const newSource = {};
      const originRead = FC.read;
      FC.read = () => {

         // is source changed source will be setted before read
         assert.equal(FC._crudController._source, newSource);
         return originRead();
      };
      FC._beforeUpdate({
         record,
         key: 'key',
         source: newSource
      });

      assert.equal(setRecordCalled, true);
      assert.equal(readCalled, true);
      assert.equal(createCalled, false);
      assert.equal(FC._isNewRecord, false);

      setRecordCalled = false;
      readCalled = false;
      FC.read = originRead;

      // Рекорд должен обновиться, если показали окно и ответили "Нет"
      FC._confirmRecordChangeHandler = (positiveCallback, negativeCallback) => {
         return negativeCallback();
      };
      FC._beforeUpdate({
         record: diffRecord,
         key: 'key1'
      });
      assert.equal(setRecordCalled, true);

      FC._confirmRecordChangeHandler = (positiveCallback) => {
         return positiveCallback();
      };
      setRecordCalled = false;
      readCalled = false;
      FC._beforeUpdate({
         isNewRecord: true
      });

      assert.equal(setRecordCalled, false);
      assert.equal(readCalled, false);
      assert.equal(createCalled, true);
      assert.equal(FC._isNewRecord, false);

      await createPromiseResolver();

      assert.equal(FC._isNewRecord, true);

      createCalled = false;
      let updateCalled = false;
      let confirmPopupCalled = false;
      FC._confirmRecordChangeHandler = originConfirmationCallback;
      FC._showConfirmPopup = () => {
         confirmPopupCalled = true;
         return new Promise((res) => {
            createPromiseResolverShow = res;
         });
      };
      FC.update = () => {
         updateCalled = true;
         return new Promise((res) => {
            createPromiseResolverUpdate = res;
         });
      };
      record.isChanged = () => true;
      FC._options.record = record;
      FC._record = record;
      FC._beforeUpdate({
         record,
         key: 'key'
      });
      await createPromiseResolverShow(true);
      await createPromiseResolverUpdate();
      await createPromiseResolverReed();

      assert.equal(setRecordCalled, false);
      assert.equal(confirmPopupCalled, true);
      assert.equal(readCalled, true);
      assert.equal(updateCalled, true);
      assert.equal(createCalled, false);
      assert.equal(FC._isNewRecord, true);

      FC._showConfirmPopup = () => {
         confirmPopupCalled = true;
         return new Promise((res) => {
            createPromiseResolverShow = res;
         });
      };

      updateCalled = false;
      readCalled = false;
      confirmPopupCalled = false;
      let isDeleteRecord = false;
      FC._tryDeleteNewRecord = () => {
         isDeleteRecord = true;
         return new Promise((res) => {
            createPromiseResolverDelete = res;
         });
      };
      FC._beforeUpdate({
         record,
         key: 'key'
      });
      await createPromiseResolverShow(false);
      await createPromiseResolverDelete();

      assert.equal(setRecordCalled, false);
      assert.equal(confirmPopupCalled, true);
      assert.equal(isDeleteRecord, true);
      assert.equal(readCalled, true);
      assert.equal(updateCalled, false);
      assert.equal(createCalled, false);

      readCalled = false;
      createCalled = false;
      setRecordCalled = false;
      updateCalled = false;
      confirmPopupCalled = false;
      FC._showConfirmPopup = () => {
         confirmPopupCalled = true;
         return new Promise((res) => {
            createPromiseResolverShow = res;
         });
      };
      FC.update = () => {
         updateCalled = true;
         return new Promise((res) => {
            createPromiseResolverUpdate = res;
         });
      };
      let oldRecord = {
         isChanged: () => true
      };
      FC._options.record = oldRecord;
      FC._beforeUpdate({
         record: null
      });
      await createPromiseResolverShow(true);
      await createPromiseResolverUpdate();
      await createPromiseResolverReed();

      assert.equal(setRecordCalled, false);
      assert.equal(confirmPopupCalled, true);
      assert.equal(readCalled, false);
      assert.equal(updateCalled, true);
      assert.equal(createCalled, true);
      assert.equal(FC._isNewRecord, true);

      // Рекорд не должен поменяться прежде чем ответят на конфирм
      setRecordCalled = false;
      confirmPopupCalled = false;
      FC._isConfirmShowed = false;

      oldRecord = {
         isChanged: () => true
      };
      FC._options.record = oldRecord;
      FC._record = oldRecord;
      FC._beforeUpdate({
         record: {}
      });

      assert.equal(setRecordCalled, false);
      assert.equal(confirmPopupCalled, true);

      // Рекорд должен поменяться, если окно подтверждения не показалось
      readCalled = false;
      createCalled = false;
      setRecordCalled = false;
      confirmPopupCalled = false;
      FC._isConfirmShowed = false;

      oldRecord = {
         isChanged: () => false
      };
      FC._options.record = oldRecord;
      FC._record = oldRecord;
      FC._beforeUpdate({
         record: {}
      });

      assert.equal(setRecordCalled, true);
      assert.equal(confirmPopupCalled, false);

      FC.destroy();
   });

   it('beforeUpdate change isNewRecord', () => {
      const FC = new Controller({});
      FC._isNewRecord = undefined;
      FC._crudController = {
         setDataSource: sinon.fake()
      };

      FC._beforeUpdate({isNewRecord: true, record: 123});
      assert.equal(FC._isNewRecord, true);

      FC._isConfirmShowed = true;
      FC._beforeUpdate({isNewRecord: false, record: 123});
      assert.equal(FC._isNewRecord, true);

      FC._isConfirmShowed = false;
      FC._beforeUpdate({isNewRecord: false, record: 123});
      assert.equal(FC._isNewRecord, false);

      FC.destroy();
   });

   it('calcInitializingWay', () => {
      const FC = new Controller({});
      const options = {};
      let initializingWay = FC._calcInitializingWay(options);
      assert.equal(initializingWay, 'create');

      options.key = 123;
      initializingWay = FC._calcInitializingWay(options);
      assert.equal(initializingWay, 'read');

      options.record = 123;
      initializingWay = FC._calcInitializingWay(options);
      assert.equal(initializingWay, 'delayedRead');

      delete options.key;
      initializingWay = FC._calcInitializingWay(options);
      assert.equal(initializingWay, 'local');

      options.initializingWay = 'test';
      initializingWay = FC._calcInitializingWay(options);
      assert.equal(initializingWay, 'test');
      FC.destroy();
   });

   it('FormController update', (done) => {
      const FC = new Controller({});
      FC._forceUpdate = () => {
         setTimeout(FC._afterUpdate.bind(FC));
      };
      const validation = {
         submit: () => Promise.resolve(true)
      };
      FC._children = { validation };
      FC._crudController = {
         update: sinon.spy()
      };

      FC._update().then(() => {
         assert.isTrue(FC._crudController.update.calledOnce);
         done();
         FC.destroy();
      });
   });

   it('FormController update with Config', (done) => {
      const configData = {
         additionalData: {
            name: 'cat'
         },
         updateMetaData: {
            someField: 'someValue'
         }
      };
      const FC = new Controller({});
      const validation = {
         submit: () => Promise.resolve(true)
      };
      let data;
      FC._record = {
         getKey: () => 'id1',
         isChanged: () => true
      };
      FC._isNewRecord = true;
      const dataSource = {
         update: (record, updateMeta) => {
            assert.deepEqual(updateMeta, configData.updateMetaData);
            return new Deferred().callback('key');
         }
      };
      const argsCorrectUpdate = {
         key: 'key',
         isNewRecord: true,
         name: 'cat'
      };
      FC._notify = (event, arg) => {
         if (event === 'sendResult' && arg[0].formControllerEvent === 'update') {
            data = arg[0].additionalData;
         }
      };
      FC._children = { validation };
      FC._processError = sinon.fake();
      FC._crudController = new CrudController(dataSource,
          FC._notifyHandler.bind(FC), FC.registerPendingNotifier.bind(FC), FC.indicatorNotifier.bind(FC));
      FC._forceUpdate = () => {
         setTimeout(FC._afterUpdate.bind(FC));
      };
      FC.update(configData).then(() => {
         assert.deepEqual(data, argsCorrectUpdate);
         done();
         FC.destroy();
      });
   });
   it('FormController update with updateMetaData options', (done) => {
      const FC = new Controller({});
      const validation = {
         submit: () => Promise.resolve(true)
      };
      FC._record = {
         getKey: () => 'id1',
         isChanged: () => true
      };
      const updateMetaData = {someField: 'someValue'};
      const dataSource = {
         update: (record, updateMeta) => {
            assert.deepEqual(updateMeta, updateMetaData);
            return new Deferred().callback('key');
         }
      };
      FC.saveOptions({ updateMetaData });
      FC._children = { validation };
      FC._processError = sinon.fake();
      FC._forceUpdate = () => {
         setTimeout(FC._afterUpdate.bind(FC));
      };
      FC._crudController = new CrudController(dataSource,
          FC._notifyHandler.bind(FC), FC.registerPendingNotifier.bind(FC), FC.indicatorNotifier.bind(FC));
      FC.update().then(() => {
         done();
         FC.destroy();
      });
   });

   it('beforeUnmount', () => {
      let isDestroyCall = false;
      const source = {
         destroy: (id) => {
            assert.equal(id, 'id1');
            isDestroyCall = true;
         }
      };
      const createFC = () => {
         const FC = new Controller({});
         FC.saveOptions({ source });
         FC._record = {
            getKey: () => 'id1'
         };
         FC._crudController = {
            hideIndicator: sinon.fake()
         };
         return FC;
      };
      const FC = createFC();
      FC._beforeUnmount();
      FC.destroy();

      assert.equal(isDestroyCall, false);

      const FC2 = createFC();
      FC2._isNewRecord = true;
      FC2._crudController = {
         hideIndicator: sinon.fake()
      };
      FC2._beforeUnmount();
      assert.equal(isDestroyCall, true);
      FC2.destroy();
   });

   it('delete new record', () => {
      const FC = new Controller({});
      let isDestroyCalled = false;
      const source = {
         destroy: () => {
            isDestroyCalled = true;
         }
      };
      FC.saveOptions({ source });
      FC._tryDeleteNewRecord();
      assert.equal(isDestroyCalled, false);

      FC._record = {
         getKey: () => null
      };
      FC._isNewRecord = true;

      FC._tryDeleteNewRecord();
      assert.equal(isDestroyCalled, false);

      FC._record = {
         getKey: () => 'key'
      };
      FC._tryDeleteNewRecord();
      assert.equal(isDestroyCalled, true);

      FC.destroy();
   });

   it('_notifyHandler', () => {
      const name = 'deletesuccessed';
      const args = {};
      const sandbox = sinon.sandbox.create();
      const component = new Controller({});

      sandbox.stub(component, '_notifyToOpener');
      sandbox.stub(component, '_notify');
      component._notifyHandler(name, args);
      sinon.assert.callOrder(component._notifyToOpener, component._notify);
      sandbox.restore();
   });

   it('requestCustomUpdate isNewRecord', (done) => {
      const FC = new Controller({});
      const sandbox = sinon.createSandbox();
      const updateCfg = {};
      FC._isNewRecord = true;
      sandbox.stub(FC, '_notify').returns(true);
      FC.update(updateCfg).then(() => {
         assert.equal(FC._isNewRecord, false);
         assert.deepEqual(FC._notify.args[0], ['requestCustomUpdate', [FC._record, updateCfg]]);
         done();
         FC.destroy();
         sandbox.restore();
      });
   });
   it('requestCustomUpdate', () => {
      const FC = new Controller({});
      let update = false;
      FC._notify = (event) => {
         if ( event === 'requestCustomUpdate') {
            return false;
         }
         return true;
      };
      FC._notifyToOpener = (eventName) => {
         if ( eventName === 'updatestarted') {
            update = true;
            FC.destroy();
         }
      };
      const validation = {
         submit: () => Promise.resolve(true)
      };
      FC._isNewRecord = true;
      FC._requestCustomUpdate = () => false;
      FC._record = {
         getKey: () => 'id1',
         isChanged: () => true
      };
      const crud = {
         update: () => Promise.resolve()
      };
      FC._children = { crud, validation };
      FC._processError = sinon.fake();
      FC.update();
      assert.equal(update, true);
      FC.destroy();
   });

   it('update width form operation errors', () => {
      const FC = new Controller({});
      let updateResolved = false;
      let pendingPromiseResolved = false;
      let timeoutId;
      const operation = {
         save() {
            return Promise.reject('Error');
         },
         isDestroyed() {
            return false;
         }
      };
      const finishTest = () => {
         assert.isTrue(updateResolved);
         assert.isTrue(pendingPromiseResolved);
         clearTimeout(timeoutId);
         FC.destroy();
         done();
      };

      FC._update = () => Promise.resolve(true);
      FC._getRecordId = () => undefined;
      FC._notifyToOpener = () => undefined;
      FC._registerFormOperationHandler(null, operation);
      const updatePromise = FC.update();
      const pendingPromise = FC._updatePromise;
      timeoutId = setTimeout(finishTest, 1000);
      updatePromise.finally(() => {
         updateResolved = true;
         if (pendingPromiseResolved) {
            finishTest();
         }
      });
      pendingPromise.finally(() => {
         pendingPromiseResolved = true;
         if (updateResolved) {
            finishTest();
         }
      });
   });

   it('update with error', (done) => {
      let error = false;
      const FC = new Controller({});
      FC._record = {
         getKey: () => 'id1',
         isChanged: () => true
      };
      FC._notify = (event) => {
         return false;
      };
      FC._validateController = {
         submit: () => Promise.reject('error'),
         resolveSubmit: () => Promise.reject('error'),
         deferSubmit: () => Promise.reject('error')
      };
      FC._crudController = {
         update: () => Promise.reject()
      };
      FC._processError = sinon.fake();
      FC._forceUpdate = () => {
         setTimeout(FC._afterUpdate.bind(FC));
      };
      FC.update().catch(() => {
         error = true;
         assert.isTrue(error);
         FC.destroy();
         done();
      });
   });

   it('read with error', async () => {
      const FC = new Controller({});
      let currentExpectedMode;
      const opts = {key: 123, record: {key: 123}, initializingWay: 'preload'};
      FC._beforeMount(opts);
      FC.saveOptions(opts);
      FC._crudController.read = () => {
         return Promise.reject();
      };
      FC._errorController.process = (cfg) => {
         assert.equal(cfg.mode, currentExpectedMode);
         return Promise.resolve({});
      };

      currentExpectedMode = 'include';
      opts.initializingWay = 'remote';
      FC.saveOptions(opts);
      await FC.read(123).catch((e) => e);

      currentExpectedMode = 'dialog';
      opts.initializingWay = 'delayed_remote';
      FC.saveOptions(opts);
      await FC.read(123).catch((e) => e);
   });

   it('create record before mount check record state', () => {
      const FC = new Controller({});
      FC._record = 'initModel';
      const cfg = {
         source: {
            create: () => Promise.resolve(new Record())
         },
         initializingWay: 'delayedCreate'
      };
      return FC._createRecordBeforeMount(cfg).then(() => {
         assert.equal(FC._record, 'initModel');
         FC.destroy();
      });
   });

   it('createHandler and readHandler ', () => {
      const FC = new Controller({});
      FC._createHandler();
      assert.equal(FC._wasCreated, true);
      assert.equal(FC._isNewRecord, true);

      FC._readHandler();
      assert.equal(FC._wasRead, true);
      assert.equal(FC._isNewRecord, false);
      FC.destroy();
   });

   it('afterMount. Create before mount', () => {
      const FC = new Controller({});
      const record = createModel(1);
      FC._record = record;
      FC._createdInMounting = {
         result: record,
         isError: false
      };
      const notifyHandler = sinon.stub(FC, '_notifyHandler');
      const createHandler = sinon.stub(FC, '_createHandler');
      FC._afterMount();

      assert.isTrue(FC._isMount);
      assert.isTrue(notifyHandler.withArgs('createsuccessed').called);
      assert.isTrue(createHandler.withArgs(record).called);
      assert.equal(this._createdInMounting, undefined);

      FC._createdInMounting = {
         isError: true
      };
      FC._afterMount();
      assert.isTrue(notifyHandler.withArgs('createfailed').called);
      assert.equal(this._createdInMounting, undefined);
      FC.destroy();
   });

   it('afterMount. Read before mount', () => {
      const FC = new Controller({});
      const record = createModel(1);
      FC._record = record;
      FC._readInMounting = {
         result: record,
         isError: false
      };
      const notifyHandler = sinon.stub(FC, '_notifyHandler');
      const readHandler = sinon.stub(FC, '_readHandler');
      FC._afterMount();

      assert.isTrue(FC._isMount);
      assert.isTrue(notifyHandler.withArgs('readsuccessed').called);
      assert.isTrue(readHandler.withArgs(record).called);
      assert.equal(this._readInMounting, undefined);

      FC._readInMounting = {
         isError: true
      };
      FC._afterMount();
      assert.isTrue(notifyHandler.withArgs('readfailed').called);
      assert.equal(this._readInMounting, undefined);
      FC.destroy();
   });

   it('afterUpdate', () => {
      const FC = new Controller({});
      const activate = sinon.stub(FC, 'activate');

      FC._afterUpdate({});
      assert.isFalse(activate.called);

      FC.saveOptions({
         record: createModel(1),
         initializingWay: INITIALIZING_WAY.PRELOAD
      });
      FC._wasDestroyed = true;
      FC._wasCreated = true;
      FC._wasRead = true;
      FC._afterUpdate({});

      assert.isTrue(activate.called);
      assert.isFalse(FC._wasCreated);
      assert.isFalse(FC._wasRead);
      assert.isFalse(FC._wasDestroyed);
      FC.destroy();
   });

   it('createRecordBeforeMount success', () => {
      const FC = new Controller({});
      const record = createModel(1);
      const cfg = {
         initializigWay: INITIALIZING_WAY.CREATE,
         source: {
            create: sinon.stub().callsFake(() => Promise.resolve(record))
         }
      };
      FC._isMount = true;
      const notifyRead = sinon.stub(FC, '_createRecordBeforeMountNotify');
      return FC._createRecordBeforeMount(cfg).then(() => {
         assert.equal(FC._record, record);
         assert.isTrue(notifyRead.called);
         FC.destroy();
      });
   });

   it('createRecordBeforeMount reject', () => {
      const FC = new Controller({});
      const cfg = {
         source: {
            create: sinon.stub().callsFake(() => Promise.reject())
         }
      };
      FC._errorController = {
         setOnProcess: sinon.fake(),
         process: () => Promise.resolve()
      };
      const setFunctionToRepeat = sinon.spy(FC, '_setFunctionToRepeat');
      const processError = sinon.spy(FC, 'processError');
      return FC._createRecordBeforeMount(cfg).catch(() => {
         assert.equal(FC._createdInMounting.isError, true);
         sinon.assert.called(setFunctionToRepeat);
         sinon.assert.called(processError);
         FC.destroy();
      });
   });

   it('create', () => {
       const FC = new Controller({});
       FC._beforeMount({
           initializingWay: INITIALIZING_WAY.PRELOAD
       });
       sinon.stub(FC._crudController, 'create').callsFake(() => Promise.resolve({}));
       const createHandler = sinon.stub(FC, '_createHandler');
       return FC.create().then(() => {
           assert.isTrue(createHandler.called);
           FC.destroy();
       });
   });

   it('readRecordBeforeMount success', () => {
      const FC = new Controller({});
      const record = createModel(1);
      const cfg = {
         source: {
            read: sinon.stub().callsFake(() => Promise.resolve(record))
         }
      };
      FC._isMount = true;
      const notifyRead = sinon.stub(FC, '_readRecordBeforeMountNotify');
      return FC._readRecordBeforeMount(cfg).then(() => {
         assert.equal(FC._record, record);
         assert.isTrue(notifyRead.called);
         FC.destroy();
      });
   });

   it('readRecordBeforeMount reject', () => {
      const FC = new Controller({});
      const cfg = {
         source: {
            read: sinon.stub().callsFake(() => Promise.reject())
         }
      };
      FC._errorController = {
         setOnProcess: sinon.fake(),
         process: () => Promise.resolve()
      };
      const setFunctionToRepeat = sinon.spy(FC, '_setFunctionToRepeat');
      const processError = sinon.spy(FC, 'processError');
      return FC._readRecordBeforeMount(cfg).catch(() => {
         assert.equal(FC._readInMounting.isError, true);
         sinon.assert.called(setFunctionToRepeat);
         sinon.assert.called(processError);
         FC.destroy();
      });
   });

   it('updating failed with validation success', () => {
      const FC = new Controller({});
      FC._beforeMount({
         initializingWay: INITIALIZING_WAY.PRELOAD
      });
      const result = {hasErrors: false};
      sinon.stub(FC, 'validate').callsFake(() => Promise.resolve(result));
      sinon.stub(FC._crudController, 'update').callsFake(() => Promise.reject({}));
      const processError = sinon.stub(FC, 'processError').callsFake(() => Promise.resolve({}));
      return FC._update().catch(() => {
         sinon.assert.called(processError);
         FC.destroy();
      });
   });

   it('updating failed with validation failed', () => {
      const FC = new Controller({});
      FC._beforeMount({
         initializingWay: INITIALIZING_WAY.PRELOAD
      });
      const result = {hasErrors: true};
      sinon.stub(FC, 'validate').callsFake(() => Promise.resolve(result));
      sinon.stub(FC, '_createError').callsFake(() => 'error');
      const notify = sinon.stub(FC, '_notify');
      return FC._update().catch(() => {
          assert.isTrue(notify.calledWith('validationFailed'));
      });
   });

   it('delete success', () => {
       const FC = new Controller({});
       FC._record = createModel(1);
       FC._beforeMount({
           initializingWay: INITIALIZING_WAY.PRELOAD
       });
       const updateIsNewRecord = sinon.stub(FC, '_updateIsNewRecord');
       sinon.stub(FC._crudController, 'delete').callsFake(() => Promise.resolve({}));
       return FC.delete().then(() => {
           assert.equal(FC._record, null);
           assert.isTrue(FC._wasDestroyed);
           sinon.assert.called(updateIsNewRecord);
           FC.destroy();
       });
   });

   it('delete reject', () => {
      const FC = new Controller({});
      FC._beforeMount({
         initializingWay: INITIALIZING_WAY.PRELOAD
      });
      const setFunctionToRepeat = sinon.spy(FC, '_setFunctionToRepeat');
      const processError = sinon.stub(FC, 'processError').callsFake(() => Promise.resolve());
      sinon.stub(FC._crudController, 'delete').callsFake(() => Promise.reject({}));
      return FC.delete().then(() => {
         sinon.assert.called(setFunctionToRepeat);
         sinon.assert.called(processError);
         FC.destroy();
      });
   });

   describe('_onCloseErrorDialog()', () => {
      let fc;

      beforeEach(() => {
         fc = new Controller({});
         fc._error = {};
         sinon.stub(fc, '_notify');
      });

      afterEach(() => {
         sinon.reset();
      });

      it('without record', () => {
         fc._onCloseErrorDialog();
         assert.isNotOk(fc._error, 'resets viewConfig of error container');
         assert.isTrue(fc._notify.calledOnce, 'notifies "close"');
         assert.deepEqual(fc._notify.getCall(0).args, ['close', [], { bubbling: true }]);
      });

      it('with record', () => {
         fc._record = {};
         fc._onCloseErrorDialog();
         assert.isNotOk(fc._error, 'resets viewConfig of error container');
         assert.isNotOk(fc._notify.called, 'does not notify "close"');
      });
   });
});
