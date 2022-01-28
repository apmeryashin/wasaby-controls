import {ISelectionObject} from 'Controls/interface';

/**
 * Интерфейс контрола для удаления записей
 * @interface Controls/_list/interface/IRemovableList
 * @public
 * @author Аверкиев П.А.
 */

export interface IRemovableList {
    /**
     * Удаляет элементы из источника данных по идентификаторам элементов коллекции.
     * @function Controls/_list/interface/IRemovableList#removeItems
     * @param {Controls/interface:ISelectionObject} selection Объект, содержащий список ключей записей для удаления и список ключей записей, которые необходимо исключить при удалении.
     * @remark Если удаление состоялось, возвращаемый Promise содержит строку 'fullReload'
     * @returns {Promise<String | void>}
     */

    /*
     * Removes items from the data source by identifiers of the items in the collection.
     * @function Controls/_list/interface/IRemovableList#removeItems
     * @param {Controls/interface:ISelectionObject} selection Object containing a list of selected records for remove and a list of records, which must be excluded from removal.
     * @remark if one or more records were removed promise contains string result with 'fullReload' value
     * @returns {Promise<String | void>}
     */
    removeItems(selection: ISelectionObject): Promise<void | string>;

    /**
     * Удаляет с подтверждением элементы из источника данных по идентификаторам элементов коллекции.
     * @function Controls/_list/interface/IRemovableList#removeItemsWithConfirmation
     * @param {Controls/interface:ISelectionObject} selection Объект, содержащий список ключей записей для удаления и список ключей записей, которые необходимо исключить при удалении.
     * @remark Если удаление состоялось, возвращаемый Promise содержит строку 'fullReload'
     * @returns {Promise<String | void>}
     */

    /*
     * Removes items with confirmation from the data source by identifiers of the items in the collection.
     * @function Controls/_list/interface/IRemovableList#removeItemsWithConfirmation
     * @param {Controls/interface:ISelectionObject} selection Object containing a list of selected records for remove and a list of records, which must be excluded from removal.
     * @remark if one or more records were removed promise contains string result with 'fullReload' value
     * @returns {Promise<String | void>}
     */
    removeItemsWithConfirmation(selection: ISelectionObject): Promise<void | string>;
}
