define('js!SBIS3.CONTROLS.RichEditorToolbarBase', [
   "Core/core-functions",
   "Core/core-merge",
   "Core/EventBus",
   "js!SBIS3.CONTROLS.ButtonGroupBase",
   'Core/helpers/string-helpers',
   'js!SBIS3.CONTROLS.StylesPanelNew'
], function( cFunctions, cMerge, EventBus, ButtonGroupBase, strHelpers, StylesPanel) {

   'use strict';

   var
      /**
       * @class SBIS3.CONTROLS.RichEditorToolbarBase
       * @extends SBIS3.CONTROLS.ButtonGroupBase
       * @author Борисов П.С.
       * @public
       * @control
       */
      constants = {
         colorsMap: {
            'rgb(0, 0, 0)': 'black',
            'rgb(255, 0, 0)': 'red',
            'rgb(0, 128, 0)': 'green',
            'rgb(0, 0, 255)': 'blue',
            'rgb(128, 0, 128)': 'purple',
            'rgb(128, 128, 128)': 'grey'
         },
         INLINE_TEMPLATE: '6'
      },
      RichEditorToolbarBase = ButtonGroupBase.extend(/** @lends SBIS3.CONTROLS.RichEditorToolbarBase.prototype */{
         $protected : {
            _options : {
               items: undefined,
               defaultConfig: undefined,
               _canServerRender: true,
               activableByClick: false,
               linkedEditor: undefined,
               idProperty: 'name', //по данному полю getItemInstance(keyField) обращаться к элементу тулбара
               /**
                * @cfg {Boolean} Открыт(true) или свёрнут(false) тулбар
                */
               expanded: true
            },
            _itemsContainer:  undefined,
            _handlersInstances: {
               format: undefined
            },
            _stylesPanel: undefined,
            _buttons:{
               bold:false,
               italic:false,
               underline:false,
               strikethrough: false
            }
         },

         _modifyOptions: function(options) {
            options.items = this._prepareItems(options.items, options.defaultConfig, options.expanded);
            options = RichEditorToolbarBase.superclass._modifyOptions.apply(this, arguments);
            return options;
         },

         $constructor: function() {
            this._publish('onExpandedChange');
            this._itemsContainer = this._container.find('[class*="__itemsContainer"]');
            this._container.on('mousedown focus', this._blockFocusEvents);
            this._itemsContainer.on('mousedown focus', this._blockFocusEvents);
         },

         //в buttonGroupBase проставляет активность всем дочерним контролам, избавляемся от этого
         setEnabled: function(enabled){
            ButtonGroupBase.superclass.setEnabled.call(this, enabled);
         },
         /**
          * Связывает панель инструментов с богатым полем ввода
          * @param {obj} editor Экземпляр RichTextArea
          */
         setLinkedEditor: function(editor) {
            this._unbindEditor();
            this._options.linkedEditor = editor;
            this._bindEditor();
         },

         getLinkedEditor: function() {
            return  this._options.linkedEditor;
         },

         /**
          * Переключение видимости тулбара
          */
         toggleToolbar: function() {
            this.setExpanded(!this._options.expanded);
         },
         /**
          * Установка состояния тулбара (раскрыт/свёрнут)
          *@param {boolean} expanded видимость тулбара
          */
         //Переопределить в дочернем классе
         setExpanded: function(expanded){
            this._options.expanded = expanded;
            this._notify('onExpandedChange', expanded);
         },
         /**
          * Возвращает состояние тулбара (раскрыт/свёрнут)
          */
         getExpanded: function(){
            return this._options.expanded;
         },

         _unbindEditor: function() {
            var
               editor = this._options.linkedEditor;
            if (editor) {
               this.unsubscribeFrom(editor, 'onFormatChange', this._handlersInstances.format);
            }
         },

         _bindEditor: function() {
            var
               editor = this._options.linkedEditor;
            this._handlersInstances.format = this._formatChangeHandler.bind(this);
            this.subscribeTo(editor, 'onFormatChange', this._handlersInstances.format);
            this._fillHistory();
         },

         _formatChangeHandler : function() {},

         _blockFocusEvents: function(event) {
            var eventsChannel = EventBus.channel('WindowChangeChannel');
            event.preventDefault();
            event.stopPropagation();
            //Если случился mousedown то нужно нотифицировать о клике, перебив дефолтное событие перехода фокуса
            if(event.type === 'mousedown') {
               eventsChannel.notify('onDocumentClick', event);
            }
         },

         _prepareItems: function (userItems, defaultConfig) {
            var
               items,
               deleteIdexes = [];
            items = cFunctions.clone(defaultConfig);
            //мерж массивов
            for (var i in userItems){
               if (userItems.hasOwnProperty(i)) {
                  var
                     inDefault = false;
                  for (var j in defaultConfig) { //бегаем по default чтобы не бегать по только что добавленным
                     if (items.hasOwnProperty(j)) {
                        if (items[j].name == userItems[i].name) {
                           cMerge(items[j], userItems[i]);
                           inDefault = true;
                           break;
                        }
                     }
                  }
                  if (!inDefault) {
                     items.push(userItems[i]);
                  }
               }
            }
            for (var i in items) {
               if (items.hasOwnProperty(i)) {
                  items[i] = cMerge({
                     activableByClick: false
                  }, items[i]);

                  if(items[i].visible === false){
                     deleteIdexes.push(i);
                  }
               }
            }
            for (var i in deleteIdexes) {
               if (items.hasOwnProperty(i)) {
                  items.splice(deleteIdexes[i] - i, 1);
               }
            }
            items.sort(function(item1,item2){
               return (item1.order || 99999) - (item2.order || 99999)
            });
            return items;
         },

         /* Переопределяем получение контейнера для элементов */
         _getItemsContainer: function() {
            return this._itemsContainer;
         },

         _fillHistory: function(){
            var
               prepareHistory = function(value){
                  var
                     stripText, title,
                     $tmpDiv = $('<div/>').append(value);
                  $tmpDiv.find('.ws-fre__smile').each(function(){
                     var smileName = $(this).attr('title');
                     $(this).replaceWith('[' + (smileName ? smileName : rk('смайл')) +']');
                  });
                  stripText = title = strHelpers.escapeHtml($tmpDiv.text());
                  stripText = stripText.replace('/\n/gi', '');
                  if (!stripText && value) {
                     stripText = rk('Контент содержит только html-разметку, без текста.');
                  } else if (stripText && stripText.length > 140) { // обрезаем контент, если больше 140 символов
                     stripText = stripText.substr(0, 140) + ' ...';
                  }
                  return stripText;
               };
            if (this.getItems().getRecordById('history')) {
               this.getLinkedEditor().getHistory().addCallback(function (arrBL) {
                  //Проблема:
                  //          После прихода данных тулбар уже может быть уничтожен
                  //Решение 1:
                  //          Хранить deferred вызова и убивать его в destroy
                  //Решение 2:
                  //          Проверять на isDestroyed
                  if (!this.isDestroyed()) {
                     var
                        items = [],
                        history = this.getItemInstance('history');
                     for (var i in arrBL) {
                        if (arrBL.hasOwnProperty(i)) {
                           items.push({
                              key: items.length,
                              title: prepareHistory(arrBL[i]),
                              value: arrBL[i]
                           })
                        }
                     }
                     if (!arrBL.length) {
                        history.setEnabled(false);
                     }
                     history.setItems(items);
                  }
               }.bind(this));
            }
         },
         _setText: function(text) {
            if (this._options.linkedEditor) {
               this._options.linkedEditor.setText(text);
            }
         },
         _codeSample: function(button) {
            this.getLinkedEditor().showCodeSample();
         },
         _openStylesPanel: function(button){
            var
               stylesPanel = this.getStylesPanel(button);
            stylesPanel.setStylesFromObject({
               fontsize: tinyMCE.DOM.getStyle(this.getLinkedEditor().getTinyEditor().selection.getNode(), 'font-size', true).replace('px',''),
               color: constants.colorsMap[tinyMCE.DOM.getStyle(this.getLinkedEditor().getTinyEditor().selection.getNode(), 'color', true)],
               bold: this._buttons.bold,
               italic: this._buttons.italic,
               underline: this._buttons.underline,
               strikethrough: this._buttons.strikethrough
            });
            stylesPanel.show();
         },

         _toggleState: function(state, obj) {
            var
               selectors = {
                  'bold':  'strong',
                  'italic':  'em',
                  'underline':  'span[style*="decoration: underline"]',
                  'strikethrough':  'span[style*="decoration: line-through"]'
               },
               name = obj.format === 'blockquote' ? 'mceBlockQuote' : obj.format;
            if (!state && $(obj.node).closest(selectors[obj.format]).length) {
               state = true;
            }
            if (['bold', 'italic', 'underline', 'strikethrough'].indexOf(obj.format) != -1) {
               this._buttons[obj.format] = state;
            }

            return {state: state, name: name};
         },
         getStylesPanel: function(button){
            var
               self = this;
            if (!this._stylesPanel) {
               this._stylesPanel = new StylesPanel({
                  parent: button,
                  target: button.getContainer(),
                  corner: 'tl',
                  verticalAlign: {
                     side: 'top',
                     offset: -4
                  },
                  horizontalAlign: {
                     side: 'left'
                  },
                  element: $('<div></div>'),
                  fontSizes: [12, 14, 15, 18],
                  colors: [
                     {color:'black'},
                     {color:'red'},
                     {color:'green'},
                     {color:'blue'},
                     {color:'purple'},
                     {color:'grey'}
                  ],
                  activableByClick: false
               });

               this._stylesPanel.subscribe('changeFormat', function(){
                  self._applyFormats(self._stylesPanel.getStylesObject())
               });
            }
            return this._stylesPanel;
         },

         _applyFormats: function(formats){
            if (this._options.linkedEditor) {
               ['title',  'subTitle','additionalText'].forEach(function(stl){
                  this._options.linkedEditor._removeFormat(stl);
               }, this);
               this._options.linkedEditor.setFontColor(formats.color);
               this._options.linkedEditor.setFontSize(formats.fontsize);
               for ( var button in this._buttons) {
                  if (this._buttons.hasOwnProperty(button)) {
                     if (this._buttons[button] !== formats[button]) {
                        this._options.linkedEditor.execCommand(button);
                     }
                  }
               }
            }
         },
         destroy: function() {
            this._unbindEditor();
            this._handlersInstances = null;
            RichEditorToolbarBase.superclass.destroy.apply(this, arguments);
            this._itemsContainer = null;
         }
      });
   return RichEditorToolbarBase;
});