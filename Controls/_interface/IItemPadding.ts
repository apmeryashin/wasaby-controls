import { IItemPadding } from 'Controls/display';

export interface IItemPaddingOptions {
    itemPadding?: IItemPadding;
}
/**
 * Интерфейс для контролов, поддерживающих установку внутренних отступов для элементов
 * @public
 * @author Герасимов А.М.
 */
export default interface IItemPadding {
    readonly '[Controls/_interface/IItemPadding]': boolean;
}

/**
 * @typedef {String} Controls/_interface/IItemPadding/VerticalItemPaddingEnum
 * @description Допустимые значения для свойств {@link Controls/interface:IItemPadding/ItemPadding.typedef ItemPadding}.
 * @variant null Нулевой отступ. Значение передается строкой.
 * @variant s Маленький отступ.
 * @variant l Большой отступ.
 */

/*ENG
 * @typedef {String} Controls/_interface/IItemPadding/VerticalItemPaddingEnum
 * @variant null Without padding.
 * @variant s Small padding.
 * @variant l Large padding.
 */

/**
 * @typedef {String} Controls/_interface/IItemPadding/HorizontalItemPaddingEnum
 * @description Допустимые значения для свойств {@link Controls/interface:IItemPadding/ItemPadding.typedef ItemPadding}.
 * @variant null Нулевой отступ. Значение передается строкой.
 * @variant xs Минимальный отступ.
 * @variant s Маленький отступ.
 * @variant m Средний отступ.
 * @variant l Большой отступ.
 * @variant xl Очень большой оступ.
 * @variant xxl Максимальный отступ.
 */

/*ENG
 * @typedef {Object} Controls/_interface/IItemPadding/HorizontalItemPaddingEnum
 * @variant null Without padding.
 * @variant xs Extra small padding.
 * @variant s Small padding.
 * @variant m Medium padding.
 * @variant l Large padding.
 * @variant xl Extra large padding.
 * @variant xxl Extra extra large padding.
 */

/**
 * @typedef {Object} Controls/_interface/IItemPadding/ItemPadding
 * @description Свойства для конфигурации опции {@link Controls/interface:IItemPadding#itemPadding itemPadding}.
 * @property {Controls/_interface/IItemPadding/VerticalItemPaddingEnum.typedef} [top=s] Отступ от содержимого до верхней границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 * @property {Controls/_interface/IItemPadding/VerticalItemPaddingEnum.typedef} [bottom=s] Отступ от содержимого до нижней границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 * @property {Controls/_interface/IItemPadding/HorizontalItemPaddingEnum.typedef} [left=m] Отступ от содержимого до левой границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 * @property {Controls/_interface/IItemPadding/HorizontalItemPaddingEnum.typedef} [right=m] Отступ от содержимого до правой границы элемента. Если свойство принимает значение null, то отступ отсутствует.
 */

/*ENG
 * @typedef {Object} Controls/_interface/IItemPadding/ItemPadding
 * @property {VerticalItemPaddingEnum} [top=s] Padding from item content to top item border.
 * @property {VerticalItemPaddingEnum} [bottom=s] Padding from item content to bottom item border.
 * @property {HorizontalItemPaddingEnum} [left=m] Padding from item content to left item border.
 * @property {HorizontalItemPaddingEnum} [right=m] Padding from item content to right item border.
 */

/**
 * @cfg {Controls/_interface/IItemPadding/ItemPadding.typedef} Конфигурация отступов внутри элементов списка.
 * @name Controls/_interface/IItemPadding#itemPadding
 * @demo Controls-demo/gridNew/ItemPaddingNull/Index
 * @remark Во избежание наслаивания текста на маркер, для списков со style='master' менять горизонтальный отступ не рекомендуется
 */

/*ENG
 * @cfg {Controls/_interface/IItemPadding/ItemPadding.typedef} Configuration inner paddings in the item.
 * @name Controls/_interface/IItemPadding#itemPadding
 */
