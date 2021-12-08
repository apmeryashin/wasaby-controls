type TPadding = 'null'|'3xs'|'2xs'|'s'|'m'|'l'|'xl';

/**
 * Интерфейс для опции {@link Controls/_propertyGrid/IPropertyGrid#itemsContainerPadding itemsContainerPadding}.
 * @interface Controls/_propertyGrid/IItemsContainerPadding
 * @public
 * @author Герасимов А.М.
 */

export interface IItemsContainerPaddingOption {
    left: TPadding;
    right: TPadding;
    top: TPadding;
    bottom: TPadding;
}

/**
 * Интерфейс для контролов, которые поддерживают внешние отступы
 * @public
 * @author Герасимов А.М.
 */
export default interface IItemsContainerPadding {
    readonly '[Controls/_interface/IItemsContainerPadding]': boolean;
}

/**
 * @name Controls/_interface/IItemsContainerPadding#itemsContainerPadding
 * @cfg {Controls/_interface/IItemPadding/ItemPadding.typedef} Конфигурация внешних отступов
 * @example
 * <pre class="brush: html; highlight: [4-8]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}" imageProperty="image">
 *    <ws:itemsContainerPadding
 *       top="l"
 *       bottom="l"
 *       left="l"
 *       right="l"/>
 * </Controls.tile:View>
 * </pre>
 */
