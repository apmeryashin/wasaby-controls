import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_date/SelectorConsumer/SelectorConsumer';
import Selector from 'Controls/_date/Selector';
import DateSelectorConsumer from 'Controls/_date/_DateSelectorConsumer';

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

export default class SelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        selector: Selector
        consumer: DateSelectorConsumer
    };

    openPopup(): void {
        this._children.selector.openPopup();
    }

    protected _afterMount(options: IControlOptions): void {
        const shiftPeriod = this._children.selector.shiftPeriod;
        this._children.consumer.setShiftPeriod(shiftPeriod);
    }
}
