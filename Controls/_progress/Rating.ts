import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_progress/Rating/Rating';
import {detection} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import RatingViewModel from './Rating/RatingViewModel';
import {descriptor} from 'Types/entity';
import 'css!Controls/progress';

type IconSize = 'default'|'2xs'|'xs'|'s'|'m'|'l';
type IconStyle = 'warning'|'info'|'success'|'danger'|'secondary'|'primary'|'default'|'contrast'|'readonly';
type IconPadding = 'null'|'3xs'|'2xs'|'xs'|'s'|'m'|'l'|'xl';
type TPrecision = 0 | 0.5;
type TIconFill = 'none' | 'full';

const DEFAULT_ICON_SIZE = 's';
const DEFAULT_ICON_PADDING = '3xs';
const DEFAULT_ICON_STYLE = 'warning';
const DEFAULT_EMPTY_ICON_STYLE = 'readonly';

interface IRatingOptions extends IControlOptions {
    value: number;
    precision?: TPrecision;
    readOnly?: boolean;
    iconSize?: IconSize;
    iconStyle?: IconStyle;
    iconPadding?: IconPadding;
    emptyIconStyle?: IconStyle;
    emptyIconFill?: TIconFill;
}

/**
 * Базовый компонент оценок
 * Отображает выделенные звезды в зависимости от оценки
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Fprogress%2FRating%2FIndex демо-пример}
 * @class Controls/progress:Rating
 * @extends UI/Base:Control
 * @implements Controls/progress:IRating
 * @author Нигматуллина Л.Э.
 * @public
 *
 * @demo Controls-demo/progress/Rating/Base/Index
 */

/*
 * Control of rating
 * Render highlighted stars depending on the rating
 * @class Controls/progress:Rating
 * @extends UI/Base:Control
 * @author Nigmatullina L.E.
 * @public
 *
 * @demo Controls-demo/progress/Rating/Index
 */
class Rating extends Control<IRatingOptions> {
    protected _template: TemplateFunction = template;
    protected _viewModel: RatingViewModel;
    protected _correctValue: number;                //TODO precision сделан неправильно, надо править прикладников
    protected _correctPrecision: number;            //TODO precision сделан неправильно, надо править прикладников

    protected _beforeMount(options: IRatingOptions): void {
        this._viewModel = new RatingViewModel({
            value: options.value,
            precision: options.precision,
            iconStyle: options.iconStyle,
            emptyIconStyle: options.emptyIconStyle,
            emptyIconFill: options.emptyIconFill
        });
    }

    protected _beforeUpdate(options: IRatingOptions): void {
        const valueChanged = this._options.value !== options.value;
        const precisionChanged = this._options.precision !== options.precision;

        if (valueChanged || precisionChanged
            || options.iconStyle !== this._options.iconStyle
            || options.emptyIconStyle !== this._options.emptyIconStyle) {

            this._viewModel.setOptions({
                value: options.value,
                precision: options.precision,
                iconStyle: options.iconStyle,
                emptyIconStyle: options.emptyIconStyle,
                emptyIconFill: options.emptyIconFill
            });
        }
    }

    private _onHoverStar(event: SyntheticEvent<Event>, id: number): void {
        if (!this._options.readOnly && !detection.isMobilePlatform) {
            this._viewModel.setValue(id);
        }
    }

    private _onHoverOutStar(): void {
        if (!this._options.readOnly && !detection.isMobilePlatform) {
            this._viewModel.setValue(this._options.value);
        }
    }

    private _clickStar(event: SyntheticEvent<Event>, id: number): void {
        if (!this._options.readOnly) {
            if (this._options.value !== id) {
                this._notify('valueChanged', [id]);
            }
            this._notify('precisionChanged', [0]);
        }
    }
    static getDefaultOptions(): object {
        return {
            readOnly: false,
            precision: 0,
            iconPadding: DEFAULT_ICON_PADDING,
            iconSize: DEFAULT_ICON_SIZE,
            iconStyle: DEFAULT_ICON_STYLE,
            emptyIconStyle: DEFAULT_EMPTY_ICON_STYLE
        };
    }
    static getOptionTypes(): object {
        return {
            precision: descriptor(Number).oneOf([
                0, 0.5
            ])
        };
    }
}

Object.defineProperty(Rating, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Rating.getDefaultOptions();
    }
});

