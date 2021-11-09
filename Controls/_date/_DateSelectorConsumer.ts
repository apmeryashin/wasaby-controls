import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_date/_DateSelectorConsumer/_DateSelectorConsumer';
import DateContext from 'Controls/_date/DateContext';
import IDateContext from './interface/IDateContext';

export default class RangeSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    setShiftPeriod: Function;

    protected _beforeMount(options: IControlOptions, context: IDateContext): void {
        this.setShiftPeriod = context.DateContext.setShiftPeriod;
    }

    static contextTypes(): object {
        return {
            DateContext
        };
    }
}
