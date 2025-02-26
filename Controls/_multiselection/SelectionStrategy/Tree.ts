import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
// нет замены
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import clone = require('Core/core-clone');
import {Model} from 'Types/entity';
import {ISelectionObject as ISelection} from 'Controls/interface';
import ISelectionStrategy from './ISelectionStrategy';
import {IEntryPathItem, ITreeSelectionStrategyOptions, TKeys} from '../interface';
import {CrudEntityKey} from 'Types/source';
import {BreadcrumbsItem, CollectionItem, Tree, TreeItem} from 'Controls/display';

const LEAF = null;

/**
 * Стратегия выбора для иерархического списка.
 * @class Controls/_multiselection/SelectionStrategy/TreeSelectionStrategy
 *
 * @public
 * @author Панихин К.А.
 */
export class TreeSelectionStrategy implements ISelectionStrategy {
   private _selectAncestors: boolean;
   private _selectDescendants: boolean;
   // удаляем по задаче https://online.sbis.ru/opendoc.html?guid=51cfa21a-f2ca-436d-b600-da3b22ccb7f2
   // tslint:disable-next-line:ban-ts-ignore
   // @ts-ignore
   private _rootId: CrudEntityKey;
   private _model: Tree<Model, TreeItem<Model>>;
   private _entryPath: IEntryPathItem[];
   private _selectionType: 'node'|'leaf'|'all'|'allBySelectAction' = 'all';
   private _selectionCountMode: 'node'|'leaf'|'all' = 'all';
   private _recursiveSelection: boolean;
   private _rootChanged: boolean;

   constructor(options: ITreeSelectionStrategyOptions) {
      this.update(options);
      this._rootChanged = false;
   }

   update(options: ITreeSelectionStrategyOptions): void {
      this._validateOptions(options);

      if (this._rootId !== options.rootId) {
         this._rootChanged = true;
      }

      this._selectAncestors = options.selectAncestors;
      this._selectDescendants = options.selectDescendants;
      this._rootId = options.rootId;
      this._model = options.model;
      this._entryPath = options.entryPath;
      this._selectionType = options.selectionType;
      this._recursiveSelection = options.recursiveSelection;
      this._selectionCountMode = options.selectionCountMode;
   }

   setEntryPath(entryPath: IEntryPathItem[]): void {
      this._entryPath = entryPath;
   }

   select(selection: ISelection, key: CrudEntityKey): ISelection {
      const item = this._getItem(key);
      const cloneSelection = clone(selection);

      // Если не найден item, то считаем что он не загружен и будет работать соответствующая логика
      if (item && !this._canBeSelected(item)) {
         return cloneSelection;
      }

      if (item && this._isNode(item)) {
         this._selectNode(cloneSelection, item);
      } else {
         this._selectLeaf(cloneSelection, key);
      }

      return cloneSelection;
   }

