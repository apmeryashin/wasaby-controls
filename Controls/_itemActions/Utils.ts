import { Logger } from 'UI/Utils';

const deprecatedStyles = {
    error: 'danger',
    done: 'success',
    attention: 'warning',
    default: 'secondary'
};

export class Utils {
    /**
     * Позволяет сконвертировать старый стиль типа error, attention и тд в актуальный
     * И генерирует предупреждение в консоль, о том, что такой стиль устарел.
     * @param style
     * @param controlName
     */
    static getStyle(style: 'secondary'|'warning'|'danger'|'success', controlName: string): 'secondary'|'warning'|'danger'|'success' {
        if (!style) {
            return 'secondary';
        }
        if (style in deprecatedStyles) {
            Logger.warn(controlName + ': Используются устаревшие стили. Используйте ' + deprecatedStyles[style] + ' вместо ' + style, this);
            return deprecatedStyles[style];
        }
        return style;
    }

    /**
     * Позволяет вытащить из icon старый стиль типа icon-error, icon-attention и т.д.
     * И генерирует предупреждение в консоль, о том, что стилизация иконок при помощи таких CSS-классов устарела.
     * @param style
     * @param icon
     * @param controlName
     */
    static getStyleFromIcon(style: 'secondary'|'warning'|'danger'|'success', icon: string, controlName: string): 'secondary'|'warning'|'danger'|'success' {
        const styleFromIcon = icon && Object.keys(deprecatedStyles).find((key) => icon.indexOf(`icon-${key}`) !== -1);
        if (styleFromIcon) {
            Logger.warn(controlName + ': Используются устаревшие стили. Используйте опцию iconStyle вместо устаревшего CSS класса icon-' + styleFromIcon, this);
            return deprecatedStyles[styleFromIcon];
        }
        return style;
    }
}
