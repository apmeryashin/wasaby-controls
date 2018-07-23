define('Controls-demo/Example/Example',
   [
      'Core/Control',
      'tmpl!Controls-demo/Example/Example'
   ],
   function(Control, template) {

      'use strict';

      var data = [
         {name: 'Input/Area', title: 'Area'},
         {name: 'Input/Mask', title: 'Mask'},
         {name: 'Input/Number', title: 'Number'},
         {name: 'Input/Password', title: 'Password'},
         {name: 'Input/Phone', title: 'Phone'},
         {name: 'Input/Suggest', title: 'Suggest'},
         {name: 'Input/Text', title: 'Text'}
      ];

      var Example = Control.extend({
         _template: template,

         _href: null,

         _data: null,

         _beforeMount: function() {
            this._data = data;
            this._href = location.origin + location.pathname;
         }
      });

      return Example;
   }
);
