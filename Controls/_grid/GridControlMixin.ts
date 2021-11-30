import {BaseControl, IBaseControlOptions as IGridControlMixinOptions} from 'Controls/baseList';

export {IGridControlMixinOptions};

export class GridControlMixin<
    TControl extends BaseControl<IGridControlMixinOptions> = BaseControl<IGridControlMixinOptions>
    > {
    static getDefaultOptions(): Partial<IGridControlMixinOptions> {
        return {
            /**/
        };
    }
}
