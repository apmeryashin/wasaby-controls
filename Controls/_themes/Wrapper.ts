import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_themes/Wrapper/Wrapper';
import 'css!Controls/themes';

export interface IWrapperOptions extends IControlOptions {
    variables: Record<string, string>;
}

/**
 * Контейнер для стилизации элементов. Позволяет переопределять любые css-переменные на своем корневом DOM-элементе.
 * @class Controls/_themes/Wrapper
 * @extends UI/Base:Control
 * @author Клепиков И.А.
 * @public
 * @demo Controls-demo/themes/Wrapper/Index
 */
export default class Wrapper extends Control<IWrapperOptions> {
    protected _template: TemplateFunction = template;
    protected _themeVariables: string;

    protected _beforeMount(options?: IWrapperOptions): void {
        this._themeVariables =
            Wrapper.prepareStyleValue(this.computeStylesLogic(options));
    }

    protected _beforeUpdate(options: IWrapperOptions): void {
        if (options.variables !== this._options.variables) {
            this._themeVariables =
                Wrapper.prepareStyleValue(this.computeStylesLogic(options));
        }
    }

    protected computeStylesLogic(options: IWrapperOptions): Record<string, string> {
        return options.variables;
    }

    static prepareStyleValue(variablesObj: Record<string, string> = {}): string {
        let result = '';
        Object.keys(variablesObj).forEach((key) => {
            result += [key, ':', variablesObj[key], ';'].join('');
        });
        return result;
    }
}

/**
 * @name Controls/_themes/ZenWrapper#variables
 * @cfg {Object} Хэш-мэп, в котором ключами являются названия переменных, а значениями - значения переменных
 * @remark
 * @example
 * Установлен доминантный цвет
 * <pre>
 *    <Controls.themes:Wrapper variables="{{ {'--primary_text-color': 'pink'} }}">
 *      <ws:partial template="MyModule/someContent" />
 *    </Controls.themes:Wrapper>
 * </pre>
 * @see option complementaryColor
 */
