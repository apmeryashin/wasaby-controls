import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/CompactDatePicker/IsDayAvailable/IsDayAvailable');

export default class RangeCompactSelector extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value: Date = new Date(2018, 0, 2);

    protected _isDayAvailable(date: Date): boolean {
        // Заблокируем выбор всех понедельников и четвергов
        return date.getDay() !== 1 && date.getDay() !== 4;
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
