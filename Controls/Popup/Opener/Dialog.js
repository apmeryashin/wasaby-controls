define('Controls/Popup/Opener/Dialog',
   [
      'Controls/Popup/Opener/BaseOpener'
   ],
   function(Base) {
      /**
       * Component that opens a popup that is positioned in the center of the browser window. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/wasaby/components/openers/#_3 See more}
       * @class Controls/Popup/Opener/Dialog
       * @control
       * @public
       * @author Красильников А.С.
       * @category Popup
       * @demo Controls-demo/Popup/Opener/DialogPG
       */

      var _private = {
         getDialogConfig: function(config) {
            config = config || {};

            // The dialog is isDefaultOpener by default. For more information, see  {@link Controls/interface/ICanBeDefaultOpener}
            config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
            return config;
         }
      };

      var Dialog = Base.extend({

         /**
          * Open dialog popup.
          * @function Controls/Popup/Opener/Dialog#open
          * @returns {Undefined}
          * @param {PopupOptions[]} popupOptions Dialog popup options.
          * @remark
          * {@link https://wi.sbis.ru/docs/js/Controls/interface/IDialogOptions#popupOptions popupOptions}
          * @example
          * wml
          * <pre>
          *    <Controls.Popup.Opener.Dialog name="dialog" template="Controls-demo/Popup/TestDialog" isModal="{{true}}">
          *          <ws:templateOptions key="111"/>
          *    </Controls.Popup.Opener.Dialog>
          *
          *    <Controls.Button name="openDialogButton" caption="open dialog" on:click="_openDialog()"/>
          *    <Controls.Button name="closeDialogButton" caption="close dialog" on:click="_closeDialog()"/>
          * </pre>
          * js
          * <pre>
          *   Control.extend({
          *      ...
          *
          *       _openDialog() {
          *          var popupOptions = {
          *              autofocus: true
          *          }
          *          this._children.dialog.open(popupOptions)
          *       }
          *
          *       _closeDialog() {
          *          this._children.dialog.close()
          *       }
          *       ...
          *   });
          * </pre>
          * @see close
          */
         open: function(config) {
            config = _private.getDialogConfig(config, this);
            Base.prototype.open.call(this, config, 'Controls/Popup/Opener/Dialog/DialogController');
         }
      });

      Dialog._private = _private;

      return Dialog;
   }

   /**
    * @name Controls/Popup/Opener/Dialog#autofocus
    * @cfg {Boolean} Determines whether focus is set to the template when popup is opened.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#modal
    * @cfg {Boolean} Determines whether the window is modal.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#closeOnOutsideClick
    * @cfg {Boolean} Determines whether possibility of closing the popup when clicking past.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#className
    * @cfg {String} Class names of popup.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#template
    * @cfg {String|Function} Template inside popup.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#templateOptions
    * @cfg {String|Function} Template options inside popup.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#width
    * @cfg {Number} Width of popup.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#height
    * @cfg {Number} Height of popup.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#maxHeight
    * @cfg {Number} The maximum height of popup.
    */
   /**
    * @name Controls/Popup/Opener/Dialog#top
    * @cfg {Number} Distance from the window to the top of the screen.
    */
   /**
    * @name Controls/Popup/Opener/Dialog#left
    * @cfg {Number} Distance from the window to the left border of the screen.
    */

   /**
    * @name Controls/Popup/Opener/Dialog#close
    * @function
    * @description Close dialog popup.
    * @returns {Undefined}
    * @example
    * wml
    * <pre>
    *    <Controls.Popup.Opener.Dialog name="dialog" template="Controls-demo/Popup/TestDialog" isModal="{{true}}">
    *          <ws:templateOptions key="111"/>
    *    </Controls.Popup.Opener.Dialog>
    *
    *    <Controls.Button name="openDialogButton" caption="open dialog" on:click="_openDialog()"/>
    *    <Controls.Button name="closeDialogButton" caption="close dialog" on:click="_closeDialog()"/>
    * </pre>
    * js
    * <pre>
    *   Control.extend({
    *      ...
    *
    *       _openDialog() {
    *          var popupOptions = {
    *              autofocus: true
    *          }
    *          this._children.dialog.open(popupOptions)
    *       }
    *
    *       _closeDialog() {
    *          this._children.dialog.close()
    *       }
    *       ...
    *   });
    * </pre>
    * @see open
    */

   /**
    * @name Controls/Popup/Opener/Dialog#isOpened
    * @function
    * @description Popup opened status.
    */

   /**
    * @typedef {Object} PopupOptions
    * @description Dialog popup options.
    * @property {Boolean} autofocus Determines whether focus is set to the template when popup is opened.
    * @property {Boolean} modal Determines whether the window is modal.
    * @property {String} className Class names of popup.
    * @property {Boolean} closeOnOutsideClick Determines whether possibility of closing the popup when clicking past.
    * @property {function|String} template Template inside popup.
    * @property {function|String} templateOptions Template options inside popup.
    * @property {Number} width Width of popup.
    * @property {Number} height Height of popup.
    * @property {Number} maxHeight The maximum height of popup.
    * @property {Number} top Distance from the window to the top of the screen.
    * @property {Number} left Distance from the window to the left border of the screen.
    */

);
