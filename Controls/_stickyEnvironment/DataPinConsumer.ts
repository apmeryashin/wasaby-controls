import {PinController} from './PinController';
import {IPinConsumerContext} from './DataPinProvider';
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_stickyEnvironment/DataPinConsumer';

/**
 * Контрол, принимающий закрепленные данные от {@link Controls/stickyEnvironment:DataPinContainer DataPinContainer}
 * @public
 * @author Уфимцев Д.Ю.
 */
export class DataPinConsumer<T = unknown> extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _pinnedData: T = null;

    protected _beforeMount(options: IControlOptions, context: IPinConsumerContext): void {
        context.pinController.subscribe((pinnedData: T) => this._pinnedData = pinnedData);
    }

    static contextTypes(): object {
        return {
            pinController: PinController
        };
    }
}
