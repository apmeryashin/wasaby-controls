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


/**
 * @name Controls/_browser/interface/IBrowser#dataLoadCallback
 * @cfg {Function} Функция, которая вызывается каждый раз непосредственно после загрузки данных из источника контрола.
 * @remark Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/source/#data-load-callback здесь}.
 */

/**
 * @name Controls/_browser/interface/IBrowser#dataLoadErrback
 * @cfg {Function} Функция обратного вызова для определения сбоя загрузки данных из источника.
 * @remark Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/source/#data-load-callback здесь}.
 */