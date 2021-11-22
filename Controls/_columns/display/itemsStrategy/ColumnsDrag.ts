import {Model} from 'Types/entity';
import CollectionItem from '../CollectionItem';
import {itemsStrategy} from 'Controls/display';

/**
 * Стратегия для премещения элементов, относящихся к определённой колонке Collection.
 * При создании аватара элемента использует ту же колонку, в которой начался Drag-n-Drop;
 */
export default class ColumnsDrag<
    S extends Model = Model,
    T extends CollectionItem<S> = CollectionItem<S>
> extends itemsStrategy.TreeDrag<S, T> {
    protected _createItem(protoItem: T): T {
        const item = super._createItem(protoItem);
        if (item && protoItem) {
            item.setColumn(protoItem.getColumn());
        }
        return item;
    }
}
