import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import * as DateTemplate from 'wml!Controls/_filterPanel/Editors/Date';
import {StringValueConverter} from 'Controls/date';
import 'css!Controls/filterPanel';
import {Range} from 'Controls/dateUtils';

interface IDateOptions extends IControlOptions {
    propertyValue: Date;
    mask?: string;
}

/**
 * Контрол используют в качестве редактора для поля фильтра с типом Date.
 * @class Controls/_filterPanel/Editors/Date
 * @extends UI/Base:Control
 * @mixes Controls/date:Input
 * @author Мельникова Е.А.
 * @demo Controls-demo/filterPanelPopup/Editors/Date/Index
 * @public
 */

class DateEditor extends Control<IDateOptions> {
    protected _template: TemplateFunction = DateTemplate;
    protected _value: Date = null;
    protected _stringValueConverter: StringValueConverter = null;

    protected _beforeMount(options: IDateOptions): void {
        this._value = options.propertyValue;
    }

    protected _beforeUpdate(newOptions: IDateOptions): void {
        if (newOptions.propertyValue !== this._options.propertyValue) {
            this._value = newOptions.propertyValue;
        }
    }

    protected _valueChangedHandler(event: SyntheticEvent, newValue: Date): void {
        this._propertyValueChanged(newValue);
    }

    protected _extendedCaptionClickHandler(): void {
        this._propertyValueChanged(null);
    }

    protected _propertyValueChanged(newValue: Date): void {
        const extendedValue = {
            value: newValue,
            textValue: this._getTextValue(newValue),
            viewMode: 'basic'
        };
        this._notify('propertyValueChanged', [extendedValue], {bubbling: true});
    }

    protected _getTextValue(value: Date): string {
        if (!this._stringValueConverter) {
            this._stringValueConverter = new StringValueConverter();
        }
        return this._stringValueConverter.getStringByValue(value, this._options.mask);
    }

    static getDefaultOptions(): object {
        return {
            mask: Range.dateMaskConstants.DD_MM_YY
        };
    }
}

Object.defineProperty(DateEditor, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return DateEditor.getDefaultOptions();
    }
});
export default DateEditor;
