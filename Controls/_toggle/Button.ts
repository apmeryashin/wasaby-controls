import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ActualApi, simpleCssStyleGeneration, IButton, IButtonOptions} from 'Controls/buttons';
import ToggleButtonTemplate = require('wml!Controls/_toggle/Button/Button');
import 'css!Controls/buttons';
import 'css!Controls/toggle';
import 'css!Controls/CommonClasses';

import {ICheckable, ICheckableOptions} from './interface/ICheckable';
import {
        IFontColorStyle,
        IFontColorStyleOptions,
        IFontSize,
        IFontSizeOptions,
        IHeight,
        IHeightOptions,
        IIconSize,
        IIconSizeOptions,
        IIconStyle,
        IIconStyleOptions,
        ITooltip,
        ITooltipOptions } from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import {constants} from 'Env/Env';

export interface IToggleButtonOptions extends
        IControlOptions,
        IButtonOptions,
        ICheckableOptions,
        IFontColorStyleOptions,
        IFontSizeOptions,
        IIconSizeOptions,
        IIconStyleOptions,
        IHeightOptions,
        ITooltipOptions {
    icons?: string[];
    captions?: string[];
    viewMode?: 'button' | 'link' | 'toolButton' | 'pushButton';
    iconStyles?: string[];
    buttonStyles?: string[];
    fontColorStyles?: string[];
    // deprecated options
    icon?: string;
}

/**
 * Кнопка, которая переключается между двумя состояниями: включено и выключено.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toggle.less переменные тем оформления}
 *
 *
 * @class Controls/_toggle/Button
 * @extends UI/Base:Control
 * @implements Controls/buttons:IButton
 * @implements Controls/toggle:ICheckable
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:IIconStyle
 * @implements Control
 * s/_interface/IHeight
 * @implements Controls/interface:ITooltip
 *
 * @public
 * @author Мочалов М.А.
 *
 * @demo Controls-demo/toggle/Button/ViewModes/Index
 */

/*
 * Button that switches between two states: on-state and off-state.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex">Demo-example</a>.
 *
 * @class Controls/_toggle/Button
 * @extends UI/Base:Control
 * @implements Controls/buttons:IButton
 * @implements Controls/toggle:ICheckable
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:IIconStyle
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:ITooltip
 *
 * @public
 * @author Мочалов М.А.
 *
 * @demo Controls-demo/toggle/Button/ViewModes/Index
 */
