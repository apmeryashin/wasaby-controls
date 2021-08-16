import coreMerge = require('Core/core-merge');
import entity = require('Types/entity');
import IRangeSelectable from './IRangeSelectable';
'use strict';

export type TSelectionType = 'range' | 'single' | 'quantum' | 'disable';

export interface IRangeSelectableOptions {
   selectionType: TSelectionType;
}

export interface IDateRangeSelectableOptions {
   ranges: {
      [key: string]: number[]
   };
}

/**
 * Интерфейс для выбора диапазона дат.
 * @interface Controls/_dateRange/interfaces/IDateRangeSelectable
 * @public
 * @author Красильников А.С.
 */
const selectionTypes = coreMerge({'quantum': 'quantum'}, IRangeSelectable.SELECTION_TYPES);
const minRange = {
   day: 'day',
   month: 'month'
};

export = {
   getDefaultOptions: function () {
      var options = IRangeSelectable.getDefaultOptions();

      /**
       * @typedef {Object} Controls/_dateRange/interfaces/IDateRangeSelectable/Ranges
       * @description Конфигурация диапазонов дат, которые доступны для выбора в контроле.
       * @property {Array.<number>} days Дни. Доступные значение: от 1 до 31.
       * @property {Array.<number>} weeks Недели. Доступные значение: от 1 до 4.
       * @property {Array.<number>} months Месяцы. Доступные значение: от 1 до 12.
       * @property {Array.<number>} quarters Кварталы. Доступные значение: от 1 до 4.
       * @property {Array.<number>} halfyears Полугодия. Доступные значение: от 1 до 2.
       * @property {Array.<number>} years Годы.
       */

      /**
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#ranges
       * @cfg {Controls/_dateRange/interfaces/IDateRangeSelectable/Ranges.typedef} Диапазон дат, который доступен для выбора.
       * @remark
       * Использование опции актуально, когда опция {@link selectionType} установлена в значение "quantum".
       * @default {}
       * @example
       * В данном примере можно выбрать либо 1 день, либо диапазон в 4 дня, либо 2 целые недели, либо 1 месяц.
       * <pre class="brush: html">
       * <!-- WML -->
       * <Controls.dateRange:RangeSelector ranges="{{ _ranges }}" />
       * </pre>
       * <pre class="brush: js">
       * // TypeScript
       * _beforeMount(): void {
       *     this._ranges = {days: [1,4], weeks: [2], months: [1] }
       * }
       * </pre>
       */
      options.ranges = {};

      /**
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#selectionType
       * @cfg {String} Режим выделения диапазона дат.
       * @variant range Выделение произвольного диапазона дат.
       * @variant single Выделение только одной даты.
       * @variant quantum Выделение ограниченного диапазона дат. Конфигурация такого диапазона задается в опции {@link ranges}.
       * @variant disable Выбор диапазона дат отключен.
       * @demo Controls-demo/datePopup/SelectionType/Index
       * @default quantum
       */

      /**
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#minRange
       * @cfg {String} Режим выбора диапазона дат.
       * @variant day Выбор периода из нескольких дней.
       * @variant month Выбор периода из нескольких месяцев.
       * @default day
       */

      /**
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#rangeSelectedCallback
       * @cfg {Function} Функция обратного вызова для определения отображаемого диапазона дат и выбора дат из выпадающей панели.
       * @remark
       * Функция вызывается во время начала ввода периода, конца ввода периода, во время передвижения курсора по календарю,
       * во время переходов к следующему/предыдущему диапазону (кликам по стрелкам).
       * Функция принимает 3 аргумента:
       * startValue — Начальное значение диапазона.
       * endValue — Конечное значение диапазона.
       * Если используются кванты, то в функцию будут передан рассчитанный по квантам диапазон.
       * Возвращаемым значением функции должен быть массив с двумя элементами, начальным и конечным значением диапазона [startValue, endValue].
       * @example
       * <pre class="brush: html">
       * <!-- WML -->
       * <Controls.dateRange:RangeSelector rangeSelectedCallback="{{_rangeSelectedCallback}}" />
       * </pre>
       * <pre class="brush: js">
       * // TypeScript
       * ...
       * private _rangeSelectedCallback(startValue: Date, endValue: Date): Date[] {
       *    return [new Date(startValue.getFullYear(), startValue.getMonth(), startValue.getDate() + 2),
       *        new Date(endValue.getFullYear(), endValue.getMonth(), endValue.getDate() + 4)];
       * }
       * ...
       * </pre>
       */

      /*
       * @name Controls/_dateRange/interfaces/IDateRangeSelectable#minRange
       * @cfg {String} Specifies the range selection mode
       * @variant 'day' selection mode period multiple days
       * @variant 'month' selection mode period multiple months
       */
      options.minRange = minRange.day;

      return options;
   },

   SELECTION_TYPES: selectionTypes,

   minRange,

   getOptionTypes: function () {
      var optionsTypes = IRangeSelectable.getOptionTypes();
      optionsTypes.selectionType = entity.descriptor(String).oneOf(Object.keys(selectionTypes));
      return optionsTypes;
   }
};
