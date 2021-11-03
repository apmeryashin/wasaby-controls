import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_date/DateContextProvider/DateContextProvider';
import DateContext from 'Controls/_date/DateContext';

/**
 * Контрол-обертка для связи выбора периода и кнопок-стрелок, которые будут сдвигать период.
 *
 * @class Controls/_date/DateContextProvider
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/DateRangeContextProvider/Index
 * @see Controls/_date/ArrowButton
 */

/**
 * @name Controls/_date/DateContextProvider#content
 * @cfg {TemplateFunction|String} Пользовательский шаблон.
 * @example
 * <pre>
 *     <Controls.date:DateContextProvider>
 *         <Controls.date:ArrowButtonConsumer direction="left"/>
 *         <Controls.date:SelectorConsumer bind:value="_value"/>
 *         <Controls.date:ArrowButtonConsumer direction="right"/>
 *     </Controls.date:DateContextProvider>
 * </pre>
 */

export default class DateContextProvider extends Control {
    protected _template: TemplateFunction = template;
    private _dateContext: DateContext = new DateContext();

    _getChildContext(): object {
        return {
            DateContext: this._dateContext
        };
    }
}
