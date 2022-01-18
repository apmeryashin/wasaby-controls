import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_baseList/ScrollContextConsumer';
import ListScrollContext, {IListScrollContext} from 'Controls/Context/ListScrollContext';

export default class ScrollContextConsumer extends Control {
    _template: TemplateFunction = template;
    private _toggleHorizontalScrollCallback: Function;

    protected _beforeMount(options: unknown, context: IListScrollContext): void {
        if (context.listScrollContext) {
            this._toggleHorizontalScrollCallback = context.listScrollContext.toggleHorizontalScrollCallback;
        }
    }

    static contextTypes(): object {
        return {
            listScrollContext: ListScrollContext
        };
    }
}
