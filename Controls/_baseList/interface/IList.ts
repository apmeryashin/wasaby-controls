import { TemplateFunction } from 'UI/Base';
import { IItemActionsOptions } from 'Controls/itemActions';
import { IMarkerListOptions } from 'Controls/marker';
import { IItemPaddingOptions, TOffsetSize } from 'Controls/interface';
import {Direction, IFontColorStyle, IItemTemplateOptions} from 'Controls/interface';
import {IMovableOptions} from './IMovableList';
import {RecordSet} from 'Types/collection';
import {TRowSeparatorVisibility} from 'Controls/display';

type TMultiSelectVisibility = 'visible'|'onhover'|'hidden';

type TListStyle = 'master'|'default';

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/list/ списков}.
 * @interface Controls/_list/interface/IList
 * @public
 * @author Авраменко А.С.
 */

/*ENG
 * Interface for lists.
 *
 * @interface Controls/_list/interface/IList
 * @public
 * @author Авраменко А.С.
 */

export interface IList extends
    IItemActionsOptions,
    IMarkerListOptions,
    IMovableOptions,
    IItemTemplateOptions,
    IItemPaddingOptions {
    rowSeparatorVisibility?: TRowSeparatorVisibility;
    attachLoadTopTriggerToNull?: boolean;
    emptyTemplate?: TemplateFunction | string;
    footerTemplate?: TemplateFunction | string;
    pagingLeftTemplate?: TemplateFunction|string;
    pagingRightTemplate?: TemplateFunction|string;
    multiSelectVisibility?: TMultiSelectVisibility;
    stickyMarkedItem?: boolean;
    uniqueKeys?: boolean;
    itemsReadyCallback?: (items: RecordSet) => void;
    dataLoadCallback?: (items: RecordSet, direction?: Direction) => void;
    dataLoadErrback?: (error: unknown) => void;
    style?: TListStyle;
    backgroundStyle?: string;
    hoverBackgroundStyle?: string;
    nodeConfig?: INodeConfig;

    pagingContentTemplate?: TemplateFunction | string;
    moreFontColorStyle?: IFontColorStyle;
    stickyHeader?: boolean;
    stickyGroup?: boolean;
    stickyResults?: boolean;
    itemsSpacing?: TOffsetSize;
}

/**
 * Интерфейс описывает структуру объекта конфигурации логики перезагрузки записи списка.
 * Который задается 2м аргументом в ф-ии {@link Controls/_list/interface/IList#reloadItem reloadItem} списков.
 *
 * @interface Controls/_list/interface/IReloadItemOptions
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IReloadItemOptions {
    /**
     * Метод с помощью которого будут запрошены данные с БЛ.
     */
    method?: 'read' | 'query';

    /**
     * Объект с метаданными, которые будут переданы в запросе к БЛ. Актуально указывать только в том случае если {@link Controls/_list/interface/IReloadItemOptions#method method} === 'read'.
     */
    readMeta?: object;

    /**
     * Определяет, как загруженный элемент будет применяться к коллекции.
     * Если параметр имеет значение true, элемент коллекции будет заменен загруженным элементом.
     * Если параметр имеет значение false (по умолчанию), загруженные элементы будут объединены в элемент коллекции.
     */
    replace?: boolean;

    /**
     * Определяет каким образом производить обновление записи в иерархических списках.
     * Если указано true, то будет отправлен запрос методом query на обновление всей иерархии которой принадлежит обновляемая запись.
     * В противном случае будет обновлена лишь сама запись.
     */
    hierarchyReload?: boolean;
}

/**
 * @name Controls/_list/interface/IList#stickyHeader
 * @cfg {Boolean} Прилипание {@link /doc/platform/developmentapl/interface-development/controls/list/grid/header/ шапки} при прокрутке {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ таблицы}. При включенной {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группировка элементов} опция задает прилипание {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/ заголовков групп} при прокрутке {@link /doc/platform/developmentapl/interface-development/controls/list/ списка}.
 * Если для шапки списка и заголовков групп нужно разное поведение при прокрутке, то с помощью опции {@link Controls/_list/interface/IList#stickyGroup stickyGroup} можно отдельно регулировать прилипание заголовков групп.
 * @demo Controls-demo/list_new/Grouped/NoSticky/Index В демо-примере для {@link /doc/platform/developmentapl/interface-development/controls/list/list/ плоского списка} опция stickyHeader установлена в значение false. Заголовок группы не прилипает при прокрутке списка.
 * @demo Controls-demo/list_new/Grouped/Sticky/Index В демо-примере для плоского списка опция stickyHeader установлена в значение true. Заголовок группы прилипает при прокрутке списка.
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#stickyGroup
 * @cfg {Boolean} При включенной {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/ группировке элементов} опция задает прилипание {@link /doc/platform/developmentapl/interface-development/controls/list/grouping/visual/ заголовков групп} при прокрутке {@link /doc/platform/developmentapl/interface-development/controls/list/ списка}.
 * При этом если опция явно не задана, то её значение приравнивается в значению опции {@link Controls/_list/interface/IList#stickyHeader stickyHeader}.
 * @default undefined
 */

