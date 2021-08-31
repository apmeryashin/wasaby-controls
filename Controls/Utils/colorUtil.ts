import {Logger} from 'UI/Utils';

interface IRgb {
    r: number;
    g: number;
    b: number;
}
interface IRgba extends IRgb {
    a: number;
}

export function toRgb(rawColor: string): IRgba {
    if (typeof rawColor !== 'string') {
        return null;
    }
    let color = rawColor.toLowerCase();
    const shorthandRegexRgba = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d]?)$/i;
    color = color.replace(shorthandRegexRgba, (m, r, g, b, a) => {
        if (!a) { a = 'f'; }
        return r + r + g + g + b + b + a + a;
    });
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color) ||
                   /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (result) {
        return  {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: parseInt(result[4] || 'ff', 16) / 255
        };
    } else {
        color = color.split(' ').join('');
        result = /^rgba\(([\d]+),([\d]+),([\d]+),([\d.]+)\)$/i.exec(color) ||
                 /^rgb\(([\d]+),([\d]+),([\d]+)\)$/i.exec(color);
        if (result) {
            return  {
                r: parseInt(result[1], 10),
                g: parseInt(result[2], 10),
                b: parseInt(result[3], 10),
                a: parseFloat(result[4] || '1')
            };
        } else {
            Logger.warn(`hexToRgb: ${color} не является валидным rgb, rgba или hex-цветом.`);
        }
    }

}

export function rgbToRgba(rgb: IRgb, a: number = 1): IRgba {
    if (!rgb) {
        return null;
    }
    return {...rgb, a};
}

export function rgbaToString(rgba: IRgba): string {
    if (!rgba) {
        return null;
    }
    const {r, g, b, a} = rgba;
    return `rgba(${r},${g},${b},${a})`;
}

const MAX_RGB = 255;
const DEG = 360;
const ZERO = 0;
const DOUBLE = 2;
const RGB_R_COEF = 6;
const RGB_G_COEF = 2;
const RGB_B_COEF = 4;
const MAX_HSL_VAL = 100;
const FIRST_RGB_COEF = 60;
const SECOND_RGB_COEF = 120;
const THIRD_RGB_COEF = 180;
const FOURTH_RGB_COEF = 240;
const FIFTH_RGB_COEF = 300;
const FRACTION_DIGITS = 1;
const DEGREE_MULTIPLIER = 60;

// saturation и lightness в процентах.
export function hslToRgb(hue: number, saturation: number, lightness: number): IRgb {
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
}

export function hexToHsl(hex: string): { h: number, s: number, l: number } {
    // Convert hex to RGB first
    let {r, g, b} = toRgb(hex);
    r /= MAX_RGB;
    g /= MAX_RGB;
    b /= MAX_RGB;
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h;
    // Calculate hue
    if (delta === ZERO) { // No difference
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
}
