import TileCollectionItem from './TileCollectionItem';
import {Model} from 'Types/entity';
import {Collection, CollectionItem, ICollectionOptions, ItemsFactory, itemsStrategy} from 'Controls/display';
import Tile from 'Controls/_tile/display/mixins/Tile';
import { mixin } from 'Types/util';
import {IOptions as ITileItemOptions} from './mixins/TileItem';
import InvisibleStrategy from './strategies/Invisible';
import {ITileAspectOptions} from '../TileView';
import AddTileStrategy from 'Controls/_tile/display/strategies/AddTile';
import {StrategyConstructor} from 'Controls/_display/Collection';

export interface ITileCollectionOptions<
    S extends Model = Model,
    T extends TileCollectionItem<S> = TileCollectionItem<S>
> extends ICollectionOptions<S, T>, ITileAspectOptions { }

/**
 * Плиточная коллекция
 * @author Панихин К.А.
 */
export default class TileCollection<
    S extends Model = Model,
    T extends TileCollectionItem<S> = TileCollectionItem<S>
> extends mixin<Collection, Tile>(Collection, Tile) {
    protected _addTileStrategy: StrategyConstructor<AddTileStrategy> = AddTileStrategy;
    constructor(options: ITileCollectionOptions<S, T>) {
        super(options);
        Tile.call(this, options);
    }

    setActiveItem(item: T): void {
        if (!item) {
            this.setHoveredItem(null);
        }
        super.setActiveItem(item);
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const parent = super._getItemsFactory();

        return function TileItemsFactory(options: ITileItemOptions<S>): T {
            const params = this._getItemsFactoryParams(options);
            return parent.call(this, params);
        };
    }

    protected _createComposer(): itemsStrategy.Composer<S, CollectionItem<Model>> {
        const composer = super._createComposer();

        composer.append(InvisibleStrategy, {
            display: this
        });

        return composer;
    }

    showAddingItem(): void {
        this._prependStrategy(this._addTileStrategy as StrategyConstructor<any>,
            { display: this },
            InvisibleStrategy);
        this._reIndex();
    }

    hideAddingItem(): void {
        this.removeStrategy(this._addTileStrategy as StrategyConstructor<any>);
        this._reIndex();
    }
}

Object.assign(TileCollection.prototype, {
    '[Controls/_tile/TileCollection]': true,
    _moduleName: 'Controls/tile:TileCollection',
    _itemModule: 'Controls/tile:TileCollectionItem'
});
