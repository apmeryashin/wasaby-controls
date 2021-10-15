import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Buttons/ArrowButton/Translucent/Index');
import 'css!Controls-demo/Controls-demo';

export default class Translucent extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
