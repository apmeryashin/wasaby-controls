/* global beforeEach, afterEach, describe, context, it, assert */
define([
   'js!SBIS3.CONTROLS.Data.Source.DataSet',
   'js!SBIS3.CONTROLS.Data.Source.Memory',
   'js!SBIS3.CONTROLS.Data.Adapter.Json',
   'js!SBIS3.CONTROLS.Data.Model',
   'js!SBIS3.CONTROLS.Data.Collection.RecordSet'
], function (DataSet, MemorySource, JsonAdapter, Model, RecordSet) {
      'use strict';

      var list;

      beforeEach(function () {
         list = [{
            'Ид': 1,
            'Фамилия': 'Иванов'
         }, {
            'Ид': 2,
            'Фамилия': 'Петров'
         }, {
            'Ид': 3,
            'Фамилия': 'Сидоров'
         }];
      });

      afterEach(function () {
         list = undefined;
      });

      describe('SBIS3.CONTROLS.Data.Source.DataSet', function () {
         describe('.$constructor()', function () {
            it('should take adapter from the source', function () {
               var source =  new MemorySource(),
                  ds = new DataSet({
                  source: source
               });
               assert.strictEqual(ds.getAdapter(), source.getAdapter());
            });

            it('should don\'t take adapter from the source', function () {
               var source =  new MemorySource(),
                  adapter = new JsonAdapter(),
                  ds = new DataSet({
                     adapter: adapter,
                     source: source
                  });
               assert.strictEqual(ds.getAdapter(), adapter);
               assert.notStrictEqual(ds.getAdapter(), source.getAdapter());
            });

            it('should take model from source', function () {
               var source =  new MemorySource(),
                  ds = new DataSet({
                     source: source
                  });
               assert.strictEqual(ds.getModel(), source.getModel());
            });

            it('should don\'t take adapter from the source', function () {
               var source =  new MemorySource(),
                  ExtModel = Model.extend({}),
                  ds = new DataSet({
                     model: ExtModel,
                     source: source
                  });
               assert.strictEqual(ds.getModel(), ExtModel);
               assert.notStrictEqual(ds.getModel(), source.getModel());
            });

            it('should take idProperty from the source', function () {
               var source =  new MemorySource({
                     idProperty: 'abc'
                  }),
                  ds = new DataSet({
                     source: source
                  });
               assert.equal(ds.getIdProperty(), 'abc');
               assert.equal(ds.getIdProperty(), source.getIdProperty());
            });

            it('should don\'t take idProperty from the source', function () {
               var source =  new MemorySource({
                     idProperty: 'abc'
                  }),
                  ds = new DataSet({
                     idProperty: 'def',
                     source: source
                  });
               assert.equal(ds.getIdProperty(), 'def');
               assert.notEqual(ds.getIdProperty(), source.getIdProperty());
            });
         });

         describe('.getSource()', function () {
            it('should return the source', function () {
               var source =  new MemorySource(),
                  ds = new DataSet({
                     source: source
                  });
               assert.strictEqual(ds.getSource(), source);
            });

            it('should return an undefined source', function () {
               var ds = new DataSet();
               assert.isUndefined(ds.getSource());
            });
         });

         describe('.getAdapter()', function () {
            it('should return the adapter', function () {
               var adapter = new JsonAdapter(),
                  ds = new DataSet({
                     adapter: adapter
                  });
               assert.strictEqual(ds.getAdapter(), adapter);
            });

            it('should return an undefined adapter', function () {
               var ds = new DataSet();
               assert.isUndefined(ds.getAdapter());
            });
         });

         describe('.getModel()', function () {
            it('should return the model', function () {
               var ds = new DataSet({
                  model: Model
               });
               assert.strictEqual(ds.getModel(), Model);
            });

            it('should return an undefined model', function () {
               var ds = new DataSet();
               assert.isUndefined(ds.getModel());
            });
         });

         describe('.setModel()', function () {
            it('should set the model', function () {
               var ds = new DataSet();
               ds.setModel(Model);
               assert.strictEqual(ds.getModel(), Model);
            });
         });

         describe('.getIdProperty()', function () {
            it('should return the idProperty', function () {
               var ds = new DataSet({
                  idProperty: '123'
               });
               assert.strictEqual(ds.getIdProperty(), '123');
            });

            it('should return an empty string', function () {
               var ds = new DataSet();
               assert.strictEqual(ds.getIdProperty(), '');
            });
         });

         describe('.setIdProperty()', function () {
            it('should set the idProperty', function () {
               var ds = new DataSet();
               ds.setIdProperty('987');
               assert.strictEqual(ds.getIdProperty(), '987');
            });
         });

         describe('.getAll()', function () {
            it('should return a list', function () {
               var ds = new DataSet({
                  adapter: new JsonAdapter(),
                  rawData:{}
               });
               assert.instanceOf(ds.getAll(), RecordSet);
            });

            it('should return a list of 2 by default', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: [1, 2]
               });
               assert.equal(ds.getAll().getCount(), 2);
            });

            it('should return a list of 2 from given property', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: {some: {prop: [1, 2]}}
               });
               assert.equal(ds.getAll('some.prop').getCount(), 2);
            });

            it('should return an empty list from undefined property', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: {}
               });
               assert.equal(ds.getAll('some.prop').getCount(), 0);
            });

            it('should throw an Error if adapter is not defined', function () {
               var ds = new DataSet({

               });
               assert.throw(function() {
                  ds.getAll();
               });
            });
         });

         describe('.getRow()', function () {
            it('should return a model', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter()
               });
               assert.instanceOf(ds.getRow(), Model);
            });

            it('should return a model by default', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: {a: 1, b: 2}
               });
               assert.strictEqual(ds.getRow().get('a'), 1);
               assert.strictEqual(ds.getRow().get('b'), 2);
            });

            it('should return a model from given property', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: {some: {prop: {a: 1, b: 2}}}
               });
               assert.equal(ds.getRow('some.prop').get('a'), 1);
               assert.equal(ds.getRow('some.prop').get('b'), 2);
            });

            it('should return an empty list from undefined property', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: {}
               });
               assert.instanceOf(ds.getRow('some.prop'), Model);
            });

            it('should return a first item of recordset', function () {
               var data = [{a: 1}, {a: 2}],
                  ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: data
               });
               data._type = 'recordset';
               assert.equal(ds.getRow().get('a'), 1);
            });

            it('should return undefined from empty recordset', function () {
               var data = [],
                  ds = new DataSet({
                     model: Model,
                     adapter: new JsonAdapter(),
                     rawData: data
                  });
               data._type = 'recordset';
               assert.isUndefined(ds.getRow());
            });

            it('should throw an Error if adapter is not defined', function () {
               var ds = new DataSet();
               assert.throw(function() {
                  ds.getRow();
               });
            });

            it('should throw an Error if model is not defined', function () {
               var ds = new DataSet({
                  adapter: new JsonAdapter()
               });
               assert.throw(function() {
                  ds.getRow();
               });
            });
         });

         describe('.getScalar()', function () {
            it('should return a default value', function () {
               var ds = new DataSet({
                  adapter: new JsonAdapter(),
                  rawData: 'qwe'
               });
               assert.equal(ds.getScalar(), 'qwe');
            });

            it('should return a value from given property', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: {some: {propA: 'a', propB: 'b'}}
               });
               assert.equal(ds.getScalar('some.propA'), 'a');
               assert.equal(ds.getScalar('some.propB'), 'b');
            });

            it('should return undefined from undefined property', function () {
               var ds = new DataSet({
                  model: Model,
                  adapter: new JsonAdapter(),
                  rawData: {}
               });
               assert.isUndefined(ds.getScalar('some.prop'));
            });

            it('should throw an Error if adapter is not defined', function () {
               var ds = new DataSet();
               assert.throw(function() {
                  ds.getScalar();
               });
            });
         });

         describe('.hasProperty()', function () {
            it('should return true for defined property', function () {
               var ds = new DataSet({
                  adapter: new JsonAdapter(),
                  rawData: {a: {b: {c: {}}}}
               });
               assert.isTrue(ds.hasProperty('a'));
               assert.isTrue(ds.hasProperty('a.b'));
               assert.isTrue(ds.hasProperty('a.b.c'));
               assert.isTrue(ds.hasProperty(''));
               assert.isTrue(ds.hasProperty());
            });

            it('should return false for undefined property', function () {
               var ds = new DataSet({
                  adapter: new JsonAdapter(),
                  rawData: {a: {b: {c: {}}}}
               });
               assert.isFalse(ds.hasProperty('e'));
               assert.isFalse(ds.hasProperty('a.e'));
               assert.isFalse(ds.hasProperty('a.b.e'));
            });

            it('should throw an Error if adapter is not defined', function () {
               var ds = new DataSet();
               assert.throw(function() {
                  ds.hasProperty('a');
               });
            });
         });

         describe('.getProperty()', function () {
            it('should return defined property', function () {
               var data = {a: {b: {c: {}}}},
                  ds = new DataSet({
                  adapter: new JsonAdapter(),
                  rawData: data
               });
               assert.strictEqual(ds.getProperty('a'), data.a);
               assert.strictEqual(ds.getProperty('a.b'), data.a.b);
               assert.strictEqual(ds.getProperty('a.b.c'), data.a.b.c);
               assert.strictEqual(ds.getProperty(''), data);
               assert.strictEqual(ds.getProperty(), data);
            });

            it('should return undefined for undefined property', function () {
               var ds = new DataSet({
                  adapter: new JsonAdapter(),
                  rawData: {a: {b: {c: {}}}}
               });
               assert.isUndefined(ds.getProperty('e'));
               assert.isUndefined(ds.getProperty('a.e'));
               assert.isUndefined(ds.getProperty('a.b.e'));
            });

            it('should throw an Error if adapter is not defined', function () {
               var ds = new DataSet();
               assert.throw(function() {
                  ds.getProperty('a');
               });
            });
         });

         describe('.getRawData()', function () {
            it('should return raw data', function () {
               var data = {a: {b: {c: {}}}},
                  ds = new DataSet({
                     adapter: new JsonAdapter(),
                     rawData: data
                  });
               assert.strictEqual(ds.getRawData(), data);
            });
         });

         describe('.setRawData()', function () {
            it('should set raw data', function () {
               var data = {a: {b: {c: {}}}},
                  ds = new DataSet({
                     adapter: new JsonAdapter()
                  });
               ds.setRawData(data);
               assert.strictEqual(ds.getRawData(), data);
            });
         });
      });
   }
);
