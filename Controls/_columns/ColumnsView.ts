/**
 * Списочный контрол, который позволяет расположить записи в нескольких столбцах в зависимости от доступной ширины.
 *
 * @remark
 * Переменные тем оформления:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_columns.less набор переменных columns}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_list.less набор переменных list}
 *
 * @class Controls/columns:View
 * @extends UI/Base:Control
 * @implements Controls/list:IListNavigation
 * @implements Controls/interface:ISource
 * @implements Controls/interface/IPromisedSelectable
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/list:IList
 * @implements Controls/interface:IItemPadding
 * @implements Controls/itemActions:IItemActions
 * @implements Controls/list:IEditableList
 * @implements Controls/interface:ISorting
 * @implements Controls/interface:IDraggable
 * @implements Controls/interface/IGroupedList
 * @implements Controls/list:IClickableView
 * @implements Controls/list:IReloadableList
 * @implements Controls/list:IMovableList
 * @implements Controls/list:IRemovableList
 * @implements Controls/list:IVirtualScroll
 * @implements Controls/marker:IMarkerList
 * @author Авраменко А.С.
 * @public
 * @example
 * Пример базовой конфигурации:
 * <pre class="brush: html;">
 * <Controls.columns:View
 *     keyProperty="id"
 *     source="{{_viewSource}}" />
 * </pre>
 * @demo Controls-demo/list_new/ColumnsView/Default/Index
 */

/**
 * @name Controls/columns:View#itemTemplateProperty
 * @cfg {String} Имя поля элемента, которое содержит имя {@link Controls/columns:View#itemTemplate шаблона отображения элемента}. С помощью этой настройки отдельным элементам можно задать собственный шаблон отображения.
 * @demo Controls-demo/list_new/ColumnsView/CustomTemplate/Index
 * @remark
 * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/columns:View#itemTemplate itemTemplate}.
 * @see Controls/columns:View#itemTemplate
 */

/**
 * @name Controls/columns:View#itemTemplate
 * @cfg {Base/Ui:TemplateFunction|String} Шаблон элемента многоколоночного списка.
 * @remark
 * По умолчанию используется шаблон "Controls/columns:ItemTemplate".
 *
 * Базовый шаблон itemTemplate поддерживает следующие параметры:
 * * contentTemplate {Function} — Шаблон содержимого элемента;
 * * highlightOnHover {Boolean} — Выделять элемент при наведении на него курсора мыши.
 * * shadowVisibility {'visible'|'hidden'} - Видимость тени вокруг записи. По умолчанию 'visible'.
 * * cursor {TCursor} — Устанавливает вид {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора мыши} при наведении на строку.
 *
 * В области видимости шаблона доступен объект item, позволяющий получить доступ к данным рендеринга (например, элемент, ключ и т.д.).
 * @example
 * <pre class="brush: html; highlight: [5,6,7,8,9,10,11]">
 * <Controls.columns:View
 *     keyProperty="id"
 *     source="{{_viewSource}}">
 *     <ws:itemTemplate>
 *         <ws:partial template="Controls/columns:ItemTemplate">
 *             <ws:contentTemplate>
 *                 {{itemTemplate.item.getContents().get('title')}}
 *             </ws:contentTemplate>
 *         </ws:partial>
 *     </ws:itemTemplate>
 * </Controls.columns:View>
 * </pre>
 */

/**
 * @name Controls/columns:View#columnMinWidth
 * @cfg {Number} Минимальная ширина колонки.
 * @default 270
 * @example
 * <pre class="brush: html;">
 * <Controls.columns:View
 *     keyProperty="id"
 *     columnMinWidth="{{300}}"
 *     columnMaxWidth="{{500}}"
 *     source="{{ _viewSource }}"/>
 * </pre>
 * @see columnMaxWidth
 */

/**
 * @name Controls/columns:View#columnMaxWidth
 * @cfg {Number} Максимальная ширина колонки.
 * @default 400
 * @example
 * <pre class="brush: html;">
 * <Controls.columns:View
 *     keyProperty="id"
 *     columnMinWidth="{{300}}"
 *     columnMaxWidth="{{500}}"
 *     source="{{_viewSource}}"/>
 * </pre>
 * @see columnMinWidth
 */

/**
 * @name Controls/columns:View#initialWidth
 * @cfg {Number} Начальная ширина, которая будет использоваться для расчетов при первом построении.
 * @default undefined
 * @see columnsCount
 */

/**
 * @name Controls/columns:View#columnsCount
 * @cfg {Number} Используется для первого построения, если не задана опция {@link initialWidth}.
 * @default 2
 * @see initialWidth
 */

/**
 * @typedef {String} Controls/columns:View/ColumnsMode
 * @variant auto Автоматическое распределение записей по колонкам.
 * @variant fixed Каждая запись располагается в заранее определенную колонку.
 */

/**
 * @name Controls/columns:View#columnProperty
 * @cfg {String} Свойство элемента данных, содержащее индекс колонки (начиная с 0),
 * в которую будет распределен элемент при {@link columnsMode}: 'fixed'.
 * @default column
 */

/**
 * @name Controls/columns:View#columnsMode
 * @cfg {Controls/columns:View/ColumnsMode.typedef} Режим распределения записей по колонкам.
 * @default auto
 * @remark
 * Дополнительно необходимо задать значение для опции {@link columnProperty}, а также для каждого элемента данных в соответствующем поле указать номер колонки.
 */

/**
 * @typedef {String} Controls/columns:View/ItemPaddingEnum
 * @description Допустимые значения для свойств {@link Controls/tile:ITile.ItemPadding ItemPadding}.
 * @variant null Нулевой отступ.
 * @variant xs Очень маленький отступ.
 * @variant s Маленький отступ.
 * @variant m Средний отступ.
 * @variant l Большой отступ.
 * @variant xl Очень большой отступ.
 */

/**
 * @typedef {String} ItemPadding
 * @property {Controls/columns:View/ItemPaddingEnum.typedef} [top=m] Отступ сверху от записи. Если свойство принимает значение null, то отступ отсутствует.
 * @property {Controls/columns:View/ItemPaddingEnum.typedef} [bottom=m] Отступ снизу от записи. Если свойство принимает значение null, то отступ отсутствует.
 * @property {Controls/columns:View/ItemPaddingEnum.typedef} [left=m] Отступ слева от записи. Если свойство принимает значение null, то отступ отсутствует.
 * @property {Controls/columns:View/ItemPaddingEnum.typedef} [right=m] Отступ справа от записи. Если свойство принимает значение null, то отступ отсутствует.
 */

/**
 * @name Controls/columns:View#itemPadding
 * @cfg {Controls/columns:View/ItemPadding.typedef} конфигурация отступов между записями.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.columns:View source="{{_viewSource}}">
 *    <ws:itemPadding
 *       top="l"
 *       bottom="l"
 *       left="l"
 *       right="l"/>
 * </Controls.columns:View>
 * </pre>
 */
/**
 * @name Controls/columns:View#itemsContainerPadding
 * @cfg {Controls/columns:View/ItemPadding.typedef} конфигурация отступов между крайними записями и контейнером.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.columns:View source="{{_viewSource}}">
 *    <ws:itemsContainerPadding
 *       top="l"
 *       bottom="l"
 *       left="l"
 *       right="l"/>
 * </Controls.columns:View>
 * </pre>
 */
