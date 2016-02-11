/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Projection.CollectionEnumerator', [
   'js!SBIS3.CONTROLS.Data.Collection.IEnumerator',
   'js!SBIS3.CONTROLS.Data.Projection.IEnumerator',
   'js!SBIS3.CONTROLS.Data.Collection.IndexedEnumeratorMixin'
], function (IEnumerator, IProjectionEnumerator, IndexedEnumeratorMixin) {
   'use strict';

   /**
    * Энумератор для проекции коллекции
    * @class SBIS3.CONTROLS.Data.Projection.CollectionEnumerator
    * @mixes SBIS3.CONTROLS.Data.Collection.IEnumerator
    * @mixes SBIS3.CONTROLS.Data.Projection.IEnumerator
    * @mixes SBIS3.CONTROLS.Data.Collection.IndexedEnumeratorMixin
    * @public
    * @author Мальцев Алексей
    */

   var CollectionEnumerator = $ws.core.extend({}, [IEnumerator, IProjectionEnumerator, IndexedEnumeratorMixin], /** @lends SBIS3.CONTROLS.Data.Projection.CollectionEnumerator.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Projection.CollectionEnumerator',
      $protected: {
         _options: {
            /**
             * @cfg {Array.<SBIS3.CONTROLS.Data.Projection.CollectionItem>} Индекс проекции коллекции
             */
            itemsMap: [],

            /**
             * @cfg {Array.<Boolean>} Результат применения фильтра
             */
            filterMap: [],

            /**
             * @cfg {Array.<Number>} Результат применения сортировки
             */
            sortMap: []
         },

         /**
          * @member {SBIS3.CONTROLS.Data.Projection.CollectionItem} Текущий элемент
          */
         _сurrent: undefined,

         /**
          * @member {Number} Текущая позиция (в исходной коллекции)
          */
         _currentPosition: -1,

         /**
          * @member {Array.<Number>} Соответствие позиций проекции и исходной коллекции
          */
         _internalMap: null
      },

      $constructor: function () {
         if (!(this._options.itemsMap instanceof Array)) {
            throw new Error('Items map should be instance of an Array');
         }
         if (!(this._options.filterMap instanceof Array)) {
            throw new Error('Filter map should be instance of an Array');
         }
         if (!(this._options.sortMap instanceof Array)) {
            throw new Error('Sort map should be instance of an Array');
         }
      },

      //region SBIS3.CONTROLS.Data.Collection.IEnumerator

      getNext: function () {
         this._initInternalMap();
         var internalPosition = this.getInternalBySource(this._currentPosition);
         internalPosition++;
         var newPosition = this._getSourceByInternal(internalPosition);

         if (newPosition === undefined || newPosition > this._options.itemsMap.length - 1) {
            return;
         }

         this._currentPosition = newPosition;
         this._setCurrentByPosition();
         return this._сurrent;
      },

      getCurrent: function () {
         this._initInternalMap();
         this._setCurrentByPosition();
         return this._сurrent;
      },

      reset: function () {
         this._currentPosition = -1;
         this._setCurrentByPosition();
      },

      //endregion SBIS3.CONTROLS.Data.Collection.IEnumerator

      //region SBIS3.CONTROLS.Data.Projection.IEnumerator

      at: function (index) {
         return index === undefined ?
            undefined :
            this._options.itemsMap[this._getSourceByInternal(index)];
      },

      setCurrent: function(item) {
         this._currentPosition = Array.indexOf(this._options.itemsMap, item);
         this._setCurrentByPosition();
      },

      getPosition: function() {
         this._initInternalMap();
         return this.getInternalBySource(this._currentPosition);
      },

      setPosition: function(internal) {
         var position = this._getSourceByInternal(internal);

         this._checkPosition(position);

         this._currentPosition = position;
         this._setCurrentByPosition();
      },

      getPrevious: function () {
         this._initInternalMap();
         var internalPosition = this.getInternalBySource(this._currentPosition);
         internalPosition--;
         var newPosition = this._getSourceByInternal(internalPosition);

         if (newPosition === undefined || newPosition < 0) {
            return undefined;
         }

         this._currentPosition = newPosition;
         this._setCurrentByPosition();
         return this._сurrent;
      },

      getInternalBySource: function (source) {
         if (source === undefined) {
            return source;
         }
         this._initInternalMap();
         return Array.indexOf(this._internalMap, source);
      },

      getSourceByInternal: function () {
         throw new Error('Method getSourceByInternal is no more available, sorry.');
      },

      //endregion SBIS3.CONTROLS.Data.Projection.IEnumerator

      //region SBIS3.CONTROLS.Data.Collection.IndexedEnumeratorMixin

      reIndex: function () {
         IndexedEnumeratorMixin.reIndex.call(this);
         this._internalMap = null;
      },

      _createIndex: function (property) {
         var savedPosition = this._currentPosition,
            result = CollectionEnumerator.superclass._createIndex.call(this, property);

         this._currentPosition = savedPosition;
         return result;
      },

      //endregion SBIS3.CONTROLS.Data.Collection.IndexedEnumeratorMixin

      //region Protected methods

      /**
       * Вычисляет позицию в исходной коллекции относительно позиции в проекции
       * @param {Number} internal Позиция в проекции
       * @returns {Number}
       * @protected
       */
      _getSourceByInternal: function (internal) {
         if (internal === undefined || internal === -1 || internal === null) {
            return internal;
         }
         this._initInternalMap();
         return this._internalMap[internal];
      },

      /**
       * Инициализирует массив соответствия позиций проекции и исходной коллекции
       * @protected
       */
      _initInternalMap: function () {
         if (this._internalMap === null) {
            this._currentPosition = -1;
            this._internalMap = this._buildInternalMap();
            this._setCurrentByPosition();
         }
      },

      /**
       * Строит массив соответствия позиций проекции и исходной коллекции
       * @return {Array}
       * @protected
       */
      _buildInternalMap: function () {
         var result = [],
            sortMap = this._options.sortMap.length ?
               this._options.sortMap :
               $ws.helpers.map(this._options.itemsMap, function(item, index){
                  return index;
               }),
            i;

         for (i = 0; i < sortMap.length; i++) {
            this._addToInternalMap(result, sortMap[i]);
         }

         return result;
      },

      /**
       * Добавляет соответствие позиций проекции и исходной коллекции с учетом фильтра
       * @protected
       */
      _addToInternalMap: function (map, sourceIndex) {
         if (this._options.filterMap[sourceIndex]) {
            map.push(sourceIndex);
            if (this._сurrent && this._сurrent === this._options.itemsMap[sourceIndex]) {
               this._currentPosition = sourceIndex;
            }
         }
      },

      /**
       * Запоминает текущий элемент исходя из текущей позиции
       * @protected
       */
      _setCurrentByPosition: function () {
         this._сurrent = this._options.itemsMap[this._currentPosition];
      },

      /**
       * Проверяет корректность позиции
       * @param {Number} position Позиция
       * @protected
       */
      _checkPosition: function (position) {
         if (!this._isValidPosition(position)) {
            throw new Error('Position is out of bounds');
         }
      },

      /**
       * Возвращает признак корректности позиции
       * @param {Number} position Позиция
       * @returns {Boolean}
       * @protected
       */
      _isValidPosition: function (position) {
         return position >= -1 && position < this._options.itemsMap.length;
      }

      //endregion Protected methods
   });

   return CollectionEnumerator;
});
