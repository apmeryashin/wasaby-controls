import { IDraggableCollection, IDraggableItem, IDragStrategy, IDragStrategyParams } from './interface';
import { SyntheticEvent } from 'UI/Vdom';
import { ItemsEntity } from 'Controls/dragnDrop';
import { ISelectionObject } from 'Controls/interface';
import { CrudEntityKey } from 'Types/source';
import { isEqual } from 'Types/object';
import {RecordSet} from 'Types/collection';
import {ISourceControllerOptions, NewSourceController} from 'Controls/dataSource';
import {process} from 'Controls/error';
import {factory} from 'Types/chain';
import { Model } from 'Types/entity';
import {TouchDetect} from 'Env/Touch';

type StrategyConstructor<P> = new (model: IDraggableCollection<P>, draggableItem: IDraggableItem) => IDragStrategy<P>;

/**
 * Контроллер, управляющий состоянием отображения драг'н'дропа
 * @class Controls/_listDragNDrop/Controller
 * @template P Тип объекта, обозначающего позицию
 * @public
 * @author Панихин К.А.
 */

export default class Controller<P> {
   private _model: IDraggableCollection<P>;
   private _strategy: IDragStrategy<P>;
   private _strategyConstructor: StrategyConstructor<P>;

   private _draggableItem: IDraggableItem;
   private _dragPosition: P;
   private _entity: ItemsEntity;

   constructor(model: IDraggableCollection<P>,
               draggableItem: IDraggableItem,
               strategyConstructor: StrategyConstructor<P>) {
      this._model = model;
      this._strategyConstructor = strategyConstructor;
      this._draggableItem = draggableItem;
      this._strategy = new this._strategyConstructor(this._model, this._draggableItem);
   }

   /**
    * Запускает отображение в списке начала драг н дропа.
    * Позволяет отобразить перетаскиеваемый элемент особым образом, отличным от остальных элементов.
    * @param {ItemsEntity} entity - сущность перемещения, содержит весь список перемещаемых записей
    */
   startDrag(entity: ItemsEntity): void {
      this._entity = entity;
      this._model.setDraggedItems(this._draggableItem, entity.getItems());
   }

   /**
    * Отображает перетаскиваемые сущности в указанной позиции списка
    * @param position Позиция в которой надо отобразить перемещаемые записи
    * @return {boolean} Изменилась ли позиция
    */
   setDragPosition(position: P): boolean {
      if (isEqual(this._dragPosition, position)) {
         return false;
      }

      this._dragPosition = position;
      this._model.setDragPosition(position);
      return true;
   }

   /**
    * Возвращает перетаскиваемый элемент
    */
   getDraggableItem(): IDraggableItem {
      return this._draggableItem;
   }

    /**
     * Заканчивает драг'н'дроп в списке. Все записи отображаются обычным образом
     */
   endDrag(): void {
      this._draggableItem = null;
      this._dragPosition = null;
      this._entity = null;
      this._strategy = null;
      this._model.resetDraggedItems();
   }

   /**
    * Возвращает true если в данный момент происходит перемещение
    */
   isDragging(): boolean {
      return !!this._entity;
   }

   /**
    * Возвращает текущую позицию
    */
   getDragPosition(): P {
      return this._dragPosition;
   }

   /**
    * Возвращает сущность перемещаемых записей
    */
   getDragEntity(): ItemsEntity {
      return this._entity;
   }

   /**
    * Рассчитывает итоговую позицию для перемещения
    * @param params
    */
   calculateDragPosition(params: IDragStrategyParams<P>): P {
      if (!this._strategy) {
         throw new Error('Strategy was not created. Should be called Controller::startDrag');
      }

      return this._strategy.calculatePosition({ ...params, currentPosition: this._dragPosition });
   }

   /**
    * Возвращает ключи всех перетаскиваемых записей.
    * @remark
    * Если в selection лежат записи, которых нет в RecordSet, то за ними выполняется запрос на БЛ.
    * @param selection
    * @param items
    * @param options
    */
   getDraggableKeys(
       selection: ISelectionObject,
       options: ISourceControllerOptions
   ): Promise<CrudEntityKey[]> {

      const draggedKeys = this._strategy.getDraggableKeys(selection.selected);
      // Не выполянем запрос, если все выбранные записи уже есть в рекордсете
      if (draggedKeys.length >= selection.selected.length && !selection.excluded.length) {
         return Promise.resolve(draggedKeys);
      }

      const controller = new NewSourceController(options);
      return controller.reload()
          .then((list) => factory(list).toArray().map((it: Model) => it.getKey()))
          .catch((error) => process({error}).then(() => []));
   }

   /**
    * Проверяет можно ли начать перетаскивание
    * @param readOnly
    * @param itemsDragNDrop
    * @param canStartDragNDropOption
    * @param event
    * @param isDragging
    */
   static canStartDragNDrop(
       readOnly: boolean,
       itemsDragNDrop: boolean,
       canStartDragNDropOption: boolean | Function,
       event: SyntheticEvent<MouseEvent>,
       isDragging: boolean
   ): boolean {
      const target = event.target;
      const allowByTarget = target instanceof Element &&
              !target.closest('.controls-List_DragNDrop__notDraggable');
      return !readOnly &&
          !isDragging &&
          itemsDragNDrop &&
          (!canStartDragNDropOption || typeof canStartDragNDropOption === 'function' && canStartDragNDropOption()) &&
          allowByTarget &&
          (!event.nativeEvent || !event.nativeEvent.button) &&
          !TouchDetect.getInstance().isTouch();
   }

   /**
    * Возвращает выбранные элементы, где
    * в выбранные добавлен элемент, за который начали drag-n-drop, если он отсутствовал,
    * выбранные элементы отсортированы по порядку их следования в модели(по индексам перед началом drag-n-drop),
    * из исключенных элементов удален элемент, за который начали drag-n-drop, если он присутствовал
    *
    * @param model
    * @param selection
    * @param dragKey
    */
   static getSelectionForDragNDrop(
       model: IDraggableCollection,
       selection: ISelectionObject,
       dragKey: CrudEntityKey
   ): ISelectionObject {
      const allSelected = selection.selected.indexOf(null) !== -1;

      const selected = [...selection.selected];
      if (selected.indexOf(dragKey) === -1 && !allSelected) {
         selected.push(dragKey);
      }

      this._sortKeys(model, selected);

      const excluded = [...selection.excluded];
      const dragItemIndex = excluded.indexOf(dragKey);
      if (dragItemIndex !== -1) {
         excluded.splice(dragItemIndex, 1);
      }

      return {
         selected,
         excluded,
         recursive: false
      };
   }

   /**
    * Сортировать список ключей элементов
    * Ключи сортируются по порядку, в котором они идут в списке
    * @param model
    * @param keys
    * @private
    */
   private static _sortKeys(model: IDraggableCollection, keys: Array<number|string>): void {
      keys.sort((a, b) => {
         const indexA = model.getIndexByKey(a);
         const indexB = model.getIndexByKey(b);
         return indexA > indexB ? 1 : -1;
      });
   }
}
