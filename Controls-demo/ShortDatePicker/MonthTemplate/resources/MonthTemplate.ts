import * as template from 'wml!Controls-demo/ShortDatePicker/MonthTemplate/resources/MonthTemplate';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {date as formatDate} from 'Types/formatter';

export default class MonthTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _formatDate: Function = formatDate;
}
