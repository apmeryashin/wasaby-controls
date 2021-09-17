import {DataSet, Memory, Query} from 'Types/source';

interface IItem {
    key: number;
    title: string;
}

const SEARCH_DELAY = 2500;

export default class PositionSourceMemory extends Memory {
    private _littleData: boolean = false;

    setLittleData(newValue: boolean): void {
        this._littleData = newValue;
    }

    query(query?: Query<unknown>): Promise<DataSet> {
        const filter = query.getWhere();
        let limit = query.getLimit();

        const isSearch = query.getWhere().title !== undefined;
        let isPrepend = typeof filter['key<='] !== 'undefined';
        const isPosition = typeof filter['key~'] !== 'undefined';
        let position = filter['key<='] || filter['key>='] || filter['key~'] || 0;

        if (isPrepend) {
            position -= limit;
        }

        if (isSearch) {
            const limit = this._littleData ? 5 : 100;
            return this._getSearchItems(position)
                .then((items) => this._prepareQueryResult({
                        items,
                        meta: {
                            total: isPosition ? {before: true, after: !this._littleData} : position < limit,
                            more: isPosition ? {before: true, after: !this._littleData} : position < limit,
                            iterative: position < limit // находим всего 100 записей
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
        return new Promise((resolve) => {
            setTimeout(() => {
                const items = this._getItems(position, 5);
                resolve(items);
            }, SEARCH_DELAY);
        });
    }
}
