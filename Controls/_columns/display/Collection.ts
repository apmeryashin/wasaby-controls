import {
    Tree,
    ITreeOptions,
    ItemsFactory,
    IDragPosition,
    IViewIterator,
    GroupItem
} from 'Controls/display';
import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import ColumnsDragStrategy from './itemsStrategy/ColumnsDrag';
import {Model} from 'Types/entity';
import IColumnsStrategy from '../interface/IColumnsStrategy';
import Auto from './columnsStrategy/Auto';
import Fixed from './columnsStrategy/Fixed';
import {DEFAULT_COLUMNS_COUNT, SPACING} from '../Constants';
import {EnumeratorCallback} from 'Types/collection';
import {StrategyConstructor} from 'Controls/_display/Collection';

export type ColumnsMode = 'auto' | 'fixed';

interface IRemovedItemInfo<TItem> {
    item: TItem;
    // Индекс колонки из которой был удален итем
    column: number;
    // Индекс удаленного итема относительно набора колонки
    columnIndex: number;
}

interface IGroupColumnsSnapshot {
    // Для каждой колонки хранит индексы записей коллекции, принадлежащие этой колонке
    columns: number[][];
    // Индексы записей коллекции, которые входят в группу. Первый индекс это индекс записи самой группы
    range: [number, number];
}

interface IColumnsOptions<
    S extends Model = Model,
    T extends CollectionItem = CollectionItem
> extends ITreeOptions<S, T> {
    initialWidth?: number;
    columnMinWidth?: number;
    columnsCount?: number;
    /**
     * Если выставлено в true, то при добавлении/удалении итемов
     * коллекции мы полностью пересчитываем распределение итемов по колонкам
     */
    autoColumnsRecalculating?: boolean;
}

/**
 * Коллекция, которая распределяет элементы на несколько столбцов
 */
export default class ColumnsCollection<
    S extends Model = Model,
    T extends CollectionItem<S> = CollectionItem<S>
