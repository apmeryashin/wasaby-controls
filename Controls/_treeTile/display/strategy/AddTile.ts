import {IItemsStrategy} from 'Controls/display';
import {Model} from 'Types/entity';
import TreeTileCollection from '../TreeTileCollection';
import TreeTileCollectionItem from '../TreeTileCollectionItem';
import AddTreeTileItem from '../AddTreeTileItem';

/**
 * Интерфейс опций, с которыми создается стратегия AddTreeTileStrategy
 */
interface IOptions<S extends Model = Model, T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>> {
    source: IItemsStrategy<S, T>;
    display: TreeTileCollection<S, T>;
}

/**
 * Интерфейс опций метода AddTreeTileStrategy::sortItems
 */
interface ISortOptions<S extends Model = Model, T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>> {
    display: TreeTileCollection<S, T>;
}

/**
 * Стратегия, которая создает плитку добавления в коллекции
 */
export default class AddTreeTileStrategy<
    S extends Model = Model,
    T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>
    > implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean;

    protected _count: number;
    protected _items: T[];
    protected _options: IOptions<S, T>;
    protected _source: IItemsStrategy<S, T>;
    protected _addingTreeTile: AddTreeTileItem;
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
        if (!this._addingTreeTile) {
            this._addingTreeTile = this.options.display.createItem({
                itemModule: 'Controls/treeTile:AddTreeTileItem',
                contents: new Model({})
            }) as AddTreeTileItem;
        }
        return ([this._addingTreeTile] as any[] as T[]).concat(this.source.items);
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
        return AddTreeTileStrategy.sortItems<S, T>(this.source.items, {
            display: this.options.display
        });
    }

    /**
     * Создает индекс сортировки с плиткой добавления
     * @param items Элементы проекции.
     * @param options Опции
     */
    static sortItems<S extends Model = Model, T extends TreeTileCollectionItem<S> = TreeTileCollectionItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): number[] {
        const offset = 1;
        const itemsOrder = items.map((it, index) => index + offset);
        itemsOrder.push(0);
        return itemsOrder;
    }
}

Object.assign(AddTreeTileStrategy.prototype, {
    '[Controls/_display/IItemsStrategy]': true,
    '[Controls/_treeTile/strategy/AddTreeTile]': true,
    _moduleName: 'Controls/treeTile:AddTreeTileStrategy',
    _itemsOrder: null
});
