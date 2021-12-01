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
 * Контейнер для стилизации элементов, лежащих на фоне некоторого изображения. Цвета элементов рассчитываются исходя из доминантного цвета изображения и комплементарного к нему.
 * @class Controls/_themes/ZenWrapper
 * @extends UI/Base:Control
 * @author Клепиков И.А.
 * @public
 * @demo Controls-demo/themes/ZenWrapper/Index
 * @remark Доминантный и комплементарный цвет изображения должны быть заранее вычислены и переданы в опции контрола.
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

        return {
            '--dominant-color_zen': ZenWrapper.getColor(dominantRGB),
            '--dominant_zen_rgb': `${dominantRGB.r},${dominantRGB.g},${dominantRGB.b}`,
            '--complementary-color_zen': ZenWrapper.getColor(complementaryRGB),
            '--complementary_zen_rgb': `${complementaryRGB.r},${complementaryRGB.g},${complementaryRGB.b}`,
            '--mono_zen_rgb': ZenWrapper.getMonochromeColorRGB(brightness)
        };
    }

    static getMonochromeColorRGB(brightness: TBrightness): string {
        return brightness === 'dark' ? '255,255,255' : '0,0,0';
    }

    static getColor(rgb: IRgbColor): string {
        const {r: red, g: green, b: blue} = rgb;
        return `rgb(${red},${green},${blue})`;
    }

    static getDerivedStateFromProps(options: IZenWrapperOptions): object {
        let complementaryColor = options.complementaryColor;
        if (!complementaryColor) {
            // TODO зашиваем primary цвет. Нужно для совещаний. Возможно есть решение лучше.
            // https://online.sbis.ru/opendoc.html?guid=f454befd-5404-4081-b54d-0ce5579d58f1
            complementaryColor = '246, 115, 60';
        }
        return ZenWrapper.calculateVariables(
            ZenWrapper.calculateRGB(options.dominantColor),
            ZenWrapper.calculateRGB(complementaryColor),
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
 * @cfg {String} Задает комплементарный цвет к доминантному цвет изображения на фоне которого строится контрол. Цвет в формате rgb - 45, 34, 81
 * @remark
 * @example
 * Установлен комплементарный цвет
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
 * Установлен комплементарный цвет и яркость "светлый"
 * <pre>
 *    <Controls.themes:ZenWrapper complementaryColor="178, 35, 35" brightness="light" >
 *       <ws:partial template="MyModule/someContent" />
 *    </Controls.themes:ZenWrapper>
 * </pre>
 * @see option complementaryColor
 * @see option dominantColor
 */
