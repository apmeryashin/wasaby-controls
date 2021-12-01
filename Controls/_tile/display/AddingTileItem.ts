import TileCollectionItem, {ITileCollectionItemOptions} from './TileCollectionItem';
import { mixin } from 'Types/util';
import AddingItem from 'Controls/_tile/display/mixins/AddingItem';

/**
 * Элемент добавления записей в плиточной коллекции
 * @author Колесов В.А.
 */
export default class AddingTileItem
    extends mixin<TileCollectionItem, AddingItem>(TileCollectionItem, AddingItem) {

    constructor(options: ITileCollectionItemOptions) {
        super(options);
        AddingItem.call(this, options);
    }
}

Object.assign(AddingTileItem.prototype, {
    '[Controls/_tile/AddingTileItem]': true,
    _moduleName: 'Controls/tile:AddingTileItem',
    _instancePrefix: 'adding-tile-item-'
});
