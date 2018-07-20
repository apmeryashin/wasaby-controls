define('Controls-demo/Switch/standartDemoSwitch', [
   'Core/Control',
   'tmpl!Controls-demo/Switch/standartDemoSwitch',
   'WS.Data/Source/Memory',
   'css!Controls-demo/Switch/standartDemoSwitch'
], function(Control, template, MemorySource) {
   'use strict';

   var source = new MemorySource({
      idProperty: 'id',
      displayProperty: 'caption',
      data: [
         {
            id: '1',
            title: 'State1'
         },
         {
            id: '2',
            title: 'State2'
         }
      ]
   });

   var ModuleClass = Control.extend({
      _template: template,
      _source: source,
      _selectKey: '1',
      _selectKey2: '1',
      _selectKey3: '',
      value: false,
      value1: true,
      value2: false,
      value3: true,
      value4: false,
      value5: true,

      changeKey: function(e, radioIndex, key) {
         switch (radioIndex) {
            case 1:
               this._selectKey = key;
               break;
            case 2:
               this._selectKey2 = key;
               break;
            case 3:
               this._selectKey3 = key;
               break;
         }
      }
   });
   return ModuleClass;
});
