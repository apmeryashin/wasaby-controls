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
            '--text-color': brightness === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
            '--icon-color': brightness === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
            '--label_text-color': brightness === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
            '--unaccented_text-color': brightness === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            '--unaccented_icon-color': brightness === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            '--readonly_color': brightness === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            '--primary_text-color': `rgb(${red},${green},${blue})`,
            '--primary_icon-color': `rgb(${red},${green},${blue})`,
            '--secondary_text-color': brightness === 'dark' ? '#fff' : '#000',
            '--secondary_icon-color': brightness === 'dark' ? '#fff' : '#000'
        };
    }

    static getDerivedStateFromProps(options: IZenWrapperOptions): object {
        return ZenWrapper.calculateVariables(
            ZenWrapper.calculateRGB(options.complementaryColor), options.brightness
        );
    }
}
