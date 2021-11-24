import {ISelection} from '../Types';
import {constants, detection} from 'Env/Env';

/**
 * Класс для исправления багов при работе с выделением в нативных полях ввода.
 *
 * Баг №1: после вызова метода setSelectionRange генерируется событие select.
 * Поведение обнаружено во всех браузерах, кроме IE. https://jsfiddle.net/xcnmbg9e/
 * Если обработчик должен запускать только при пользовательском изменении выделения, то выполнять его будет лишним.
 * Решение: пропускаем вызов обработчика столько раз, сколько был вызван метод setSelectionRange.
 */
class WorkWithSelection<TCallbackResult> {
    private _skipCall: number = 0;

    setSelectionRange(field: HTMLInputElement, selection: ISelection): boolean {
        /**
         * В IE происходит авто-фокусировка поля, если вызвать изменение выделения. Поэтому меняем его только
         * при условии фокусировки в данный момент.
         */
        if (WorkWithSelection.hasSelectionChanged(field, selection) && WorkWithSelection.isFieldFocused(field)) {
            /**
             * См. выше "Баг №1".
             */
            if (!detection.isIE) {
                this._skipCall++;
            }
            field.setSelectionRange(selection.start, selection.end);
            // Когда в поле ввода веден большой текст, не срабатывает авто подскролл к нужному месту
            // Поэтому если каретка находится в самом конце, то скролим самостоятельно
            // https://online.sbis.ru/opendoc.html?guid=c01d9df0-618b-4a0f-897b-2fc1e5f51f88
            if (field.value?.length === selection.start && field.value?.length === selection.end) {
                field.scrollLeft = field.scrollWidth;
            }
            return true;
        }
        return false;
    }

    call(handler: () => TCallbackResult): TCallbackResult | false {
        if (this._skipCall > 0) {
            this._skipCall--;
            return false;
        }

        return handler();
    }

    static hasSelectionChanged(field: HTMLInputElement, selection: ISelection): boolean {
        return field.selectionStart !== selection.start || field.selectionEnd !== selection.end;
    }

    static isFieldFocused(field: HTMLInputElement): boolean {
        if (constants.isBrowserPlatform) {
            return field === document.activeElement;
        }

        return false;
    }
}

export default WorkWithSelection;
