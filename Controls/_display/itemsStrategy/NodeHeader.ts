import IItemsStrategy from 'Controls/_display/IItemsStrategy';
import TreeItem from '../TreeItem';
import Tree from '../Tree';
import {Model} from 'Types/entity';

interface IOptions<S, T extends TreeItem<S>> {
    source: IItemsStrategy<S, T>;
    display: Tree<S, T>;
    nodeHeaderModule?: string;
}

interface ISortOptions<S, T extends TreeItem<S>> {
    display: Tree<S, T>;
    nodeHeaderModule?: string;
    nodeHeaders: T[];
}

export default class NodeHeader<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>>
    implements IItemsStrategy<S, T> {
    readonly '[Controls/_display/IItemsStrategy]': boolean;

    protected _count: number;
    protected _items: T[];
    protected _options: IOptions<S, T>;
    protected _source: IItemsStrategy<S, T>;

    /**
     * Группы
     */
    protected _nodeHeaders: T[] = [];

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
        let sourceIndex = overallIndex - this._nodeHeaders.length;

        sourceIndex = sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;

        return sourceIndex;
    }

    getDisplayIndex(index: number): number {
        const itemsOrder = this._getItemsOrder();
        const sourceIndex = this.source.getDisplayIndex(index);
        const overallIndex = sourceIndex + this._nodeHeaders.length;
        const itemIndex = itemsOrder.indexOf(overallIndex);

        return itemIndex === -1 ? itemsOrder.length : itemIndex;
    }

    invalidate(): void {
        this._itemsOrder = null;
        return this.source.invalidate();
    }

    reset(): void {
        this._itemsOrder = null;
        this._nodeHeaders = [];
        return this.source.reset();
    }

    splice(start: number, deleteCount: number, added?: S[]): T[] {
        this._itemsOrder = null;
        const removedItems = this.source.splice(
            start,
            deleteCount,
            added
        );

        this._removeNodeHeaders(removedItems);

        return removedItems;
    }

    private _removeNodeHeaders(removedItems: T[]): void {
        removedItems.forEach((item) => {
            const index = this._nodeHeaders.findIndex((header: T) => header.getNode() === item);
            if (index !== -1) {
                this._nodeHeaders.splice(index, 1);
                item.setNodeHeader(null);
            }
        });
    }

    /**
     * Возвращает подвалы узлов + элементы оригинальной стратегии
     * @protected
     */
    protected _getItems(): T[] {
        return (this._nodeHeaders as any[] as T[]).concat(this.source.items);
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
        return NodeHeader.sortItems<S, T>(this.source.items, {
            display: this.options.display,
            nodeHeaderModule: this.options.nodeHeaderModule,
            nodeHeaders: this._nodeHeaders
        });
    }

    /**
     * Создает индекс сортировки в порядке группировки
     * @param items Элементы проекции.
     * @param options Опции
     */
    static sortItems<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>>(
        items: T[],
        options: ISortOptions<S, T>
    ): number[] {
        const nodeHeaderContents = options.nodeHeaders.map((it) => it.getContents());

        // считаем новый список хедеров
        const nodesWithHeaders = NodeHeader._countNodesWithHeader(items);
        const newNodeHeaderContents = nodesWithHeaders.map((it) => NodeHeader._getNodeHeaderContent(it));

        // удаляем из текущего списка футеров уже не нужные хедеры
        nodeHeaderContents.forEach((nodeHeaderContent) => {
            if (newNodeHeaderContents.indexOf(nodeHeaderContent) === -1) {
                const index = options.nodeHeaders.findIndex((it) => it.contents === nodeHeaderContent);
                const removedNodeHeader = options.nodeHeaders.splice(index, 1)[0];
                const node = removedNodeHeader.getNode();
                node.setNodeHeader(null);
            }
        });

        // добавляем в текущий список футеров новые хедеры
        newNodeHeaderContents.forEach((nodeHeaderContent, index) => {
            if (nodeHeaderContents.indexOf(nodeHeaderContent) === -1) {
                const item = nodesWithHeaders[index];
                const nodeHeader = options.display.createItem({
                    itemModule: options.nodeHeaderModule,
                    contents: nodeHeaderContent,
                    parent: item,
                    hasMore: item.getHasMoreStorage(),
                    moreFontColorStyle: options.display.getMoreFontColorStyle(),
                    moreCaption: options.display.getNodeMoreCaption()
                });
                options.nodeHeaders.splice(index, 0, nodeHeader);
                item.setNodeHeader(nodeHeader);
            }
        });

        // обновляем ссылки в хедерах и в узлах, т.к. элементы могут пересоздаться.
        NodeHeader._updateNodesInNodeHeaders(items, options.nodeHeaders);

        const getItemsCount = (node) => {
            const oneOfParentsIsEqualNode = (item) => {
                if (!item || !item.getParent) {
                    return false;
                }

                if (item.getParent() === node) {
                    return true;
                } else {
                    return oneOfParentsIsEqualNode(item.getParent());
                }
            };

            let count = 0;
            items.forEach((item) => {
                // TODO: Убрать в константу или определить getLevel для группы дерева
                //  https://online.sbis.ru/opendoc.html?guid=ca34d365-26db-453d-b05a-eb6c708c59ee
                if (
                    (item['[Controls/_display/GroupItem]'] ? 1 : item.getLevel()) > node.getLevel() &&
                    oneOfParentsIsEqualNode(item)
                ) {
                    count++;
                }
            });
            return count;
        };

        const countNodeHeaders = options.nodeHeaders.length;
        const itemsOrder = items.map((it, index) => index + countNodeHeaders);
        options.nodeHeaders.forEach((header) => {
            const node = header.getNode();
            const sourceNodeIndex = items.indexOf(node);
            const headerIndex = options.nodeHeaders.indexOf(header);

            // вставляем индекс хедера в начало узла
            itemsOrder.splice(sourceNodeIndex + 1, 0, headerIndex);
        });

        return itemsOrder;
    }

    private static _getNodeHeaderContent(item: TreeItem): string {
        return 'node-header-' + item.getContents().getKey();
    }

    private static _countNodesWithHeader(items: TreeItem[]): TreeItem[] {
        const nodesWithHeader = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const item = items[itemIndex];

            // Проверяем, что запись это узел и он развернут
            if (
                !item['[Controls/_display/TreeItem]'] || item['[Controls/treeGrid:TreeGridNodeHeaderRow]']
                || item.isNode() === null || !item.isExpanded()
            ) {
                continue;
            }

            // Проверяем что в узле есть еще записи
            if (item.hasMoreStorage('backward')) {
                nodesWithHeader.push(item);
            }
        }

        return nodesWithHeader;
    }

    private static _updateNodesInNodeHeaders(items: TreeItem[], nodeHeaders: TreeItem[]): void {
        nodeHeaders.forEach((header) => {
            const nodeKey = header.getNode().getContents().getKey();
            const newNode = items.find((it) => it.key === nodeKey);
            if (newNode) {
                header.setParent(newNode);
                newNode.setNodeHeader(header);
            }
        });
    }
}

Object.assign(NodeHeader.prototype, {
    '[Controls/_display/IItemsStrategy]': true,
    '[Controls/_display/itemsStrategy/NodeHeader]': true,
    _moduleName: 'Controls/display:itemsStrategy.NodeHeader',
    _groups: null,
    _itemsOrder: null
});
