import cExtend = require('Core/core-simpleExtend');
import sourceLib = require('Types/source');
import Env = require('Env/Env');
      var _private = {
         resolveField: function(optField) {
            return (optField instanceof Array) ? optField : [optField];
         },
         resolveDirection: function(loadDirection, optDirection) {
            var navDirection;

            if (loadDirection === 'down') {
               navDirection = 'after';
            } else if (loadDirection === 'up') {
               navDirection = 'before';
            } else {
               navDirection = optDirection;
            }
            return navDirection;
         },

         resolvePosition: function(item, optField) {
            var navField, navPosition, fieldValue;

            navField = _private.resolveField(optField);
            navPosition = [];
            for (var i = 0; i < navField.length; i++) {
               fieldValue = item.get(navField[i]);
               navPosition.push(fieldValue);
            }
            return navPosition;
         }
      };

      /**
       *
       * @author Крайнов Дмитрий
       * @public
       */
      var PositionNavigation = cExtend.extend({
         _more: null,
         _beforePosition: null,
         _afterPosition: null,

         //TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
         _positionByMeta: null,
         constructor: function(cfg) {
            this._options = cfg;
            PositionNavigation.superclass.constructor.apply(this, arguments);

            if (this._options.field === undefined) {
               throw new Error('Option field is undefined in PositionNavigation');
            }
            if (this._options.position === undefined) {
               throw new Error('Option position is undefined in PositionNavigation');
            }
            if (this._options.direction === undefined) {
               throw new Error('Option direction is undefined in PositionNavigation');
            }
            if (this._options.limit === undefined) {
               throw new Error('Option limit is undefined in PositionNavigation');
            }

            this._more = {
               before: false,
               after: false
            };
         },

         prepareQueryParams: function(loadDirection) {
            var navPosition, navDirection, additionalFilter, sign, navField;

            navDirection = _private.resolveDirection(loadDirection, this._options.direction);
            if (loadDirection === 'up') {
               navPosition = this._beforePosition;
            } else if (loadDirection === 'down') {
               navPosition = this._afterPosition;
            } else {
               if (this._options.position instanceof Array) {
                  navPosition = this._options.position;
               } else {
                  navPosition = [this._options.position];
               }
            }

            sign = '';
            navField = _private.resolveField(this._options.field);
            switch (navDirection) {
               case 'after': sign = '>='; break;
               case 'before': sign = '<='; break;
               case 'both': sign = '~'; break;
            }

            additionalFilter = {};
            for (var i = 0; i < navField.length; i++) {
               additionalFilter[navField[i] + sign] = navPosition[i];
            }

            return {
               filter: additionalFilter,
               limit: this._options.limit
            };
         },

         //TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
         setState: function(model) {
            if (!this._positionByMeta) {
               var beforePosition = model.getFirstItem();
               var afterPosition = model.getLastItem();
               if (afterPosition !== undefined) {
                  this._afterPosition = _private.resolvePosition(afterPosition, this._options.field);
               }
               if (beforePosition !== undefined) {
                  this._beforePosition = _private.resolvePosition(beforePosition, this._options.field);
               }
            }

         },

         calculateState: function(list, loadDirection) {
            var more, navDirection, edgeElem, metaNextPostion;
            this._savedMeta = list.getMetaData();
            more = this._savedMeta.more;
            metaNextPostion = this._savedMeta.nextPosition;
            if (typeof more === 'boolean') {
               if (loadDirection || this._options.direction !== 'both') {
                  navDirection = _private.resolveDirection(loadDirection, this._options.direction);
                  this._more[navDirection] = more;
               } else {
                  Env.IoC.resolve('ILogger').error('QueryParamsController/Position', 'Wrong type of \"more\" value. Must be object');
               }
            } else {
               if (more instanceof Object) {
                  if (!loadDirection &&  this._options.direction === 'both') {
                     this._more = more;
                  } else {
                     Env.IoC.resolve('ILogger').error('QueryParamsController/Position', 'Wrong type of \"more\" value. Must be boolean');
                  }
               }
            }

            //if we have "nextPosition" in meta we must set this position for next query
            //else we set this positions from records
            this._positionByMeta = null;
            if (metaNextPostion) {
               if (metaNextPostion instanceof Array) {
                  if (loadDirection || this._options.direction !== 'both') {
                     if (loadDirection === 'down' || this._options.direction === 'after') {
                        this._afterPosition = metaNextPostion;
                        this._positionByMeta = true;
                     } else if (loadDirection === 'up' || this._options.direction === 'before') {
                        this._beforePosition = metaNextPostion;
                        this._positionByMeta = true;
                     }
                  } else {
                     Env.IoC.resolve('ILogger').error('QueryParamsController/Position', 'Wrong type of \"nextPosition\" value. Must be object');
                  }
               } else {
                  if (!loadDirection && this._options.direction === 'both') {
                     if (metaNextPostion.before && metaNextPostion.before instanceof Array && metaNextPostion.after && metaNextPostion.after instanceof Array) {
                        this._beforePosition = metaNextPostion.before;
                        this._afterPosition = metaNextPostion.after;
                        this._positionByMeta = true;
                     } else {
                        Env.IoC.resolve('ILogger').error('QueryParamsController/Position', 'Wrong type of \"nextPosition\" value. Must be Object width `before` and `after` properties. Each properties must be Arrays');
                     }
                  } else {
                     Env.IoC.resolve('ILogger').error('QueryParamsController/Position', 'Wrong type of \"nextPosition\" value. Must be Array');
                  }
               }

            } else {
               if (list.getCount()) {
                  if (loadDirection !== 'down') {
                     edgeElem = list.at(0);
                     this._beforePosition = _private.resolvePosition(edgeElem, this._options.field);
                  }
                  if (loadDirection !== 'up') {
                     edgeElem = list.at(list.getCount() - 1);
                     this._afterPosition = _private.resolvePosition(edgeElem, this._options.field);
                  }
               }
            }
         },

         getLoadedDataCount: function() {

         },

         getAllDataCount: function() {

         },

         hasMoreData: function(loadDirection) {
            var navDirection;
            if (loadDirection === 'up') {
               navDirection = 'before';
            } else if (loadDirection === 'down') {
               navDirection = 'after';
            }
            return this._more[navDirection];
         },

         prepareSource: function(source) {
            var options = source.getOptions();
            options.navigationType = sourceLib.SbisService.NAVIGATION_TYPE.POSITION;
            source.setOptions(options);
         },

         setEdgeState: function(direction) {

         },

         destroy: function() {
            this._options = null;
            this._more = null;
            this._afterPosition = null;
            this._beforePosition = null;
            this._positionByMeta = null;
         }
      });

      export = PositionNavigation;
   


