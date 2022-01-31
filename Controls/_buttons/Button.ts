import {Control, TemplateFunction} from 'UI/Base';
import {IButton, IButtonOptions} from './interface/IButton';
import {IClick} from './interface/IClick';
import {isSVGIcon, getIcon} from '../Utils/Icon';
import {
    ICaption,
    IFontColorStyle,
    IFontSize,
    IHeight,
    IIcon,
    IIconSize,
    IIconStyle,
    ITooltip,
    IHref
} from 'Controls/interface';
import {SyntheticEvent} from 'Vdom/Vdom';
import ButtonTemplate = require('wml!Controls/_buttons/Button');
import {descriptor} from 'Types/entity';
import {constants} from 'Env/Env';
import {getTextWidth} from 'Controls/sizeUtils';
import 'wml!Controls/_buttons/ButtonBase';
import 'css!Controls/buttons';
import 'css!Controls/CommonClasses';
import {default as WorkByKeyboardContext, IWorkByKeyboardContext} from '../Context/WorkByKeyboardContext';

export function defaultHeight(viewMode: string): string {
    if (viewMode === 'button') {
        return 'default';
    } else if (viewMode === 'toolButton' || viewMode === 'pushButton' || viewMode === 'functionalButton') {
        return 'l';
    }
}

export function defaultFontColorStyle(viewMode: string): string {
    if (viewMode === 'link' || viewMode === 'linkButton') {
        return 'link';
    }
}

export function simpleCssStyleGeneration(options: IButtonOptions): void {
    this._buttonStyle = options.readOnly ? 'readonly' :
        (options.viewMode === 'toolButton' ? 'default' : options.buttonStyle);
    this._contrastBackground = options.contrastBackground === undefined ?
        options.viewMode === 'functionalButton' : options.contrastBackground;
    this._viewMode = options.viewMode;
    this._height = options.inlineHeight ? options.inlineHeight : defaultHeight(this._viewMode);
    this._fontColorStyle = options.translucent ? 'forTranslucent' :
        (options.fontColorStyle ? options.fontColorStyle : defaultFontColorStyle(this._viewMode));
    this._fontSize = options.fontSize;
    this._hasIcon = !!options.icon;
    const isTextAlignCenter = ['functionalButton', 'toolButton'].includes(this._viewMode);
    if (this._viewMode === 'button') {
        this._textAlign = options.textAlign;
    } else if (isTextAlignCenter) {
        this._textAlign = 'center';
    } else {
        this._textAlign = 'none';
    }

    // todo Будет поправлено после https://online.sbis.ru/opendoc.html?guid=fe814684-f63f-4f72-8244-54e3ed7091de
    if (this._buttonStyle === 'unaccented' && this._contrastBackground &&
        (!this._fontColorStyle || this._fontColorStyle === 'contrast')) {
        this._fontColorStyle = 'default';
    }

    this._caption = options.caption;
    // На сервере rk создает инстанс String'a, проверки на typeof недостаточно
    this._stringCaption = typeof options.caption === 'string' || options.caption instanceof String;
    this._captionPosition = options.captionPosition || 'right';
    this._isSVGIcon = isSVGIcon(options.icon);
    this._icon = getIcon(options.icon);
    if (options.icon) {
        this._iconSize = options.iconSize;
        if (options.readOnly) {
            this._iconStyle = 'readonly';
        } else {
            this._iconStyle = options.translucent ? 'forTranslucent' : options.iconStyle;
        }
    }
    if (this._viewMode === 'linkButton') {
        this._viewMode = 'link';
        if (!this._height) {
            this._height = 'default';
        }
    }
}

export function getDefaultOptions(): object {
    return {
        viewMode: 'button',
        iconStyle: 'secondary',
        iconSize: 'm',
        captionPosition: 'right',
        fontSize: 'm',
        buttonStyle: 'secondary',
        textAlign: 'center',
        translucent: false
    };
}

/**
 * Графический контрол, который предоставляет пользователю возможность простого запуска события при нажатии на него.
 *
 * @remark
 * Кнопки могут отображаться в нескольких режимах, отличающихся друга от друга внешне.
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/buttons-switches/buttons-links/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_buttons.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/interface:IHref
 * @mixes Controls/buttons:IButton
 * @implements Controls/interface:ICaption
 * @mixes Controls/buttons:IClick
 * @implements Controls/interface:IIcon
 * @implements Controls/interface:IIconStyle
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:ITooltip
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/Buttons/ViewModes/Index
 */

