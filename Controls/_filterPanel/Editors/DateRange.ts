import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as DateRangeTemplate from 'wml!Controls/_filterPanel/Editors/DateRange';
import {loadSync} from 'WasabyLoader/ModulesLoader';
import 'css!Controls/filterPanel';

interface IDateRangeOptions extends IControlOptions {
    propertyValue: Date[];
    extendedCaption?: string;
    captionFormatter?: Function;
}

/**
 * Контрол используют в качестве редактора для выбора даты или периода.
 * @class Controls/_filterPanel/Editors/DateRange
 * @extends UI/Base:Control
 * @mixes Controls/dateRange:Selector
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanelPopup/Editors/DateRange/Index
 * @public
 */

class DateRangeEditor extends Control<IDateRangeOptions> {
    protected _template: TemplateFunction = DateRangeTemplate;
    protected _startValue: Date = null;
    protected _endValue: Date = null;

    protected _beforeMount(options: IDateRangeOptions): void {
        this._setDateRange(options.propertyValue);
    }

    protected _beforeUpdate(options: IDateRangeOptions): void {
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
            textValue: this._getTextValue(startValue, endValue),
            viewMode: 'basic'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    private _getTextValue(startValue: Date, endValue: Date): string {
        const dateRangeLib = loadSync('Controls/dateRange');
        const captionFormatter = this._options.captionFormatter || dateRangeLib.Utils.formatDateRangeCaption;
        return captionFormatter(startValue, endValue, this._options.extendedCaption);
    }

    static getDefaultOptions(): object {
        return {
            propertyValue: [null, null]
        };
    }
}

Object.defineProperty(DateRangeEditor, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return DateRangeEditor.getDefaultOptions();
    }
});

export default DateRangeEditor;
