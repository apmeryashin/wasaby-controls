import TreeItem from 'Controls/_display/TreeItem';
import {Model as EntityModel, Model} from 'Types/entity';
import CollectionItem from 'Controls/_display/CollectionItem';
import CollectionEnumerator from 'Controls/_display/CollectionEnumerator';

/**
 * Возвращает соседний элемент проекции
 * @param enumerator Энумератор элементов
 * @param item Элемент проекции относительно которого искать
 * @param isNext Искать следующий или предыдущий элемент
 * @param [conditionProperty] Свойство, по которому происходит отбор элементов
 */
export function getFlatNearbyItem<
    S extends EntityModel = EntityModel,
    T extends CollectionItem<S> = CollectionItem<S>
>(
    enumerator: CollectionEnumerator<T>,
    item: T,
    isNext: boolean,
    conditionProperty?: string
): T {
    const method = isNext ? 'moveNext' : 'movePrevious';
    let nearbyItem;

    enumerator.setCurrent(item);
    while (enumerator[method]()) {
        nearbyItem = enumerator.getCurrent();
        if (conditionProperty && !nearbyItem[conditionProperty]) {
            nearbyItem = undefined;
            continue;
        }
        break;
    }
    enumerator.reset();

    return nearbyItem;
}

/**
 * Возвращает соседний элемент проекции в рамках одного парента с исходным
 * @param collectionRoot - корневой узел дерева
 * @param enumerator Энумератор элементов
 * @param item Элемент проекции относительно которого искать
 * @param isNext Искать следующий или предыдущий элемент
 * @param [conditionProperty] Свойство, по которому происходит отбор элементов
 */
export function getTreeNearbyItem<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>>(
    collectionRoot: T,
    enumerator: CollectionEnumerator<T>,
    item: T,
    isNext: boolean,
    conditionProperty?: string
): T {
    const method = isNext ? 'moveNext' : 'movePrevious';
    const parent = item && item.getParent && item.getParent() || collectionRoot;
    let hasItem = true;
    const initial = enumerator.getCurrent();
    let sameParent = false;
    let current;
    let nearbyItem;
    let isTreeItem;

    enumerator.setCurrent(item);

    // TODO: отлеживать по level, что вышли "выше"
    while (hasItem && !sameParent) {
        hasItem = enumerator[method]();
        nearbyItem = enumerator.getCurrent();

        // если мы пришли сюда, когда в enumerator ещё ничего нет, то nearbyItem будет undefined
        if (!!nearbyItem && conditionProperty && !nearbyItem[conditionProperty]) {
            nearbyItem = undefined;
            continue;
        }
        // Когда _getNearbyItem используется для обычных групп, у них нет getParent
        isTreeItem = nearbyItem && (nearbyItem['[Controls/_display/TreeItem]'] || nearbyItem['[Controls/_display/BreadcrumbsItem]']);
        sameParent = nearbyItem && isTreeItem ? nearbyItem.getParent() === parent : false;
        current = (hasItem && (!isTreeItem || sameParent)) ? nearbyItem : undefined;
    }

    enumerator.setCurrent(initial);

    return current;
}
