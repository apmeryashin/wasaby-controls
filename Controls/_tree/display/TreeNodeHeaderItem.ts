import TreeNodeExtraItem from './TreeNodeExtraItem';

/**
 * Хедер узла в иерархическом списке
 */

export default class TreeNodeHeaderItem extends TreeNodeExtraItem {
    readonly listInstanceName: string =  'controls-Tree__node-header';

    getMoreClasses(): string {
        return 'controls-TreeGrid__nodeHeaderLoadMore';
    }
}

Object.assign(TreeNodeHeaderItem.prototype, {
    '[Controls/tree:TreeNodeHeaderItem]': true,
    _moduleName: 'Controls/tree:TreeNodeHeaderItem',
    _instancePrefix: 'tree-node-header-item-'
});
