import {IRBGColor, IHSLColor, IColorDescriptor} from './interface/IColor';

const MAX_RGB = 255;
const DEG = 360;
const ZERO = 0;
const DOUBLE = 2;
const SHORT_HEX_LENGTH = 4;
const NORMAL_HEX_LENGTH = 7;
const HEX_INDEX_1 = 1;
const HEX_INDEX_2 = 2;
const HEX_INDEX_3 = 3;
const HEX_INDEX_4 = 4;
const HEX_INDEX_5 = 5;
const HEX_INDEX_6 = 6;
const RGB_R_COEF = 6;
const RGB_G_COEF = 2;
const RGB_B_COEF = 4;
const MAX_HSL_VAL = 100;
const HEXADECIMAL = 16;
const FIRST_RGB_COEF = 60;
const SECOND_RGB_COEF = 120;
const THIRD_RGB_COEF = 180;
const FOURTH_RGB_COEF = 240;
const FIFTH_RGB_COEF = 300;
const FRACTION_DIGITS = 1;
const DEGREE_MULTIPLIER = 60;
// saturation и lightness в процентах.
const HSLToRGB = (hue: number, saturation: number, lightness: number): IRBGColor => {
    // Must be fractions of 1
    const s = (saturation > MAX_HSL_VAL ? MAX_HSL_VAL : saturation) / MAX_HSL_VAL;
    const l = (lightness > MAX_HSL_VAL ? MAX_HSL_VAL : lightness) / MAX_HSL_VAL;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hue / FIRST_RGB_COEF) % 2 - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (ZERO <= hue && hue < FIRST_RGB_COEF) {
        r = c;
        g = x;
        b = ZERO;
    } else if (FIRST_RGB_COEF <= hue && hue < SECOND_RGB_COEF) {
        r = x;
        g = c;
        b = ZERO;
    } else if (SECOND_RGB_COEF <= hue && hue < THIRD_RGB_COEF) {
        r = ZERO;
        g = c;
        b = x;
    } else if (THIRD_RGB_COEF <= hue && hue < FOURTH_RGB_COEF) {
        r = ZERO;
        g = x;
        b = c;
    } else if (FOURTH_RGB_COEF <= hue && hue < FIFTH_RGB_COEF) {
        r = x;
        g = ZERO;
        b = c;
    } else if (FIFTH_RGB_COEF <= hue && hue < DEG) {
        r = c;
        g = ZERO;
        b = x;
    }
    r = Math.round((r + m) * MAX_RGB);
    g = Math.round((g + m) * MAX_RGB);
    b = Math.round((b + m) * MAX_RGB);
    return {r, g, b};
};
const intToHex = (n: number): string => {
    const str = n.toString(HEXADECIMAL);
    return str.length === 1 ? ('0' + str) : str;
};
const HexToHSL = (hex: string): { h: number, s: number, l: number } => {
    // Convert hex to RGB first
    let r = 0;
    let g = 0;
    let b = 0;
    if (hex.length === SHORT_HEX_LENGTH) {
        r = parseInt(hex[HEX_INDEX_1] + hex[HEX_INDEX_1], HEXADECIMAL);
        g = parseInt(hex[HEX_INDEX_2] + hex[HEX_INDEX_2], HEXADECIMAL);
        b = parseInt(hex[HEX_INDEX_3] + hex[HEX_INDEX_3], HEXADECIMAL);
    } else if (hex.length === NORMAL_HEX_LENGTH) {
        r = parseInt(hex[HEX_INDEX_1] + hex[HEX_INDEX_2], HEXADECIMAL);
        g = parseInt(hex[HEX_INDEX_3] + hex[HEX_INDEX_4], HEXADECIMAL);
        b = parseInt(hex[HEX_INDEX_5] + hex[HEX_INDEX_6], HEXADECIMAL);
    }
    r /= MAX_RGB;
    g /= MAX_RGB;
    b /= MAX_RGB;
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h;
    // Calculate hue
    // No difference
    if (delta === ZERO) {
        h = ZERO;
    } else if (cmax === r) { // Red is max
        h = ((g - b) / delta) % RGB_R_COEF;
    } else if (cmax === g) { // Green is max
        h = (b - r) / delta + RGB_G_COEF;
    } else { // Blue is max
        h = (r - g) / delta + RGB_B_COEF;
    }
    h = Math.round(h * DEGREE_MULTIPLIER);
    // Make negative hues positive behind 360°
    if (h < ZERO) {
        h += DEG;
    }
    // Calculate lightness
    let l = (cmax + cmin) / 2;
    // Calculate saturation
    let s = delta === ZERO ? ZERO : delta / (1 - Math.abs(DOUBLE * l - 1));
    // Multiply l and s by 100
    s = +(s * MAX_HSL_VAL).toFixed(FRACTION_DIGITS);
    l = +(l * MAX_HSL_VAL).toFixed(FRACTION_DIGITS);
    return {h, s, l};
};
const prefixes = ['primary', 'secondary', 'danger', 'success', 'warning', 'info'];
const colorTemplate = {
    color: [
        {name: 'text-color', S: 0.66, L: 0.79},
        {name: 'hover_text-color', S: 1.4, L: 0.7},
        {name: 'icon-color', S: 1.05, L: 1.15},
        {name: 'hover_icon-color', S: 1.4, L: 0.7},
        {name: 'border-color', S: 1.05, L: 1.15},
        {name: 'background-color', S: 100, L: 98, isStrict: true},
        {name: 'hover_background-color', S: 100, L: 96, isStrict: true},
        {name: 'active_background-color', S: 100, L: 93, isStrict: true},
        {name: 'same_background-color', S: 100, L: 96, isStrict: true},
        {name: 'hover_same_background-color', S: 100, L: 93, isStrict: true},
        {name: 'active_same_background-color', S: 100, L: 90, isStrict: true},
        {name: 'contrast_background-color', S: 1.5, L: 1.25},
        {name: 'hover_contrast_background-color', S: 1.6, L: 1.16},
        {name: 'active_contrast_background-color', S: 1.92, L: 1.32}
    ],
    'text-color': [
        {name: 'hover_text-color', S: 2.121, L: 0.886}
    ],
    'icon-color': [
        {name: 'hover_icon-color', S: 1.333, L: 0.609}
    ],
    'background-color': [
        {name: 'hover_background-color', S: 1, L: 0.9796},
        {name: 'active_background-color', S: 1, L: 0.949}
    ],
    'same_background-color': [
        {name: 'hover_same_background-color', S: 1, L: 0.96875},
        {name: 'active_same_background-color', S: 1, L: 0.967}
    ],
    'contrast_background-color': [
        {name: 'hover_contrast_background-color', S: 1.067, L: 0.928},
        {name: 'active_contrast_background-color', S: 1.28, L: 1.056}
    ]
};
// Цвета, зависящие от основной палитры + неакцентные
const additionalColors = {
    '--primary_color': [
        {name: '--marker_color', S: 1, L: 1}
    ],
    '--secondary_color': [
        {name: '--readonly_marker-color', S: 0.66, L: 0.79}
    ],
    '--unaccented_color': [
        {name: '--label_text-color', S: 1, L: 1}, // FIXME коэффициенты
        {name: '--unaccented_text-color', S: 0.66, L: 0.79},
        {name: '--unaccented_icon-color', S: 1.05, L: 1.15},
        {name: '--unaccented_hover_icon-color', S: 1.4, L: 0.7},
        {name: '--unaccented_border-color', S: 1.05, L: 1.15},
        {name: '--unaccented_hover_border-color', S: 1.4, L: 0.7},
        {name: '--unaccented_background-color', S: 100, L: 98, isStrict: true},
        {name: '--unaccented_hover_same_background-color', S: 100, L: 93, isStrict: true},
        {name: '--unaccented_active_same_background-color', S: 100, L: 90, isStrict: true},
        {name: '--unaccented_contrast_background-color', S: 1.5, L: 1.25},
        {name: '--unaccented_hover_contrast_background-color', S: 1.6, L: 1.16},
        {name: '--unaccented_active_contrast_background-color', S: 1.92, L: 1.32},
        {name: '--pale_contrast_background-color', S: 1.5, L: 1.25}, // FIXME коэффициенты
        {name: '--pale_hover_contrast_background-color', S: 1.6, L: 1.16}, // FIXME коэффициенты
        {name: '--pale_active_contrast_background-color', S: 1.92, L: 1.32}, // FIXME коэффициенты
        {name: '--pale_border-color:', S: 1.05, L: 1.15} // FIXME коэффициенты
    ],
    '--unaccented_contrast_background-color': [
        {name: '--unaccented_hover_contrast_background-color', S: 1.067, L: 0.928},
        {name: '--unaccented_active_contrast_background-color', S: 1.28, L: 1.056}
    ],
    '--unaccented_icon-color': [
        {name: '--unaccented_hover_icon-color', S: 1.333, L: 0.609}
    ]
};
const calculateColor = (clr: IHSLColor, desc: IColorDescriptor): IHSLColor => {
    return desc.isStrict ? {h: clr.h, s: desc.S, l: desc.L} : {h: clr.h, s: clr.s * desc.S, l: clr.l * desc.L};
};
/**
 * Вычисление цветов, зависящих от базовых на основе шаблона трансформации
 * @param {Record<string, string>} colors базовые цвета
 * @param {Record<string, IColorDescriptor[]>} transformTemplate шаблон трансформации цветов
 * @param {string} [prefix] префикс, который нужно добавить к названиям цветов в результате
 * @return {Record<string, string>} объект с палитрой цветов, вычисленных на основе переданных
 */
