import TileCollectionItem, {ITileCollectionItemOptions} from './TileCollectionItem';
import { mixin } from 'Types/util';
import AddItem from 'Controls/_tile/display/mixins/AddItem';

/**
 * Элемент добавления записей в плиточной коллекции
 * @author Колесов В.А.
 */
export default class AddTileItem
    extends mixin<TileCollectionItem, AddItem>(TileCollectionItem, AddItem) {

    constructor(options: ITileCollectionItemOptions) {
        super(options);
        AddItem.call(this, options);
    }
}

Object.assign(AddTileItem.prototype, {
    '[Controls/_tile/AddTileItem]': true,
    _moduleName: 'Controls/tile:AddTileItem',
    _instancePrefix: 'adding-tile-item-'
});