class ToggleButton extends Control<IToggleButtonOptions> implements IButton,
    ICheckable,
    IFontColorStyle,
    IFontSize,
    IHeight,
    IIconSize,
    IIconStyle,
    ITooltip {
    '[Controls/_toggle/interface/ICheckable]': true;
    '[Controls/_buttons/interface/IButton]': true;
    '[Controls/_interface/IIconStyle]': true;
    '[Controls/_interface/ITooltip]': true;
    '[Controls/_interface/IFontColorStyle]': true;
    '[Controls/_interface/IFontSize]': true;
    '[Controls/_interface/IHeight]': true;
    '[Controls/_interface/IIconSize]': true;

    // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
    protected _template: TemplateFunction = ToggleButtonTemplate;

    protected _buttonStyle: string;
    protected _fontColorStyle: string;
    protected _fontSize: string;
    protected _contrastBackground: boolean;
    protected _hasIcon: boolean;
    protected _viewMode: string;
    protected _height: string;
    private _caption: string | String | TemplateFunction;
    protected _stringCaption: boolean;
    private _icon: string;
    protected _iconSize: string;
    protected _iconStyle: string;
    protected _hoverIcon: boolean = true;

    private _calculateState(newOptions: IToggleButtonOptions): void {
        const value = newOptions.value;
        this._icon = (newOptions.icons ? (!value && newOptions.icons[1] ? newOptions.icons[1]
                                                                        : newOptions.icons[0]) : '');
        this._hasIcon = !!this._icon;

        this._caption = (newOptions.captions ? (!newOptions.value && newOptions.captions[1] ? newOptions.captions[1]
                                                                                        : newOptions.captions[0]) : '');
        this._stringCaption = typeof this._caption === 'string' || this._caption instanceof String;

        const clonedOptions = {...newOptions};
        clonedOptions.icon = this._icon;
        this._iconSize = this._icon ? ActualApi.iconSize(newOptions.iconSize, this._icon) : '';
        const iconStyles = newOptions.iconStyles || [newOptions.iconStyle];
        const iconStyle = (!value && iconStyles[1] ? iconStyles[1] : iconStyles[0]);
        this._iconStyle = this._icon ? ActualApi.iconStyle(iconStyle, this._icon,
            newOptions.readOnly, this._options.translucent) : '';

        const buttonStyles = newOptions.buttonStyles || [newOptions.buttonStyle];
        const buttonStyle = this._viewMode === 'toolButton' ? 'default' :
            (!value && buttonStyles[1] ? buttonStyles[1] : buttonStyles[0]);
        this._buttonStyle = (newOptions.readOnly ? 'readonly' : buttonStyle) || this._buttonStyle;

        const fontColorStyles = newOptions.fontColorStyles || [newOptions.fontColorStyle];
        const fontColorStyle = this._options.translucent ? 'forTranslucent' :
            (!value && fontColorStyles[1] ? fontColorStyles[1] : fontColorStyles[0]);
        this._fontColorStyle = (newOptions.readOnly ? 'readonly' : fontColorStyle) || this._fontColorStyle;

        if (newOptions.viewMode === 'pushButton' || newOptions.viewMode === 'toolButton') {
            this._hoverIcon = !newOptions.value;
        } else {
            this._hoverIcon = true;
        }
    }

    protected _clickHandler(): void {
        if (!this._options.readOnly) {
            this._notify('valueChanged', [!this._options.value]);
        }
    }

    protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
        if (e.nativeEvent.keyCode === constants.key.enter && !this._options.readOnly) {
            this._notify('click');
        }
    }

    protected _beforeMount(newOptions: IToggleButtonOptions): void {
        // TODO удалить когда актуализируем опции в кнопках у прикладников
        simpleCssStyleGeneration.call(this, newOptions);
        this._calculateState(newOptions);
    }

    protected _beforeUpdate(newOptions: IToggleButtonOptions): void {
        // TODO удалить когда актуализируем опции в кнопках у прикладников
        simpleCssStyleGeneration.call(this, newOptions);
        this._calculateState(newOptions);
    }

    static getDefaultOptions(): object {
        return {
            viewMode: 'button',
            iconStyle: 'secondary',
            contrastBackground: false,
            fontSize: 'm',
            buttonStyle: 'secondary'
        };
    }
}

Object.defineProperty(ToggleButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ToggleButton.getDefaultOptions();
   }
});

/**
 * @name Controls/_toggle/Button#icons
 * @cfg {Array} Пара иконок.
 * Первая иконка отображается, когда переключатель выключен.
 * Вторая иконка отображается, когда переключатель включен.
 * @example
 * Переключатель с одной иконкой:
 * <pre class="brush: html">
 * <Controls.toggle:Button icons="{{['icon-ArrangeList03']}}" iconSize="s"  viewMode="link"/>
 * </pre>
 * Переключатель с двумя иконками:
 * <pre class="brush: html">
 * <Controls.toggle:Button icons="{{['icon-ArrangeList03', 'icon-ArrangeList04']}}" iconStyle="success" iconSize="s"  viewMode="link"/>
 * </pre>
 */

/*
 * @name Controls/_toggle/Button#icons
 * @cfg {Array} Pair of icons.
 * First icon displayed when toggle switch is off.
 * Second icon displayed when toggle switch is on.
 * @example
 * Toggle button with one icon.
 * <pre>
 *    <Controls.toggle:Button icons="{{['icon-ArrangeList03']}}" viewMode="link"/>
 * </pre>
 * Toggle button with two icons.
 * <pre>
 *    <Controls.toggle:Button icons="{{['icon-ArrangeList03', 'icon-ArrangeList04']}}" iconStyle="success" iconSize="s" viewMode="link"/>
 * </pre>
 */

