/* global define, describe, context, it, assert, $ws */
/* Mocking SbisServiceBLO */
define('js!SBIS3.CONTROLS.Data.Source.SbisService/resources/SbisServiceBLO', [], function () {
      'use strict';

      var existsId = 7,
         notExistsId = 99;

      var SbisServiceBLO = $ws.core.extend({}, {
         _cfg: '',
         $constructor: function (cfg) {
            this._cfg = cfg;
         },
         callMethod: function (method, args) {
            var def = new $ws.proto.Deferred(),
               meta = [
                  {'n': 'Ид', 't': 'Число целое'},
                  {'n': 'Фамилия', 't': 'Строка'},
                  {'n': 'Имя', 't': 'Строка'},
                  {'n': 'Отчество', 't': 'Строка'},
                  {'n': 'Должность', 't': 'Строка'},
                  {'n': 'В штате', 't': 'Логическое'}
               ],
               error = '',
               data;

            switch (this._cfg.name) {
               case 'Товар':
                  switch (method) {
                     case 'Создать':
                        data = {
                           d: [
                              0,
                              '',
                              '',
                              '',
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
                                 existsId,
                                 'Иванов',
                                 'Иван',
                                 'Иванович',
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
                        if (args['Запись'].d && args['Запись'].d[0]) {
                           data = args['Запись'].d[0];
                        } else {
                           data = 99;
                        }
                        break;

                     case 'Удалить':
                        if (args['ИдО'] === existsId) {
                           data = existsId;
                        } else {
                           error = 'Model is not found';
                        }
                        break;

                     case 'Список':
                        data = {
                           d: [
                              [
                                 existsId,
                                 'Иванов',
                                 'Иван',
                                 'Иванович',
                                 'Инженер',
                                 true
                              ],
                              [
                                 1 + existsId,
                                 'Петров',
                                 'Петр',
                                 'Петрович',
                                 'Специалист',
                                 true
                              ]
                           ],
                           s: meta
                        };
                        break;

                     case 'Вставить':
                        data = args;
                        break;

                     default:
                        throw new Error('Method is undefined');
                  }
                  break;

               case 'ПорядковыйНомер':
                  switch (method) {
                     case 'Вставить':
                        data = args;
                        break;
                  }
                  break;

               default:
                  error = 'Service is not found';
            }

            setTimeout(function () {
               if (error) {
                  return def.errback(error);
               }

               def.callback(data);
            }.bind(this), 1);

            return def;
         }
      });

      SbisServiceBLO.existsId = existsId;
      SbisServiceBLO.notExistsId = notExistsId;

      return SbisServiceBLO;
   }
);

define([
      'js!SBIS3.CONTROLS.Data.Source.SbisService',
      'js!SBIS3.CONTROLS.Data.Source.SbisService/resources/SbisServiceBLO',
      'js!SBIS3.CONTROLS.Data.Source.DataSet',
      'js!SBIS3.CONTROLS.Data.Model',
      'js!SBIS3.CONTROLS.Data.Adapter.Sbis',
      'js!SBIS3.CONTROLS.Data.Query.Query'
   ], function (SbisService, SbisServiceBLO, DataSet, Model, SbisAdapter, Query) {
      'use strict';

      describe('SBIS3.CONTROLS.Data.Source.SbisService', function () {
         describe('.create()', function () {
            context('when the service is exists', function () {
               it('should return an empty model', function (done) {
                  var service = new SbisService({
                     resource: 'Товар'
                  });
                  service.create().addCallbacks(function (model) {
                     try {
                        if (!(model instanceof Model)) {
                           throw new Error('That\'s no Model');
                        }
                        if (model.isStored()) {
                           throw new Error('The model should be not stored');
                        }
                        if (model.getId()) {
                           throw new Error('The model has not empty id');
                        }
                        if (model.get('Фамилия') !== '') {
                           throw new Error('The model contains wrong data');
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
                     resource: 'Купец'
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
                     var service = new SbisService({
                        resource: 'Товар'
                     });
                     service.read(SbisServiceBLO.existsId).addCallbacks(function (model) {
                        try {
                           if (!(model instanceof Model)) {
                              throw new Error('That\'s no Model');
                           }
                           if (!model.isStored()) {
                              throw new Error('The model should be stored');
                           }
                           if (!model.getId()) {
                              throw new Error('The model has empty id');
                           }
                           if (model.getId() !== SbisServiceBLO.existsId) {
                              throw new Error('The model has wrong id');
                           }
                           if (model.get('Фамилия') !== 'Иванов') {
                              throw new Error('The model contains wrong data');
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

               context('and the model isn\'t exists', function () {
                  it('should return an error', function (done) {
                     var service = new SbisService({
                        resource: 'Товар'
                     });
                     service.read(SbisServiceBLO.notExistsId).addBoth(function (err) {
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
                     resource: 'Купец'
                  });
                  service.read(SbisServiceBLO.existsId).addBoth(function (err) {
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
                     var service = new SbisService({
                        resource: 'Товар'
                     });

                     service.read(SbisServiceBLO.existsId).addCallbacks(function (model) {
                        model.set('Фамилия', 'Петров');
                        service.update(model).addCallbacks(function (success) {
                           try {
                              if (!success) {
                                 throw new Error('Unsuccessful update');
                              }
                              if (!model.isChanged()) {
                                 throw new Error('The model should stay changed');
                              }
                              if (model.get('Фамилия') !== 'Петров') {
                                 throw new Error('The model contains wrong data');
                              }
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
                     if (!success) {
                        throw new Error('Unsuccessful update');
                     }
                     if (!model.isStored()) {
                        throw new Error('The model should become stored');
                     }
                     if (!model.isChanged()) {
                        throw new Error('The model should stay changed');
                     }
                     if (!model.getId()) {
                        throw new Error('The model should become having a id');
                     }
                     done();
                  } catch (err) {
                     done(err);
                  }
               };

               context('and the model was not stored', function () {
                  it('should create the model by 1st way', function (done) {
                     var service = new SbisService({
                        resource: 'Товар'
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
                           resource: 'Товар'
                        }),
                        model = new Model({
                           adapter: new SbisAdapter(),
                           data: {
                              d: [
                                 0,
                                 ''
                              ],
                              s: [
                                 {'n': 'Ид', 't': 'Число целое'},
                                 {'n': 'Фамилия', 't': 'Строка'}
                              ]
                           },
                           idProperty: 'Ид'
                        });

                     service.update(model).addCallbacks(function (success) {
                        testModel(success, model, done);
                     }, function (err) {
                        done(err);
                     });
                  });
               });
            });

            context('when the service isn\'t exists', function () {
               it('should return an error', function (done) {
                  new SbisService({
                     resource: 'Товар'
                  }).create().addCallbacks(function (model) {
                        var service = new SbisService({
                           resource: 'Купец'
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
                     var service = new SbisService({
                        resource: 'Товар'
                     });
                     service.destroy(SbisServiceBLO.existsId).addCallbacks(function (success) {
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
                     var service = new SbisService({
                        resource: 'Товар'
                     });
                     service.destroy(SbisServiceBLO.notExistsId).addBoth(function (err) {
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
                     resource: 'Купец'
                  });
                  service.destroy(SbisServiceBLO.existsId).addBoth(function (err) {
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
                  var service = new SbisService({
                     resource: 'Товар'
                  });
                  service.query(new Query()).addCallbacks(function (ds) {
                     try {
                        if (!(ds instanceof DataSet)) {
                           throw new Error('That\'s no dataset');
                        }
                        if (ds.getAll().getCount() !== 2) {
                           throw new Error('Wrong models count');
                        }
                        done();
                     } catch (err) {
                        done(err);
                     }
                  }, function (err) {
                     done(err);
                  });
               });

               it('should work with no query', function (done) {
                  var service = new SbisService({
                     resource: 'Товар'
                  });
                  service.query().addCallbacks(function (ds) {
                     try {
                        if (!(ds instanceof DataSet)) {
                           throw new Error('That\'s no dataset');
                        }
                        if (ds.getAll().getCount() !== 2) {
                           throw new Error('Wrong models count');
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
                     resource: 'Купец'
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

         describe('.move()', function () {
            it('should move ' + SbisServiceBLO.existsId + ' before ' + 56, function (done) {
               var service = new SbisService({
                  resource: 'Товар'
               });
               service.read(SbisServiceBLO.existsId).addCallback(function (model) {
                  service.move(model, 56).addCallbacks(function(data) {
                     if (data['ИдО'] === SbisServiceBLO.existsId &&
                        data['ИдОДо'] === 56 &&
                        data['ПорядковыйНомер'] === 'ПорНомер'
                     ) {
                        done();
                     } else {
                        done(new Error('Unexpected value'));
                     }
                  }, function(err){
                     done(err);
                  });
               });
            });

            it('should move ' + SbisServiceBLO.existsId + ' before ' + 0, function (done) {
               var service = new SbisService({
                  resource: 'Товар'
               });
               service.read(SbisServiceBLO.existsId).addCallback(function (model) {
                  service.move(model, 0).addCallbacks(function(data) {
                     if (data['ИдО'] === SbisServiceBLO.existsId &&
                        data['ИдОДо'] === 0 &&
                        data['ПорядковыйНомер'] === 'ПорНомер'
                     ) {
                        done();
                     } else {
                        done(new Error('Unexpected value'));
                     }
                  }, function(err){
                     done(err);
                  });
               });
            });

            it('should move ' + SbisServiceBLO.existsId + ' after ' + 77, function (done) {
               var service = new SbisService({
                  resource: 'Товар'
               });
               service.read(SbisServiceBLO.existsId).addCallback(function (model) {
                  service.move(model, 77, {after: true}).addCallbacks(function(data) {
                     if (data['ИдО'] === SbisServiceBLO.existsId &&
                        data['ИдОПосле'] === 77 &&
                        data['ПорядковыйНомер'] === 'ПорНомер'
                     ) {
                        done();
                     } else {
                        done(new Error('Unexpected value'));
                     }
                  }, function(err){
                     done(err);
                  });
               });
            });

            it('should move ' + SbisServiceBLO.existsId + ' after ' + 0, function (done) {
               var service = new SbisService({
                  resource: 'Товар'
               });
               service.read(SbisServiceBLO.existsId).addCallback(function (model) {
                  service.move(model, 0, {after: true}).addCallbacks(function(data) {
                     if (data['ИдО'] === SbisServiceBLO.existsId &&
                        data['ИдОПосле'] === 0 &&
                        data['ПорядковыйНомер'] === 'ПорНомер'
                     ) {
                        done();
                     } else {
                        done(new Error('Unexpected value'));
                     }
                  }, function(err){
                     done(err);
                  });
               });
            });

            it('should move by given column', function (done) {
               var service = new SbisService({
                  resource: 'Товар'
               });
               service.read(SbisServiceBLO.existsId).addCallback(function (model) {
                  service.move(model, 56, {column: 'Название'}).addCallbacks(function(data) {
                     if (data['ПорядковыйНомер'] === 'Название') {
                        done();
                     } else {
                        done(new Error('Unexpected value'));
                     }
                  }, function(err){
                     done(err);
                  });
               });
            });
         });
      });
   }
);
