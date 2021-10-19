import BaseSelector, {IBaseSelectorOptions} from 'Controls/_dateRange/BaseSelector';
import ILinkView from './interfaces/ILinkView';
import {IDateSelectorOptions} from './interfaces/IDateSelector';
import componentTmpl = require('wml!Controls/_dateRange/DateSelector/DateSelector');
import * as monthCaptionTemplate from 'wml!Controls/_dateRange/DateSelector/monthCaptionTemplate';
import {Base as dateUtils, Popup as PopupUtil} from 'Controls/dateUtils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import 'css!Controls/dateRange';

/**
 * Контрол позволяющий пользователю выбирать дату из календаря.
 *
 * @class Controls/_dateRange/DateSelector
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/interface/IDateRange
 * @implements Controls/dateRange:ILinkView
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/dateRange:IDatePickerSelectors
 * @implements Controls/dateRange:IDayTemplate
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IUnderline
 * @implements Controls/interface:IFontWeight
 * @implements Controls/dateRange:ICaptionFormatter
 * @mixes Controls/dateRange:IDateSelector
 * @mixes Controls/dateRange:IMonthCaptionTemplate
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/Link
 *
 */

/**
 * @name Controls/_dateRange/DateSelector#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

/*ENG
 * Control that allows user to select date value in calendar.
 *
 * @class Controls/_dateRange/DateSelector
 * @extends UI/Base:Control
 * @implements Controls/interface/IDateRange
 * @implements Controls/dateRange:ILinkView
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/dateRange:IDatePickerSelectors
 * @implements Controls/dateRange:IDayTemplate
 * @implements Controls/interface:IFontColorStyle
 * @mixes Controls/dateRange:IDateSelector
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/Link
 *
 */

export default class DateSelector extends BaseSelector<IDateSelectorOptions> {
   protected _template: TemplateFunction = componentTmpl;
   protected _monthCaptionTemplate: TemplateFunction = monthCaptionTemplate;
   private _state: string;
   EMPTY_CAPTIONS: object = ILinkView.EMPTY_CAPTIONS;

   _beforeMount(options?: IDateSelectorOptions): Promise<void> | void {
      this._updateValues(options);
      super._beforeMount(options);
   }

   protected _beforeUpdate(options: IDateSelectorOptions): void {
      this._updateValues(options);
      super._beforeUpdate(options);
   }

   _updateValues(options: IDateSelectorOptions): void {
      this._startValue = options.value === undefined ? this._rangeModel?.startValue : options.value;
      this._endValue = options.value === undefined ? this._rangeModel?.endValue : options.value;
   }

   protected _getPopupOptions(): IStickyPopupOptions {
      const container = this._children.linkView.getPopupTarget();
      const value = PopupUtil.getFormattedSingleSelectionValue(this._startValue);
      return {
         ...PopupUtil.getCommonOptions(this),
         target: container,
         template: 'Controls/datePopup',
         className: `controls-PeriodDialog__picker controls_datePicker_theme-${this._options.theme} controls_popupTemplate_theme-${this._options.theme}`,
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

   _mouseEnterHandler(): void {
      const loadCss = (datePopup) => datePopup.default.loadCSS();
      this._startDependenciesTimer('Controls/datePopup', loadCss);
   }

   protected _resetButtonClickHandler(): void {
      // TODO: https://online.sbis.ru/opendoc.html?guid=40090032-fc78-4039-ad24-42cf611d4c94
      this._startValue = this._endValue = this._options.resetStartValue || null;
      this._notify('valueChanged', [this._startValue]);
   }

   protected _onResult(value: Date): void {
      this._notify('valueChanged', [value]);
      this._startValue = value;
      this._endValue = value;
      super._onResult(value, value);
   }

   protected _rangeChangedHandler(event: SyntheticEvent, value: Date): void {
      this._notify('valueChanged', [value]);
   }

   shiftBack(): void {
      this._children.linkView.shiftBack();
   }

   shiftForward(): void {
      this._children.linkView.shiftForward();
   }

   static getDefaultOptions(): object {
      return {
         ...ILinkView.getDefaultOptions(),
         emptyCaption: ILinkView.EMPTY_CAPTIONS.NOT_SPECIFIED
      };
   }

   static getOptionTypes(): object {
      return {
         ...ILinkView.getOptionTypes()
      };
   }

}

Object.defineProperty(DateSelector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return DateSelector.getDefaultOptions();
   }
});
