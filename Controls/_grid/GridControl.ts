import {mixin} from 'Types/util';
import {BaseControl, IBaseControlOptions, IScrollParams} from 'Controls/baseList';
import {GridControlMixin, IGridControlMixinOptions} from './GridControlMixin';
import {SyntheticEvent} from 'UI/Vdom';

export interface IGridControlOptions extends IBaseControlOptions, IGridControlMixinOptions {}

export class GridControl extends mixin<BaseControl, GridControlMixin>(BaseControl, GridControlMixin) {
    constructor() {
        super(arguments);
        GridControlMixin.call(this, arguments);
    }

    protected _prepareItemsOnMount(self: this, newOptions: IGridControlMixinOptions): void {
        super._prepareItemsOnMount(self, newOptions);
        GridControlMixin.prototype._$prepareItemsOnMount.apply(this, [newOptions]);
    }

    protected _afterMount(...args): void {
        super._afterMount(...args);
        GridControlMixin.prototype._$afterMount.apply(this, args);
    }

    _beforeRender(...args): void {
        super._beforeRender(...args);
        GridControlMixin.prototype._$beforeRender.apply(this, args);
    }

    _afterRender(...args): void {
        super._afterRender(...args);
        GridControlMixin.prototype._$afterRender.apply(this, args);
    }

    _observeScrollHandler(...args: [SyntheticEvent<Event>, string, IScrollParams]): void {
        super._observeScrollHandler.apply(this, args);
        const [, eventName, params] = args;
        GridControlMixin.prototype._$observeScrollHandler.apply(this, [eventName, params]);
    }

    viewportResizeHandler(viewportHeight: number, viewportRect: DOMRect, scrollTop: number): void {
        super.viewportResizeHandler(viewportHeight, viewportRect, scrollTop);
        GridControlMixin.prototype._$viewportResizeHandler.apply(this, [viewportHeight, viewportRect, scrollTop]);
    }

    _onColumnScroll(e, position: number): void {
        GridControlMixin.prototype._$onColumnScroll.apply(this, arguments);
    }

    static getDefaultOptions(): Partial<IGridControlOptions> {
        return {
            ...BaseControl.getDefaultOptions(),
            ...GridControlMixin.getDefaultOptions()
        };
    }
}