/**
 * @name Controls/_list/interface/IList#stickyResults
 * @cfg {Boolean} Прилипание {@link /doc/platform/developmentapl/interface-development/controls/list/grid/results/ итогов} при прокрутке {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ таблицы}.
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#moreFontColorStyle
 * @cfg {Controls/interface:IFontColorStyle/TFontColorStyle.typedef} Опция управляет стилем цвета текста для {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/button-more/ кнопки "Ещё"}.
 * @default listMore
 * @see IFontColorStyle
 */

/**
 * @name Controls/_list/interface/IList#pagingContentTemplate
 * @cfg {String|TemplateFunction} Шаблон отображения слева от кнопки навигации. Используется для отображения {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/#button-number счетчика непрочитанных сообщений}.
 * @demo Controls-demo/list_new/Navigation/Paging/End/ContentTemplate/Index
 * @see pagingMode
 */

/**
 * @name Controls/_list/interface/IList#attachLoadTopTriggerToNull
 * @cfg {Boolean} При изначальной загрузке списка прижимать верхний триггер загрузки к нулевой позиции.
 * @remark
 * Позволяет при двусторонней навигации избегать повторной загрузки данных сразу после инициализации списка.
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#loadingIndicatorTemplate
 * @cfg {String|TemplateFunction} Определяет шаблон индикатора загрузки данных. В данный момент этот шаблон работает только для индикатора, который отображается при подгрузке по скролу.
 * @default Controls/list:LoadingIndicatorTemplate
 * @example
 * <pre class="brush: html; highlight: [3-10]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *     <ws:loadingIndicatorTemplate>
 *         <ws:partial template="Controls/list:ContinueSearchTemplate"
 *                     scope="{{loadingIndicatorTemplate}}">
 *             <ws:footerTemplate>
 *                 <div>Дополнительная информация при итеративном поиске</div>
 *             </ws:footerTemplate>
 *         </ws:partial>
 *     </ws:loadingIndicatorTemplate>
 * </Controls.list:View>
 * </pre>
 */

/**
 * @name Controls/_list/interface/IList#continueSearchTemplate
 * @cfg {String|TemplateFunction} Пользовательский шаблон, который отображается под кнопкой "{@link /doc/platform/developmentapl/interface-development/controls/list/navigation/portion-loading/#batch-filtration-search Продолжить поиск}".
 * @default Controls/list:ContinueSearchTemplate
 * @demo Controls-demo/list_new/Searching/PortionedSearch/Index
 */

/**
 * @name Controls/_list/interface/IList#emptyTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон отображения контрола без элементов.
 * @demo Controls-demo/list_new/EmptyList/Default/Index
 * @default undefined
 * @example
 * В следующем примере показана настройка шаблона отображения для пустого плоского списка.
 * <pre class="brush: html; highlight: [3-7]">
 * <!-- WML -->
 * <Controls.list:View source="{{_viewSource}}">
 *     <ws:emptyTemplate>
 *         <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xl" bottomSpacing="l">
 *             <ws:contentTemplate>Нет данных</ws:contentTemplate>
 *         </ws:partial>
 *     </ws:emptyTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Подробнее о настройка контрола без элементов читайте в соответствующих статьях для:
 *
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty/ плоского списка}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/grid/empty/ таблицы}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/empty/ дерева}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/empty/ дерева c колонками}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/empty/ плитки}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/empty/ иерархического проводника}
 * * {@link /doc/platform/developmentapl/interface-development/controls/extends/help-system/pages/ подсказки на пустых страницах}
 */

