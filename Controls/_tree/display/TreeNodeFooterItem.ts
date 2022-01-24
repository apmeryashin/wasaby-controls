import { TemplateFunction } from 'UI/Base';
import TreeNodeExtraItem from './TreeNodeExtraItem';

export default class TreeNodeFooterItem extends TreeNodeExtraItem {
    readonly listInstanceName: string =  'controls-Tree__node-footer';

    getTemplate(): TemplateFunction | string {
        return this._$owner.getNodeFooterTemplate() || super.getTemplate();
    }

    getItemClasses(): string {
        return super.getItemClasses() + ' controls-Tree__nodeFooter';
    }

    getContentClasses(): string {
        return super.getContentClasses() + ' controls-Tree__itemContentTreeWrapper';
    }

    getMoreClasses(): string {
        return 'controls-TreeGrid__nodeFooterLoadMore';
    }
}

Object.assign(TreeNodeFooterItem.prototype, {
    '[Controls/tree:TreeNodeFooterItem]': true,
    _moduleName: 'Controls/tree:TreeNodeFooterItem',
    _instancePrefix: 'tree-node-footer-item-'
});
