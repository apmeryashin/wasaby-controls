import cInstance = require('Core/core-instance');
import {DimensionsMeasurer, getDimensions} from 'Controls/sizeUtils';
import {getGapFixSize, POSITION, TYPE_FIXED_HEADERS} from 'Controls/_scroll/StickyBlock/Utils';
import {goUpByControlTree} from 'UI/NodeCollector';
import {IControl} from 'UICommon/interfaces';

const SCROLL_CONTAINERS_SELECTOR = '.controls-Scroll, .controls-Scroll-Container';

enum SCROLL_POSITION {
   top = 'top',
   bottom = 'bottom',
   center = 'center',
}

function getScrollableParents(element: HTMLElement, stickyHeaderElement: Element): HTMLElement[] {
   let scrollableParents: HTMLElement[] = [];
   let currentElement = element.parentElement;

   while (currentElement) {
      let currentStyle = window.getComputedStyle(currentElement);

      if ((currentStyle.overflowY === 'auto'
          || currentStyle.overflowY === 'scroll'
          //TODO fix for Container/Scroll, which has "overflow: hidden" in content block while mounting
          || currentElement.className.indexOf('controls-Scroll__content_hidden') >= 0)
          // Элемент может находиться в полупустом скролл контейнере, который находится в стики блоке.
          && (currentElement.scrollHeight > currentElement.clientHeight || stickyHeaderElement)) {
         scrollableParents.push(currentElement);
      }

      currentElement = currentElement.parentElement;
   }

   return scrollableParents;
}

function getOffset(element: HTMLElement): { top: number; bottom: number } {
   if (element === document.body || element === document.documentElement) {
      const elementDimensions = DimensionsMeasurer.getElementDimensions(element);
      const bodyDimensions = DimensionsMeasurer.getElementDimensions(document.body);
      return {
         top: bodyDimensions.scrollTop,
         bottom: elementDimensions.clientHeight
      };
   } else {
      let { top, height } = getDimensions(element);
      // В IE, в отличие от Chrome, getBoundingClientRect возвращает нецелочисленные значения top
      top = Math.round(top);

      const windowDimensions = DimensionsMeasurer.getWindowDimensions(element);

      return {
         top: top + windowDimensions.pageYOffset,
         bottom: top + height + windowDimensions.pageYOffset
      };
   }
}

function getStickyHeaderHeight(scrollableElement: HTMLElement): { top: number; bottom: number; topWithOffset: number } {
   const scrollControlNode: HTMLElement = scrollableElement.closest(SCROLL_CONTAINERS_SELECTOR);
   if (scrollControlNode) {
      const controls = goUpByControlTree(scrollControlNode);
      const scrollContainer =
          controls.find((control: IControl) => cInstance.instanceOfModule(control, 'Controls/scroll:Container'));

      if (scrollContainer) {
         return {
            top: scrollContainer.getHeadersHeight(POSITION.top, TYPE_FIXED_HEADERS.fixed),
            topWithOffset: scrollContainer.getHeadersHeight(POSITION.top, TYPE_FIXED_HEADERS.fixed, false),
            bottom: scrollContainer.getHeadersHeight(POSITION.bottom, TYPE_FIXED_HEADERS.fixed)
         };
      }
   }
   return { top: 0, bottom: 0, topWithOffset: 0 };
}

function getCenterOffset(parentElement: HTMLElement, element: HTMLElement): number {
   const elementHeight: number = getDimensions(element).height;
   const parentHeight: number = getDimensions(parentElement).height;
   return (parentHeight - elementHeight)/2;
}

/**
 * Модуль с функциями без классов.
 * @module
 */

/**
 * Позволяет проскроллить содержимое, находящееся внутри родительского скролл-контейнера, к выбранному элементу, сделав его видимым.
 * @param {HTMLElement} element DOM-элемент, к которому нужно проскроллить содержимое.
 * @param {boolean|String} toBottomOrPosition Определяет, должен ли быть виден нижний край контейнера. Допустимые значения: top, bottom, center.
 * @param {boolean} force
 * * true — позволяет прокручивать элемент вверх/вниз в области прокрутки, безоговорочно.
 * * false — элемент будет прокручиваться только в случае, если он частично или полностью скрыт за пределами области прокрутки.
 *
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * import {scrollToElement} from 'Controls/scroll';
 * 
 * _onClick(): void {
 *    scrollToElement(this._children.child, true);
 * }
 * </pre>
 */