/*ENG
 * @name Controls/_list/interface/IList#emptyTemplate
 * @cfg {TemplateFunction|String} Template for the empty list.
 * @remark
 * We recommend to use default template for emptyTemplate: Controls/list:EmptyTemplate
 * The template accepts the following options:
 * - contentTemplate content of emptyTemplate
 * - topSpacing Spacing between top border and content of emptyTemplate
 * - bottomSpacing Spacing between bottom border and content of emptyTemplate
 * @demo Controls-demo/list_new/EmptyList/Default/Index
 * @example
 * <pre>
 *    <Controls.list:View source="{{_viewSource}}">
 *       <ws:emptyTemplate>
 *          <ws:partial template="Controls/list:EmptyTemplate" topSpacing="xl" bottomSpacing="l">
 *             <ws:contentTemplate>Нет данных</ws:contentTemplate>
 *          </ws:partial>
 *       </ws:emptyTemplate>
 *    </Controls.list:View>
 * </pre>
 */

/**
 * @name Controls/_list/interface/IList#footerTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон отображения подвала контрола.
 * @demo Controls-demo/list_new/FooterTemplate/Index
 * @remark
 * Подробнее о настройка подвала читайте в соответствующих статьях для:
 *
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/list/footer/ плоского списка}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/grid/footer/ таблицы}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/footer/ дерева}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/footer/ дерева c колонками}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tile/footer/ плитки}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/footer/ иерархического проводника}
 */

/*ENG
 * @name Controls/_list/interface/IList#footerTemplate
 * @cfg {TemplateFunction|String} Template that will be rendered below the list.
 * @demo Controls-demo/list_new/FooterTemplate/Index
 */

/**
 * @name Controls/_list/interface/IList#pagingLeftTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон для отображения слева от {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/ постраничной навигации}.
 * @demo Controls-demo/list_new/Navigation/Paging/LeftTemplate/Index
 * @see pagingRightTemplate
 */

/*ENG
 * @name Controls/_list/interface/IList#pagingLeftTemplate
 * @cfg {TemplateFunction|String} Template to display to the left of page navigation.
 */

/**
 * @name Controls/_list/interface/IList#pagingRightTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон для отображения справа от {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/ постраничной навигации}.
 * @demo Controls-demo/list_new/Navigation/Paging/Position/RightTemplate/Index
 * @see pagingLeftTemplate
 */

/*ENG
 * @name Controls/_list/interface/IList#pagingRightTemplate
 * @cfg {TemplateFunction|String} Template to display to the right of page navigation.
 */

/**
 * @name Controls/_list/interface/IList#multiSelectTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон множественного выбора.
 * @demo Controls-demo/list_new/MultiSelect/CircleTemplate/Index
 * @description
 * Доступны следующие платформенные шаблоны множественного выбора:
 * 1. Controls/list:MultiSelectTemplate - множественный выбор при помощи чекбоксов (по умолчанию)
 * 2. Controls/list:MultiSelectCircleTemplate - множественный выбор при помощи radiobutton
 */

/**
 * @name Controls/_list/interface/IList#multiSelectVisibility
 * @cfg {String} Видимость {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ чекбоксов}.
 * @variant visible Показать.
 * @variant hidden Скрыть.
 * @variant onhover Показывать при наведении.
 * @default hidden
 * @demo Controls-demo/list_new/MultiSelect/MultiSelectVisibility/OnHover/Index
 * @see multiSelectAccessibilityProperty
 * @see multiSelectPosition
 */

/*ENG
 * @typedef {String} Controls/_list/interface/IList/MultiSelectVisibility
 * @variant visible Show.
 * @variant hidden Do not show.
 * @variant onhover Show on hover.
 */

/*ENG
 * @name Controls/_list/interface/IList#multiSelectVisibility
 * @cfg {String} Whether multiple selection is enabled.
 * @demo Controls-demo/list_new/MultiSelect/MultiSelectVisibility/OnHover/Index
 * @default hidden
 */

/**
 * @name Controls/_list/interface/IList#multiSelectPosition
 * @cfg {String} Позиционирование {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ чекбокса}.
 * @variant custom Позиционирование чекбокса в произвольном месте пользовательского шаблона. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/position/ здесь}.
 * @variant default Стандартная позиция чекбоксов множественного выбора в начале строки.
 * @demo Controls-demo/list_new/MultiSelect/CustomPosition/Index
 * @default default
 * @see multiSelectAccessibilityProperty
 * @see multiSelectVisibility
 */

