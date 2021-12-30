import { IItemsStrategy } from 'Controls/display';
import CollectionItem, { MODULE_NAME } from '../CompositeCollectionItem';
import Collection from '../Collection';
import { Model } from 'Types/entity';
import { ObservableList } from 'Types/collection';

interface IOptions<S, T extends CollectionItem<S>> {
    source: IItemsStrategy<S, T>;
    display: Collection<S, T>;
}

interface ISortOptions<S, T extends CollectionItem<S>> {
    display: Collection<S, T>;
    compositeItems: T[];
}

export default class CompositeItems<S extends Model = Model, T extends CollectionItem<S> = CollectionItem<S>>
    implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean;

    protected _count: number;
    protected _items: T[];
    protected _options: IOptions<S, T>;
    protected _source: IItemsStrategy<S, T>;

    protected _compositeItems: T[] = [];

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
        const itemsOrder = this._getItemsOrder();
        const itemIndex = itemsOrder[index];

        if (itemIndex === undefined) {
            throw new ReferenceError(`Index ${index} is out of bounds.`);
        }

        return this._getItems()[itemIndex];
    }

    getCollectionIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const overallIndex = itemsOrder[index];
        let sourceIndex = overallIndex - this._compositeItems.length;

        sourceIndex = sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;

        return sourceIndex;
    }

    getDisplayIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const sourceIndex = this.source.getDisplayIndex(index);
        const overallIndex = sourceIndex + this._compositeItems.length;
        const itemIndex = itemsOrder.indexOf(overallIndex);

        return itemIndex === -1 ? itemsOrder.length : itemIndex;
    }

    invalidate(): void {
        this._itemsOrder = null;
        return this.source.invalidate();
    }

    reset(): void {
        this._itemsOrder = null;
        this._compositeItems = [];
        return this.source.reset();
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._itemsOrder = null;
        const removedItems = this.source.splice(
            start,
            deleteCount,
            added
        );

        this._removeCompositeItems(removedItems);
        this._actualizeCompositeItems(added);

        return removedItems;
    }

    private _actualizeCompositeItems(addedItems: S[]): void {
        const map = [];
        const parentProperty = this._options.display.getParentProperty();

        addedItems.forEach((addedItem) => {
            const parent = addedItem.get(parentProperty);
            const compositeItem = this._compositeItems.find((item) => item.getParent().key === parent);
            if (compositeItem) {
                const index = map.findIndex((item) => item.compositeItem === compositeItem);
                if (index !== -1) {
                    map[index].items.push(addedItem);
                } else {
                    map.push({
                        compositeItem,
                        items: [addedItem]
                    });
                }
            }
        });
        map.forEach((item) => {
            item.compositeItem.getList().append(item.items);
        });
    }

    private _removeCompositeItems(removedItems: T[]): void {
        removedItems.forEach((removedItem) => {
            const index = this._compositeItems.findIndex((item: T) => item.getParent() === removedItem);
            if (index !== -1) {
                this._compositeItems.splice(index, 1);
            }
        });
    }

    /**
     * Возвращает элементы оригинальной стратегии + составные элементы
     * @protected
     */
    protected _getItems(): T[] {
        return (this._compositeItems as any[] as T[]).concat(this.source.items);
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
     * Создает соответствие индексов в стратегии оригинальным оригинальный индексам
     * @protected
     */
    protected _createItemsOrder(): number[] {
        return CompositeItems.sortItems<S, T>(this.source.items, {
            display: this.options.display,
            compositeItems: this._compositeItems
        });
    }

    /**
     * Создает индекс сортировки в порядке группировки
     * @param items Элементы проекции.
     * @param options Опции
     */
    static sortItems<S extends Model = Model, T extends CollectionItem<S> = CollectionItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): number[] {
        const compositeItemsContents = options.compositeItems.map((it) => it.getContents());

        // считаем новый список составных элементов
        const nodesWithCompositeItem = CompositeItems._countNodesWithCompositeItem(items, options.display);
        const newNodeCompositeItemContents =
            nodesWithCompositeItem.map((it) => CompositeItems._getCompositeItemContent(it));

        // удаляем из текущего списка уже не нужные элементы
        compositeItemsContents.forEach((compositeItemContent) => {
            if (newNodeCompositeItemContents.indexOf(compositeItemContent) === -1) {
                const index = options.compositeItems.findIndex((it) => it.contents === compositeItemContent);
                options.compositeItems.splice(index, 1);
            }
        });

        // добавляем в текущий список новые элементы
        newNodeCompositeItemContents.forEach((compositeItemContent, index) => {
            if (compositeItemsContents.indexOf(compositeItemContent) === -1) {
                const item = nodesWithCompositeItem[index];
                const list = new ObservableList({
                    items: options.display.getChildrenByRecordSet(item.key)
                });
                const compositeItem = options.display.createItem({
                    itemModule: MODULE_NAME,
                    contents: compositeItemContent,
                    parent: item,
                    compositeViewConfig: options.display.getCompositeViewConfig(),
                    list
                });
                options.compositeItems.splice(index, 0, compositeItem);
            }
        });

        // обновляем ссылки, т.к. элементы могут пересоздаться
        CompositeItems._updateNodesInCompositeItems(items, options.compositeItems);

        const countCompositeItems = options.compositeItems.length;
        const itemsOrder = items.map((it, index) => index + countCompositeItems);
        options.compositeItems.forEach((compositeItem, index) => {
            const node = compositeItem.getParent();
            const sourceNodeIndex = items.indexOf(node);
            const compositeItemIndex = options.compositeItems.indexOf(compositeItem);

            // вставляем compositeItem в начало узла
            itemsOrder.splice(sourceNodeIndex + 1 + index, 0, compositeItemIndex);
        });

        return itemsOrder;
    }

    private static _getCompositeItemContent(item: CollectionItem): string {
        return 'composite-item-' + item.key;
    }

    private static _countNodesWithCompositeItem(items: CollectionItem[], display: Collection<Model>): CollectionItem[] {
        const nodesWithCompositeItem = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const item = items[itemIndex];

            if (item.isNode()) {
                const children = display.getChildrenByRecordSet(item.key);
                if (children.find((child) => child.get(display.getNodeProperty()) === null)) {
                    nodesWithCompositeItem.push(item);
                }
            }
        }

        return nodesWithCompositeItem;
    }

    private static _updateNodesInCompositeItems(items: CollectionItem[], compositeItems: CollectionItem[]): void {
        compositeItems.forEach((compositeItem) => {
            const nodeKey = compositeItem.getParent().getContents().getKey();
            const newNode = items.find((it) => it.key === nodeKey);
            if (newNode) {
                compositeItem.setParent(newNode);
            }
        });
    }
}

Object.assign(CompositeItems.prototype, {
    '[Controls/_display/IItemsStrategy]': true,
    '[Controls/expandedCompositeTree:strategy.CompositeItems]': true,
    _moduleName: 'Controls/expandedCompositeTree:strategy.CompositeItems',
    _groups: null,
    _itemsOrder: null
});
