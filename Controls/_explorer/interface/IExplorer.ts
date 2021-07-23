/**
 * Интерфейс для иерархических списков с возможностью проваливания в папки.
 *
 * @interface Controls/_explorer/interface/IExplorer
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for hierarchical lists that can open folders.
 *
 * @interface Controls/_explorer/interface/IExplorer
 * @public
 * @author Авраменко А.С.
 */

export type TExplorerViewMode = 'table' | 'search' | 'tile' | 'list';

/**
 * @name Controls/_explorer/interface/IExplorer#viewMode
 * @cfg {String} {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/view-mode/ Режим отображения} иерархического проводника.
 * @variant table Таблица.
 * @variant search Поиск.
 * @variant tile Плитка.
 * @variant list Плоский список.
 * @demo Controls-demo/Explorer/Explorer
 */

/*
 * @name Controls/_explorer/interface/IExplorer#viewMode
 * @cfg {TExplorerViewMode} List view mode.
 * @demo Controls-demo/Explorer/Explorer
 */

/**
 * @name Controls/_explorer/interface/IExplorer#root
 * @cfg {Number|String} Идентификатор корневого узла.
 */

/*
 * @name Controls/_explorer/interface/IExplorer#root
 * @cfg {Number|String} Identifier of the root node.
 */

/**
 * @event Происходит при изменении корня иерархии (например, при переходе пользователя по хлебным крошкам).
 * @name Controls/_explorer/interface/IExplorer#rootChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String|Number} root Идентификатор корневой записи.
 */

/**
 * @name Controls/_explorer/interface/IExplorer#backButtonIconStyle
 * @cfg {String} Стиль отображения иконки кнопки "Назад".
 * @see Controls/_heading/Back#iconStyle
 */

/**
 * @name Controls/_explorer/interface/IExplorer#backButtonFontColorStyle
 * @cfg {String} Стиль цвета кнопки "Назад".
 * @see Controls/_heading/Back#fontColorStyle
 */

/**
 * @name Controls/_explorer/interface/IExplorer#showActionButton
 * @cfg {Boolean} Определяет, должна ли отображаться стрелка рядом с кнопкой "Назад".
 * @default false
 */

/*
 * @name Controls/_explorer/interface/IExplorer#showActionButton
 * @cfg {Boolean} Determines whether the arrow near "back" button should be shown.
 * @default
 * false
 */

/**
 * @name Controls/_explorer/interface/IExplorer#dedicatedItemProperty
 * @cfg {String} Имя свойства узла дерева, которое определяет, что при поиске этот узел должен быть показан отдельной хлебной крошкой.
 */

/**
 * @name Controls/_explorer/interface/IExplorer#searchStartingWith
 * @cfg {String} Режим поиска в иерархическом проводнике.
 * @variant root Поиск происходит в {@link /doc/platform/developmentapl/interface-development/controls/list/explorer/navigation/root/ корне}.
 * @variant current Поиск происходит в текущем резделе.
 * @default root
 */

/**
 * @name Controls/_explorer/interface/IExplorer#searchNavigationMode
 * @cfg {String} Режим навигации при поиске в иерархическом проводнике.
 * @variant open В {@link Controls/_explorer/interface/IExplorer#viewMode режиме поиска} при клике на хлебную крошку происходит проваливание в данный узел.
 * @variant expand В режиме поиска при клике на хлебную крошку данные отображаются от корня, путь до узла разворачивается.
 * @default open
 */

/**
 * @name Controls/_explorer/interface/IExplorer#breadcrumbsVisibility
 * @cfg {String} Видимость хлебных крошек и кнопки "Назад".
 * @variant hidden Скрыто.
 * @variant visible Отображается.
 */