/*ENG
 * @name Controls/_list/interface/IList#multiSelectPosition
 * @cfg {String} Position of multiple selection checkboxes
 * @demo Controls-demo/list_new/MultiSelect/CustomPosition/Index
 * @default default
 * @variant custom A custom position for the multiple selection checkboxes. With this option value, the multiple selection template is passed to the item template and can be displayed anywhere in it
 * @variant default The standard position of the multiple selection checkboxes (at the beginning of the line)
 */

/**
 * @name Controls/_list/interface/IList#multiSelectAccessibilityProperty
 * @cfg {Controls/display:MultiSelectAccessibility} Имя поля записи, в котором хранится состояние видимости {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ чекбокса}.
 * @remark Подробная настройка функционала описана {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/read-only/ здесь}.
 * @demo Controls-demo/list_new/ItemTemplate/MultiSelectAccessibilityProperty/Index
 * @see multiSelectVisibility
 * @see multiSelectPosition
 */

/**
 * @name Controls/_list/interface/IList#allowMultiSelect
 * @cfg {boolean} Позволяет включать/выключать выделение в списке.
 * @remark
 * Если передана опция selectedKeys, то выделение включено независимо от данной опции.
 * Рекомендуется использовать, если список ни при каких условиях не поддерживает выделение.
 * Стандартный пример использования: отключить анимацию отметки записи на тач устройствах, если список не поддерживает выделение.
 * @default true
 * @see multiSelectVisibility
 * @see multiSelectPosition
 */

/**
 * @name Controls/_list/interface/IList#stickyMarkedItem
 * @cfg {Boolean} Позволяет включать/отключать прилипание выбранного элемента.
 * @remark
 * Опция актуальна только для стиля "Мастер".
 * @see style
 * @default true
 */

/**
 * @name Controls/_list/interface/IList#itemsReadyCallback
 * @cfg {Function} Функция, которая вызывается, когда экземпляр данных получен из источника и подготовлен к дальнейшей обработке контролом.
 * Функция вызывается единожды в рамках {@link /doc/platform/developmentapl/interface-development/ui-library/control/#life-cycle-phases жизненного цикла} на этапе mount.
 * @markdown
 * @remark
 * Единственный аргумент функции — **items** с типом данных {@link Types/collection:RecordSet}, где содержатся загруженные данные.
 * @example
 * В качестве примера используем функцию для того, чтобы сохранить ссылку на items, чтобы иметь возможноcть изменять items далее.
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.list:View
 *    source="{{_viewSource}}"
 *    itemsReadyCallback="{{_myItemsReadyCallback}}" />
 * </pre>
 * <pre class="brush:js">
 * _myItemsReadyCallback = function(items) {
 *    this._myItems = items;
 * }
 * </pre>
 * <pre class="brush:js">
 * deleteButtonClickHandler: function{
 *    this._myItems.removeAt(0);
 * }
 * </pre>
 * @see dataLoadCallback
 * @see dataLoadErrback
 */

/**
 * @name Controls/_list/interface/IList#style
 * @cfg {String} Режим отображения списка.
 * @variant master Двухколоночный реестр.
 * @variant default Плоский список.
 * @default default
 */

/*ENG
 * @name Controls/_list/interface/IList#style
 * @cfg {String} Control styling
 * @variant master Stylizes control as MasterDetail
 * @variant default Simple list
 * @default default
 */

/**
 * @typedef {String} Controls/_list/interface/IList/ReloadType
 * @variant query Элемент будет перезагружен с помощью метода "Поисковый запрос".
 * @variant read Элемент будет перезагружен с помощью метода "Прочитать".
 */

/*ENG
 * @typedef {String} Controls/_list/interface/IList/ReloadType
 * @variant query Item will be reloaded with query method
 * @variant read Item will be reloaded with read method
 */

/**
 * Загружает модель из {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}, объединяет изменения в текущих данных и отображает элемент.
 * @function Controls/_list/interface/IList#reloadItem
 * @param {String|Number} key Идентификатор элемента коллекции, который должен быть перезагружен из источника.
 * @param {Controls/_list/interface/IReloadItemOptions} options Настройки перезагрузки итема.
 * @remark Возвращаемый результат зависит от указанного в options значения {@link Controls/_list/interface/IReloadItemOptions#method method}.
 * При значении 'read' возвращается запрошенная запись, а при значении 'query' возвращается RecordSet с дочерними элементами для загруженного узла.
 * @returns {Promise<Model | RecordSet>} В случае успешной загрузки возвращается запрошенная запись или RecordSet с дочерними элементами для загруженного узла.
 * @example
 * <pre class="brush: js">
 * _itemUpdated: function(id) {
 *    var list = this._children.myList;
 *    list.reloadItem(id);
 * }
 * </pre>
 */

