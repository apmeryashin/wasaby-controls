/* global define, describe, context, beforeEach, afterEach, it, assert, $ws */
define([
   'js!SBIS3.CONTROLS.Data.Source.SbisService',
   'js!SBIS3.CONTROLS.Data.Di',
   'js!SBIS3.CONTROLS.Data.Source.Provider.IRpc',
   'js!SBIS3.CONTROLS.Data.Source.DataSet',
   'js!SBIS3.CONTROLS.Data.Model',
   'js!SBIS3.CONTROLS.Data.Collection.List',
   'js!SBIS3.CONTROLS.Data.Adapter.Sbis',
   'js!SBIS3.CONTROLS.Data.Query.Query'
], function (SbisService, Di, IRpc, DataSet, Model, List, SbisAdapter, Query) {
      'use strict';

      //Mock of SBIS3.CONTROLS.Data.Source.Provider.SbisBusinessLogic
      var SbisBusinessLogic = (function() {
         var existsId = 7,
            existsTooId = 987,
            notExistsId = 99,
            textId = 'uuid';

         var Mock = $ws.core.extend({}, [IRpc], {
            _cfg: {},
            $constructor: function (cfg) {
               this._cfg = cfg;
            },
            call: function (method, args) {
               var def = new $ws.proto.Deferred(),
                  meta = [
                     {'n': 'Фамилия', 't': 'Строка'},
                     {'n': 'Имя', 't': 'Строка'},
                     {'n': 'Отчество', 't': 'Строка'},
                     {'n': '@Ид', 't': 'Число целое'},
                     {'n': 'Должность', 't': 'Строка'},
                     {'n': 'В штате', 't': 'Логическое'}
                  ],
                  idPosition = 3,
                  error = '',
                  data;

               switch (this._cfg.endpoint.contract) {
                  case 'Товар':
                  case 'Продукт':
                     switch (method) {
                        case 'Создать':
                           data = {
                              d: [
                                 '',
                                 '',
                                 '',
                                 0,
                                 '',
                                 false
                              ],
                              s: meta
                           };
                           break;

                        case 'Прочитать':
                           if (args['ИдО'] === existsId) {
                              data = {
                                 d: [
                                    'Иванов',
                                    'Иван',
                                    'Иванович',
                                    existsId,
                                    'Инженер',
                                    true
                                 ],
                                 s: meta
                              };
                           } else {
                              error = 'Model is not found';
                           }
                           break;

                        case 'Записать':
                           if (args['Запись'].d && args['Запись'].d[idPosition]) {
                              data = args['Запись'].d[idPosition];
                           } else {
                              data = 99;
                           }
                           break;

                        case 'Удалить':
                           if (args['ИдО'] === existsId ||
                              args['ИдО'] == textId ||
                              ($ws.helpers.type(args['ИдО']) === 'array' && Array.indexOf(args['ИдО'], String(existsId)) !== -1)
                           ) {
                              data = existsId;
                           } else if (args['ИдО'] === existsTooId || ($ws.helpers.type(args['ИдО']) === 'array' && Array.indexOf(args['ИдО'],String(existsTooId)) !== -1)) {
                              data = existsTooId;
                           } else {
                              error = 'Model is not found';
                           }
                           break;

                        case 'Список':
                           data = {
                              d: [
                                 [
                                    'Иванов',
                                    'Иван',
                                    'Иванович',
                                    existsId,
                                    'Инженер',
                                    true
                                 ],
                                 [
                                    'Петров',
                                    'Петр',
                                    'Петрович',
                                    1 + existsId,
                                    'Специалист',
                                    true
                                 ]
                              ],
                              s: meta
                           };
                           break;

                        case 'ВставитьДо':
                        case 'ВставитьПосле':
                        case 'Произвольный':
                           break;

                        default:
                           error = 'Method "' + method + '" is undefined';
                     }
                     break;

                  case 'ПорядковыйНомер':
                     switch (method) {
                        case 'ВставитьДо':
                        case 'ВставитьПосле':
                           break;
                     }
                     break;

                  default:
                     error = 'Contract "' + this._cfg.endpoint.contract + '" is not found';
               }

               setTimeout(function () {
                  Mock.lastRequest = {
                     cfg: this._cfg,
                     method: method,
                     args: args
                  };

                  if (error) {
                     return def.errback(error);
                  }

                  def.callback(data);
               }.bind(this), 0);

               return def;
            }
         });

         Mock.lastRequest = {};
         Mock.existsId = existsId;
         Mock.notExistsId = notExistsId;

         return Mock;
      })();

      describe('SBIS3.CONTROLS.Data.Source.SbisService', function () {
         var getSampleModel = function() {
               var model = new Model({
                  adapter: 'adapter.sbis',
                  idProperty: '@Ид'
               });
               model.addField({name: '@Ид', type: 'integer'}, undefined, 1);
               model.addField({name: 'Фамилия', type: 'string'}, undefined, 'tst');

               return model;
            },
            getSampleMeta = function() {
               return {
                  a: 1,
                  b: 2,
                  c: 3
               };
            },
            testArgIsModel = function(arg, model) {
               assert.strictEqual(arg._type, 'record');
               assert.deepEqual(arg.d, model.getRawData().d);
               assert.deepEqual(arg.s, model.getRawData().s);
            },
            testArgIsDataSet = function(arg, dataSet) {
               assert.strictEqual(arg._type, 'recordset');
               assert.deepEqual(arg.d, dataSet.getRawData().d);
               assert.deepEqual(arg.s, dataSet.getRawData().s);
            },
            service;

         beforeEach(function() {
            //Replace of standard with mock
            Di.register('source.provider.sbis-business-logic', SbisBusinessLogic);

            service = new SbisService({
               endpoint: 'Товар'
            });
         });

         afterEach(function () {
            service = undefined;
         });

         describe('.create()', function () {
            context('when the service is exists', function () {
               it('should return an empty model', function (done) {
                  service.create().addCallbacks(function (model) {
                     try {
                        assert.isTrue(model instanceof Model);
                        assert.isTrue(model.isStored());
                        assert.isTrue(model.getId() > 0);
                        assert.strictEqual(model.get('Фамилия'), '');
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should generate a valid request', function (done) {
                  service.create().addCallbacks(function () {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;

                        assert.isFalse(args['ИмяМетода'] === null);
                        assert.strictEqual(args['Фильтр'].d[0], true, 'Wrong value for argument Фильтр.ВызовИзБраузера');
                        assert.strictEqual(args['Фильтр'].s[0].n, 'ВызовИзБраузера', 'Wrong name for argument Фильтр.ВызовИзБраузера');
                        assert.strictEqual(args['Фильтр'].s[0].t, 'Логическое', 'Wrong type for argument Фильтр.ВызовИзБраузера');

                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should generate a request with valid meta data from record', function (done) {
                  var model = getSampleModel();
                  service.create(model).addCallbacks(function () {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args['Фильтр'], model);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should generate a request with valid meta data from object', function (done) {
                  service.create(getSampleMeta()).addCallbacks(function () {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.deepEqual(args['Фильтр'], getSampleMeta());
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should generate a request with custom method name in the filter', function (done) {
                  var service = new SbisService({
                     endpoint: 'Товар',
                     binding: {
                        format: 'ПрочитатьФормат'
                     }
                  });
                  service.create().addCallbacks(function () {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.strictEqual(args['ИмяМетода'], 'ПрочитатьФормат');
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });
            });

            context('when the service isn\'t exists', function () {
               it('should return an error', function (done) {
                  var service = new SbisService({
                     endpoint: 'Купец'
                  });
                  service.create().addBoth(function (err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });

         describe('.read()', function () {
            context('when the service is exists', function () {
               context('and the model is exists', function () {
                  it('should return valid model', function (done) {
                     service.read(SbisBusinessLogic.existsId).addCallbacks(function (model) {
                        try {
                           assert.isTrue(model instanceof Model);
                           assert.isTrue(model.isStored());
                           assert.strictEqual(model.getId(), SbisBusinessLogic.existsId);
                           assert.strictEqual(model.get('Фамилия'), 'Иванов');
                           done();
                        } catch (err) {
                           done(err);
                        }
                     }, function (err) {
                        done(err);
                     });
                  });

                  it('should generate a valid request', function (done) {
                     var service = new SbisService({
                        endpoint: 'Товар',
                        binding: {
                           format: 'Формат'
                        }
                     });
                     service.read(
                        SbisBusinessLogic.existsId
                     ).addCallbacks(function () {
                        try {
                           var args = SbisBusinessLogic.lastRequest.args;
                           assert.strictEqual(args['ИмяМетода'], 'Формат');
                           assert.strictEqual(args['ИдО'], SbisBusinessLogic.existsId);
                           done();
                        } catch (err) {
                           done(err);
                        }
                     }, function (err) {
                        done(err);
                     });
                  });

                  it('should generate a request with valid meta data from record', function (done) {
                     service.read(
                        SbisBusinessLogic.existsId,
                        getSampleModel()
                     ).addCallbacks(function () {
                           try {
                              var args = SbisBusinessLogic.lastRequest.args;
                              testArgIsModel(args['ДопПоля'], getSampleModel());
                              done();
                           } catch (err) {
                              done(err);
                           }
                        }, function (err) {
                           done(err);
                        });
                  });

                  it('should generate a request with valid meta data from object', function (done) {
                     service.read(
                        SbisBusinessLogic.existsId,
                        getSampleMeta()
                     ).addCallbacks(function () {
                           try {
                              var args = SbisBusinessLogic.lastRequest.args;
                              assert.deepEqual(args['ДопПоля'], getSampleMeta());
                              done();
                           } catch (err) {
                              done(err);
                           }
                        }, function (err) {
                           done(err);
                        });
                  });
               });

               context('and the model isn\'t exists', function () {
                  it('should return an error', function (done) {
                     service.read(SbisBusinessLogic.notExistsId).addBoth(function (err) {
                        if (err instanceof Error) {
                           done();
                        } else {
                           done(new Error('That\'s no Error'));
                        }
                     });
                  });
               });
            });

            context('when the service isn\'t exists', function () {
               it('should return an error', function (done) {
                  var service = new SbisService({
                     endpoint: 'Купец'
                  });
                  service.read(SbisBusinessLogic.existsId).addBoth(function (err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });

         describe('.update()', function () {
            context('when the service is exists', function () {
               context('and the model was stored', function () {
                  it('should update the model', function (done) {
                     service.read(SbisBusinessLogic.existsId).addCallbacks(function (model) {
                        model.set('Фамилия', 'Петров');
                        service.update(model).addCallbacks(function (success) {
                           try {
                              assert.isTrue(success);
                              assert.isFalse(model.isChanged());
                              assert.strictEqual(model.get('Фамилия'), 'Петров');
                              done();
                           } catch (err) {
                              done(err);
                           }
                        }, function (err) {
                           done(err);
                        });
                     }, function (err) {
                        done(err);
                     });
                  });
               });

               var testModel = function (success, model, done) {
                  try {
                     assert.isTrue(success);
                     assert.isTrue(model.isStored());
                     assert.isFalse(model.isChanged());
                     assert.isTrue(model.getId() > 0);
                     done();
                  } catch (err) {
                     done(err);
                  }
               };

               context('and the model was not stored', function () {
                  it('should create the model by 1st way', function (done) {
                     var service = new SbisService({
                        endpoint: 'Товар',
                        idProperty: '@Ид'
                     });
                     service.create().addCallbacks(function (model) {
                        service.update(model).addCallbacks(function (success) {
                           testModel(success, model, done);
                        }, function (err) {
                           done(err);
                        });
                     }, function (err) {
                        done(err);
                     });
                  });

                  it('should create the model by 2nd way', function (done) {
                     var service = new SbisService({
                           endpoint: 'Товар',
                           idProperty: '@Ид'
                        }),
                        model = getSampleModel();

                     service.update(model).addCallbacks(function (success) {
                        testModel(success, model, done);
                     }, function (err) {
                        done(err);
                     });
                  });
               });

               it('should generate a valid request', function (done) {
                  var service = new SbisService({
                     endpoint: 'Товар',
                     binding: {
                        format: 'Формат'
                     }
                  });
                  service.read(SbisBusinessLogic.existsId).addCallbacks(function (model) {
                     service.update(
                        model,
                        {'ПолеОдин': '2'}
                     ).addCallbacks(function () {
                        try {
                           var args = SbisBusinessLogic.lastRequest.args;
                           testArgIsModel(args['Запись'], model);
                           assert.strictEqual(args['ДопПоля'].d[0], '2');
                           assert.strictEqual(args['ДопПоля'].s[0].n, 'ПолеОдин');
                           assert.strictEqual(args['ДопПоля'].s[0].t, 'Строка');
                           done();
                        } catch (err) {
                           done(err);
                        }
                     }, function (err) {
                        done(err);
                     });
                  }, function (err) {
                     done(err);
                  });
               });

               it('should accept a model in meta argument', function (done) {
                  var modelA = getSampleModel(),
                     modelB = getSampleModel();
                  service.update(
                     modelA,
                     modelB
                  ).addCallbacks(function () {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args['ДопПоля'], modelB);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });
            });

            context('when the service isn\'t exists', function () {
               it('should return an error', function (done) {
                  service.create().addCallbacks(function (model) {
                        var service = new SbisService({
                           endpoint: 'Купец'
                        });
                        service.update(model).addBoth(function (err) {
                           if (err instanceof Error) {
                              done();
                           } else {
                              done(new Error('That\'s no Error'));
                           }
                        });
                     }, function (err) {
                        done(err);
                     });
               });
            });
         });

         describe('.destroy()', function () {
            context('when the service is exists', function () {
               context('and the model is exists', function () {
                  it('should return success', function (done) {
                     service.destroy(SbisBusinessLogic.existsId).addCallbacks(function (success) {
                        try {
                           if (!success) {
                              throw new Error('Unsuccessful destroy');
                           } else {
                              done();
                           }
                        } catch (err) {
                           done(err);
                        }
                     }, function (err) {
                        done(err);
                     });
                  });
               });

               context('and the model isn\'t exists', function () {
                  it('should return an error', function (done) {
                     service.destroy(SbisBusinessLogic.notExistsId).addBoth(function (err) {
                        if (err instanceof Error) {
                           done();
                        } else {
                           done(new Error('That\'s no Error'));
                        }
                     });
                  });
               });

               it('should generate a valid request', function (done) {
                  service.destroy(
                     SbisBusinessLogic.existsId,
                     {'ПолеОдин': true}
                  ).addCallbacks(function () {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.isTrue($ws.helpers.type(args['ИдО']) != 'array' || args['ИдО'] != SbisBusinessLogic.existsId);
                        assert.isTrue(args['ДопПоля'].d[0]);
                        assert.strictEqual(args['ДопПоля'].s[0].n, 'ПолеОдин');
                        assert.strictEqual(args['ДопПоля'].s[0].t, 'Логическое');
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should accept a model in meta argument', function (done) {
                  var model = getSampleModel();
                  service.destroy(
                     SbisBusinessLogic.existsId,
                     model
                  ).addCallbacks(function () {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args['ДопПоля'], model);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should delete a few records', function (done) {
                  service.destroy([0, SbisBusinessLogic.existsId, 1]).addCallbacks(function (success) {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.isTrue(args['ИдО'][0] !== 0 && args['ИдО'][0] !== '0');
                        assert.strictEqual(args['ИдО'][1], SbisBusinessLogic.existsId);
                        assert.strictEqual(args['ИдО'][2], 1);
                        assert.isTrue(success);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should delete records by a composite key', function (done) {
                  service.destroy([SbisBusinessLogic.existsId + ',Товар', '987,Продукт']).addCallbacks(function (success) {
                     try {
                        var cfg = SbisBusinessLogic.lastRequest.cfg;
                        assert.strictEqual(cfg.endpoint.contract, 'Продукт');
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.equal(args['ИдО'], 987);
                        assert.isTrue(success);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should delete records by text key', function (done) {
                  service.destroy(['uuid']).addCallbacks(function (success) {
                     try {
                        var args = SbisBusinessLogic.lastRequest.args;
                        assert.strictEqual(args['ИдО'], 'uuid');
                        assert.isTrue(success);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

            });

            context('when the service isn\'t exists', function () {
               it('should return an error', function (done) {
                  var service = new SbisService({
                     endpoint: 'Купец'
                  });
                  service.destroy(SbisBusinessLogic.existsId).addBoth(function (err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });

         describe('.query()', function () {
            context('when the service is exists', function () {
               it('should return a valid dataset', function (done) {
                  service.query(new Query()).addCallbacks(function (ds) {
                     try {
                        assert.isTrue(ds instanceof DataSet);
                        assert.strictEqual(ds.getAll().getCount(), 2);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should take idProperty for dataset  from raw data', function (done) {
                  service.query(new Query()).addCallbacks(function (ds) {
                     try {
                        assert.strictEqual(ds.getIdProperty(), '@Ид');
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should work with no query', function (done) {
                  service.query().addCallbacks(function (ds) {
                     try {
                        assert.isTrue(ds instanceof DataSet);
                        assert.strictEqual(ds.getAll().getCount(), 2);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should return a list instance of injected module', function (done) {
                  var MyList = List.extend({});
                  service.setListModule(MyList);
                  service.query().addCallbacks(function (ds) {
                     try {
                        assert.isTrue(ds.getAll() instanceof MyList);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should return a model instance of injected module', function (done) {
                  var MyModel = Model.extend({});
                  service.setModel(MyModel);
                  service.query().addCallbacks(function (ds) {
                     try {
                        assert.isTrue(ds.getAll().at(0) instanceof MyModel);
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should generate a valid request', function (done) {
                  var query = new Query();
                  query
                     .select(['fieldOne', 'fieldTwo'])
                     .from('Goods')
                     .where({
                        id: 5,
                        enabled: true,
                        title: 'abc*'
                     })
                     .orderBy({
                        id: true,
                        enabled: false
                     })
                     .offset(100)
                     .limit(33)
                     .meta({
                        'ПолеОдин': 4
                     });

                  service.query(query).addCallbacks(function () {
                        try {
                           var args = SbisBusinessLogic.lastRequest.args;

                           if (args['Фильтр'].d[0] !== 5) {
                              throw new Error('Wrong argument value Фильтр.id');
                           }
                           if (args['Фильтр'].s[0].n !== 'id') {
                              throw new Error('Wrong argument name Фильтр.id');
                           }
                           if (args['Фильтр'].s[0].t !== 'Число целое') {
                              throw new Error('Wrong argument type Фильтр.id');
                           }

                           if (args['Фильтр'].d[1] !== true) {
                              throw new Error('Wrong argument value Фильтр.enabled');
                           }
                           if (args['Фильтр'].s[1].n !== 'enabled') {
                              throw new Error('Wrong argument name Фильтр.enabled');
                           }
                           if (args['Фильтр'].s[1].t !== 'Логическое') {
                              throw new Error('Wrong argument type Фильтр.enabled');
                           }

                           if (args['Фильтр'].d[2] !== 'abc*') {
                              throw new Error('Wrong argument value Фильтр.title');
                           }
                           if (args['Фильтр'].s[2].n !== 'title') {
                              throw new Error('Wrong argument name Фильтр.title');
                           }
                           if (args['Фильтр'].s[2].t !== 'Строка') {
                              throw new Error('Wrong argument type Фильтр.title');
                           }

                           if (args['Сортировка'].d[0][0] !== 'id') {
                              throw new Error('Wrong argument value Сортировка.id.n');
                           }
                           if (args['Сортировка'].d[0][1] !== true) {
                              throw new Error('Wrong argument value Сортировка.id.o');
                           }
                           if (args['Сортировка'].d[0][2] !== false) {
                              throw new Error('Wrong argument value Сортировка.id.l');
                           }

                           if (args['Сортировка'].d[1][0] !== 'enabled') {
                              throw new Error('Wrong argument value Сортировка.enabled.n');
                           }
                           if (args['Сортировка'].d[1][1] !== false) {
                              throw new Error('Wrong argument value Сортировка.enabled.o');
                           }
                           if (args['Сортировка'].d[1][2] !== true) {
                              throw new Error('Wrong argument value Сортировка.enabled.l');
                           }

                           if (args['Сортировка'].s[0].n !== 'n') {
                              throw new Error('Wrong argument name Сортировка.n');
                           }
                           if (args['Сортировка'].s[1].n !== 'o') {
                              throw new Error('Wrong argument name Сортировка.o');
                           }
                           if (args['Сортировка'].s[2].n !== 'l') {
                              throw new Error('Wrong argument name Сортировка.l');
                           }

                           if (args['Навигация'].d[0] !== 3) {
                              throw new Error('Wrong argument value Навигация.Страница');
                           }
                           if (args['Навигация'].s[0].n !== 'Страница') {
                              throw new Error('Wrong argument name Навигация.Страница');
                           }

                           if (args['Навигация'].d[1] !== 33) {
                              throw new Error('Wrong argument value Навигация.РазмерСтраницы');
                           }
                           if (args['Навигация'].s[1].n !== 'РазмерСтраницы') {
                              throw new Error('Wrong argument name Навигация.РазмерСтраницы');
                           }

                           if (args['Навигация'].d[2] !== true) {
                              throw new Error('Wrong argument value Навигация.ЕстьЕще');
                           }
                           if (args['Навигация'].s[2].n !== 'ЕстьЕще') {
                              throw new Error('Wrong argument name Навигация.ЕстьЕще');
                           }

                           if (args['ДопПоля'].d[0] !== 4) {
                              throw new Error('Wrong argument value ДопПоля.ПолеОдин');
                           }
                           if (args['ДопПоля'].s[0].n !== 'ПолеОдин') {
                              throw new Error('Wrong argument name Навигация.ПолеОдин');
                           }
                           if (args['ДопПоля'].s[0].t !== 'Число целое') {
                              throw new Error('Wrong argument type Навигация.ПолеОдин');
                           }

                           done();
                        } catch (err) {
                           done(err);
                        }
                     }, function (err) {
                        done(err);
                     });
               });
            });

            context('when the service isn\'t exists', function () {
               it('should return an error', function (done) {
                  var service = new SbisService({
                     endpoint: 'Купец'
                  });
                  service.query(new Query()).addBoth(function (err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });

         describe('.call()', function () {
            context('when the method is exists', function () {
               it('should accept a model', function (done) {
                  var model = getSampleModel();

                  service.call('Произвольный', model).addCallbacks(function () {
                     try {
                        if (SbisBusinessLogic.lastRequest.method !== 'Произвольный') {
                           throw new Error('Method name "' + SbisBusinessLogic.lastRequest.method + '" expected to be "Произвольный"');
                        }

                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args, model);

                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });
               it('should accept a dataset', function (done) {
                  var dataSet = new DataSet({
                     adapter: new SbisAdapter(),
                     rawData: {
                        d: [
                           [1, true],
                           [2, false],
                           [5, true]
                        ],
                        s: [
                           {'n': '@Ид', 't': 'Идентификатор'},
                           {'n': 'Флаг', 't': 'Логическое'}
                        ]
                     }
                  });

                  service.call('Произвольный', dataSet).addCallbacks(function () {
                     try {
                        if (SbisBusinessLogic.lastRequest.method !== 'Произвольный') {
                           throw new Error('Method name "' + SbisBusinessLogic.lastRequest.method + '" expected to be "Произвольный"');
                        }

                        var args = SbisBusinessLogic.lastRequest.args;
                        testArgIsDataSet(args, dataSet);

                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });
            });

            context('when the method isn\'t exists', function () {
               it('should return an error', function (done) {
                  service.call('МойМетод').addBoth(function (err) {
                     if (err instanceof Error) {
                        done();
                     } else {
                        done(new Error('That\'s no Error'));
                     }
                  });
               });
            });
         });
      });
   }
);
