import {TemplateFunction} from 'UI/Base';
import TreeGridNodeExtraItemCell from './TreeGridNodeExtraItemCell';

/**
 * Ячейка футера узла в иерархической таблице
 */
export default class TreeGridNodeFooterCell extends TreeGridNodeExtraItemCell {
    readonly '[Controls/treeGrid:TreeGridNodeExtraItemCell]': boolean;

    readonly listInstanceName: string =  'controls-TreeGrid__node-footer';

    readonly listElementName: string = 'cell';

    getTemplate(): TemplateFunction | string {
        const hasRowTemplate = this._$isSingleColspanedCell && !!this._$owner.getRowTemplate();
        const customTemplate = hasRowTemplate ? this._$column.template : this._$column.nodeFooterTemplate;
        return customTemplate || 'Controls/treeGrid:NodeFooterTemplate';
    }
}

Object.assign(TreeGridNodeExtraItemCell.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-cell-'
});
