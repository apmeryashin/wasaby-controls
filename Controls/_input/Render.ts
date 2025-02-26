import {detection} from 'Env/Env';
import {descriptor} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/input';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    IHeight, IHeightOptions, IFontColorStyle,
    IFontColorStyleOptions, IFontSize, IFontSizeOptions, IFontWeightOptions, IFontWeight,
    IBorderStyle, IBorderStyleOptions, IValidationStatus,
    IValidationStatusOptions, IContrastBackground
} from 'Controls/interface';
import {
    TBorderVisibility, IBorderVisibilityOptions,
    getDefaultBorderVisibilityOptions, getOptionBorderVisibilityTypes, IBorderVisibility
} from './interface/IBorderVisibility';
import {TBorderVisibilityArea} from './interface/IBorderVisibilityArea';

// @ts-ignore
import * as template from 'wml!Controls/_input/Render/Render';
import {default as WorkByKeyboardContext, IWorkByKeyboardContext} from 'Controls/Context/WorkByKeyboardContext';

type State =
    'valid'
    | 'valid-active'
    | 'invalid'
    | 'invalid-active'
    | 'invalidAccent'
    | 'invalidAccent-active'
    | 'readonly'
    | 'readonly-multiline'
    | 'success'
    | 'secondary'
    | 'warning';

export interface IBorder {
    top: boolean;
    bottom: boolean;
}

export interface IRenderOptions extends IControlOptions, IHeightOptions, IBorderVisibilityOptions,
    IFontColorStyleOptions, IFontSizeOptions, IFontWeightOptions, IValidationStatusOptions, IBorderStyleOptions {
    /**
     * @name Controls/_input/Render#multiline
     * @cfg {Boolean} Определяет режим рендеринга текстового поля.
     * @remark
     * * false - однострочный режим.
     * * true - многострочный режим.
     */
    multiline: boolean;
    /**
     * @name Controls/_input/Render#roundBorder
     * @cfg {Boolean} Определяет скругление рамки текстого поля.
     * @remark
     * * false - квадратная рамка.
     * * true - круглая рамка.
     */
    roundBorder: boolean;

    /**
     * @name Controls/_input/Render#content
     * @cfg {HTMLElement} Шаблон текстового поля
     */
    content: TemplateFunction;
    /**
     * @name Controls/_input/Render#leftFieldWrapper
     * @cfg {HTMLElement}
     */
    leftFieldWrapper?: TemplateFunction;
    /**
     * @name Controls/_input/Render#rightFieldWrapper
     * @cfg {HTMLElement}
     */
    rightFieldWrapper?: TemplateFunction;
    state: string;
    border: IBorder;
    wasActionByUser: boolean;
    minLines?: number;
    horizontalPadding?: string;

    /**
     * @name Controls/_input/Render#contrastBackground
     * @cfg {Boolean} Определяет контрастность фона контрола по отношению к ее окружению.
     * @default true
     * @variant true Контрастный фон.
     * @variant false Фон, гармонично сочетающийся с окружением.
     * @demo Controls-demo/Input/ContrastBackground/Index
     */
    contrastBackground: boolean;
}

/**
 * Контрол для рендеринга текстового поля.
 *
 * @class Controls/_input/Render
 * @extends UICore/Base:Control
 *
 * @implements Controls/interface:IHeight
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IFontWeight
 * @implements Controls/interface:IBorderStyle
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IValidationStatus
 * @mixes Controls/input:ITag
 * @mixes Controls/input:IBorderVisibility
 * @implements Controls/interface:IContrastBackground
 *
 * @author Мочалов М.А.
 * @private
 */

/**
 * @name Controls/_input/Render#fontWeight
 * @demo Controls-demo/Input/FontWeight/Index
 */

