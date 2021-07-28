import {GridDataCell, IGridDataCellOptions} from 'Controls/grid';
import {isFullGridSupport, ITreeItemOptions} from 'Controls/display';
import TreeGridDataRow from './TreeGridDataRow';
import { Model } from 'Types/entity';

export interface ITreeGridDataCellOptions<T extends Model> extends IGridDataCellOptions<T>, ITreeItemOptions<T> {
    isDragTargetNode?: boolean;
}

/**
 * Ячейка иерархической коллекции, в которой отображаются данные из RecordSet-а
 */
export default class TreeGridDataCell<T extends Model> extends GridDataCell<T, TreeGridDataRow<T>> {
    readonly '[Controls/treeGrid:TreeGridDataCell]': boolean;

    protected _$owner: TreeGridDataRow<T>;

    private _$isDragTargetNode: boolean;

    getWrapperClasses(
        backgroundColorStyle: string,
        templateHighlightOnHover?: boolean,
        templateHoverBackgroundStyle?: string
    ): string {
        let classes = super.getWrapperClasses(backgroundColorStyle, templateHighlightOnHover);

        if (this._$owner.isDragTargetNode()) {
            classes += ' controls-TreeGridView__dragTargetNode';
            if (this.isFirstColumn()) {
                classes += ' controls-TreeGridView__dragTargetNode_first';
            }

            if (this.isLastColumn()) {
                classes += ' controls-TreeGridView__dragTargetNode_last';
            }

            // controls-Grid__no-rowSeparator перебивает стили dragTargetNode
            classes = classes.replace('controls-Grid__no-rowSeparator', '');
        }

        return classes;
    }

    getRelativeCellWrapperClasses(): string {
        let classes = super.getRelativeCellWrapperClasses();

        if (!isFullGridSupport()) {
            classes = 'controls-TreeGridView__row-cell_innerWrapper ' + classes;
        }

        return classes;
    }

    getContentClasses(
        backgroundColorStyle: string = this._$column.backgroundColorStyle,
        cursor: string = 'pointer',
        templateHighlightOnHover: boolean = true,
        tmplIsEditable: boolean = true
    ): string {
        let classes = super.getContentClasses(backgroundColorStyle, cursor, templateHighlightOnHover, tmplIsEditable);

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn() && isFullGridSupport()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }
        return classes;
    }

    isDragTargetNode(): boolean {
        return this._$isDragTargetNode;
    }

    setDragTargetNode(isTarget: boolean): void {
        if (this._$isDragTargetNode !== isTarget) {
            this._$isDragTargetNode = isTarget;
            this._nextVersion();
        }
    }

    protected _getWrapperBaseClasses(templateHighlightOnHover: boolean): string {
        let classes = super._getWrapperBaseClasses(templateHighlightOnHover);
        classes += ` controls-TreeGrid__row-cell controls-TreeGrid__row-cell_${this.getStyle()}`;

        if (this._$owner.isNode()) {
            classes += ' controls-TreeGrid__row-cell__node';
        } else if (this._$owner.isNode() === false) {
            classes += ' controls-TreeGrid__row-cell__hiddenNode';
        } else {
            classes += ' controls-TreeGrid__row-cell__item';
        }

        return classes;
    }
}

Object.assign(TreeGridDataCell.prototype, {
    '[Controls/treeGrid:TreeGridDataCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridDataCell',
    _instancePrefix: 'tree-grid-data-cell-',
    _$isDragTargetNode: false
});
