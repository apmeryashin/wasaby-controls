import {IControlOptions} from 'UI/Base';
import {
    ICaptionOptions,
    IContrastBackground,
    IFontColorStyleOptions,
    IFontSizeOptions,
    IHeightOptions,
    IHrefOptions,
    IIconOptions,
    IIconSizeOptions,
    IIconStyleOptions,
    ITooltipOptions
} from 'Controls/interface';

export type IViewMode = 'button' | 'link' | 'linkButton' | 'toolButton' | 'functionalButton';
export type TextAlign = 'left' | 'right' | 'center';

/**
 * @typedef {String} TButtonStyle
 * @description Значения для стиля отображаения кнопки.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant danger
 * @variant info
 * @variant unaccented
 * @variant default
 * @variant pale
 */
export type TButtonStyle = 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'unaccented' | 'default' | 'pale';

export interface IButtonOptions extends IControlOptions, IHrefOptions, ICaptionOptions, IIconOptions, IIconStyleOptions,
    IIconSizeOptions, IFontColorStyleOptions, IFontSizeOptions, IHeightOptions, ITooltipOptions {
    contrastBackground?: boolean;
    buttonStyle?: string;
    viewMode?: IViewMode;
    captionPosition?: 'left' | 'right';
    textAlign?: TextAlign;
    translucent?: boolean;
}
/**
 * Интерфейс для стилевого оформления кнопки.
 *
 * @implements Controls/interface:IContrastBackground
 * @public
 * @author Мочалов М.А.
 */

/*
 * Interface for Button control.
 *
 * @interface Controls/_buttons/interface/IButton
 * @public
 * @author Мочалов М.А.
 */
export interface IButton extends IContrastBackground {
    readonly '[Controls/_buttons/interface/IButton]': boolean;
}

/**
 * @name Controls/_buttons/interface/IButton#buttonStyle
 * @cfg {TButtonStyle} Стиль отображения кнопки.
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant danger
 * @variant info
 * @variant unaccented
 * @variant default
 * @variant pale
 * @default secondary
 * @remark
 * Стиль может влиять на цвет фона или цвет границы для различных значений режима отображения (см. {@link Controls/buttons:Button#viewMode viewMode}).
 * @demo Controls-demo/Buttons/ButtonStyle/Index
 * @example
 * Кнопка со стилем "Primary" с иконкой по умолчанию.
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.buttons:Button
 *    viewMode="button"
 *    buttonStyle="primary"/>
 * </pre>
 */

/*
 * @name Controls/_buttons/interface/IButton#buttonStyle
 * @cfg {TButtonStyle} Set style parameters for button. These are background color or border color for different values of viewMode
 * @variant primary
 * @variant secondary
 * @variant success
 * @variant warning
 * @variant danger
 * @variant info
 * @default secondary
 * @example
 * Primary button with default icon style.
 * <pre>
 *    <Controls.buttons:Button viewMode="button" buttonStyle="primary"/>
 * </pre>
 */

/**
 * @name Controls/_buttons/interface/IButton#translucent
 * @cfg {Boolean} Режим полупрозрачного отображения кнопки.
 * @default false
 */
