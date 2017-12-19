define('SBIS3.CONTROLS/ComponentBinder/ScrollPagingController', 
   [
      'Core/Abstract',
      'Core/core-instance',
      'Core/WindowManager',
      'Core/helpers/Function/throttle',
      'Core/helpers/Hcontrol/isElementVisible',
      'Core/detection',
      'css!SBIS3.CONTROLS.ScrollPagingController'
   ],
   function(cAbstract, cInstance, WindowManager, throttle, isElementVisible, detection) {

   var SCROLL_THROTTLE_DELAY = 200;
   
   var ScrollPagingController = cAbstract.extend({
      $protected: {
         _freezePaging: false,
         _options: {
            view: null,
            zIndex: null
         },
         _viewHeight: 0,
         _viewportHeight: 0,
         _currentScrollPage: 1,
         _windowResizeTimeout: null,
         _zIndex: null
      },

      init: function() {
         ScrollPagingController.superclass.init.apply(this, arguments);
         this._options.paging.getContainer().css('z-index', this._options.zIndex || WindowManager.acquireZIndex());
         this._options.paging._zIndex = this._options.zIndex;
         //Говорим, что элемент видимый, чтобы WindowManager учитывал его при нахождении максимального zIndex
         WindowManager.setVisible(this._options.zIndex);
         // отступ viewport от верха страницы
         this._containerOffset = this._getViewportOffset();
         this._scrollHandler = throttle.call(this, this._scrollHandler.bind(this), SCROLL_THROTTLE_DELAY, true);
      },

      _getViewportOffset: function(){
         var viewport = this._options.view._getScrollWatcher().getScrollContainer();
         if (viewport[0] == window) {
            return 0;
         } else {
            return viewport.offset().top;
         }
      },

      bindScrollPaging: function(paging) {
         var view = this._options.view,
             isTree = cInstance.instanceOfMixin(view, 'SBIS3.CONTROLS/Mixins/TreeMixin');
        
         paging = paging || this._options.paging;

         if (isTree){
            view.subscribe('onSetRoot', this._changeRootHandler.bind(this));

            view.subscribe('onNodeExpand', function(){
               this.updatePaging(true);
            }.bind(this));
         }

         paging.subscribe('onFirstPageSet', this._scrollToFirstPage.bind(this));

         paging.subscribe('onLastPageSet', this._scrollToLastPage.bind(this))
               .subscribe('onSelectedItemChange', this._pagingSelectedChange.bind(this));

         view._getScrollWatcher().subscribe('onScroll', this._scrollHandler);

         $(window).on('resize.wsScrollPaging', this._resizeHandler.bind(this));
      },

      _changeRootHandler: function(){
         var curRoot = this._options.view.getCurrentRoot();
         this._options.paging.setSelectedKey(1);
         this._options.paging.setPagesCount(1);
         this._currentScrollPage = 1;
         this.updatePaging(true);
      },

      _scrollHandler: function(event, scrollTop) {
         if (!this._freezePaging) {
            var page = scrollTop / this._viewportHeight,
                paging = this._options.paging,
                pagesCount = paging.getPagesCount();
            if (page % 1) {
               page = Math.ceil(page);
            }
            page += 1; //потому что используем нумерацию страниц с 1
            if (this._currentScrollPage !== page) {
               this._currentScrollPage = page;
               /* Текущая страница не может быть больше кол-ва страниц, установленных для paging'a.
                  Это защита от реестров с картинками, где картинки подгружаются асихнхронно и могут менять высоту view.
                  Из-за этого может возникать ситуация, когда высота списка на момент скрола стала значительно больше (вплоть до 2х страниц),
                  чем на момент отрисовки страницы. */
               paging.setSelectedKey(page > pagesCount ? pagesCount : page);
            }
         }
      },

      _pagingSelectedChange: function(e, nPage, index){
         var scrollTop = this._viewportHeight * (nPage - 1);
         if (this._currentScrollPage !==  nPage) {
            this._currentScrollPage = nPage;
            this._options.view._getScrollWatcher().scrollTo(scrollTop);
         }
      },

      _scrollToLastPage: function(){
         this._options.view.setPage(-1);
      },

      _scrollToFirstPage: function(){
         this._options.view.setPage(0);
      },

      _isPageStartVisisble: function(page){
         var top;
         if (page.element.parents('html').length === 0) {
            return false;
         }

         if (this._options.view._getScrollWatcher().getScrollContainer()[0] == window) {
            top = page.element[0].getBoundingClientRect().bottom;
         } else {
            top = page.element.offset().top + page.element.outerHeight(true) - this._containerOffset;
         }
         return top >= 0;
      },

      _resizeHandler: function(){
         var windowHeight = $(window).height();
         clearTimeout(this._windowResizeTimeout);
         if (this._windowHeight != windowHeight){
            this._windowHeight = windowHeight;
            this._windowResizeTimeout = setTimeout(function(){
               this.updatePaging(true);
            }.bind(this), 200);
         }
      },


      getScrollPage: function(){
         return this._currentScrollPage;
      },

      getPagesCount: function() {
         return this._options.paging.getPagesCount()
      },

      updatePaging: function() {
         var view = this._options.view, pagingVisibility;

         if (isElementVisible(view.getContainer())) {
            this._updateCachedSizes();

            var pagesCount = this._viewportHeight ? Math.ceil(this._viewHeight / this._viewportHeight) : 0,
               infiniteScroll = view._getOption('infiniteScroll');
            /* Пэйджинг не показываем при загрузке вверх и в обе стороны, он работает некорректно.
             Сейчас пэйджинг заточен на загрузку вниз. Код необходимо переписать. */
            pagingVisibility = pagesCount > 1 && infiniteScroll !== 'up' && infiniteScroll !== 'both';

            /* Если пэйджинг скрыт - паддинг не нужен */
            view.getContainer().toggleClass('controls-ScrollPaging__pagesPadding', pagingVisibility);
            if (this._options.paging.getSelectedKey() > pagesCount) {
               this._options.paging.setSelectedKey(pagesCount);
            }
         }
         else {
            pagingVisibility= false;
         }
         /* Для пэйджинга считаем, что кол-во страниц это:
            текущее кол-во загруженных страниц + 1, если в метаинформации рекордсета есть данные о том, что на бл есть ещё записи.
            Необходимо для того, чтобы в пэйджинге не моргала кнопка перехода к следующей странице, пока грузятся данные. */
         if (pagingVisibility) {
            this._options.paging.setPagesCount(pagesCount + (view._hasNextPage(view.getItems().getMetaData().more, view._scrollOffset.bottom, 'after') ? 1 : 0));
         }
         else {
            this._options.paging.setPagesCount(1);
         }
         
         //Если есть страницы - покажем paging
         this._options.paging.setVisible(pagingVisibility && !this._options.hiddenPager);
      },

      //когда ListView скрыт следить за скроллом и переключать пэйджинг не надо вообще
      freezePaging: function(state) {
         this._freezePaging = state;
      },

      _updateCachedSizes: function(){
         var view = this._options.view,
             viewport  = $(view._scrollWatcher.getScrollContainer())[0];
         // У window нет scrollHeight и offsetHeight, поэтому высоту получаем иначе
         this._viewHeight = viewport === window ? document.documentElement.scrollHeight : viewport.scrollHeight;
         this._viewportHeight = viewport === window ? viewport.innerHeight : viewport.offsetHeight;

         // Баг в ie. При overflow: scroll, если контент не нуждается в скроллировании, то браузер добавляет
         // 1px для скроллирования.
         if (detection.isIE && (this._viewHeight - this._viewportHeight <=1)) {
            this._viewHeight--;
         }
      },

      destroy: function(){
         this._options.view._getScrollWatcher().unsubscribe('onScroll', this._scrollHandler);
         clearTimeout(this._windowResizeTimeout);
         $(window).off('resize.wsScrollPaging');
         WindowManager.releaseZIndex(this._options.zIndex);
         ScrollPagingController.superclass.destroy.apply(this, arguments);
      }

   });

   return ScrollPagingController;

});