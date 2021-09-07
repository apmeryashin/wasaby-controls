/**
 * Интерфейс ответа после валидации.
 * @public
 * @author Красильников А.С.
 */

 export default interface IValidateResult {
    /** 
     * Массив ошибок.
     */
    [key: number]: boolean;
    /** 
     * Есть ли ошибки в результате валидации.
     */
    hasErrors?: boolean;
}