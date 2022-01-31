import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_horizontalScroll/contexts/controllerAndScrollBarConnector/Consumer';
import Context, {IContext} from './Context';

export default class Consumer extends Control {
    _template: TemplateFunction = template;
    private _scrollPositionChangedCallback?: Context['scrollPositionChangedCallback'];
    private _scrollBarReadyCallback?: Context['scrollBarReadyCallback'];
    private _contentWidth?: Context['contentWidth'];
    private _viewportWidth?: Context['viewportWidth'];
    private _fixedColumnsWidth?: Context['fixedColumnsWidth'];

    protected _beforeMount(options: unknown, context: IContext): void {
        this._setOptionsFromCtx(context);
    }

    protected _beforeUpdate(options?: {}, contexts?: any): void {
        this._setOptionsFromCtx(contexts);
    }

    private _setOptionsFromCtx(contexts?: any): void {
        const ctx = contexts && contexts.horizontalScrollControllerAndScrollBarConnectorContext;
        if (ctx) {
            this._scrollPositionChangedCallback = ctx.scrollPositionChangedCallback;
            this._scrollBarReadyCallback = ctx.scrollBarReadyCallback;
            this._contentWidth = ctx.contentWidth;
            this._viewportWidth = ctx.viewportWidth;
            this._fixedColumnsWidth = ctx.fixedColumnsWidth;
        }
    }

    static contextTypes(): object {
        return {
            horizontalScrollControllerAndScrollBarConnectorContext: Context
        };
    }
}