/**
 * Возвращает рекордсет, на основании которого в данный момент строится список.
 * @function Controls/_list/interface/IList#getItems
 * @return {RecordSet} Список элементов.
 * @example
 * <pre class="brush: js">
 * _getItems(): RecordSet {
 *    var list = this._children.myList;
 *    return list.getItems();
 * }
 * </pre>
 */

/**
 * Прокручивает список к указанному элементу.
 * @function Controls/_list/interface/IList#scrollToItem
 * @param {String|Number} key Идентификатор элемента коллекции, к которому происходит прокручивание.
 * @param {String} [position='top'] Целевое положение элемента, к которому происходит скроллирование. Допустимые значения: top, bottom, center.
 * @param {Boolean} [force=false] Определяет форсированность скролла. Если true, то подскролл произойдет в любом случае. Если false, то подскролл произойдет только в случае, если элемент частично или полностью скрыт за пределами области прокрутки.
 * @demo Controls-demo/list_new/VirtualScroll/ConstantHeights/ScrollToItem/Index В следующем примере под списком находится кнопка, при клике по которой вызывается обработчик и метод scrollToItem().
 * @example
 * Вызов следующего метода расположит целевой элемент у верхней границы вьюпорта.
 * <pre class="brush: js">
 * protected _scrollToItem(event: SyntheticEvent, id: number): void {
 *     this._children.list.scrollToItem(id, false, true);
 * }
 * </pre>
 */

/*ENG
 * Loads model from data source, merges changes into the current data and renders the item.
 * @function Controls/_list/interface/IList#reloadItem
 * @param {String|Number} key Identifier of the collection item, that should be reloaded from source.
 * @param {Controls/_list/interface/IReloadItemOptions} options reload config.
 * @example
 * <pre class="brush: js">
 * _buttonClick: function() {
 *    var list = this._children.myList;
 *    list.scrollToItem(this._firstItemKey);
 * }
 * </pre>
 */

/**
 * @name Controls/_list/interface/IList#backgroundStyle
 * @cfg {String} {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/ Префикс стиля для настройки фона} внутренних компонентов списочного контрола с фиксированным или абсолютным позиционированием.
 * @variant master Предназначен для настройки фона masterDetail (Берётся из свойства style)
 * @variant infoBox Предназначен для настройки фона infoBox.
 * @variant stack Предназначен для настройки фона стековой панели.
 * @variant detailContrast
 * @variant listItem
 * @variant stackHeader
 * @variant default фон списка по умолчанию
 * @default default
 * @remark
 * Согласно {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/ документации} поддерживаются любые произвольные значения опции.
 */

/*ENG
 * @name Controls/_list/interface/IList#backgroundStyle
 * @cfg {String} Style prefix to configure background for inner list control components with static or absolute positioning.
 * @default default (theme background)
 */

/**
 * @name Controls/_list/interface/IList#rowSeparatorSize
 * @cfg {String} Высота {@link /doc/platform/developmentapl/interface-development/controls/list/grid/separator/#row линии-разделителя строк}.
 * @variant s Размер тонкой линии-разделителя.
 * @variant l Размер толстой линии-разделителя.
 * @variant null Без линии-разделителя. Значение передается строкой.
 * @default null
 */

/*
 * @name Controls/_list/interface/IList#rowSeparatorSize
 * @cfg {String} set row separator height.
 * @variant s Thin row separator line.
 * @variant l Wide row separator line.
 * @variant null Without row separator line
 * @default null
 */

/**
 * @name Controls/_list/interface/IList#rowSeparatorVisibility
 * @cfg {Controls/display:TRowSeparatorVisibility} Настройка видимости {@link /doc/platform/developmentapl/interface-development/controls/list/grid/separator/#row линий-разделителей строк} по краям и внутри списка.
 * @default all
 */

