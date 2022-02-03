import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {constants} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {focusNextElement, findNextElement} from 'UI/Focus';
import template = require('wml!Controls/_form/FocusWithEnter/FocusWithEnter');
import {default as WorkByKeyboardContext} from '../Context/WorkByKeyboardContext';

/**
 * Контроллер, который обрабатывает нажатие клавиши enter и переводит фокус на след. поле ввода.
 * @extends UI/Base:Control
 * @public
 * @author Мочалов М.А.
 */

export default class FocusWithEnter extends Control<IControlOptions> {
    _template: TemplateFunction = template;

    protected _beforeMount(options: IControlOptions, context: object): void {
        // Есть проблема, когда передается не класс, а инстанс класса. С чем это связано не понятно.
        // Поэтому на всякий случай делаем дополнительную проверку
        // todo удалить после перехода на реакт
        // https://online.sbis.ru/opendoc.html?guid=f0b77590-36da-435c-81e6-a71ee6dc4f95
        if (context.workByKeyboard && typeof context.workByKeyboard !== 'function') {
            context.workByKeyboard.setStatus(true);
        }
    }

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
                focusNextElement(false, current, {enableScrollToElement: 'vertical'});
            }
        }
    }

    /**
     * Проверяет, может ли элемент быть сфокусирован по ENTER
     * @param {HTMLElement} target Проверяемый html-элемент
     */
    _isFocusable(target: HTMLElement): boolean {
        // TODO: Пропускаю кнопки при обходе по ENTER:
        // tslint:disable-next-line
        // https://online.sbis.ru/open_dialog.html?guid=5e1a9e18-3941-4725-8963-9a8fff7eec9f&user=321880e7-f6f6-463a-849b-8649be2b6dfc
        return target && !target.closest('.controls-BaseButton');
    }

    static contextTypes(): object {
        return {
            workByKeyboard: WorkByKeyboardContext
        };
    }
}
