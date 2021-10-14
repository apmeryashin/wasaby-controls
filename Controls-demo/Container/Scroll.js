define('Controls-demo/Container/Scroll',
   [
      'UI/Base',
      'Types/source',
      'wml!Controls-demo/Container/Scroll',
   ],
   function(Base, source, template) {
      var ModuleClass = Base.Control.extend({
         _template: template,
         _pagingVisible: true,
         _scrollbarVisible: true,
         _shadowVisible: true,
         _numberOfRecords: 50,
         _scrollStyleSource: null,

         _afterMount: function () {
            // ResizeObserver на Mac не реагирует на изменение padding, если не задана высота через height. Т.к ошибок
            // с неправильным отображением кнопок пагинации с боя нет (они пересчитываются при изменении размера
            // скроллируемой области), подправим демку.
            this._numberOfRecords = 51;
         },

         get shadowVisibility() {
            return this._shadowVisible ? 'auto' : 'hidden';
         }
      });

      ModuleClass._styles = ['Controls-demo/Controls-demo', 'Controls-demo/Container/Scroll'];

      return ModuleClass;
}
);
