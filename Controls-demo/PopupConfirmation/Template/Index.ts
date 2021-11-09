import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupConfirmation/Template/Template');
import 'css!Controls-demo/Controls-demo';

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
export default Demo;
