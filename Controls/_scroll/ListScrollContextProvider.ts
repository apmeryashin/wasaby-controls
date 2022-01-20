import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_scroll/ListScrollContextProvider';
import ListScrollContext, {IListScrollContextOptions} from 'Controls/Context/ListScrollContext';

interface IOptions extends IControlOptions, IListScrollContextOptions {
}

export default class ListScrollContextProvider extends Control<IOptions> {
    _template: TemplateFunction = template;

    protected _beforeMount(options: IOptions): void {
        this._scrollContext = new ListScrollContext(options);
    }

    _getChildContext(): object {
        return {
            listScrollContext: this._scrollContext
        };
    }
}
