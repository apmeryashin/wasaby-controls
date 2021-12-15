import {TMarkerClassName} from 'Controls/display';
import {IFontColorStyleOptions, IFontSizeOptions, IFontWeightOptions} from 'Controls/interface';

/**
 * @typedef {String} Controls/_list/interface/IBaseItemTemplate/TCursor
 * @description Значения, с помощью которых задается вид курсора мыши.
 * @variant default Стандартный указатель (стрелка).
 * @variant pointer Указатель.
 */
export type TCursor = 'default' | 'pointer' | 'right';

export default interface IBaseItemTemplateOptions extends IFontColorStyleOptions, IFontSizeOptions, IFontWeightOptions {
   highlightOnHover?: boolean;
   cursor?: TCursor;
   marker?: boolean;
   itemActionsClass?: string;
   checkboxReadOnly?: boolean;
   backgroundColorStyle?: string;
   markerClassName?: TMarkerClassName;
}

/**
 * Интерфейс для шаблона отображения элемента в {@link /doc/platform/developmentapl/interface-development/controls/list/ списке}.
 * @interface Controls/_list/interface/IBaseItemTemplate
 * @author Авраменко А.С.
 * @public
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#highlightOnHover
 * @cfg {Boolean} Видимость подсветки строки при наведении курсора мыши.
 * @remark
 * В значении false элементы списка не будут подсвечиваться при наведении курсора мыши.
 * Дополнительно о подсветке строки читайте {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/#highlight здесь}.
 * @default true
 * @demo Controls-demo/list_new/ItemTemplate/NoHighlightOnHover/Index
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#cursor
 * @cfg {Controls/_list/interface/IBaseItemTemplate/TCursor.typedef} Вид {@link https://developer.mozilla.org/ru/docs/Web/CSS/cursor курсора мыши} при наведении на строку.
 * @default pointer
 * @demo Controls-demo/list_new/ItemTemplate/Clickable/Index
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#marker
 * @cfg {Boolean} Позволяет отключить видимость {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркера} для отдельной записи списка.
 * @default true
 * @demo Controls-demo/list_new/ItemTemplate/Marker/Index В следующем примере выделение маркером отключено для первой записи.
 * @remark Отключение видимости маркера для всех записей описано {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/#all здесь}.
 * @see markerClassName
 * @see Controls/marker:IMarkerList#markerVisibility
 */
/**
 * @typedef {String} Controls/_list/interface/IBaseItemTemplate/ItemActionsClass
 * @description Классы, с помощью которых задается {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/position/ позиционирование панели опций записи} внутри элемента.
 * @variant controls-itemActionsV_position_bottomRight В правом нижнем углу элемента.
 * @variant controls-itemActionsV_position_topRight В правом верхнем углу элемента.
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#itemActionsClass
 * @cfg {Controls/_list/interface/IBaseItemTemplate/ItemActionsClass.typedef} Класс, используемый для позиционирования {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} при отображении её внутри элемента списка (опция {@link Controls/itemActions:IItemActions#itemActionsPosition itemActionsPosition}).
 * @default controls-itemActionsV_position_bottomRight
 * @remark
 * Дополнительно об использовании опции читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/position/#inside здесь}.
 * @demo Controls-demo/list_new/ItemTemplate/ItemActionsClass/Index
 */
/**
 * @name Controls/_interface/IBaseGroupTemplate#fontColorStyle
 * @cfg {TFontColorStyle} Стиль цвета текста записи.
 * @remark
 * Стиль цвета текста задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#fontSize
 * @cfg {TFontSize} Размер шрифта записи.
 * @remark
 * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
 * @default l
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#fontWeight
 * @cfg {TFontWeight} Насыщенность шрифта.
 * @default "default".
 */
/*
 * @cfg {boolean} Flag, allowing to set "readonly" state for checkbox within multiSelect.
 * @default false
 */

export type TBackgroundColorStyle = 'danger'|'success'|'warning'|'primary'|'secondary'|'unaccented'|'readonly';
/**
 * @typedef {String} Controls/_list/interface/IBaseItemTemplate/BackgroundColorStyle
 * @description Значения, с помощью которых задается фон строки.
 * @variant danger
 * @variant success
 * @variant warning
 * @variant primary
 * @variant secondary
 * @variant unaccented
 * @variant readonly
 */
/**
 * @name Controls/_list/interface/IBaseItemTemplate#backgroundColorStyle
 * @cfg {Controls/_list/interface/IBaseItemTemplate/BackgroundColorStyle.typedef} Настройка фона строки.
 * @remark
 * Подробнее о настройке фона строки читайте {@link /doc/platform/developmentapl/interface-development/controls/list/list/background/#highlight здесь}.
 * @demo Controls-demo/list_new/ItemTemplate/BackgroundColorStyle/Index
 */

/**
 * @name Controls/_list/interface/IBaseItemTemplate#markerClassName
 * @cfg {Controls/_display/interface/ICollectionItem/TMarkerClassName.typedef} Размер {@link /doc/platform/developmentapl/interface-development/controls/list/actions/marker/ маркера}.
 * @default default
 * @remark
 * Согласно стандарту, в случае размещения маркера радом с текстом его высота равна высоте первой строки текста, включая верхний отступ записи.
 * @see marker
 */