/*
 * Graphical control element that provides the user a simple way to trigger an event.
 *
 * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex">Demo-example</a>.
 *
 * @class Controls/_buttons/Button
 * @extends UI/Base:Control
 * @implements Controls/interface:IHref
 * @mixes Controls/buttons:IButton
 * @implements Controls/interface:ICaption
 * @mixes Controls/buttons:IClick
 * @implements Controls/interface:IIcon
 * @implements Controls/interface:IIconStyle
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:ITooltip
 *
 * @public
 * @author Мочалов М.А.
 * @demo Controls-demo/Buttons/ViewModes/Index
 */
class Button extends Control<IButtonOptions> implements IHref, ICaption, IIcon, IIconStyle, ITooltip, IIconSize,
    IClick, IFontColorStyle, IFontSize, IHeight, IButton {
    protected _template: TemplateFunction = ButtonTemplate;

    // Называть _style нельзя, так как это состояние используется для темизации
    protected _buttonStyle: string;
    protected _fontColorStyle: string;
    protected _fontSize: string;
    protected _contrastBackground: boolean;
    protected _hasIcon: boolean;
    protected _viewMode: string;
    protected _height: string;
    protected _caption: string | TemplateFunction;
    protected _stringCaption: boolean;
    protected _captionPosition: string;
    protected _icon: string;
    protected _iconSize: string;
    protected _iconStyle: string;
    protected _hoverIcon: boolean = true;
    protected _isSVGIcon: boolean = false;
    protected _textAlign: string;
    protected _tooltip: string;
    protected _workByKeyboard: WorkByKeyboardContext;

    protected _beforeMount(options: IButtonOptions, context: IWorkByKeyboardContext = {}): void {
        simpleCssStyleGeneration.call(this, options);
        this._tooltip = options.tooltip;
        this._workByKeyboard = context.workByKeyboard;
    }

    protected _beforeUpdate(newOptions: IButtonOptions, context: IWorkByKeyboardContext = {}): void {
        simpleCssStyleGeneration.call(this, newOptions);
        if (this._options.tooltip !== newOptions.tooltip) {
            this._tooltip = newOptions.tooltip;
        }
        if (this._workByKeyboard !== context.workByKeyboard) {
            this._workByKeyboard = context.workByKeyboard;
        }
    }

    protected _highlightedOnFocus(): boolean {
        return !!this._workByKeyboard?.status && !this._options.readOnly;
    }

    protected _keyUpHandler(e: SyntheticEvent<KeyboardEvent>): void {
        if (e.nativeEvent.keyCode === constants.key.enter && !this._options.readOnly) {
            this._notify('click');
        }
    }

    protected _clickHandler(e: SyntheticEvent<MouseEvent>): void {
        if (this._options.readOnly) {
            e.stopPropagation();
        }
    }

    protected _onMouseEnterHandler(): void {
        if (!this._options.readOnly) {
            if (!this._tooltip && typeof this._options.caption === 'string' &&
                this._tooltip !== this._options.caption) {
                const captionWidth = getTextWidth(this._options.caption);
                if (captionWidth > this._container.clientWidth) {
                    this._tooltip = this._options.caption;
                }
            }
        }
    }

    static getDefaultOptions(): object {
        return getDefaultOptions();
    }

    static getOptionTypes(): object {
        return {
            contrastBackground: descriptor(Boolean)
        };
    }

    static contextTypes(): object {
        return {
            workByKeyboard: WorkByKeyboardContext
        };
    }
}

Object.defineProperty(Button, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Button.getDefaultOptions();
    }
});

/**
 * @name Controls/_buttons/Button#viewMode
 * @cfg {String} Режим отображения кнопки.
 * @variant button В виде обычной кнопки по-умолчанию.
 * @variant link В виде гиперссылки.
 * @variant linkButton В виде гиперссылки, имеет высоту.
 * @variant toolButton В виде кнопки для панели инструментов.
 * @variant functionalButton В виде кнопки выполняющей определенную функцию, например добавление или сохранение.
 * @default button
 * @demo Controls-demo/Buttons/ViewModes/Index
 * @example
 * Кнопка в режиме отображения "linkButton".
 * <pre class="brush: html; highlight: [5]">
 * <!-- WML -->
 * <Controls.buttons:Button
 *    caption="Send document"
 *    buttonStyle="primary"
 *    viewMode="linkButton"
 *    fontSize="3xl"/>
 * </pre>
 * Кнопка в режиме отображения "toolButton".
 * <pre class="brush: html; highlight: [5]">
 * <!-- WML -->
 * <Controls.buttons:Button
 *    caption="Send document"
 *    buttonStyle="danger"
 *    viewMode="toolButton"/>
 * </pre>
 * Кнопка в режиме отображения "button".
 * <pre class="brush: html; highlight: [5]">
 * <!-- WML -->
 * <Controls.buttons:Button
 *    caption="Send document"
 *    buttonStyle="success"
 *    viewMode="button"/>
 * </pre>
 * Кнопка в режиме отображения "link".
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.buttons:Button
 *    caption="Send document"
 *    viewMode="link"/>
 * </pre>
 * @see Size
 */

