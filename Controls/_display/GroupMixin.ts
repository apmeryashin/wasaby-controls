import {
    TFontColorStyle,
    TFontSize,
    TFontWeight,
    TTextTransform,
    TIconSize,
    TIconStyle
} from 'Controls/interface';

/**
 * Миксин, который содержит общую логику отображения заголовка группы.
 */
export default abstract class GroupMixin {
    /**
     * Добавляет CSS классы для стилизации текста в заголовке группы.
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
     * CSS классы обёртки текста заголовка группы.
     * @param templateFontColorStyle
     * @param templateFontSize
     * @param templateFontWeight
     * @param templateTextTransform
     */
    getContentTextWrapperClasses(templateFontColorStyle?: TFontColorStyle,
                                 templateFontSize?: TFontSize,
                                 templateFontWeight?: TFontWeight,
                                 templateTextTransform?: TTextTransform): string {
        let classes = 'controls-ListView__groupContent-text_wrapper';
        classes += this.getContentTextStylingClasses(templateFontColorStyle, templateFontSize,
            templateFontWeight, templateTextTransform);
        return classes;
    }

    getContentTextClasses(separatorVisibility: boolean,
                          textAlign: 'right' | 'left'): string {
        let classes = 'controls-ListView__groupContent-text';
        classes += ` controls-ListView__groupContent_${textAlign || 'center'}`;

        if (separatorVisibility === false) {
            classes += ' controls-ListView__groupContent-withoutGroupSeparator';
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
        }
        return classes;
    }

    shouldDisplayLeftSeparator(separatorVisibility: boolean,
                               textVisible: boolean,
                               textAlign: string): boolean {
        return separatorVisibility !== false && textVisible !== false && textAlign !== 'left';
    }

    shouldDisplayRightSeparator(separatorVisibility: boolean,
                                textVisible: boolean,
                                textAlign: string): boolean {
        return separatorVisibility !== false && (textAlign !== 'right' || textVisible === false);
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

    abstract isExpanded(): boolean;
}
