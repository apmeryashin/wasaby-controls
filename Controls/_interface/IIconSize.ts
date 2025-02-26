/**
 * @typedef {String} Значения для размеров иконки
 * @variant 2xs минимальный
 * @variant xs уменьшенный
 * @variant s малый
 * @variant m средний
 * @variant l большой
 * @variant default по-умолчанию
 */
export type TIconSize = '2xs' | 'xs' | 's' | 'm' | 'l' | 'default';

export interface IIconSizeOptions {
   iconSize?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные размеры иконок
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for button icon.
 *
 * @interface Controls/_interface/IIconSize
 * @public
 */
export default interface IIconSize {
   readonly '[Controls/_interface/IIconSize]': boolean;
}
/**
 * @name Controls/_interface/IIconSize#iconSize
 * @cfg {TIconSize} Размер иконки.
 * @variant 2xs минимальный
 * @variant xs уменьшенный
 * @variant s малый
 * @variant m средний
 * @variant l большой
 * @variant default по-умолчанию
 * @remark
 * Размер иконки задается константой из стандартного набора размеров, который определен для текущей {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления}.
 * @demo Controls-demo/Buttons/SizesAndHeights/Index
 * @example
 * Кнопка с размером иконки по умолчанию.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Кнопка с иконкой большого размера (l).
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button icon="icon-Add" iconSize="l" viewMode="button"/>
 * </pre>
 * @see Icon
 */

/*
 * @name Controls/_interface/IIconSize#iconSize
 * @cfg {TIconSize} Icon display Size.
 * @variant s
 * @variant m
 * @variant l
 * @variant default
 * @example
 * Button with default icon size.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Button with large size.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" iconSize="l" viewMode="button"/>
 * </pre>
 * @see Icon
 */
