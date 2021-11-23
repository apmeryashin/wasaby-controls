import {TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {mixin} from 'Types/util';
import {GroupMixin} from 'Controls/display';
import {IGridRowOptions} from 'Controls/grid';
import TreeGridDataCell, {ITreeGridDataCellOptions} from 'Controls/_treeGrid/display/TreeGridDataCell';
import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';
import {TFontColorStyle, TFontSize, TFontWeight, TIconSize, TIconStyle, TTextTransform} from 'Controls/interface';

const GROUP_CELL_TEMPLATE = 'Controls/treeGrid:GroupColumnTemplate';

export interface ITreeGridGroupDataCell extends ITreeGridDataCellOptions<Model> {
    isExpanded: boolean;
}

/**
 * Ячейка строки с данными, которая отображается в виде группы
 */
export default class TreeGridGroupDataCell<T extends Model = Model> extends mixin<
    TreeGridDataCell<T>, GroupMixin
>(TreeGridDataCell, GroupMixin) {
    readonly '[Controls/treeGrid:TreeGridGroupDataCell]': boolean;

    protected readonly _$column: IGroupNodeColumn;
    readonly _$isExpanded: boolean;

    readonly listInstanceName: string =  'controls-TreeGrid__group';

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

        wrapperClasses += ` controls-Grid__row-cell controls-Grid__cell_${this.getStyle()}`;
        wrapperClasses += ` controls-Grid__row-cell_${this.getStyle()}`;
        wrapperClasses += ' controls-Grid__no-rowSeparator';
        wrapperClasses += ' controls-Grid__row-cell_withRowSeparator_size-null';

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses()}`;
        }

        return wrapperClasses;
    }

    getContentClasses(): string {
        let classes = '';
        classes += this._getHorizontalPaddingClasses(this._$column.cellPadding);
        if (this._$owner.shouldDisplayMultiSelectTemplate() && this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }
        classes += this._getContentAlignClasses();
        classes += ' controls-ListView__groupContent';

        classes += ' controls-ListView__groupContent_height';
        if (this.shouldDisplayItemActions()) {
            classes += '_withItemActions';
        }
        return classes;
    }

    /**
     * Добавляет CSS классы для стилизации текста в заголовке группы
     * Настройки из groupNodeConfig по умолчанию имеют больший приоритет, т.к. это настройки заголовка группы
     * Настройки из конфига колонки в этом случае на втором месте
     * Настройки из шаблона в этом случае имеют самый низкий приолритет, т.к. это настройки Controls/treeGrid:ItemTemplate
     * @param templateFontColorStyle Цвет шрифта
     * @param templateFontSize Размер шрифта
     * @param templateFontWeight Насыщенность шрифта
     * @param templateTextTransform Преобразование шрифта
     */
    getContentTextWrapperClasses(templateFontColorStyle?: TFontColorStyle,
                                 templateFontSize?: TFontSize,
                                 templateFontWeight?: TFontWeight,
                                 templateTextTransform?: TTextTransform): string {
        const config = this.getColumnConfig() as IGroupNodeColumn;
        const fontColorStyle = config.groupNodeConfig?.fontSize || config.fontColorStyle || templateFontColorStyle;
        const fontSize = config.groupNodeConfig?.fontSize || config.fontSize || templateFontSize;
        const fontWeight = config.groupNodeConfig?.fontWeight || config.fontWeight || templateFontWeight;
        const textTransform = config.groupNodeConfig?.textTransform || templateTextTransform;

        return super.getContentTextWrapperClasses(fontColorStyle, fontSize, fontWeight, textTransform);
    }

    // region Аспект "Ячейка группы"

    isExpanded(): boolean {
        return this._$isExpanded;
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

    // endregion Аспект "Ячейка группы"
}

Object.assign(TreeGridGroupDataCell.prototype, {
    '[Controls/treeGrid:TreeGridGroupDataCell]': true,
    _moduleName: 'Controls/treeGrid:TreeGridGroupDataCell',
    _instancePrefix: 'tree-grid-group-data-cell-',
    _$isExpanded: null
});
