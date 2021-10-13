import {DataSet, Memory, Query} from 'Types/source';

interface IItem {
    key: number;
    title: string;
}

const SEARCH_DELAY = 2500;
const DEFAULT_DELAY = 1000;

export default class PositionSourceMemory extends Memory {
    private _littleDataToDown: boolean = false;

    setLittleData(newValue: boolean): void {
        this._littleDataToDown = newValue;
    }

    query(query?: Query<unknown>): Promise<DataSet> {
        const filter = query.getWhere();
        let limit = query.getLimit();

        const isSearch = query.getWhere().title !== undefined;
        const isPrepend = typeof filter['key<='] !== 'undefined';
        const isPosition = typeof filter['key~'] !== 'undefined';
        const isAppend = typeof filter['key>='] !== 'undefined';
        let position = filter['key<='] || filter['key>='] || filter['key~'] || 0;
        if (isAppend) {
            position++;
        } else if (isPrepend) {
            position--;
        }

        const delay = isSearch ? SEARCH_DELAY : DEFAULT_DELAY;
        let total = isPosition ? {before: true, after: true} : true;
        let more = isPosition ? {before: true, after: true} : true;
        let iterative = false;

        if (isSearch) {
            if (this._littleDataToDown && isAppend) {
                limit = 1;
            } else {
                limit = 3;
            }

            if (isPrepend) {
                position -= limit;
            }

            if (this._littleDataToDown && isAppend) {
                iterative = position < 5;
            } else {
                iterative = isPrepend ? position > -60 : position < 60;
            }

            if (isPosition) {
                more = { before: true, after: true };
            } else if (this._littleDataToDown && isAppend) {
                more = position < 5;
            } else {
                more = isPrepend ? position > -60 : position < 60;
            }

            total = more;
        } else {
            if (isPrepend) {
                position -= limit;
            }
        }

        const meta = { total, more, iterative};
        return this._timeout(delay).then(() => {
            const items = this._getItems(position, limit);
            return this._prepareQueryResult({items, meta}, null);
        });
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

    private _timeout(delay: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, delay);
        });
    }
}