/**
 * @name Controls/progress:Rating#value
 * @cfg {Number} Количество заполненных звезд
 * @demo Controls-demo/progress/Rating/Base/Index
 * @remark
 * Число от 1 до 5. Допускается ввод дробных чисел. Если десятичное значение value больше половины целого значения, и в precision установленно 0.5, то показывается пол.звезды.
 * @see Controls/progress:Rating#precision
 */
/*
 * @name Controls/progress:Rating#value
 * @cfg {Number} Number of highlighted stars
 * @remark
 * An float from 1 to 5.
 */
/**
 * @name Controls/progress:Rating#precision
 * @cfg {Number} Точность рейтинга
 * @variable 0 - отображение полностью закрашенных звезд
 * @variable 0.5 - отображение закрашенных на половину звезд
 * @default 0
 * @demo Controls-demo/progress/Rating/Base/Index
 * @remark
 * Если десятичное значение value больше половины целого значения, и в precision установленно 0.5, то показывается пол.звезды.
 * 3,44 – 3 звезды. 3,56 – 3 с половиной здезды
 */
/*
 * @name Controls/progress:Rating#precision
 * @cfg {Number} precision rating
 * @variable 0 - displays fully filled stars
 * @variable 0.5 - display half-filled stars
 * @ default 0
 * @remark
 * If the decimal "value" of value is more than half an integer value, and exactly 0.5 is set, then a half star is shown.
 * 3,44 – 3 highlighted stars. 3,56 – 3 with half highlighted stars
 */

/**
 * @name Controls/progress:Rating#iconSize
 * @cfg {String} Размер иконки звезды.
 * @variant default
 * @variant 2xs
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @see iconPadding
 * @see iconStyle
 * @see emptyIconStyle
 * @demo Controls-demo/progress/Rating/IconSize/Index
 */
/*
 * @name Controls/progress:Rating#iconSize
 * @cfg {String} Star size
 * @remark
 * Possible values:
 * * default
 * * 2xs
 * * xs
 * * s
 * * m
 * * l
 */
/**
 * @name Controls/progress:Rating#iconStyle
 * @cfg {String} Цвет заполненной звезды.
 * @variant warning
 * @variant info
 * @variant success
 * @variant danger
 * @variant secondary
 * @variant primary
 * @variant default
 * @variant contrast
 * @see iconSize
 * @see iconPadding
 * @see emptyIconStyle
 * @demo Controls-demo/progress/Rating/IconStyle/Index
 */
/*
 * @name Controls/progress:Rating#iconStyle
 * @cfg {String} Color of highlighted star
 * @remark
 * Possible values:
 * * warning
 * * info
 * * success
 * * danger
 * * secondary
 * * primary
 * * default
 * * contrast
 */
/**
 * @name Controls/progress:Rating#iconPadding
 * @cfg {String} Расстояние между звездами.
 * @variant null
 * @variant 2xs
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @see iconSize
 * @see iconStyle
 * @see emptyIconStyle
 * @demo Controls-demo/progress/Rating/IconPadding/Index
 */
/*
 * @name Controls/progress:Rating#iconPadding
 * @cfg {Number} Distance between stars
 * @remark
 * Possible values:
 * * null
 * * 2xs
 * * xs
 * * s
 * * m
 * * l
 * * xl
 */
/**
 * @name Controls/progress:Rating#emptyIconStyle
 * @cfg {String} Цвет пустой звезды.
 * @variant warning
 * @variant info
 * @variant success
 * @variant danger
 * @variant secondary
 * @variant primary
 * @variant default
 * @variant contrast
 * @variant readonly
 * @see iconPadding
 * @see iconStyle
 * @see iconSize
 * @demo Controls-demo/progress/Rating/EmptyIconStyle/Index
 */
/*
 * @name Controls/progress:Rating#emptyIconStyle
 * @cfg {String} Color of empty star
 * @remark
 * Possible values:
 * * warning
 * * info
 * * success
 * * danger
 * * secondary
 * * primary
 * * default
 * * contrast
 * * readonly
 */
/**
 * @name Controls/progress:Rating#emptyIconFill
 * @cfg {String} Заливка пустой звезды
 * @variant none Заливки нет, есть только контур
 * @variant full Заливка есть
 * @see iconPadding
 * @see iconStyle
 * @see iconSize
 * @demo Controls-demo/progress/Rating/EmptyIconFill/Index
 * @remark Обратите внимание, если опция установлена в значение full, то значения опций iconStyle и emptyIconStyle должны различаться
 */
export default Rating;
