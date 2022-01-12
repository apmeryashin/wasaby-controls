import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as DateTemplate from 'wml!Controls/_filterPanel/Editors/Date';
import 'css!Controls/filterPanel';

interface IDateOptions extends IControlOptions {
    propertyValue: Date[];
}

/**
 * Контрол используют в качестве редактора для выбора даты или периода.
 * @class Controls/_filterPanel/Editors/Date
 * @extends UI/Base:Control
 * @mixes Controls/dateRange:Selector
 * @author Мельникова Е.А.
 * @public
 */

class DateEditor extends Control<IDateOptions> {
    protected _template: TemplateFunction = DateTemplate;
    protected _startValue: Date = null;
    protected _endValue: Date = null;

    protected _beforeMount(options: IDateOptions): void {
        this._setDateRange(options.propertyValue);
    }

    protected _beforeUpdate(options: IDateOptions): void {
        if (options.propertyValue !== this._options.propertyValue) {
            this._setDateRange(options.propertyValue);
        }
    }

    protected _setDateRange(dateRangeValue: Date[]): void {
        if (dateRangeValue?.length) {
            this._startValue = dateRangeValue[0];
            this._endValue = dateRangeValue[1];
        }
    }

    protected _handleRangeChanged(event: SyntheticEvent, startValue: Date, endValue: Date): void {
        const extendedValue = {
            value: [startValue, endValue],
            viewMode: 'basic'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }
}

export default DateEditor;
