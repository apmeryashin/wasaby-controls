import BaseSelector from 'Controls/_date/BaseSelector';
import ILinkView from './interface/ILinkView';
import {IDateSelectorOptions} from './interface/IDateSelector';
import componentTmpl = require('wml!Controls/_date/Selector/Selector');
import * as monthCaptionTemplate from 'wml!Controls/_date/Selector/monthCaptionTemplate';
import {Popup as PopupUtil} from 'Controls/dateUtils';
import {TemplateFunction} from 'UI/Base';
import getDatePopupName from 'Controls/_date/Utils/getPopupName';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import 'css!Controls/date';

/**
 * Контрол позволяющий пользователю выбирать дату из календаря.
 *
 * @class Controls/_date/Selector
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/interface/IDateRange
 * @implements Controls/date:ILinkView
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/dateRange:IDatePickerSelectors
 * @implements Controls/dateRange:IDayTemplate
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontWeight
 * @implements Controls/date:ICaption
 * @implements Controls/date:IValue
 * @implements Controls/date:IDatePopupType
 * @mixes Controls/dateRange:IDateSelector
 * @mixes Controls/dateRange:IMonthCaptionTemplate
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/Link
 *
 */

/**
 * @name Controls/_date/Selector#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class Selector extends BaseSelector<IDateSelectorOptions> {
    protected _template: TemplateFunction = componentTmpl;
    protected _monthCaptionTemplate: TemplateFunction = monthCaptionTemplate;
    protected _state: string;
    EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;

    private _getPopupClassName(): string {
        let className = '';
        if (this._options.datePopupType === 'compactDatePicker') {
            className += `controls_compactDatePicker_theme-${ this._options.theme } ` +
                'controls-CompactDatePicker__selector-margin';
        } else {
            const ranges = this._options.ranges;
            className += `controls_datePicker_theme-${ this._options.theme } controls-DatePopup__selector-marginTop_fontSize-${this._getFontSizeClass()}`;
            if ((ranges && ('days' in ranges || 'weeks' in ranges)) ||
                (!ranges && this._options.minRange === 'day')) {
                className += ' controls-DatePopup__selector-marginLeft';
            } else {
                className += ' controls-DatePopup__selector-marginLeft-withoutModeBtn';
            }
        }

        if (this._options.popupClassName) {
            className += `${this._options.popupClassName}`;
        }

        className += ` controls_theme-${this._options.theme}`;

        return className;
    }

    protected _getPopupOptions(): IStickyPopupOptions {
        const container = this._children.linkView.getPopupTarget() as Element;
        const value = PopupUtil.getFormattedSingleSelectionValue(this._options.value);
        return {
            ...PopupUtil.getCommonOptions(this),
            target: container,
            template: getDatePopupName(this._options.datePopupType),
            className: this._getPopupClassName(),
            templateOptions: {
                ...PopupUtil.getTemplateOptions(this),
                ...value,
                headerType: 'link',
                rightFieldTemplate: this._options.rightFieldTemplate,
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                monthCaptionTemplate: this._options.monthCaptionTemplate,
                closeButtonEnabled: true,
                selectionType: 'single',
                ranges: null,
                state: this._state,
                _date: this._options._date,
                stateChangedCallback: this._stateChangedCallback
            }
        };
    }

    protected _resetButtonClickHandler(): void {
        const value = this._options.resetValue || null;
        this._notify('valueChanged', [value]);
    }

    protected _rangeChangedHandler(event: SyntheticEvent, value: Date): void {
        super._notifyValueChanged(value);
    }

    static getDefaultOptions(): object {
        return {
            ...ILinkView.getDefaultOptions(),
            emptyCaption: ILinkView.EMPTY_CAPTIONS.NOT_SPECIFIED,
            datePopupType: 'datePicker'
        };
    }

    static getOptionTypes(): object {
        return {
            ...ILinkView.getOptionTypes()

        };
    }

}

Object.defineProperty(Selector, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Selector.getDefaultOptions();
    }
});
