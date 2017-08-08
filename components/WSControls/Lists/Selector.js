define('js!WSControls/Lists/Selector', [
   'js!WSControls/Lists/ItemsControl',
   'js!WSControls/Lists/resources/utils/ItemsUtil'
], function(ItemsControl, ItemsUtil) {
   var Selector;
   Selector = ItemsControl.extend({
      _controlName: 'WSControls/Lists/Selector',
      constructor: function (cfg) {
         Selector.superclass.constructor.apply(this, arguments);
         this._publish('onSelectedItemChange');
      },

      _applyAllowEmpty: function (cfg) {
         if ((cfg.allowEmptySelection === false) && this._isEmptyIndex(this._selectedIndex)) {
            if (this._display.getCount()) {
               this._selectedIndex = 0;
               this._selectedKey = this._getKeyByIndex(0, cfg);
            }
         }
      },

      _isItemSelected: function(projItem) {
         return this._selectedKey == this._getPropertyValue(projItem.getContents(), this._options.idProperty);
      },

      _prepareSelectedIndexByKey: function (key) {
         //Вычисляем индекс по известному ключу
         this._selectedIndex = this._getItemIndexByKey(key);
         this._applyAllowEmpty();
      },

      _prepareSelectedKeyByIndex: function () {
         //Вычисляем ключ по известному индексу
         this._selectedKey = this._getKeyByIndex(this._selectedIndex);
         this._applyAllowEmpty();
      },

      _onItemClick: function(e, displayItem) {
         this._setSelectedByHash(displayItem.getHash());
         this._onSelectedItemChange();
      },

      _getKeyByIndex: function (index, cfg) {
         if (this._hasItemByIndex(index)) {
            var itemContents = this._display.at(index).getContents();
            return ItemsUtil.getPropertyValue(itemContents, cfg.idProperty);
         }
         else {
            return null
         }
      },

      _getItemIndexByKey: function (id, cfg) {
         var projItem = ItemsUtil.getItemById(this._display, id, cfg.idProperty);
         return this._display.getIndex(projItem);
      },

      _hasItemByIndex: function (index) {
         return (typeof index != 'undefined') && (index !== null) && (typeof this._display.at(index) != 'undefined');
      },

      _setSelectedByHash: function (hash) {
         var elem = this._display.getByHash(hash);
         this._selectedIndex = this._display.getIndex(elem);
         this._selectedKey = this._getItemIndexByKey(this._selectedIndex, this._options);
      },

      _isEmptyIndex: function (index) {
         return index === null || typeof index == 'undefined' || index == -1;
      },

      _notifySelectedItem: function (index, key) {
         this._notify('onSelectedItemChange', index, key);
      },

      _onSelectedItemChange: function() {
         this._setDirty();
      },

      _displayChangeCallback: function(display, cfg) {
         if ((cfg.selectedIndex !== this._options.selectedIndex) && !this._isEmptyIndex(cfg.selectedIndex)) { //Новые опции пришли из родителя
            this._selectedIndex = cfg.selectedIndex;
            this._selectedKey = this._getKeyByIndex(this._selectedIndex, cfg);
         }
         else {
            if ((cfg.selectedKey !== this._options.selectedKey) && (cfg.selectedKey !== undefined)) { //Новые опции пришли из родителя
               this._selectedKey = cfg.selectedKey;
               this._selectedIndex = this._getItemIndexByKey(this._selectedKey, cfg);
               this._applyAllowEmpty(cfg);
            }
            else {
               this._selectedIndex = -1;
               this._selectedKey = undefined;
               this._applyAllowEmpty(cfg);
            }
         }


         Selector.superclass._displayChangeCallback.apply(this, arguments);
      }
   });

   return Selector;
});