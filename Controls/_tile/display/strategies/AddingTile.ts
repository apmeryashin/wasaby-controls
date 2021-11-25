import {IItemsStrategy} from 'Controls/display';
import {Model} from 'Types/entity';
import TileCollection from '../TileCollection';
import TileCollectionItem from '../TileCollectionItem';
import AddingTileItem from '../AddingTileItem';

/**
 * Интерфейс опций, с которыми создается стратегия AddingTileStrategy
 */
interface IOptions<S extends Model = Model, T extends TileCollectionItem<S> = TileCollectionItem<S>> {
    source: IItemsStrategy<S, T>;
    display: TileCollection<S, T>;
}

/**
 * Интерфейс опций метода AddingTileStrategy::sortItems
 */
interface ISortOptions<S extends Model = Model, T extends TileCollectionItem<S> = TileCollectionItem<S>> {
    display: TileCollection<S, T>;
}

/**
 * Стратегия, которая создает невидимые элементы в коллекции
 */
export default class AddingTileStrategy<
    S extends Model = Model,
    T extends TileCollectionItem<S> = TileCollectionItem<S>
    > implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean;

    protected _count: number;
    protected _items: T[];
    protected _options: IOptions<S, T>;
    protected _source: IItemsStrategy<S, T>;
    protected _addingTile: AddingTileItem;

    /**
     * Индекс в стратегии -> оригинальный индекс
     */
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
        const itemsOrder = this._getItemsOrder();
        const sourceIndex = this.source.getDisplayIndex(index);
        const overallIndex = sourceIndex + this._invisibleItems.length;
        const itemIndex = itemsOrder.indexOf(overallIndex);

        return itemIndex === -1 ? itemsOrder.length : itemIndex;
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
     * Возвращает подвалы узлов + элементы оригинальной стратегии
     * @protected
     */
    protected _getItems(): T[] {
        if (!this._addingTile) {
            this._addingTile = this.options.display.createItem({
                itemModule: 'Controls/tile:AddingTileItem',
                contents: null
            }) as AddingTileItem;
        }
        return ([this._addingTile] as any[] as T[]).concat(this.source.items);
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
        return AddingTileStrategy.sortItems<S, T>(this.source.items, {
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

Object.assign(AddingTileStrategy.prototype, {
    '[Controls/_display/IItemsStrategy]': true,
    '[Controls/_tile/strategy/AddingTile]': true,
    _moduleName: 'Controls/tile:AddingTileStrategy',
    _itemsOrder: null
});
