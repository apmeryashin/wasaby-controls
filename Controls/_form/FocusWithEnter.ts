import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {constants} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {focusNextElement, findNextElement} from 'UI/Focus';
import template = require('wml!Controls/_form/FocusWithEnter/FocusWithEnter');
import {getContextTypes} from '../Context/WorkByKeyboardUtil';

/**
 * Контроллер, который обрабатывает нажатие клавиши enter и переводит фокус на след. поле ввода.
 * @extends UI/Base:Control
 * @public
 * @author Таранин С.М.
 */

export default class FocusWithEnter extends Control<IControlOptions> {
    _template: TemplateFunction = template;

    protected _afterMount(): void {
        this._notify('register', ['mousedown', this, this._onMousedownHandler], {bubbling: true});
    }

    protected _beforeUnmount(): void {
        this._notify('unregister', ['mousedown', this], {bubbling: true});
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

            this.context.get('workByKeyboard')?.setStatus(true);

            // Не переводим фокус, если не нашли элемент за приемлемое количество попыток
            if (target && index !== maxFindAttemptNumber) {
                focusNextElement(false, current);
            }
        }
    }

    protected _onMousedownHandler(): void {
        this.context.get('workByKeyboard')?.setStatus(false);
    }

    /**
     * Проверяет, может ли элемент быть сфокусирован по ENTER
     * @param {HTMLElement} target Проверяемый html-элемент
     */
    _isFocusable(target: HTMLElement): boolean {
        // TODO: Пропускаю кнопки при обходе по ENTER:
        // tslint:disable-next-line
        // https://online.sbis.ru/open_dialog.html?guid=5e1a9e18-3941-4725-8963-9a8fff7eec9f&user=321880e7-f6f6-463a-849b-8649be2b6dfc
        return target && (this.context.get('workByKeyboard') || !target.closest('.controls-BaseButton'));
    }

    static contextTypes(): object {
        return getContextTypes();
    }
}
