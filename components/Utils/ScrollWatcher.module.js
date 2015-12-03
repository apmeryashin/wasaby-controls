/**
 * Created by ad.chistyakova on 12.11.2015.
 */
define('js!SBIS3.CONTROLS.ScrollWatcher', [], function() {
   'use strict';
   var SCROLL_INDICATOR_HEIGHT = 32;
   if (typeof(jQuery) !== 'undefined') {
      (function( $ ) {
         $.fn.wsScrollWatcher = function() {
            var scrollWatcher = null;
            try {
               scrollWatcher = this[0].wsScrollWatcher;
            }
            catch(e) {}
            return scrollWatcher;
         };

      })( jQuery );
   }
   $ws.proto.ScrollWatcher = $ws.proto.Abstract.extend(/** @lends SBIS3.CONTROLS.ScrollWatcher.prototype */{
      $protected: {
         _options: {
            /**
             * @cfg {jQuery} 
             */
            element : undefined,
            /**
             * @cfg{String}
             * Тип "Отслеживателя": container, window, floatArea
             */
            type : 'container',
            /**
             * Если нужно отслеживать скролл во FloatArea, то ее нужно передать
             */
            floatArea: undefined,
            /**
             * @cfg {function} Пользовательская функция, которая будет вызвана по событию скролла.
             * Здесь можно написать какую-то свою проверку. Например, что мы доскроллили вверх по контейнеру
             */
            scrollCheck: undefined
         },
         _onWindowScrollHandler : undefined,
         _floatAreaScrollHandler : undefined,
         _onContainerScrollHandler: undefined
      },

      $constructor: function() {
         var self = this;
         this._publish('onScroll');
         if (this._inContainer()) {
            this._options.element.wsScrollWatcher = this;
            this._options.element.addClass('ws-ScrollWatcher');
         }

         var topParent = this._options.floatArea;

         //В зависимости от настроек высоты подписываемся либо на скролл у окна, либо у контейнера
         if (this._inContainer() && this._options.element) {
            this._onContainerScrollHandler =  this._onContainerScroll.bind(this);
            this._options.element.bind('scroll.wsScrollWatcher', this._onContainerScrollHandler);
         } else if (this._inWindow()) {
            this._onWindowScrollHandler = this._onWindowScroll.bind(this);
            $(window).bind('scroll.wsScrollWatcher', this._onWindowScrollHandler);
         } else if (this._inFloatArea() && $ws.helpers.instanceOfModule(topParent, 'SBIS3.CORE.FloatArea')) {
            //Если браузер лежит на всплывающей панели и имеет автовысоту, то скролл появляется у контейнера всплывашки (.parent())
            this._floatAreaScrollHandler = this._onFAScroll.bind(this);
            topParent.subscribe('onScroll', this._floatAreaScrollHandler);
            topParent.subscribe('onDestroy', function(){
               self.destroy();
            });
         }
      },
      _inFloatArea: function(){
         return this._options.type === 'floatArea';
      },
      _inContainer: function(){
         return this._options.type === 'container';
      },
      _inWindow: function(){
         return this._options.type === 'window';
      },
      _notifyOnScroll: function (type, result) {
         var userResult;
         //Если была пройдена пользовательская проверка, то оповестим пользователя.
         if (typeof  this._options.scrollCheck === 'function') {
            userResult = this._options.scrollCheck.bind(this)();
            if (userResult) {
               this._notify('onScroll', 'userCheck');
            }
         }
         if (result) {
            this._notify('onScroll', type);
         }
      },
      _onWindowScroll: function (event) {
         this._notifyOnScroll('windowBottom', this._isBottomOfPage());
      },
      _onFAScroll: function(event, scrollOptions) {
         this._notifyOnScroll('floatAreaBottom', scrollOptions.clientHeight + scrollOptions.scrollTop >= scrollOptions.scrollHeight - $ws._const.Browser.minHeight);
      },
      _onContainerScroll: function () {
         //TODO неправильная проверка this._options.element.offset().top < this._options.element.height()
         this._notifyOnScroll('containerBottom', false);
      },
      _isBottomOfPage: function () {
         var docBody = document.body,
            docElem = document.documentElement,
            clientHeight = Math.min(docBody.clientHeight, docElem.clientHeight),
            scrollTop = Math.max(docBody.scrollTop, docElem.scrollTop),
            scrollHeight = Math.max(docBody.scrollHeight, docElem.scrollHeight);
         return (clientHeight + scrollTop >= scrollHeight - SCROLL_INDICATOR_HEIGHT);//Учитываем отступ снизу на высоту картинки индикатора загрузки
      },
      //TODO есть вариант, когда захотят останавливать и запускать отслеживание скролла. Как понадобится сделаем.
      //start : function(){},
      //stop : function(){},
      destroy: function(){
         if (this._inWindow()) {
            $(window).unbind('scroll.wsScrollWatcher', this._onWindowScrollHandler);
            this._onWindowScrollHandler = undefined;
         }
         $ws.proto.ScrollWatcher.superclass.destroy.call(this);
      }

   });
   return  $ws.proto.ScrollWatcher;
});