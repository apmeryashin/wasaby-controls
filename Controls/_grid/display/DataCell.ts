import {mixin} from 'Types/util';
import {Record, Model} from 'Types/entity';

import {IMarkable, ILadderConfig, TLadderElement} from 'Controls/display';

import {IDisplaySearchValue, IDisplaySearchValueOptions} from './interface/IDisplaySearchValue';

import ITagCell from './interface/ITagCell';
import ILadderContentCell from './interface/ILadderContentCell';
import IItemActionsCell from './interface/IItemActionsCell';
import Cell, {IOptions as ICellOptions} from './Cell';
import DataRow from './DataRow';
import DataCellCompatibility from './compatibility/DataCell';
import {TemplateFunction} from 'UI/Base';
import {
    IFontColorStyleOptions,
    TFontColorStyle,
    IFontSizeOptions,
    TFontSize,
    IFontWeightOptions,
    TFontWeight,
    ISearchValueOptions
} from 'Controls/interface';
import {IColumn, IDisplayTypeOptions} from 'Controls/_grid/display/interface/IColumn';

interface IContentRenderOptions extends IFontColorStyleOptions, IFontSizeOptions,
    IFontWeightOptions, ISearchValueOptions {
    displayTypeOptions: IDisplayTypeOptions;
    value: string | number;
}

export interface IOptions<T> extends ICellOptions<T>, IDisplaySearchValueOptions {
    markerPosition: string;
}

const LADDER_RENDER = 'Controls/grid:TypesLadderWrapper';

/**
 * Ячейка строки таблицы, которая отображает данные из RecordSet-а
 */
export default class DataCell<T extends Model = Model, TOwner extends DataRow<T> = DataRow<T>> extends mixin<
    Cell<T, TOwner>,
    DataCellCompatibility<T>
