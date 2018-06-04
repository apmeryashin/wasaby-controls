/**
 * Created by am.gerasimov on 21.02.2018.
 */
define('Controls/Filter/Button',
   [
      'Core/Control',
      'tmpl!Controls/Filter/Button/Button',
      'Core/moduleStubs',
      'WS.Data/Chain',
      'WS.Data/Utils',
      'Controls/Container/Filter/FilterContextField',
      'WS.Data/Type/descriptor',
      'css!Controls/Filter/Button/Button'
   ],

   function(Control, template, moduleStubs, Chain, Utils, FilterContextField, types) {

      /**
       * @class Controls/Filter/Button
       * @extends Core/Control
       * @mixin Controls/Filter/Button/interface/IFilterPanel
       * @control
       * @public
       */

      'use strict';

      var _private = {
         getFilterButtonCompatible: function(self) {
            return moduleStubs.require('Controls/Filter/Button/_FilterCompatible').addCallback(function(_FilterCompatible) {
               if (!self._filterCompatible) {
                  self._filterCompatible = new _FilterCompatible[0]({
                     filterButton: self,
                     filterButtonOptions: self._options
                  });
               }
               return self._filterCompatible;
            });
         },

         getText: function(items) {
            var textArr = [];

            Chain(items).each(function(item) {
               var textValue = Utils.getItemPropertyValue(item, 'textValue');

               if (textValue) {
                  textArr.push(textValue);
               }
            });

            return textArr.join(', ');
         },

         resolveItems: function(self, items) {
            self._items = items;
            self._text = _private.getText(items);
         }
      };

      var FilterButton = Control.extend({

         _template: template,
         _oldPanelOpener: null,
         _text: '',
         _historyId: null,

         constructor: function(config) {
            FilterButton.superclass.constructor.apply(this, arguments);
            this._onFilterChanged = this._onFilterChanged.bind(this);
         },

         _beforeUpdate: function(options) {
            if (this._options.items !== options.items) {
               _private.resolveItems(this, options.items);
            }
         },

         _beforeMount: function(options) {
            if (options.items) {
               _private.resolveItems(this, options.items);
            }
         },

         _getFilterState: function() {
            return this._options.readOnly ? 'disabled' : 'default';
         },

         _clearClick: function() {
            _private.getFilterButtonCompatible(this).addCallback(function(panelOpener) {
               panelOpener.clearFilter();
            });
         },

         _openFilterPanel: function() {
            if (!this._options.readOnly) {
               var templatePanel = this._options.filterTemplate || 'Controls/Filter/Button/Panel';
               this._children.filterStickyOpener.open({
                  isCompoundTemplate: this._options.filterTemplate,
                  templateOptions: {
                     items: this._options.items,
                     itemTemplate: this._options.itemTemplate,
                     itemTemplateProperty: this._options.itemTemplateProperty,
                     additionalTemplate: this._options.additionalTemplate,
                     additionalTemplateProperty: this._options.additionalTemplateProperty,
                     historyId: this._options.historyId
                  },
                  template: templatePanel,
                  target: this._children.panelTarget
               });
            }
         },

         _onFilterChanged: function(data) {
            this._notify('filterChanged', [data.filter]);
            this._notify('itemsChanged', [data.items]);
         }
      });

      FilterButton.getDefaultOptions = function() {
         return {
            filterAlign: 'right'
         };
      };

      FilterButton.getOptionsTypes = function() {
         return {
            itemTemplate: types(Object),
            itemTemplateProperty: types(String),
            additionalTemplate: types(Object),
            additionalTemplateProperty: types(String)
         };
      };

      return FilterButton;
   });