/**
 * @name Controls/_list/interface/IList#hoverBackgroundStyle
 * @cfg {String} {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/#hover Стиль подсветки строки} при наведении курсора мыши.
 * @default default
 * @remark
 * Позволяет определить произвольный фон записи при наведении.
 * Для отключения цвета при наведении используйте значение "transparent"
 * Для определения собственных цветов при наведении, необходимо указать специальный hoverBackgroundStyle, а
 * также определить в своем less-файле стиль controls-ListView__item_highlightOnHover_@{yourBackgroundStyle}.
 * @example
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.list:View
 *    source="{{_viewSource}}"
 *    hoverBackgroundStyle="primary" />
 * </pre>
 */

/**
 * @name Controls/_list/interface/IList#roundBorder
 * @cfg {Controls/_interface/IRoundBorder} Cкругление углов элемента списка.
 * @description
 * В настоящий момент поддерживается для плоского списка поддерживается только для шаблона Controls/listTemplates:ListItemTemplate.
 * Также устанавливает скругление углов для блока операций над записью.
 */

/**
 * @name Controls/_list/interface/IList#urlProperty
 * @cfg {String} Имя поля записи, в котором содержится ссылка для открытия в новой вкладке.
 * @default url
 */

/**
 * @name Controls/_list/interface/IList#fadedKeys
 * @cfg {Array.<String|number>|undefined} Массив с идентификаторами высвеченных записей.
 * @default undefined
 */

/**
 * @name Controls/_list/interface/IList#stickyCallback
 * @cfg {String} Функция обратного вызова для определения залипания элемента списка.
 * В зависимости от возвращаемого значения может контролировать залипание элемента списка:
 * <ul>
 *     <li>top - элемент списка залипает только у верхней границы списка</li>
 *     <li>bottom - элемент списка залипает только у нижней границы списка</li>
 *     <li>topBottom - элемент списка залипает и у верхней и у нижней границы списка</li>
 * </ul>
 * @demo Controls-demo/list_new/StickyCallback/Index
 */

/**
 * @name Controls/_list/interface/IList#stickyFooter
 * @cfg {Boolean} Закрепляет {@link /doc/platform/developmentapl/interface-development/controls/list/list/footer/ подвал} списка.
 * @default false
 */

/**
 * @name Controls/_list/interface/IList#itemsSpacing
 * @cfg {TOffsetSize} Размер отступа между записями списка
 * @default undefined
 */

/**
 * @typedef {String} Controls/_list/interface/IList/ButtonName
 * @description Допустимые значения для аргумента события {@link Controls/list:IList#pagingArrowClick pagingArrowClick}.
 * @variant Begin Кнопка "В начало".
 * @variant End Кнопка "В конец".
 */

/**
 * @event Происходит при клике по кнопкам перехода к первой и последней странице.
 * @name Controls/_list/interface/IList#pagingArrowClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Controls/_list/interface/IList/ButtonName.typedef} buttonName Кнопка, по которой кликнули.
 */

/**
 * @event Происходит при изменении лимита при выборе записей пачками в ПМО.
 * @name Controls/_list/interface/IList#selectedLimitChanged
 * @param {UICommon/Events:SyntheticEvent<Event>} event Дескриптор события.
 * @param {Number} limit Лимит на количество записей.
 * @example
 * В следующем примере показано, как подписаться на событие изменения лимита и обработать его.
 * Требуется для того, чтобы в дальнейшем передать лимит на БЛ, т.к. выбрано записей может быть больше, чем загружено.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View on:selectedLimitChanged="selectedLimitChanged()"/>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * class MyClass {
 *    private _limit: number;
 *
 *    protected selectedLimitChanged(e: Event, limit: number) {
 *       this._limit = limit;
 *    }
 * }
 * </pre>
 */

/**
 * @event Происходит в момент, когда курсор оказывается над элементом списка.
 * @name Controls/_list/interface/IList#itemMouseEnter
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, на которую был наведен курсор.
 * @param {UICommon/Events:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Occurs when the cursor is over the list item.
 * @name Controls/_list/interface/IList#itemMouseEnter
 * @param {UICommon/Events:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor was over.
 * @param {UICommon/Events:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Происходит в момент, когда курсор уходит за пределы элемента списка.
 * @name Controls/_list/interface/IList#itemMouseLeave
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, за пределы которой ушел курсор.
 * @param {UICommon/Events:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Occurs when the cursor leaves the list item.
 * @name Controls/_list/interface/IList#itemMouseLeave
 * @param {UICommon/Events:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor was over.
 * @param {UICommon/Events:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Происходит в момент, когда курсор двигается по элементам списка.
 * @name Controls/_list/interface/IList#itemMouseMove
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр записи, по которой двигается курсор.
 * @param {UICommon/Events:SyntheticEvent} nativeEvent Дескриптор события мыши.
 */