>(
    Cell,
    DataCellCompatibility
) implements IMarkable, ITagCell, IItemActionsCell, ILadderContentCell, IDisplaySearchValue {

    readonly DisplaySearchValue: boolean = true;
    readonly Markable: boolean = true;
    readonly Draggable: boolean = true;
    readonly TagCell: boolean = true;
    readonly ItemActionsCell: boolean = true;
    readonly LadderContentCell: boolean = true;

    protected _$searchValue: string;

    get ladder(): TLadderElement<ILadderConfig> {
        return this.getOwner().getLadder();
    }

    shouldDrawLadderContent(ladderProperty: string, stickyProperty: string): boolean {
        return this.getOwner().shouldDrawLadderContent(ladderProperty, stickyProperty);
    }

    getLadderWrapperClasses(ladderProperty: string, stickyProperty: string): boolean {
        return this.getOwner().getLadderWrapperClasses(ladderProperty, stickyProperty);
    }

    setSearchValue(searchValue: string): void {
        this._$searchValue = searchValue;
        this._nextVersion();
    }

    getContentClasses(
        backgroundColorStyle: string = this._$column.backgroundColorStyle,
        cursor: string = 'pointer',
        templateHighlightOnHover: boolean = true,
        tmplIsEditable: boolean = true,
        templateHoverBackgroundStyle?: string
    ): string {
        let classes = super.getContentClasses(backgroundColorStyle, cursor, templateHighlightOnHover,
            tmplIsEditable, templateHoverBackgroundStyle);

        if (this._$owner.isAnimatedForSelection()) {
            classes += ' controls-ListView__item_rightSwipeAnimation';
        }

        if (this._$owner.getEditingConfig()?.mode === 'cell') {
            classes += ' controls-Grid__row-cell_editing-mode-single-cell';

            if (this.isFirstColumn()) {
                classes += ' controls-Grid__row-cell_editing-mode-single-cell_first';
            }

            if (this.isLastColumn()) {
                classes += ' controls-Grid__row-cell_editing-mode-single-cell_last';
            }

            if (this.isEditing()) {
                classes += ' controls-Grid__row-cell_single-cell_editing';
            } else {
                if (this.config.editable !== false && tmplIsEditable !== false) {
                    classes += ' controls-Grid__row-cell_single-cell_editable';
                } else {
                    classes += ' js-controls-ListView__notEditable controls-Grid__row-cell_single-cell_not-editable';
                }
            }
        }

        return classes;
    }

    /**
     * Предоставляет набор опций для декоратора,
     * если контент колонки выводится через декоратор
     * @param templateFontColorStyle Цвет шрифта
     * @param templateFontSize Размер шрифта
     * @param templateFontWeight Насыщенность шрифта
     */
    getCellContentRenderOptions(templateFontColorStyle?: TFontColorStyle,
                                templateFontSize?: TFontSize,
                                templateFontWeight?: TFontWeight): IContentRenderOptions {
        const columnConfig: IColumn = this.getColumnConfig();
        return {
            displayTypeOptions: columnConfig.displayTypeOptions,
            fontColorStyle: columnConfig.fontColorStyle || templateFontColorStyle,
            fontSize: columnConfig.fontSize || templateFontSize,
            fontWeight: columnConfig.fontWeight || templateFontWeight,
            value: this.getDefaultDisplayValue(),
            searchValue: this.getSearchValue()
        };
    }

    getWrapperClasses(
        backgroundColorStyle: string,
        templateHighlightOnHover?: boolean,
        templateHoverBackgroundStyle?: string
    ): string {
        let classes = super.getWrapperClasses(backgroundColorStyle, templateHighlightOnHover,
            templateHoverBackgroundStyle);

        if (this.isFirstColumn()) {
            classes += ` controls-Grid__row-cell__first-${this.getStyle()}`;
        }
        if (this.isLastColumn()) {
            classes += ` controls-Grid__row-cell__last-${this.getStyle()}`;
        }

        // нужен shouldDisplayMarker именно для всего элемента, т.к. эти стили навешиваются на все ячейки для текста
        if (this.getOwner().shouldDisplayMarker()) {
            classes += ` controls-Grid__row-cell_selected controls-Grid__row-cell_selected-${this.getStyle()}`;

            if (this.isFirstColumn()) {
                classes += ` controls-Grid__row-cell_selected__first-${this.getStyle()}`;
            }
            if (this.isLastColumn()) {
                classes += ' controls-Grid__row-cell_selected__last';
                classes += ` controls-Grid__row-cell_selected__last-${this.getStyle()}`;
            }
        }

        if (this._$isFixed && this._$owner.getEditingConfig()?.mode === 'cell') {
            classes += ' controls-Grid__row-cell_single-cell-editable_fixed';
        }

        return classes;
    }

    // region Аспект "Рендер"

    hasCellContentRender(): boolean {
        return Boolean(
            this.ladder && this.ladder[this.getDisplayProperty()] ||
            super.hasCellContentRender()
        );
    }

    getCellContentRender(clean: boolean = false): string {
        if (!clean && this.ladder && this.ladder[this.getDisplayProperty()]) {
            return LADDER_RENDER;
        } else {
            return super.getCellContentRender();
        }
    }

    getDefaultDisplayValue(): string | number {
        const itemModel = this._$owner.getContents();
        if (itemModel instanceof Record) {
            return itemModel.get(this.getDisplayProperty());
        } else {
            return itemModel[this.getDisplayProperty()];
        }
    }

    getTooltip(): string {
        const itemModel = this._$owner.getContents();

        if (itemModel instanceof Record) {
            return itemModel.get(this.getTooltipProperty());
        } else {
            return itemModel[this.getTooltipProperty()];
        }
    }

    // endregion

    // region Аспект "Маркер"
    shouldDisplayMarker(marker?: boolean): boolean {
        if (this.getMarkerPosition() === 'right') {
            return this._$owner.shouldDisplayMarker(marker) && this.isLastColumn();
        } else {
            return (
                marker !== false &&
                this._$owner.isMarked() &&
                !this.isEditing() &&
                !this._$owner.hasMultiSelectColumn() &&
                this._$isFirstDataCell
            );
        }
    }

    // endregion

    // region Аспект "Тег"

    /**
     * Возвращает флаг, что надо или не надо показывать тег
     * @param tagStyle
     */
    shouldDisplayTag(tagStyle?: string): boolean {
        return !!this.getTagStyle(tagStyle);
    }

    /**
     * Возвращает tagStyle для текущей колонки
     * @param tagStyle параметр, переданный напрямую в шаблон прикладниками
     */
    getTagStyle(tagStyle?: string): string {
        if (tagStyle) {
            return tagStyle;
        }
        const contents: Model = this._$owner.getContents() as undefined as Model;
        return this._$column.tagStyleProperty &&
            contents.get(this._$column.tagStyleProperty);
    }

    /**
     * Возвращает CSS класс для передачи в шаблон tag
     */
    getTagClasses(): string {
        return 'controls-Grid__cell_tag';
    }

    // endregion

    // region Аспект "Редактирование по месту"

    isEditing(): boolean {
        if (this.getOwner().getEditingConfig()?.mode === 'cell') {
            return this.getOwner().isEditing() && this.getOwner().getEditingColumnIndex() === this.getColumnIndex();
        } else {
            return this.getOwner().isEditing();
        }
    }

    getEditorViewTemplateClasses(params): string {
        return this.getOwner().getEditorViewTemplateClasses(params);
    }

    // endregion

    // region Аспект "Кнопка редактирования"

    shouldDisplayEditArrow(contentTemplate?: TemplateFunction): boolean {
        if (!!contentTemplate || this.getColumnIndex() > (this._$owner.hasMultiSelectColumn() ? 1 : 0)) {
            return false;
        }
        return this._$owner.editArrowIsVisible(this._$owner.getContents());
    }

    // endregion

    // region Аспект "Обрезка текста по многоточию"

    getTextOverflowClasses(): string {
        let classes = `controls-Grid__cell_${this.config.textOverflow || 'none'}`;

        // Для правильного отображения стрелки редактирования рядом с текстом, который
        // обрезается нужно повесить на контейнер с этим текстом специальные CSS классы
        if (this.config.textOverflow && this.shouldDisplayEditArrow(null)) {
            classes += ' controls-Grid__editArrow-cellContent';
            classes += ` controls-Grid__editArrow-overflow-${this.config.textOverflow}`;
        }
        return classes;
    }

    getTooltipOverflowClasses(): string {
        return this.hasCellContentRender() ? `controls-Grid__cell_tooltip_${this.config.textOverflow || 'none'}` : '';
    }

    getTextOverflowTitle(): string | number {
        return this.config.textOverflow &&
           !this.config.template &&
           !this.config.tooltipProperty ? this.getDefaultDisplayValue() : '';
    }

    // endregion

    // region Drag-n-drop

    shouldDisplayDraggingCounter(): boolean {
        return this.isLastColumn() && this.getOwner().shouldDisplayDraggingCounter();
    }

    // endregion Drag-n-drop
}

Object.assign(DataCell.prototype, {
    '[Controls/_display/grid/DataCell]': true,
    _moduleName: 'Controls/grid:GridDataCell',
    _$searchValue: '',
    _instancePrefix: 'grid-data-cell-'
});
