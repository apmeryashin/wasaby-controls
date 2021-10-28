import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {constants} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {focusNextElement, findNextElement} from 'UI/Focus';
import template = require('wml!Controls/_form/FocusWithEnter/FocusWithEnter');

/**
 * Контроллер, который обрабатывает нажатие клавиши enter и переводит фокус на след. поле ввода.
 * @extends UI/Base:Control
 * @public
 * @author Таранин С.М.
 */

export default class PrimaryAction extends Control<IControlOptions> {
   _template: TemplateFunction = template;

   protected keyDownHandler(e: SyntheticEvent<KeyboardEvent>): void {
      const enterPressed = e.nativeEvent.keyCode === constants.key.enter;
      const altOrShiftPressed = e.nativeEvent.altKey || e.nativeEvent.shiftKey;
      const ctrlPressed = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;

      if (!altOrShiftPressed && !ctrlPressed && enterPressed) {
         e.stopPropagation();

         let current;

         // Для исключения зацикливания, ограничиваем количество попыток найти элемент для фокусировки
         const maxFindAttemptNumber = 100;
         let index = 0;

         // Ищем элемент для фокусировки
         let target: HTMLElement = findNextElement();

         while (target && !this._isFocusable(target) && index < maxFindAttemptNumber) {
            current = target;
            target = findNextElement(false, current);
            index++;
         }

         // Не переводим фокус, если не нашли элемент за приемлемое количество попыток
         if (target && index !== maxFindAttemptNumber) {
            focusNextElement(false, current);
         }
      }
   }

   /**
    * Проверяет, может ли элемент быть сфокусирован по ENTER
    * @param {HTMLElement} target Проверяемый html-элемент
    */
   _isFocusable(target: HTMLElement): boolean {
      return target && !!(target instanceof HTMLInputElement || target.closest('.controls-ComboBox') ||
         target.closest('.controls-Lookup'));
   }
}
