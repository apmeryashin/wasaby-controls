import { Tree } from 'Controls/display';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import { CrudEntityKey } from 'Types/source';

enum MOVE_DIRECTION {
    UP = 'up',
    DOWN = 'down'
}

let cachedDisplay;
let cachedVersion;

function getDisplay(items, parentProperty, nodeProperty, root) {
   // Кешируем проекцию, т.к. её создание тежеловесная операция,
   // а данный метод будет вызываться для каждой записи в списке.
   if (!cachedDisplay || cachedDisplay.getCollection() !== items || cachedVersion !== items.getVersion()) {
      cachedDisplay = new Tree({
          collection: items,
          keyProperty: items.getKeyProperty(),
          parentProperty,
          nodeProperty,
          root: root !== undefined ? root : null
      });
      cachedVersion = items.getVersion();
   }
   if (root !== undefined) {
       cachedDisplay.setRoot(root);
   }
   return cachedDisplay;
}

function getSiblingItem(direction, item, items, parentProperty, nodeProperty, root) {
    let result;
    let display;
    let itemIndex;
    let siblingItem;
    let itemFromProjection;

    // В древовидной структуре, нужно получить следующий(предыдущий) с учетом иерархии.
    // В рекордсете между двумя соседними папками, могут лежат дочерние записи одной из папок,
    // а нам необходимо получить соседнюю запись на том же уровне вложенности, что и текущая запись.
    // Поэтому воспользуемся проекцией, которая предоставляет необходимы функционал.
    // Для плоского списка можно получить следующий(предыдущий) элемент просто по индексу в рекордсете.
    if (parentProperty) {
        display = getDisplay(items, parentProperty, nodeProperty, root);
        itemFromProjection = display.getItemBySourceItem(items.getRecordById(item.getId()));
        if (itemFromProjection) {
            siblingItem = display[direction === MOVE_DIRECTION.UP ? 'getPrevious' : 'getNext'](itemFromProjection);
        }
        result = siblingItem ? siblingItem.getContents() : null;
    } else {
        itemIndex = items.getIndex(item);
        result = items.at(direction === MOVE_DIRECTION.UP ? --itemIndex : ++itemIndex);
    }

    return result;
}

/**
 * Список хелперов для отображения панели операций над записью.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 * @class Controls/_list/ItemActions/Helpers
 * @public
 * @author Авраменко А.С.
 */

/*
 * List of helpers for displaying item actions.
 * @class Controls/_list/ItemActions/Helpers
 * @public
 * @author Авраменко А.С.
 */
const helpers = {

    /**
     * @typedef {String} MoveDirection
     * @variant up Двигаться вверх.
     * @variant down Двигаться вниз
     */

    /*
     * @typedef {String} MoveDirection
     * @variant up Move up
     * @variant down Move down
     */
    MOVE_DIRECTION,

    /**
     * Хелпер для отображения {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} наверху/внизу.
     * @function
     * @name Controls/_list/ItemActions/Helpers#reorderMoveActionsVisibility
     * @param {MoveDirection} direction Направление.
     * @param {Types/entity:Record} item Экземпляр элемента, действие которого обрабатывается.
     * @param {Types/collection:RecordSet} items Список всех элементов.
     * @param {Controls/_interface/IHierarchy#parentProperty} parentProperty Имя поля, содержащего сведения о родительском узле.
     * @param {Controls/_interface/IHierarchy#nodeProperty} nodeProperty Имя поля, описывающего тип узла (список, узел, скрытый узел).
     * @example
     * В следующем примере разрешается перемещать только элементы, находящиеся в одном родительском элементе.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent');
     *    }
     *
     *    return result;
     * }
     * </pre>
     *
     * В следующем примере разрешается перемещать только элементы, которые находятся в том же родительском элементе и имеют тот же тип.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent', 'Parent@');
     *    }
     *
     *    return result;
     * }
     * </pre>
     */

    /*
     * Helper to display up/down item actions.
     * @function
     * @name Controls/_list/ItemActions/Helpers#reorderMoveActionsVisibility
     * @param {MoveDirection} direction
     * @param {Types/entity:Record} item Instance of the item whose action is being processed.
     * @param {Types/collection:RecordSet} items List of all items.
     * @param {Controls/_interface/IHierarchy#parentProperty} parentProperty Name of the field that contains information about parent node.
     * @param {Controls/_interface/IHierarchy#nodeProperty} nodeProperty Name of the field describing the type of the node (list, node, hidden node).
     * @param {String} root Current root
     * @example
     */

    /*
     * @example
     * In the following example, only items that are in the same parent are allowed to be moved.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent', '', this._root);
     *    }
     *
     *    return result;
     * }
     * </pre>
     *
     * In the following example, only items that are in the same parent and have the same type are allowed to be moved.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent', 'Parent@', this._root);
     *    }
     *
     *    return result;
     * }
     * </pre>
     */
    reorderMoveActionsVisibility(direction: string,
                                 item: Model,
                                 items: RecordSet,
                                 parentProperty: string,
                                 nodeProperty: string,
                                 root?: CrudEntityKey): boolean {
        const siblingItem = getSiblingItem(direction, item, items, parentProperty, nodeProperty, root);

        return !!siblingItem &&
            // items in the same folder
            (!parentProperty || siblingItem.get(parentProperty) === item.get(parentProperty)) &&
            // items of the same type
            (!nodeProperty || siblingItem.get(nodeProperty) === item.get(nodeProperty));
    }
};

export = helpers;
