import BaseSelector, {IBaseSelectorOptions} from './BaseSelector';
import isEmpty = require('Core/helpers/Object/isEmpty');
import {IDateRangeOptions} from './interfaces/IDateRange';
import {ILinkViewDefaultOptions} from 'Controls/date';
import IDateRangeSelectable = require('./interfaces/IDateRangeSelectable');
import componentTmpl = require('wml!Controls/_dateRange/RangeSelector/RangeSelector');
import {Popup as PopupUtil, Base as dateUtils} from 'Controls/dateUtils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import {MonthCaptionTemplate} from 'Controls/date';
import {getDatePopupName} from 'Controls/date';
import {IDatePopupTypeOptions} from 'Controls/_dateRange/interfaces/IDatePopupType';
import IPeriodLiteDialog from 'Controls/_dateRange/interfaces/IPeriodLiteDialog';
import 'css!Controls/dateRange';

interface IRangeSelector extends IControlOptions, IDateRangeOptions, IBaseSelectorOptions, IDatePopupTypeOptions {
}
/**
 * Контрол позволяет пользователю выбрать диапазон дат с начальным и конечным значениями в календаре.
 * Выбор происходит с помощью панели большого выбора периода.
 *
 * @remark
 *
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_dateRange.less переменные тем оформления}
 *
 * @class Controls/_dateRange/RangeSelector
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/date:ILinkViewDefaultOptions
 * @implements Controls/dateRange:IDateRange
 * @implements Controls/dateRange:IDatePickerSelectors
 * @implements Controls/dateRange:IDayTemplate
 * @implements Controls/dateRange:IDateRangeSelectable
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/dateRange:ICaptionFormatter
 * @implements Controls/interface:IDateRangeValidators
 * @implements Controls/interface:IMonthCaptionTemplate
 * @implements Controls/interface:IDateConstructor
 * @implements Controls/dateRange:IDatePopupType
 * @implements Controls/interface:IDisplayedRanges
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLink
 *
 */
/*
 * Controls that allows user to select date with start and end values in calendar.
 *
 * @class Controls/_dateRange/RangeSelector
 * @extends UI/Base:Control
 * @implements Controls/date:ILinkViewDefaultOptions
 * @implements Controls/interface:IFontSize
 * @implements Controls/dateRange:IDateRangeSelectable
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/RangeLink
 *
 */

