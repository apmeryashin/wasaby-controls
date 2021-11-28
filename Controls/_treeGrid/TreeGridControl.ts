import {mixin} from 'Types/util';
import {TreeControl, ITreeControlOptions} from 'Controls/tree';
import {GridControlMixin, IGridControlMixinOptions} from 'Controls/grid';

export interface ITreeGridControlOptions extends ITreeControlOptions, IGridControlMixinOptions {
    /**/
}

export class TreeGridControl extends mixin<TreeControl, GridControlMixin>(TreeControl, GridControlMixin) {
    static getDefaultOptions(): Partial<ITreeGridControlOptions> {
        return {
            ...TreeControl.getDefaultOptions(),
            ...GridControlMixin.getDefaultOptions()
        };
    }
}
