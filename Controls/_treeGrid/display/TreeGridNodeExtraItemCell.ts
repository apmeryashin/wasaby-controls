import TreeGridDataCell from './TreeGridDataCell';
import {COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';
import TreeGridNodeFooterRow from 'Controls/_treeGrid/display/TreeGridNodeFooterRow';
import {TemplateFunction} from 'UI/Base';

/**
 * Ячейка футера узла в иерархической таблице
 */
export default class TreeGridNodeExtraItemCell extends TreeGridDataCell<null> {
    readonly '[Controls/treeGrid:TreeGridNodeExtraItemCell]': boolean;

    readonly listInstanceName: string =  'controls-TreeGrid__node-footer';

    readonly listElementName: string = 'cell';

    getTemplate(): TemplateFunction | string {
        const hasRowTemplate = this._$isSingleColspanedCell && !!this._$owner.getRowTemplate();
        const customTemplate = hasRowTemplate ? this._$column.template : this._$column.nodeFooterTemplate;
        return customTemplate || 'Controls/treeGrid:NodeFooterTemplate';
    }

    isMoreButtonFooter(): boolean {
        return !!((this.getOwner() as TreeGridNodeFooterRow).needMoreButton());
    }

    shouldRenderHasMoreButton(): boolean {
        return this.isMoreButtonFooter() && this._$isFirstDataCell;
    }

    isFirstColumn(): boolean {
        return this.getColumnIndex(false, false) === 0;
    }

    getWrapperClasses(): string {
        return `controls-TreeGrid__nodeFooter__wrapper ${this._getColumnSeparatorClasses()}`;
    }

    getContentClasses(params: {hasContent: boolean}): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();

        let classes =
            'controls-TreeGrid__nodeFooter-cell__content' +
            ' controls-TreeGrid__nodeFooterContent' +
            ` controls-TreeGrid__nodeFooterContent_rowSeparatorSize-${rowSeparatorSize}` +
            ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;

        if (params.hasContent || this.isMoreButtonFooter()) {
            classes += ' controls-TreeGrid__nodeFooter-cell_withContent';

            if (this.getOwner().isFullGridSupport()) {
                classes += ' controls-TreeGrid__nodeFooterContent__baseline';
            }
        }

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn()) {
            classes += ` controls-TreeGrid__nodeFooterContent_spacingLeft-${this._$owner.getLeftPadding()}`;
        }

        if (this.isLastColumn()) {
            classes += ` controls-TreeGrid__nodeFooterContent_spacingRight-${this._$owner.getRightPadding()}`;
        }

        return classes;
    }

    getRelativeCellWrapperClasses(params: { hasContent: boolean }): string {
        let classes = super.getRelativeCellWrapperClasses();

        if (params.hasContent || this.isMoreButtonFooter()) {
            classes += ' controls-TreeGrid__nodeFooterContent__baseline';
        }

        return classes;
    }
}

Object.assign(TreeGridNodeExtraItemCell.prototype, {
    '[Controls/treeGrid:TreeGridNodeExtraItemCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeExtraItemCell',
    _instancePrefix: 'tree-grid-node-footer-cell-'
});
