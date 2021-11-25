import TileCollectionItem, {ITileCollectionItemOptions} from './TileCollectionItem';
import { mixin } from 'Types/util';

// export interface IAddingTileItemOptions extends ITileCollectionItemOptions {
// }

/**
 * Невидимый элемент в плиточной коллекции
 * @author Панихин К.А.
 */
export default class AddingTileItem
    extends mixin<TileCollectionItem>(TileCollectionItem) {
    constructor(options: ITileCollectionItemOptions) {
        super(options);
        TileCollectionItem.call(this, options);
    }

    // переопределяем key, т.к. по дефолту он берется из contents, но в пачке невидимых элементов одинаковый contents,
    // поэтому падает ошибка с дубликатами ключе в верстке
    get key(): string {
        return this._instancePrefix + this.getInstanceId();
    }
}

Object.assign(AddingTileItem.prototype, {
    '[Controls/_tile/AddingTileItem]': true,
    _moduleName: 'Controls/tile:AddingTileItem',
    _instancePrefix: 'adding-tile-item-'
});
