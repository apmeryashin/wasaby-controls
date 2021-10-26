import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/RangeShortSelectorConsumer/RangeShortSelectorConsumer';
import RangeShortSelector from 'Controls/_dateRange/RangeShortSelector';
import DateRangeSelectorConsumer from 'Controls/_dateRange/_DateRangeSelectorConsumer';

/**
 * Контрол позволяет пользователю выбрать диапазон дат с начальным и конечным значениями в календаре. Выбор происходит с помощью панели быстрого выбора периода.
 * @class Controls/_dateRange/RangeShortSelectorConsumer
 * @extends UI/Base:Control
 * @implements Controls/interface:IResetValues
 * @implements Controls/date:ILinkView
 * @mixes Controls/dateRange:IPeriodLiteDialog
 * @implements Controls/dateRange:IDateRange
 * @implements Controls/interface:IDisplayedRanges
 * @implements Controls/interface:IOpenPopup
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/dateRange:ICaptionFormatter
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
 * @name Controls/_dateRange/RangeShortSelectorConsumer#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class RangeShortSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        dateRange: RangeShortSelector
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
