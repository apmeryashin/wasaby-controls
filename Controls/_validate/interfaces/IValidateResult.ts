/**
 * Интерфейс ответа после валидации.
 * @public
 * @author Мочалов М.А.
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
