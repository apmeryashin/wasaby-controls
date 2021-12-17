import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Classes/Blocks/Layout/VerticalBackground/Index');
import 'css!Controls-demo/Classes/Blocks/Layout/Index';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
