import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { TKey } from 'Controls/interface';
import { ActiveElementContext, IActiveElementContextOptions, IContextsWithActiveElementContext } from './Provider';
import * as template from 'wml!Controls/_newBrowser/context/Consumer';

export default class Consumer<T = unknown> extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _activeElement: TKey;
    protected _changeActiveElement: IActiveElementContextOptions['changeActiveElement'];

    protected _beforeMount(options?: IControlOptions,
                           contexts?: IContextsWithActiveElementContext, receivedState?: void): void {
        const { activeElement, changeActiveElement } = contexts.activeElementContext.getValue();
        this._activeElement = activeElement;
        this._changeActiveElement = changeActiveElement;
        super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: IControlOptions, contexts?: IContextsWithActiveElementContext): void {
        const { activeElement, changeActiveElement } = contexts.activeElementContext.getValue();
        this._activeElement = activeElement;
        this._changeActiveElement = changeActiveElement;
        super._beforeUpdate(options, contexts);
    }

    static contextTypes(): object {
        return {
            activeElementContext: ActiveElementContext
        };
    }
}
