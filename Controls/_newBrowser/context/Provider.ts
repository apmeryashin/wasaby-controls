import { Control, IControlOptions, TemplateFunction } from 'UI/Base';
import * as DataContext from 'Core/DataContext';

import { TKey } from 'Controls/interface';
import * as template from 'wml!Controls/_newBrowser/context/Provider';

export interface IActiveElementContextOptions {
    activeElement: TKey;
    changeActiveElement: (activeElement: TKey) => void;
}

type IOptionsActiveElementContextProvider = IControlOptions & IActiveElementContextOptions;

export class ActiveElementContext extends DataContext {
    protected _activeElement: IActiveElementContextOptions['activeElement'];
    protected _changeActiveElement: IActiveElementContextOptions['changeActiveElement'];

    constructor(options: IActiveElementContextOptions) {
        super();
        this._activeElement = options.activeElement;
        this._changeActiveElement = options.changeActiveElement;
    }

    getValue(): IActiveElementContextOptions {
        return {
            activeElement: this._activeElement,
            changeActiveElement: this._changeActiveElement
        };
    }

    setActiveElement(activeElement: TKey): void {
        this._activeElement = activeElement;
        this.updateConsumers();
    }

    protected _moduleName: string = 'Controls/_context/ActiveElementContext';
}

export interface IContextsWithActiveElementContext {
    activeElementContext: ActiveElementContext;
}

export default class ActiveElementContextProvider<T = unknown> extends Control<IOptionsActiveElementContextProvider> {
    protected _template: TemplateFunction = template;
    protected _activeElementContext: ActiveElementContext;

    protected _beforeMount(options?: IOptionsActiveElementContextProvider,
                           contexts?: IContextsWithActiveElementContext, receivedState?: void): Promise<void> | void  {
        this._activeElementContext = new ActiveElementContext({
            activeElement: options.activeElement,
            changeActiveElement: options.changeActiveElement
        });
        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: IOptionsActiveElementContextProvider,
                            contexts?: IContextsWithActiveElementContext): void {
        if (this._options.activeElement !== options.activeElement) {
            this._activeElementContext.setActiveElement(options.activeElement);
        }
        super._beforeUpdate(options, contexts);
    }

    _getChildContext(): IContextsWithActiveElementContext {
        return {
            activeElementContext: this._activeElementContext
        };
    }
}
