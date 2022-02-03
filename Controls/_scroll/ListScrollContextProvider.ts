import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_scroll/ListScrollContextProvider';
import ListScrollContext, {IListScrollContextOptions} from 'Controls/Context/ListScrollContext';

interface IOptions extends IControlOptions, IListScrollContextOptions {
}

export default class ListScrollContextProvider extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    private _scrollContext: ListScrollContext;

    protected _beforeMount(options: IOptions): void {
        this._scrollContext = new ListScrollContext(options);
    }

    protected _beforeUpdate(options?: IOptions): void {
        this._scrollContext.updateOptions(options);
    }

    _getChildContext(): object {
        return {
            listScrollContext: this._scrollContext
        };
    }
}
