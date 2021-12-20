import {IItemEditOptions, IItemAddOptions} from 'Controls/list';
import {TAsyncOperationResult} from 'Controls/editInPlace';

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/property-grid/ редактора свойств} с возможностью редактирования по месту.
 * @interface Controls/_propertyGrid/interface/IEditingPropertyGrid
 * @public
 * @author Аверкиев П.А.
 */
export interface IEditingPropertyGrid {
    /**
     * Запускает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}.
     * Использование метода в редакторе свойств с режимом "только чтение" невозможно.
     * @function
     * @param {Controls/list:IItemEditOptions} options Параметры редактирования.
     * @returns {Controls/editInPlace:TAsyncOperationResult}
     * Promise разрешается после монтирования контрола в DOM.
     */
    beginEdit(options?: IItemEditOptions): TAsyncOperationResult;

    /**
     * Запускает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ добавление по месту}.
     * Использование метода в списке с режимом "только чтение" невозможно.
     * @function
     * @param {Controls/list:IItemAddOptions} options Параметры добавления.
     * @returns {Controls/editInPlace:TAsyncOperationResult}
     * @remark
     * Promise разрешается после монтирования контрола в DOM.
     * @see beginEdit
     */
    beginAdd(options?: IItemAddOptions): TAsyncOperationResult;
}
