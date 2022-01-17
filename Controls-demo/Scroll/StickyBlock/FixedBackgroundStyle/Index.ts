import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyBlock/FixedBackgroundStyle/Index');
import 'css!Controls-demo/Controls-demo';

export default class FixedBackgroundStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}
