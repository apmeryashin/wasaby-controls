/**
 * Created by iv.cheremushkin on 13.08.2014.
 */

define('js!SBIS3.CONTROLS.ButtonGroupBase', ['js!SBIS3.CORE.CompoundControl', 'js!SBIS3.CONTROLS._CollectionMixin', 'css!SBIS3.CONTROLS.ButtonGroupBase'], function(CompoundControl, _CollectionMixin) {

   'use strict';

   /**
    * Контрол, реализующий поведение выбора одного из нескольких значений при помощи набора радиокнопок. Отображения не имеет.
    * @class SBIS3.CONTROLS.ButtonGroupBase
    * @mixes SBIS3.CONTROLS._CollectionMixin
    * @mixes SBIS3.CONTROLS._SelectorMixin
    * @extends SBIS3.CORE.Control
    */

   var ButtonGroupBase = CompoundControl.extend([_CollectionMixin], /** @lends SBIS3.CONTROLS.ButtonGroupBase.prototype */ {
      $protected: {
         _options: {

         }
      },

      $constructor: function() {
         if (this._items.getItemsCount()) {
            this._drawItems();
         }
      },

      _drawItems : function() {
         this._container.empty();
         var self = this;

         this._items.iterate(function (item, key) {
            var
               insContainer = $('<div></div>').attr('data-key', key).appendTo(self._container),
               ins = self._createInstance(item, insContainer);
            if (ins) {
               ins.subscribe('onActivated', function(){
                  self._itemActivatedHandler(this);
               });
            }
         });
      },

      _createInstance : function() {
         /*метод должен быть перегружен*/
         return false;
      },

      _itemActivatedHandler : function() {
         /*метод должен быть перегружен*/
      }
   });

   return ButtonGroupBase;

});