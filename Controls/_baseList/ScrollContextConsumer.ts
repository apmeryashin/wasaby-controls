import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_baseList/ScrollContextConsumer';
import ListScrollContext, {IListScrollContext} from 'Controls/Context/ListScrollContext';

export default class ScrollContextConsumer extends Control {
    _template: TemplateFunction = template;
    private _setScrollContainerViewMode: Function;
    private _canHorizontalScroll: boolean;

    protected _beforeMount(options: unknown, context: IListScrollContext): void {
        this._setOptionsFromCtx(context);
    }

    protected _beforeUpdate(options?: {}, contexts?: any): void {
        this._setOptionsFromCtx(contexts);
    }

    private _setOptionsFromCtx(contexts?: any): void {
        const ctx = contexts && contexts.listScrollContext as ListScrollContext;
        if (ctx) {
            this._setScrollContainerViewMode = ctx.setScrollContainerViewMode;
            this._canHorizontalScroll = ctx.canHorizontalScroll;
        }
    }

    static contextTypes(): object {
        return {
            listScrollContext: ListScrollContext
        };
    }
}
