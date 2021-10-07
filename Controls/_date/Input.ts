import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as coreMerge from 'Core/core-merge';
import {SyntheticEvent} from 'Vdom/Vdom';
import StringValueConverter from 'Controls/_date/BaseInput/StringValueConverter';
import IBaseInputMask from 'Controls/_date/interface/IBaseInputMask';
import {EventUtils} from 'UI/Events';
import {Popup as PopupUtil} from 'Controls/dateUtils';
import {ICalendarButtonVisibleOptions} from 'Controls/_date/interface/ICalendarButtonVisible';
import 'css!Controls/input';
import 'css!Controls/CommonClasses';
import 'css!Controls/date';

import template = require('wml!Controls/_date/Input/Input');

interface IDateInput extends ICalendarButtonVisibleOptions, IControlOptions {
}

/**
 * Поле ввода даты. Поддерживает как ввод с клавиатуры, так и выбор даты из всплывающего календаря с помощью мыши. Не поддерживает ввод времени.
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_input.less переменные тем оформления input}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_datePicker.less переменные тем оформления dateRange}
 *
 * @class Controls/date:Input
 * @extends UI/Base:Control
 * @mixes Controls/_date/interface/IBaseInput
 * @implements Controls/interface:IDateMask
 * @implements Controls/interface:IInputTag
 * @mixes Controls/input:IBorderVisibility
 *
 * @implements Controls/dateRange:IDatePickerSelectors
 * @implements Controls/dateRange:IDateRangeSelectable
 * @implements Controls/date:ICalendarButtonVisible
 * @mixes Controls/input:IBase
 * @mixes Controls/input:IValueValidators
 * @implements Controls/interface:IOpenPopup
 * @mixes Controls/input:IInputDisplayValueValidators
 * @implements Controls/dateRange:IDatePopupType
 *
 * @public
 * @demo Controls-demo/Input/Date/Picker
 * @author Красильников А.С.
 */

class Input extends Control<IDateInput> {
    _template: TemplateFunction = template;
    _proxyEvent: Function = EventUtils.tmplNotify;
    _shouldValidate: boolean = false;
    private _state: string;

    protected _beforeMount(): void {
        this._stateChangedCallback = this._stateChangedCallback.bind(this);
    }

    openPopup(): void {
        // TODO: Перевести на улититу, после того как переведем контрол в либу _date. Сейчас появляется
        //  циклическая зависимость.
        const getPopupName = (datePopupType: string) => {
            if (datePopupType === 'compactDatePicker') {
                return 'Controls/compactDatePicker:View';
            }
            return 'Controls/datePopup';
        };
        const value = PopupUtil.getFormattedSingleSelectionValue(this._options.value);
        let className;
        if (this._options.datePopupType === 'datePicker') {
            className = `controls-PeriodDialog__picker controls_datePicker_theme-${this._options.theme}`;
        } else {
            className = `controls-CompactDatePicker__selector-margin
            controls_compactDatePicker_theme-${this._options.theme}`;
        }
        const cfg = {
            ...PopupUtil.getCommonOptions(this),
            target: this._container,
            template: getPopupName(this._options.datePopupType),
            className,
            templateOptions: {
                ...PopupUtil.getTemplateOptions(this),
                ...value,
                selectionType: 'single',
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                headerType: 'input',
                closeButtonEnabled: true,
                ranges: this._options.ranges,
                startValueValidators: this._options.valueValidators,
                state: this._state,
                stateChangedCallback: this._stateChangedCallback
            }
        };
        this._children.opener.open(cfg);
    }

    _afterUpdate(): void {
        if (this._shouldValidate) {
            this._shouldValidate = false;
            this._children.input.validate();
        }
    }

    protected _stateChangedCallback(state: string): void {
        this._state = state;
    }

    _onResultWS3(event: Event, startValue: Date): void {
        this._onResult(startValue);
    }

    _onResult(startValue: Date): void {
        const stringValueConverter = new StringValueConverter({
            mask: this._options.mask,
            replacer: this._options.replacer,
            dateConstructor: this._options.dateConstructor
        });
        const textValue = stringValueConverter.getStringByValue(startValue);
        this._notify('valueChanged', [startValue, textValue]);
        this._children.opener?.close();
        this._notify('inputCompleted', [startValue, textValue]);
        /**
         * Вызываем валидацию, т.к. при выборе периода из календаря не вызывается событие valueChanged
         * Валидация срабатывает раньше, чем значение меняется, поэтому откладываем ее до _afterUpdate
         */
        this._shouldValidate = true;
    }

    protected _inputMouseDownHandler(event: Event): void {
        if (!this._options.calendarButtonVisible) {
            this.openPopup();
            event.preventDefault();
        }
    }

    static getDefaultOptions(): object {
        return {
            ...IBaseInputMask.getDefaultOptions(),
            valueValidators: [],
            datePopupType: 'datePicker',
            calendarButtonVisible: true
        };
    }

    static getOptionTypes(): object {
        return coreMerge({}, IBaseInputMask.getOptionTypes());
    }
}

Object.defineProperty(Input, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Input.getDefaultOptions();
   }
});

export default Input;
