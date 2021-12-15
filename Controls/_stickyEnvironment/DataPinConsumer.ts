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

    private _pinController: PinController;

    protected _beforeMount(options: IControlOptions, context: IPinConsumerContext): void {
        this._pinController = context.pinController;
        this._pinCallback = this._pinCallback.bind(this);

        this._pinController.subscribe(this._pinCallback);
    }

    protected _beforeUnmount(): void {
        this._pinController.unsubscribe(this._pinCallback);
    }

    private _pinCallback(pinnedData: T): void {
        this._pinnedData = pinnedData;
    }

    static contextTypes(): object {
        return {
            pinController: PinController
        };
    }
}
