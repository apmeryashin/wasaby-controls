import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_date/WeekdayFormatter/WeekdayFormatter';
import {date as formatDate} from 'Types/formatter';
import 'css!Controls/date';
import IValueOptions from './interface/IValue';

interface IWeekdayFormatter extends IControlOptions, IValueOptions {
}

/**
 * Контрол - день недели. Преобразует дату в день недели. Контрол используется для отображения для недели по
 * стандарту внутри шаблона {@link Controls/_dateRange/Input#rightFieldTemplate rightFieldTemplate}
 *
 * @class Controls/_date/WeekdayFormatter
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/WeekdayFormatter/Index
 *
 */

/**
 * @name Controls/_date/WeekdayFormatter#value
 * @cfg {Date} Дата, которая будет отформатирована в день недели.
 */

export default class WeekdayFormatter extends Control<IWeekdayFormatter> {
    protected _template: TemplateFunction = template;
    protected _weekday: string;
    protected _isWorkday: boolean;

    protected _beforeMount(options: IWeekdayFormatter): void {
        this._setWeekday(options.value);
    }

    protected _beforeUpdate(options: IWeekdayFormatter): void {
        if (this._options.value !== options.value) {
            this._setWeekday(options.value);
        }
    }

    private _setWeekday(value: Date): void {
        if (value instanceof Date && !isNaN(value.getTime())) {
            this._weekday = formatDate(value, 'ddl');
            const weekday = value.getDay();
            // В Американской системе воскресенье считается первым днем недели
            const sunday = 0;
            const saturday = 6;
            this._isWorkday = weekday !== saturday && weekday !== sunday;
        } else {
            this._weekday = '';
        }
    }
}
