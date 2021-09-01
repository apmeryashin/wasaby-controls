import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/CompactDatePicker/DisplayedRanges/DisplayedRanges');

export default class RangeCompactSelector extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _startValue: Date = new Date(2018, 0, 1);
    protected _endValue: Date = new Date(2018, 0, 30);
    protected _displayedRanges: Date[][] = [
        [new Date(2017, 0), new Date(2018, 3)],
        [new Date(2018, 5), new Date(2019, 7)]
    ];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
