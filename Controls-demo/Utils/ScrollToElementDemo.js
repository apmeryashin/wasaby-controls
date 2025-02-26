define('Controls-demo/Utils/ScrollToElementDemo', [
   'UI/Base',
   'Controls/scroll',
   'Types/source',
   'wml!Controls-demo/Utils/ScrollToElementDemo'
], function(
   Base,
   scroll,
   source,
   template
) {
   'use strict';

   var ScrollToElementDemo = Base.Control.extend({
      _template: template,

      _beforeMount: function() {
         var data = [];
         for (var i = 0; i < 20; i++) {
            data.push({
               id: i,
               title: i
            });
         }
         this._viewSource = new source.Memory({
            data: data,
            keyProperty: 'id'
         });
      },

      _scrollTo: function(e, direction, elementNumber) {
         var listChildren = this._children.list._container.querySelectorAll('.controls-ListView__itemV');
         scroll.scrollToElement(listChildren[11], direction);
      }
   });

   return ScrollToElementDemo;
});
