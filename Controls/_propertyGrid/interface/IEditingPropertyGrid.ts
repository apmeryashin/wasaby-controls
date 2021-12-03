import {IItemEditOptions} from 'Controls/list';
import {TAsyncOperationResult} from 'Controls/editInPlace';

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/property-grid/ редактора свойств} с возможностью редактирования по месту.
 * @interface Controls/_propertyGrid/interface/IEditingPropertyGrid
 * @public
 * @author Аверкиев П.А.
 */
export interface IEditingPropertyGrid {
    /**
     * Запускает редактирование по месту.
     * Использование метода в редакторе свойств с режимом "только чтение" невозможно.
     * @function
     * @param {Controls/list:IItemEditOptions} options Параметры редактирования.
     * @returns {TAsyncOperationResult}
     * Promise разрешается после монтирования контрола в DOM.
     */
    beginEdit(options?: IItemEditOptions): TAsyncOperationResult;
}
