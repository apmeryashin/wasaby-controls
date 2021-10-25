import {TFontColorStyle, TFontSize, TFontWeight, TIconSize, TIconStyle, TTextTransform} from 'Controls/interface';
import {IColumn} from 'Controls/grid';

/**
 * Миксин, который содержт логику отображения ячейки группы
 */
export default abstract class GroupCell<T> {
    getContentTextClasses(separatorVisibility: boolean,
                          textAlign: 'right' | 'left'): string {
        let classes = 'controls-ListView__groupContent-text';
        classes += ` controls-ListView__groupContent_${textAlign || 'center'}`;

        if (separatorVisibility === false) {
            classes += ' controls-ListView__groupContent-withoutGroupSeparator';
        }
        return classes;
    }

    /**
     * Добавляет CSS классы для стилизации текста в заголовке группы.
     * Настройки из шаблона по умолчанию имеют больший приоритет, т.к. обычные группы настраиваются через шаблон Controls/grid:GroupTemplate.
     * @param templateFontColorStyle Цвет шрифта
     * @param templateFontSize Размер шрифта
     * @param templateFontWeight Насыщенность шрифта
     * @param templateTextTransform Преобразование шрифта
     */
    getContentTextStylingClasses(templateFontColorStyle?: TFontColorStyle,
                                 templateFontSize?: TFontSize,
                                 templateFontWeight?: TFontWeight,
                                 templateTextTransform?: TTextTransform): string {
        let classes = '';
        classes += 'controls-ListView__groupContent-text_wrapper';
        if (templateFontSize) {
            classes += ` controls-fontsize-${templateFontSize}`;
        } else {
            classes += ' controls-ListView__groupContent-text_default';
        }
        if (templateFontColorStyle) {
            classes += ` controls-text-${templateFontColorStyle}`;
        } else {
            classes += ' controls-ListView__groupContent-text_color_default';
        }
        if (templateFontWeight) {
            classes += ` controls-fontweight-${templateFontWeight}`;
        }
        if (templateTextTransform) {
            classes += ` controls-ListView__groupContent_textTransform_${templateTextTransform}` +
                       ` controls-ListView__groupContent_textTransform_${templateTextTransform}_${templateFontSize || 's'}`;
        }
        return classes;
    }

    /**
     * Классы для настройки базовой линии группы.
     * @param templateFontSize
     * @private
     */
    protected _getBaseLineClasses(templateFontSize?: TFontSize): string {
        let classes = ' controls-ListView__groupContent_baseline ';
        if (templateFontSize &&
            templateFontSize !== 's' && templateFontSize !== 'xs' && templateFontSize !== 'inherit') {
            classes += ` controls-ListView__groupContent_baseline_${templateFontSize}`;
        } else {
            classes += ' controls-ListView__groupContent_baseline_default';
        }
        return classes;
    }

    getExpanderClasses(expanderVisible: boolean = true,
                       expanderAlign: 'right' | 'left' = 'left',
                       iconSize: TIconSize,
                       iconStyle: TIconStyle): string {
        let classes = '';
        if (expanderVisible !== false) {
            if (!this.isExpanded()) {
                classes += ' controls-ListView__groupExpander_collapsed';
                classes += ` controls-ListView__groupExpander_collapsed_${expanderAlign}`;
            }

            classes += ' controls-ListView__groupExpander ' +
                ` controls-ListView__groupExpander_${expanderAlign}` +
                ` controls-ListView__groupExpander-iconSize_${iconSize || 'default'}` +
                ` controls-ListView__groupExpander-iconStyle_${iconStyle || 'default'}`;

            classes += ' js-controls-Tree__row-expander';
        }
        return classes;
    }

    shouldDisplayLeftSeparator(separatorVisibility: boolean,
                               textVisible: boolean,
                               columnAlignGroup: number,
                               textAlign: string): boolean {
        return separatorVisibility !== false && textVisible !== false &&
            (columnAlignGroup !== undefined || textAlign !== 'left');
    }

    shouldDisplayRightSeparator(separatorVisibility: boolean,
                                textVisible: boolean,
                                columnAlignGroup: number,
                                textAlign: string): boolean {
        return separatorVisibility !== false &&
            (columnAlignGroup !== undefined || textAlign !== 'right' || textVisible === false);
    }

    protected _getWrapperSeparatorClasses(): string {
        let classes = '';
        classes += ' controls-Grid__no-rowSeparator';
        classes += ' controls-Grid__row-cell_withRowSeparator_size-null';
        return classes;
    }

    protected _getWrapperBaseClasses(templateHighlightOnHover: boolean): string {
        let classes = '';
        classes += ` controls-Grid__row-cell controls-Grid__cell_${this.getStyle()}`;
        classes += ` controls-Grid__row-cell_${this.getStyle()}`;

        return classes;
    }

    isContentCell(): boolean {
        return !(this._$owner.hasColumnScroll() && !this._$isFixed);
    }

    abstract isExpanded(): boolean;

    abstract getStyle(): string;

    abstract getColumnConfig(): IColumn;
}
