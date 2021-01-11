/**
 * @typedef {String} TNavigationSource
 * @description Режимы работы с источником данных, подробнее о которых можно прочитать <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/">здесь</a>.
 * @variant position Навигация по курсору.
 * @variant page Навигация с фиксированным количеством загружаемых записей.
 */
/*
 * @typedef {String} TNavigationSource
 * @variant position Position-based navigation (cursor).
 * @variant page Page-based navigation.
 */
export type TNavigationSource = 'position' | 'page';

/**
 * @typedef {String} TNavigationView
 * @description Виды <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/">визуального представления навигации</a>.
 * @variant infinity Бесконечная прокрутка.
 * Список отображается в виде "бесконечной ленты" записей.
 * Загрузка данных происходит при прокрутке, когда пользователь достигает конца списка.
 * Можно настроить отображение панели с кнопками навигации и подсчетом общего количества записей.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/">здесь</a>.
 * @variant pages Постраничное отображение данных.
 * Список отображает только одну страницу с записями.
 * Загрузка данных происходит при переходе между страницами.
 * Переход осуществляется с помощью панели с кнопками навигации, рядом с которыми можно настроить отображение количества всех записей и диапазона записей на странице.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/">здесь</a>.
 * @variant demand Навигация по кнопке "Ещё".
 * Список отображается в виде "бесконечной ленты" записей.
 * Загрузка данных происходит при нажатии на кнопку "Ещё", отображаемой в конце списка.
 * Можно настроить отображение числа оставшихся записей.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/button-more/">здесь</a>.
 * @variant maxCount Загрузка до достижения заданного числа записей.
 * Позволяет прекратить загрузку при достижении заданного количества записей.
 * Подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/portion-loading/#max-count">здесь</a>.
 */

/*
 * @typedef {String} TNavigationView
 * @variant infinity Infinite scroll.
 * @variant pages Pages with paging control.
 * @variant demand Load next when requested (for example, hasMore button clicked).
 * @variant maxCount Load data until threshold value set in {@link Controls/_interface/INavigation/INavigationViewConfig.typedef maxCountValue}.
 */
export type TNavigationView = 'infinity' | 'pages' | 'demand' | 'maxCount';

/**
 * @typedef {Enum} CursorDirection
 * @description Направление выборки при навигации по курсору.
 * @variant forward Вниз.
 * @variant backward Вверх.
 * @variant bothways В обоих направлениях.
 */

/*
 * @typedef {Enum} CursorDirection
 * @variant forward loading data after positional record.
 * @variant backward loading data before positional record.
 * @variant bothways loading data in both directions relative to the positional record.
 */
export enum CursorDirection {
    backward = 'backward',
    forward = 'forward',
    bothways = 'bothways'
}

/**
 * @typedef {String} TNavigationDirection
 * @description Направление выборки для режима работы с источником данных <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#cursor">Навигация по курсору</a>.
 * @variant forward Вниз.
 * @variant backward Вверх.
 * @variant bothways В обоих направлениях.
 */

/*
 * @typedef {String} TNavigationDirection
 * @variant forward loading data after positional record.
 * @variant backward loading data before positional record.
 * @variant bothways loading data in both directions relative to the positional record.
 */
export type TNavigationDirection = 'backward' | 'forward' | 'bothways';

/*
 * @name Controls/_interface/INavigation/IBasePositionSourceConfig
 * @description Конфигурация источника данных для перезагрузки при навигации по курсору.
 * Подробнее о данном типе навигации читайте {@link /doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 */
/**
 * @description Конфигурация источника данных для перезагрузки при навигации по курсору.
 * Подробнее о данном типе навигации читайте {@link /doc/platform/developmentapl/service-development/service-contract/objects/blmethods/bllist/cursor/ здесь}.
 * @public
 */
export interface IBasePositionSourceConfig {
    /**
     * Начальная позиция для курсора.
     * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-position">здесь</a>.
     */
    position?: unknown[] | unknown;
    /**
     * Направление выборки.
     * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-direction">здесь</a>.
     */
    direction?: TNavigationDirection;
    /**
     * Количество записей, которые запрашиваются при выборке.
     * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-limit">здесь</a>.
     */
    limit?: number;
    multiNavigation?: boolean;
}

/*
 * @name Controls/_interface/INavigation/INavigationPositionSourceConfig
 * @description Source configuration for position-based (cursor) navigation.
 */
/**
 * @description Параметры работы с источником данных для режима <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source">Навигация по курсору</a>.
 * @public
 */
