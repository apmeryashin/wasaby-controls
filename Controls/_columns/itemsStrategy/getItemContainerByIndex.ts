import {default as ColumnsCollection} from '../display/Collection';
import CollectionItem from '../display/CollectionItem';

/**
 * На основании итема коллекции возвращает итем его группы
 */
function getItemGroup(index: number, item: CollectionItem, model: ColumnsCollection): CollectionItem {
    const groupFunction = model.getGroup();
    const groupId = groupFunction(item.getContents(), index, item);
    let result: CollectionItem;

    model.getGroupsIterator().each((group) => {
        if (group.getContents() === groupId) {
            result = group;
        }
    });

    return result;
}

/**
 * Возвращает индекс элемента, отвечающего за вывод заголовка группы
 */
function getGroupElemIndex(item: CollectionItem, model: ColumnsCollection): number {
    let groupIndex = 0;
    // Определяем порядковый индекс группы
    model.getGroupsIterator().each((group, i) => {
        if (item === group) {
            groupIndex = i;
        }
    });

    // Высчитываем индекс элемента заголовка группы. Если порядковый индекс группы 0,
    // то индекс элемента тоже 0. В противном случае индекс элемента рассчитываем как кол-во
    // колонок умноженное на порядковый индекс группы, получаем кол-во элементов колонок групп +
    // порядковый индекс группы (элементы заголовков групп)
    return groupIndex === 0 ? groupIndex : (groupIndex * model.getColumnsCount() + groupIndex);
}

/**
 * Стратегия получения dom элемента
 */
export default class ColumnsStrategy {
    static getItemContainerByIndex(index: number, itemsContainer: HTMLElement, model?: ColumnsCollection): HTMLElement {
        const item = model.at(index);

        // Если итем это группы, то возвращаем контейнер в котором содержится её заголовок
        if (item['[Controls/_display/GroupItem]']) {
            const childrenIndex = getGroupElemIndex(item, model);
            return itemsContainer.children[childrenIndex] as HTMLElement;
        }

        const column = item.getColumn();
        const columnIndex = model.getIndexInColumnByIndex(index);

        if (model.getGroup()) {
            const group = getItemGroup(index, item, model);
            const groupElemIndex = getGroupElemIndex(group, model);
            // Индекс элемента колонки группы
            const groupColumnIndex = groupElemIndex + column + 1;

            return itemsContainer.children[groupColumnIndex].children[columnIndex + 1] as HTMLElement;
        }

        return itemsContainer.children[column].children[columnIndex + 1] as HTMLElement;
    }
}
