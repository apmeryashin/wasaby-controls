/**
 * Created by dv.zuev on 25.12.2017.
 */
define('Controls/Application',
   [
      'Core/Control',
      'wml!Controls/Application/Page',
      'Core/Deferred',
      'Core/BodyClasses',
      'Env/Env',
      'Controls/Application/AppData',
      'Controls/scroll',
      'Core/LinkResolver/LinkResolver',
      'Core/helpers/getResourceUrl',
      'Application/Env',
      'Controls/decorator',
      'Core/Themes/ThemesController',
      'css!theme?Controls/Application/Application'
   ],

   /**
    * Корневой контрол для Wasaby-приложений. Служит для создания базовых html-страниц.
    * Подробнее читайте <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/controls-application/'>здесь</a>.
    *
    * @class Controls/Application
    * @extends Core/Control
    *
    * @mixes Controls/Application/BlockLayout/Styles
    *
    * @control
    * @public
    * @author Белотелов Н.В.
    */

   /*
    * Root component for WS applications. Creates basic html page.
    *
    * @class Controls/Application
    * @extends Core/Control
    *
    * @mixes Controls/Application/BlockLayout/Styles
    *
    * @control
    * @public
    * @author Белотелов Н.В.
    */    

   /**
    * @name Controls/Application#staticDomains
    * @cfg {Number} Список, содержащий набор доменов для загрузки статики.
    * Список доменов решает задачу загрузки статических ресурсов с нескольких документов. Эти домены будут использоваться для создания путей для статических ресурсов и распределения загрузки для нескольких статических доменов.
    */

   /*
    * @name Controls/Application#staticDomains
    * @cfg {Number} The list of domains for distributing static resources. These domains will be used to create paths
    * for static resources and distribute downloading for several static domains.
    * There will be another way to propagate this data after this problem:
    * https://online.sbis.ru/opendoc.html?guid=d4b76528-b3a0-4b9d-bbe8-72996d4272b2
    */

   /**
    * @name Controls/Application#head
    * @deprecated Используйте {@link headJson}.
    * @cfg {Content} Дополнительное содержимое тега HEAD. Может принимать более одного корневого узла.
    */

   /*
    * @name Controls/Application#head
    * @deprecated Используйте {@link headJson}.
    * @cfg {Content} Additional content of HEAD tag. Can accept more than one root node
    */

   /**
    * @name Controls/Application#headJson
    * @cfg {Content} Разметка, которая будет встроена в содержимое тега head. 
    * Используйте эту опцию, чтобы подключить на страницу внешние библиотеки (скрипты), стили или шрифты.
    * @remark
    * Список разрешённых тегов: link, style, script, meta, title.
    * Список разрешённых атрибутов: rel, as, name, sizes, crossorigin, type, href, property, http-equiv, content, id, class. 
    */

   /**
    * @name Controls/Application#content
    * @cfg {Content} Разметка, которая будет встроена в содержимое тега body.
    */

   /*
    * @name Controls/Application#content
    * @cfg {Content} Content of BODY tag
    */

   /**
    * @name Controls/Application#scripts
    * @cfg {Content} Список JS-файлов, которые должны быть подключены на страницу. Скрипты встраиваются перед закрытием. Могут принимать более одного корневого узла.
    */

   /*
    * @name Controls/Application#scripts
    * @cfg {Content} Scripts, that will be pasted after content. Can accept more than one root node
    */

   /**
    * @name Controls/Application#appRoot
    * @cfg {String} Адрес к директории сервиса. Например, "/".
    * @remark
    * Значение опции задаётся относительно URL-адреса сервиса.
    * URL-адрес сервиса устанавливается через <a href="https://wi.sbis.ru/doc/platform/developmentapl/middleware/cloud-control/">Сервис управления облаком</a> в разделе "Структура облака".
    * Данная настройка попадает в свойство appRoot объекта window.wsConfig.
    */

   /*
    * @name Controls/Application#appRoot
    * @cfg {String} Path to application root url
    */

   /**
    * @name Controls/Application#resourceRoot
    * @cfg {String} Адрес к директории с ресурсами сервиса. Например, "/resources/".
    * @remark
    * Значение опции задаётся относительно URL-адреса сервиса.
    * URL-адрес сервиса устанавливается через <a href="https://wi.sbis.ru/doc/platform/developmentapl/middleware/cloud-control/">Сервис управления облаком</a> в разделе "Структура облака".
    * Данная настройка попадает в свойство resourceRoot объекта window.wsConfig.
    */

   /*
    * @name Controls/Application#resourceRoot
    * @cfg {String} Path to resource root url
    */

   /**
    * @name Controls/Application#wsRoot
    * @cfg {String} Путь к корню интерфейсного модуля WS.Core. Например, "/resources/WS.Core/".
    * @remark
    * Значение опции задаётся относительно URL-адреса сервиса.
    * URL-адрес сервиса устанавливается через <a href="https://wi.sbis.ru/doc/platform/developmentapl/middleware/cloud-control/">Сервис управления облаком</a> в разделе "Структура облака".
    * Данная настройка попадает в свойство wsRoot объекта window.wsConfig.
    */

   /*
    * @name Controls/Application#wsRoot
    * @cfg {String} Path to ws root url
    */

   /**
    * @name Controls/Application#beforeScripts
    * @cfg {Boolean} В значении true скрипты из опции {@link scripts} будут вставлены до других скриптов, созданных приложением. 
    * @default false
    */

   /*
    * @name Controls/Application#beforeScripts
    * @cfg {Boolean} If it's true, scripts from options scripts will be pasted before other scripts generated by application
    * otherwise it will be pasted after.
    */

   /**
    * @name Controls/Application#viewport
    * @cfg {String} Атрибут содержимого мета-тега с именем "viewport".
    */

   /*
    * @name Controls/Application#viewport
    * @cfg {String} Content attribute of meta tag with name "viewport"
    */

   /**
    * @name Controls/Application#bodyClass
    * @cfg {String} Дополнительный CSS-класс, который будет задан для тега body.
    */

   /*
    * @name Controls/Application#bodyClass
    * @cfg {String} String with classes, that will be pasted in body's class attribute
    */

   /**
    * @name Controls/Application#title
    * @cfg {String} Значение опции встраивается в содержимое тега title, который определяет заголовок веб-страницы и подпись на вкладке веб-браузера.
    */

   /*
    * @name Controls/Application#title
    * @cfg {String} title of the tab
    */

   /**
    * @name Controls/Application#templateConfig
    * @cfg {Object} Все поля из этого объекта будут переданы в опции контента.
    */

   /*
    * @name Controls/Application#templateConfig
    * @cfg {Object} All fields from this object will be passed to content's options
    */

   /**
    * @name Controls/Application#compat
    * @cfg {Boolean} В значении true создаётся "слой совместимости" для работы с контролами из пространства имён SBIS3.CONTROLS/* и Lib/*.
    */

   /*
    * @name Controls/Application#compat
    * @cfg {Boolean} If it's true, compatible layer will be loaded
    */

   /**
    * @name Controls/Application#builder
    * @cfg {Boolean} В значении true разрешено создание статической html-страницы через <a href="https://wi.sbis.ru/doc/platform/developmentapl/development-tools/builder/#html_1">билдер</a>.
    * Необходимое условие создание таких страниц описано <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/controls-application/#static-html">здесь</a>.
    * @default false
    */

   /*
    * @name Controls/Application#builder
    * @cfg {Boolean} Allows to create static html with builder
    */

   /**
    * @name Controls/Application#builderCompatible
    * @cfg {Boolean} Загружает слой совместимости. Работает только в случае, когда опция {@link builder} в значении true.
    */

   /*
    * @name Controls/Application#builderCompatible
    * @cfg {Boolean} Will load compatible layer. Works only if builder option is true.
    */

   /**
    * @name Controls/Application#width
    * @cfg {String} Используется контролом Controls/popup:Manager.
    *
    * @css @font-size_App__body Font size of page body. This size inherits to other elements in page.
    */

   /*
    * @name Controls/Application#width
    * @cfg {String} Used by Controls.popup:Manager
    *
    * @css @font-size_App__body Font size of page body. This size inherits to other elements in page.
    */

   function(Base,
      template,
      Deferred,
      BodyClasses,
      Env,
      AppData,
      scroll,
      LinkResolver,
      getResourceUrl,
      AppEnv,
      decorator,
      ThemesController) {
      'use strict';

      var _private;

      _private = {

         /**
          * Перекладываем опции или recivedState на инстанс
          * @param self
          * @param cfg
          * @param routesConfig
          */
         initState: function(self, cfg) {
            self.templateConfig = cfg.templateConfig;
            self.compat = cfg.compat || false;
         },
         calculateBodyClasses: function() {
            // Эти классы вешаются в двух местах. Разница в том, что BodyClasses всегда возвращает один и тот же класс,
            // а TouchDetector реагирует на изменение состояния.
            // Поэтому в Application оставим только класс от TouchDetector

            var bodyClasses = BodyClasses().replace('ws-is-touch', '').replace('ws-is-no-touch', '');

            return bodyClasses;
         }
      };

      function generateHeadValidHtml() {
         // Tag names and attributes allowed in the head.
         return {
            validNodes: {
               link: true,
               style: true,
               script: true,
               meta: true,
               title: true
            },
            validAttributes: {
               rel: true,
               as: true,
               src: true,
               name: true,
               sizes: true,
               crossorigin: true,
               type: true,
               href: true,
               property: true,
               'http-equiv': true,
               content: true,
               id: true,
               'class': true
            }
         };
      }

      var linkAttributes = {
         src: true,
         href: true
      };

      var Page = Base.extend({
         _template: template,

         /**
          * @type {String} Property controls whether or not touch devices use momentum-based scrolling for inner scrollable areas.
          * @private
          */
         _scrollingClass: 'controls-Scroll_webkitOverflowScrollingTouch',

         _getChildContext: function() {
            return {
               ScrollData: this._scrollData
            };
         },

         _scrollPage: function(ev) {
            this._children.scrollDetect.start(ev);
         },

         _resizePage: function(ev) {
            this._children.resizeDetect.start(ev);
         },
         _mousedownPage: function(ev) {
            this._children.mousedownDetect.start(ev);
         },
         _mousemovePage: function(ev) {
            this._children.mousemoveDetect.start(ev);
         },
         _mouseupPage: function(ev) {
            this._children.mouseupDetect.start(ev);
         },
         _touchmovePage: function(ev) {
            this._children.touchmoveDetect.start(ev);
         },
         _touchendPage: function(ev) {
            this._children.touchendDetect.start(ev);
         },
         _touchclass: function() {
            // Данный метод вызывается из вёрстки, и при первой отрисовке еще нет _children (это нормально)
            // поэтому сами детектим touch с помощью compatibility
            return this._children.touchDetector
               ? this._children.touchDetector.getClass()
               : Env.compatibility.touch
                  ? 'ws-is-touch'
                  : 'ws-is-no-touch';
         },

         /**
          * Код должен быть вынесен в отдельных контроллер в виде хока в 610.
          * https://online.sbis.ru/opendoc.html?guid=2dbbc7f1-2e81-4a76-89ef-4a30af713fec
          */
         _popupCreatedHandler: function() {
            this._isPopupShow = true;

            this._changeOverflowClass();
         },

         _popupDestroyedHandler: function(event, element, popupItems) {
            if (popupItems.getCount() === 0) {
               this._isPopupShow = false;
            }

            this._changeOverflowClass();
         },

         _suggestStateChangedHandler: function(event, state) {
            this._isSuggestShow = state;

            this._changeOverflowClass();
         },

         /** ************************************************** */

         _changeOverflowClass: function() {
            if (Env.detection.isMobileIOS) {
               if (this._isPopupShow || this._isSuggestShow) {
                  this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingAuto';
               } else {
                  this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingTouch';
               }
            } else {
               this._scrollingClass = '';
            }
         },

         _beforeMount: function(cfg) {
            this.BodyClasses = _private.calculateBodyClasses;
            this._scrollData = new scroll._scrollContext({pagingVisible: cfg.pagingVisible});
            this.headJson = cfg.headJson;
            this.headValidHtml = generateHeadValidHtml();

            if (typeof window !== 'undefined') {
               if (document.getElementsByClassName('head-custom-block').length > 0) {
                  this.head = undefined;
                  this.headJson = undefined;
                  this.headValidHtml = undefined;
               }
            }
         },

         _afterMount: function() {
            if (!Env.detection.isMobilePlatform) {
               this.activate();
            }
         },

         _beforeUpdate: function(cfg) {
            if (this._scrollData.pagingVisible !== cfg.pagingVisible) {
               this._scrollData.pagingVisible = cfg.pagingVisible;
               this._scrollData.updateConsumers();
            }
         },

         _afterUpdate: function(oldOptions) {
            var elements = document.getElementsByClassName('head-title-tag');
            if (elements.length === 1) {
               // Chrome на ios при вызове History.replaceState, устанавливает в title текущий http адрес.
               // Если после загрузки установить title, который уже был, то он не обновится, и в заголовке вкладки
               // останется http адрес. Поэтому сначала сбросим title, а затем положим туда нужное значение.
               if (Env.detection.isMobileIOS && Env.detection.chrome && oldOptions.title === this._options.title) {
                  elements[0].textContent = '';
               }
               elements[0].textContent = this._options.title;
            }
         },

         headTagResolver: function(value, parent) {
            var newValue = decorator.noOuterTag(value, parent),
               attributes = Array.isArray(newValue) && typeof newValue[1] === 'object' &&
                  !Array.isArray(newValue[1]) && newValue[1];
            if (attributes) {
               for (var attributeName in attributes) {
                  if (attributes.hasOwnProperty(attributeName)) {
                     var attributeValue = attributes[attributeName];
                     if (typeof attributeValue === 'string' && linkAttributes[attributeName]) {
                        attributes[attributeName] = getResourceUrl(attributeValue);
                     }
                  }
               }
            }
            return newValue;
         },

         _keyPressHandler: function(event) {
            if (this._isPopupShow) {
               if (Env.constants.browser.safari) {
                  // Need to prevent default behaviour if popup is opened
                  // because safari escapes fullscreen mode on 'ESC' pressed
                  // TODO https://online.sbis.ru/opendoc.html?guid=5d3fdab0-6a25-41a1-8018-a68a034e14d9
                  if (event.nativeEvent && event.nativeEvent.keyCode === 27) {
                     event.preventDefault();
                  }
               }
            }
         }
      });

      Page.getDefaultOptions = function() {
         return {
            title: '',
            pagingVisible: false
         };
      };

      return Page;
   });
