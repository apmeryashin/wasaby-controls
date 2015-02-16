'use strict';

$ws.core.withComponents('Source').addCallback(function() {
   $(document).ready(function() {
      initMenus();

      require(["js!SBIS3.CONTROLS.Link"], function(r) {
         new r({
            element: "link",
            caption: 'This is Link',
            link: 'http://wi.sbis.ru',
            inNewTab: true,
            icon: 'sprite:icon-24 icon-Attach icon-primary action-hover'
         });

         new r({
            element : 'text',
            caption : 'Расчеты и среднесписочная численность'
         })
      });

      require(["js!SBIS3.Engine.SwitcherDoubleOnline"], function (r) {
         new r({
            element: "Switcher1",
            caption: 'This is SwitcherDoubleOnline',
            stateOn: 'По видам',
            stateOff: 'По подразделениям'
         });

         new r({
            element: "Switcher12",
            caption: 'This is SwitcherDoubleOnline',
            stateOn: 'По видам',
            stateOff: 'По подразделениям',
            enabled: false
         });

         new r({
            element: "Switcher2",
            caption: 'This is SwitcherDoubleOnline',
            stateOn: 'По видам',
            stateOff: 'По подразделениям',
            'disposition': 'vertical'
         });

         new r({
            element: "Switcher22",
            caption: 'This is SwitcherDoubleOnline',
            stateOn: 'По видам',
            stateOff: 'По подразделениям',
            'disposition': 'vertical',
            enabled: false
         })
      });

      require(["js!SBIS3.CONTROLS.Switcher"], function (r) {
         new r({
            element: "Switcher3",
            caption: 'This is Switcher',
            stateOn: 'On',
            stateOff: 'Off'
         });
         new r({
            element: "Switcher32",
            caption: 'This is Switcher',
            stateOn: 'On',
            stateOff: 'Off',
            enabled: false
         })
      });

      require(["js!SBIS3.CONTROLS.IconButton"], function (r) {
         new r({
            element: "buttonIcon",
            icon: 'sprite:icon-24 icon-AddButton icon-primary action-hover'
         });
         new r({
            element: "buttonIcon2",
            icon: 'sprite:icon-24 icon-AddButton icon-primary action-hover'
         });

         new r({
            element : 'icon',
            icon: 'sprite:icon-16 icon-Payment icon-primary  action-hover'
         });
      });

      require(["js!SBIS3.CONTROLS.DatePicker"], function (r) {
         new r({
            element: "FormattedTextBox"
         });
      });


      require(["js!SBIS3.CONTROLS.RadioButton"], function (r) {
         new r({
            element: "RadioButton",
            caption: 'Оперативный срез'
         });
         new r({
            element: "RadioButton2",
            caption: 'Оперативный срез enabled',
            enabled: false
         })
      });

      require(["js!SBIS3.CONTROLS.CheckBox"], function (r) {
         new r({
            element: "CheckBox",
            caption: 'Флаг'
         });

         new r({
            element: "CheckBox2",
            caption: 'Флаг enabled',
            enabled: false
         })
      });

      require(["js!SBIS3.CONTROLS.MenuItem"], function (r) {
         new r({
            element: "MenuItem",
            caption: 'Пункт меню'
         });
      });

      require(["js!SBIS3.CONTROLS.TextBox"], function (r) {
         new r({
            element: "TextBox",
            placeholder: 'This is TextBox',
            handlers : {
               'onTextChange' : function(e, val) {
                  console.log(val)
               }
            }
         });

         new r({
            element: "TextBox2",
            placeholder: 'This is TextBox enabled',
            enabled: false
         })
      });

      require(["js!SBIS3.CONTROLS.TextArea"], function (r) {
         new r({
            element: "TextArea",
            text: 'This is TextBox',
            minLinesCount : 5
         });
      });

      require(["js!SBIS3.CONTROLS.ComboBox"], function (r) {
         new r({
            element: "ComboBox",
            editable : false,
            items : [
               {
                  key : 1,
                  title : 'Первый'
               },
               {
                  key : 2,
                  title : 'Второй'
               },
               {
                  key : 3,
                  title : 'Третий'
               }
            ]
         });

         new r({
            element: "ComboBox2",
            editable : true,
            items : [
               {
                  key : 1,
                  title : 'Первый'
               },
               {
                  key : 2,
                  title : 'Второй'
               },
               {
                  key : 3,
                  title : 'Третий'
               }
            ]
         })
      });

      require(["js!SBIS3.CONTROLS.NumberTextBox"], function (r) {
         new r({
            element: "NumberTextBox",
            text: '666'
         })
      });

      require(["js!SBIS3.CONTROLS.Button"], function (r) {
         new r({
            element: "button1",
            caption: 'Сохранить',
            primary: true
         });

         new r({
            element: "button2",
            caption: 'Траль',
            tooltip : 'Лалала',
            icon : 'sprite:icon-16 icon-Alert icon-primary'
         });

         new r({
            element: "button3",
            caption: 'Сохранить',
            enabled: false
         });

         new r({
            element: "coreButton",
            caption: 'Сохранить',
            primary: true
         });

         new r({
            element: "button2big",
            caption: 'Удалить'
         });

         new r({
            element: "button3big",
            caption: 'Сохранить',
            enabled: false
         });

         new r({
            element: "buttonlight",
            caption: 'Утвердить',
            primary:true,
            icon: "sprite:icon-16 icon-Successful icon-done"
         });

         new r({
            element: "buttonlight2",//zButton1
            caption: 'Отклонить',
            icon:'sprite:icon-16 icon-Unsuccess icon-error'
         });

         //Зуев
         new r({
            element: "zButton1",
            caption: '123',
            icon:'sprite:icon-16 icon-Unsuccess icon-error'
         });
         new r({
            element: "zButton2",
            caption: 'Отклонить какую то весчь',
            icon:'sprite:icon-16 icon-Unsuccess icon-error'
         });
         new r({
            element: "zButton3",
            caption: '*',
            icon:'sprite:icon-16 icon-Unsuccess icon-error'
         });
      });

      require(["js!SBIS3.CONTROLS.ToggleButton"], function (r) {
         new r({
            element: "ToggleButton",
            caption: 'Переключаемая',
            icon : 'sprite:icon-24 icon-IPmask icon-primary'
         });

         new r({
            element: "ToggleButton2",
            caption: 'Переключаемая',
            primary: true
         });

         new r({
            element: "ToggleButtonbig",
            caption: 'Переключаемая'
         });

         new r({
            element: "ToggleButton2big",
            caption: 'Переключаемая',
            primary: true
         })
      });
   });

   require(["js!SBIS3.CORE.Button"], function (r) {
      new r({
         element: "coreButton",
         caption: 'Сохранить'
      });
   });
});

