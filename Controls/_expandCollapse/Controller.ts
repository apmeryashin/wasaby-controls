import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';
import {isEqual} from 'Types/object';
import {TKey} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {Tree, TreeItem} from 'Controls/display';
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

/**
 * Интерфейс, описывающий структуру объекта конфигурации {@link Controller ExpandController}
 */
export interface IOptions {
    /**
     * Модель с которой будет управлять контроллер
     */
    model?: Tree<Model, TreeItem<Model>>;
    /**
     * Ф-ия загрузчик, которая будет вызвана перед разворачиванием итема.
     * В случае удачной загрузки должна вернуть RecordSet с полученными данными.
     * В случе неудачной загрузки либо рейзнуть ошибку либо вернуть void.
     */
    loader?: (id: TKey) => void | Promise<RecordSet | void>;
    /**
     * Массив с идентификаторами развернутых узлов
     */
    expandedItems?: TKey[];
    /**
     * Массив с идентификаторами свернутых узлов
     */
    collapsedItems?: TKey[];
    /**
     * true если на одном уровне может быть раскрыт только один узел
     */
    singleExpand?: boolean;
}

export interface IResult {
    expandedItems?: TKey[];
    collapsedItems?: TKey[];
}

export const ALL_EXPANDED_VALUE = null;

/**
 * Класс контроллера, который реализует логику сворачивания/разворачивания итемов
 */
export class Controller {
    //region fields
    private _options: IOptions;

    private _expandedItems: TKey[];

    private _collapsedItems: TKey[];

    private _model: Tree<Model, TreeItem<Model>>;

    /**
     * Флаг, идентифицирующий нужно или нет вызывать ф-ию загрузчик
     * при развороте узлов.
     */
    private _loaderIsEnabled: boolean = true;
    //endregion

    constructor(options: IOptions) {
        this._options = options;
        this._model = options.model;
        this._expandedItems = options.expandedItems ? [...options.expandedItems] : [];
        this._collapsedItems = options.collapsedItems ? [...options.collapsedItems] : [];
    }

    /**
     * Обновляет опции контроллера записывая новые опции поверх существующих.
     * Соответственно если какую-либо опцию обновлять не надо, то не нужно её
     * указывать в newOptions.
     */
    updateOptions(newOptions: IOptions): void {
        const modelRecreated = this._model !== newOptions.model;
        this._options = {...this._options, ...newOptions};
        this._model = newOptions.model;

        if (newOptions.collapsedItems && !isEqual(this._collapsedItems, newOptions.collapsedItems)) {
            this.setCollapsedItems(newOptions.collapsedItems);
            this._model?.setCollapsedItems(newOptions.collapsedItems);
        }

        if (modelRecreated) {
            this.applyStateToModel();
        }

        // Обновление здесь expandedItems не реализовано т.к. пока не требуется из-за того что в treeControl
        // обновление expandedItems хитрое под кучей if'ов
        if (newOptions.expandedItems) {
            throw new Error('expandCollapse:Controller#updateOptions update expandedItems not implemented yet');
        }
    }

    /**
     * Вернет true если expandedItems === [ALL_EXPANDED_VALUE]. Но это не значит что по факту
     * все записи развернуты, т.к. могут быть принудительно свернутые записи в
     * collapsedItems.
     */
    isAllExpanded(): boolean {
        return this._expandedItems[0] === ALL_EXPANDED_VALUE;
    }

    /**
     * Вернет true если итем с указанной id в текущий момент развернут.
     * Итем считается развернутым если он есть в expanded или (expanded === [ALL_EXPANDED_VALUE]
     * и итема нет в collapsed)
     */
    isItemExpanded(itemId: TKey): boolean {
        return this._expandedItems.includes(itemId) || (this.isAllExpanded() && !this._collapsedItems.includes(itemId));
    }

    /**
     * Вернет true если итем с указанной id в текущий момент свернут
     */
    isItemCollapsed(itemId: TKey): boolean {
        return !this.isItemExpanded(itemId);
    }

