import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/MoreButton/Index');

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Index;