function initMenus() {
   require([
      'js!SBIS3.CONTROLS.ContextMenu',
      'js!SBIS3.CONTROLS.Menu',
      'js!SBIS3.CONTROLS.Button',
      'js!SBIS3.CONTROLS.MenuButton'
   ], function(
      ContextMenu,
      Menu,
      Button,
      MenuButton
   ) {
      var items = [
         {
            id : 1,
            title : 'Title 1',
            icon : 'sprite:icon-16 icon-Successful icon-done'
         },
         {
            id : 2,
            title : 'Title 2',
            icon: 'sprite:icon-16 icon-Successful icon-error'
         },
         {
            id : 3,
            title : 'Title 3',
            icon: 'sprite:icon-16 icon-Successful icon-done'
         },
         {
            id : 4,
            title : 'Title 4',
            icon : 'sprite:icon-16 icon-Successful icon-done',
            par : 2
         },
         {
            id : 5,
            title : 'Title 5',
            icon : 'sprite:icon-16 icon-Phone icon-done',
            par : 4
         },
         {
            id : 6,
            title : 'Title 6',
            icon : 'sprite:icon-16 icon-Successful icon-done',
            par : 4
         },
         {
            id : 7,
            title : 'Title 7',
            icon : 'sprite:icon-16 icon-Successful icon-done',
            par : 2
         },
         {
            id : 8,
            title : 'Title 8',
            icon : 'sprite:icon-16 icon-Successful icon-done',
            par : 2
         },
         {
            id : 9,
            title : 'Поросенок',
            icon : 'sprite:icon-16 icon-Successful icon-done'
         },
         {
            id : 10,
            title : 'Петр',
            icon : 'sprite:icon-16 icon-Successful icon-done'
         },
         {
            id : 11,
            title : 'Трактор',
            icon : 'sprite:icon-16 icon-Successful icon-done'
         }
      ];

      new Button({
         element: 'menuButton',
         caption: 'Show menu',
         handlers : {
            onActivated : function() {
               menuCtx.show();
            }
         }
      });

      var menuCtx = new ContextMenu({
         element: "menu",
         items: items,
         target : $("#menuButton"),
         corner : 'br',
         hierField: 'par',
         verticalAlign: {
            side: 'top',
            offset: 3
         },
         horizontalAlign: {
            side: 'right',
            offset: 0
         },
         closeByExternalClick: true
      });

      new MenuButton({
         element: 'menuDropdownButton',
         items: items,
         hierField: 'par',
         caption: 'Show dropdown menu'
      });

      new MenuButton({
         element: 'menuDropdownButtonPrimary',
         primary: true,
         items: items,
         hierField: 'par',
         caption: 'Show dropdown menu'
      });

      var menu = new Menu({
         element: "menuBar",
         items: items,
         hierField : 'par',
         firstLevelDirection : 'right'
      });

      require(["js!SBIS3.CONTROLS.Link"], function (r) {
         new r({
            element: "Back",
            caption: 'Назад',
            href: '../../',
            icon: 'sprite:icon-16 icon-DayBackward icon-primary'
         })
      });
   });
}