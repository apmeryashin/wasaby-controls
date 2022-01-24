import TreeGridNodeExtraRow from './TreeGridNodeExtraRow';

/**
 * Хедер узла в иерархической таблице
 */
export default class TreeGridNodeHeaderRow extends TreeGridNodeExtraRow {
    readonly listInstanceName: string =  'controls-TreeGrid__node-header';
    readonly listElementName: string = 'row';

    getItemClasses(): string {
        return super.getItemClasses() + ' controls-TreeGrid__nodeHeader';
    }

    getMoreClasses(): string {
        return 'controls-TreeGrid__nodeHeaderLoadMore';
    }

    needMoreButton(): boolean {
        return this.hasMoreStorage('backward');
    }

    protected _resolveExtraItemTemplate(): string {
        return 'Controls/treeGrid:NodeHeaderTemplate';
    }
}

Object.assign(TreeGridNodeHeaderRow.prototype, {
    '[Controls/treeGrid:TreeGridNodeHeaderRow]': true,
    '[Controls/tree:TreeNodeHeaderItem]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeHeaderRow',
    _instancePrefix: 'tree-grid-node-header-row-'
});
