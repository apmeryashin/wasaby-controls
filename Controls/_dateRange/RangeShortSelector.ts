import BaseSelector from './BaseSelector';
import {Date as WSDate} from 'Types/entity';
import {ILinkViewDefaultOptions} from 'Controls/date';
import {ICrud} from 'Types/source';
import IPeriodLiteDialog from './interfaces/IPeriodLiteDialog';
import {IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dateRange/RangeShortSelector/RangeShortSelector');
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import 'css!Controls/dateRange';

interface IRangeShortSelectorOptions extends IControlOptions {
    chooseMonths: boolean;
    chooseQuarters: boolean;
    chooseHalfyears: boolean;
    popupClassName: string;
    chooseYears: boolean;
    checkedStart: Date;
    checkedEnd: Date;
    emptyCaption: string;
    source: ICrud;
    monthTemplate: HTMLElement;
    itemTemplate: HTMLElement;
    displayedRanges: Date[];
    stubTemplate: Function;
    captionFormatter: Function;
    dateConstructor: Function;
}
/**
 * Контрол позволяет пользователю выбрать временной период: месяц, квартал, полугодие, год. Выбор происходит с помощью панели быстрого выбора периода.
 *
 * @remark
 * Переменные тем оформления:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_dateRange.less набор переменных dateRange}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_shortDatePicker.less набор переменных shortDatePicker}
 *
 * @class Controls/_dateRange/RangeShortSelector
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/date:ILinkViewDefaultOptions
 * @mixes Controls/dateRange:IPeriodLiteDialog
 * @implements Controls/dateRange:IDateRange
 * @implements Controls/interface:IDisplayedRanges
 *
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/dateRange:ICaptionFormatter
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/LiteSelector/Index
 *
 */

/**
 * @name Controls/_dateRange/RangeShortSelector#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class RangeShortSelector extends BaseSelector<IRangeShortSelectorOptions> {
    protected _template: TemplateFunction = template;
    protected _fittingMode: string = 'overflow';

    EMPTY_CAPTIONS: object = ILinkViewDefaultOptions.EMPTY_CAPTIONS;

    protected _getPopupOptions(): IStickyPopupOptions {
        let className;
        const container = this._children.linkView.getPopupTarget();
        if (!this._options.chooseMonths && !this._options.chooseQuarters && !this._options.chooseHalfyears) {
            className = `controls-DateRangeSelectorLite__picker-years_fontSize-${this._getFontSizeClass()} controls_popupTemplate_theme-${this._options.theme} controls_theme-${this._options.theme}`;
        } else {
            className = 'controls-DateRangeSelectorLite__picker-normal';
        }
        className += ` controls_shortDatePicker_theme-${this._options.theme}`;

        return {
            opener: this,
            template: 'Controls/shortDatePicker:View',
            closeOnOutsideClick: true,
            target: container,
            className,
            fittingMode: {
                vertical: this._fittingMode,
                horizontal: 'overflow'
            },
            direction: {
                horizontal: 'center'
            },
            targetPoint: { horizontal: 'left' },
            eventHandlers: {
                onResult: this._sendResultHandler.bind(this)
            },
            templateOptions: {
                popupClassName: this._options.popupClassName,
                startValue: this._rangeModel.startValue,
                endValue: this._rangeModel.endValue,

                chooseMonths: this._options.chooseMonths,
                chooseQuarters: this._options.chooseQuarters,
                chooseHalfyears: this._options.chooseHalfyears,
                chooseYears: this._options.chooseYears,

                checkedStart: this._options.checkedStart,
                checkedEnd: this._options.checkedEnd,

                emptyCaption: this._options.emptyCaption,

                source: this._options.source,
                monthTemplate: this._options.monthTemplate,
                headerContentTemplate: this._options.headerContentTemplate,
                itemTemplate: this._options.itemTemplate,
                displayedRanges: this._options.displayedRanges,
                stubTemplate: this._options.stubTemplate,
                captionFormatter: this._options.captionFormatter,
                dateConstructor: this._options.dateConstructor
            }
        };
    }

    _mouseEnterHandler(): void {
        if (!this._loadCalendarPopupPromise) {
            const loadCss = ({View}) => View.loadCSS();
            this._startDependenciesTimer('Controls/shortDatePicker', loadCss);
        }
    }

    _resetButtonClickHandler(): void {
        this._rangeModel.setRange(this._options.resetStartValue || null, this._options.resetEndValue || null);
    }

    _sendResultHandler(fittingMode: string): void {
        if (typeof fittingMode === 'string') {
            this._fittingMode = fittingMode;
            this.openPopup();
        }
        super._onResult(...arguments);
    }

    shiftBack(): void {
        this._children.linkView.shiftBack();
    }

    shiftForward(): void {
        this._children.linkView.shiftForward();
    }

    static getDefaultOptions(): object {
        return {
            ...IPeriodLiteDialog.getDefaultOptions(),
            ...ILinkViewDefaultOptions.getDefaultOptions(),
            emptyCaption: ILinkViewDefaultOptions.EMPTY_CAPTIONS.NOT_SPECIFIED,
            dateConstructor: WSDate
        };
    }

    static getOptionTypes(): object {
        return {
            ...IPeriodLiteDialog.getOptionTypes(),
            ...ILinkViewDefaultOptions.getOptionTypes()
        };
    }
}

/**
 * @name Controls/_dateRange/RangeShortSelector#fontSize
 * @cfg
 * @demo Controls-demo/dateRange/LiteSelector/FontSize/Index
 */

Object.defineProperty(RangeShortSelector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return RangeShortSelector.getDefaultOptions();
   }
});