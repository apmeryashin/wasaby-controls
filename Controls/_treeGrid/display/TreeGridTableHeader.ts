import {GridTableHeader} from 'Controls/grid';
import TreeGridHeaderRow, {ITreeGridHeaderRowOptions} from './TreeGridHeaderRow';

/**
 * Заголовок в иерархической таблице, которая не поддерживает grid.
 */
export default class TreeGridTableHeader extends GridTableHeader {
    /**
     * Размер экспандера
     */
    protected _$expanderSize: string;

    setDisplayExpanderPadding(displayExpanderPadding: boolean): void {
        this._$rows.forEach((row) => {
            (row as TreeGridHeaderRow).setDisplayExpanderPadding(displayExpanderPadding);
        });
    }

    protected _getRowsFactory(): (options: ITreeGridHeaderRowOptions) => TreeGridHeaderRow {
        const superFactory = super._getRowsFactory();
        return (options: ITreeGridHeaderRowOptions) => {
            options.expanderSize = this._$expanderSize;
            return superFactory.call(this, options);
        };
    }
}

Object.assign(TreeGridTableHeader.prototype, {
    'Controls/treeGrid:TreeGridTableHeader': true,
    _moduleName: 'Controls/treeGrid:TreeGridTableHeader',
    _instancePrefix: 'tree-grid-table-header-',
    _rowModule: 'Controls/treeGrid:TreeGridTableHeaderRow',
    _$expanderSize: 'default'
});
