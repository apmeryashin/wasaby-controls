import {TKey} from 'Controls/interface';
import {IHeaderCell, THeaderVisibility} from 'Controls/grid';
import {TBreadcrumbsVisibility} from './interface/IExplorer';

/**
 * Вычисляет итоговую видимость заголовка таблицы:
 * <ul>
 *     <li>
 *         Если breadcrumbsVisibility === 'hidden', то используем дефолт headerVisibility || 'hasdata'
 *    </li>
 *    <li>
 *        Если breadcrumbsVisibility === 'visible', то
 *        <ul>
 *            <li>
 *                Если нужно выводить кнопку "Назад" в заголовке таблицы, то
 *                <ul>
 *                    <li>
 *                        при нахождении в корне используем дефолт headerVisibility || 'hasdata'
 *                    </li>
 *                    <li>
 *                        при нахождении не в корне заголовок всегда делаем видимым
 *                    </li>
 *                </ul>
 *            </li>
 *            <li>
 *                Во всех остальных случаях используем дефолт headerVisibility || 'hasdata'
 *            </li>
 *        </ul>
 *    </li>
 * </ul>
 */
export function getHeaderVisibility(
    root: TKey,
    topRoot: TKey,
    header: undefined | IHeaderCell[],
    headerVisibility: undefined | THeaderVisibility,
    breadcrumbsVisibility: undefined | TBreadcrumbsVisibility
): THeaderVisibility {
    const def = headerVisibility || 'hasdata';

    // Если крошки скрыты, то руководствуемся значением опции headerVisibility
    if (breadcrumbsVisibility === 'hidden') {
        return def;
    }

    // Если нужно выводить кнопку "Назад" в заголовке, то в случае если мы находимся не в корне,
    // то принудительно показываем заголовок
    if (needBackButtonInHeader(header, breadcrumbsVisibility)) {
        return root === (topRoot || null) ? (headerVisibility || 'hasdata') : 'visible';
    }

    return def;
}

/**
 * Вычисляет нужно или нет выводить кнопку "Назад" в первой ячейке заголовка таблицы.
 * Нужно выводить если у нас табличное представление, в первой ячейке заголовка не задан пользовательский контент
 * и крошки не скрыты.
 */
export function needBackButtonInHeader(
    header: undefined | IHeaderCell[],
    breadcrumbsVisibility: undefined | TBreadcrumbsVisibility
): boolean {
    // title - устаревшее поле колонки
    const firstHeaderCell = header?.length && header[0] as IHeaderCell & {title: string};
    const firsHeaderCellIsEmpty = firstHeaderCell && !firstHeaderCell.template &&
        !(firstHeaderCell.title || firstHeaderCell.caption);

    return breadcrumbsVisibility !== 'hidden' && firsHeaderCellIsEmpty;
}
