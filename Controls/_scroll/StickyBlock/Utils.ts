import {detection} from 'Env/Env';
import {getDimensions} from 'Controls/sizeUtils';
import {StickyBlock} from 'Controls/scroll';

let lastId = 0;

export const enum POSITION {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right'
}

export interface IPositionOrientation {
    vertical: POSITION;
    horizontal: POSITION;
}

export const enum SHADOW_VISIBILITY {
    visible = 'visible',
    hidden = 'hidden',
    lastVisible = 'lastVisible',
    initial = 'initial'
}

export const enum SHADOW_VISIBILITY_BY_CONTROLLER {
    visible = 'visible',
    hidden = 'hidden',
    auto = 'auto',
}

/**
 * @typedef {String} TYPE_FIXED_HEADERS
 * @variant initialFixed учитываются высоты заголовков которые были зафиксированы изначально
 * @variant fixed зафиксированные в данный момент заголовки
 * @variant allFixed высота всех заголовков, если бы они были зафиксированы
 */
export const enum TYPE_FIXED_HEADERS {
    initialFixed  = 'initialFixed',
    fixed = 'fixed',
    allFixed = 'allFixed'
}

export const enum MODE {
    stackable = 'stackable',
    replaceable = 'replaceable',
    notsticky = 'notsticky'
}

export type TRegisterEventData = {
   id: number;
   inst?: StickyBlock;
   container: HTMLElement;
   position?: string;
   mode?: string;
   shadowVisibility: SHADOW_VISIBILITY;
};

export type IFixedEventData = {
   // Id заголовка
   id: number;
   // Позиция фиксации: сверху или снизу
   fixedPosition: POSITION;
   // Предыдущая позиция фиксации: сверху или снизу
   prevPosition: POSITION;
   // Режим прилипания заголовка
   mode: MODE;
   // Отображение тени у заголовка
   shadowVisible: boolean;
    // Заголовок при прикреплении и откреплении стреляет событием fixed. При прикреплении (откреплении)
    // предыдущий заголовок по факту не открепляется (прикрепляется), а перекрывается заголовком сверху,
    // но нужно инициировать событие fixed, чтобы пользовательские контролы могли обработать случившееся.
    // Флаг устанавливается дабы исключить обработку этого события в StickyHeader/Group и StickyHeader/Controller.
   isFakeFixed: boolean;
};

export interface IOffset {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

/**
 * The position property with sticky value is not supported in ie and edge lower version 16.
 * https://developer.mozilla.org/ru/docs/Web/CSS/position
 */
export function isStickySupport(): boolean {
   return !detection.isIE || detection.IEVersion > 15;
}

export function getNextId(): number {
   return lastId++;
}

export function _lastId(): number {
   return lastId - 1;
}

export function getOffset(parentElement: HTMLElement, element: HTMLElement, position: POSITION): number {
   //TODO redo after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
   parentElement = (parentElement && parentElement.get) ? parentElement.get(0) : parentElement;
   element = (element && element.get) ? element.get(0) : element;

   if (!parentElement || !element) {
        return 0;
   }

   const offset = getDimensions(element);
   const parentOffset = getDimensions(parentElement);
   if (position === 'top') {
      return offset.top - parentOffset.top;
   } else if (position === 'bottom') {
      return parentOffset.bottom - offset.bottom;
   } else if (position === 'left') {
       return offset.left - parentOffset.left;
   } else {
       return parentOffset.right - offset.right;
   }
}

export function isHidden(element: HTMLElement): boolean {
    if (!element) {
        return false;
    }

    return !!element.closest('.ws-hidden');
}
