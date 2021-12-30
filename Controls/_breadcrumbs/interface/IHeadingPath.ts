import {ICrudPlus} from 'Types/source';
import {IBreadCrumbsOptions} from 'Controls/_breadcrumbs/interface/IBreadCrumbs';
import {TTextTransform} from 'Controls/interface';

/**
 * Интерфейс описывает структуру объекта конфигурации компонента {@link Controls/breadcrumbs:HeadingPath}
 * @interface Controls/_breadcrumbs/interface/IHeadingPath
 * @implements Controls/_breadcrumbs/interface/IBreadCrumbs
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IHeadingPath extends IBreadCrumbsOptions {
    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#feature1182709671
     * @cfg {boolean} Временная опция, которая включает отображение крошек в новом дизайне
     * https://online.sbis.ru/opendoc.html?guid=bc6cb214-d119-4ae6-98b2-c147df660b46
     */
    feature1182709671?: boolean;

    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonCaption
     * @cfg {String} Заголовок кнопки, отображаемой в шапке навигационного меню, клик по которой приводит к переходу в корень.
     * @default 'На главную'
     */
    pathButtonCaption?: string;

    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonSource
     * @cfg {Types/source#ICrud} Источник данных для кнопки меню при клике на которую отображается дерево каталогов.
     */
    pathButtonSource: ICrudPlus;

    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonFilter
     * @cfg {Object} Данные фильтра, используемого при запросе дерева каталогов для кнопки меню.
     */
    pathButtonFilter: object;

    /**
     * @cfg {Object[]} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/sorting/ сортировки}.
     * @remark
     * Допустимы значения направления сортировки ASC/DESC.
     */
    pathButtonSorting: object[];

    /**
     * @cfg {Controls/interface:INavigationOptionValue} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/ навигации} в {@link /doc/platform/developmentapl/interface-development/controls/list/ списке}.
     */
    pathButtonNavigation: object;

    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonKeyProperty
     * @cfg {String} Имя поля записи содержащее её ключ.
     */
    pathButtonKeyProperty: string;

    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonNodeProperty
     * @cfg {String} Имя поля записи содержащее её тип (узел, скрытый узел, лист).
     */
    pathButtonNodeProperty: string;

    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonParentProperty
     * @cfg {String} Имя поля записи содержащее идентификатор родительского узла.
     */
    pathButtonParentProperty: string;

    /**
     * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonDisplayProperty
     * @cfg {String} Имя поля записи содержащее её отображаемое значение.
     */
    pathButtonDisplayProperty: string;

    /**
     * @cfg {String} Имя поля записи, в котором хранится информация о наличии дочерних элементов в узле {@link Controls/treeGrid:View дерева}.
     */
    pathButtonHasChildrenProperty: string;

    displayMode: 'default' | 'multiline';

    /**
     * @cfg {TTextTransform} Вместе с установкой преобразования текста, меняется так же расстояние между буквами.
     * @default 'none'
     */
    backButtonTextTransform?: TTextTransform;
}
