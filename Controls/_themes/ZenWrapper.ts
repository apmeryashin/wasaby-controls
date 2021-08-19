import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_themes/ZenWrapper/Template';
import {Logger} from 'UI/Utils';

interface IRgb {
    r: number;
    g: number;
    b: number;
}

type TBrightness = 'dark' | 'light';

export interface IZenWrapperOptions extends IControlOptions {
    dominantColor: string;
    complementaryColor: string;
    brightness: TBrightness;
}

/**
 * ХОК для установки css-переменных в inline-стили.
 * @class Controls/_themes/Wrapper
 * @extends UI/Base:Control
 * @author Крайнов Д.О.
 * @public
 */
export default class ZenWrapper extends Control<IZenWrapperOptions> {
    protected _template: TemplateFunction = template;
    protected _variables: object = {};

    protected _beforeMount(options: IZenWrapperOptions): void {
        this._variables = ZenWrapper.getDerivedStateFromProps(options);
    }

    protected _beforeUpdate(options: IZenWrapperOptions): void {
    }

    static calculateRGB(color: string): IRgb {
        if (/(\d+),\s*(\d+),\s*(\d+)/.test(color)) {
            return {
                r: parseInt(RegExp.$1, 10),
                g: parseInt(RegExp.$2, 10),
                b: parseInt(RegExp.$3, 10)
            };
        } else {
            return { r: 255, g: 255, b: 255 };
        }
    }

    static calculateVariables(rgb: IRgb, brightness: TBrightness): object {
        const {r: red, g: green, b: blue} = rgb;
        return {
            '--text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--icon-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--label_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--unaccented_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--unaccented_icon-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--readonly_color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.3'),
            '--primary_text-color': ZenWrapper.getColor(rgb),
            '--primary_icon-color': ZenWrapper.getColor(rgb),
            '--primary_border-color': ZenWrapper.getColor(rgb),
            '--secondary_text-color': ZenWrapper.getMonochromeColor(brightness),
            '--secondary_icon-color': ZenWrapper.getMonochromeColor(brightness),
            '--link_hover_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--label_hover_text-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--label_hover_icon-color': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),
            '--text-color_button': ZenWrapper.getMonochromeColor(brightness),
            '--text-contrast-color_button': ZenWrapper.getMonochromeColor(brightness),

            '--primary_background-color_button': 'transparent',
            '--primary_hover_same_background-color': ZenWrapper.getColorWithOpacity(rgb, '0.3'),
            '--primary_contrast_background-color': ZenWrapper.getColor(rgb),
            '--primary_hover_contrast_background-color': ZenWrapper.getColorWithOpacity(rgb, '0.8'),

            '--default_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--primary_text-color_decorator_fraction': ZenWrapper.getColorWithOpacity(rgb, '0.5'),
            '--secondary_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--unaccented_text-color_decorator_fraction':  ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--label_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--readOnly_text-color_decorator_fraction': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.3'),

            '--primary_hover_text-color_heading': ZenWrapper.getColorWithOpacity(rgb, '0.8'),
            '--secondary_hover_text-color_heading': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),

            '--icon_container_background_color_BigSeparator': ZenWrapper.getColorWithOpacity(rgb, '0.2'),
            '--icon-color_BigSeparator': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.5'),
            '--hover_icon-color_BigSeparator': ZenWrapper.getMonochromeColorWithOpacity(brightness, '0.8'),

            '--node_expander_icon-color_treeGrid': ZenWrapper.getMonochromeColor(brightness),
            '--marker_color_list': ZenWrapper.getColor(rgb)
        };
    }

    static getMonochromeColor(brightness: TBrightness): string {
        return brightness === 'dark' ? '#fff' : '#000';
    }

    static getMonochromeColorWithOpacity(brightness: TBrightness, opacity: string): string {
        return brightness === 'dark' ? `rgba(255,255,255, ${opacity})` : `rgba(0,0,0, ${opacity})`;
    }

    static getColor(rgb: IRgb): string {
        const {r: red, g: green, b: blue} = rgb;
        return `rgb(${red},${green},${blue})`;
    }

    static getColorWithOpacity(rgb: IRgb, opacity: string): string {
        const {r: red, g: green, b: blue} = rgb;
        return `rgba(${red},${green},${blue},${opacity})`;
    }

    static getDerivedStateFromProps(options: IZenWrapperOptions): object {
        return ZenWrapper.calculateVariables(
            ZenWrapper.calculateRGB(options.complementaryColor), options.brightness
        );
    }
}