/*
 * @name Controls/_buttons/Button#viewMode
 * @cfg {Enum} Button view mode.
 * @variant link Decorated hyperlink.
 * @variant button Default button.
 * @variant toolButton Toolbar button.
 * @default button
 * @example
 * Button with 'link' viewMode.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="link" fontSize="3xl"/>
 * </pre>
 * Button with 'toolButton' viewMode.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="danger" viewMode="toolButton"/>
 * </pre>
 * Button with 'button' viewMode.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="success" viewMode="button"/>
 * </pre>
 * @see Size
 */

/**
 * @name Controls/_buttons/Button#textAlign
 * @cfg {String} Выравнивание текста кнопки.
 * @variant left Текст выравнивается по левой стороне.
 * @variant right Текст выравнивается по правой стороне.
 * @variant center Текст выравнивается по центру.
 * @variant justify Текст и иконка прижаты к разным краям.
 * @default center
 * @demo Controls-demo/Buttons/TextAlign/Index
 */

/**
 * @name Controls/_buttons/Button#fontColorStyle
 * @cfg {String}
 * @demo Controls-demo/Buttons/FontStyles/Index
 */

/**
 * @name Controls/_buttons/Button#href
 * @cfg {String}
 * @demo Controls-demo/Buttons/Href/Index
 */

/**
 * @name Controls/_buttons/Button#iconStyle
 * @cfg {String}
 * @demo Controls-demo/Buttons/IconStyles/Index
 */

/**
 * @name Controls/_buttons/Button#tooltip
 * @cfg {String}
 * @demo Controls-demo/Buttons/Tooltip/Index
 */

/**
 * @name Controls/_buttons/Button#translucent
 * @cfg {Boolean}
 * @demo Controls-demo/Buttons/Translucent/Index
 */

/**
 * @name Controls/_buttons/Button#captionPosition
 * @cfg {String} Определяет, с какой стороны расположен текст кнопки относительно иконки.
 * @variant left Текст расположен перед иконкой.
 * @variant right Текст расположен после иконки.
 * @default right
 * @demo Controls-demo/Buttons/CaptionPosition/Index
 */

/*
 * @name Controls/_buttons/Button#captionPosition
 * @cfg {String} Determines on which side of the icon caption is located.
 * @variant left Caption before icon.
 * @variant right Icon before caption.
 * @default right
 */

/**
 * @name Controls/_buttons/Button#fontSize
 * @cfg {String}
 * @demo Controls-demo/Buttons/SizesAndHeights/Index
 * @default m
 * @example
 * <pre class="brush: html">
 * <Controls.buttons:Button icon="icon-Add" fontSize="xl" viewMode="button"/>
 * </pre>
 */

/**
 * @name Controls/_buttons/Button#contrastBackground
 * @cfg {Boolean}
 * @default false (Когда опция {@link Controls/buttons:Button#viewMode viewMode} установлена в значение functionalButton, то для опции contrastBackground значение по умолчанию - true.)
 * @remark
 * Опция используется для акцентирования внимания на кнопке, и ее визуального выделения относительно окружения.
 * @demo Controls-demo/Buttons/ContrastBackground/Index
 * @example
 * У кнопки контрастный фон.
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.buttons:Button
 *    caption="Send document"
 *    buttonStyle="primary"
 *    viewMode="toolButton"
 *    contrastBackground="{{true}}" />
 * </pre>
 * @see style
 */

/*
 * @name Controls/_buttons/Button#contrastBackground
 * @cfg
 * @default true
 * @example
 * Button has transparent background.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="toolButton" contrastBackground="{{false}}" inlineHeight="xl"/>
 * </pre>
 * Button hasn't transparent background.
 * <pre>
 *    <Controls.buttons:Button caption="Send document" buttonStyle="primary" viewMode="toolButton" />
 * </pre>
 * @see style
 */

export default Button;
