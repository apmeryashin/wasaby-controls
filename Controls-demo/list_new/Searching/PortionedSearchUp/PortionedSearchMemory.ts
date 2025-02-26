import {DataSet, Memory, Query} from 'Types/source';

interface IItem {
    key: number;
    title: string;
}

const FAST_SEARCH_DELAY = 800;
const SEARCH_DELAY = 2500;
const LONG_SEARCH_DELAY = 10000;

export default class PositionSourceMemory extends Memory {
    private _longLoad: boolean = false;
    private _fastLoad: boolean = false;

    setLongLoad(longLoad: boolean) {
        this._longLoad = longLoad;
    }

    setFastLoad(fastLoad: boolean) {
        this._fastLoad = fastLoad;
    }

    query(query?: Query<unknown>): Promise<DataSet> {
        const filter = query.getWhere();
        let limit = query.getLimit();

        const isSearch = query.getWhere().title !== undefined;
        const filterFewItems = query.getWhere().filter === 'few-items';
        let isPrepend = typeof filter['key<='] !== 'undefined';
        const isPosition = typeof filter['key~'] !== 'undefined';
        let position = filter['key<='] || filter['key>='] || filter['key~'] || 0;

        if (isSearch) {
            limit = 3;
            isPrepend = true;
        }

        if (isPrepend) {
            position -= limit;
        }

        if (filterFewItems) {
            const items = this._getItems(position, 3);
            const result = this._prepareQueryResult({
                items,
                meta: {
                    total: false,
                    more: false
                }
            }, null);
            return Promise.resolve(result);
        } else if (isSearch) {
            return this._getSearchItems(position)
                .then((items) => this._prepareQueryResult({
                        items,
                        meta: {
                            total: isPosition ? {before: true, after: true} : position > -100,
                            more: position > -100,
                            iterative: position > -100 // находим всего 100 записей
                        }
                    }, null)
                );
        } else {
            const items = this._getItems(position, limit);
            const result = this._prepareQueryResult({
                items,
                meta: {
                    total: isPosition ? {before: true, after: true} : true
                }
            }, null);
            return Promise.resolve(result);
        }
    }

    private _getItems(position: number, limit: number): IItem[] {
        const items: IItem[] = [];

        for (let i = 0; i < limit; i++, position++) {
            items.push({
                key: position,
                title: `Запись #${position}`
            });
        }

        return items;
    }

    private _getSearchItems(position: number): Promise<IItem[]> {
        let delay = SEARCH_DELAY;
        if (this._fastLoad) {
            delay = FAST_SEARCH_DELAY;
        } else if (this._longLoad) {
            delay = LONG_SEARCH_DELAY;
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                const items = this._getItems(position, 3);
                resolve(items);
            }, delay);
        });
    }
}
