import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import { ISelectionObject as ISelection } from 'Controls/interface';
import { Model } from 'Types/entity';
import {IEntryPathItem, IFlatSelectionStrategyOptions, ISelectionItem, ISelectionModel} from '../interface';
import ISelectionStrategy from './ISelectionStrategy';
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';
import { CollectionItem } from 'Controls/display';

const ALL_SELECTION_VALUE = null;

/**
 * Базовая стратегия выбора в плоском списке.
 * @class Controls/_multiselection/SelectionStrategy/FlatSelectionStrategy
 *
 * @public
 * @author Панихин К.А.
 */
export class FlatSelectionStrategy implements ISelectionStrategy {
   private _model: ISelectionModel;

   constructor(options: IFlatSelectionStrategyOptions) {
      this._model = options.model;
   }

   update(options: IFlatSelectionStrategyOptions): void {
      this._model = options.model;
   }

   // tslint:disable-next-line:no-empty
   setEntryPath(entryPath: IEntryPathItem[]): void {}

   select(selection: ISelection, key: CrudEntityKey): ISelection {
      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.excluded, [key]);
      } else {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.selected, [key]);
      }

      return cloneSelection;
   }

   unselect(selection: ISelection, key: CrudEntityKey): ISelection {
      const cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         ArraySimpleValuesUtil.addSubArray(cloneSelection.excluded, [key]);
      } else {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.selected, [key]);
      }

      return cloneSelection;
   }

   selectAll(selection: ISelection, limit?: number): ISelection {
      const excluded = limit ? selection.excluded : [];
      return {selected: [ALL_SELECTION_VALUE], excluded};
   }

   unselectAll(selection: ISelection): ISelection {
      return {selected: [], excluded: []};
   }

   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection {
      let cloneSelection = clone(selection);

      if (this._isAllSelected(cloneSelection)) {
         const excludedKeys = cloneSelection.excluded.slice();
         cloneSelection = this.unselectAll(cloneSelection);
         excludedKeys.forEach((key) => cloneSelection = this.select(cloneSelection, key));
      } else {
         const selectedKeys = cloneSelection.selected.slice();
         cloneSelection = this.selectAll(cloneSelection);
         selectedKeys.forEach((key) => cloneSelection = this.unselect(cloneSelection, key));
      }

      return cloneSelection;
   }

   selectRange(items: Array<CollectionItem<Model>>): ISelection {
      let newSelection = {selected: [], excluded: []};

      items.forEach((elem) => {
         if (elem.SelectableItem) {
            const elemKey = this._getKey(elem);
            newSelection = this.select(newSelection, elemKey);
         }
      });

      return newSelection;
   }

   getSelectionForModel(
       selection: ISelection,
       limit?: number,
       items?: Array<CollectionItem<Model>>
   ): Map<boolean, Array<CollectionItem<Model>>> {
      const selectedItems = new Map();
      // IE не поддерживает инициализацию конструктором
      selectedItems.set(true, []);
      selectedItems.set(false, []);
      selectedItems.set(null, []);

      const isAllSelected: boolean = this._isAllSelected(selection);

      const handleItem = (item) => {
         if (!item.SelectableItem) {
            return;
         }

         const itemId = this._getKey(item);
         const inSelectedKeys = selection.selected.includes(itemId);
         const isSelectedByAllValue = isAllSelected && !selection.excluded.includes(itemId);
         const selected = item.isReadonlyCheckbox()
            ? inSelectedKeys
            : inSelectedKeys || isSelectedByAllValue;

         selectedItems.get(selected).push(item);
      };

      const handleItems = items || this._model.getItems();
      handleItems.forEach(handleItem);

      return selectedItems;
   }

   getCount(selection: ISelection, hasMoreData: boolean, limit?: number, searchValue?: string): number|null {
      let countItemsSelected: number|null;

      if (this._isAllSelected(selection)) {
         const itemsCount = this._model.getItems().filter((it) => this._canBeSelected(it)).length;
         if (limit) {
            if (hasMoreData && limit > itemsCount) {
               // нельзя сказать что кол-во выбранных записей = limit, т.к. на БЛ возможно данных меньше лимита.
               countItemsSelected = null;
            } else {
               countItemsSelected = limit < itemsCount ? itemsCount - selection.excluded.length : itemsCount;
            }
         } else {
            countItemsSelected = hasMoreData ? null : itemsCount - selection.excluded.length;
         }
      } else {
         const itemsCanBeSelected = selection.selected.filter((key) => {
            const item = this._model.getItemBySourceKey(key);
            return this._canBeSelected(item);
         });
         countItemsSelected = itemsCanBeSelected.length;
      }

      return countItemsSelected;
   }

   isAllSelected(
       selection: ISelection,
       hasMoreData: boolean,
       itemsCount: number,
       limit: number,
       byEveryItem: boolean = true
   ): boolean {
      let isAllSelected;

      if (limit) {
         isAllSelected = this._isAllSelected(selection) && limit >= itemsCount && !hasMoreData;
      } else if (byEveryItem) {
         isAllSelected = this._isAllSelected(selection) && selection.excluded.length === 0
            || !hasMoreData && itemsCount > 0 && itemsCount === this.getCount(selection, hasMoreData);
      } else {
         isAllSelected = this._isAllSelected(selection);
      }

      return isAllSelected;
   }

   reset() {
       /* For override */
   }

   /**
    * Проверяет присутствует ли в selected значение "Выбрано все"
    * @param selection
    * @private
    */
   private _isAllSelected(selection: ISelection): boolean {
      return selection.selected.includes(ALL_SELECTION_VALUE);
   }

   private _canBeSelected(item: ISelectionItem): boolean {
      // если по ключу не смогли получить запись, то она еще не подгружена, по дефолту считаем, что она не ридонли
      return !item || item.SelectableItem && !item.isReadonlyCheckbox();
   }

   /**
    * @private
    * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
    *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
    */
   private _getKey(item: CollectionItem<Model>): CrudEntityKey {
      if (!item) {
         return undefined;
      }

      let contents = item.getContents();
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      if (item['[Controls/_display/BreadcrumbsItem]'] || item.breadCrumbs) {
         // tslint:disable-next-line
         contents = contents[(contents as any).length - 1];
      }

      // Для GroupItem нет ключа, в contents хранится не Model
      if (item['[Controls/_display/GroupItem]']) {
         return undefined;
      }

      // у корневого элемента contents=key
      return contents instanceof Object ?  contents.getKey() : contents;
   }
}
