import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyBlock/StuckBackgroundStyle/Index');
import 'css!Controls-demo/Controls-demo';

export default class StuckBackgroundStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
