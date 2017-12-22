define('js!Controls/Input/Suggest',
   [
      'Core/Control',
      'tmpl!Controls/Input/Suggest/Suggest',
      'js!WS.Data/Type/descriptor',
      'js!Controls/Input/resources/SuggestController',
      'js!Controls/Popup/Opener/Sticky'
   ],
   function(Control, template, types, SuggestController) {
   
      /**
       * Поле ввода с автодополнением
       * @class Controls/Input/Suggest
       * @extends Controls/Input/Text
       * @mixes Controls/Input/interface/ISearch
       * @mixes Controls/interface/IDataSource
       * @mixes Controls/interface/IFilter
       * @mixes Controls/Input/interface/ISuggest
       * @control
       * @public
       * @category Input
       */
   
      'use strict';
      
      var Suggest = Control.extend({
   
         _template: template,
         _controlName: 'Controls/Input/Suggest',
   
         // <editor-fold desc="LifeCycle">
   
         _afterMount: function() {
            this._suggestController = new SuggestController({
               suggestTemplate: this._options.suggestTemplate,
               dataSource: this._options.dataSource,
               searchDelay: this._options.searchDelay,
               filter: this._options.filter,
               minSearchLength: this._options.minSearchLength,
               searchParam: this._options.searchParam,
               textComponent: this._children.suggestText,
               suggestOpener: this._children.stickyOpener
            });
         },
         
         _changeValueHandler: function(event, value) {
            this._suggestController.setValue(value);
         },
   
         _keyPressedHandler: function(event) {
            this._suggestController.keyPress(event);
         },
         
         _selectHandler: function(item) {
            this._notify('onSelect', item);
            this._notify('valueChanged', item.get(this._options.displayProperty));
         },
         
         destroy: function() {
            if (this._suggestController) {
               this._suggestController.destroy();
               this._suggestController = null;
            }
            Suggest.superclass.destroy.call(this);
         }
         
         // </editor-fold>
         
      });
   
   
      // <editor-fold desc="OptionsDesc">
      Suggest.getOptionTypes = function() {
         return {
            searchDelay: types(Number),
            minSearchLength: types(Number),
            filter: types(Object),
            searchParam: types(String).required(),
            displayProperty: types(String).required()
         };
      };
   
      Suggest.getDefaultOptions = function() {
         return {
            searchDelay: 500,
            minSearchLength: 3
         };
      };
      // </editor-fold>
      
      return Suggest;
   }
);