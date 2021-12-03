
import TreeTileCollectionItem from './TreeTileCollectionItem';
import { mixin } from 'Types/util';
import { AddItem } from 'Controls/tile';

/**
 * Элемент добавления записей в плиточной коллекции
 * @author Колесов В.А.
 */
export default class AddTreeTileItem
    extends mixin<TreeTileCollectionItem, AddItem>(TreeTileCollectionItem, AddItem) {

    constructor(options: any) {
        super(options);
        AddItem.call(this, options);
    }
}

Object.assign(AddTreeTileItem.prototype, {
    '[Controls/_treeTile/AddTreeTileItem]': true,
    _moduleName: 'Controls/treeTile:AddTreeTileItem',
    _instancePrefix: 'adding-tree-tile-item-'
});
