import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/Button/FontColorStyles/FontColorStyles');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _buttonValue: boolean = false;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
