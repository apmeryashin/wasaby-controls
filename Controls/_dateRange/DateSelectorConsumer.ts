import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/DateSelectorConsumer/DateSelectorConsumer';
import DateSelector from 'Controls/_dateRange/DateSelector';
import DateRangeSelectorConsumer from 'Controls/_dateRange/_DateRangeSelectorConsumer';

/**
 * Контрол позволяющий пользователю выбирать дату из календаря.
 * @class Controls/_dateRange/DateSelectorConsumer
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/interface/IDateRange
 * @implements Controls/date:ILinkView
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/dateRange:IDatePickerSelectors
 * @implements Controls/dateRange:IDayTemplate
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontWeight
 * @implements Controls/dateRange:ICaptionFormatter
 * @mixes Controls/dateRange:IDateSelector
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
 * @name Controls/_dateRange/DateSelectorConsumer#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class DateSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        dateRange: DateSelector
        consumer: DateRangeSelectorConsumer
    };

    openPopup(): void {
        this._children.dateRange.openPopup();
    }

    protected _afterMount(options: IControlOptions): void {
        const shiftPeriod = this._children.dateRange.shiftPeriod;
        this._children.consumer.setShiftPeriod(shiftPeriod);
    }
}