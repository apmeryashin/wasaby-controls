import {descriptor} from 'Types/entity';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    IValidationStatus, IValidationStatusOptions, TValidationStatus,
    TBorderVisibility, ICaption, ICaptionOptions
} from 'Controls/interface';
import 'css!Controls/jumpingLabel';

type TBaseValidationStatus = 'valid' | 'invalid';
type TValidationFontColorStyle = 'default' | 'accent';

/**
 * @interface Controls/_jumpingLabel/IBaseOptions
 * @public
 * @author Красильников А.С.
 */
export interface IBaseOptions extends IControlOptions, IValidationStatusOptions, ICaptionOptions {
    content: TemplateFunction;
    /**
     * Определяет оформление в зависимости от контрастности фона.
     */
    contrastBackground: boolean;
    /**
     * Стиль цвета текста контрола провалившего валидацию.
     */
    validationFontColorStyle: TValidationFontColorStyle;
}

/**
 * Абстрактный класс для реализации контрола, добавляющего поведение прыгающей метки к своему контенту.
 *
 * @class Controls/_jumpingLabel/Base
 * @extends UI/Base:Control
 *
 * @implements Controls/jumpingLabel:IBaseOptions
 * @implements Controls/interface:IValidationStatus
 *
 * @public
 * @demo Controls-demo/JumpingLabel/Index
 *
 * @author Красильников А.С.
 */

/**
 * @name Controls/_jumpingLabel/Base#required
 * @cfg {Boolean} В значении true справа от метки отображается символ "*" (поле обязательно к заполнению).
 * @demo Controls-demo/JumpingLabel/Required/Index
 */

abstract class Base<T extends IBaseOptions = IBaseOptions>
    extends Control<T> implements IValidationStatus, ICaption {
    protected _showFromAbove: boolean = null;
    protected _fontColorStyle: string = null;
    protected _validationStatus: string = null;
    protected _horizontalPadding: string = null;
    protected _containerHorizontalPadding: string = null;
    protected _borderVisibility: TBorderVisibility = null;

    readonly '[Controls/_interface/ICaption]': boolean = true;
    readonly '[Controls/_interface/IValidationStatus]': boolean = true;

    protected _beforeMount(options?: T, contexts?: object, receivedState?: void): Promise<void> | void {
        this._borderVisibility = Base._detectToBorderVisibility();
        this._setShowFromAbove(options);
        this._setStateByOptions(options);

        return super._beforeMount(options, contexts, receivedState);
    }

    protected _beforeUpdate(options?: T, contexts?: any): void {
        this._setStateByOptions(options);
        if (this._options.value !== options.value) {
            this._setShowFromAbove(options);
        }

        super._beforeUpdate(options, contexts);
    }

    private _setStateByOptions(options: T): void {
        this._horizontalPadding = Base._detectToHorizontalPadding(options.contrastBackground);
        this._containerHorizontalPadding = Base._detectToHorizontalPadding(!options.contrastBackground);
        this._fontColorStyle = Base._detectToFontColorStyle(
            options.validationStatus, options.validationFontColorStyle
        );
        this._validationStatus = Base._detectToValidationStatus(options.validationStatus);
    }

    protected abstract _setShowFromAbove(options: T): void;

    private static _detectToHorizontalPadding(contrastBackground: boolean): string {
        return contrastBackground ? 'xs' : 'null';
    }

    private static _detectToBorderVisibility(): TBorderVisibility {
        return 'partial';
    }

    private static _detectToFontColorStyle(
        validationStatus: TValidationStatus, validationFontColorStyle: TValidationFontColorStyle
    ): string {
        if (validationStatus === 'valid') {
            return 'valid';
        } else {
            return `invalid-${validationFontColorStyle}`;
        }
    }

    private static _detectToValidationStatus(validationStatus: TValidationStatus): TBaseValidationStatus {
        /**
         * Для полей ввода с оформлением, которое задается через HOC, стандартом не предусмотрено значение invalidAccent(при фокусе меняется background).
         * Этот код при надобности может быть перенесен в поля ввода с проверкой на опцию borderVisibility === 'partial'.
         */
        if (validationStatus === 'valid') {
            return 'valid';
        } else {
            return 'invalid';
        }
    }

    static getDefaultOptions(): object {
        return {
            validationStatus: 'valid',
            required: false,
            validationFontColorStyle: 'default'
        };
    }

    static getOptionTypes(): object {
        return {
            validationStatus: descriptor<string>(String),
            caption: descriptor<string>(String).required(),
            inputDisplayValue: descriptor<null | string>(null, String),
            validationFontColorStyle: descriptor<string>(String).oneOf(['default', 'accent'])
        };
    }
}

Object.defineProperty(Base, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Base.getDefaultOptions();
   }
});

export default Base;
