define('js!SBIS3.CONTROLS.TextBox', ['js!SBIS3.CONTROLS.TextBoxBase','html!SBIS3.CONTROLS.TextBox'], function(TextBoxBase, dotTplFn) {

   'use strict';

   /**
    * Поле ввода в одну строчку
    * @class SBIS3.CONTROLS.TextBox
    * @extends SBIS3.CONTROLS.TextBoxBase
    * @control
    * @public
    * @category Inputs
    */

   var TextBox = TextBoxBase.extend(/** @lends SBIS3.CONTROLS.TextBox.prototype */ {
      _dotTplFn: dotTplFn,
      $protected: {
         _inputField : null,
         _options: {
            beforeFieldWrapper: null,
            afterFieldWrapper: null,
            /**
             * @typedef {Object} TextTransformEnum
             * @variant uppercase перевести в верхний регистр
             * @variant lowercase перевести в нижний регистр
             * @variant none оставить как есть
             */
            /**
             * @cfg {TextTransformEnum} Форматирование текста
             * Возможные значения:
             * <ul>
             *    <li>uppercase - все символы верхним регистром;</li>
             *    <li>lowercase - все символы нижним регистром;</li>
             *    <li>none - без изменений.</li>
             * </ul>
             */
            textTransform: 'none',
            /**
             * @cfg {Boolean} Выделять или нет текст в поле при получении фокуса
             * Возможные значения при получении полем фокуса:
             * <ul>
             *    <li>true - выделять текст;</li>
             *    <li>false - не выделять.</li>
             * </ul>
             */
            selectOnClick: false
         }
      },

      $constructor: function() {
         var self = this;
         this._inputField = $('.controls-TextBox__field', this.getContainer().get(0));
         this._container.bind('keypress',function(e){
            self._keyPressBind(e);
         });
         this._container.bind('keydown',function(e){
            self._keyDownBind(e);
         });

         this._container.bind('keyup',function(e){
            self._keyUpBind(e);
         });
         // При потере фокуса делаем trim, если нужно
         // TODO Переделать на платформенное событие потери фокуса
         self._inputField.bind('focusout', function () {
            if (self._options.trim) {
               self.setText(self._trim(self.getText()));
            }
         });

         self._inputField.bind('mouseup',function(){
            if (self._options.selectOnClick) {
               self._inputField.select();
            }
         });

      },

      setText: function(text){
         //перед изменением делаем trim если нужно
         if (this._options.trim) {
            text = this._trim(text);
         }
         TextBox.superclass.setText.call(this, text);
         this._inputField.attr('value', text || '');
      },

      setMaxLength: function(num) {
         TextBox.superclass.setMaxLength.call(this, num);
         this._inputField.attr('maxlength',num);
      },

      setPlaceholder: function(text){
         TextBox.superclass.setPlaceholder.call(this, text);
         this._inputField.attr('placeholder', text);
      },

      /**
       * Установить форматирование текста
       * @param {TextTransformEnum} textTransform
       */
      setTextTransform: function(textTransform){
         switch (textTransform) {
            case 'uppercase':
               this._inputField.removeClass('controls-TextBox__field-lowercase');
               this._inputField.addClass('controls-TextBox__field-uppercase');
               break;
            case 'lowercase':
               this._inputField.removeClass('controls-TextBox__field-uppercase');
               this._inputField.addClass('controls-TextBox__field-lowercase');
               break;
            default:
               this._inputField.removeClass('controls-TextBox__field-uppercase');
               this._inputField.removeClass('controls-TextBox__field-lowercase');
         }
      },

      _keyUpBind: function() {
         var newText = this._inputField.val();
         if (newText != this._options.text) {
            TextBox.superclass.setText.call(this, newText);
         }
      },

      _keyDownBind: function() {
      },

      _keyPressBind: function() {
      },

      _setEnabled : function(enabled) {
         TextBox.superclass._setEnabled.call(this, enabled);
         if (enabled == false) {
            this._inputField.attr('readonly', 'readonly')
         }
         else {
            this._inputField.removeAttr('readonly');
         }
      }
   });

   return TextBox;

});