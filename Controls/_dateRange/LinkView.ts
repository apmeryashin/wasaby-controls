import rk = require('i18n!Controls');
import {EventUtils} from 'UI/Events';
import DateRangeModel from './DateRangeModel';
import IDateLinkView from './interfaces/ILinkView';
import componentTmpl = require('wml!Controls/_dateRange/LinkView/LinkView');
import {Logger} from 'UI/Utils';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
   IFontColorStyle,
   IFontColorStyleOptions, IUnderlineOptions
} from 'Controls/interface';
import {isLeftMouseButton} from 'Controls/popup';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from "Types/entity";
import dateControlsUtils from "./Utils";
import {Base as dateUtils} from 'Controls/dateUtils';
import * as itemTemplate from 'wml!Controls/_dateRange/LinkView/itemTemplate';
import 'css!Controls/dateRange';
import 'css!Controls/CommonClasses';

export interface ILinkViewControlOptions extends IControlOptions, IFontColorStyleOptions, IUnderlineOptions {
}
/**
 * A link button that displays the period. Supports the change of periods to adjacent.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FInput%2FDate%2FLinkView">Demo examples.</a>.
 * @class Controls/_dateRange/LinkView
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/interface:IFontSize
 *
 * @implements Controls/interface:IUnderline
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:IFontColorStyle
 * @mixes Controls/dateRange:ICaptionFormatter
 *
 * @private
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Date/LinkView
 *
 */

/**
 * @name Controls/_dateRange/LinkView#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */
class LinkView extends Control<ILinkViewControlOptions> implements IFontColorStyle {
   protected _template: TemplateFunction = componentTmpl;
   protected _itemTemplate: TemplateFunction = itemTemplate;

   protected _rangeModel = null;
   protected _caption = '';
   protected _styleClass = null;
   protected _viewMode = null;
   protected _fontColorStyle: string = null;
   protected _fontSize: string = null;
   protected _fontWeight: string = null;

   private _defaultFontColorStyle: string;
   private _defaultFontSize: string;
   private _defaultFontWeight: string;

   protected _resetButtonVisible: boolean;

   constructor(options: ILinkViewControlOptions, context?: object) {
      super(options, context);
      this._rangeModel = new DateRangeModel({
         dateConstructor: options.dateConstructor
      });
      EventUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
   }

   _beforeMount(options: ILinkViewControlOptions): void {
      this._updateResetButtonVisible(options);
      this._setDefaultFontSettings(options.viewMode);
      this._rangeModel.update(options);
      this._updateCaption(options);
      this._updateStyles({}, options);

      if (options.clearButtonVisibility) {
         Logger.error('LinkView: Используется устаревшая опция clearButtonVisibility, используйте' +
             'resetStartValue и resetEndValue');
      }
      if (options.prevArrowVisibility) {
         Logger.warn('LinkView: Используется устаревшая опция prevArrowVisibility, используйте контрол ArrowButton');
      }
      if (options.nextArrowVisibility) {
         Logger.warn('LinkView: Используется устаревшая опция nextArrowVisibility, используйте контрол ArrowButton');
      }
   }

   _beforeUpdate(options: ILinkViewControlOptions): void {
      this._updateResetButtonVisible(options);
      var changed = this._rangeModel.update(options);
      if (changed || this._options.emptyCaption !== options.emptyCaption ||
          this._options.captionFormatter !== options.captionFormatter) {
         this._updateCaption(options);
      }
      this._setDefaultFontSettings(options.viewMode);
      this._updateStyles(this._options, options);
   }

   private _setDefaultFontSettings(viewMode: string): void {
      this._defaultFontSize = viewMode === 'selector' ? 'l' : 'm';
      this._defaultFontColorStyle = viewMode === 'label' ? 'label' : 'link';
      this._defaultFontWeight =  viewMode === 'selector' ? 'bold' : 'normal';
   }

   _beforeUnmount() {
      this._rangeModel.destroy();
   }

