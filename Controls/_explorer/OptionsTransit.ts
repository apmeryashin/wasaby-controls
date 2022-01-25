import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_explorer/OptionsTransit';

interface IOptionsTransit extends IControlOptions {
    [key: string]: unknown;
}

/**
 * Компонент позволяет управлять потоком опций, проходящим через него. Например,
 * он позволяет на время закрыть пропускание опций дочернему контролу.
 */
export default class OptionsTransit extends Control<IOptionsTransit> {
    protected _template: TemplateFunction = template;

    protected _transitOptions: unknown;

    protected _freezedOptions: unknown;

    private _transitStatus: 'unlock' | 'lock' = 'unlock';

    //region life circle hooks
    protected _beforeMount(options?: IOptionsTransit, contexts?: object, receivedState?: void): Promise<void> | void {
        this._transitOptions = options;
    }

    protected _beforeUpdate(options?: IOptionsTransit): void {
        if (this._transitStatus === 'unlock') {
            this._transitOptions = options;
            return;
        }

        this._freezedOptions = options;
    }
    //endregion

    lock(): void {
        this._transitStatus = 'lock';
    }

    unlock(): void {
        this._transitStatus = 'unlock';

        this._transitOptions = this._freezedOptions;
        this._freezedOptions = undefined;
    }
}