export function scrollToElement(element: HTMLElement, toBottomOrPosition?: Boolean | SCROLL_POSITION, force?: Boolean): void {
   // TODO: переделать аргумент toBottom в position https://online.sbis.ru/opendoc.html?guid=4693dfce-f11d-4792-b62d-9faf54564553
   const position: SCROLL_POSITION = toBottomOrPosition === true ? SCROLL_POSITION.bottom : toBottomOrPosition;
   const stickyHeaderClass = 'controls-StickyHeader';
   // Элемент, к которому нужно подскролить, может находиться в стики блоке.
   const outerStickyHeaderElement = element.closest(`.${stickyHeaderClass}`);
   const scrollableParent = getScrollableParents(element, outerStickyHeaderElement);
   for (const parent of scrollableParent) {
      const
         elemToScroll = parent === document.documentElement ? document.body : parent,
         parentOffset = getOffset(parent),
         elemOffset = getOffset(element), //Offset of the element changes after each scroll, so we can't just cache it
         stickyHeaderHeight = getStickyHeaderHeight(parent);
      // Если внутри элемента, к которому хотят подскроллиться, лежит StickyHeader или элемент является StickyHeader'ом,
      // то мы не должны учитывать высоту предыдущего заголовка, т.к. заголовок встанет вместо него
      // Рассматримается кейс: https://online.sbis.ru/opendoc.html?guid=cf7d3b3a-de34-43f2-ad80-d545d462602b, где все
      // StickyHeader'ы одной высоты и сменяются друг за другом.
      let innerStickyHeaderHeight;
      if (element.classList.contains(stickyHeaderClass)) {
          innerStickyHeaderHeight = element.offsetHeight;
      } else {
          const innerStickyHeader = element.querySelector(`.${stickyHeaderClass}`);
          if (innerStickyHeader) {
              innerStickyHeaderHeight = innerStickyHeader.offsetHeight;
              innerStickyHeaderHeight -= getGapFixSize();
          }
      }
      if (innerStickyHeaderHeight) {
         const positions = ['top', 'bottom'];
         for (const position of positions) {
             // Если мы отнимаем высоту заголовка и получаем результат меьнше нуля, значит заголовок был последним.
             // В таком случае не нужно отнимать высоту.
            if (stickyHeaderHeight[position] - innerStickyHeaderHeight >= 0) {
               stickyHeaderHeight[position] -= innerStickyHeaderHeight;
            }
         }
      }

      if (force || parentOffset.bottom < elemOffset.bottom) {
         if (position === SCROLL_POSITION.center) {
            const centerOffset: number = getCenterOffset(parent, element);
            elemToScroll.scrollTop += Math.floor(elemOffset.top - parentOffset.top - stickyHeaderHeight.topWithOffset - centerOffset);
         } else if (position === SCROLL_POSITION.bottom) {
            elemToScroll.scrollTop += Math.ceil(elemOffset.bottom - parentOffset.bottom + stickyHeaderHeight.bottom);
         } else {
            // При принудительном скролировании к верху не скролируем если
            // заголовок с установленным offsetTop частично скрыт.
            // Т.е. скролируем только когда верх элемента выше свернутой шапки, или когда ниже развернутой.
            if (!force || elemOffset.top < parentOffset.top + stickyHeaderHeight.topWithOffset ||
                elemOffset.top > parentOffset.top + stickyHeaderHeight.top) {
               elemToScroll.scrollTop += Math.floor(elemOffset.top - parentOffset.top - stickyHeaderHeight.topWithOffset);
            }
         }
         // Принудительно скроллим в самый вверх или вниз, только первый родительский скролл контейнер,
         // остальные скролл контейнер, скроллим только если элемент невидим
         force = false;
      } else {
         if (parentOffset.top + stickyHeaderHeight.top > elemOffset.top) {
            if (position === SCROLL_POSITION.center) {
               const centerOffset: number = getCenterOffset(parent, element);
               elemToScroll.scrollTop -= Math.max(parentOffset.top - elemOffset.top + stickyHeaderHeight.topWithOffset + centerOffset, 0);
            } else if (position === SCROLL_POSITION.bottom) {
               elemToScroll.scrollTop -= Math.max(parentOffset.bottom - elemOffset.bottom + stickyHeaderHeight.bottom, 0);
            } else {
               elemToScroll.scrollTop -= Math.max(parentOffset.top - elemOffset.top + stickyHeaderHeight.topWithOffset, 0);
            }
         }
      }

      // Мы подскролили к элементу, если он лежит в стики заголовке.
      if (outerStickyHeaderElement) {
         return;
      }
   }
}
