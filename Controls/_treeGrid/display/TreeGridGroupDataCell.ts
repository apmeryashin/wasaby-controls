import {TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {mixin} from 'Types/util';
import {GridGroupCellMixin, IGridRowOptions} from 'Controls/grid';
import TreeGridDataCell, {ITreeGridDataCellOptions} from 'Controls/_treeGrid/display/TreeGridDataCell';
import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';

const GROUP_CELL_TEMPLATE = 'Controls/treeGrid:GroupColumnTemplate';

export interface ITreeGridGroupDataCell extends ITreeGridDataCellOptions<Model> {
    isExpanded: boolean;
}

/**
 * Ячейка строки с данными, которая отображается в виде группы
 */
export default class TreeGridGroupDataCell<T extends Model = Model> extends mixin<
    TreeGridDataCell<T>, GridGroupCellMixin<T>
>(TreeGridDataCell, GridGroupCellMixin) {
    readonly '[Controls/treeGrid:TreeGridGroupDataCell]': boolean;

    protected readonly _$column: IGroupNodeColumn;
    readonly _$isExpanded: boolean;

    constructor(options?: IGridRowOptions<T>) {
        super(options);
    }

    getTemplate(): TemplateFunction | string {
        const isFirstDataColumn = this.getColumnIndex() === (this._$owner.hasMultiSelectColumn() ? 1 : 0);
        if (this._$column.groupNodeConfig || isFirstDataColumn) {
            return GROUP_CELL_TEMPLATE;
        }
        return this._$column.template || this._defaultCellTemplate;
    }

    getWrapperClasses(
        backgroundColorStyle: string,
        templateHighlightOnHover?: boolean,
        templateHoverBackgroundStyle?: string
    ): string {
        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses();

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses()}`;
        }

        return wrapperClasses;
    }

    getContentClasses(): string {
        let classes = '';
        classes += ' controls-Grid__row-cell__content_baseline_default';
        classes += this._getHorizontalPaddingClasses(this._$column.cellPadding);
        if (this._$owner.hasMultiSelectColumn() && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }
        classes += this._getContentAlignClasses();
        classes += ' controls-ListView__groupContent';
        return classes;
    }

    // region Аспект "Ячейка группы"

    isExpanded(): boolean {
        return this._$isExpanded;
    }

    // endregion Аспект "Ячейка группы"
}

Object.assign(TreeGridGroupDataCell.prototype, {
    '[Controls/treeGrid:TreeGridGroupDataCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridGroupDataCell',
    _instancePrefix: 'tree-grid-group-data-cell-',
    _$isExpanded: null
});
