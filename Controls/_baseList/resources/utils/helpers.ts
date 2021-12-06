import {isEmpty} from 'Types/object';
import {IReloadItemOptions} from 'Controls/_baseList/interface/IList';

const RELOAD_ITEM_WARN = 'Вы используете устаревшую сигнатуру метода reloadItem. Пожалуйста ознакомьтесь с новой сигнатурой https://wi.sbis.ru/docs/js/Controls/list/View/methods/reloadItem и поправьте код вызова.';

/**
 * Проверяет корректность аргументов, переданных в метод reloadItem списков.
 * Если аргументы не корректные, то генерит ошибку.
 * Удалить после 22.1000
 */
export function checkReloadItemArgs(...args: unknown[]): void {
    // Приводим второй аргумент к IReloadItemOptions
    const secondAgr = (args[1] == null ? {} : args[1]) as IReloadItemOptions;
    // Определяем содержатся ли во втором аргумента поля специфичные для IReloadItemOptions
    const hasReloadItemsProp = ['method', 'readMeta', 'replace', 'hierarchyReload']
        .reduce((accumulator, prop) => accumulator || secondAgr.hasOwnProperty(prop), false);

    // Если аргументов больше двух, то ругаемся
    if (args.length > 2) {
        throw new Error(RELOAD_ITEM_WARN);
    }

    // Если второй аргумент это не пустой объект и не IReloadItemOptions, то ругаемся
    if (!isEmpty(secondAgr) && !hasReloadItemsProp) {
        throw new Error(RELOAD_ITEM_WARN);
    }
}
