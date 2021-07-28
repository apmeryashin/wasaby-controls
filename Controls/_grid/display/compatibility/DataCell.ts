import DataRow from '../DataRow';

/**
 * Совместимость нового интерфейса ячеек со старым
 */
export default abstract class DataCellCompatibility<T> {
    get item(): T {
        return this.getOwner().contents;
    }

    isActive(): boolean {
        return this.getOwner().isActive();
    }

    get searchValue() {
        return this.getOwner().searchValue;
    }

    get column() {
        return this._$column;
    }

    get index() {
        return this.getOwner().index;
    }

    abstract getOwner(): DataRow;
}