const processColorVariables = (
    colors: Record<string, string>,
    transformTemplate: Record<string, IColorDescriptor[]>,
    prefix?: string): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const coefName in transformTemplate) {
        if (transformTemplate.hasOwnProperty(coefName)) {
            const mainColorName = prefix ? `--${prefix}_${coefName}` : coefName;
            if (colors[mainColorName]) {
                const baseColor = HexToHSL(colors[mainColorName]);
                transformTemplate[coefName].forEach((colorDesc: IColorDescriptor) => {
                    const subColorName = prefix ? `--${prefix}_${colorDesc.name}` : colorDesc.name;
                    // пропускаем переменные, значения которых пришло в аргументах. Их рассчитывать не нужно.
                    if (!colors[subColorName]) {
                        const convertedColor = colorDesc.callback ?
                            colorDesc.callback(baseColor, subColorName) :
                            calculateColor(baseColor, colorDesc);
                        const rgbColor = HSLToRGB(convertedColor.h, convertedColor.s, convertedColor.l);
                        if (colorDesc.transparent) {
                            result[subColorName] = `rgba(${rgbColor.r},${rgbColor.g},${rgbColor.b},0)`;
                        } else {
                            result[subColorName] =
                                '#' + intToHex(rgbColor.r) + intToHex(rgbColor.g) + intToHex(rgbColor.b);
                        }
                    }
                });
            }
        }
    }
    return result;
};
/**
 * Вычисляет палитру цветов Controls в зависимости от переданных в параметре базовых цветов
 * @param {Record<string, string>} colors объект с HEX значениями цветов
 * @return {Record<string, string>} объект с палитрой цветов, вычисленных на основе базовых
 */
const calculateControlsTheme = (colors: Record<string, string>): Record<string, string> => {
    let result = {...colors};
    prefixes.forEach((prefix) => {
        result = {...result, ...processColorVariables(colors, colorTemplate, prefix)};
    });
    result = {...result, ...processColorVariables(colors, additionalColors)};
    return result;
};

export {
    processColorVariables,
    calculateControlsTheme,
    HSLToRGB,
    HexToHSL,
    intToHex
};
