define('js!SBIS3.CONTROLS.MultiSelectable', [], function() {

   /**
    * Миксин, добавляющий поведение хранения одного или нескольких выбранных элементов
    * @mixin SBIS3.CONTROLS.MultiSelectable
    * @public
    * @author Крайнов Дмитрий Олегович
    */

   var MultiSelectable = /**@lends SBIS3.CONTROLS.MultiSelectable.prototype  */{
       /**
        * @event onSelectedItemsChange При смене выбранных элементов коллекции
        * @param {$ws.proto.EventObject} Дескриптор события.
        * @param {Array.<String>} idArray Массив ключей выбранных элементов.
        * @example
        * <pre>
        *     var itemsChanged = function() {
        *        var count = this.getSelectedKeys().length;
        *        if (count < 1) {
        *           info.setText('Выберите хотя бы 1 вариант');
        *        } else {
        *           info.setText('');
        *        }
        *     }
        *     checkBoxGroup.subscribe('onSelectedItemsChange', itemsChanged);
        * </pre>
        * @see selectedKeys
        * @see setSelectedKeys
        * @see setSelectedItemsAll
        * @see addItemsSelection
        * @see removeItemsSelection
        * @see removeItemsSelectionAll
        * @see toggleItemsSelection
        * @see toggleItemsSelectionAll
        */
      $protected: {
         _options: {
            /**
             * @cfg {Boolean} Разрешить множественный выбор
             * @example
             * <pre>
             *     <option name="multiselect">false</option>
             * </pre>
             * @see selectedKeys
             */
            multiselect : true,
            /**
             * @cfg {String[]} Массив идентификаторов выбранных элементов
             * @example
             * <pre>
             *     <options name="selectedKeys" type="array">
             *        <option type="string">1</option>
             *        <option type="string">2</option>
             *     </options>
             * </pre>
             * @see multiselect
             * @see allowEmptySelection
             * @see setSelectedKeys
             * @see getSelectedKeys
             * @see addItemsSelection
             * @see removeItemsSelection
             * @see removeItemsSelectionAll
             * @see toggleItemsSelection
             * @see toggleItemsSelectionAll
             */
            selectedKeys : [],
             /**
              * @cfg {Boolean} Разрешить отсутствие выбранного элемента в группе
              * @example
              * <pre>
              *     <option name="allowEmptySelection">false</option>
              * </pre>
              * @see selectedKeys
              * @see removeItemsSelectionAll
              * @see removeItemsSelection
              * @see toggleItemsSelection
              * @see toggleItemsSelectionAll
              */
            allowEmptySelection : true
         },
         _selectedRecords: []
      },

      $constructor: function() {
         this._publish('onSelectedItemsChange');
         if (this._options.selectedKeys && this._options.selectedKeys.length) {
            if (Array.isArray(this._options.selectedKeys)) {
               if (!this._options.multiselect) {
                  this._options.selectedKeys = this._options.selectedKeys.slice(0, 1);
               }
            }
            else {
               throw new Error('Argument must be instance of Array');
            }
         }
         else {
            if (this._options.allowEmptySelection == false) {
               this._setFirstItemAsSelected();
            }
         }
      },

      after : {
         init: function () {
            this._drawSelectedItems(this._options.selectedKeys);
         }
      },
      /**
       * Устанавливает выбранные элементы по id.
       * @param {Array} idArray Массив идентификаторов выбранных элементов.
       * @example
       * <pre>
       *    if (!checkBoxGroup.getSelectedKeys().length) {
       *       checkBoxGroup.setSelectedKeys([1,3]);
       *    }
       * </pre>
       * @see getSelectedKeys
       * @see removeItemsSelection
       * @see addItemsSelection
       */
      setSelectedKeys : function(idArray) {
         if (Array.isArray(idArray)) {
            if (idArray.length) {
               if (this._options.multiselect) {
                  this._options.selectedKeys = idArray;
               }
               else {
                  this._options.selectedKeys = idArray.slice(0, 1);
               }
            }
            else {
               this._options.selectedKeys = [];
            }
	         this._afterSelectionHandler();
         }
         else {
            throw new Error('Argument must be instance of Array');
         }
      },

      /**
       * Устанавливает все элементы выбранными.
       * @example
       * <pre>
       *     if (checkBox.isChecked()) {
       *        checkBoxGroup.setSelectedItemsAll();
       *     }
       * </pre>
       * @see selectedKeys
       * @see removeItemsSelection
       * @see removeItemsSelectionAll
       * @see getSelectedKeys
       * @see addItemsSelection
       * @see multiselect
       */
      setSelectedItemsAll : function() {
         if (this._dataSet) {
            var items = [];
            this._dataSet.each(function(rec){
               items.push(rec.getKey())
            });
            this.setSelectedKeys(items);
         }

      },

      /**
       * Получает индентификаторы выбранных элементов.
       * @example
       * <pre>
       *    if (!checkBoxGroup.getSelectedKeys().length) {
       *       checkBoxGroup.setSelectedKeys([1,3]);
       *    }
       * </pre>
       * @see selectedKeys
       * @see setSelectedKeys
       * @see addItemsSelection
       * @see multiselect
       */
      getSelectedKeys : function() {
         return this._options.selectedKeys;
      },

      /**
       * Добавить указанные элементы в набор выбранных.
       * @param {Array} idArray Массив идентификаторов добавляемых к выбранным элементов.
       * @example
       * <pre>
       *    var keys = checkBoxGroup.getSelectedKeys();
       *    if (keys.indexOf(1)) {
       *       checkBoxGroup.addItemsSelection([2]);
       *    }
       * </pre>
       * @see setSelectedKeys
       * @see getSelectedKeys
       * @see setSelectedItemsAll
       * @see removeItemsSelection
       * @see removeItemsSelectionAll
       * @see multiselect
       */
      addItemsSelection : function(idArray) {
         if (Array.isArray(idArray)) {
            if (idArray.length) {
               if (this._options.multiselect) {
                  for (var i = 0; i < idArray.length; i++) {
                     if (this._isItemSelected(idArray[i]) < 0) {
                        this._options.selectedKeys.push(idArray[i]);
                     }
                  }
               }
               else {
                  this._options.selectedKeys = idArray.slice(0, 1);
               }
            }
	         this._afterSelectionHandler();
         }
         else {
            throw new Error('Argument must be instance of Array');
         }

      },

      /**
       * Удаляет указанные элементы из набора выбранных.
       * @param {Array} idArray Массив идентификаторов элементов к удалению из выбранных.
       * @example
       * <pre>
       *     if (checkBox.isChecked()) {
       *        checkBoxGroup.removeItemsSelection([2]);
       *     }
       * </pre>
       * @see removeItemsSelectionAll
       * @see getSelectedKeys
       * @see allowEmptySelection
       */
      removeItemsSelection : function(idArray) {
         if (Array.isArray(idArray)) {
            for (var i = idArray.length - 1; i >= 0; i--) {
               var index = this._isItemSelected(idArray[i]);
               if (index >= 0) {
                  Array.remove(this._options.selectedKeys, index);
               }
            }
	         this._afterSelectionHandler();
         }
         else {
            throw new Error('Argument must be instance of Array');
         }
      },

      /**
       * Убрать все элементы из набора выбранных.
       * @example
       * <pre>
       *     if (checkBoxGroup.getSelectedKeys().indexOf(3))  {
       *        checkBoxGroup.removeItemsSelectionAll();
       *        checkBoxGroup.setSelectedKeys([3]);
       *     }
       * </pre>
       * @see removeItemsSelection
       * @see getSelectedKeys
       * @see toggleItemsSelectionAll
       * @see allowEmptySelection
       */
      removeItemsSelectionAll : function() {
         this.setSelectedKeys([]);
      },

      /**
       * Меняет состояние выбранности указанных элементов на противоположное.
       * @param {Array} idArray Массив идентификаторов элементов для инвертирования отметки.
       * @example
       * <pre>
       *     if (needToggle) {
       *        checkBoxGroup.toggleItemsSelection([2,3]);
       *     }
       * </pre>
       * @see getSelectedKeys
       * @see setSelectedKeys
       * @see toggleItemsSelectionAll
       * @see multiselect
       */
      toggleItemsSelection : function(idArray) {
         if (Array.isArray(idArray)) {
            if (idArray.length) {
               if (this._options.multiselect) {
                  for (var i = 0; i < idArray.length; i++) {
                     if (this._isItemSelected(idArray[i]) < 0) {
                        this.addItemsSelection([idArray[i]]);
                     }
                     else {
                        this.removeItemsSelection([idArray[i]]);
                     }
                  }
               }
               else {
                  if (this._isItemSelected(idArray[0]) > 0) {
                     this._options.selectedKeys = [];
                  }
                  else {
                     this._options.selectedKeys = idArray.slice(0, 1);
                  }
	               this._afterSelectionHandler();
               }
            }
         }
         else {
            throw new Error('Argument must be instance of Array');
         }
      },

      /**
       * Меняет состояние выбранности всех элементов на противоположное.
       * @example
       * <pre>
       *     if (checkBoxGroup.getSelectedKeys().count == 0) {
       *        checkBoxGroup.toggleItemsSelectionAll();
       *     }
       * </pre>
       * @see removeItemsSelectionAll
       * @see toggleItemsSelection
       * @see multiselect
       * @see allowEmptySelection
       */
      toggleItemsSelectionAll : function() {
         if (this._dataSet) {
            var items = [];
            this._dataSet.each(function(rec){
               items.push(rec.getKey())
            });
            this.toggleItemsSelection(items);
         }
      },

      _isItemSelected : function(id) {
         //TODO пока нет определенности ключ - строка или число - надо избавиться
         var index = this._options.selectedKeys.indexOf(id);
         if (index < 0) {
            index = this._options.selectedKeys.indexOf(id + '')
         }
         return index;
      },

      _drawSelectedItems : function() {
         /*Method must be implemented*/
      },

	   _afterSelectionHandler: function() {
		   if (this._checkEmptySelection()) {
			   this._setFirstItemAsSelected();
		   }
		   this._notifySelectedItems(this._options.selectedKeys);
		   this._drawSelectedItems(this._options.selectedKeys);
	   },

      _notifySelectedItems : function(idArray) {
         this._setSelectedRecords();
         this._notify('onSelectedItemsChange', idArray);
         this._notifyOnPropertyChanged('selectedKeys');
      },

      _dataLoadedCallback : function(){
         if (this._checkEmptySelection()) {
            this._setFirstItemAsSelected();
         }
      },

      _setFirstItemAsSelected : function() {
         if (this._dataSet) {
            var firstKey = this._dataSet.at(0).getKey();
            this._options.selectedKeys = [firstKey];
         }
      },

      _checkEmptySelection: function() {
         return !this._options.selectedKeys.length && this._options.allowEmptySelection == false;
      },

      _setSelectedRecords: function() {
         if (this._dataSet) {
            var
               self = this,
               record;
            this._selectedRecords = [];
            $.each(this._options.selectedKeys, function (id, key) {
               record = self._dataSet.getRecordByKey(key);
               if (record) {
                  self._selectedRecords.push(record);
               }
            });
         }
      }
   };

   return MultiSelectable;

});