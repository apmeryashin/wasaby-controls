import type Grid from './mixins/Grid';

export class ColumnsEnumerator {
    protected readonly _collection: Grid;

    constructor(collection: Grid) {
        this._collection = collection;
    }

    getIndexes(): number[] {
        const indexes = [];
        for (let i = 0; i < this._collection.getGridColumnsConfig().length; i++) {
            indexes.push(i);
        }
        return indexes;
    }

    getColumns(): object[] {
        return this.getIndexes().map((index) => this._collection.getGridColumnsConfig()[index]);
    }
}
