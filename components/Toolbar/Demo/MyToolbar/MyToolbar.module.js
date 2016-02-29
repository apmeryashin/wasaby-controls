define('js!SBIS3.CONTROLS.Demo.MyToolbar', [
   'js!SBIS3.CORE.CompoundControl',
   'html!SBIS3.CONTROLS.Demo.MyToolbar',
   'css!SBIS3.CONTROLS.Demo.MyToolbar',
   'js!SBIS3.CONTROLS.Toolbar',
   'js!SBIS3.CONTROLS.TextArea',
   'js!SBIS3.CONTROLS.SwitcherDouble',
   'js!SBIS3.CONTROLS.CheckBox',
   'js!SBIS3.CONTROLS.Link',
   'js!SBIS3.CONTROLS.TextBox',
   'js!SBIS3.CONTROLS.Button'
], function (CompoundControl, dotTplFn) {
   'use strict';
   /**
    * SBIS3.CONTROLS.Demo.MyToolbar
    * @class SBIS3.CONTROLS.Demo.MyToolbar
    * @extends $ws.proto.CompoundControl
    * @control
    * @public
    */
   var MyToolbar = CompoundControl.extend(/** @lends SBIS3.CONTROLS.Demo.MyToolbar.prototype */{
      _dotTplFn: dotTplFn,
      $protected: {
         _options: {},
         _textArea: null
      },
      $constructor: function () {
      },

      init: function () {
         MyToolbar.superclass.init.call(this);

         this._textArea = this.getChildControlByName('TextArea');
         $ws.single.CommandDispatcher.declareCommand(this, 'testCommand', this._testCommand);

         this._MyToolbar = this.getChildControlByName('MyToolbar');
         this._MyToolbar.subscribe('onToolbarItemActivate', this._onToolbarItemActivate.bind(this) );

         var items = [
            {
               id: 'edoSendMessage',
               icon: 'sprite:icon-24 icon-EmptyMessage icon-primary',
               caption: 'Сообщения',
               weight: 10,
               visible: true,
               isMainAction: true,
               command: 'edoSendMessage',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoDeleteDocument',
               icon: 'sprite:icon-24 icon-Erase icon-error',
               caption: 'Удалить',
               weight: 20,

               minRights: 2,
               isMainAction: true,
               command: 'edoDeleteDocument',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoDeleteToTrashDocument',
               icon: 'sprite:icon-24 icon-Erase icon-error',
               caption: 'Переместить в корзину',
               weight: 20,
               minRights: 2,
               isMainAction: true,
               command: 'edoDeleteToTrashDocument',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoPrintDocument',
               icon: 'sprite:icon-24 icon-Print icon-primary',
               caption: 'Распечатать',
               weight: 30,
               visible: true,
               isMainAction: false,
               command: 'edoPrintDocument',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoSaveDocumentOnDisk',
               icon: 'sprite:icon-24 icon-Save icon-primary',
               caption: 'Скачать',
               weight: 40,
               visible: true,
               isMainAction: false,
               command: 'edoSaveDocumentOnDisk',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoSetImportant',
               icon: 'icon-24 icon-Flag icon-hover',
               visible: true,
               caption: 'Сделать важным',
               weight: 50,
               isMainAction: true,
               command: 'edoSetImportant',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoPutOnMonitoring',
               icon: 'sprite:icon-24 icon-Show icon-primary',
               caption: 'Поставить на контроль',
               weight: 60,
               visible: true,
               isMainAction: false,
               command: 'edoPutOnMonitoring',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoLinkedDocs',
               icon: 'icon-24 icon-Linked icon-primary',
               caption: 'Связанные документы',
               visible: true,
               weight: 80,
               isMainAction: false,
               command: 'edoLinkedDocs',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoOpenInNewTab',
               icon: 'sprite:icon-24 icon-NewTab icon-primary',
               caption: 'Открыть в новой вкладке',
               weight: 90,
               visible: true,
               isMainAction: false,
               command: 'edoOpenInNewTab',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoGetLink',
               icon: 'sprite:icon-24 icon-Link icon-primary',
               caption: 'Получить ссылку на документ',
               weight: 100,
               visible: true,
               isMainAction: false,
               command: 'edoGetLink',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            },

            {
               id: 'edoShowHistory',
               icon: 'sprite:icon-24 icon-ExpandList icon-primary',
               caption: 'История',
               weight: 110,
               visible: true,
               isMainAction: false,
               command: 'edoShowHistory',
               componentType: 'js!SBIS3.CONTROLS.IconButton'
            }];
         this._MyToolbar.setItems(items);
      },

      addToArea: function(addingText) {
         var text = this._textArea.getText();
         text += '\n'+ addingText;
         this._textArea.setText(text);
      },

      _onToolbarItemActivate: function(event, id, type) {
         this.addToArea('ToolbarItemActivate '+ id +'; '+ type);
      },

      _testCommand: function() {
         this.addToArea('testCommand');
      }
   });
   return MyToolbar;
});