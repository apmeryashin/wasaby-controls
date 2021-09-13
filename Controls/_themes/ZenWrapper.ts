import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_themes/ZenWrapper/Template';
import {IRgbColor} from 'Controls/_themes/interface/IColor';
import {toRgb} from 'Controls/Utils/colorUtil';

type TBrightness = 'dark' | 'light';

export interface IZenWrapperOptions extends IControlOptions {
    dominantColor: string;
    complementaryColor: string;
    brightness: TBrightness;
}

/**
 * Контейнер для стилизации элементов, лежащих на фоне некоторого изображения. Цвета элементов рассчитываются исходя из доминантного цвета изображения и комплиментарного к нему.
 * @class Controls/_themes/ZenWrapper
 * @extends UI/Base:Control
 * @author Клепиков И.А.
 * @public
 * @demo Controls-demo/themes/ZenWrapper/Index
 * @remark Доминантный и комплиментарный цвет изображения должны быть вычисоены заранее и переданы в опции контрола.
 */

export default class ZenWrapper extends Control<IZenWrapperOptions> {
    protected _template: TemplateFunction = template;
    protected _variables: object = {};

    protected _beforeMount(options: IZenWrapperOptions): void {
        this._variables = ZenWrapper.getDerivedStateFromProps(options);
    }

    protected _beforeUpdate(options: IZenWrapperOptions): void {
        if (options.dominantColor !== this._options.dominantColor ||
            options.complementaryColor !== this._options.complementaryColor ||
            options.brightness !== this._options.brightness
        ) {
            this._variables = ZenWrapper.getDerivedStateFromProps(options);
        }
    }

    static calculateRGB(color: string): IRgbColor {
        let preparedColor = color;
        if (/^(\d+),\s*(\d+),\s*(\d+)$/.test(color)) {
            preparedColor = 'rgb(' + color + ')';
        }
        const calculatedRGB = toRgb(preparedColor);
        return calculatedRGB ? {
            r: calculatedRGB.r,
            g: calculatedRGB.g,
            b: calculatedRGB.b
        } :  { r: 255, g: 255, b: 255 };
    }

    static calculateVariables(dominantRGB: IRgbColor,
                              complementaryRGB: IRgbColor, brightness: TBrightness): object {
        const baseVars = ZenWrapper.calculateBaseVariables(dominantRGB, complementaryRGB, brightness);
        const buttonsVars = ZenWrapper.calculateButtonsVariables(dominantRGB, complementaryRGB, brightness);
        const decoratorsVars = ZenWrapper.calculateDecoratorsVariables(dominantRGB, complementaryRGB, brightness);
        const listsVars = ZenWrapper.calculateListsVariables(dominantRGB, complementaryRGB, brightness);
        const headingVars = ZenWrapper.calculateHeadingVariables(dominantRGB, complementaryRGB, brightness);
        const toggleVars = ZenWrapper.calculateToggleVariables(dominantRGB, complementaryRGB, brightness);
        const inputVars = ZenWrapper.calculateInputVariables(dominantRGB, complementaryRGB, brightness);
        return {
            ...baseVars,
            ...buttonsVars,
            ...decoratorsVars,
            ...listsVars,
            ...headingVars,
            ...toggleVars,
            ...inputVars
        };
    }

