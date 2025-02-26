import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/Rating/EmptyIconFill/Template';

class Rating extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number = 3;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Rating;
