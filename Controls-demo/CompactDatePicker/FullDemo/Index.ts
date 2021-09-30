import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/CompactDatePicker/FullDemo/FullDemo');

export default class RangeCompactSelector extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
