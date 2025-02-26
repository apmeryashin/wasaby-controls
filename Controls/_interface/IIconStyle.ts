/**
 * @typedef {String} TIconStyle
 * @description Значения для стиля отображаения иконки.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant info
 * @variant label
 * @variant default
 * @variant link
 * @variant contrast
 * @variant unaccented
 */
export type TIconStyle = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'label' | 'default' | 'link' | 'contrast' | 'unaccented';

export interface IIconStyleOptions {
   iconStyle?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные цвета иконок
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for button icon.
 *
 * @public
 */
export default interface IIconStyle {
   readonly '[Controls/_interface/IIconStyle]': boolean;
}
/**
 * @name Controls/_interface/IIconStyle#iconStyle
 * @cfg {TIconStyle} Стиль отображения иконки.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant info
 * @variant label
 * @variant default
 * @variant link
 * @variant contrast
 * @variant unaccented
 * @default secondary
 * @remark
 * Цвет иконки задается константой из стандартного набора цветов, который определен для текущей темы оформления.
 * @demo Controls-demo/Buttons/IconStyles/Index
 * @example
 * Кнопка с иконкой по умолчанию.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Кнопка с иконкой в стиле "success".
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.buttons:Button icon="icon-Add" iconStyle="success" viewMode="button"/>
 * </pre>
 * @see Icon
 */

/*
 * @name Controls/_interface/IIconStyle#iconStyle
 * @cfg {TIconStyle} Icon display style.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant info
 * @variant default
 * @variant link
 * @default secondary
 * @example
 * Button with default icon style.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" viewMode="button"/>
 * </pre>
 * Button with success icon style.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" iconStyle="success" viewMode="button"/>
 * </pre>
 * @see Icon
 */
