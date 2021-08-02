import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_themes/Wrapper/Wrapper';

export interface IWrapperOptions extends IControlOptions {
    prefix: string;
    variables: Record<string, string>;
}

/**
 * ХОК для установки css-переменных в inline-стили.
 * @class Controls/_themes/Wrapper
 * @extends UI/Base:Control
 * @author Клепиков И.А.
 * @public
 */
export default class Wrapper <TWrapperOptions extends IWrapperOptions> extends Control<TWrapperOptions> {
    protected _template: TemplateFunction = template;
    protected _themeVariables: string;

    protected _beforeMount(options?: TWrapperOptions): void {
        this._themeVariables =
            Wrapper.prepareStyleValue(this.computeStylesLogic(options), options.prefix);
    }

    protected _beforeUpdate(options: TWrapperOptions): void {
        if (options.variables !== this._options.variables) {
            this._themeVariables =
                Wrapper.prepareStyleValue(this.computeStylesLogic(options), options.prefix);
        }
    }

    protected computeStylesLogic(options: TWrapperOptions): Record<string, string> {
        return options.variables;
    }

    static prepareStyleValue(variablesObj: Record<string, string>, prefix: string): string {
        let result = '';
        const _prefix = prefix ? prefix + '_' : '';
        Object.keys(variablesObj).forEach((key) => {
            result += ['--', _prefix, key, ':', variablesObj[key], ';'].join('');
        });
        return result;
    }
}
