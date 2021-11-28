import {BaseControl, IBaseControlOptions} from 'Controls/baseList';
import {TColumns} from './display/interface/IColumn';

export interface IGridControlMixinOptions extends IBaseControlOptions {
    columns: TColumns;
}

export class GridControlMixin<
    TControl extends BaseControl<IGridControlMixinOptions> = BaseControl<IGridControlMixinOptions>
> {
    static getDefaultOptions(): Partial<IGridControlMixinOptions> {
        return {/**/};
    }
}
