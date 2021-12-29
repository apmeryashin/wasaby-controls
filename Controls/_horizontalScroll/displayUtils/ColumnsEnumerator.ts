import {GridCollection} from 'Controls/grid';

export class ColumnsEnumerator {
    protected readonly _collection: GridCollection;

    private _indexes: {
        startIndex: number;
        stopIndex: number;
    };

    constructor(collection: GridCollection) {
        this._collection = collection;
    }

    setIndexes(startIndex: number, stopIndex: number): void {
        this._indexes = {startIndex, stopIndex};
        // FIX: Заменить на прямой сброс колонок.
        this._collection.setColumns(this._collection.getGridColumnsConfig());
    }

    getIndexes(withSticky?: boolean): number[] {
        const indexes = [];

        for (let i = this._indexes.startIndex; i < this._indexes.stopIndex; i++) {
            indexes.push(i);
        }

        if (withSticky) {
            this.getStickiedIndexes().reverse().forEach((index) => {
                if (indexes.indexOf(index) === -1) {
                    indexes.unshift(index);
                }
            });
        }

        return indexes;
    }

    getColumns(): object[] {
        return this.getIndexes(true).map((index) => this._collection.getGridColumnsConfig()[index]);
    }

    getStickiedIndexes(): number[] {
        const result = [];
        for (let i = 0; i < this._collection.getStickyColumnsCount(); i++) {
            result.push(i);
        }
        return result;
    }
}
