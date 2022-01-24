import TreeGridDataCell from './TreeGridDataCell';
import {COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';
import {TemplateFunction} from 'UI/Base';
import TreeGridNodeExtraRow from './TreeGridNodeExtraRow';

/**
 * Ячейка дополнительного элемента узла в иерархической таблице
 */
export default class TreeGridNodeExtraItemCell extends TreeGridDataCell<null> {
    readonly '[Controls/treeGrid:TreeGridNodeExtraItemCell]': boolean;

    readonly listInstanceName: string =  'controls-TreeGrid__node-extra-item';

    readonly listElementName: string = 'cell';

    getTemplate(): TemplateFunction | string {
        return this._$column.template;
    }

    isMoreButton(): boolean {
        return !!((this.getOwner() as TreeGridNodeExtraRow).needMoreButton());
    }

    shouldRenderHasMoreButton(): boolean {
        return this.isMoreButton() && this._$isFirstDataCell;
    }

    isFirstColumn(): boolean {
        return this.getColumnIndex(false, false) === 0;
    }

    getWrapperClasses(): string {
        return `controls-TreeGrid__node-extraItem__wrapper ${this._getColumnSeparatorClasses()}`;
    }

    getContentClasses(params: {hasContent: boolean}): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();

        let classes =
            'controls-TreeGrid__nodeExtraItem-cell__content' +
            ' controls-TreeGrid__nodeExtraItemContent' +
            ` controls-TreeGrid__nodeExtraItemContent_rowSeparatorSize-${rowSeparatorSize}` +
            ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;

        if (params.hasContent || this.isMoreButton()) {
            classes += ' controls-TreeGrid__nodeExtraItem-cell_withContent';

            if (this.getOwner().isFullGridSupport()) {
                classes += ' controls-TreeGrid__nodeExtraItemContent__baseline';
            }
        }

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn()) {
            classes += ` controls-TreeGrid__nodeExtraItemContent_spacingLeft-${this._$owner.getLeftPadding()}`;
        }

        if (this.isLastColumn()) {
            classes += ` controls-TreeGrid__nodeExtraItemContent_spacingRight-${this._$owner.getRightPadding()}`;
        }

        return classes;
    }

    getRelativeCellWrapperClasses(params: { hasContent: boolean }): string {
        let classes = super.getRelativeCellWrapperClasses();

        if (params.hasContent || this.isMoreButton()) {
            classes += ' controls-TreeGrid__nodeExtraItemContent__baseline';
        }

        return classes;
    }
}

Object.assign(TreeGridNodeExtraItemCell.prototype, {
    '[Controls/treeGrid:TreeGridNodeExtraItemCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeExtraItemCell',
    _instancePrefix: 'tree-grid-node-extra-item-cell-'
});
