/**
 * Утилита для простых операция с массивом, таких как:
 * - Получение индекса элемента
 * - Получение индекса элемента с проверкой по типу (String/Integer)
 * - Проверка наличия элемента в массиве
 */
interface IDifferenceArrays {
   added: any[];
   removed: any[];
}

const CONSTRUCTORS_FOR_TYPE_INVERTING = {
   string: Number,
   number: String
};

export = {
   addSubArray(array: any[], items: any[]): any[] {
      items.forEach((item) => {
         if (!this.hasInArray(array, item)) {
            array.push(item);
         }
      });

      return array;
   },

   removeSubArray(array: any[], items: any[]): any[] {
      let index: number;
      items.forEach((item) => {
         index = this.invertTypeIndexOf(array, item);
         if (index !== -1) {
            array.splice(index, 1);
         }
      });

      return array;
   },

   /**
    * Сравнивает два массива, возвращает разницу между ними
    * @param arrayOne
    * @param arrayTwo
    * @returns {{added: Array, removed: Array}}
    */
   getArrayDifference(arrayOne: any[], arrayTwo: any[]): IDifferenceArrays {
      const result: IDifferenceArrays = {};

      result.removed = arrayOne.filter((item) => {
         return !this.hasInArray(arrayTwo, item);
      });

      result.added = arrayTwo.filter((item) => {
         return !this.hasInArray(arrayOne, item);
      });

      return result;
   },

   hasInArray(array: any[], elem: unknown): boolean {
      return this.invertTypeIndexOf(array, elem) !== -1;
   },

   invertTypeIndexOf(array: any[], elem: unknown): number {
      let index: number = array.indexOf(elem);

      if (index === -1) {
         const elementType = typeof elem;

         // Данная утилита используется для операций с массивами,
         // в которых могут лежать любые типы данных.
         // Инвертировать тип необходимо только для строк и чисел.
         // Для остальных типов данных это не имеет смысла и только вызывает тормоза
         if (CONSTRUCTORS_FOR_TYPE_INVERTING[elementType]) {
            index = array.indexOf(CONSTRUCTORS_FOR_TYPE_INVERTING[elementType](elem));
         }
      }

      return index;
   },

   getIntersection(firstCollection, secondCollection) {
      return firstCollection.filter((key) => {
         return secondCollection.includes(key);
      });
   }
};
