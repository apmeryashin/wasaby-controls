/**
 * Created by iv.cheremushkin on 12.08.2014.
 */

define('SBIS3.CONTROLS/Dialog', ['Lib/Control/Control'], function(Control) {

   'use strict';

   /**
    * Отображает вложенные компоненты в виде диалогового окна, может отображаться модально или не модально.
    * Сам компонент не имеет визуального отображения, не рисует крестик или заголовок, эта логика переносится на компоненты, лежащие внутри.
    * @class SBIS3.CONTROLS/Dialog
    * @extends Lib/Control/Control
    * @author Крайнов Д.О.
    */

   var Dialog = Control.Control.extend( /** @lends SBIS3.CONTROLS/Dialog.prototype*/ {
      $protected: {
         _options: {
            /**
             * @cfg {Boolean} Отображается модально или нет
             */
            modal: false,

            /**
             * @cfg {Boolean} Можно изменять размер или нет
             */
            resizeble: false,

            /**
             * @cfg {Boolean} Можно ли перетаскивать мышкой
             */
            draggable: false
         }
      },

      $constructor: function() {

      },

      /**
       * Установить размер
       */
      setSize: function() {

      }
   });

   return Dialog;

});