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
 * @author Красильников А.С.
 */

/*
 * Interface for Button control.
 *
 * @interface Controls/_buttons/interface/IButton
 * @public
 * @author Красильников А.С.
 */
export interface IButton extends IContrastBackground {
    readonly '[Controls/_buttons/interface/IButton]': boolean;
}

/**
 * @name Controls/_buttons/interface/IButton#buttonStyle
 * @cfg {Enum} Стиль отображения кнопки.
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
 * @demo Controls-demo/Buttons/ButtonStyleFull/Index
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
 * @cfg {Enum} Set style parameters for button. These are background color or border color for different values of viewMode
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
