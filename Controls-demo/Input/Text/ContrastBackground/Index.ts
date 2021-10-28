import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Text/ContrastBackground/Template');
import 'css!Controls-demo/Controls-demo';

class ContrastBackground extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: string;
}

export default ContrastBackground;
