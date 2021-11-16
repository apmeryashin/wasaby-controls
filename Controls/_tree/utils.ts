import {Model} from 'Types/entity';
import {Tree} from 'Controls/display';
import {TKey} from 'Controls/_interface/IItems';
import {RecordSet} from 'Types/collection';

/**
 * Относительно переданного nodeKey собирает идентификаторы родительских и дочерних раскрытых узлов.
 */
export function getRootsForHierarchyReload(viewModel: Tree, nodeKey: TKey): TKey[] {
    const items = getItemHierarchy(viewModel, nodeKey);

    // Собираем идентификаторы дочерних раскрытых узлов
    nodeChildrenIterator(viewModel, nodeKey, (elem) => {
        const key = elem.getKey();

        // Не добавляем узел если он свернут, т.к. если данных не было то и незачем их обновлять
        if (viewModel.getExpandedItems().indexOf(key) >= 0) {
            items.push(key);
        }
    });

    return items;
}

/**
 * Собирает иерархию итема коллекции в виде массива из его id и id его родительских узлов.
 * Первым элементом массива будет текущий root коллекции, а последним сам итем.
 */
export function getItemHierarchy(viewModel: Tree, itemKey: TKey): TKey[] {
    // Условие про undefined не понятное, просто оставил как было
    const hierarchy = [itemKey !== undefined ? itemKey : null];
    const item = viewModel.getItemBySourceKey(itemKey);

    if (!item) {
        return hierarchy;
    }

    let parent = item.getParent();
    const root = viewModel.getRoot();

    // Добавляем идентификаторы родительских узлов
    while (parent !== root) {
        hierarchy.unshift(parent.getContents().getKey());
        parent = parent.getParent();
    }

    // Добавляем идентификатор корня
    hierarchy.unshift(root.getContents());

    return hierarchy;
}

/**
 * Рекурсивно итерируется по всем дочерним записям и для каждой записи вызывает либо nodeCallback либо leafCallback.
 * @param viewModel - коллекция по которой итерируемся
 * @param nodeKey - идентификатор узла с дочерних записей которого начинаем перебор
 * @param nodeCallback - ф-ия обратного вызова, которая будет вызвана для все дочерних узлов
 * @param leafCallback - ф-ия обратного вызова, которая будет вызвана для все дочерних листов
 */
export function nodeChildrenIterator(
    viewModel: Tree,
    nodeKey: TKey,
    nodeCallback: (item: Model) => void,
    leafCallback?: (item: Model) => void
): void {
    const item = viewModel.getItemBySourceKey(nodeKey);

    if (!item) {
        return;
    }

    viewModel
        .getChildren(item)
        .forEach((elem) => {
            if (elem.isNode() === null) {
                if (leafCallback) {
                    leafCallback(elem.getContents());
                }
                return;
            }

            if (nodeCallback) {
                nodeCallback(elem.getContents());
            }

            nodeChildrenIterator(viewModel, elem.getContents().getKey(), nodeCallback, leafCallback);
        });
}

/**
 * После перезагрузки записи, её родительских в дочерних узлов удаляет удаляет из коллекции записи, отсутствующие
 * в новом наборе.
 */
export function applyReloadedNodes(
    viewModel: Tree,
    nodeKey: TKey,
    newItems: RecordSet
): void {
    const itemsToRemove = [];
    const items = viewModel.getCollection() as unknown as RecordSet;
    const checkItemForRemove = (item): void => {
        if (newItems.getIndexByValue(viewModel.getKeyProperty(), item.getKey()) === -1) {
            itemsToRemove.push(item);
        }
    };

    nodeChildrenIterator(viewModel, nodeKey, checkItemForRemove, checkItemForRemove);

    items.setEventRaising(false, true);

    itemsToRemove.forEach((item) => {
        items.remove(item);
    });

    items.setEventRaising(true, true);
}
