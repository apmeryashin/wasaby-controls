import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/Checkbox/TextOverflow/Template');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: boolean = false;
    protected _value2: boolean = false;
    protected _caption: string = 'Very over long long long long long long long long long text';
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