export interface INavigationPositionSourceConfig extends IBasePositionSourceConfig {
    /**
     * Имя поля или массив с именами полей, для которых в целевой таблице БД создан индекс.
     * Подробнее об использовании свойства <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-field">здесь</a>.
     */
    field: string[] | string;
}

/*
 * @name Controls/_interface/INavigation/IBasePageSourceConfig
 * @description Конфигурация для постраничной навигации.
 * @property {Number} page Номер загружаемой страницы.
 * @property {Number} pageSize Размер загружаемой страницы.
 */

/**
 * @public
 */
export interface IBasePageSourceConfig {
    /**
     * Номер загружаемой страницы.
     */
    page?: number;
    /**
     * Размер загружаемой страницы.
     */
    pageSize: number;
    multiNavigation?: boolean;
}

/*
 * @name Controls/_interface/INavigation/INavigationPageSourceConfig
 * @description Source configuration for page-based navigation.
 * @property {Number} page Loading page number.
 * @property {Number} pageSize Loading page size.
 * @property {Boolean} hasMore If hasMore field has false value, similar parameter is added to request. In response instead of receiving a flag for the presence of records (boolean value), the total count of records is expected (number value).
 */
/**
 * @description Параметры работы с источником данных для режима <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#page">Навигация с фиксированным количеством загружаемых записей</a>.
 * @public
 */
export interface INavigationPageSourceConfig extends IBasePageSourceConfig {
    /**
     * Признак наличия записей для загрузки. Подробнее об использовании параметра читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#data-parametr-hasmore">здесь</a>.
     */
    hasMore?: boolean;
}

/*
 * @name Controls/_interface/INavigation/INavigationSourceConfig
 * @description Source configuration for both page-based and position-based (cursor) navigation.
 */
/**
 * @description Параметры режима <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/">работы с источником данных</a>.
 * Параметры для режима {@link Controls/interface:INavigation/INavigationPositionSourceConfig.typedef Навигация по курсору}.
 * Параметры для режима {@link Controls/interface:INavigation/INavigationPageSourceConfig.typedef Навигация с фиксированным количеством загружаемых записей}.
 */
export type INavigationSourceConfig = INavigationPositionSourceConfig | INavigationPageSourceConfig;
export type IBaseSourceConfig = IBasePositionSourceConfig | IBasePageSourceConfig;

/**
 * @typedef {String} TNavigationTotalInfo
 * @description Допустимые значения для параметра {@link Controls/interface:INavigation/TNavigationTotalInfo.typedef totalInfo}.
 * @variant basic Отображается только общее число записей.
 * @variant extended Отображается общее число записей, номера первой и последней записей на текущей странице, а также размер страницы.
 */
export type TNavigationTotalInfo = 'basic' | 'extended';

/**
 * @typedef {String} TNavigationPagingMode
 * @variant hidden Предназначен для отключения отображения пейджинга в реестре.
 * @variant basic Предназначен для пейджинга в реестре с подгрузкой по скроллу.
 * @variant edge Предназначен для пейджинга с отображением одной команды прокрутки. Отображается кнопка в конец, либо в начало, в зависимости от положения.
 * @variant end Предназначен для пейджинга с отображением одной команды прокрутки. Отображается только кнопка в конец.
 * @variant numbers Предназначен для пейджинга с подсчетом записей и страниц.
 * @variant direct Значение устарело и будет удалено. Используйте значение basic.
 */
export type TNavigationPagingMode = 'hidden' | 'basic' | 'edge' | 'end' | 'numbers' | 'direct';

/**
 * @typeof {String} TNavigationPagingPadding
 * @variant default Предназначен для отображения отступа под пэйджинг.
 * @variant null Предназначен для отключения отображения отступа под пэйджинг.
 */
type TNavigationPagingPadding = 'default' | 'null';

/**
 * @typeof {String} TNavigationPagingPosition
 * @variant left Отображения пэйджинга слева.
 * @variant right Отображения пэйджинга справа.
 */
type TNavigationPagingPosition= 'left' | 'right';

/**
 * @description Конфигурация <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/">визуального представления навигации</a>.
 * @public
 */
