define('SBIS3.CONTROLS/VdomPhoneTextBox',
   [
      'SBIS3.CONTROLS/CompoundControl',
      'SBIS3.CONTROLS/Mixins/FormWidgetMixin',
      'tmpl!SBIS3.CONTROLS/VdomPhoneTextBox/VdomPhoneTextBox',

      'SBIS3.CONTROLS/VdomPhoneTextBox/PhoneTextBoxWrapper'
   ],
   function(CompoundControl, FormWidgetMixin, dotTplFn) {

      'use strict';

      /**
       * Поле ввода телефонного номера.
       * Данный контрол является оберткой над vdom контролом Controls/Input/Phone.
       * Использовать следует только после согласования с платформой.
       * @class SBIS3.CONTROLS/VdomPhoneTextBox
       * @extends Core/Control
       * @author Журавлев М. С.
       */
      var VdomPhoneTextBox = CompoundControl.extend([FormWidgetMixin], /** @lends SBIS3.CONTROLS/VdomPhoneTextBox.prototype*/{
         _dotTplFn: dotTplFn,

         $protected: {
            _options: {
               value: '',

               /**
                * Требуется ли валидировать поле по уходу фокуса.
                */
               validateOnFocusOut: true
            }
         },

         init: function() {
            var wrapper;

            VdomPhoneTextBox.superclass.init.apply(this, arguments);

            wrapper = this.getChildControlByName('wrapper');

            wrapper.subscribe('onValueChange', this._valueChangedHandler.bind(this));

            /**
             * По стандарту поле ввода должно валидироваться по уходу фокуса. В старых полях, это делается самим контролом.
             * В нашей обертке над VDOM полем мы также сами зовем валидации, но есть случаи когда этого елать не нужно.
             * Пример: поле вставили в EditInPlace. Для этого добавлена опция validateOnFocusOut.
             * https://online.sbis.ru/opendoc.html?guid=af7e946e-c691-43cd-9788-bbb9663ae775
             * В VDOM полях валидацию устанавливает прикладник через механиз валидации на основе
             * компонентов из Control.Validate.
             */
            if (this._options.validateOnFocusOut) {
               wrapper.subscribe('onFocusOut', this.validate.bind(this));
            }

            this._wrapper = wrapper;
         },

         _valueChangedHandler: function(event, value) {
            this._options.value = value;
            this._notify('onValueChange', value);
            this._notifyOnPropertyChanged('value');
         },

         validate: function(value) {
            var validate = VdomPhoneTextBox.superclass.validate.call(this);

            this._wrapper.setValidationError(validate === true);

            return validate;
         },

         /**
          * Получает текстовое значение поля ввода телефонного номера без разделителей.
          * @returns {*|value|string}
          * @example
          * <pre>
          * myComponent.subscribe('onTextChange', function(){
          *    myPhone.getValue();
          * });
          * </pre>
          * @see value
          * @see setValue
          */
         getValue: function() {
            return this._wrapper.getValue();
         },

         /**
          * Устанавливает текстовое значение поля ввода телефонного номера без разделителей.
          * @param value
          * @example
          * <pre>
          * myComponent.subscribe('onClick', function(){
          *    myPhone.setValue("88001002424");
          * });
          * </pre>
          * @see value
          * @see getValue
          */
         setValue: function(value) {
            this._options.value = value;
            this._wrapper.setValue(value);
         },

         /**
          * Получает текстовое значение поля ввода телефонного номера c разделителями.
          * @return {String}
          */
         getDisplayValue: function() {
            return this._wrapper.getDisplayValue();
         }
      });

      return VdomPhoneTextBox;
   }
);
