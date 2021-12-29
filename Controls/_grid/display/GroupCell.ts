import {TemplateFunction} from 'UI/Base';
import {Model as EntityModel, OptionsToPropertyMixin} from 'Types/entity';
import {mixin} from 'Types/util';

import {IColumn} from './interface/IColumn';
import {GroupMixin} from 'Controls/display';

import DataCell from './DataCell';
import GroupRow from './GroupRow';
import {TFontColorStyle, TFontSize, TFontWeight, TTextTransform, TIconSize, TIconStyle} from 'Controls/interface';

export interface IOptions<T> {
    owner: GroupRow<T>;
    column: IColumn;
    columnsLength: number;
    contents: string;
    groupTemplate: TemplateFunction | string;
    zIndex?: number;
    metaResults: EntityModel;
    colspanGroup?: boolean;
}

const FIXED_GROUP_CELL_Z_INDEX = 4;

/**
 * Ячейка строки, отображающей название группы
 */
export default class GroupCell<TContents extends EntityModel = EntityModel> extends mixin<
    DataCell<TContents, GroupRow<TContents>>,
    GroupMixin
>(DataCell, GroupMixin) {
    protected _$columnsLength: number;
    protected _$contents: string;
    protected _$zIndex: number;
    protected _$groupTemplate: TemplateFunction | string;
    protected _$metaResults: EntityModel;
    protected _$colspanGroup: EntityModel;

    readonly listInstanceName: string = 'controls-Grid__group';

    constructor(options?: IOptions<TContents>) {
        super(options);
        OptionsToPropertyMixin.call(this, options);
    }

    // region overrides

    getWrapperStyles(): string {
        return this.getColspanStyles();
    }

    getContentClasses(): string {
        let classes = '';

        if (this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }
        if (this.isLastColumn()) {
            classes += ` controls-Grid__cell_spacingLastCol_${this._$owner.getRightPadding()}`;
        }

        classes += this._getContentAlignClasses();
        classes += ' controls-ListView__groupContent';
        classes += ' controls-ListView__groupContent_height';
        return classes;
    }

    getZIndex(): number {
        return this._$isFixed ? Math.max(FIXED_GROUP_CELL_Z_INDEX, this._$zIndex) : this._$zIndex;
    }

    getContentStyles(): string {
        return 'display: contents;';
    }

    getTemplate(): TemplateFunction | string {
        return this._$groupTemplate;
    }

    // endregion overrides

    // region Аспект "Рендер"

    getDefaultDisplayValue(): string {
        return this._$contents;
    }

    // endregion Аспект "Рендер"

    // region Аспект "Ячейка группы"

    getRightTemplateClasses(separatorVisibility: boolean,
                            textVisible: boolean,
                            columnAlignGroup: number): string {
        let classes = 'controls-ListView__groupContent-rightTemplate';
        const groupPaddingClasses = this._$owner.getGroupPaddingClasses('right');

        if (!this._shouldFixGroupOnColumn(columnAlignGroup, textVisible)) {
            classes += ' ' + groupPaddingClasses;
        }

        // should add space before rightTemplate
        if (!this._$colspanGroup || (separatorVisibility === false && textVisible === false)) {
            classes += ' controls-ListView__groupContent-withoutGroupSeparator controls-ListView__groupContent_right';
        }

        return classes;
    }

    getMetaResults(): EntityModel {
        return this._$metaResults;
    }

    isExpanded(): boolean {
        return this._$owner.isExpanded();
    }

    protected _shouldFixGroupOnColumn(columnAlignGroup: number, textVisible: boolean): boolean {
        return textVisible !== false &&
            columnAlignGroup !== undefined &&
            columnAlignGroup < this._$columnsLength - (this._$owner.hasMultiSelectColumn() ? 1 : 0);
    }

    getExpanderClasses(expanderVisible: boolean = true,
                       expanderAlign: 'right' | 'left' = 'left',
                       iconSize: TIconSize,
                       iconStyle: TIconStyle): string {
        let classes = super.getExpanderClasses(expanderVisible, expanderAlign, iconSize, iconStyle);
        if (expanderVisible !== false) {
            classes += ' js-controls-Tree__row-expander';
        }
        return classes;
    }

    protected _getWrapperSeparatorClasses(): string {
        let classes = ' controls-Grid__no-rowSeparator';
        classes += ' controls-Grid__row-cell_withRowSeparator_size-null';
        return classes;
    }

    protected _getWrapperBaseClasses(templateHighlightOnHover: boolean): string {
        let classes = ` controls-Grid__row-cell controls-Grid__cell_${this.getStyle()}`;
        classes += ` controls-Grid__row-cell_${this.getStyle()}`;
        return classes;
    }

    isContentCell(): boolean {
        return !(this._$owner.hasColumnScroll() && !this._$isFixed);
    }

    // endregion Аспект "Ячейка группы"

    getVerticalStickyHeaderPosition(): string {
        return 'top';
    }

    getStickyHeaderMode(): string {
        return 'replaceable';
    }
}

Object.assign(GroupCell.prototype, {
    '[Controls/_display/grid/GroupCell]': true,
    _moduleName: 'Controls/grid:GridGroupCell',
    _instancePrefix: 'grid-group-cell-',
    _$owner: null,
    _$columnsLength: null,
    _$zIndex: 2,
    _$colspanGroup: true,
    _$contents: null,
    _$groupTemplate: 'Controls/grid:GroupTemplate',
    _$metaResults: null
});
