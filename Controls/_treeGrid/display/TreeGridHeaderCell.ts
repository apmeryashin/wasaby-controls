import {GridHeaderCell, IGridHeaderCellOptions} from 'Controls/grid';

export interface ITreeGridHeaderCellOptions extends IGridHeaderCellOptions {
    displayExpanderPadding?: boolean;
    expanderSize?: string;
}

/**
 * Ячейка строки заголовка иерархической таблицы
 */
export default class TreeGridHeaderCell extends GridHeaderCell<null> {
    /**
     * Признак, означающий что нужно рисовать отступ вместо экспандеров
     * @protected
     */
    protected _$displayExpanderPadding: boolean;

    /**
     * Размер экспандера
     */
    protected _$expanderSize: string;

    // region DisplayExpanderPadding

    setDisplayExpanderPadding(displayExpanderPadding: boolean): void {
        if (this._$displayExpanderPadding !== displayExpanderPadding) {
            this._$displayExpanderPadding = displayExpanderPadding;
            this._nextVersion();
        }
    }

    // endregion DisplayExpanderPadding

    getContentClasses(): string {
        let result = super.getContentClasses();

        if (this.isFirstColumn() && !this.isMultiSelectColumn() && this._$displayExpanderPadding) {
            const expanderSize = this._$expanderSize;
            result += ` controls-TreeGridView__expanderPadding-${expanderSize}`;
        }

        return result;
    }
}

Object.assign(TreeGridHeaderCell.prototype, {
    'Controls/treeGrid:TreeGridHeaderCell': true,
    _moduleName: 'Controls/treeGrid:TreeGridHeaderCell',
    _instancePrefix: 'tree-grid-header-cell-',
    _$displayExpanderPadding: true,
    _$expanderSize: 'default'
});
