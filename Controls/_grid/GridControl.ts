import {mixin} from 'Types/util';
import {BaseControl, IBaseControlOptions} from 'Controls/baseList';
import {GridControlMixin, IGridControlMixinOptions} from './GridControlMixin';

export interface IGridControlOptions extends IBaseControlOptions, IGridControlMixinOptions {
    /**/
}

export class GridControl extends mixin<BaseControl, GridControlMixin>(BaseControl, GridControlMixin) {
    static getDefaultOptions(): Partial<IGridControlOptions> {
        return {
            ...BaseControl.getDefaultOptions(),
            ...GridControlMixin.getDefaultOptions()
        };
    }
}
