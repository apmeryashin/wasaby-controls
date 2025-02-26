/**
 * Интерфейс опций для контрола "Браузер".
 * @interface Controls/_browser/interface/IBrowser
 * @implements Controls/interface:ISource
 * @implements Controls/interface:ISearch
 * @implements Controls/interface:IFilter
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/interface:IHierarchy
 * @implements Controls/interface/IHierarchySearch
 * @implements Controls/interface:ISelectFields
 * @implements Controls/marker:IMarkerList
 * @implements Controls/scroll:IShadows
 * @implements Controls/interface:ISearchValue
 * @author Герасимов А.М.
 * @public
 */

/**
 * @name Controls/_browser/interface/IBrowser#fastFilterSource
 * @cfg {Array|Function|Types/collection:IList} Элемент или функция FastFilter, которая возвращает элемент FastFilter.
 */

/**
 * @name Controls/_browser/interface/IBrowser#filterButtonSource
 * @cfg {Array|Function|Types/collection:IList} Элемент или функция FilterButton, которая возвращает элемент FilterButton.
 */

/**
 * @name Controls/_browser/interface/IBrowser#historyId
 * @cfg {String} Идентификатор, под которым будет сохранена история фильтра.
 */

/**
 * @name Controls/_browser/interface/IBrowser#root
 * @cfg {Number|String} Идентификатор корневого узла. Значение опции root добавляется в фильтре в поле {@link Controls/interface:IHierarchy/#parentProperty parentProperty}.
 */

/**
 * @name Controls/_browser/interface/IBrowser#sourceControllerId
 * @cfg {String} Идентификатор, по которому будет получен sourceController из контекста.
 * @remark Опцию следует задавать, если в конексте передаётся несколько sourceController'ов
 */
