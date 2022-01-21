import { Model } from 'Types/entity';
import { itemsStrategy, TreeItem } from 'Controls/display';
import {ISortOptions} from 'Controls/_display/itemsStrategy/NodeFooter';

export default class TreeGridNodeFooter extends itemsStrategy.NodeFooter {
    protected _shouldAddExtraItem(item: TreeItem<Model>, options: ISortOptions): boolean {
        return super._shouldAddExtraItem(item, options) || options.display.hasNodeFooterColumns();
    }
}
