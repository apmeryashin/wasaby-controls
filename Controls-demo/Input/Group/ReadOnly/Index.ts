import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Group/ReadOnly/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Input/Group/ReadOnly/Style';

class Example extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _defaultValue: string = '';
    protected _readOnlyField: boolean = false;

}
export default Example;
