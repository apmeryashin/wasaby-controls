import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_scroll/ScrollContextConsumer';
import ScrollContainer from 'Controls/_scroll/Container';
import ScrollContext from 'Controls/_scroll/Scroll/Context';

interface IScrollContextConsumerContext {
   scrollContext: ScrollContext;
}

/**
 * Обёртка над scroll/Container, которая получает pagingVisible из контекста и отдаёт его в опции.
 * Если бы не публичные методы, было бы достаточно одного шаблона.
 */

/**
 * Контейнер с тонким скроллом.
 *
 * @remark
 * Контрол работает как нативный скролл: скроллбар появляется, когда высота контента больше высоты контрола. Для корректной работы контрола необходимо ограничить его высоту.
 * Для корректной работы внутри WS3 необходимо поместить контрол в контроллер Controls/dragnDrop:Compound, который обеспечит работу функционала Drag-n-Drop.
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less переменные тем оформления}
 *
 * @class Controls/_scroll/Container
 * @extends Controls/_scroll/ContainerBase
 * @implements Controls/scroll:IScrollbars
 * @implements Controls/scroll:IShadows
 *
 * @public
 * @author Миронов А.Ю.
 * @demo Controls-demo/Scroll/Container/Default/Index
 *
 */

export default class ScrollContextConsumer extends Control {
   _template: TemplateFunction = template;
   protected _children: {
      scrollContainer: ScrollContainer;
   };
   protected _pagingVisible: boolean;

   protected _beforeMount(options: unknown, context: IScrollContextConsumerContext): void {
      if (context.scrollContext) {
         this._pagingVisible = context.scrollContext.pagingVisible;
      }
   }

   protected _beforeUpdate(newOptions: unknown, newContext: IScrollContextConsumerContext): void {
      // всегда присваиваю новое значение, чтобы не костылять со сложными проверками
      this._pagingVisible = newContext.scrollContext.pagingVisible;
   }

   canScrollTo(
      ...args: Parameters<ScrollContainer['canScrollTo']>
   ): ReturnType<ScrollContainer['canScrollTo']> {
      return this._children.scrollContainer.canScrollTo(...args);
   }

   horizontalScrollTo(
      ...args: Parameters<ScrollContainer['horizontalScrollTo']>
   ): ReturnType<ScrollContainer['horizontalScrollTo']> {
      return this._children.scrollContainer.horizontalScrollTo(...args);
   }

   scrollToBottom(
      ...args: Parameters<ScrollContainer['scrollToBottom']>
   ): ReturnType<ScrollContainer['scrollToBottom']> {
      return this._children.scrollContainer.scrollToBottom(...args);
   }

   scrollToRight(
      ...args: Parameters<ScrollContainer['scrollToRight']>
   ): ReturnType<ScrollContainer['scrollToRight']> {
      return this._children.scrollContainer.scrollToRight(...args);
   }

   scrollToTop(
      ...args: Parameters<ScrollContainer['scrollToTop']>
   ): ReturnType<ScrollContainer['scrollToTop']> {
      return this._children.scrollContainer.scrollToTop(...args);
   }

   getHeadersHeight(
      ...args: Parameters<ScrollContainer['getHeadersHeight']>
   ): ReturnType<ScrollContainer['getHeadersHeight']> {
      return this._children.scrollContainer.getHeadersHeight(...args);
   }

   scrollTo(
      ...args: Parameters<ScrollContainer['scrollTo']>
   ): ReturnType<ScrollContainer['scrollTo']> {
      return this._children.scrollContainer.scrollTo(...args);
   }

   /**
    * Возвращает количество пикселей, прокрученных от верха скролл контейнера.
    * @name Controls/_scroll/Container#getScrollTop
    * @function
    */
   getScrollTop(
      ...args: Parameters<ScrollContainer['getScrollTop']>
   ): ReturnType<ScrollContainer['getScrollTop']> {
      return this._children.scrollContainer.getScrollTop(...args);
   }

   static contextTypes(): object {
      return {
         scrollContext: ScrollContext
      };
   }

   /**
    * Включает логированние событий изменения положения скролла.
    * Можно включить логирование из консоли браузера выполнив команду
    * require(['Controls/scroll'], (scroll) => {scroll.Container.setDebug(true)})
    * @param debug
    */
   static setDebug(debug: boolean): void {
       ScrollContainer.setDebug(debug);
   }
}
