import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/RangeSelectorConsumer/RangeSelectorConsumer';
import RangeSelector from 'Controls/_dateRange/RangeSelector';
import DateRangeSelectorConsumer from 'Controls/_dateRange/_DateRangeSelectorConsumer';

/**
 * Контрол позволяет пользователю выбрать временной период: месяц, квартал, полугодие, год. Выбор происходит с помощью панели большого выбора периода.
 * @class Controls/_dateRange/RangeSelectorConsumer
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/dateRange:ILinkView
 * @implements Controls/dateRange:IDateRange
 * @implements Controls/dateRange:IDatePickerSelectors
 * @implements Controls/dateRange:IDayTemplate
 * @implements Controls/dateRange:IDateRangeSelectable
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IUnderline
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/dateRange:ICaptionFormatter
 * @implements Controls/interface:IDateRangeValidators
 * @remark
 * Контрол используется для работы с кнопками dateRange:ArrowButtonConsumer, которые двигают период.
 * Стоит использовать контрол только в связке с dateRange:DateRangeContextProvider.
 * @example
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/DateRangeContextProvider/Index
 * @see Controls/_dateRange/DateRangeContextProvider
 * @see Controls/_buttons/ArrowButton
 * @see Controls/_dateRange/ArrowButtonConsumer
 */

/**
 * @name Controls/_dateRange/RangeSelectorConsumer#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class RangeSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        dateRange: RangeSelector
        consumer: DateRangeSelectorConsumer
    };

    protected _afterMount(options: IControlOptions): void {
        const shiftPeriod = this._children.dateRange.shiftPeriod;
        this._children.consumer.setShiftPeriod(shiftPeriod);
    }
}