> extends Tree<S, T> {
    readonly SupportExpand: boolean = false;

    protected _columnsStrategy: IColumnsStrategy;
    protected _dragStrategy: StrategyConstructor<ColumnsDragStrategy<S, T>> = ColumnsDragStrategy;

    protected _$columnProperty: string;
    protected _$columnsCount: number;
    protected _$columnsMode: ColumnsMode;
    protected _$columnMinWidth: number;
    protected _currentWidth: number;
    protected _columnsCount: number;
    protected _dragColumn: number = null;
    protected _$spacing: number = SPACING;
    // true если при изменении коллекции нужно пересчитать расположение итемов по колонкам
    protected _$autoColumnsRecalculating: boolean;

    // Итератор, перебирающий только записи групп
    private readonly _groupsIterator: IViewIterator;

    // Снимок состояния колонок для списка без группировки
    private _columnsSnapshot: IGroupColumnsSnapshot;
    // Снимки состояние колонок для каждой группы
    private _groupsColumnsSnapshot: {[key: string]: IGroupColumnsSnapshot};

    constructor(options: IColumnsOptions<S, T>) {
        super(options);

        this._columnsStrategy = this._$columnsMode === 'fixed' ? new Fixed() : new Auto();

        if (this._$columnsMode === 'auto' && options.initialWidth) {
            this.setCurrentWidth(options.initialWidth, options.columnMinWidth);
        } else {
            this.setColumnsCount(this._$columnsCount || DEFAULT_COLUMNS_COUNT);
        }

        this.updateColumnsSnapshots();

        this._groupsIterator = {
            each: this.eachGroups.bind(this),
            setIndices: () => false,
            isItemAtIndexHidden: () => false
        };
    }

    //region Iterators
    /**
     * Возвращает итератор, перебирающий все итемы коллекции.
     * В случае если передана запись группы, то будет возвращен итератор,
     * перебирающий только записи указанной группы.
     */
    getViewIterator(groupItem?: GroupItem<unknown>): IViewIterator {
        // Если запись группы не передана, то возвращаем дефолтный итератор
        if (!groupItem) {
            return super.getViewIterator();
        }

        return {
            each: (callback: EnumeratorCallback<T>, context?: object): void => {
                this._eachGroupItems(groupItem, callback, context);
            },
            setIndices: () => false,
            isItemAtIndexHidden: () => false
        };
    }

    /**
     * Перебирает записи указанной группы
     */
    private _eachGroupItems(group: GroupItem<unknown>, callback: EnumeratorCallback<T>, context?: object): void {
        const groupFunction = this.getGroup();

        this.each((item, index: number) => {
            if (!item['[Controls/_columns/display/CollectionItem]']) {
                return;
            }

            const itemGroup = groupFunction(item.getContents(), index, item);
            if (group.getContents() !== itemGroup) {
                return;
            }

            callback.call(context, item, index);
        });
    }

    /**
     * Возвращает итератор, перебирающий только записи групп
     */
    getGroupsIterator(): IViewIterator {
        return this._groupsIterator;
    }

    /**
     * Вызывает переданный callback только для записей групп
     */
    eachGroups(callback: EnumeratorCallback<GroupItem<unknown>>, context?: object): void {
        let index = 0;
        this.each((item) => {
            if (!item['[Controls/_display/GroupItem]']) {
                return;
            }

            callback.call(context, item, index);
            index += 1;
        });
    }
    //endregion

    //region Process collection change
    protected _notifyCollectionChange(
        action: string,
        newItems: T[],
        newItemsIndex: number,
        oldItems: T[],
        oldItemsIndex: number
    ): void {
        super._notifyCollectionChange.apply(this, arguments);

        if (action === 'a') {
            // Если все колонки пересчитывать не требуется,
            // то добавляем новые итемы по месту в соответствии с их индексами.
            if (!this._$autoColumnsRecalculating) {
                newItems.forEach((item, index) => {
                    if (item['[Controls/_display/GroupItem]']) {
                        return;
                    }

                    const snapshot = this.getColumnsSnapshotByItem(item);

                    // Высчитываем индекс добавленного итема относительно группы
                    // либо относительно всего списка, если группировка не задана.
                    // -1 так как нам тут не нужно учитывать саму запись группы
                    const indexRelativeToGroup = newItemsIndex + index - snapshot.range[0] - (this.getGroup() ? 1 : 0);
                    this.setColumnOnItem(item, indexRelativeToGroup);
                });

                this.updateColumnsSnapshots(0, false);
            } else if (this._dragColumn === null) {
                this.updateColumnsSnapshots(newItemsIndex);
            }
        }

        if (action === 'rm') {
            if (!this._$autoColumnsRecalculating) {
                this.processRemoving(oldItemsIndex, oldItems);
            } else if (this._dragColumn === null) {
                this.updateColumnsSnapshots();
            }
        }

        if (action === 'rs') {
            this.updateColumnsSnapshots();
        }
    }

    /**
     * * Обновляет информацию о том какие записи в какой колонке лежат
     * * И если нужно переносит данные между колонками
     */
    private processRemoving(removedItemsIndex: number, removedItems: Array<CollectionItem<Model>>): void {
        // Индексы удаленных элементов относительно колонок
        const removedItemsIndexes = removedItems
            .filter((item) => !item['[Controls/_display/GroupItem]'])
            .map((item: T, index): IRemovedItemInfo<T> => {
                const column = item.getColumn();
                const snapshot = this.getColumnsSnapshotByItem(item);
                const columnIndex = snapshot.columns[column].findIndex((elem) => elem === (index + removedItemsIndex));

                return {
                    item,
                    column,
                    columnIndex
                };
            });

        this.updateColumnsSnapshots(0, false);
        removedItemsIndexes.forEach(this.processRemovingItem.bind(this));
    }

    /**
     * * При удалении записи остальные не перемешиваются, а остаются в своих столбцах.
     * * При удалении последней записи в столбце ищет следующий столбец где записей больше
     * чем в текущем и переносит последнюю запись из найденного столбца в текущий.
     *
     * @remark
     * На момент вызова <i>_columnsIndexes</i> уже должны быть обновлены и не учитывать удаленную запись.
     */
    private processRemovingItem(removedItemInfo: IRemovedItemInfo<T>): void {
        const snapshot = this.getColumnsSnapshotByItem(removedItemInfo.item, false);
        // Индексы записей коллекции, принадлежащих колонке удаленной записи
        const affectedColumnIndexes = snapshot.columns[removedItemInfo.column];
        // Если удалили не последний итем колонки, то ничего делать не надо
        if (!affectedColumnIndexes || removedItemInfo.columnIndex < affectedColumnIndexes.length) {
            return;
        }

        let nextColumnIndex = removedItemInfo.column + 1;
        let nextColumnIndexes = nextColumnIndex < this._$columnsCount ? snapshot.columns[nextColumnIndex] : null;

        // Ищем следующую колонку в которой записей больше чем в текущей.
        // И переносим её последний итем в текущую колонку вместо удаленного.
        while (nextColumnIndexes) {
            if (nextColumnIndexes.length > affectedColumnIndexes.length) {
                const nextIndex = nextColumnIndexes.pop();
                affectedColumnIndexes.push(nextIndex);

                // При переносе в другой раздел, записи не удаляются из recordSet'a, а только из проекции.
                // Поэтому нужно смотреть на запись из проекции, а не recordSet.
                const nextItem = this.at(nextIndex) as CollectionItem<Model>;
                nextItem.setColumn(removedItemInfo.column);

                break;
            }

            nextColumnIndex++;
            nextColumnIndexes = nextColumnIndex < this._$columnsCount ? snapshot.columns[nextColumnIndex] : null;
        }

        return;
    }
    //endregion

    //region get/set methods
    setCurrentWidth(width: number, columnMinWidth: number): void {
        if (width > 0 &&
            this._currentWidth !== width &&
            this._$columnsMode === 'auto' &&
            this._$columnMinWidth || columnMinWidth
        ) {
            this._recalculateColumnsCountByWidth(width, this._$columnMinWidth || columnMinWidth);
        }
        this._currentWidth = width;
    }

    private _recalculateColumnsCountByWidth(width: number, columnMinWidth: number): void {
        const newColumnsCount = Math.floor(width / (columnMinWidth + this._$spacing));
        if (newColumnsCount !== this._columnsCount) {
            this._columnsCount = newColumnsCount || 1;
            this.setColumnsCount(this._columnsCount);
        }
    }

    getCurrentWidth(): number {
        return this._currentWidth;
    }

    setColumnsCount(columnsCount: number): void {
        if (this._$columnsCount !== columnsCount) {
            this._$columnsCount = columnsCount;
            this.updateColumnsSnapshots();
            this._nextVersion();
        }
    }

    getColumnsCount(): number {
        return this._$columnsCount;
    }

    setColumnsMode(columnsMode: ColumnsMode): void {
        if (this._$columnsMode !== columnsMode) {
            this._columnsStrategy = columnsMode === 'fixed' ? new Fixed() : new Auto();
            this._$columnsMode = columnsMode;
            this.updateColumnsSnapshots();
            this._nextVersion();
        }
    }

    getColumnsMode(): string {
        return this._$columnsMode;
    }

    setSpacing(spacing: number): void {
        if (this._$spacing !== spacing) {
            this._$spacing = spacing;
            this.updateColumnsSnapshots();
            this._nextVersion();
        }
    }

    getSpacing(): number {
        return this._$spacing;
    }
    //endregion

    /**
     * Вычисляет индекс колонки к которой принадлежит итем и проставляет его в
     * сам итем.
     *
     * @param {T} item - итем коллекции
     * @param {Number} index - индекс итема коллекции относительно группы,
     * либо относительно коллекции, если группировка не задана
     *
     * @return Вычисленный индекс колонки
     */
    private setColumnOnItem(item: T, index: number): number {
        if (item.isDragged() || item['[Controls/_display/GroupItem]']) {
            return;
        }

        const i = this._dragColumn === null ? index : this._dragColumn;
        const column = this._columnsStrategy.calcColumn(this, i, this.getColumnsCount());

        item.setColumn(column);
        return column;
    }

    /**
     * Пересчитывает и обновляет снимки состояния колонок.
     * @param {number} [offset=-1] - пропустить записи до записи с индексом offset. (-1 - обновить все записи)
     * @param {boolean} [recalculateColumn = true] - нужно ли пересчитывать колонки для итемов списка
     */
    private updateColumnsSnapshots(offset: number = -1, recalculateColumn: boolean = true): void {
        this._groupsColumnsSnapshot = {};
        this._columnsSnapshot = {
            columns: [],
            range: [0, this.getCollection().getCount() - 1]
        };

        // Ссылка на последний созданный снимок колонок группы.
        // Используется для заполнения конца диапазона группы.
        let lastGroupSnapshot;
        // Индекс итема относительно группы либо относительно коллекции, если группировка не задана.
        // Используется для вычисления колонки в которой нужно разместить итем.
        let groupItemIndex = -1;
        const groupFunction = this.getGroup();

        this.each((item: T, collectionItemIndex: number) => {
            const collectionItemContent = item.getContents();

            // Если итем это группа, то просто добавляем для неё новый снимок в котором будем
            // хранить какой итем коллекции в какой колонке группы лежит
            if (item['[Controls/_display/GroupItem]']) {
                // При обходе групп нужно сбрасывать индекс, т.к. у каждой группы свои колонки
                // и для вычисления колонки нужен индекс записи относительно группы
                groupItemIndex = -1;
                const groupSnapshot = {
                    columns: [],
                    range: [collectionItemIndex, collectionItemIndex]
                } as IGroupColumnsSnapshot;

                this._groupsColumnsSnapshot[collectionItemContent as string] = groupSnapshot;

                // При переходе на новую группу нужно обновить
                // конец диапазона у последней созданной группы
                if (!lastGroupSnapshot) {
                    lastGroupSnapshot = groupSnapshot;
                } else {
                    lastGroupSnapshot.range[1] = collectionItemIndex - 1;
                    lastGroupSnapshot = groupSnapshot;
                }

                return;
            }

            // Если итем это данные, то на основании того есть или нет группировка
            // получаем целевой снэпшот в который будем записывать текущее положение
            // итемов в колонках или колонках групп
            let snapshot = this._columnsSnapshot;
            if (groupFunction) {
                const groupId = groupFunction(collectionItemContent, collectionItemIndex, item);
                snapshot = this._groupsColumnsSnapshot[groupId];
            }

            groupItemIndex += 1;
            const column = recalculateColumn ? this.setColumnOnItem(item, groupItemIndex) : item.getColumn();

            snapshot.columns[column] = snapshot.columns[column] || [];
            snapshot.columns[column].push(collectionItemIndex);
        });

        // При завершении обхода последней группы нужно добить её диапазон
        if (lastGroupSnapshot) {
            lastGroupSnapshot.range[1] = this.getCollection().getCount() - 1;
        }
    }

    /**
     * Возвращает текущий снимок колонок для переданного итема.
     * Если задана группировка, то снимок вернется для колонок групп,
     * если группировки нет, то в целом для всего списка.
     */
    private getColumnsSnapshotByItem(item: T, createIfAbsent: boolean = true): IGroupColumnsSnapshot {
        const groupFunction = this.getGroup();

        // Если задана группировка, то брем снэпшот группы
        if (groupFunction) {
            const itemIndex = this.getIndex(item);
            const groupId = groupFunction(item.getContents(), itemIndex, item);

            // Если для группы итема еще нет снэпшота, то создадим.
            // Т.к. могут добавить итем с новой группой.
            if (!this._groupsColumnsSnapshot[groupId] && createIfAbsent) {
                this._groupsColumnsSnapshot[groupId] = {
                    columns: [],
                    range: [itemIndex, itemIndex]
                };
            }

            return this._groupsColumnsSnapshot[groupId];
        }

        return this._columnsSnapshot;
    }

    /**
     * Возвращает св-во элемента данных, содержащее индекс колонки,
     * в которую распределен элемент при columnsMode === 'fixed'.
     */
    getColumnProperty(): string {
        return this._$columnProperty;
    }

    /**
     * Возвращает индекс записи относительно колонки к которой она расположена
     * @param itemCollectionIndex - индекс записи в коллекции
     */
    getIndexInColumnByIndex(itemCollectionIndex: number): number {
        const item = this.at(itemCollectionIndex);
        const column = item.getColumn();
        const snapshot = this.getColumnsSnapshotByItem(item);

        return snapshot.columns[column].indexOf(itemCollectionIndex);
    }

    //#region getItemToDirection, using as model[`getItemTo${direction}`]

    getItemToLeft(item: T): T {
        const curIndex = this.getIndex(item);
        let newIndex: number = curIndex;

        const curColumn = item.getColumn();
        const snapshot = this.getColumnsSnapshotByItem(item);
        const curColumnIndex = snapshot.columns[curColumn].indexOf(curIndex);

        if (curColumn > 0) {
            const prevColumn = snapshot.columns.slice().reverse().find(
                (col: number[], index: number) => index > this._$columnsCount - curColumn - 1 && col.length > 0
            );
            if (prevColumn instanceof Array) {
                newIndex = prevColumn[Math.min(prevColumn.length - 1, curColumnIndex)];
            }
        }

        return this.at(newIndex);
    }

    getItemToRight(item: T): T {
        const curIndex = this.getIndex(item);
        let newIndex: number = curIndex;

        const curColumn = item.getColumn();
        const snapshot = this.getColumnsSnapshotByItem(item);
        const curColumnIndex = snapshot.columns[curColumn].indexOf(curIndex);

        if (curColumn < this._$columnsCount - 1) {
            const nextColumn = snapshot.columns.find(
                (col: number[], index: number) => index > curColumn && col.length > 0
            );

            if (nextColumn instanceof Array) {
                newIndex = nextColumn[Math.min(nextColumn.length - 1, curColumnIndex)];
            }
        }

        return this.at(newIndex);
    }

    getItemToUp(item: T): T {
        const curIndex = this.getIndex(item);
        let newIndex: number;

        const curColumn = item.getColumn();
        const snapshot = this.getColumnsSnapshotByItem(item);
        const curColumnIndex = snapshot.columns[curColumn].indexOf(curIndex);

        if (curColumnIndex > 0) {
            newIndex = snapshot.columns[curColumn][curColumnIndex - 1];
        } else {
            newIndex = curIndex;

            // Если задана группировка и текущая группа итема не является первой,
            // то следующим сверху будет последний итем предыдущей группы
            if (this.getGroup() && snapshot.range[0] > 0) {
                newIndex = snapshot.range[0] - 1;
            }
        }

        return this.at(newIndex);
    }

    getItemToDown(item: T): T {
        const curIndex = this.getIndex(item);
        let newIndex: number;

        const curColumn = item.getColumn();
        const snapshot = this.getColumnsSnapshotByItem(item);
        const curColumnIndex = snapshot.columns[curColumn].indexOf(curIndex);

        if (curColumnIndex < snapshot.columns[curColumn].length - 1) {
            newIndex = snapshot.columns[curColumn][curColumnIndex + 1];
        } else {
            newIndex = curIndex;

            // Если задана группировка и текущая группа итема не является последней,
            // то следующим снизу будет первый итем следующей группы
            if (this.getGroup() && snapshot.range[1] < this.getCount()) {
                // snapshot.range[1] это индекс последней записи текущей группы
                // +1 - это запись следующей группы
                // +1 - это первая запись следующей группы
                newIndex = snapshot.range[1] + 2;
            }
        }

        return this.at(newIndex);
    }

    //#endregion

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: ICollectionItemOptions<S>): T {
            options.columnProperty = this._$columnProperty;
            options.owner = this;
            return superFactory.call(this, options);
        };
    }

    setDragPosition(position: IDragPosition<T>): void {
        if (position) {
            const strategy = this.getStrategyInstance(this._dragStrategy) as unknown as ColumnsDragStrategy<S>;

            const newColumn = position.dispItem.getColumn();
            const curColumn = strategy.avatarItem.getColumn();

            if (position.position !== 'on' && curColumn !== newColumn) {
                // применяем новый столбец к перетаскиваемому элементу
                strategy.avatarItem.setColumn(newColumn);

                // корректируем position.position, если сменился столбец, то позиция будет только before
                position.position = 'before';
            }
        }
        super.setDragPosition(position);
    }

    resetDraggedItems(): void {
        const strategy = this.getStrategyInstance(this._dragStrategy) as unknown as ColumnsDragStrategy<S>;
        const avatarItem = strategy.avatarItem;
        this._dragColumn = avatarItem.getColumn();
        super.resetDraggedItems();
        this._dragColumn = null;
    }
}

Object.assign(ColumnsCollection.prototype, {
    '[Controls/_columns/display/Collection]': true,
    SupportNodeFooters: false,
    _moduleName: 'Controls/columns:ColumnsCollection',
    _itemModule: 'Controls/columns:ColumnsCollectionItem',
    _$columnsCount: 2,
    _$spacing: 12,
    _$columnsMode: 'auto',
    _$autoColumnsRecalculating: false
});