    /**
     * Меняет признак свернутости/развернутости итема на противоположный.
     * В случае раскрытия итема если его данные еще не были загружены вернет
     * Promise с загруженными данными узла.
     */
    toggleItem(itemId: TKey): void | Promise<RecordSet[]> {
        if (this.isItemExpanded(itemId)) {
            this.collapseItem(itemId);
        } else {
            return this.expandItem(itemId);
        }
    }

    /**
     * Разворачивает итем с указанным itemId только в том случае если
     * он свернут в данный момент.
     */
    expandItem(itemId: TKey): void | Promise<RecordSet[]> {
        // Если узел уже развернут или он не поддерживает разворачивание, то и делать ничего не надо
        if (this.isItemExpanded(itemId)) {
            return;
        }

        const newExpandedItems = [...this._expandedItems];
        const newCollapsedItems = [...this._collapsedItems];

        removeKey(newCollapsedItems, itemId);
        // Пушим в expandedItems только в том случае, если там не лежит ALL_EXPANDED_VALUE,
        // т.к. в этом случае и так все записи считаются развернутыми
        if (!this.isAllExpanded()) {
            pushKey(newExpandedItems, itemId);
        }

        return this._applyState(newExpandedItems, newCollapsedItems);
    }

    /**
     * Сворачивает итем с указанным itemId толь в том случае если он развернут в данный момент
     */
    collapseItem(itemId: TKey): void {
        // Если узел уже свернут или он не поддерживает разворачивание, то и делать ничего не надо
        if (this.isItemCollapsed(itemId)) {
            return;
        }

        const newExpandedItems = [...this._expandedItems];
        const newCollapsedItems = [...this._collapsedItems];

        // Если сказано что все узлы развернуты, то свернуть один
        // конкретный узел можно только через добавление его в collapsedItems.
        // В противном случае достаточно просто удалить его из expandedItems.
        if (this.isAllExpanded()) {
            pushKey(newCollapsedItems, itemId);
        } else {
            removeKey(newExpandedItems, itemId);
        }

        this._applyState(newExpandedItems, newCollapsedItems);
    }

    /**
     * Сбрасывает expandedItems и collapsedItems в пустой массив
     */
    resetExpandedItems(): void {
        this._applyState([], []);
    }

    /**
     * Возвращает массив id развернутых узлов
     */
    getExpandedItems(): TKey[] {
        return [...this._expandedItems];
    }

    setExpandedItems(expandedItems: TKey[] = []): void | Promise<unknown> {
        return this._applyState(expandedItems, this._collapsedItems);
    }

    /**
     * Возвращает массив id свернутых узлов
     */
    getCollapsedItems(): TKey[] {
        return [...this._collapsedItems];
    }

    setCollapsedItems(collapsedItems: TKey[]): void {
        this._applyState(this._expandedItems, collapsedItems);
    }

    /**
     * Отключает указанную ф-ию загрузчик при развороте узлов
     */
    disableLoader(): void {
        this._loaderIsEnabled = false;
    }

    /**
     * Включает указанную ф-ию загрузчик при развороте узлов
     */
    enableLoader(): void {
        this._loaderIsEnabled = true;
    }

    /**
     * Применяет текущее состояние схлопнутых и разхлопнутых узлов к моделе
     */
    applyStateToModel(): void {
        this._model?.setCollapsedItems(this._collapsedItems);
        this._model?.setExpandedItems(this._expandedItems);
    }

