/**
 * Created by as.krasilnikov on 14.05.2018.
 */
define('Controls/Popup/Compatible/Layer',
   [
      'Core/Deferred',
      'Core/ParallelDeferred',
      'WS.Data/Source/SbisService',
      'WS.Data/Chain'
   ], function(Deferred, ParallelDeferred, SbisService, Chain) {
      'use strict';

      var
         loadDeferred,
         compatibleDeps = [
            'Lib/Control/Control.compatible',
            'Lib/Control/AreaAbstract/AreaAbstract.compatible',
            'Lib/Control/BaseCompatible/BaseCompatible',
            'Core/vdom/Synchronizer/resources/DirtyCheckingCompatible',
            'View/Runner/Text/markupGeneratorCompatible',
            'cdn!jquery-cookie/04-04-2014/jquery-cookie-min.js',
            'Core/nativeExtensions',

            // todo возможно надо грузить весь core-extensions
            'is!browser?WS.Data/ContextField/Flags',
            'is!browser?WS.Data/ContextField/Record',
            'is!browser?WS.Data/ContextField/Enum',
            'is!browser?WS.Data/ContextField/List'
         ];

      function isNewEnvironment() {
         return !!document.getElementsByTagName('html')[0].controlNodes;
      }

      return {
         load: function(deps) {
            if (!isNewEnvironment()) { //Для старого окружения не грузим слои совместимости
               return (new Deferred()).callback();
            }
            if (!loadDeferred) {
               loadDeferred = new Deferred();
               var
                  tmpDeferred = new ParallelDeferred(),
                  CompatibleDeferred = new Deferred();

               tmpDeferred.push(new SbisService({
                  endpoint: 'Пользователь'}).call('GetCurrentUserInfo', {})
               );
               tmpDeferred.push(CompatibleDeferred);

               requirejs(['Core/moduleStubs',
                  'Core/constants',
                  'Core/IoC',
                  'Core/ExtensionsManager',
                  'cdn!jquery/3.3.1/jquery-min.js'
               ], function(moduleStubs, Constants, IoC, ExtensionsManager) {
                  if (window && window.$) {
                     Constants.$win = $(window);
                     Constants.$doc = $(document);
                     Constants.$body = $('body');
                  }

                  deps = (deps || []).concat(compatibleDeps);

                  moduleStubs.require(deps).addCallback(function(result) {
                     // var tempCompatVal = constants.compat;
                     Constants.compat = true;
                     Constants.systemExtensions = true;

                     ExtensionsManager.loadExtensions().addCallbacks(function() {
                        CompatibleDeferred.callback(result);
                     }, function(e) {
                        IoC.resolve('ILogger').error('Layer', 'Can\'t load extensions', e);
                        CompatibleDeferred.callback(result);
                     });

                     // constants.compat = tempCompatVal; //TODO выпилить
                     (function($) {
                        $.fn.wsControl = function() {
                           var control = null,
                              element;
                           try {
                              element = this[0];
                              while (element) {
                                 if (element.wsControl) {
                                    control = element.wsControl;
                                    break;
                                 }
                                 element = element.parentNode;
                              }
                           } catch (e) {
                           }
                           return control;
                        };
                     })(jQuery);
                  });
               });
               tmpDeferred.done().getResult().addCallback(function(result) {
                  var
                     userInfo = result[0],
                     loadDeferredResult = result[1];
                  window && (window.userInfo = Chain(userInfo.getRow()).toObject());
                  loadDeferred.callback(loadDeferredResult);
               });
            }
            return loadDeferred;
         }
      };
   });

