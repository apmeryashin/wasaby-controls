import { INewBrowserContext } from './Provider';
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_newBrowser/context/Consumer';

export class Consumer<T = unknown> extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    static contextTypes(): INewBrowserContext {
        return {
            activeElement: null,
            setActiveElement: () => {
                //
            }
        };
    }
}