    onCollectionRemove(removedItems: TreeItem[]): IResult {
        const result: IResult = {};

        if (this._model && (this._options.expandedItems?.length || this._options.collapsedItems?.length)) {
            // обрабатываем только узлы
            const items = removedItems.filter(
                (it) => it['[Controls/_display/TreeItem]'] && it.Expandable && it.isNode() !== null
            );
            let removedKeys = items.map((it) => it.getContents().getKey());
            // отфильтровываем скрытые записи
            removedKeys =
                removedKeys.filter((it) => !this._model.getCollection().getRecordById(it) && it !== ALL_EXPANDED_VALUE);

            if (this._options.expandedItems?.length) {
                const newExpandedItems = this._options.expandedItems.slice();
                removedKeys.forEach((it) => {
                    const expandedItemsIndex = newExpandedItems.indexOf(it);
                    if (expandedItemsIndex !== -1) {
                        newExpandedItems.splice(expandedItemsIndex, 1);
                    }
                });

                if (!isEqual(newExpandedItems, this._options.expandedItems)) {
                    this.setExpandedItems(newExpandedItems);
                    result.expandedItems = newExpandedItems;
                }
            }

            if (this._options.collapsedItems?.length) {
                const newCollapsedItems = this._options.collapsedItems.slice();
                removedKeys.forEach((it) => {
                    const collapsedItemsIndex = newCollapsedItems.indexOf(it);
                    if (collapsedItemsIndex !== -1) {
                        newCollapsedItems.splice(collapsedItemsIndex, 1);
                    }
                });

                if (!isEqual(newCollapsedItems, this._options.collapsedItems)) {
                    this.setCollapsedItems(newCollapsedItems);
                    result.collapsedItems = newCollapsedItems;
                }
            }
        }

        return result;
    }

    /**
     * Выполняет анализ и обработку переданных данных:
     * 1. Если опция singleExpand выставлена, то оставит только по одной id в expandedItems
     * для каждого уровня иерархии
     * 2. При схлапывании узла id его дочерних расхлопнутых узлов также выкидываются из expandedItems
     * 3. Если expandedItems и collapsedItems имеют пересечение, то это пересечение выкидывается из
     * expandedItems
     */
    private _applyState(expandedItems: TKey[] = [], collapsedItems: TKey[] = []): void | Promise<RecordSet[]> {

        let newExpandedItems = [...expandedItems];
        const newCollapsedItems = [...collapsedItems];

        //region 1. singleExpand
        // Если сказано что на одном уровне может быть только один развернутый итем,
        // то нужно в newExpanded оставить только по одной id для каждого уровня
        if (this._options.singleExpand && this._model) {
            const levels: {[key: number]: TKey} = {};
            // Составим карту какой узел на каком уровне развернут
            // Для каждого уровня будет запомнен только последний итем
            newExpandedItems.forEach((id) => {
                const level = this._getItem(id).getLevel();
                levels[level] = id;
            });
            // Свернем полученную карту обратно в массив тем самым оставив на каждом уровне
            // только один развернутый итем
            newExpandedItems = Object.keys(levels).map((level) => levels[level]);
        }
        //endregion

        //region 2. Удаляем из newExpandedItems ключи детей свернутых узлов
        const expandDiff = ArraySimpleValuesUtil.getArrayDifference(this._expandedItems, newExpandedItems);
        const collapseDiff = ArraySimpleValuesUtil.getArrayDifference(this._collapsedItems, newCollapsedItems);

        expandDiff.removed.forEach((id) => {
            if (id === ALL_EXPANDED_VALUE) {
                return;
            }

            this._collapseChildren(newExpandedItems, newCollapsedItems, id);
        });
        collapseDiff.added.forEach((id) => this._collapseChildren(newExpandedItems, newCollapsedItems, id));
        //endregion

        //region 3. Если есть пересечение между expanded и collapsed, то считаем что collapsed приоритетнее
        // и выкидываем из expanded итемы, входящие в пересечение
        const intersection = ArraySimpleValuesUtil.getIntersection(expandedItems, collapsedItems);
        if (intersection.length) {
            ArraySimpleValuesUtil.removeSubArray(newExpandedItems, intersection);
            Logger.warn('Массивы с expandedItems и collapsedItems имеют пересечение. Все узлы входящие в пересечение будут схлопнуты.');
        }
        //endregion

        // Сначала обработаем схлопнутые узлы что бы обработка расхлопнутых уже опиралась
        // на актуальные данные и не пыталась раскрыть явно заданный расхлопнутый узел
        this._setCollapsedItems(newCollapsedItems);

        return this._applyExpandedItems(newExpandedItems);
    }

