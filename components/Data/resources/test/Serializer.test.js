/* global define, beforeEach, afterEach, describe, context, it, assert, $ws */
define([
      'js!SBIS3.CONTROLS.Data.Serializer',
      'js!SBIS3.CONTROLS.Data.Model',
      'js!SBIS3.CONTROLS.Data.Collection.List'
   ], function (Serializer, Model, List) {
      'use strict';
      describe('SBIS3.CONTROLS.Data.Serializer', function () {
         var serializer,
            getSerializedObj = function() {
               return {
                  a: undefined,
                  b: null,
                  c: false,
                  d: 0,
                  e: 1,
                  f: [],
                  g: [undefined, 1, 2],
                  h: {
                     ha: undefined,
                     hb: Infinity,
                     hc: -Infinity
                  }
               };
            },
            getSerializedSample = function() {
               return '{"b":null,"c":false,"d":0,"e":1,"f":[],"g":[{"$serialized$":"undef"},1,2],"h":{"hb":{"$serialized$":"+inf"},"hc":{"$serialized$":"-inf"}}}';
            };
         beforeEach(function () {
            serializer = new Serializer();
         });

         describe('.serialize()', function () {
            it('should serialize a function', function () {
               var result = serializer.serialize('f', function() {
                  return Math.rand();
               });
               assert.strictEqual(result.$serialized$, 'func');
               assert.isTrue(result.id >= 0);
            });

            it('should serialize Infinity', function () {
               var result = serializer.serialize('i', Infinity);
               assert.strictEqual(result.$serialized$, '+inf');
            });

            it('should serialize -Infinity', function () {
               var result = serializer.serialize('i', -Infinity);
               assert.strictEqual(result.$serialized$, '-inf');
            });

            it('should serialize undefined if it\'s an array element', function () {
               var result = serializer.serialize(1, undefined);
               assert.strictEqual(result.$serialized$, 'undef');
            });

            it('should return unchanged', function () {
               assert.strictEqual(serializer.serialize('a', undefined), undefined);
               assert.strictEqual(serializer.serialize('a', null), null);
               assert.strictEqual(serializer.serialize('a', 1), 1);
               assert.strictEqual(serializer.serialize('a', 'b'), 'b');
               var arr = [];
               assert.strictEqual(serializer.serialize('a', arr), arr);
               var obj = {};
               assert.strictEqual(serializer.serialize('a', obj), obj);
            });

            context('when used with JSON.stringify() as replacer', function () {
               it('should work properly with deep structures', function () {
                  var string = JSON.stringify(getSerializedObj(), serializer.serialize);
                  assert.strictEqual(string, getSerializedSample());
               });

               it('should work with Model', function () {
                  var model = new Model(),
                     plainObj = JSON.parse(JSON.stringify(model, serializer.serialize));
                  assert.strictEqual(plainObj.$serialized$, 'inst');
                  assert.strictEqual(plainObj.module, 'SBIS3.CONTROLS.Data.Model');
               });

               it('should work with Model in deep structures', function () {
                  var model = new Model(),
                     plainObj = JSON.parse(JSON.stringify({
                        a: {
                           b: [model]
                        }
                     }, serializer.serialize));
                  assert.strictEqual(plainObj.a.b[0].$serialized$, 'inst');
                  assert.strictEqual(plainObj.a.b[0].module, 'SBIS3.CONTROLS.Data.Model');
               });

               it('should create equal structures for same instances of Model', function () {
                  var modelA = new Model(),
                     modelB = new Model(),
                     plainObj = JSON.parse(JSON.stringify({
                        a: modelA,
                        b: modelB,
                        c: modelA,
                        d: {
                           e: [modelB]
                        }
                     }, serializer.serialize));
                  assert.deepEqual(plainObj.a, plainObj.c);
                  assert.deepEqual(plainObj.b, plainObj.d.e[0]);
               });
            });
         });

         describe('.deserialize()', function () {
            it('should deserialize a function', function () {
               var func = function() {
                     return Math.rand();
                  },
                  result = serializer.deserialize(
                  'f',
                  serializer.serialize('f', func)
               );
               assert.instanceOf(result, Function);
               assert.strictEqual(result, func);
            });

            it('should deserialize a date', function () {
               var date = new Date('1995-12-17T01:02:03'),
                  dateStr = date.toJSON(),
                  result = serializer.deserialize('', dateStr);
               assert.instanceOf(result, Date);
               assert.strictEqual(result.getTime(), date.getTime());
            });

            it('should deserialize Infinity', function () {
               var result = serializer.deserialize(
                  'i',
                  serializer.serialize('i', Infinity)
               );
               assert.strictEqual(result, Infinity);
            });

            it('should deserialize -Infinity', function () {
               var result = serializer.deserialize(
                  'i',
                  serializer.serialize('i', -Infinity)
               );
               assert.strictEqual(result, -Infinity);
            });

            it('should deserialize undefined if it\'s an array element', function () {
               var result = serializer.deserialize(
                  1,
                  serializer.serialize(1, undefined)
               );
               assert.strictEqual(result, undefined);
            });

            it('should return unchanged', function () {
               assert.strictEqual(
                  serializer.deserialize(
                     'a',
                     undefined
                  ),
                  undefined
               );

               assert.strictEqual(
                  serializer.deserialize(
                     'a',
                     null
                  ),
                  null
               );

               assert.strictEqual(
                  serializer.deserialize(
                     'a',
                     1
                  ),
                  1
               );

               assert.strictEqual(
                  serializer.deserialize(
                     'a',
                     'b'
                  ),
                  'b'
               );

               var arr = [];
               assert.strictEqual(
                  serializer.deserialize(
                     'a',
                     arr
                  ),
                  arr
               );

               var obj = {};
               assert.strictEqual(
                  serializer.deserialize(
                     'a',
                     obj
                  ),
                  obj
               );
            });

            context('when used with JSON.parse() as reviver', function () {
               it('should work properly with deep structures', function () {
                  var obj = JSON.parse(getSerializedSample(), serializer.deserialize),
                     expectObj = getSerializedObj();

                  //undefined is not serializable
                  delete expectObj.a;
                  delete expectObj.h.ha;

                  //Chrome не создает undfined элемент, хотя индекс под него зарезерирован
                  obj.g[0] = undefined;

                  assert.notEqual(expectObj, obj);
                  assert.deepEqual(expectObj, obj);
               });

               it('should create same instances for equal serialized instances of SerializableMixin', function () {
                  var modelA = new Model(),
                     modelB = new Model(),
                     listA = new List({
                        items: [modelA, modelB]
                     }),
                     listB = new List(),
                     obj = JSON.parse(
                        JSON.stringify({
                              a: modelA,
                              b: modelB,
                              c: modelA,
                              d: listA,
                              e: {
                                 a: [modelB],
                                 b: listA,
                                 c: listB,
                                 d: [listB, listA]
                              }
                           },
                           serializer.serialize),
                        serializer.deserialize
                     );

                  assert.strictEqual(obj.a, obj.c);
                  assert.strictEqual(obj.b, obj.e.a[0]);

                  assert.strictEqual(obj.d, obj.e.b);
                  assert.strictEqual(obj.d, obj.e.d[1]);
                  assert.strictEqual(obj.e.b, obj.e.d[1]);
                  assert.strictEqual(obj.e.c, obj.e.d[0]);

                  assert.strictEqual(obj.a, obj.d.at(0));
                  assert.strictEqual(obj.b, obj.d.at(1));
               });
            });
         });
      });
   }
);