import { Model } from 'Types/entity';
import Drag from 'Controls/_display/itemsStrategy/Drag';
import { IDragPosition } from 'Controls/_display/interface/IDragPosition';
import TreeItem from 'Controls/_display/TreeItem';
import {CrudEntityKey} from 'Types/source';

/**
 * Стратегия для премещения элементов в дереве.
 */
export default class TreeDrag<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>> extends Drag<S, T> {
   setPosition(newPosition: IDragPosition<T>): void {
      super.setPosition(newPosition);

      if (this.avatarItem) {
         const newParent = this._getParentForDraggableItem(newPosition);
         this.avatarItem.setParent(newParent);
      }
   }

   protected _isDisplayItem(item: Model, index: number, collectionItem: TreeItem): boolean {
      if (!super._isDisplayItem(item, index, collectionItem)) {
         return false;
      }
      return this._isDisplayParents(collectionItem, this._options.draggedItemsKeys);
   }

   protected _isDisplayParents(item: TreeItem, draggedItemsKeys: CrudEntityKey[]): boolean {
      const itemParent = item.getParent();

      if (itemParent && !itemParent.isRoot()) {
         const itemParentKey = itemParent.getContents().getKey();
         if (draggedItemsKeys.includes(itemParentKey)) {
            return false;
         }

         return this._isDisplayParents(itemParent, draggedItemsKeys);
      }

      return true;
   }

   /**
    * После создания элементов, нужно выставить правильного родителя у avatarItem.
    * Делать это нужно именно в этот момент, т.к. тут мы скрываем перетаскиваемые записи и создаем avatarItem.
    * @protected
    */
   protected _createItems(): T[] {
      const newItems = super._createItems();

      // avatarItem может не создасться, например когда тащат запись в мастер
      if (this.avatarItem) {
         const parent = this._getParentConsideringHiddenItems(this.avatarItem, newItems);
         if (parent) {
            this.avatarItem.setParent(parent);
         }
      }

      return newItems;
   }

   protected _createItem(protoItem: T): T {
      const item = super._createItem(protoItem);
      if (item && protoItem) {
         item.setParent(protoItem.getParent());
      }
      return item;
   }

   /**
    * Получаем родителя элемента учитывая скрытые(перетаскиваемые) записи
    * @param item Элемент, для которого считаем родителя
    * @param items Текущие элементы списка
    * @private
    */
   private _getParentConsideringHiddenItems(item: T, items: T[]): T {
      let parent = item.getParent() as T;
      while (parent && !parent.isRoot() && !items.includes(parent)) {
         parent = parent.getParent() as T;
      }
      return parent;
   }

   private _getParentForDraggableItem(newPosition: IDragPosition<T>): T {
      let parent;

      const targetItem = newPosition.dispItem;
      const relativePosition = newPosition.position;

      if (!targetItem['[Controls/_display/TreeItem]']) {
         // targetItem может быть, например, группа. Она не наследуется от TreeItem и её родителем будет корень.
         parent = this.options.display.getRoot();
      } else if (targetItem.isNode()) {
         if (relativePosition === 'before' || relativePosition === 'after' && !targetItem.isExpanded()) {
            parent = this._getParentConsideringHiddenItems(targetItem, this.options.display.getItems());
         } else if (relativePosition === 'after' && targetItem.isExpanded()) {
            parent = targetItem;
         } else {
            // relativePosition = 'on'
            parent = this._getParentConsideringHiddenItems(this.avatarItem, this.options.display.getItems());
         }
      } else {
         parent = this._getParentConsideringHiddenItems(targetItem, this.options.display.getItems());
      }

      return parent;
   }
}
