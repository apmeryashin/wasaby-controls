/**
 * Библиотека контролов, которые позволяют организовать скроллирование областей. Содержит контейнер для скроллирования и механизм фиксации заголовков.
 * @library
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Search library
 * @library
 * @public
 * @author Крайнов Д.О.
 */

import Container from 'Controls/_scroll/ScrollContextConsumer';
export {default as StickyBlock} from 'Controls/_scroll/StickyBlock';
export {scrollToElement} from 'Controls/_scroll/Utils/scrollToElement';
export {SCROLL_DIRECTION} from 'Controls/_scroll/Utils/Scroll';
export {hasScrollbar} from './_scroll/Utils/HasScrollbar';
export {hasHorizontalScroll} from './_scroll/Utils/hasHorizontalScroll';
export {IScrollState} from './_scroll/Utils/ScrollState';
export {IScrollbars} from './_scroll/Container/Interface/IScrollbars';
export {IShadows, SHADOW_MODE} from './_scroll/Container/Interface/IShadows';
export {getScrollbarWidth, getScrollbarWidthByMeasuredBlock} from './_scroll/Utils/getScrollbarWidth';
import {default as _Scrollbar} from 'Controls/_scroll/Scroll/Scrollbar';
import _scrollContext from 'Controls/_scroll/Scroll/Context';
import ScrollContextProvider from 'Controls/_scroll/ScrollContextProvider';
import _stickyHeaderController from 'Controls/_scroll/StickyBlock/Controller';
import IntersectionObserverController from 'Controls/_scroll/IntersectionObserver/Controller';
import IntersectionObserverContainer from 'Controls/_scroll/IntersectionObserver/Container';
import EdgeIntersectionObserver from 'Controls/_scroll/IntersectionObserver/EdgeIntersectionObserver';
import EdgeIntersectionObserverContainer from 'Controls/_scroll/IntersectionObserver/EdgeIntersectionContainer';
import IntersectionObserverSyntheticEntry from 'Controls/_scroll/IntersectionObserver/SyntheticEntry';
import _ContainerBase, { IInitialScrollPosition } from 'Controls/_scroll/ContainerBase';
import VirtualScrollContainer from 'Controls/_scroll/VirtualScrollContainer';
import {SHADOW_VISIBILITY} from 'Controls/_scroll/Container/Interface/IShadows';

import Group from 'Controls/_scroll/StickyBlock/Group';
import {isStickySupport, getNextId as getNextStickyId, getOffset as getStickyOffset, IFixedEventData} from 'Controls/_scroll/StickyBlock/Utils';
import {getHeadersHeight as getStickyHeadersHeight} from 'Controls/_scroll/StickyBlock/Utils/getHeadersHeight';
import HotKeysContainer from 'Controls/_scroll/HotKeysContainer';

export {
   Container,
   ScrollContextProvider,
   _Scrollbar,
   _scrollContext,
   _stickyHeaderController,
   isStickySupport,
   getNextStickyId,
   getStickyOffset,
   getStickyHeadersHeight,
   Group,
   HotKeysContainer,
   IntersectionObserverController,
   IntersectionObserverContainer,
   EdgeIntersectionObserver,
   EdgeIntersectionObserverContainer,
   IntersectionObserverSyntheticEntry,
   VirtualScrollContainer,
   _ContainerBase,
   SHADOW_VISIBILITY,
   IFixedEventData,
   IInitialScrollPosition
};
