import Flat, { IDraggableFlatCollection} from './Flat';
import { IDragPosition, TreeItem } from 'Controls/display';
import { IDraggableItem, IDragStrategyParams, TPosition } from '../interface';
import { List } from 'Types/collection';
import {CrudEntityKey} from 'Types/source';
import { addSubArray } from 'Controls/Utils/ArraySimpleValuesUtil';

const DRAG_MAX_OFFSET = 0.3;

interface IDraggableTreeItem extends IDraggableItem {
    isNode(): boolean;
    isExpanded(): boolean;
    getChildren(): List<IDraggableTreeItem>;
}

interface IOffset {
    top: number;
    bottom: number;
}

interface IDraggableTreeCollection extends IDraggableFlatCollection<IDraggableTreeItem> {
    getPrevDragPosition(): IDragPosition<IDraggableTreeItem>;
}

type ITreeDragStrategyParams = IDragStrategyParams<IDragPosition<IDraggableTreeItem>, IDraggableTreeItem>;

/**
 * Стратегия расчета позиции для драг'н'дропа в иерархическом списке
 * @class Controls/_listDragNDrop/strategies/Flat
 * @author Панихин К.А.
 */

export default class Tree extends Flat<IDraggableTreeItem, IDraggableTreeCollection> {
    /**
     * Запускает расчет позиции
     */
    calculatePosition(
        {currentPosition, targetItem, mouseOffsetInTargetItem}: ITreeDragStrategyParams
    ): IDragPosition<IDraggableTreeItem> {
        if (this._draggableItem && this._draggableItem === targetItem) {
            return this._model.getPrevDragPosition && this._model.getPrevDragPosition() || null;
        }

        let result;

        const moveTileNodeToLeaves = this._model['[Controls/_tile/Tile]'] && this._draggableItem.isNode()
            && targetItem && !targetItem.isNode();
        if (targetItem && targetItem['[Controls/_display/TreeItem]'] && targetItem.isNode() && !moveTileNodeToLeaves && mouseOffsetInTargetItem) {
            result = this._calculatePositionRelativeNode(targetItem, mouseOffsetInTargetItem);
        } else {
            // В плитке нельзя смешивать узлы и листья, если перетаскивают узел в листья, то мы не меняем позицию
            result = super.calculatePosition({currentPosition, targetItem: moveTileNodeToLeaves ? null : targetItem});
        }

        return result;
    }

    /**
     * Получаем ключи перетаскиваемых записей, включая детей всех перетаскиваемых узлов.
     * Это нужно для того, чтобы скрыть все перетаскиваемый записи(за исключение draggableItem)
     * @param {CrudEntityKey[]} selectedKeys Ключи выбранных записей
     */
    getDraggableKeys(selectedKeys: CrudEntityKey[]): CrudEntityKey[] {
        let draggedKeys = super.getDraggableKeys(selectedKeys);

        draggedKeys.forEach((key) => {
            const item = this._model.getItemBySourceKey(key) as TreeItem;
            if (item.isNode() !== null) {
                const childKeys = this._getChildKeys(item);
                addSubArray(draggedKeys, childKeys);
            }
        });

        return draggedKeys;
    }

    /**
     * Получает рекурсивно всех детей переданного элемента коллекции, чтобы в коллекции скрыть этих детей при ДнД
     * @param parent
     * @private
     */
    private _getChildKeys(parent: TreeItem): CrudEntityKey[] {
        const childKeys = [];

        const childs = parent.getChildren();
        childs.forEach((child) => {
            const childKey = child.getContents().getKey();
            childKeys.push(childKey);

            if (child.isNode() !== null) {
                addSubArray(childKeys, this._getChildKeys(child));
            }
        });

        return childKeys;
    }

    private _calculatePositionRelativeNode(
        targetItem: IDraggableTreeItem, mouseOffsetInTargetItem: IOffset
    ): IDragPosition<IDraggableTreeItem> {
        let relativePosition: TPosition = 'on';

        // Если нет перетаскиваемого элемента, то значит мы перетаскивам в папку другого реестра, т.к
        // если перетаскивают не в узел, то нам вернут рекорд из которого мы создадим draggableItem
        // В плитке лист мы можем перенести только внутрь узла
        if (!this._draggableItem || this._model['[Controls/_tile/Tile]'] && !this._draggableItem.isNode() && targetItem.isNode()) {
            relativePosition = 'on';
        } else {
            if (mouseOffsetInTargetItem) {
                if (mouseOffsetInTargetItem.top <= DRAG_MAX_OFFSET) {
                    relativePosition = 'before';
                } else if (mouseOffsetInTargetItem.bottom <= DRAG_MAX_OFFSET) {
                    relativePosition = 'after';
                } else {
                    relativePosition = 'on';
                }
            }
        }

        let newPosition;
        if (relativePosition === 'after' && targetItem.isExpanded() && targetItem.getChildren().getCount()) {
            const firstChild = targetItem.getChildren().at(0);

            if (firstChild === this._draggableItem) {
                newPosition = this._startPosition;
            } else {
                newPosition = {
                    index: this._model.getIndex(firstChild),
                    position: 'before',
                    dispItem: firstChild
                };
            }
        } else {
            newPosition = {
                index: this._model.getIndex(targetItem),
                position: relativePosition,
                dispItem: targetItem
            };
        }

        return newPosition;
    }
}
