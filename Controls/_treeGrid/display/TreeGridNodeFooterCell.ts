import { TemplateFunction } from 'UI/Base';
import TreeGridDataCell from './TreeGridDataCell';
import {COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';
import TreeGridNodeFooterRow from 'Controls/_treeGrid/display/TreeGridNodeFooterRow';

/**
 * Ячейка футера узла в иерархической таблице
 */
export default class TreeGridNodeFooterCell extends TreeGridDataCell<null> {
    readonly '[Controls/treeGrid:TreeGridNodeFooterCell]': boolean;

    getTemplate(content?: TemplateFunction): TemplateFunction|string {
        // TODO: Возвращать шаблон кнопки "Ещё".
        //  https://online.sbis.ru/opendoc.html?guid=15b9412b-159f-463c-9f4e-fa15a64fda4b
        return (this.getOwner() as TreeGridNodeFooterRow).needMoreButton() ? null : content;
    }

    getContentClasses(
        backgroundColorStyle: string,
        cursor: string = 'pointer',
        templateHighlightOnHover: boolean = true,
        colspan?: boolean
    ): string {
        const rowSeparatorSize = this._$owner.getRowSeparatorSize();

        let classes =
            'controls-TreeGrid__nodeFooterContent' +
            ` controls-TreeGrid__nodeFooterContent_rowSeparatorSize-${rowSeparatorSize}` +
            ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;

        if (colspan !== false) {
            classes += ' controls-TreeGrid__nodeFooterContent_colspaned';
        }

        if (!this._$owner.hasMultiSelectColumn() && this.isFirstColumn(colspan)) {
            classes += ` controls-TreeGrid__nodeFooterContent_spacingLeft-${this._$owner.getLeftPadding()}`;
        }

        if (this.isLastColumn(colspan)) {
            classes += ` controls-TreeGrid__nodeFooterContent_spacingRight-${this._$owner.getRightPadding()}`;
        }

        return classes;
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    getColspanStyles(colspan?: boolean): string {
        if (this._$isFixed) {
            return `grid-column: ${this.getColumnIndex() + 1} / ${this.getColumnIndex() + 2}`;
        }

        if (colspan !== false) {
            let start = 1;
            let end = this.getOwner().getGridColumnsConfig().length + 1;

            if (this.getOwner().hasMultiSelectColumn()) {
                start += 1;
                end += 1;
            }
            if (this.getOwner().hasItemActionsSeparatedCell()) {
                end += 1;
            }
            if (this.getOwner().isFullGridSupport() && this.getOwner().hasColumnScroll()) {
                start += this.getOwner().getStickyColumnsCount();
            }
            // В данный момент поддержан только один сценарий застиканной лесенки
            // и футеров узлов: лесенка для первого столбца.
            // Чтобы поддержать все сценарии нужно переписать nodeFooterTemplate::colspan на Tree::colspanCallback
            if (this.getOwner().isSupportStickyLadder()) {
                start += 1;
                end += 1;
            }

            return `grid-column: ${start} / ${end}`;
        }

        return '';
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов на Tree::colspanCallback
    getColspan(colspan?: boolean): number {
        if (colspan !== false) {
            return this.getOwner().getGridColumnsConfig().length;
        }

        return 1;
    }
}

Object.assign(TreeGridNodeFooterCell.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-cell-'
});
