import {Model} from 'Types/entity';

const FILTER_SELECTION_FIELD = 'selection';
const SELECTION_MARKED_FIELD = 'marked';

/**
 * Модуль возвращает функцию, которую можно использовать в опции {@link Types/_source/Local#filter filter} для локальных источников данных,
 * используемых для списочных контролов на окнах выбора.
 *
 * @remark
 * Аргументы функции:
 *
 * * item: Model
 * * filter: object - текущий фильтр списочного контрола
 * * keyProperty: string - Имя свойства, содержащего информацию об идентификаторе переданной записи.
 *
 * @example
 * <pre class="brush: js">
 * var myMemory = new Memory({
 *    data: myData,
 *    keyProperty: 'id',
 *    filter: function(item, filter) {
 *       return memorySourceFilter(item, filter, 'id');
 *    }
 * })
 * </pre>
 *
 * @class Controls/_lookupPopup/List/Utils/memorySourceFilter
 * @public
 * @author Герасимов А.М.
 */

/*
 * Function that used for filtering {@link Types/_source/Memory} with selection in query filter.
 * @param {item} item
 * @param {Object} filter
 * @param {String} idProperty
 * @example
 * var myMemory = new Memory({
 *     data: myData,
 *     keyProperty: 'id',
 *     filter: function(item, filter) {
 *         return memorySourceFilter(item, filter, 'id');
 *     }
 * })
 * @returns {Boolean}
 */

function filter(item: Model, filterObj: object, idProperty: string): boolean {
   let result: boolean = true;
   let hasIdInMarked: boolean = false;

   if (filterObj[FILTER_SELECTION_FIELD]) {
      const itemId = item.get(idProperty);

      filterObj[FILTER_SELECTION_FIELD].get(SELECTION_MARKED_FIELD).forEach((markedId: string|number) => {
         if (!hasIdInMarked && String(markedId) === String(itemId)) {
            hasIdInMarked = true;
         }
      });
      result = hasIdInMarked;
   }

   return result;
}

export = filter;
