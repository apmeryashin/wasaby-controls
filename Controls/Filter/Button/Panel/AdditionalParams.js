define('Controls/Filter/Button/Panel/AdditionalParams', [
   'Core/Control',
   'WS.Data/Utils',
   'Core/helpers/Object/isEqual',
   'Core/core-clone',
   'tmpl!Controls/Filter/Button/Panel/AdditionalParams/AdditionalParams',
   'WS.Data/Chain',
   'css!Controls/Filter/Button/Panel/AdditionalParams/AdditionalParams'
], function(Control, Utils, isEqual, Clone, template, Chain) {

   'use strict';

   var MAX_NUMBER_ITEMS = 10;
   var getPropValue = Utils.getItemPropertyValue.bind(Utils);

   var _private = {

      cloneItems: function(items) {
         if (items['[WS.Data/Entity/CloneableMixin]']) {
            return items.clone();
         } else {
            return Clone(items);
         }
      },

      countItems: function(self, items) {
         var result = 0;
         Chain(items).each(function(elem) {
            if (!self._isItemVisible(elem)) {
               result++;
            }
         });
         return result;
      },

      onResize: function(self) {
         self._arrowVisible = _private.countItems(self, self._options.items) > MAX_NUMBER_ITEMS;
         
         if (!self._arrowVisible) {
            self._isMaxHeight = true;
         }
         self._forceUpdate();
      }
   };

   var AdditionalParams = Control.extend({
      _template: template,
      _isMaxHeight: true,
      _arrowVisible: false,

      _beforeMount: function(options) {
         this.items = _private.cloneItems(options.items);
      },

      _afterMount: function() {
         _private.onResize(this);
      },

      _afterUpdate: function() {
         if (!isEqual(this.items, this._options.items)) {
            this.items = _private.cloneItems(this._options.items);
            _private.onResize(this);
         }
      },

      _isItemVisible: function(item) {
         return Utils.getItemPropertyValue(item, 'visibility') === undefined ||
            Utils.getItemPropertyValue(item, 'visibility');
      },

      _clickItemHandler: function(event, index) {
         if (!this._options.items[index].source) {
            this._options.items[index].visibility = true;
            this._notify('valueChanged');
            _private.onResize(this);
         }
      },

      _valueChangedHandler: function(event, index, value) {
         this._options.items[index].value = value;
         this._options.items[index].visibility = true;
         this._notify('valueChanged');
         _private.onResize(this);
      },

      _clickSeparatorHandler: function() {
         this._isMaxHeight = !this._isMaxHeight;
      }

   });

   AdditionalParams._private = _private;

   return AdditionalParams;

});
