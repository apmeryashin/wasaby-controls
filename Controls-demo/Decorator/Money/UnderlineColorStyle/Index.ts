import {Control, IControlOptions, TemplateFunction} from 'UI/Base';

import * as template from 'wml!Controls-demo/Decorator/Money/UnderlineColorStyle/UnderlineColorStyle';

import 'css!Controls/CommonClasses';
import 'css!Controls-demo/Controls-demo';

class UnderlineColorStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _value: string = '123.45';
}

export default UnderlineColorStyle;