export interface INavigationViewConfig {
    /**
     * Внешний вид пэйджинга. Позволяет для каждого конкретного реестра задать внешний вид в зависимости от требований к интерфейсу.
     * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/">здесь</a>.
     * @default hidden
     */
    pagingMode?: TNavigationPagingMode;
    /**
     * Режим отображения информационной подписи.
     * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/data-pagination/">здесь</a>.
     * @default basic
     */
    totalInfo?: TNavigationTotalInfo;
    /**
     * Предельное число записей, по достижении которого подгрузка записей прекращается.
     * Подробнее об использовании свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/portion-loading/#max-count">здесь</a>.
     */
    maxCountValue?: number;
    /**
     * Видимость кнопки перехода в конец списка.
     * Когда параметр принимает значение true, кнопка отображается.
     * Пример использования свойства читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/visual-mode/infinite-scrolling/">здесь</a>.
     * @default false
     */
    showEndButton?: boolean;
    /**
     * Опция управляет отображением отступа под пэйджинг.
     * @default default
     */
    pagingPadding?: TNavigationPagingPadding;
    /**
     * Опция управляет позицией пэйджинга.
     * @default right
     */
    pagingPosition?: TNavigationPagingPosition;
}

/*
 * @name Controls/_interface/INavigation/INavigationOptionValue
 */
/**
 * @description Конфигурация навигации в <a href="/doc/platform/developmentapl/interface-development/controls/list/">списке</a>.
 * Подробнее о настройке навигации читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/">здесь</a>.
 * @public
 */
export interface INavigationOptionValue<U> {
    /**
     * Режим работы с источником данных.
     */
    source?: TNavigationSource;
    /**
     * Вид визуального представления навигации.
     */
    view?: TNavigationView;
    sourceConfig?: U;
    /**
     * Конфигурация вида визуального представления навигации.
     */
    viewConfig?: INavigationViewConfig;
}

export interface INavigationOptions<U> {
    navigation?: INavigationOptionValue<U>;
}

/**
 * @name Controls/_interface/INavigation/INavigationOptionValue#sourceConfig
 * @cfg {INavigationSourceConfig} sourceConfig Конфигурация режима работы с источником данных.
 */

/**
 * Интерфейс для контролов, поддерживающих навигацию.
 *
 * @interface Controls/_interface/INavigation
 * @public
 * @author Крайнов Д.О.
 */

 /*
 * Interface for list navigation.
 *
 * @interface Controls/_interface/INavigation
 * @public
 * @author Крайнов Д.О.
 */

export default interface INavigation {
    readonly '[Controls/_interface/INavigation]': boolean;
}

/**
 * @name Controls/_interface/INavigation#navigation
 * @cfg {INavigationOptionValue} Конфигурация навигации в <a href="/doc/platform/developmentapl/interface-development/controls/list/">списке</a>.
 * @remark
 * Подробнее о навигации в списках читайте <a href="/doc/platform/developmentapl/interface-development/controls/list/navigation/">здесь</a>.
 * @example
 * В этом примере в списке будут отображаться 2 элемента.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View
 *    keyProperty="id"
 *    source="{{_source}}"
 *    navigation="{{_navigation}}" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount: function(options) {
 *    this._source = new Memory({
 *      keyProperty: 'id',
 *      data: [
 *         {
 *            id: '1',
 *            title: 'Yaroslavl'
 *         },
 *         {
 *            id: '2',
 *            title: 'Moscow'
 *         },
 *         {
 *            id: '3',
 *            title: 'St-Petersburg'
 *         }
 *      ]
 *    });
 *    this._navigation: INavigationOptionValue<INavigationPageSourceConfig> = {
 *       source: 'page',
 *       view: 'pages',
 *       sourceConfig: {
 *          pageSize: 2,
 *          page: 0
 *       }
 *    };
 * }
 * </pre>
 * @demo Controls-demo/list_new/Navigation/ScrollPaging/Index
 */

 /*
 * @name Controls/_interface/INavigation#navigation
 * @cfg {Navigation} List navigation configuration. Configures data source navigation (pages, offset, position) and navigation view (pages, infinite scroll, etc.)
 * @example
 * In this example, 2 items will be displayed in the list.
 * <pre>
 *    <Controls.list:View
 *       keyProperty="id"
 *       source="{{_source}}"
 *       navigation="{{_navigation}}"/>
 * </pre>
 * <pre>
 * _beforeMount: function(options) {
 *    this._source = new Memory({
 *      keyProperty: 'id',
 *      data: [
 *         {
 *            id: '1',
 *            title: 'Yaroslavl'
 *         },
 *         {
 *            id: '2',
 *            title: 'Moscow'
 *         },
 *         {
 *            id: '3',
 *            title: 'St-Petersburg'
 *         }
 *      ]
 *    });
 *    this._navigation: INavigationOptionValue<INavigationPageSourceConfig> = {
 *       source: 'page',
 *       view: 'pages',
 *       sourceConfig: {
 *          pageSize: 2,
 *          page: 0
 *       }
 *    };
 * }
 * </pre>
 */
