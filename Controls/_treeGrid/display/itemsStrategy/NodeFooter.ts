import { Model } from 'Types/entity';
import { itemsStrategy, TreeItem } from 'Controls/display';

export default class TreeGridNodeFooter extends itemsStrategy.NodeFooter {
    // tslint:disable-next-line:typedef
    protected _shouldAddExtraItem(item: TreeItem<Model>, options): boolean {
        return super._shouldAddExtraItem(item, options) || options.display.hasNodeFooterColumns();
    }
}
