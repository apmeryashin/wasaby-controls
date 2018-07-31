define('Controls-demo/Headers/Counter/counterDemo', [
   'Core/Control',
   'WS.Data/Source/Memory',
   'tmpl!Controls-demo/Headers/Counter/counterDemo',
   'WS.Data/Collection/RecordSet',
   'css!Controls-demo/Headers/headerDemo',
   'css!Controls-demo/Headers/resetButton'
], function (Control,
             MemorySource,
             template) {
   'use strict';

   var counterSizeSource = new MemorySource({
      idProperty: 'title',
      data: [
         {
            title: 's'
         },
         {
            title: 'm'
         },
         {
            title: 'l'
         }
      ]
   });

   var counterStyleSource = new MemorySource({
      idProperty: 'title',
      data: [
         {
            title: 'default'
         },
         {
            title: 'primary'
         },
         {
            title: 'disabled'
         }
      ]
   });

   var ModuleClass = Control.extend(
      {
         _template: template,
         _counterSelectedSize: 'l',
         _counterSelectedStyle: 'default',
         _counterSizeSource: counterSizeSource,
         _counterStyleSource: counterStyleSource,
         _counterValue: 12,
         _eventName: 'no event',

         clickHandler: function(e) {
            this._eventName = 'click';
         },

         counterChangeSize: function(e, key) {
            this._counterSelectedSize = key;
         },

         counterChangeStyle: function(e, key) {
            this._counterSelectedStyle = key;
         },

         reset: function() {
            this._eventName = 'no event';
         }
      });
   return ModuleClass;
});