   unselect(selection: ISelection, key: CrudEntityKey, searchValue?: string): ISelection {
      const item = this._getItem(key);
      const cloneSelection = clone(selection);

      // Если не найден item, то считаем что он не загружен и будет работать соответствующая логика
      if (item && !this._canBeSelected(item)) {
         return cloneSelection;
      }

      if (!item) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.selected, [key]);
         if (this._isAllSelectedInRoot(selection)) {
            ArraySimpleValuesUtil.addSubArray(cloneSelection.excluded, [key]);
         }
      } else if (this._isNode(item)) {
         this._unselectNode(cloneSelection, item);
      } else {
         this._unselectLeaf(cloneSelection, item);
      }
      if (key !== this._rootId && item && this._selectAncestors && !item['[Controls/_display/BreadcrumbsItem]']) {
         this._unselectParentNodes(cloneSelection, item.getParent());
      }
      if (
          searchValue &&
          this._isAllSelectedInRoot(cloneSelection) &&
          this._isAllChildrenExcluded(cloneSelection, this._getRoot())
      ) {
         cloneSelection.selected.length = 0;
         cloneSelection.excluded.length = 0;
      }

      if (!cloneSelection.selected.length) {
         cloneSelection.excluded = [];
      }

      return cloneSelection;
   }

   selectAll(selection: ISelection, limit?: number): ISelection {
      const initSelection = this._rootChanged ? {selected: [], excluded: []} : selection;
      const newSelection = this.select(initSelection, this._rootId);
      if (!limit) {
         this._removeChildes(newSelection, this._getRoot());
      }

      if (!newSelection.excluded.includes(this._rootId)) {
         newSelection.excluded = ArraySimpleValuesUtil.addSubArray(newSelection.excluded, [this._rootId]);
      }

      return newSelection;
   }

   unselectAll(selection: ISelection): ISelection {
      // По стандарту: unselectAll предназначен для снятия отметки со всех записей, не зависимо от фильтрации
      return {selected: [], excluded: []};
   }

   toggleAll(selection: ISelection, hasMoreData: boolean): ISelection {
      // Если выбраны все дети в узле по одному, то при инвертировании должен получиться пустой selection
      if (this.isAllSelected(selection, hasMoreData, this._model.getCollection().getCount(), null, true)) {
         return {selected: [], excluded: []};
      }

      let cloneSelection = clone(selection);
      const childrenIdsInRoot = this._getAllChildrenIds(this._getRoot());

      if (this._rootChanged) {
         this._removeIdsNotFromCurrentRoot(cloneSelection, childrenIdsInRoot);
      }

      const rootExcluded = cloneSelection.excluded.includes(this._rootId);
      const oldExcludedKeys = cloneSelection.excluded.slice();
      const oldSelectedKeys = cloneSelection.selected.slice();

      if (this._isAllSelected(cloneSelection, this._rootId)) {
         cloneSelection = this._unselectAllInRoot(cloneSelection);

         const intersectionKeys = ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldExcludedKeys);
         intersectionKeys.forEach((key) => cloneSelection = this.select(cloneSelection, key));
      } else {
         cloneSelection = this.selectAll(cloneSelection);

         if (hasMoreData) {
            oldSelectedKeys.forEach((key) => cloneSelection = this.unselect(cloneSelection, key));
         }
      }

      ArraySimpleValuesUtil.addSubArray(
          cloneSelection.excluded,
          ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldSelectedKeys)
      );
      ArraySimpleValuesUtil.addSubArray(
          cloneSelection.selected,
          ArraySimpleValuesUtil.getIntersection(childrenIdsInRoot, oldExcludedKeys)
      );

      if (rootExcluded) {
         ArraySimpleValuesUtil.removeSubArray(cloneSelection.excluded, [this._rootId]);
      }

      return cloneSelection;
   }

   selectRange(items: Array<CollectionItem<Model>>): ISelection {
      let newSelection = {selected: [], excluded: []};

      items.forEach((elem) => {
         if (elem.SelectableItem && (!elem.isNode() || elem.isNode() && !elem.isExpanded())) {
            const elemKey = this._getKey(elem);
            newSelection = this.select(newSelection, elemKey);
         }
      });

      return newSelection;
   }

   getSelectionForModel(
       selection: ISelection,
       limit?: number,
       items?: Array<TreeItem<Model>>,
       searchValue?: string
   ): Map<boolean|null, Array<TreeItem<Model>>> {
      const selectedItems = new Map();
      // IE не поддерживает инициализацию конструктором
      selectedItems.set(true, []);
      selectedItems.set(false, []);
      selectedItems.set(null, []);
      let selectedItemsCountByPack = 0;

      const selectionWithEntryPath = {
         selected: this._mergeEntryPath(selection.selected),
         excluded: selection.excluded
      };

      let doNotSelectNodes = false;
      if (searchValue) {
         let isOnlyNodesInItems = true;

         if (items) {
            items.forEach((item) => {
               if (isOnlyNodesInItems && item.SelectableItem) {
                  isOnlyNodesInItems = this._isNode(item);
               }
            });
         } else {
            this._model.each((item) => {
               // Скипаем элементы, которые нельзя выбрать, т.к. например группа испортит значение isOnlyNodesInItems
               if (isOnlyNodesInItems && item.SelectableItem) {
                  isOnlyNodesInItems = this._isNode(item);
               }
            });
         }

         doNotSelectNodes = this._isAllSelected(selectionWithEntryPath, this._rootId) && !isOnlyNodesInItems;
      }

      const handleItems = items || this._model.getItems();
      handleItems.forEach((item) => {
         if (!item.SelectableItem) {
            return;
         }

         let isSelected = this._getItemSelected(item, selectionWithEntryPath, doNotSelectNodes, searchValue);

         // Проверяем на лимит, если он уже превышен, то остальные элементы нельзя выбрать
         // считаем только элементы выбранные пачкой, отдельно выбранные элементы не должны на это влиять
         if (isSelected !== false && limit && !selectionWithEntryPath.selected.includes(this._getKey(item))) {
            if (selectedItemsCountByPack >= limit) {
               isSelected = false;
            }

            selectedItemsCountByPack++;
         }

         selectedItems.get(isSelected).push(item);
      });

      return selectedItems;
   }

   private _getItemSelected(
       item: TreeItem,
       selection: ISelection,
       doNotSelectNodes: boolean,
       searchValue?: string
   ): boolean|null {
      const key = this._getKey(item);
      const parent = item.getParent();
      const parentId = this._getKey(parent);
      const inSelected = selection.selected.includes(key);
      const inExcluded = selection.excluded.includes(key);

      let isSelected = false;
      if (item['[Controls/_display/BreadcrumbsItem]']) {
         isSelected = this._getBreadcrumbsSelected(item, selection);
         if (isSelected === false) {
            isSelected = this._getStateNode(item, isSelected, selection);
            // хлебная крошка не модет быть полностью выбрана исходя из выбора детей
            if (isSelected === true) {
               isSelected = null;
            }
         }
      } else if (parent['[Controls/_display/BreadcrumbsItem]'] && !inSelected) {
         const parentIsSelected = this._getBreadcrumbsSelected(parent, selection);
         isSelected = parentIsSelected !== false && !inExcluded;
      } else {
         const isNode = this._isNode(item);
         if (!this._selectAncestors && !this._selectDescendants) {
            // В этом случае мы вообще не смотри на узлы,
            // т.к. выбранность элемента не зависит от выбора родительского узла
            // или выбранность узла не зависит от его детей
            isSelected = this._canBeSelected(item, false) && !inExcluded &&
                (inSelected || this._isAllSelectedInRoot(selection));
         } else {
            isSelected = this._canBeSelected(item, false) &&
                (
                    !inExcluded && (inSelected || this._isAllSelected(selection, parentId)) ||
                    isNode && this._isAllSelected(selection, key)
                );

            if ((this._selectAncestors || searchValue) && isNode) {
               isSelected = this._getStateNode(item, isSelected, selection);
            }
         }

         if (isSelected && isNode && doNotSelectNodes) {
            isSelected = null;
         }
      }

      return isSelected;
   }

   private _getBreadcrumbsSelected(item: BreadcrumbsItem, selection: ISelection): boolean|null {
      const keys = (item.getContents() as unknown as Model[]).map((it) => it.getKey());
      // разворачиваем ключи в обратном порядке, т.к. элементы с конца имеют больше приоритет в палне выбранности
      // т.к. если выбрать вложенную папку, то не зависимо от выбранности родителей она будет выбрана
      const reversedKeys = keys.reverse();
      const excludedKeyIndex = reversedKeys.findIndex((key) => selection.excluded.includes(key));
      const selectedKeyIndex = reversedKeys.findIndex((key) => selection.selected.includes(key));

      // крошка выбрана, если нет исключенных элементов
      // или выбранный элемент находится ближе к концу крошки(глубже по иерархии) чем исключенный
      const hasSelected = selectedKeyIndex !== -1;
      const hasExcluded = excludedKeyIndex !== -1;
      const isAllChildsExcluded = this._isAllChildrenExcluded(selection, item as unknown as TreeItem);
      const isSelectedLastCrumb = selectedKeyIndex === 0; // 0 - revers array

      let isSelected;
      if (this._isAllSelectedInRoot(selection)) {
         // Если нажали выбрать все, то выбирается все что найдено, то есть сама хлебная крошка не выбрана
         isSelected = !hasExcluded && !isAllChildsExcluded ? null : false;
      } else {
         isSelected = hasSelected && (!hasExcluded || selectedKeyIndex < excludedKeyIndex);

         // Хлебная крошка [1, 2, 3]. Хлебная крошка идентифицируется ключом 3.
         // Если хлебная крошка выбрана благодаря отметке 2, то это значит,
         // что хлебная крошка была выбрана еще в виде узла.
         // Считаем ее частично выбранной, т.к. большинство записей узла 2 могут быть вообще не загружены.
         if (isSelected && !isSelectedLastCrumb) {
            isSelected = null;
         }
      }
      return isSelected;
   }

   getCount(selection: ISelection, hasMoreData: boolean, limit?: number, searchValue?: string): number|null {
      if (limit) {
         const countItems = this._model.getCount();
         return !hasMoreData && limit > countItems ? countItems : limit;
      }

      let countItemsSelected: number|null = 0;
      let selectedNodes: TKeys = [];

      if (!this._isAllSelected(selection, this._rootId) || !hasMoreData) {
         if (this._selectDescendants) {
            for (let index = 0; index < selection.selected.length; index++) {
               const key = selection.selected[index];
               const item = this._getItem(key);

               if (!item || this._isNode(item)) {
                  selectedNodes.push(key);
               }

               const canBeCounted = this._canBeCounted(item);
               if (!selection.excluded.includes(key) && canBeCounted) {
                  countItemsSelected++;
               }
            }
         } else {
            selectedNodes = ArraySimpleValuesUtil.getIntersection(selection.selected, selection.excluded);
            countItemsSelected = selection.selected.length - selectedNodes.length;
         }

         for (let index = 0; index < selectedNodes.length; index++) {
            const nodeKey = selectedNodes[index];
            let countItemsSelectedInNode;
            const nodeHasMoreData = this._model.getHasMoreStorage()[nodeKey];
            if (nodeHasMoreData && (nodeHasMoreData.forward || nodeHasMoreData.backward)) {
                countItemsSelectedInNode = null;
            } else {
               const node = this._getItem(nodeKey);
               countItemsSelectedInNode = this._getSelectedChildrenCount(node, selection, searchValue);
            }

            if (countItemsSelectedInNode === null) {
               countItemsSelected = null;
               break;
            } else {
               countItemsSelected += countItemsSelectedInNode;
            }
         }
      } else if (selection.selected.length) {
         countItemsSelected = null;
      }

      return countItemsSelected;
   }

   isAllSelected(selection: ISelection,
                 hasMoreData: boolean,
                 itemsCount: number,
                 limit: number,
                 byEveryItem: boolean = true,
                 rootId?: CrudEntityKey): boolean {
      let isAllSelected;

      if (limit) {
         isAllSelected = this._isAllSelectedInRoot(selection, rootId) && limit >= itemsCount && !hasMoreData;
      } else if (byEveryItem) {
         // считаем кол-во выбранных только среди загруженных элементов, т.к. allSelected считаем под опцией byEveryItem
         const selectionForModel = this.getSelectionForModel(selection, limit);
         const selectedCount = selectionForModel.get(true).length + selectionForModel.get(null).length;

         isAllSelected = !hasMoreData && itemsCount > 0 && itemsCount === selectedCount
            || this._isAllSelectedInRoot(selection, rootId) && selection.excluded.length === 1;
      } else {
         isAllSelected = this._isAllSelectedInRoot(selection, rootId);
      }

      return isAllSelected;
   }

   reset(): void {
      this._rootChanged = false;
   }

   private _removeIdsNotFromCurrentRoot(selection: ISelection, childrenIdsInRoot: CrudEntityKey[]): void {
      selection.selected.forEach((val, i) => {
         if (!childrenIdsInRoot.includes(val)) {
            selection.selected.splice(i, 1);
         }
      });

      selection.excluded.forEach((val, i) => {
         if (!childrenIdsInRoot.includes(val)) {
            selection.excluded.splice(i, 1);
         }
      });
   }

   private _unselectParentNodes(selection: ISelection, item: TreeItem<Model>): void {
      let allChildrenExcluded = this._isAllChildrenExcluded(selection, item);
      let currentParent = item;
      while (currentParent && allChildrenExcluded && !item['[Controls/_display/BreadcrumbsItem]']) {
         this._unselectNode(selection, currentParent);
         currentParent = currentParent.getParent();
         allChildrenExcluded = this._isAllChildrenExcluded(selection, currentParent);
      }
   }

   private _isAllSelectedInRoot(selection: ISelection, rootId?: CrudEntityKey): boolean {
      return selection.selected.includes(rootId || this._rootId) && selection.excluded.includes(rootId || this._rootId);
   }

   private _unselectAllInRoot(selection: ISelection): ISelection {
      const rootInExcluded = selection.excluded.includes(this._rootId);

      let resSelection = selection;
      resSelection = this.unselect(resSelection, this._rootId);
      this._removeChildes(resSelection, this._getRoot());

      if (rootInExcluded) {
         resSelection.excluded = ArraySimpleValuesUtil.removeSubArray(resSelection.excluded, [this._rootId]);
      }

      return resSelection;
   }

   private _isAllSelected(selection: ISelection, nodeId: CrudEntityKey): boolean {
      if (this._selectDescendants || this._isAllSelectedInRoot(selection)) {
         return selection.selected.includes(nodeId) || !selection.excluded.includes(nodeId) &&
            this._hasSelectedParent(nodeId, selection);
      } else {
         return selection.selected.includes(nodeId) && selection.excluded.includes(nodeId);
      }
   }

   private _selectNode(selection: ISelection, node: TreeItem<Model>): void {
      this._selectLeaf(selection, this._getKey(node));

      if (this._selectDescendants) {
         this._removeChildes(selection, node);
      }
   }

   private _unselectNode(selection: ISelection, node: TreeItem<Model>): void {
      this._unselectLeaf(selection, node);
      // если сняли выбор с узла, то нужно убрать его из ENTRY_PATH
      const nodeKey = this._getKey(node);
      if (!selection.selected.includes(nodeKey) && selection.excluded.includes(nodeKey)) {
         this._clearEntryPath([nodeKey]);
      }
      // снять выбор с детей мы можем в любом случае, независимо от selectDescendants и selectAncestors,
      // т.к. по клику по закрашенному чекбоксу это нужно делать
      this._removeChildes(selection, node);
   }

   private _selectLeaf(selection: ISelection, leafId: string|number): void {
      if (selection.excluded.includes(leafId)) {
         ArraySimpleValuesUtil.removeSubArray(selection.excluded, [leafId]);
      } else {
         ArraySimpleValuesUtil.addSubArray(selection.selected, [leafId]);
      }
   }

   private _unselectLeaf(selection: ISelection, item: TreeItem<Model>): void {
      const parent = item.getParent();
      const parentId = this._getKey(parent);
      const itemId = this._getKey(item);
      const itemInSelected = selection.selected.includes(itemId);

      if (itemInSelected) {
         ArraySimpleValuesUtil.removeSubArray(selection.selected, [itemId]);
      }

      // если родитель выбран, то ребенка нужно положить в excluded, чтобы он не был выбран
      if (!itemInSelected || this._isAllSelected(selection, parentId)) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [itemId]);
      }

      if (
          this._isAllChildrenExcluded(selection, parent) &&
          this._selectAncestors &&
          parentId !== this._rootId &&
          !parent['[Controls/_display/BreadcrumbsItem]']
      ) {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [parentId]);
         ArraySimpleValuesUtil.removeSubArray(selection.selected, [parentId]);
      }

      if (item['[Controls/_display/BreadcrumbsItem]']) {
         this._unselectBreadcrumb(selection, item as unknown as BreadcrumbsItem);
      }
   }

   private _unselectBreadcrumb(selection: ISelection, breadcrumb: BreadcrumbsItem): void {
      const breadcrumbKey = this._getKey(breadcrumb);
      if (selection.selected.includes(breadcrumbKey)) {
         ArraySimpleValuesUtil.removeSubArray(selection.selected, [breadcrumbKey]);
      } else {
         ArraySimpleValuesUtil.addSubArray(selection.excluded, [breadcrumbKey]);
      }
   }

   private _mergeEntryPath(selectedKeys: TKeys): TKeys {
      const selectedKeysWithEntryPath: TKeys = selectedKeys.slice();

      if (this._entryPath) {
         // entryPath это путь от выбранных узлов до текущих элементов. У нас в списке этих узлов нет, поэтому считаем,
         // что эти узлы выбраны, чтобы выбрались все их дети
         this._entryPath.forEach((it) => {
            // Если один из родителей в entry_path точно выбран (лежит в selectedKeys), то и его дети точно выбраны
            const parentIsSelected = this._parentFromEntryPathIsSelected(it.id, selectedKeys);
            if (parentIsSelected) {
               selectedKeysWithEntryPath.push(it.id);
            }
         });
      }

      return selectedKeysWithEntryPath;
   }

   /**
    * Возвращает true, если один из родителей в ENTRY_PATH выбран, иначе false
    * @param key
    * @param selectedKeys
    * @private
    */
   private _parentFromEntryPathIsSelected(key: CrudEntityKey, selectedKeys: CrudEntityKey[]): boolean {
      const entryPath = this._entryPath.find((it) => it.id === key);
      if (entryPath) {
         const parentKey = entryPath.parent;
         if (selectedKeys.includes(parentKey)) {
            return true;
         } else {
            return this._parentFromEntryPathIsSelected(parentKey, selectedKeys);
         }
      }

      return false;
   }

   private _clearEntryPath(ids: CrudEntityKey[]): void {
      if (this._entryPath) {
         ids.forEach((childId) => {
            const entryIndex = this._entryPath.findIndex((entryPath) => entryPath.id === childId);
            if (entryIndex !== -1) {
               this._entryPath.splice(entryIndex, 1);
            }
         });
      }
   }

   private _hasSelectedParent(key: CrudEntityKey, selection: ISelection): boolean {
      let hasSelectedParent = false;
      let hasExcludedParent = false;
      let currentParentId = this._getParentKey(key);

      while (currentParentId !== null && currentParentId !== undefined) {
         if (selection.selected.includes(currentParentId)) {
            hasSelectedParent = true;
            break;
         } else if (selection.excluded.includes(currentParentId)) {
            hasExcludedParent = true;
            break;
         }

         currentParentId = this._getParentKey(currentParentId);
      }

      if (!hasExcludedParent && !currentParentId && selection.selected.includes(null)) {
         hasSelectedParent = true;
      }

      return hasSelectedParent;
   }

   private _getParentKey(key: CrudEntityKey): CrudEntityKey {
      const item = this._model.getItemBySourceKey(key);
      if (!item) {
         return undefined;
      }

      // Дле хлебной крошки сперва берем родителей по ее "пути"
      if (item['[Controls/_display/BreadcrumbsItem]']) {
         const path = (item.getContents() as Model[]).map((it) => it.getKey());
         const itemIndex = path.indexOf(key);
         if (itemIndex > 0) {
            return path[itemIndex - 1];
         }
      } else if (item['[Controls/_display/GroupItem]']) {
         // для группы родителем будет корневой элемент
         return this._getKey(this._getRoot());
      }

      const parent = item.getParent();
      return this._getKey(parent);
   }

   private _getStateNode(node: TreeItem<Model>, initialState: boolean, selection: ISelection): boolean|null {
      const children = node.getChildren(false);
      const listKeys = initialState ? selection.excluded : selection.selected;
      let stateNode = initialState;
      let countChildrenInList: boolean|number|null = 0;
      let isAllChildIsSelectedByOne = true;

      for (let index = 0; index < children.getCount(); index++) {
         const child = children.at(index);
         const childId = this._getKey(child);
         const childInList = listKeys.includes(childId);
         const childIsSelected = selection.selected.includes(childId);
         isAllChildIsSelectedByOne = isAllChildIsSelectedByOne && childIsSelected;

         if (this._isNode(child)) {
            const stateChildNode = this._getStateNode(child, childInList ? !initialState : initialState, selection);

            if (stateChildNode === null) {
               stateNode = null;
               break;
            } else if (stateChildNode !== initialState) {
               countChildrenInList++;
            }
         } else if (childInList) {
            countChildrenInList++;
         }
      }

      const nodeKey = this._getKey(node);
      if (countChildrenInList && countChildrenInList === children.getCount() && node && node['[Controls/_display/BreadcrumbsItem]']) {
         stateNode = !initialState;
      } else if (countChildrenInList > 0) {
         const hasMore = node['[Controls/_display/TreeItem]'] &&
             (node.hasMoreStorage('forward') || node.hasMoreStorage('backward'));
         stateNode = !hasMore && isAllChildIsSelectedByOne ? true : null;
      } else if (this._entryPath) {
         if (this._childFromEntryPathIsSelected(nodeKey, selection.selected)) {
            stateNode = null;
         }
      } else if (selection.selected.includes(nodeKey) && selection.excluded.includes(nodeKey)) {
         // если ключ узла в excluded, то это значит что он выбран не полностью и чекбокс нужно закрасить квадратиком
         stateNode = null;
      }

      return stateNode;
   }

   /**
    * Возвращает true, если один из детей в ENTRY_PATH выбран, иначе false
    * @param parentKey
    * @param selectedKeys
    * @private
    */
   private _childFromEntryPathIsSelected(parentKey: CrudEntityKey, selectedKeys: CrudEntityKey[]): boolean {
      const entryPath = this._entryPath.find((it) => it.parent === parentKey);
      if (entryPath) {
         const childKey = entryPath.id;
         if (selectedKeys.includes(childKey)) {
            return true;
         } else {
            return this._childFromEntryPathIsSelected(childKey, selectedKeys);
         }
      }

      return false;
   }

   /**
    * Проверяем, что все дети данного узла находятся в excluded
    * @param selection
    * @param node
    * @private
    */
   private _isAllChildrenExcluded(selection: ISelection, node: TreeItem<Model>): boolean {
      if (!node) {
         return false;
      }

      const childes = node.getChildren(false);

      let result = true;

      const hasMore = node['[Controls/_display/TreeItem]'] &&
          (node.hasMoreStorage('forward') || node.hasMoreStorage('backward'));
      if (childes.getCount() && !hasMore) {
         for (let i = 0; i < childes.getCount(); i++) {
            const child = childes.at(i);
            const childId = this._getKey(child);

            // Если ребенок не выбран, то на его детей точно не нужно смотреть
            const childIsExcluded = selection.excluded.includes(childId);
            if (!childIsExcluded && child.getChildren(false).getCount() > 0) {
               result = result && this._isAllChildrenExcluded(selection, child);
            } else {
               result = result && selection.excluded.includes(childId);
            }

            if (!result) {
               break;
            }
         }
      } else {
         result = false;
      }

      return result;
   }

   private _getAllChildren(node: TreeItem<Model>): Array<TreeItem<Model>> {
      const childes = [];

      node.getChildren(false).each((child) => {
         ArraySimpleValuesUtil.addSubArray(childes, [child]);

         if (this._isNode(child)) {
            ArraySimpleValuesUtil.addSubArray(childes, this._getAllChildren(child));
         }
      });

      return childes;
   }

   /**
    * Возвращает всех детей данного узла из ENTRY_PATH, включая детей детей узла
    * @param parentId
    * @private
    */
   private _getRecursiveChildesInEntryPath(parentId: CrudEntityKey): TKeys {
      let childrenIds = [];

      const childesFromEntryPath = this._entryPath
          .filter((item) => item.parent === parentId)
          .map((item) => item.id);

      childrenIds = childrenIds.concat(childesFromEntryPath);
      childesFromEntryPath.forEach((childKey) => {
         childrenIds = childrenIds.concat(this._getRecursiveChildesInEntryPath(childKey));
      });

      return childrenIds;
   }

   /**
    * Возвращает ключи всех детей, включая детей из ENTRY_PATH
    * @param node
    * @private
    */
   private _getAllChildrenIds(node: TreeItem<Model>): TKeys {
      let childrenIds = this._getAllChildren(node).map((child) => this._getKey(child));

      if (this._entryPath) {
         const nodeId = this._getKey(node);
         childrenIds = childrenIds.concat(this._getRecursiveChildesInEntryPath(nodeId));
      }

      return childrenIds;
   }

   private _hasChildren(item: TreeItem<Model>): boolean {
      return item.hasChildren() || item.getChildren(false).getCount() > 0;
   }

   private _getSelectedChildrenCount(node: TreeItem<Model>, selection: ISelection, searchValue?: string): number|null {
      if (!node) {
         // Если узла нет, это значит что он не загружен, соответственно мы не можем посчитать кол-во выбранных детей
         return null;
      }

      const children = node.getChildren(false);
      let selectedChildrenCount = 0;

      if (children.getCount()) {
         children.each((childItem) => {
            if (childItem && childItem['[Controls/_display/BreadcrumbsItem]'] && this._isAllSelectedInRoot(selection)) {
               selectedChildrenCount = null;
            }

            if (selectedChildrenCount !== null) {
               const childId = this._getKey(childItem);
               const childIsNode = this._isNode(childItem);
               const childInSelected = selection.selected.includes(childId);
               const childInExcluded = selection.excluded.includes(childId);

               if (!childInExcluded) {
                  const canBeCounted = this._canBeCounted(childItem);
                  const allowCountByState = this._getItemSelected(childItem, selection, false, searchValue);
                  // не считаем записи в selected, т.к. они будут посчитаны в методе выше
                  if (!childInSelected && canBeCounted && allowCountByState) {
                     selectedChildrenCount++;
                  }

                  if (childIsNode) {
                     const nextChildSelectedCount = this._getSelectedChildrenCount(childItem, selection, searchValue);
                     selectedChildrenCount = nextChildSelectedCount === null
                        ? null
                        : selectedChildrenCount + nextChildSelectedCount;
                  }
               }
            }
         });
      } else if (this._hasChildren(node)) {
         selectedChildrenCount = null;
      }

      return selectedChildrenCount;
   }

   private _removeChildes(selection: ISelection, node: TreeItem<Model>): void {
      const childrenIds = this._getAllChildrenIds(node);
      ArraySimpleValuesUtil.removeSubArray(selection.selected, childrenIds);
      ArraySimpleValuesUtil.removeSubArray(selection.excluded, childrenIds);

      // нужно из entryPath удалить ключи удаленных записей, иначе мы будем считать что запись выбрана по entryPath
      // пересчитывать entryPath никто не будет, т.к. это нужно отправлять запрос на бл на каждый клик по чекбоксу
      this._clearEntryPath(childrenIds);
   }

   /**
    * Проверяет что элемент узел или скрытый узел
    * @param item
    * @private
    */
   private _isNode(item: TreeItem<Model>): boolean {
      if (item instanceof TreeItem) {
         return item.isNode() !== LEAF;
      } else if (item && item['[Controls/_display/BreadcrumbsItem]']) {
         return true;
      }
      return false;
   }

   /**
    * @private
    * TODO нужно выпилить этот метод при переписывании моделей. item.getContents() должен возвращать Record
    *  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
    */
   private _getKey(item: TreeItem<Model>): CrudEntityKey {
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

   private _getItem(key: CrudEntityKey): TreeItem<Model> {
      if (key === this._rootId) {
         return this._getRoot();
      } else {
         return this._model.getItemBySourceKey(key);
      }
   }

   private _getRoot(): TreeItem<Model> {
      // getRoot возвращает самый верхний узел и его нельзя получить с помощью getItemBySourceKey
      return this._model.getItemBySourceKey(this._rootId) || this._model.getRoot();
   }

   /**
    * Проверяет можно ли сделать переданный итем выбранным.
    * @param {TreeItem<Model>} item - проверяемый итем
    * @param {Boolean} [readonlyCheck = true] - нужно ли проверять итем на признак readonly его чекбокса
    */
   private _canBeSelected(item: TreeItem<Model>, readonlyCheck: boolean = true): boolean {
      // Проверяем доступность чекбокса итема. В некоторых случаях нужно учитывать признак readonly
      // а в некоторых нет. Поэтому опционально проверяем доступность чекбокса.
      const choiceIsAvailable = readonlyCheck ? !item.isReadonlyCheckbox() : item.isVisibleCheckbox();
      const canBeSelectedBySelectionType = this._canBeSelectedBySelectionType(item);

      return canBeSelectedBySelectionType && choiceIsAvailable;
   }

   private _canBeSelectedBySelectionType(item: TreeItem<Model>): boolean {
      const isNode = this._isNode(item);

      switch (this._selectionType) {
         case 'all':
         // allBySelectAction используется в lookupPopup и приходит к нам через scope, расцениваем ее как all
         case 'allBySelectAction':
            return true;
         case 'leaf':
            return !isNode || this._recursiveSelection && isNode || item.isRoot();
         case 'node':
            return isNode;
      }
   }

   private _canBeCounted(item: TreeItem<Model>): boolean {
      // считаем все не подгруженные записи, т.к. мы не знаем их тип
      if (!item) {
         return true;
      }

      if (!this._canBeSelected(item)) {
         return false;
      }

      if (item.isRoot()) {
         return false;
      }

      const isNode = this._isNode(item);
      switch (this._selectionCountMode) {
         case 'leaf':
            return !isNode;
         case 'node':
            return isNode;
         case 'all':
         default:
            return true;
      }
   }

   private _validateOptions(options: ITreeSelectionStrategyOptions): void {
      if (options.selectionCountMode === 'leaf') {
         if (options.selectionType === 'node' && options.recursiveSelection === false) {
            throw Error('Не правильно заданы опции множественного выбора. Запрещено выбирать листья, но нужно их считать. ' +
                'Обратить внимание на опции: selectionCountMode, selectionType, recursiveSelection');
         }
      }
      if (options.selectionCountMode === 'node' && options.selectionType === 'leaf') {
         throw Error('Не правильно заданы опции множественного выбора. Запрещено выбирать узлы, но нужно их считать. ' +
             'Обратите внимание на опции: selectionCountMode, selectionType');
      }
   }
}
