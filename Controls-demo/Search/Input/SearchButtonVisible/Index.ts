import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Search/Input/SearchButtonVisible/Index');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Search/Input/Base/Style'];
}
export default ViewModes;
