import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Heading/Title/FontWeight/Template');
import 'css!Controls-demo/Controls-demo';

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = [];
}
export default ViewModes;
