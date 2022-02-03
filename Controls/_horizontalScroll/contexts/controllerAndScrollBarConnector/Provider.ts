import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_horizontalScroll/contexts/controllerAndScrollBarConnector/Provider';
import Context, {IContextOptions, IContext} from './Context';

interface IOptions extends IControlOptions, IContextOptions {
}

export default class Provider extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    private _hScrollContext: Context;

    protected _beforeMount(options: IOptions): void {
        this._hScrollContext = new Context(options);
    }

    protected _beforeUpdate(options: IOptions): void {
        this._hScrollContext.setOptions(options);
    }

    _getChildContext(): IContext {
        return {
            horizontalScrollControllerAndScrollBarConnectorContext: this._hScrollContext
        };
    }
}