/**
 * @name Controls/_toggle/Button#iconStyles
 * @cfg {Array} Пара стилей для иконок.
 * Первый стиль отображается, когда переключатель выключен.
 * Второй стиль отображается, когда переключатель включен.
 */

/**
 * @name Controls/_toggle/Button#buttonStyles
 * @cfg {Array} Пара стилей для отображения кнопки.
 * Первый стиль отображается, когда переключатель выключен.
 * Второй стиль отображается, когда переключатель включен.
 */

/**
 * @name Controls/_toggle/Button#fontColorStyles
 * @cfg {Array} Пара стилей для заголовков.
 * Первый стиль отображается, когда переключатель выключен.
 * Второй стиль отображается, когда переключатель включен.
 * @demo Controls-demo/toggle/Button/FontColorStyles/Index
 */

/**
 * @name Controls/_toggle/Button#captions
 * @cfg {Array} Пара заголовков.
 * Первый заголовок отображается, когда переключатель в состоянии "включено".
 * Второй заголовок отображается, когда переключатель в состоянии "выключено".
 * @example
 * Переключатель с двумя заголовками:
 * <pre class="brush: html">
 * <Controls.toggle:Button readOnly="{{false}}" captions="{{['Change', 'Save']}}" viewMode="link"/>
 * </pre>
 * Переключатель с одним заголовком
 * <pre class="brush: html">
 * <Controls.toggle:Button readOnly="{{false}}" captions="{{['Save']}}" viewMode="link"/>
 * </pre>
 */

/*
 * @name Controls/_toggle/Button#captions
 * @cfg {Array} Pair of captions.
 * First caption displayed when toggle switch is off.
 * Second caption displayed when toggle switch is on.
 * @example
 * Toggle button with two captions.
 * <pre>
 *    <Controls.toggle:Button readOnly="{{false}}" captions="{{['Change', 'Save']}}" viewMode="link"/>
 * </pre>
 * Toggle button with one caption.
 * <pre>
 *    <Controls.toggle:Button readOnly="{{false}}" captions="{{['Save']}}" viewMode="link"/>
 * </pre>
 */

/**
 * @name Controls/_toggle/Button#viewMode
 * @cfg {String} Режим отображения кнопки.
 * @variant link В виде гиперссылки.
 * @variant toolButton В виде кнопки для панели инструментов.
 * @variant pushButton В виде гиперссылки, которая меняет свой внешний в зажатом состоянии
 * @default link
 * @example
 * Кнопка-переключатель в режиме отображения - 'link'.
 * <pre class="brush: html">
 * <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="primary" viewMode="link" fontSize="3xl"/>
 * </pre>
 * Кнопка-переключатель в режиме отображения - 'toolButton'.
 * <pre class="brush: html">
 * <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="danger" viewMode="toolButton"/>
 * </pre>
 * Кнопка-переключатель в режиме отображения - 'pushButton'.
 * <pre class="brush: html">
 * <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="primary" viewMode="pushButton"/>
 * </pre>
 */

/*
 * @name Controls/_toggle/Button#viewMode
 * @cfg {Enum} Toggle button view mode.
 * @variant link Decorated hyperlink.
 * @variant pushButton Decorated hyperlink transform to toolbar button.
 * @variant toolButton Toolbar button.
 * @default link
 * @example
 * Toggle button with 'link' viewMode.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="primary" viewMode="link" fontSize="3xl"/>
 * </pre>
 * Toggle button with 'toolButton' viewMode.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="danger" viewMode="toolButton"/>
 * </pre>
 * Toggle button with 'pushButton' viewMode.
 * <pre>
 *    <Controls.toggle:Button captions="{{['Send document']}}" buttonStyle="primary" viewMode="pushButton"/>
 * </pre>
 */
export default ToggleButton;