class Render extends Control<IRenderOptions> implements IHeight, IFontColorStyle, IFontSize, IFontWeight,
                                                        IValidationStatus, IBorderStyle,
                                                        IBorderVisibility, IContrastBackground {
    protected _tag: SVGElement | null = null;
    private _border: IBorder = null;
    private _contentActive: boolean = false;

    protected _state: string;
    protected _statePrefix: string;
    protected _fontSize: string;
    protected _fontWeight: string;
    protected _inlineHeight: string;
    protected _fontColorStyle: string;
    protected _horizontalPadding: string;
    protected _template: TemplateFunction = template;
    protected _isFieldZIndex: boolean = false;
    protected _workByKeyboard: WorkByKeyboardContext;

    readonly '[Controls/_interface/IHeight]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IValidationStatus]': boolean = true;
    readonly '[Controls/interface/IBorderStyle]': boolean = true;
    readonly '[Controls/interface/IBorderVisibility]': boolean = true;
    readonly '[Controls/_interface/IContrastBackground]': boolean = true;

    private _setState(options: IRenderOptions): void {
        if (options.state === '') {
            this._state = `${this._calcState(options)}`;
            this._statePrefix = '';
        } else {
            this._state = `${options.state}-${this._calcState(options)}`;
            this._statePrefix = `_${options.state}`;
        }
    }

    private _calcState(options: IRenderOptions): State {
        if (options.readOnly) {
            if (options.multiline) {
                return 'readonly-multiline';
            }

            return 'readonly';
        }
        if (options.borderStyle && options.validationStatus === 'valid') {
            return options.borderStyle;
        }

        if (this._contentActive && Render.notSupportFocusWithin()) {
            return options.validationStatus + '-active';
        }
        return options.validationStatus;
    }

    protected _highlightedOnFocus(): boolean {
        return !!this._workByKeyboard?.status && !this._options.readOnly;
    }

    protected _tagClickHandler(event: SyntheticEvent<MouseEvent>): void {
        this._notify('tagClick', [this._children.tag]);
    }

    protected _tagHoverHandler(event: SyntheticEvent<MouseEvent>): void {
        this._notify('tagHover', [this._children.tag]);
    }

    protected _beforeMount(options: IRenderOptions, context: IWorkByKeyboardContext = {}): void {
        this._border = Render._detectToBorder(options.borderVisibility, options.minLines, options.contrastBackground);
        this._fontWeight = Render._getFontWeight(options.fontWeight, options.fontSize);
        this._setState(options);
        this._updateHorizontalPadding(options);
        this._updateFieldZIndex(options);
        this._workByKeyboard = context.workByKeyboard;
    }

    protected _beforeUpdate(options: IRenderOptions, context: IWorkByKeyboardContext = {}): void {
        if (options.borderVisibility !== this._options.borderVisibility ||
            options.minLines !== this._options.minLines ||
            options.contrastBackground !== this._options.contrastBackground
        ) {
            this._border = Render._detectToBorder(
                options.borderVisibility, options.minLines, options.contrastBackground
            );
        }
        if (options.fontWeight !== this._options.fontWeight || options.fontSize !== this._options.fontSize) {
            this._fontWeight = Render._getFontWeight(options.fontWeight, options.fontSize);
        }
        if (this._workByKeyboard !== context.workByKeyboard) {
            this._workByKeyboard = context.workByKeyboard;
        }
        this._setState(options);
        this._updateHorizontalPadding(options);
        this._updateFieldZIndex(options);
    }

    protected _updateFieldZIndex(options: IRenderOptions): void {
        this._isFieldZIndex = typeof options.placeholder === 'string';
    }

    private _updateHorizontalPadding(options: IRenderOptions): void {
        let padding;
        if (options.horizontalPadding) {
            padding = options.horizontalPadding;
        } else if (options.contrastBackground !== false) {
            padding = 'xs';
        } else {
            padding = 'null';
        }
        this._horizontalPadding = padding;
    }

    protected _setContentActive(event: SyntheticEvent<FocusEvent>, newContentActive: boolean): void {
        this._contentActive = newContentActive;

        this._setState(this._options);
    }

    protected _getBorderClass(): string {
        if (this._options.borderVisibility !== 'hidden') {
            return ((this._border.top ? 'controls-Render_border-top' : 'controls-Render_border-top-empty') +
                (this._border.bottom ? ' controls-Render_border-bottom' : ' controls-Render_border-bottom-empty'));
        }
        return '';
    }

    private static notSupportFocusWithin(): boolean {
        return detection.isIE || (detection.isWinXP && detection.yandex);
    }

    private static _detectToBorder(borderVisibility: TBorderVisibility | TBorderVisibilityArea,
                                   minLines: number,
                                   contrastBackground: boolean): IBorder {
        switch (borderVisibility) {
            case 'hidden':
                return {
                    top: false,
                    bottom: false
                };
            case 'bottom':
                return {
                    top: false,
                    bottom: true
                };
            default:
                return {
                    top: minLines > 1 && !contrastBackground,
                    bottom: true
                };
        }
    }

    private static _getFontWeight(fontWeight: string, fontSize: string): string {
        if (fontWeight) {
            return fontWeight;
        } else if (fontSize === '3xl') {
            return 'bold';
        }

        return 'default';
    }

    static getDefaultTypes(): object {
        return {
            ...getOptionBorderVisibilityTypes(),
            content: descriptor(Function).required(),
            rightFieldWrapper: descriptor(Function),
            leftFieldWrapper: descriptor(Function),
            multiline: descriptor(Boolean).required(),
            roundBorder: descriptor(Boolean).required(),
            contrastBackground: descriptor(Boolean)
        };
    }

    static getDefaultOptions(): Partial<IRenderOptions> {
        return {
            ...getDefaultBorderVisibilityOptions(),
            contrastBackground: true,
            state: '',
            validationStatus: 'valid'
        };
    }

    static contextTypes(): object {
        return {
            workByKeyboard: WorkByKeyboardContext
        };
    }
}

Object.defineProperty(Render, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Render.getDefaultOptions();
   }
});

export default Render;
