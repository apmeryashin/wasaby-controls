import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Text/Base/Index');

class Index extends Control<IControlOptions> {
    protected _value1: string = null;
    protected _value2: string = null;
    protected _value3: string = null;
    protected _value4: string = null;
    protected _value5: string = null;
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Index;
