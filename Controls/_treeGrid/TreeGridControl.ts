import {mixin} from 'Types/util';
import {IScrollParams} from 'Controls/baseList';
import {TreeControl, ITreeControlOptions} from 'Controls/tree';
import {GridControlMixin, IGridControlMixinOptions} from 'Controls/grid';
import {SyntheticEvent} from 'UI/Vdom';

export interface ITreeGridControlOptions extends ITreeControlOptions, IGridControlMixinOptions {}

export class TreeGridControl extends mixin<TreeControl, GridControlMixin>(TreeControl, GridControlMixin) {
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

    static getDefaultOptions(): Partial<ITreeGridControlOptions> {
        return {
            ...TreeControl.getDefaultOptions(),
            ...GridControlMixin.getDefaultOptions()
        };
    }
}
