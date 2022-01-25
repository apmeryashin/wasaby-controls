import {Model} from 'Types/entity';
import {IHeaderCell, THeaderVisibility} from 'Controls/grid';
import {TBreadcrumbsVisibility, TExplorerViewMode} from './interface/IExplorer';
import {INavigationOptionValue, INavigationPositionSourceConfig, TKey} from 'Controls/interface';

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

/**
 * На основании настроек навигации определяет используется ли навигация по курсору.
 */
export function isCursorNavigation(navigation: INavigationOptionValue<unknown>): boolean {
    return !!navigation && navigation.source === 'position';
}

export function resolveViewMode(viewMode: TExplorerViewMode, useColumns: boolean): TExplorerViewMode | 'columns' {
    return viewMode === 'list' && useColumns ? 'columns' : viewMode;
}

export function needRecreateCollection(
    oldViewMode: TExplorerViewMode,
    newViewMode: TExplorerViewMode,
    useColumns: boolean
): boolean {
    if (useColumns) {
        return false;
    }

    if (oldViewMode === 'list' && newViewMode === 'table') {
        return true;
    }

    // noinspection RedundantIfStatementJS
    if (oldViewMode === 'table' && newViewMode === 'list') {
        return true;
    }

    return false;
}

/**
 * Собирает курсор для навигации относительно заданной записи.
 * @param item - запись, для которой нужно "собрать" курсор
 * @param navigation - конфигурация курсорной навигации
 */
export function getCursorValue(
    item: Model,
    navigation: INavigationOptionValue<INavigationPositionSourceConfig>
): unknown[] {

    const position: unknown[] = [];
    const optField = navigation.sourceConfig.field;
    const fields: string[] = (optField instanceof Array) ? optField : [optField];

    let noData = true;
    fields.forEach((field) => {
        const fieldValue = item.get(field);

        position.push(fieldValue);
        noData = noData && fieldValue === undefined;
    });

    // Если все поля курсора undefined, значит курсора нет
    if (noData) {
        return undefined;
    }

    return position;
}
