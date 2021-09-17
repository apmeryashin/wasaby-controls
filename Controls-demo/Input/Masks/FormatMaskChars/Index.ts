import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Input/Masks/FormatMaskChars/FormatMaskChars';

class Masks extends Control<IControlOptions> {
    protected _value1: string = '53beecb9-4638-4473-8650-78c626babc26';
    protected _value2: string;
    protected _value3: string = '';
    protected _template: TemplateFunction = template;

    protected _formatMaskChars: object = {
        x: '[A-Fa-f0-9]',
        y: '[0-1]'
    };

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Masks;
