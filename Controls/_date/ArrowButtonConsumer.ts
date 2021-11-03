import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_date/ArrowButtonConsumer/ArrowButtonConsumer';
import {IArrowButtonOptions} from 'Controls/buttons';

/**
 * Контрол кнопка для переключения периода.
 * @class Controls/_date/ArrowButtonConsumer
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/DateRangeContextProvider/Index
 * @see Controls/_date/ContextProvider
 * @see Controls/_buttons/ArrowButton
 */

export default class ArrowButtonConsumer extends Control<IArrowButtonOptions> {
    protected _template: TemplateFunction = template;

    protected _clickHandler(): void {
        const delta = this._options.direction === 'left' ? -1 : 1;
        this._children.consumer.shiftPeriod(delta);
    }
}
