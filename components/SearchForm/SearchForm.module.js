define('js!SBIS3.CONTROLS.SearchForm', [
   'js!SBIS3.CONTROLS.TextBox',
   'js!SBIS3.CONTROLS.SearchMixin',
   'html!SBIS3.CONTROLS.SearchForm',
   'html!SBIS3.CONTROLS.SearchForm/resources/SearchFormButtons'
], function (TextBox, SearchMixin, dotTplFn, buttonsTpl) {

   'use strict';

   /**
    * Cтрока поиска, поле ввода + кнопка поиска.
    * @class SBIS3.CONTROLS.SearchForm
    * @extends SBIS3.CONTROLS.TextBox
    * @mixes SBIS3.CONTROLS.SearchMixin
    * @public
    * @control
    * @demo SBIS3.CONTROLS.Demo.MySearchForm
    * @author Крайнов Дмитрий Олегович
    */

   var SearchForm = TextBox.extend([SearchMixin],/** @lends SBIS3.CONTROLS.SearchForm.prototype */ {
      /**
       * @event onSearchStart При нажатии кнопки поиска
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       * @param {String} text Текст введенный в поле поиска
       */
      /**
       * @event onReset При нажатии кнопки отмена (крестик)
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       */
      _dotTplFn : dotTplFn,
      $protected: {
         _options: {
            afterFieldWrapper: buttonsTpl,
            /**
             * @cfg {String} Текст на кнопке поиска
             * @example
             * <pre>
             *     <option name="btnCaption">Найти</option>
             * </pre>
             */
            btnCaption: '',
            /**
             * @cfg {String} Подсказка в поле ввода
             * @example
             * <pre>
             *     <option name="placeholder">Введите ФИО полностью</option>
             * </pre>
             */
            placeholder: ''
         }
      },

      $constructor: function () {
         var self = this;

         this._publish('onSearchStart','onReset');

         this.subscribe('onTextChange', function(e, text) {
            if (text == '') {
               $('.js-controls-SearchForm__reset', self.getContainer().get(0)).hide();
            } else {
               $('.js-controls-SearchForm__reset', self.getContainer().get(0)).show();
            }
         });
         $('.js-controls-SearchForm__reset', this.getContainer().get(0)).click(function() {
            self.resetSearch();
         });
         $('.js-controls-SearchForm__search', this.getContainer().get(0)).click(function() {
            self.applySearch();
         });
         $(this.getContainer().get(0)).keydown(function(event) {
            event.stopPropagation();
         });
         $(this.getContainer().get(0)).keyup(function(event) {
            self._keyUp(event);
         });
      },

      /**
       * Обработчик поднятия клавиши
       * @private
       */
      _keyUp:function(event) {
         if (event.which == 13) {
            this.applySearch();
            //TODO в 3.7.3.20 перейти на общие с миксином события. в 10 страшно пока отпиливать
            this._applySearch(this.getText());
         }
      },

      /**
       * Начать поиск с тем текстом, что введен
       * @see resetSearch
       * @see startCharacter
       */
      applySearch: function() {
         var text = String.trim(this.getText().replace(/[«»’”@#№$%^&*;:?.,!\/~\]\[{}()|<>=+\-_'"]/g, ''));
         //не отправляем событие, если символов меньше startCharacter
         if (text.length >= this._options.startCharacter) {
            this._notify('onSearchStart', text);
         }
      },

      /**
       * Сбросить поиск
       * @see applySearch
       */
      resetSearch: function(){
         $('.js-controls-SearchForm__reset', this.getContainer().get(0)).hide();
         this.setText('');
      }
   });

   return SearchForm;
});