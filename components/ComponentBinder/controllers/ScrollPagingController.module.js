define('js!SBIS3.CONTROLS.ScrollPagingController', 
   [
      'js!SBIS3.StickyHeaderManager',
      'Core/Abstract',
      'Core/core-instance',
      'Core/WindowManager',
      'Core/helpers/Function/throttle',
      'css!SBIS3.CONTROLS.ScrollPagingController'
   ],
   function(StickyHeaderManager, cAbstract, cInstance, WindowManager, throttle) {

   var SCROLL_THROTTLE_DELAY = 200;
   
   var ScrollPagingController = cAbstract.extend({
      $protected: {
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
             isTree = cInstance.instanceOfMixin(view, 'SBIS3.CONTROLS.TreeMixin');
        
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
         var page = scrollTop / this._viewportHeight;
         if (!(page % 1)) {
            page += 1;
         } else {
            page = Math.ceil(page);
            if (page + 1 === this._options.paging.getPagesCount()) {
               page += 1;
            }
         }
         if (this._currentScrollPage !== page) {
            this._currentScrollPage = page;
            this._options.paging.setSelectedKey(page);
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
         return this._scrollPages[this._currentScrollPage];
      },

      updatePaging: function() {
         this._updateCachedSizes();

         var pagesCount = Math.ceil(this._viewHeight / this._viewportHeight);
         this._options.view.getContainer().toggleClass('controls-ScrollPaging__pagesPadding', pagesCount > 1);
         if (this._options.paging.getSelectedKey() > pagesCount){
            this._options.paging.setSelectedKey(pagesCount);
         }
         if (!this._options.paging.getItems() || (this._options.paging.getItems().getCount() != pagesCount)) {
            this._options.paging.setPagesCount(pagesCount);
         }

         //Если есть страницы - покажем paging

         this._options.paging.setVisible((pagesCount > 1) && !this._options.hiddenPager);
      },

      _updateCachedSizes: function(){
         var view, viewport;
         view = this._options.view;
         this._viewHeight = view.getContainer().height();
         viewport = $(view._scrollWatcher.getScrollContainer());
         this._viewportHeight = viewport.height();

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