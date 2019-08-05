import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/Panel/PropertyGrid/PropertyGrid');
import Utils = require('Types/util');
import {isEqual} from 'Types/object';
import Clone = require('Core/core-clone');
import chain = require('Types/chain');
import 'css!theme?Controls/filterPopup';

   /**
    * Control PropertyGrid
    * Provides a user interface for browsing and editing the properties of an object.
    *
    * @class Controls/_filterPopup/Panel/PropertyGrid
    * @extends Core/Control
    * @mixes Controls/interface/IPropertyGrid
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IItemTemplate
    * @control
    * @private
    * @author Золотова Э.Е.
    *
    * @css @height_PropertyGrid-item Height of item in the block.
    * @css @spacing_PropertyGrid-between-items Spacing between items.
    */


   const observableItemProps = ['value', 'textValue', 'visibility'];

   var _private = {
      cloneItems: function(items) {
         if (items['[Types/_entity/CloneableMixin]']) {
            return items.clone();
         }
         return Utils.object.clone(items);
      },

      getIndexChangedVisibility: function(newItems, oldItems) {
         var result = -1;
         chain.factory(newItems).each(function(newItem, index) {
            // The items could change the order or quantity, so we find the same element by id
            var id = Utils.object.getPropertyValue(newItem, 'id'),
               visibility = Utils.object.getPropertyValue(newItem, 'visibility');

            if (visibility) {
               chain.factory(oldItems).each(function(oldItem) {
                  if (id === Utils.object.getPropertyValue(oldItem, 'id') &&
                     visibility !== Utils.object.getPropertyValue(oldItem, 'visibility')) {
                     result = index;
                  }
               });
            }
         });
         return result;
      },

      //Necessary for correct work of updating control, after update object in array.
      //Binding on object property in array does not update control, if this property is not versioned.
      observeProp: function(self, propName, obj) {
         var value = obj[propName];

         Object.defineProperty(obj, propName, {
            set(newValue) {
               value = newValue;
               self._notify('itemsChanged', [self._items]);
            },

            get() {
               return value;
            }
         });
      },

      observeItems: function(self, items) {
         chain.factory(items).each(function(item) {
            observableItemProps.forEach(function (propName) {
               _private.observeProp(self, propName, item);
            });
         });
      }
   };

   var PropertyGrid = Control.extend({
      _template: template,

      _beforeMount: function(options) {
         this._items = _private.cloneItems(options.items);
      },

      _afterMount: function() {
         _private.observeItems(this, this._items);
      },

      _beforeUpdate: function(newOptions) {
         if (!isEqual(newOptions.items, this._items)) {
            this._changedIndex = _private.getIndexChangedVisibility(newOptions.items, this._items);
            this._items = _private.cloneItems(newOptions.items);
            _private.observeItems(this, this._items);
         } else {
            this._changedIndex = -1;
         }
      },

      _afterUpdate: function() {
         if (this._changedIndex !== -1) {
            this.activate();
         }
      },

      _isItemVisible: function(item) {
         return Utils.object.getPropertyValue(item, 'visibility') === undefined ||
            Utils.object.getPropertyValue(item, 'visibility');
      },

      _valueChangedHandler: function(event, index, value) {
         this._items[index].value = value;
         this._notify('itemsChanged', [this._items]);
      },

      _rangeChangedHandler: function(event, index, start, end) {
         this._items[index].value = [start, end];
         this._notify('itemsChanged', [this._items]);
      },

      _textValueChangedHandler: function(event, index, textValue) {
         this._items[index].textValue = textValue;
         this._notify('itemsChanged', [this._items]);
      },

      _visibilityChangedHandler: function(event, index, visibility) {
         if (!visibility) {
            this._items[index].value = this._items[index].resetValue;
         }
         this._items[index].visibility = visibility;
         this._notify('itemsChanged', [this._items]);
      }
   });

   PropertyGrid._private = _private;

   export = PropertyGrid;


