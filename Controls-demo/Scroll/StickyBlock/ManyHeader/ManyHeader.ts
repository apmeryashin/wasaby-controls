import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyBlock/ManyHeader/ManyHeader');
import 'css!Controls-demo/Controls-demo';

export default class ManyHeaderDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
