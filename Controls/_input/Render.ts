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
import {IBorderVisibilityArea} from './interface/IBorderVisibilityArea';

// @ts-ignore
import * as template from 'wml!Controls/_input/Render/Render';
import {getContextTypes} from '../Context/WorkByKeyboardUtil';

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
    right: boolean;
    bottom: boolean;
    left: boolean;
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

const FOCUSED_TIMEOUT = 700;

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
 * @author Красильников А.С.
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

    readonly '[Controls/_interface/IHeight]': boolean = true;
    readonly '[Controls/_interface/IFontSize]': boolean = true;
    readonly '[Controls/_interface/IFontWeight]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IValidationStatus]': boolean = true;
    readonly '[Controls/interface/IBorderStyle]': boolean = true;
    readonly '[Controls/interface/IBorderVisibility]': boolean = true;
    readonly '[Controls/_interface/IContrastBackground]': boolean = true;
    private _focusedStatus: string;
    private _focusedTimeout: number;

    private _clearTimeout(): void {
        if (this._focusedTimeout) {
            clearTimeout(this._focusedTimeout);
            this._focusedTimeout = null;
        }
    }

    protected _focusInHandler(): void {
        if (this.context.get('workByKeyboard')?.status) {
            this._focusedStatus = 'active';
            this._options.viewModel.selection = 0;
            this._clearTimeout();
            this._focusedTimeout = setTimeout(() => {
                this._focusedStatus = 'default';
                this._options.viewModel.selection = {
                    start: 0,
                    end: this._options.viewModel.displayValue.length
                };
            }, FOCUSED_TIMEOUT);
        }
    }
    protected _focusOutHandler(): void {
        this._focusedStatus = 'default';
        this._clearTimeout();
    }

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

    protected _tagClickHandler(event: SyntheticEvent<MouseEvent>): void {
        this._notify('tagClick', [this._children.tag]);
    }

    protected _tagHoverHandler(event: SyntheticEvent<MouseEvent>): void {
        this._notify('tagHover', [this._children.tag]);
    }

    protected _beforeMount(options: IRenderOptions): void {
        this._border = Render._detectToBorder(options.borderVisibility, options.minLines, options.contrastBackground);
        this._fontWeight = Render._getFontWeight(options.fontWeight, options.fontSize);
        this._setState(options);
        this._updateHorizontalPadding(options);
        this._updateFieldZIndex(options);
    }

    protected _beforeUnmount(): void {
        this._clearTimeout();
    }

    protected _beforeUpdate(options: IRenderOptions): void {
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
        this._setState(options);
        this._updateHorizontalPadding(options);
        this._updateFieldZIndex(options);
        if (!this.context.get('workByKeyboard')?.status && this._focusedStatus === 'active') {
            this._focusedStatus = 'default';
        }
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

    private static notSupportFocusWithin(): boolean {
        return detection.isIE || (detection.isWinXP && detection.yandex);
    }

    private static _detectToBorder(borderVisibility: TBorderVisibility | IBorderVisibilityArea,
                                   minLines: number,
                                   contrastBackground: boolean): IBorder {
        switch (borderVisibility) {
            case 'visible':
                return {
                    top: true,
                    right: true,
                    bottom: true,
                    left: true
                };
            case 'partial':
                return {
                    top: minLines > 1 && !contrastBackground,
                    right: false,
                    bottom: true,
                    left: false
                };
            case 'hidden':
                return {
                    top: false,
                    right: false,
                    bottom: false,
                    left: false
                };
            case 'bottom':
                return {
                    top: false,
                    right: false,
                    bottom: true,
                    left: false
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
        return getContextTypes();
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
