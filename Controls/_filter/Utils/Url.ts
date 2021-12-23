import {query} from 'Application/Env';
import {isEqual, isEmpty} from 'Types/object';
import {History, MaskResolver} from 'Router/router';
import {Serializer} from 'UI/State';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterItem';
import {getConfig} from 'Application/Env';

interface IQueryParams {
    /**
     * @name Controls/_filter/Utils/IQueryParams#filter
     * @cfg {string} Фильтр в формате JSON string.
     */
    filter?: string;
    /**
     * @name Controls/_filter/Utils/IQueryParams#replace
     * @cfg {boolean} Опция для очистки текущих query-параметров.
     */
    replace?: boolean;
}

/**
 * Возвращает объект, содержащий фильтр для последующего сохранения его в праметры url.
 * @function Controls/_filter/Utils/Url#getQueryParamsByFilter
 * @param {IFilterItem[]} filterButtonItems Массив элементов фильтра
 * @returns IQueryParams
 */
export function getQueryParamsByFilter(filterButtonItems: IFilterItem[]): IQueryParams {
    const filterItems = [];

    for (const item of filterButtonItems) {
        if (!isEqual(item.value, item.resetValue)) {
            filterItems.push({
                name: item.name,
                value: item.value,
                textValue: item.textValue,
                visibility: item.visibility
            });
        }
    }

    const applicationSerializer = new Serializer();
    let queryParams = {};

    if (filterItems.length) {
        queryParams = {filter: JSON.stringify(filterItems, applicationSerializer.serialize)};
    }

    return queryParams;
}

/**
 * Обновляет url, добавляя в него параметры фильтрации
 * @function Controls/_filter/Utils/Url#updateUrlByFilter
 * @param {IFilterItem[]} filterButtonItems Массив элементов фильтра
 * @returns void
 */
export function updateUrlByFilter(filterButtonItems: IFilterItem[]): void {
    const queryParams = getQueryParamsByFilter(filterButtonItems);
    if (isEmpty(queryParams)) {
        queryParams.replace = true;
    }
    const state = MaskResolver.calculateQueryHref(queryParams);

    // Нужно убрать название точки входа (например, OnlineSbisRu) из ссылки на страницу.
    // Если страница на сервисе, то точка входа в урл не добавляется и удалять ее, соответственно, не нужно.
    // Высчитываем с какой позиции начинается чистый урл и убираем точку входа из урл.
    const service = getConfig('appRoot');

    let href;
    if ((!service || service === '/')) {
        const pageIndex = state.indexOf('/page/');
        href = state.substring(pageIndex);
    }

    History.replaceState({state, href});
}

/**
 * Возвращает элементы фильтра, взятые из url
 * @function Controls/_filter/Utils/Url#getFilterFromUrl
 * @returns void | IFilterItem[]
 */
export function getFilterFromUrl(): void | IFilterItem[] {
    const urlFilter = query.get.filter;

    if (!urlFilter) {
        return;
    }

    const applicationSerializer = new Serializer();

    return JSON.parse(decodeURIComponent(urlFilter), applicationSerializer.deserialize);
}
