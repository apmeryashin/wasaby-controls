import {CheckboxCell} from 'Controls/grid';
import TreeGridDataRow from './TreeGridDataRow';

/**
 * Ячейка иерархической коллекции, в которой отображается чекбокс множественного выбора
 */
export default class TreeCheckboxCell<
    TOwner extends TreeGridDataRow = TreeGridDataRow
> extends CheckboxCell<null, TOwner> {
    getWrapperClasses(
        backgroundColorStyle: string,
        templateHighlightOnHover?: boolean,
        templateHoverBackgroundStyle?: string
    ): string {
        let classes = super.getWrapperClasses(backgroundColorStyle, templateHighlightOnHover);

        if (this.getOwner().isDragTargetNode()) {
            classes += ' controls-TreeGridView__dragTargetNode controls-TreeGridView__dragTargetNode_first';
        }

        return classes;
    }
}

Object.assign(TreeCheckboxCell.prototype, {
    '[Controls/_treeGrid/display/TreeCheckboxCell]': true,
    _moduleName: 'Controls/treeGrid:TreeCheckboxCell',
    _instancePrefix: 'tree-grid-checkbox-cell-',
    _$style: null
});
