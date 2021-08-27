import {Record} from 'Types/entity';
import {IControlOptions, TemplateFunction} from 'UI/Base';
import {IFontSizeOptions} from 'Controls/interface';
import {ICrudPlus} from 'Types/source';

export interface IBreadCrumbsOptions extends IControlOptions, IFontSizeOptions {
    items: Record[];
    keyProperty: string;
    parentProperty: string;
    displayProperty: string;
    containerWidth: number;
    backButtonBeforeCaptionTemplate: string | TemplateFunction;

    /**
     * Временная опция, которая включает отображение крошек в новом дизайне
     * https://online.sbis.ru/opendoc.html?guid=bc6cb214-d119-4ae6-98b2-c147df660b46
     */
    feature1182709671?: boolean;
    pathButtonSource: ICrudPlus;
    pathButtonFilter: object;
    pathButtonKeyProperty: string;
    pathButtonNodeProperty: string;
    pathButtonParentProperty: string;
    pathButtonDisplayProperty: string;
}

/**
 * Интерфейс для контролов, отображающих "хлебные крошки".
 * @interface Controls/_breadcrumbs/interface/IBreadCrumbs
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for breadcrumbs.
 *
 * @interface Controls/_breadcrumbs/interface/IBreadCrumbs
 * @public
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#items
 * @cfg {Array.<Record>} Массив хлебных крошек.
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#items
 * @cfg {Array.<Record>} Array of breadcrumbs to draw.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#keyProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
 * @see parentProperty
 * @see displayProperty
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#keyProperty
 * @cfg {String} Name of the item property that uniquely identifies collection item.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#parentProperty
 * @cfg {String} Имя свойства, содержащего сведения о родительском узле.
 * @see keyProperty
 * @see displayProperty
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#parentProperty
 * @cfg {String} Name of the field that contains information about parent node.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#displayProperty
 * @cfg {String} Имя свойства элемента, содержимое которого будет отображаться.
 * @default title
 * @see keyProperty
 * @see parentProperty
 */

/*
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#displayProperty
 * @cfg {String} Name of the item property which content will be displayed.
 * @default title
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#backButtonBeforeCaptionTemplate
 * @cfg {String|UI/Base:TemplateFunction} Кастомный шаблон, который выводится перед зоголовком кнопки назад в хлебных крошках.
 * В шаблон передается опция item в которой содержится запись хлебной крошки.
 */

/**
 * @typedef {String} BackgroundStyle
 * @variant master Предназначен для настройки фона masterDetail
 * @variant stack Предназначен для настройки фона стековой панели.
 * @variant detailContrast
 * @variant listItem
 * @variant stackHeader
 * @variant default фон по-умолчанию
 * @default default
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#backgroundStyle
 * @cfg {BackgroundStyle} Префикс стиля для настройки фона внутренних компонентов хлебных крошек.
 * @default default
 * @remark
 * Согласно <a href="/doc/platform/developmentapl/interface-development/controls/list/list/background/">документации</a> поддерживаются любые произвольные значения опции.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#containerWidth
 * @cfg {Number} Ширина контейнера крошек.
 * Необходимо указывать для правильного расчета ширины крошек.
 */

/**
 * @event Происходит после клика по хлебным крошкам.
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#itemClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому произвели клик.
 */

/*
 * @event Happens after clicking on breadcrumb.
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#itemClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Record} item Key of the clicked item.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonSource
 * @cfg {Types/source#ICrud} Источник данных для кнопки меню при клике на которую отображается дерево каталогов.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonFilter
 * @cfg {Types/source#ICrud} Данные фильтра, используемого при запросе дерева каталогов для кнопки меню.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonKeyProperty
 * @cfg {Types/source#ICrud} Имя поля записи содержащее её ключ.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonNodeProperty
 * @cfg {Types/source#ICrud} Имя поля записи содержащее её тип (узел, скрытый узел, лист).
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonParentProperty
 * @cfg {Types/source#ICrud} Имя поля записи содержащее идентификатор родительского узла.
 */

/**
 * @name Controls/_breadcrumbs/interface/IBreadCrumbs#pathButtonDisplayProperty
 * @cfg {Types/source#ICrud} Имя поля записи содержащее её отображаемое значение.
 */
