import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Area/TextAlign/Index');

class TextAlignments extends Control<IControlOptions> {
    protected _rightValue = TextAlignments._defaultValue;
    protected _leftValue = TextAlignments._defaultValue;
    protected _centerValue = TextAlignments._defaultValue;
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    private static _defaultValue = 'text';
}

export default TextAlignments;
