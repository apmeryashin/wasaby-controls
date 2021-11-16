import {Logger} from 'UI/Utils';
import {isEmpty} from 'Types/object';
import {TKey} from 'Controls/_interface/IItems';
import {IReloadItemOptions} from 'Controls/_baseList/interface/IList';

const RELOAD_ITEM_WARN = 'Вы используете устаревшую сигнатуру метода reloadItem. Пожалуйста ознакомьтесь с новой сигнатурой https://wi.sbis.ru/docs/js/Controls/list/View/methods/reloadItem и поправьте код вызова.';

/**
 * Конвертирует аргументы вызова метода reloadItem к IReloadItemOptions.
 * Это временная ф-ия, которая используется для организации совместимости между старой и новой сигнатурой метода
 * reloadItem.
 */
export function convertReloadItemArgs(...args: unknown[]): {key: TKey | TKey[], options: IReloadItemOptions} {
    const result = {
        // первый аргумент это всегда id
        key: args[0] as TKey,
        options: {} as IReloadItemOptions
    };

    // Приводим второй аргумент к IReloadItemOptions
    const secondAgr = (args[1] == null ? {} : args[1]) as IReloadItemOptions;
    // Определяем содержатся ли во втором аргумента поля специфичные для IReloadItemOptions
    const hasReloadItemsProp = ['method', 'readMeta', 'replace', 'hierarchyReload']
        .reduce((accumulator, prop) => accumulator || secondAgr.hasOwnProperty(prop), false);

    if (args.length >= 2) {
        // Если пришло 2 аргумента и второй это либо пустой объект либо объект похожий на IReloadItemOptions,
        // то считаем что идет вызов по ново сигнатуре
        if (isEmpty(secondAgr) || hasReloadItemsProp) {
            result.options = secondAgr;
        } else {
            result.options.readMeta = args[1] as object;

            if (args.length === 2) {
                Logger.warn(RELOAD_ITEM_WARN);
                return result;
            }
        }
    }

    Logger.warn(RELOAD_ITEM_WARN);

    // tslint:disable-next-line:no-magic-numbers
    if (args.length >= 3) {
        // Если в 3м аргументе 'depth' значит вызывают перезагрузку итема дереве
        // В противном случае это replaceItem
        if (args[2] === 'depth') {
            result.options.hierarchyReload = true;
        } else {
            result.options.replace = !!args[2];
        }
    }

    // tslint:disable-next-line:no-magic-numbers
    if (args.length === 4) {
        // tslint:disable-next-line:no-magic-numbers
        result.options.method = args[3] as ('read' | 'query');
    }

    return result;
}
