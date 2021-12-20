import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_newBrowser/context/Provider';

export interface INewBrowserContext <T = unknown> {
    activeElement: number;
    setActiveElement: Function;
}

export class Provider<T = unknown> extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    _getChildContext(): INewBrowserContext {
        return {
            activeElement: null,
            setActiveElement: () => {
                //
            }
        };
    }
}