/**
 * @name Controls/_dateRange/RangeSelector#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class RangeSelector extends BaseSelector<IRangeSelector> {
    protected _template: TemplateFunction = componentTmpl;
    protected _monthCaptionTemplate: TemplateFunction = MonthCaptionTemplate;
    protected _emptyCaption: string;
    EMPTY_CAPTIONS: object = ILinkViewDefaultOptions.EMPTY_CAPTIONS;
    protected _fittingMode: string = 'overflow';

    protected _beforeMount(options: IRangeSelector): void {
        this._updateValues(options);
        super._beforeMount(options);
        this._setEmptyCaption(options);
    }

    protected _beforeUpdate(options: IRangeSelector): void {
        this._updateValues(options);
        super._beforeUpdate(options);
        this._setEmptyCaption(options);
    }

    private _setEmptyCaption(options: IRangeSelector): void {
        if (options.emptyCaption) {
            if (this._emptyCaption !== options.emptyCaption) {
                this._emptyCaption = options.emptyCaption;
            }
        } else {
            const newCaption = options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.single ?
                this.EMPTY_CAPTIONS.ALL_TIME : this.EMPTY_CAPTIONS.NOT_SPECIFIED;
            if (newCaption !== this._emptyCaption) {
                this._emptyCaption = newCaption;
            }
        }
    }

    _updateValues(options: IRangeSelector): void {
        if (options.startValue || options.startValue === null) {
            this._startValue = options.startValue;
        } else {
            this._startValue = this._rangeModel?.startValue;
        }
        if (options.endValue || options.endValue === null) {
            this._endValue = options.endValue;
        } else {
            this._endValue = this._rangeModel?.endValue;
        }
        if (options.selectionType !== IDateRangeSelectable.SELECTION_TYPES.single) {
            this._startValue = this._startValue || null;
            this._endValue = this._endValue || null;
        }
    }

    _updateRangeModel(options: IRangeSelector): void {
        const opts: IDateRangeOptions = {};
        opts.endValue = this._endValue;
        opts.startValue = this._startValue;
        if (options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single) {
            opts.endValue = this._startValue;
        }
        opts.rangeSelectedCallback = options.rangeSelectedCallback;
        opts.selectionType = options.selectionType;
        opts.ranges = options.ranges;
        super._updateRangeModel.call(this, opts);
    }

    private _getPopupClassName(): string {
        let className = '';
        if (this._options.datePopupType === 'shortDatePicker') {
            if (!this._options.chooseMonths && !this._options.chooseQuarters && !this._options.chooseHalfyears) {
                className = `controls-DateRangeSelectorLite__picker-years_fontSize-${this._getFontSizeClass()} controls_popupTemplate_theme-${this._options.theme}`;
            } else {
                className = 'controls-DateRangeSelectorLite__picker-normal';
            }
            className += ` controls_shortDatePicker_theme-${this._options.theme} controls_theme-${this._options.theme}`;
        } else if (this._options.datePopupType === 'compactDatePicker') {
            className += `controls_compactDatePicker_theme-${ this._options.theme } ` +
                'controls-CompactDatePicker__selector-margin';
        } else {
            const ranges = this._options.ranges;
            className += `controls_datePicker_theme-${ this._options.theme } controls-DatePopup__selector-marginTop_fontSize-${this._getFontSizeClass()}`;
            if ((ranges && ('days' in ranges || 'weeks' in ranges)) ||
                ((!ranges || isEmpty(ranges)) && this._options.minRange === 'day')) {
                className += ' controls-DatePopup__selector-marginLeft';
            } else {
                className += ' controls-DatePopup__selector-marginLeft-withoutModeBtn';
            }
            className += ` controls_popupTemplate_theme-${this._options.theme}`;
        }

        if (this._options.popupClassName) {
            className += ` ${this._options.popupClassName}`;
        }

        return className;
    }

    private _getAdditionalPopupOptions(): object | void {
        if (this._options.datePopupType === 'shortDatePicker') {
            return {
                fittingMode: {
                    vertical: this._fittingMode,
                    horizontal: 'overflow'
                },
                direction: {
                    horizontal: 'center'
                },
                eventHandlers: {
                    onResult: this._sendResultHandler.bind(this)
                }
            };
        }
    }

    protected _getPopupOptions(): IStickyPopupOptions {
        const button = this._children.linkView.getPopupTarget();

        let value = {};
        if (this._options.selectionType === IDateRangeSelectable.SELECTION_TYPES.single) {
            value = PopupUtil.getFormattedSingleSelectionValue(this._rangeModel.startValue || this._startValue);
        }
        return {
            ...PopupUtil.getCommonOptions(this, button),
            target: button,
            template: getDatePopupName(this._options.datePopupType),
            className: this._getPopupClassName(),
            ...this._getAdditionalPopupOptions(),
            templateOptions: {
                ...PopupUtil.getDateRangeTemplateOptions(this),
                ...value,
                headerType: 'link',
                _date: this._options._date,
                resetStartValue: this._options.resetStartValue,
                resetEndValue: this._options.resetEndValue,
                rightFieldTemplate: this._options.rightFieldTemplate,
                calendarSource: this._options.calendarSource,
                dayTemplate: this._options.dayTemplate,
                monthCaptionTemplate: this._options.monthCaptionTemplate,
                captionFormatter: this._options.captionFormatter,
                emptyCaption: this._emptyCaption,
                closeButtonEnabled: true,
                selectionType: this._options.selectionType,
                ranges: this._options.ranges,
                minRange: this._options.minRange,
                _displayDate: this._options._displayDate,
                rangeSelectedCallback: this._options.rangeSelectedCallback,
                state: this._state,
                stateChangedCallback: this._stateChangedCallback,
                chooseMonths: this._options.chooseMonths,
                chooseQuarters: this._options.chooseQuarters,
                chooseHalfyears: this._options.chooseHalfyears,
                chooseYears: this._options.chooseYears,
                monthTemplate: this._options.monthTemplate,
                headerContentTemplate: this._options.headerContentTemplate,
                itemTemplate: this._options.itemTemplate,
                popupClassName: this._options.popupClassName,
                displayedRanges: this._options.displayedRanges,
                stubTemplate: this._options.stubTemplate
            }
        };
    }

    protected _sendResultHandler(fittingMode: string): void {
        if (typeof fittingMode === 'string') {
            this._fittingMode = fittingMode;
            this.openPopup();
        } else {
            super._onResult(...arguments);
        }
    }

    _resetButtonClickHandler(): void {
        this._rangeModel.setRange(this._options.resetStartValue || null, this._options.resetEndValue || null);
    }

    _mouseEnterHandler(): void {
        let libName;
        switch (this._options.datePopupType) {
            case 'shortDatePicker':
                libName = 'Controls/shortDatePicker';
                break;
            case 'compactDatePicker':
                libName = 'Controls/compactDatePicker';
                break;
            default:
                libName = 'Controls/datePopup';
                break;
        }

        const loadCss = (popup) => {
            if (popup.default) {
                return popup.default.loadCSS();
            } else {
                return popup.View.loadCSS();
            }
        };
        this._startDependenciesTimer(libName, loadCss);
    }

    shiftBack(): void {
        this._children.linkView.shiftBack();
    }

    shiftForward(): void {
        this._children.linkView.shiftForward();
    }

    static getDefaultOptions(): object {
        return {
            minRange: 'day',
            ...IPeriodLiteDialog.getDefaultOptions(),
            ...ILinkViewDefaultOptions.getDefaultOptions(),
            ...IDateRangeSelectable.getDefaultOptions(),
            datePopupType: 'datePicker'
        };
    }

    static getOptionTypes(): object {
        return {
            ...IDateRangeSelectable.getOptionTypes(),
            ...ILinkViewDefaultOptions.getOptionTypes()
        };
    }
}
/**
 * @event Происходит при изменении диапазона.
 * @name Controls/_dateRange/RangeSelector#rangeChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Date} startValue верхняя граница диапазона дат
 * @param {Date} endValue нижняя граница диапазона дат
 */

/**
 * @name Controls/_dateRange/RangeSelector#fontSize
 * @cfg
 * @demo Controls-demo/dateRange/RangeSelector/FontSize/Index
 */

Object.defineProperty(RangeSelector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return RangeSelector.getDefaultOptions();
   }
});
