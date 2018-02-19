define('Controls/Search/Search',
   [
      'Core/core-extend',
      'Core/Deferred',
      'Controls/Controllers/SourceController'
   ],
   function (extend, Deferred, SourceController) {
      
      'use strict';
   
      var _private = {

         checkRequiredOptions: function(options) {
            if (!options.dataSource) {
               throw new Error('dataSource is required for search');
            }
         },
   
         initSourceController: function(self, options) {
            self._sourceController = new SourceController({
               source: options.dataSource,
               navigation: options.navigation
            });
         },
         
         resolveOptions: function(self, options) {
            self._searchDelay = options.searchDelay;
         },
         
         callSearchQuery: function(self, filter) {
            return self._sourceController.load(filter);
         },
         
         searchCallback: function(self, result) {
            self._searchDeferred.callback({
               result: result,
               hasMore: self._sourceController.hasMoreData('down')
            });
         },
         
         searchErrback: function(self, error) {
            self._searchDeferred.errback(error);
         }
      };
   
      /**
       * @author Герасимов Александр
       * @class WSControls/Lists/Controllers/Search
       * @extends Core/Abstract
       * @public
       */
   
      /**
       * @name WSControls/Lists/Controllers/Search#searchDelay
       * @cfg {Number} The delay in milliseconds between when a keystroke occurs and when a search is performed.
       * A zero-delay makes sense for local data.
       */
      
      /**
       * @name WSControls/Lists/Controllers/Search#dataSource
       * @cfg {WS.Data/Source/ISource} dataSource
       */
      var Search  = extend({
   
         _searchDeferred: null,
         _searchDelay: null,
         
         constructor: function(options) {
            Search.superclass.constructor.apply(this, arguments);
            
            _private.resolveOptions(this, options);
            _private.checkRequiredOptions(options);
            _private.initSourceController(this, options);
         },
         
         /**
          * @cfg {Object} filter
          * @returns {Core/Deferred}
          */
         search: function (filter) {
            var self = this;
            
            //aborting current query
            this.abort();
            this._searchDeferred = new Deferred();
   
            this._searchDelayTimer = setTimeout(function() {
               _private.callSearchQuery(self, filter)
                  .addCallback(function(result) {
                     _private.searchCallback(self, result);
                     return result;
                  })
                  .addErrback(function(err) {
                     _private.searchErrback(self, err);
                     return err;
                  })
                  .addBoth(function(result) {
                     self._searchDeferred = null;
                     return result;
                  });
            }, this._searchDelay);
            
      
            return this._searchDeferred;
         },
   
         /**
          * Aborting search
          * @public
          */
         abort: function () {
            if (this._searchDelayTimer) {
               clearTimeout(this._searchDelayTimer);
               this._searchDelayTimer = null;
            }
            this._sourceController.cancelLoading();
         }
         
      });
   
      Search._private = _private;
      return Search;
   });
