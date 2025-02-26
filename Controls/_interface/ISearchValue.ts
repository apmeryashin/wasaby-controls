export interface ISearchValueOptions {
    searchValue?: string;
}
/**
 * Интерфейс для контролов, поддерживающих поиск по значению.
 * @public
 * @author Герасимов А.М.
 */

export default interface ISearchValue {
    readonly '[Controls/_interface/ISearchValue]': boolean;
}

/**
 * @name Controls/_interface/ISearchValue#searchValue
 * @cfg {String} Задаёт значение, по которому производится поисковой запрос
 * @example
 * В этом примере в поисковой запрос будет отправлен текст "Ярославль".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.browser:Browser searchParam="city" searchValue="Ярославль"/>
 * </pre>
 * @remark Если опция передаётся в контрол, то необходимо обеспечить обновление опции при изменении поискового значения
 * с помощью "привязок" (bind) или через обновление в обработчике события searchValueChanged.
 */
