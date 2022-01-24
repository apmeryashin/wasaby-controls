import ExtraNodeItem, {
    IInsertExtraItemIndexParams,
    ISortOptions
} from './ExtraNodeItem';
import TreeItem from 'Controls/_display/TreeItem';
import { Model } from 'Types/entity';

export default class NodeHeader <S extends Model = Model, T extends TreeItem<S> = TreeItem<S>>
    extends ExtraNodeItem {

    protected _getExtraItemContent(item: T): string {
        return 'node-header-' + item.getContents().getKey();
    }

    protected _setExtraItem(item: T, extraItem: T): void {
        item.setNodeHeader(extraItem);
    }

    protected _shouldAddExtraItem(item: TreeItem<Model>, options: ISortOptions<S, T>): boolean {
        return item.hasMoreStorage('backward');
    }

    protected _insertExtraItemIndex(params: IInsertExtraItemIndexParams): void {
        const { extraItem, extraItems, items, itemsOrder } = params;
        const node = extraItem.getNode();
        const sourceNodeIndex = items.indexOf(node);
        const extraItemIndex = extraItems.indexOf(extraItem);

        // вставляем индекс хедера в начало узла
        itemsOrder.splice(sourceNodeIndex + 1, 0, extraItemIndex);
    }
}

Object.assign(NodeHeader.prototype, {
    '[Controls/_display/itemsStrategy/NodeHeader]': true,
    _moduleName: 'Controls/display:itemsStrategy.NodeHeader'
});
