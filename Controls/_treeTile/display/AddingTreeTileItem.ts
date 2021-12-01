
import TreeTileCollectionItem from './TreeTileCollectionItem';
import { mixin } from 'Types/util';
import { AddingItem } from 'Controls/tile';

/**
 * Элемент добавления записей в плиточной коллекции
 * @author Колесов В.А.
 */
export default class AddingTreeTileItem
    extends mixin<TreeTileCollectionItem, AddingItem>(TreeTileCollectionItem, AddingItem) {

    constructor(options: any) {
        super(options);
        AddingItem.call(this, options);
    }
}

Object.assign(AddingTreeTileItem.prototype, {
    '[Controls/_treeTile/AddingTreeTileItem]': true,
    _moduleName: 'Controls/treeTile:AddingTreeTileItem',
    _instancePrefix: 'adding-tree-tile-item-'
});
