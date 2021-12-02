import {IItemsStrategy} from 'Controls/display';
import {Model} from 'Types/entity';
import TileCollection from '../TileCollection';
import TileCollectionItem from '../TileCollectionItem';
import AddTileItem from '../AddTileItem';

/**
 * Интерфейс опций, с которыми создается стратегия AddTileStrategy
 */
interface IOptions<S extends Model = Model, T extends TileCollectionItem<S> = TileCollectionItem<S>> {
    source: IItemsStrategy<S, T>;
    display: TileCollection<S, T>;
}

/**
 * Интерфейс опций метода AddTileStrategy::sortItems
 */
interface ISortOptions<S extends Model = Model, T extends TileCollectionItem<S> = TileCollectionItem<S>> {
    display: TileCollection<S, T>;
}

/**
 * Стратегия, которая создает плитку добавления в коллекции
 */
export default class AddTileStrategy<
    S extends Model = Model,
    T extends TileCollectionItem<S> = TileCollectionItem<S>
    > implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean;

    protected _count: number;
    protected _items: T[];
    protected _options: IOptions<S, T>;
    protected _source: IItemsStrategy<S, T>;
    protected _addTile: AddTileItem;
    protected _itemsOrder: number[];

    constructor(options: IOptions<S, T>) {
        this._options = options;
    }

    get options(): IOptions<S, T> {
        return this._options;
    }

    get source(): IItemsStrategy<S, T> {
        return this.options.source;
    }

    get count(): number {
        return this._getItemsOrder().length;
    }

    get items(): T[] {
        const itemsOrder = this._getItemsOrder();
        const items = this._getItems();
        return itemsOrder.map((index) => items[index]);
    }

    at(index: number): T {
        return this.source.at(index);
    }

    getCollectionIndex(index: number): number {
        return this.source.getCollectionIndex(index);
    }

    getDisplayIndex(index: number): number {
        return this.source.getDisplayIndex(index);
    }

    invalidate(): void {
        this._itemsOrder = null;
        return this.source.invalidate();
    }

    reset(): void {
        this._itemsOrder = null;
        return this.source.reset();
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._itemsOrder = null;
        return this.source.splice(
            start,
            deleteCount,
            added
        );
    }

    /**
     * Возвращает плитку добавления + элементы оригинальной стратегии
     * @protected
     */
    protected _getItems(): T[] {
        if (!this._addTile) {
            this._addTile = this.options.display.createItem({
                itemModule: 'Controls/tile:AddTileItem',
                contents: new Model({})
            }) as AddTileItem;
        }
        return ([this._addTile] as any[] as T[]).concat(this.source.items);
    }

    /**
     * Возвращает соответствие индексов в стратегии оригинальным индексам
     * @protected
     */
    protected _getItemsOrder(): number[] {
        if (!this._itemsOrder) {
            this._itemsOrder = this._createItemsOrder();
        }

        return this._itemsOrder;
    }

    /**
     * Создает соответствие индексов в стратегии оригинальными индексам
     * @protected
     */
    protected _createItemsOrder(): number[] {
        return AddTileStrategy.sortItems<S, T>(this.source.items, {
            display: this.options.display
        });
    }

    /**
     * Создает индекс сортировки с плиткой добавления
     * @param items Элементы проекции.
     * @param options Опции
     */
    static sortItems<S extends Model = Model, T extends TileCollectionItem<S> = TileCollectionItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): number[] {
        const offset = 1;
        const itemsOrder = items.map((it, index) => index + offset);
        itemsOrder.push(0);
        return itemsOrder;
    }
}

Object.assign(AddTileStrategy.prototype, {
    '[Controls/_display/IItemsStrategy]': true,
    '[Controls/_tile/strategy/AddTile]': true,
    _moduleName: 'Controls/tile:AddTileStrategy',
    _itemsOrder: null
});
