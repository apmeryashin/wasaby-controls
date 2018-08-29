define('Controls-demo/Input/Area/Area', [
   'Core/Control',
   'tmpl!Controls-demo/Input/Area/Area',
   'WS.Data/Source/Memory',   
   'css!Controls-demo/Input/resources/VdomInputs'
], function(Control, template, MemorySource) {

   'use strict';
   
   var newLineKeySource = new MemorySource({
      idProperty: 'title',
      data: [
         { title: 'enter' },
         { title: 'ctrlEnter' }
      ]
   });

   var VdomDemoArea = Control.extend({
      _template: template,
      _text1: '',
      _placeholder: 'Input text',
      _constraint: '',
      _trim: false,
      _maxLength: '10',
      _minLines: 1,
      _maxLines: 5,
      _readOnly: false,
      _example: '',
      _selectOnClick: false,
      _tagStyle: 'error',

      _newLineKey: 'enter',
      _newLineKeySource: newLineKeySource,
      changeNewLineKey: function(e, key) {
         this._newLineKey = key;
      },

      _items: [
         {title: '[0-9]', example: 'You can use only digits'},
         {title: '[a-zA-Z]', example: 'You can use only letters'},
         {title: '[a-z]', example: 'You can use only lowercase letters'},
         {title: '[A-Z]', example: 'You can use only uppercase letters'}
      ],
      _tooltip: 'Area',
      _tagStyleHandler: function() {
         this._children.infoBoxArea.open({
            target: this._children.textArea._container,
            message: 'Hover'
         });
      },
      _tagStyleClickHandler: function() {
         this._children.infoBoxArea.open({
            target: this._children.textArea._container,
            message: 'Click'
         });
      },
      _validationChangedHandler: function() {
         if (this._validationErrorsValue) {
            this._validationErrors = ['Some error'];
         } else {
            this._validationErrors = null;
         }
      },
      _eventHandler: function(e, value) {
         this._eventResult = e.type + ': ' + value;
      },

      paste_text: function(e) {
         this._children.textArea.paste('567');
      }

   });
   return VdomDemoArea;
});
