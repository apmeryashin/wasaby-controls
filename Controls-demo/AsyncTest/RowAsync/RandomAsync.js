define('Controls-demo/AsyncTest/RowAsync/RandomAsync',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/RowAsync/RandomAsync',
   ],
   function(Base, template) {
      'use strict';

      var rowAsyncModule = Base.Control.extend({
         _template: template,
         _isOpen: false,

         _setOpen: function() {
            this._isOpen = !this._isOpen;
            this._forceUpdate();
         },
      });
      rowAsyncModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo'];

      return rowAsyncModule;
   }
);