/*ENG
 * @event Occurs when the cursor moves over list items.
 * @name Controls/_list/interface/IList#itemMouseMove
 * @param {UICommon/Events:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item that the cursor is moving along.
 * @param {UICommon/Events:SyntheticEvent} nativeEvent Descriptor of the mouse event
 */

/**
 * @event Происходит при долгом тапе на элементе списка на touch устройствах.
 * @name Controls/_list/interface/IList#itemLongTap
 * @param {UICommon/Events:SyntheticEvent} event Дескриптор события.
 * @param {Types/entity:Record} item Элемент, на котором произошёл долгий тап.
 * @param {Object} nativeEvent Объект нативного события браузера.
 */

/**
 * @event Происходит в момент нажатия на кнопку мыши над элементом списка.
 * @name Controls/_list/interface/IList#itemMouseDown
 * @param {UICommon/Events:SyntheticEvent} event Дескриптор события.
 * @param {Types/entity:Record} item Элемент, над которым произошло нажатие на кнопку мыши.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @remark
 * От события {@link Controls/_list/interface/IClickableView#itemClick itemClick} данное событие отличается следующим:
 *
 * 1. Происходит при нажатии на любую кнопку мыши (левую, правую, среднюю);
 * 2. Происходит в момент нажатия кнопки (itemClick срабатывает уже после её отпускания).
 */

/**
 * @event Происходит при {@link /doc/platform/developmentapl/interface-development/controls/list/actions/swipe/ свайпе} на элементе списка.
 * @name Controls/_list/interface/IList#itemSwipe
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр элемента списка, по которому производим свайп.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @remark
 * Событие стреляет всегда, вне зависимости от того, обработано оно платформой или нет.
 */

/*ENG
 * @event Occurs when list item is swiped.
 * @name Controls/_list/interface/IList#itemSwipe
 * @param {UICommon/Events:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the swiped item.
 * @param {Object} nativeEvent Descriptor of the original event. It is useful if you want to get direction or target.
 * @remark
 * This event fires anyway, despite on handling in list.
 */

/**
 * @event Происходит при наведении курсора мыши на элемент списка.
 * @name Controls/_list/interface/IList#hoveredItemChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Экземпляр элемента, на который наводим курсор.
 * @param {HTMLElement} itemContainer Контейнер элемента.
 */

/**
 * @event Происходит при смене активного элемента в процессе скроллирования.
 * @name Controls/_list/interface/IList#activeElementChanged
 * @param {UICommon/Events:SyntheticEvent<Event>} event Дескриптор события.
 * @param {String} key Ключ активного элемента.
 * @remark Активным элементом считается последний элемент, который находится выше середины вьюпорта.
 * Для высчитывания активного элемента в списочном контроле должен быть включен виртуальный скроллинг.
 * @see shouldCheckActiveElement
 */

/*ENG
 * @event The event fires when the user hovers over a list item with a cursor.
 * @name Controls/_list/interface/IList#hoveredItemChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} item Instance of the item whose action was clicked.
 * @param {HTMLElement} itemContainer Container of the item.
 */

/**
 * @event Происходит при отрисовке очередного набора данных.
 * @name Controls/_list/interface/IList#drawItems
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */

/*ENG
 * @event Occurs when the next batch of data is drawn.
 * @name Controls/_list/interface/IList#drawItems
 * @param {UICommon/Events:SyntheticEvent} eventObject The event descriptor.
 */

/**
 * @event Происходит при активации элемента.
 * @name Controls/_list/interface/IList#itemActivate
 * @param {UICommon/Events:SyntheticEvent} event Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому кликнули.
 * @param {Object} nativeEvent Объект нативного события браузера.
 * @param {Number} columnIndex Индекс колонки, по которой кликнули. Параметр актуален только для {@link Controls/grid:View} и {@link Controls/treeGrid:View}.
 * @remark
 * Активация происходит при клике по элементу.
 * Событие не происходит, если:
 *
 * * элемент нельзя отметить {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркером}.
 * * при клике начинается {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}.
 */
