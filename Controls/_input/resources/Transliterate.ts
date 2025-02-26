import {ISelection} from './Types';
import {controller as i18Controller} from 'I18n/i18n';

/**
 * Утилита для выполнения транслитерации текста
 * @class Controls/input:transliterate
 * @public
 * @author Мочалов М.А.
 */

/**
 * Описывает параметры выделения текста
 * @typedef {Object}
 * @name Selection
 * @property {number} [start] Значение указывает на порядковый номер первого символа в выделенном фрагменте относительно всего текста.
 * @property {number} [end] Значение указывает на порядковый номер последнего символа в выделенном фрагменте относительно всего текста.
 */

/**
 * Транслитерирует переданный текст
 * @function Controls/_input/resources/Transliterate#transliterate
 * @param {String} value Текст для транслитерации
 * @param {Selection} selection Если передан этот параметр, то транслитерация будет применена только к выделенному тексту.
 */
export default function transliterate(value: string, selection?: ISelection): Promise<string> {
    let text = value;
    if (selection) {
        text = value.slice(selection.start, selection.end) || value;
    }
    const firstLocale = i18Controller.currentLocale.indexOf('ru') !== -1 ? 'ru' : 'en';
    const secondLocale = firstLocale === 'ru' ? 'en' : 'ru';
    return import('I18n/keyboard').then(({changeLayout}) => {
        return changeLayout(text, firstLocale, secondLocale).then((firstRevertedText) => {
            if (firstRevertedText === text) {
                return changeLayout(text, secondLocale, firstLocale).then((secondRevertedText) => {
                    return transliterateSelectedText(secondRevertedText, value, selection);
                });
            } else {
                return transliterateSelectedText(firstRevertedText, value, selection);
            }
        });
    });
}

function transliterateSelectedText(
    revertedText: string,
    value: string,
    selection?: ISelection
): string {
    if (selection && selection.start !== selection.end) {
        return value.slice(0, selection.start) +
            revertedText +
            value.slice(selection.end, value.length);
    } else {
        return revertedText;
    }
}

// Для тестов
transliterate._transliterateSelectedText = transliterateSelectedText;