    private _applyExpandedItems(expandedItems: TKey[]): void | Promise<RecordSet[]> {
        const expandDiff = ArraySimpleValuesUtil.getArrayDifference(this._expandedItems, expandedItems);

        // Если изменили с [...] на [ALL_EXPANDED_VALUE], то нужно загрузить все кроме явно схлопнутых
        if (expandDiff.added[0] === ALL_EXPANDED_VALUE) {
            const results = [];

            // Пробежимся по итемам модели и развернем все для
            // которых явно не сказано что они должны быть свернуты
            this._model?.each((item) => {
                // пропускаем не разворачиваемые элементы и листья
                if (!item['[Controls/_display/TreeItem]'] || !item.Expandable || item.isNode() === null) {
                    return;
                }

                const id = item.getContents().getKey();
                // Если запись это лист или явно сказано что запись должна быть свернута,
                // то и не разворачиваем её
                if (this._collapsedItems.includes(id)) {
                    return;
                }

                const result = this._expandItem(id);
                if (result) {
                    results.push(result);
                }
            });

            // Если асинхронных результатов нет, то сразу присваиваем
            if (!results.length) {
                this._setExpandedItems(expandedItems);
                return;
            }

            return Promise
                .all(results)
                // После разворачивания всех узлов нужно обновить _expandedItems
                .then((result) => {
                    this._setExpandedItems(expandedItems);
                    return result;
                });
        }

        //region Если изменили с [...] на [...], то нужно загрузить добавленные ключи
        if (expandDiff.added.length) {
            const results = [];
            expandDiff.added.forEach((id) => {
                const result = this._expandItem(id);

                if (result) {
                    results.push(result);
                }
            });

            // Если асинхронных результатов нет, но проставляем expandedItems сразу
            if (!results.length) {
                this._setExpandedItems(expandedItems);
                return;
            }

            return Promise
                .all(results)
                .then((result) => {
                    this._setExpandedItems(expandedItems);
                    return result;
                });
        }

        // Если изменили с [ALL_EXPANDED_VALUE] на [...], то ничего грузить не надо, просто обновляем данные
        this._setExpandedItems(expandedItems);
        //endregion
    }

    private _setExpandedItems(expandedItems: TKey[]): void {
        this._expandedItems = expandedItems;
    }

    private _setCollapsedItems(collapsedItems: TKey[]): void {
        this._collapsedItems = collapsedItems;
    }

    /**
     * Возвращает итем коллекции
     */
    private _getItem(itemId: TKey): undefined | TreeItem<Model> {
        return this._model?.getItemBySourceKey(itemId, false);
    }

    /**
     * Вызывает загрузку данных для разворачиваемого узла.
     * Дополнительно в случе работы со старой моделью развернет
     * в ней итем с указанным itemId.
     */
    private _expandItem(itemId: TKey): void | Promise<RecordSet | void> {
        // Если в опциях указана ф-ия загрузчик и она включена, то вызовем её
        return this._options.loader && this._loaderIsEnabled ? this._options.loader(itemId) : undefined;
    }

    /**
     * Удаляет из переданного массива id дочерних узлов для указанного parentItemId
     */
    private _collapseChildren(expandedItems: TKey[], collapsedItems: TKey[], parentItemId: TKey): void {
        const item = this._getItem(parentItemId);
        if (!item) {
            return;
        }

        const collapseChildren = (parent) => {
            if (!parent) {
                return;
            }
            const childrenOfCollapsedItem = this._model.getChildren(parent);
            childrenOfCollapsedItem.forEach((it) => {
                if (!it['[Controls/_display/TreeItem]'] || !it.Expandable || it.isNode() === null || !it.isExpanded()) {
                    return;
                }

                const key = it.getContents().getKey();
                if (this.isAllExpanded()) {
                    pushKey(collapsedItems, key);
                } else {
                    removeKey(expandedItems, key);
                }
                collapseChildren(it);
            });
        };

        collapseChildren(item);
    }
}

/**
 * Удаляет переданный элемент из указанного массива если этот элемент
 * там присутствует
 */
function removeKey(array: unknown[], key: unknown): void {
    const idx = array.indexOf(key);

    if (idx >= 0) {
        array.splice(idx, 1);
    }
}

/**
 * Добавляет переданный элемент в указанный массив только в том случае, если его там еще нет
 */
function pushKey(array: unknown[], key: unknown): void {
    const idx = array.indexOf(key);

    if (idx < 0) {
        array.push(key);
    }
}
