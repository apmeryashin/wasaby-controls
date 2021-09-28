import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Base/roundedEdges/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Slider/Base/markerVisibility/Style';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
}

export default Base;