   shiftPeriod(delta: number): void {
       if (delta === 1) {
           this.shiftForward();
       } else {
           this.shiftBack();
       }
   }

   shiftBack(): void {
      this._rangeModel.shiftBack();
      this._updateCaption();
   }

   shiftForward(): void {
      this._rangeModel.shiftForward();
      this._updateCaption();
   }

   _resetButtonClickHandler(): void {
      this._notify('resetButtonClick');
   }

   _updateResetButtonVisible(options): void {
      const hasResetStartValue = options.resetStartValue || options.resetStartValue === null;
      const hasResetEndValue = options.resetEndValue || options.resetEndValue === null;
      this._resetButtonVisible = (hasResetStartValue &&
          (!dateUtils.isDatesEqual(options.startValue, options.resetStartValue) ||
              options.startValue !== options.resetStartValue)) ||
          (hasResetEndValue &&
              (!dateUtils.isDatesEqual(options.endValue, options.resetEndValue)
                  || options.endValue !== options.resetEndValue));
   }

   getPopupTarget() {
      return this._children.openPopupTarget || this._container;
   }

   _onClick(event: SyntheticEvent): void {
      if (!isLeftMouseButton(event)) {
         return;
      }
      if (!this._options.readOnly && this._options.clickable) {
         this._notify('linkClick');
      }
   }

   _getCaption(options, startValue: Date | null, endValue: Date | null, captionFormatter: Function): string {
      return captionFormatter(startValue, endValue, options.emptyCaption);
   }

   _updateCaption(options): void {
      const opts = options || this._options;
      let captionFormatter;
      let startValue;
      let endValue;
      let captionPrefix = '';

      if (opts.captionFormatter) {
         captionFormatter = opts.captionFormatter;
         startValue = this._rangeModel.startValue;
         endValue = this._rangeModel.endValue;
      } else {
         captionFormatter = dateControlsUtils.formatDateRangeCaption;

         if (this._rangeModel.startValue === null && this._rangeModel.endValue === null) {
            startValue = null;
            endValue = null;
         } else if (this._rangeModel.startValue === null) {
            startValue = this._rangeModel.endValue;
            endValue = this._rangeModel.endValue;
            captionPrefix = `${rk('по', 'Period')} `;
         } else if (this._rangeModel.endValue === null) {
            startValue = this._rangeModel.startValue;
            endValue = this._rangeModel.startValue;
            captionPrefix = `${rk('с')} `;
         } else {
            startValue = this._rangeModel.startValue;
            endValue = this._rangeModel.endValue;
         }
      }
      this._caption = captionPrefix + this._getCaption(opts, startValue, endValue, captionFormatter);
   }

   _updateStyles(options, newOption): void {
      this._fontColorStyle = newOption.fontColorStyle || this._defaultFontColorStyle;
      if (newOption.readOnly) {
         if (this._fontColorStyle === 'filterPanelItem' || this._fontColorStyle === 'filterItem') {
            this._fontColorStyle = this._fontColorStyle + '_readOnly';
         } else {
            this._fontColorStyle = 'default';
         }
      }
      this._fontSize = newOption.fontSize || this._defaultFontSize;
      this._fontWeight = newOption.fontWeight || this._defaultFontWeight;
   }
}

LinkView.EMPTY_CAPTIONS = IDateLinkView.EMPTY_CAPTIONS;

LinkView.getDefaultOptions = () => {
   return {
      ...IDateLinkView.getDefaultOptions(),
      emptyCaption: IDateLinkView.EMPTY_CAPTIONS.NOT_SPECIFIED
   };
};

Object.defineProperty(LinkView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return LinkView.getDefaultOptions();
   }
});

LinkView.getOptionTypes = () => {
   return {
      ...IDateLinkView.getOptionTypes(),
      captionFormatter: descriptor(Function)
   }
}

/**
 * @name Controls/_dateRange/LinkView#fontSize
 * @cfg
 * @demo Controls-demo/dateRange/LinkView/FontSize/Index
 */

export default LinkView;
