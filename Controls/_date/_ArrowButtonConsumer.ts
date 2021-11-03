import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_date/ArrowButtonConsumer/_ArrowButtonConsumer';
import DateContext from 'Controls/_date/DateContext';
import {IArrowButtonOptions} from 'Controls/buttons';
import IDateContext from './interface/IDateContext';

export default class ArrowButtonConsumer extends Control<IArrowButtonOptions> {
    protected _template: TemplateFunction = template;
    shiftPeriod: Function;

    protected _beforeMount(options: IArrowButtonOptions, context: IDateContext): void {
        this.shiftPeriod = context.DateContext.shiftPeriod;
    }

    protected _beforeUpdate(options: IArrowButtonOptions, context: IDateContext): void {
        this.shiftPeriod = context.DateContext.shiftPeriod;
    }

    static contextTypes(): object {
        return {
            DateContext
        };
    }
}