    static calculateBaseVariables(dominantRGB: IRgbColor,
                                  complementaryRGB: IRgbColor, brightness: TBrightness): object {
        return {
            '--text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--icon-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--label_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--link_text-color': ZenWrapper.getMonochromeColor(brightness),
            '--unaccented_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--unaccented_icon-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--readonly_color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.3'),
            '--primary_text-color': ZenWrapper.getColor(complementaryRGB),
            '--primary_icon-color': ZenWrapper.getColor(complementaryRGB),
            '--primary_hover_icon-color': ZenWrapper.getColor(complementaryRGB),
            '--primary_border-color': ZenWrapper.getColor(complementaryRGB),
            '--secondary_text-color': ZenWrapper.getMonochromeColor(brightness),
            '--secondary_icon-color': ZenWrapper.getMonochromeColor(brightness),
            '--link_text-color_inline': ZenWrapper.getMonochromeColor(brightness),
            '--link_hover_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--link_hover_text-color_inline': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--label_hover_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--label_hover_icon-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--pale_contrast_background-color': brightness === 'light' ?
                    ZenWrapper.getColorWithOpacity(complementaryRGB, '0.2') :
                    ZenWrapper.getColorWithOpacity(dominantRGB, '0.6'),
            '--pale_border-color': 'transparent',
            '--pale_hover_contrast_background-color': ZenWrapper.getColor(complementaryRGB),
            '--pale_active_contrast_background-color': ZenWrapper.getColor(complementaryRGB),
            '--hover_background-color': brightness === 'dark' ?
                ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.1') :
                ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.05')
        };
    }

    static calculateButtonsVariables(dominantRGB: IRgbColor,
                                     complementaryRGB: IRgbColor, brightness: TBrightness): object {
        return {
            '--text-color_button': ZenWrapper.getMonochromeColor(brightness),
            '--text-contrast-color_button': brightness === 'light' ? '#fff' : '#000',
            '--primary_background-color_button': 'transparent',
            '--primary_hover_same_background-color': ZenWrapper.getColorWithOpacity(complementaryRGB, '0.3'),
            '--primary_active_same_background-color': ZenWrapper.getColorWithOpacity(complementaryRGB, '0.6'),
            '--primary_contrast_background-color': ZenWrapper.getColor(complementaryRGB),
            '--primary_hover_contrast_background-color': ZenWrapper.getColorWithOpacity(complementaryRGB, '0.8'),
            '--primary_active_contrast_background-color': ZenWrapper.getColorWithOpacity(complementaryRGB, '0.6'),
            '--readonly_background-color_button': 'transparent',
            '--border-color_hover_button_toolButton': 'transparent',
            '--readonly_border-color_button_functionalButton': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.3'),
            '--background-color_button_toolButton': ZenWrapper.getColor(dominantRGB),
            '--background-color_hover_button_toolButton': ZenWrapper.getColor(complementaryRGB),
            '--pale_active_contrast_background-color': ZenWrapper.getColor(complementaryRGB),
            '--readonly_border-color_button_toolButton': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.3')
        };
    }

    static calculateDecoratorsVariables(dominantRGB: IRgbColor,
                                        complementaryRGB: IRgbColor, brightness: TBrightness): object {
        return {
            '--default_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--primary_text-color_decorator_fraction': ZenWrapper.getColorWithOpacity(complementaryRGB, '0.5'),
            '--secondary_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--unaccented_text-color_decorator_fraction':  ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--label_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--readOnly_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.3')
        };
    }

    static calculateListsVariables(dominantRGB: IRgbColor,
                                   complementaryRGB: IRgbColor, brightness: TBrightness): object {
        return {
            '--node_expander_icon-color_treeGrid': ZenWrapper.getMonochromeColor(brightness),
            '--marker_color_list': ZenWrapper.getColor(complementaryRGB),
            '--item_shadow-color_columns': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.15'),
            '--item_hover_shadow-color_columns':  ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.45')
        };
    }

    static calculateHeadingVariables(dominantRGB: IRgbColor,
                                     complementaryRGB: IRgbColor, brightness: TBrightness): object {
        return {
            '--primary_hover_text-color_heading': ZenWrapper.getColorWithOpacity(complementaryRGB, '0.8'),
            '--secondary_hover_text-color_heading': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8')
        };
    }

    static calculateToggleVariables(dominantRGB: IRgbColor,
                                    complementaryRGB: IRgbColor, brightness: TBrightness): object {
        return {
            '--icon_container_background_color_BigSeparator':  brightness === 'dark' ?
                            ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.2') :
                            ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.1'),
            '--icon-color_BigSeparator': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--hover_icon-color_BigSeparator': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8')
        };
    }

    static calculateInputVariables(dominantRGB: IRgbColor,
                                   complementaryRGB: IRgbColor, brightness: TBrightness): object {
        const borderTLR = ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.1');
        const borderB = ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.3');

        return {
            '--border-color_inputText': borderTLR,
            '--border-color_hover_inputText': [borderTLR, borderTLR, borderB, borderTLR].join(' '),
            '--border-color_focus_inputText': [borderTLR, borderTLR, borderB, borderTLR].join(' '),
            '--border-contrast-color_inputText': borderTLR,
            '--border-contrast-color_hover_inputText': [borderTLR, borderTLR, borderB, borderTLR].join(' '),
            '--border-contrast-color_focus_inputText': [borderTLR, borderTLR, borderB, borderTLR].join(' '),
            '--placeholder-color_inputText': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.4')
        };
    }

    static getMonochromeColor(brightness: TBrightness): string {
        return brightness === 'dark' ? '#fff' : '#000';
    }

    static getMonochromeColorWithOpacity(brightness: TBrightness, opacity: string = '1'): string {
        return brightness === 'dark' ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
    }

    static getColor(rgb: IRgbColor): string {
        const {r: red, g: green, b: blue} = rgb;
        return `rgb(${red},${green},${blue})`;
    }

    static getColorWithOpacity(rgb: IRgbColor, opacity: string = '1'): string {
        const {r: red, g: green, b: blue} = rgb;
        return `rgba(${red},${green},${blue},${opacity})`;
    }

    static getDerivedStateFromProps(options: IZenWrapperOptions): object {
        return ZenWrapper.calculateVariables(
            ZenWrapper.calculateRGB(options.dominantColor),
            ZenWrapper.calculateRGB(options.complementaryColor),
            options.brightness
        );
    }
}

/**
 * @name Controls/_themes/ZenWrapper#dominantColor
 * @cfg {String} Задает доминантный цвет изображения на фоне которого строится контрол. Цвет в формате rgb - 45, 34, 81
 * @remark
 * @example
 * Установлен доминантный цвет
 * <pre>
 *    <Controls.themes:ZenWrapper dominantColor="255, 255, 255 >
 *       <ws:partial template="MyModule/someContent" />
 *    </Controls.themes:ZenWrapper>
 * </pre>
 * @see option complementaryColor
 */

/**
 * @name Controls/_themes/ZenWrapper#complementaryColor
 * @cfg {String} Задает комплиментарный цвет к доминантному цвет изображения на фоне которого строится контрол. Цвет в формате rgb - 45, 34, 81
 * @remark
 * @example
 * Установлен комплиментарный цвет
 * <pre>
 *    <Controls.themes:ZenWrapper complementaryColor="178, 35, 35" >
 *       <ws:partial template="MyModule/someContent" />
 *    </Controls.themes:ZenWrapper>
 * </pre>
 * @see option dominantColor
 */

/**
 * @name Controls/_themes/ZenWrapper#brightness
 * @cfg {String} Определяет темным или светлым является доминантный цвет изображения.
 * @variant dark Изображение с доминантным темным цветом.
 * @variant light Изображение с доминантным светлым цветом.
 * @default light
 * @example
 * Кнопка в режиме отображения "linkButton".
 * Установлен комплиментарный цвет и яркость "светлый"
 * <pre>
 *    <Controls.themes:ZenWrapper complementaryColor="178, 35, 35" brightness="light" >
 *       <ws:partial template="MyModule/someContent" />
 *    </Controls.themes:ZenWrapper>
 * </pre>
 * @see option complementaryColor
 * @see option dominantColor
 */
