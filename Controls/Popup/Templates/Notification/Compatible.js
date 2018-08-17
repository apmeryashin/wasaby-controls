define('Controls/Popup/Templates/Notification/Compatible',
   [
      'Lib/Control/CompoundControl/CompoundControl',
      'tmpl!Controls/Popup/Templates/Notification/Compatible',
      'css!Controls/Popup/Templates/Notification/Compatible'
   ],
   function(Control, template) {

      /**
       * Замена SBIS3.CONTROLS/NotificationPopup при открытии нотификационных окон через vdom механизм.
       */

      /**
       * @name Controls/Popup/Templates/Notification/Compatible#headerTemplate
       * @cfg {Function} Устанавливает шаблон шапки нотификационного уведомления.
       */

      /**
       * @name Controls/Popup/Templates/Notification/Compatible#bodyTemplate
       * @cfg {Function} Устанавливает шаблон для содержимого нотификационного уведомления.
       */

      /**
       * @name Controls/Popup/Templates/Notification/Compatible#footerTemplate
       * @cfg {Function} Устанавливает шаблон футера нотификационного уведомления.
       */

      /**
       * @name Controls/Popup/Templates/Notification/Compatible#closeButton
       * @cfg {Boolean} Должна ли быть кнопка закрытия.
       */

      /**
       * @name Controls/Popup/Templates/Notification/Compatible#icon
       * @cfg {String} Иконка в шапке.
       */

      /**
       * @name Controls/Popup/Templates/Notification/Compatible#_opener
       * @cfg {String} Инстанс vdom opener.
       */
      var Compatible = Control.extend({
         _dotTplFn: template,

         /**
          * Прикладники обращаются к методу close для закрытия. Раньше они имели popup, а сейчас текущий компонент.
          */
         close: function() {
            this._options._opener.close();
         }
      });

      return Compatible;
   }
);
