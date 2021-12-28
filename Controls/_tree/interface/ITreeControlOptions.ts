import { IControlOptions, TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import {ISelectionCountModeOptions} from 'Controls/interface';
import {TExpanderIconSize, TExpanderIconStyle} from 'Controls/display';
import {IOptions as ITreeOptions} from 'Controls/tree';

type TNodeFooterVisibilityCallback = (item: Model) => boolean;

type TNodeLoadCallback = (list: RecordSet, nodeKey: number | string) => void;

export type TExpanderPosition = 'default'|'right'|'custom';

export interface ITreeControlOptions extends IControlOptions, ISelectionCountModeOptions, ITreeOptions {
    expandByItemClick?: boolean;
    expandedItems?: Array<number | string>;
    collapsedItems?: Array<number | string>;
    nodeFooterTemplate?: TemplateFunction;
    nodeFooterVisibilityCallback?: TNodeFooterVisibilityCallback;
    hasChildrenProperty?: string;
    searchBreadCrumbsItemTemplate?: TemplateFunction;
    expanderVisibility?: 'visible'|'hasChildren'|'hasChildrenOrHover';
    nodeMoreCaption?: string;
    nodeLoadCallback?: TNodeLoadCallback;
    deepReload?: boolean;
    selectAncestors?: boolean;
    selectDescendants?: boolean;
    markItemByExpanderClick?: boolean;
    expanderSize?: 's'|'m'|'l'|'xl';
    expanderIconSize?: TExpanderIconSize;
    expanderIconStyle?: TExpanderIconStyle;
    expanderPosition?: TExpanderPosition;
}

/**
 * Интерфейс для древовидных списков, например для контрола {@link Controls/treeGrid:View Дерево}.
 *
 * @interface Controls/_tree/interface/ITreeControl
 * @implements Controls/interface:IExpandedItems
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for tree-like lists.
 *
 * @interface Controls/_tree/interface/ITreeControl
 * @public
 * @author Авраменко А.С.
 */

/**
 * @typedef {String} Controls/_tree/interface/ITreeControl/HierarchyViewModeEnum
 * @variant tree Дерево.
 * @variant breadcrumbs Хлебные крошки.
 */

/*
 * @typedef {String} Controls/_tree/interface/ITreeControl/HierarchyViewModeEnum
 * @variant tree Tree-like view.
 * @variant breadcrumbs Just leaves, folders as paths.
 */

/**
 * @name Controls/_tree/interface/ITreeControl#itemTemplate
 * @cfg {Function} Пользовательский шаблон отображения элемента.
 * @default undefined
 * @markdown
 * @remark
 * Позволяет установить пользовательский шаблон отображения элемента. При установке шаблона **ОБЯЗАТЕЛЕН** вызов базового шаблона {@link Controls/tree:ItemTemplate}. Шаблон Controls/tree:ItemTemplate поддерживает {@link Controls/tree:ItemTemplate параметры}, с помощью которых можно изменить отображение элемента.
 *
 * Дополнительно о работе с шаблоном вы можете прочитать в {@link /doc/platform/developmentapl/interface-development/controls/list/tree/item/ руководстве разработчика}.
 * @example
 * <pre class="brush: html">
 * <Controls.tree:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tree:ItemTemplate" highlightOnHover="{{false}}" />
 *    </ws:itemTemplate>
 * </Controls.tree:View>
 * </pre>
 * @see Controls/_tree/interface/ITreeControl#itemTemplateProperty
 * @see Controls/tree:ItemTemplate
 */

/**
 * @name Controls/_tree/interface/ITreeControl#itemTemplateProperty
 * @cfg {String} Имя поля элемента, которое содержит Путь к {@link Controls/_tree/interface/ITreeControl#itemTemplate шаблону отображения элемента}. С помощью этой настройки отдельным элементам можно задать собственный шаблон отображения.
 * @remark
 * Если не задано значение в опции itemTemplateProperty или в свойстве элемента, то используется шаблон из {@link Controls/_tree/interface/ITreeControl#itemTemplate itemTemplate}.
 * @see Controls/_tree/interface/ITreeControl#itemTemplate
 */

/**
 * @name Controls/_tree/interface/ITreeControl#expandByItemClick
 * @cfg {Boolean} Развертывание узлов кликом по элементу в {@link Controls/treeGrid:View дереве с колонками}.
 * @default false
 * @variant true Развертывание происходит кликом по элементу, а также кликом по кнопке-экспандеру.
 * @variant false Развертывание происходит только кликом по {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/ кнопке-экспандеру}.
 * @see expandedItems
 * @see expanderVisibility
 */

/*
 * @name Controls/_tree/interface/ITreeControl#expandByItemClick
 * @cfg {Boolean} Defines the mode of node expanding.
 * @variant true Toggle node by click on it's whole area.
 * @variant false Toggle node by click on only it's expander.
 * @default false
 */

/**
 * @name Controls/_tree/interface/ITreeControl#collapsedItems
 * @cfg {Array.<String>|undefined} Идентификаторы свернутых узлов в {@link Controls/treeGrid:View дереве с колонками}.
 * @remark
 * Этот параметр используется, когда {@link expandedItems} установлена в значение [null].
 * @see expandedItems
 */

/*
 * @name Controls/_tree/interface/ITreeControl#collapsedItems
 * @cfg {Array.<String>|Array.<Number>} Array of identifiers of collapsed items.
 * This option is used only when the value of {@link Controls/_tree/interface/ITreeControl#expandedItems expandedItems} is [null].
 * @notice Without binding this option will be static. Use binding to allow expanding/collapsing nodes.
 * @example
 * <pre>
 *      <Controls.treeGrid:View
 *           bind:expandedItems="_expandedItems"
 *           bind:collapsedItems="_collapsedItems">
 *      </Controls.treeGrid:View>
 *  </pre>
 *  @see collapsedItems
 */

/**
 * @name Controls/_tree/interface/ITreeControl#nodeFooterTemplate
 * @cfg {TemplateFunction|String|Controls/tree:NodeFooterTemplate} Пользовательский шаблон подвала развернутого узла в {@link Controls/treeGrid:View дереве с колонками}.
 * @default undefined
 * @remark
 * В области видимости шаблона доступен объект **item**. Метод **item.getNode()** возвращает узел, внутри которого отображается шаблон.
 *
 * @demo Controls-demo/treeGridNew/NodeFooter/NodeFooterTemplate/Index
 * @see nodeFooterVisibilityCallback
 * @see nodeLoadCallback
 */

/*
 * @name Controls/_tree/interface/ITreeControl#nodeFooterTemplate
 * @cfg {Function} Sets footer template that will be shown for every node.
 * @demo Controls-demo/treeGridNew/NodeFooter/NodeFooterTemplate/Index
 */

/**
 * @name Controls/_tree/interface/ITreeControl#nodeMoreCaption
 * @cfg {String} Пользовательский текст кнопки, расположенной в узле дерева и предназначенной для загрузки очередной пачки данных узла.
 * @default undefined
 * @see nodeLoadCallback
 */

/**
 * @name Controls/_tree/interface/ITreeControl#nodeFooterVisibilityCallback
 * @cfg {Function} Функция обратного вызова для определения видимости шаблона подвала развернутого узла в {@link Controls/treeGrid:View дереве с колонками}.
 * @remark
 * Функция принимает единственный аргумент:
 *
 * * item — модель (см. {@link Types/entity:Model}), содержащая данные узла, для которого определяется видимость шаблона подвала.
 *
 * Для видимости шаблона подвала, из функции следует вернуть true.
 * @example
 * Шаблон подвал скрыт для узлов, у которых свойство footerVisible === false.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGrid:View
 *     attr:class="demo-Tree"
 *     source="{{_source}}"
 *     nodeFooterVisibilityCallback="{{_nodeFooterVisibilityCallback}}"
 *     ...
 * </Controls.list:View>
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * ...
 * private _nodeFooterVisibilityCallback(item: Model): boolean {
 *   return item.get('footerVisible') !== false;
 * }
 * ...
 * </pre>
 * @see nodeFooterTemplate
 * @see nodeLoadCallback
 */

/**
 * @name Controls/_tree/interface/ITreeControl#hasChildrenProperty
 * @cfg {String} Имя поля записи, в котором хранится информация о наличии дочерних элементов в узле {@link Controls/treeGrid:View дерева}.
 * @remark
 * Для работы опции hasChildrenProperty установите опцию {@link expanderVisibility} в значение "hasChildren" или "hasChildrenOrHover".
 */

/*
 * @name Controls/_tree/interface/ITreeControl#hasChildrenProperty
 * @cfg {String} Name of the field that contains information whether the node has children.
 */

/**
 * @name Controls/_tree/interface/ITreeControl#searchBreadCrumbsItemTemplate
 * @cfg {TemplateFunction|String} Пользовательский шаблон отображения элемента с хлебными крошками в {@link Controls/treeGrid:View дереве с колонками} при {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/view-mode/#search режиме поиска}.
 * @default undefined
 * @remark
 * По умолчанию используется базовый шаблон "Controls/treeGrid:SearchBreadCrumbsItemTemplate", который поддерживает следующий параметр:
 *
 * * checkboxReadOnly {Boolean} — флаг, позволяющий установить у checkbox в multiSelect режим "только для чтения".
 */

/*
 * @name Controls/_tree/interface/ITreeControl#searchBreadCrumbsItemTemplate
 * @cfg {TemplateFunction|String} Element template with breadcrumbs in a {@link Controls/treeGrid:View tree} in search mode.
 * @remark
 * The default template is "Controls/treeGrid:SearchBreadCrumbsItemTemplate".
 *
 * Template supports the following parameters:
 * - checkboxReadOnly {Boolean} — A flag that allows the checkbox to be set to read-only mode.
 */

/**
 * @typedef {String} Controls/_tree/interface/ITreeControl/ExpanderVisibility
 * @description Допустимые значения для опции {@link expanderVisibility}.
 * @variant visible Всегда показывать кнопку-экспандер для узлов и отступ для листьев.
 * @variant hasChildren Показывать кнопку-экспандер только для узлов с дочерними элементами. В этом значении опция, также, отключает отступ для листьев, если в текущей папке нет записей с дочерними элементами.
 * @variant hasChildrenOrHover Работает аналогично hasChildren, но в дополнение для узлов без дочерних элементов:
 * * показывает контурную кнопку-экспандер, если такой узел является развернутым.
 * * показывает контурную кнопку-экспандер, при наведении на свернутый узел.
 */

/**
 * @name Controls/_tree/interface/ITreeControl#expanderVisibility
 * @cfg {Controls/_tree/interface/ITreeControl/ExpanderVisibility.typedef} Режим отображения {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/expander/ кнопки-экспандера} в {@link Controls/treeGrid:View дереве с колонками}.
 * @default visible
 * @demo Controls-demo/treeGridNew/Expander/ExpanderIcon/Node/Index В следующем примере для контрола опция expanderVisibility установлена в значение visible.
 * @demo Controls-demo/treeGridNew/Expander/ExpanderVisibility/HasChildren/Index В следующем примере для контрола опция expanderVisibility установлена в значение hasChildren.
 * @demo Controls-demo/treeGridNew/Expander/ExpanderVisibility/HasChildrenOrHover/Index В следующем примере для контрола опция expanderVisibility установлена в значение hasChildrenOrHover.
 * @see expanderIcon
 * @see expanderSize
 */

/*
 * @name Controls/_tree/interface/ITreeControl#expanderVisibility
 * @cfg {String} Mode displaying expander indent.
 * @variant visible Always show expander for nodes and indentation for leaves.
 * @variant hasChildren Show expander only for nodes with children.
 * @variant hasChildrenOrHover Works similar to hasChildren. But in addition for nodes with no children:
 * <ul>
 *     <li>shows an outline expander if such a node is expanded</li>
 *     <li>shows an outline expander when hovering over a collapsed node</li>
 * </ul>
 * @default visible
 */

/**
 * @typedef {String} TExpanderPosition
 * @variant default Стандартное расположение иконки узла.
 * @variant right Расположение иконки узла справа.
 * @variant custom Произвольное расположение иконки узла. При данном значении опции, шаблон иконки передается в прикладной шаблон и может быть выведен в любом месте записи.
 */

/**
 * @name Controls/_tree/interface/ITreeControl#expanderPosition
 * @cfg {TExpanderPosition} Расположение иконки для узла и скрытого узла.
 * @default default
 * @demo Controls-demo/treeGrid/Expander/ExpanderPosition/Custom/Index В следующем примере для контрола опция expanderPosition установлена в значение custom.
 * @demo Controls-demo/treeGrid/Expander/ExpanderPosition/Right/Index В следующем примере для контрола опция expanderPosition установлена в значение right.
 */

/**
 * @name Controls/_tree/interface/ITreeControl#nodeLoadCallback
 * @cfg {Function} Функция обратного вызова для определения загрузки содержимого узла в {@link Controls/treeGrid:View дереве с колонками}.
 * @default undefined
 * @see nodeFooterTemplate
 * @see nodeFooterVisibilityCallback
 */

/*
 * @name Controls/_tree/interface/ITreeControl#nodeLoadCallback
 * @cfg {Function} Callback function that will be called when node data loaded by source.
 * @see nodeFooterTemplate
 * @see nodeFooterVisibilityCallback
 */

/**
 * @name Controls/_tree/interface/ITreeControl#deepReload
 * @cfg {Boolean} Определяет, нужно ли выполнять перезагрузку с сохранением развернутых узлов.
 * @description
 * Поробно про мультинавигацию можно прочесть в статьях:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/node/managing-node-expand/#multi-navigation Перезагрузка дерева с сохранением развернутых узлов},
 * * {@link /doc/platform/developmentapl/service-development/service-contract/logic/list/contract/#request-navigation-page-multinavigation Контракт списочного контрола},
 * * {@link /doc/platform/developmentapl/service-development/service-contract/logic/list/navigate/multinavigation/ Множественная навигация в списочных контролах}.
 *
 * @remark
 * Перезагрузка выполняется с сохранением развернутых узлов, даже при изменении опций filter, source, sorting и тд.
 * В поле фильтра, указанное в parentProperty будет отправлен массив развернутых узлов.
 * Если в результате запроса для этих узлов будут присланы дочерние элементы, то узлы останутся развернутыми, иначе они будут свёрнуты.
 * **Примечание.** Постраничная навигация в запросе передается для корня и её параметр {@link Controls/_interface/INavigation/INavigationPageSourceConfig.typedef pageSize} необходимо применять для всех узлов.
 * @example
 * Пример списочного метода БЛ
 * <pre class="brush: python">
 * def Test.MultiRoot(ДопПоля, Фильтр, Сортировка, Навигация):
 *      rs = RecordSet(CurrentMethodResultFormat())
 *      if Навигация.Type() == NavigationType.ntMULTI_ROOT:
 *          nav_result = {}
 *          for id, nav in Навигация.Roots().items():
 *              # Запрашиваем данные по одному разделу.
 *              Фильтр.Раздел = id
 *              tmp_rs = Test.MultiRoot(ДопПоля, Фильтр, Сортировка, nav)
 *              # Склеиваем результаты.
 *              for rec in tmp_rs:
 *                  rs.AddRow(rec)
 *              # Формируем общий результа навигации по всем разделам.
 *              nav_result[ id ] = tmp_rs.nav_result
 *          rs.nav_result = NavigationResult(nav_result)
 *      else:
 *          # Тут обработка обычной навигации, например, вызов декларативного списка.
 *          rs = Test.DeclList(ДопПоля, Фильтр, Сортировка, Навигация)
 *      return rs
 * </pre>
 * @see Controls/interface:IBasePositionSourceConfig#multiNavigation
 */

/**
 * @name Controls/_tree/interface/ITreeControl#selectAncestors
 * @cfg {Boolean} Определяет, будут ли отмечаться родительские узлы элементы при {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ отметке узла чекбоксом}.
 * @default true
 * @demo Controls-demo/treeGridNew/MultiSelect/SelectAncestors/DoNotSelectAncestors/Index
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGrid.View selectAncestors="{{false}}"/>
 * </pre>
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @see selectDescendants
 */

/**
 * @name Controls/_tree/interface/ITreeControl#selectDescendants
 * @cfg {Boolean} Определяет, будут ли отмечаться дочерние элементы при {@link /doc/platform/developmentapl/interface-development/controls/list/actions/multiselect/ отметке узла чекбоксом}.
 * @default true
 * @demo Controls-demo/treeGridNew/MultiSelect/SelectDescendants/DoNotSelectDescendants/Index
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGrid.View selectDescendants="{{false}}"/>
 * </pre>
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @see selectAncestors
 */

/**
 * @name Controls/_tree/interface/ITreeControl#markItemByExpanderClick
 * @cfg {Boolean} Определяет, нужно ли выделять узел {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркером}.
 * @default true
 * @remark Узел отмечается маркером при клике на иконку разворота узла, если значение true.
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @typedef {String} Controls/_tree/interface/ITreeControl/TOffset
 * @description Допустимые значения для опций, которые задают размер отступа.
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 */

/**
 * @name Controls/_tree/interface/ITreeControl#expanderSize
 * @cfg {Controls/_tree/interface/ITreeControl/TOffset.typedef} Размер области, который отведён под иконку узла или скрытого узла.
 * @default s
 * @remark
 * Опции expanderSize на контроле и {@link Controls/treeGrid:ItemTemplate#expanderSize expanderSize на шаблоне элемента} не являются взаимоисключающими.
 * Опция expanderSize на контроле определяет размер области, отведённой под иконку узла или скрытого узла для всего списка, включая автоматическую конфигурацию {@link nodeFooterTemplate шаблона подвалов узлов}.
 * Опция {@link Controls/treeGrid:ItemTemplate#expanderSize expanderSize на шаблоне элемента} приоритетнее, чем expanderSize на контроле.
 * В случае, если для разных элементов дерева заданы разные значения опции, то для корректного выравнивания подвалов узлов необходимо продублировать опцию на {@link nodeFooterTemplate шаблоне подвалов узлов}.
 * @see expanderIcon
 * @see expanderVisibility
 */

/**
 * @name Controls/_tree/interface/ITreeControl#expanderIcon
 * @cfg {String|undefined} Стиль отображения иконки для всех узлов и скрытых узлов дерева.
 * @variant none Иконки всех узлов и скрытых узлов не отображаются.
 * @variant node Иконки всех узлов и скрытых узлов отображаются как иконки узлов.
 * @variant hiddenNode Иконки всех узлов и скрытых узлов отображаются как иконки скрытых узлов.
 * @default undefined
 * @remark
 * Когда в опции задано undefined, используются иконки узлов и скрытых узлов.
 * Опции expanderIcon на контроле и {@link Controls/treeGrid:ItemTemplate#expanderIcon expanderIcon на шаблоне элемента} не являются взаимоисключающими.
 * Опции expanderIcon на контроле определяет стиль отображения иконки для узла и скрытого узла для всего списка, включая автоматическую конфигурацию {@link nodeFooterTemplate шаблона подвалов узлов}.
 * Опция {@link Controls/treeGrid:ItemTemplate#expanderIcon expanderIcon на шаблоне элемента} приоритетнее, чем expanderIcon на контроле.
 * В случае, если для разных элементов дерева заданы разные значения опции, то для корректного выравнивания подвалов узлов необходимо продублировать опцию на {@link nodeFooterTemplate шаблоне подвалов узлов}.
 * @see expanderSize
 * @see expanderVisibility
 */

/**
 * @name Controls/_tree/interface/ITreeControl#expanderIconStyle
 * @cfg {Controls/_display/interface/ITree/TExpanderIconStyle.typedef} Стиль цвета иконки разворота узлов дерева
 * @default default
 */

/**
 * @name Controls/_tree/interface/ITreeControl#expanderIconSize
 * @cfg {Controls/_display/interface/ITree/TExpanderIconSize.typedef} Размер иконки разворота узлов дерева
 * @default default
 */

/**
 * @name Controls/_tree/interface/ITreeControl#selectionType
 * @cfg {String} Тип записей, которые можно выбрать.
 * @default all
 * @variant node Только узлы доступны для выбора.
 * @variant leaf Только листья доступны для выбора.
 * @variant all Все типы записей доступны для выбора.
 * @remark Опция {@link Controls/_list/interface/IList#multiSelectAccessibilityProperty multiSelectAccessibilityProperty} преобладает над этой опцией
 */

/**
 * @name Controls/_tree/interface/ITreeControl#singleExpand
 * @cfg {Boolean} Режим единого развернутого узла.
 * @remark
 * В дереве можно задать такое поведение, при котором единовременно может быть развернут только один узел в рамках одного уровня иерархии. При развертывании нового узла предыдущий будет автоматически сворачиваться.
 * @default false
 * @variant true
 * @variant false
 * @demo Controls-demo/treeGridNew/ReverseType/SingleExpand/Index
 */

/**
 * @name Controls/_tree/interface/ITreeControl#getMarkedNodeKey
 * Возвращает ключ родителя, в котором по-умолчанию следует начинать добавление по месту.
 * @remark
 * Если в дереве маркер стоит на развернутом узле или на его дочерних записях/свёрнутых узлах,
 * то позиция по-умолчанию для добавляемой записи - этот раскрытый узел.
 * Во всех остальных случаях позицией будет текущий корень дерева.
 * @function
 * @returns {null|string|number}
 */

/**
 * @name Controls/_tree/interface/ITreeControl#source
 * @cfg {Types/source:ICrud|Types/source:ICrudPlus} Объект реализующий интерфейс {@link Types/source:ICrud}, необходимый для работы с источником данных.
 * @remark
 * Более подробно об источниках данных вы можете почитать {@link /doc/platform/developmentapl/interface-development/data-sources/ здесь}.
 * @example
 * В приведённом примере для контрола {@link Controls/list:View} в опцию source передаётся {@link Types/source:HierarchicalMemory} источник.
 * Контрол получит данные из источника и выведет их.
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.tree:View
 *    source="{{_viewSource}}"
 *    parentProperty="parent"
 *    nodeProperty="type" />
 * </pre>
 *
 * <pre class="brush: js">
 * import {HierarchicalMemory} from "Types/source";
 *
 * _source: null,
 * _beforeMount: function() {
 *     this._source = new HierarchicalMemory({
 *         keyProperty: 'key',
 *         parentProperty: 'parent',
 *         data: [
 *             {
 *                 key: '1',
 *                 title: 'Ярославль',
 *                 parent: null,
 *                 '@parent': true,
 *                 type: true,
 *                 hasChild: true
 *             },
 *             {
 *                 key: 11,
 *                 title: 'Smartphones1',
 *                 parent: 1,
 *                 type: true,
 *                 rating: '9.2',hasChild: true
 *             },
 *         ]
 *     });
 * }
 * </pre>
 * @see
 * @see Types/source:ICrud
 */

/**
 * @event Происходит после развертывания узла.
 * @name Controls/_tree/interface/ITreeControl#afterItemExpand
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @see beforeItemExpand
 */

/**
 * @event Происходит перед развертыванием узла.
 * @name Controls/_tree/interface/ITreeControl#beforeItemExpand
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Если во время разворота необходимо выполнить какое-то асинхронное действие, можно вернуть из обработчика события Promise<void>.
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @see afterItemExpand
 */

/**
 * @event Происходит перед развертыванием узла.
 * @name Controls/_tree/interface/ITreeControl#itemExpand
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Разворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControl#beforeItemExpand beforeItemExpand}.
 */

/**
 * @event Происходит после развертывания узла.
 * @name Controls/_tree/interface/ITreeControl#itemExpanded
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Развёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControl#afterItemExpand afterItemExpand}.
 */

/*
 * @event Occurs after node expansion.
 * @name Controls/_tree/interface/ITreeControl#itemExpanded
 * @param {UICommon/Events:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Expanded node.
 */

/**
 * @event Происходит после сворачивания узла.
 * @name Controls/_tree/interface/ITreeControl#afterItemCollapse
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 */

/**
 * @event Происходит перед сворачиванием узла.
 * @name Controls/_tree/interface/ITreeControl#itemCollapse
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControl#beforeItemCollapse beforeItemCollapse}.
 */

/**
 * @event Происходит перед сворачиванием узла.
 * @name Controls/_tree/interface/ITreeControl#beforeItemCollapse
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Сворачиваемый узел.
 * @remark
 * Если во время сворачивания необходимо выполнить какое-то асинхронное действие, можно вернуть из обработчика события Promise<void>.
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @see itemCollapsed
 */

/**
 * @event Происходит после сворачивания узла.
 * @name Controls/_tree/interface/ITreeControl#itemCollapsed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} node Свёрнутый узел.
 * @remark
 * Что такое "узел" читайте в {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy руководстве разработчика}.
 * @deprecated Событие устарело и в ближайшее время его поддержка будет прекращена. Используте {@link Controls/_tree/interface/ITreeControl#afterItemCollapse afterItemCollapse}.
 */

/*
 * @event Occurs after node collapse.
 * @name Controls/_tree/interface/ITreeControl#itemCollapsed
 * @param {UICommon/Events:SyntheticEvent} eventObject The event descriptor.
 * @param {Types/entity:Model} node Collapsed node.
 */

/**
 * @event Происходит при изменении набора свернутых узлов.
 * @name Controls/_tree/interface/ITreeControl#collapsedItemsChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} expandedItems Идентификаторы свернутых узлов.
 * @see expandedItemsChanged
 */
