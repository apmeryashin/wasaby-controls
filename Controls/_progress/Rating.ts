import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/progress:IRating/Rating';
import {detection} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';

type IconSize = 'default'|'2xs'|'xs'|'s'|'m'|'l';
type IconStyle = 'warning'|'info'|'success'|'danger'|'secondary'|'primary'|'default'|'contrast'|'readonly';
type IconPadding = 'null'|'3xs'|'2xs'|'xs'|'s'|'m'|'l'|'xl';
type StarType = 'star'|'halfStar'|'emptyStar';

const DEFAULT_ICON_SIZE = 's';
const DEFAULT_ICON_PADDING = '3xs';
const DEFAULT_ICON_STYLE = 'warning';
const DEFAULT_EMPTY_ICON_STYLE = 'readonly';
const HALF_OF_INTEGER = 50;
const COUNT_STARS = 5;

/**
 * Интерфейс опция для {@link Controls/progress:Rating}.
 * @interface Controls/progress:IRating
 * @public
 * @author Колесов В.А.
 */
interface IRatingOptions extends IControlOptions {
    /**
     * @name Controls/progress:IRating#value
     * @cfg {Number} Количество заполненных звезд
     * @remark
     * Целое число от 1 до 5.
     */
    /*
     * @name Controls/progress:IRating#value
     * @cfg {Number} Number of highlighted stars
     * @remark
     * An integer from 1 to 5.
     */
    value: number;
    /**
     * @name Controls/progress:IRating#precision
     * @cfg {Number} Количество символов десятичной части, по умолчанию 0
     * @remark
     * Если десятичное значение precision больше половины целого значения, то показывается пол.звезды.
     * 3,44 –3 звезды. 3,56 –3 с половиной здезды
     */
    /*
     * @name Controls/progress:IRating#precision
     * @cfg {Number} Number of decimal characters, default 0
     * @remark
     * If the precision decimal value is greater than half an integer value, then half a star is displayed.
     * 3,44 – 3 highlighted stars. 3,56 –3 with half highlighted stars
     */
    precision?: number;
    /**
     * @name Controls/progress:IRating#readOnly
     * @cfg {Boolean} Определяет, может ли пользователь изменить значение контрола.
     * @remark
     * Если значение false, то при наведении на пустую звездуона и все предыдущие до нее заполняются, при уводе фокуса
     * становятся обратно пустыми. При клике на какую-либо звезду устанавливается рейтинг слева на право.
     */
    /*
     * @name Controls/progress:IRating#readOnly
     * @cfg {Boolean} Determines if the user can change the value of the control.
     * @remark
     * If the value is false, then when you hover over an empty star, that and all the previous ones before it are filled,
     * when the focus is removed, they become empty back. When you click on any star, the rating is set from left to right.
     */
    readOnly?: boolean;
    /**
     * @name Controls/progress:IRating#iconSize
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
     */
    /*
     * @name Controls/progress:IRating#iconSize
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
    iconSize?: IconSize;
    /**
     * @name Controls/progress:IRating#iconStyle
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
     */
    /*
     * @name Controls/progress:IRating#iconStyle
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
    iconStyle?: IconStyle;
    /**
     * @name Controls/progress:IRating#iconPadding
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
     */
    /*
     * @name Controls/progress:IRating#iconPadding
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
    iconPadding?: IconPadding;
    /**
     * @name Controls/progress:IRating#emptyIconStyle
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
     */
    /*
     * @name Controls/progress:IRating#emptyIconStyle
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
    emptyIconStyle?: IconStyle;
}

interface IStar {
    id: number;
    type: StarType;
    icon: string;
}

const _private = {
    resolveStars(options: IRatingOptions): void {
        this._stars = [];
        for (let i = 0; i < COUNT_STARS; i++) {
            let type; let icon; let iconStyle;
            if (i < this._selectStars) {
                type = 'star';
                icon = 'icon-Favorite';
                iconStyle = options.iconStyle;
            } else if (this._isHalfStar && i === this._selectStars) {
                type = 'halfStar';
                icon = 'icon-FavoriteHalf';
                iconStyle = options.iconStyle;
            } else {
                type = 'emptyStar';
                icon = 'icon-Unfavorite';
                iconStyle = options.emptyIconStyle;
            }
            this._stars.push({
                id: i,
                type,
                icon,
                iconStyle
            });
        }
    },
    updateCountStars(event: SyntheticEvent<Event>): void {
        const starId = event.target?.getAttribute('id');
        if (starId) {
            const idValue = starId.split('_')[0];
            const newSelectStars = parseInt(idValue, 10) + 1;
            if (newSelectStars) {
                this._selectStars = newSelectStars;
                if (this._isHalfStar !== null) {
                    this._isHalfStar = false;
                }
                _private.resolveStars.call(this, this._options);
            }
        }
    },
    getHalfStar(precision: number): boolean {
        return precision >= HALF_OF_INTEGER;
    }
};

/**
 * Базовый компонент оценок
 * Отображает выделенные звезды в зависимости от оценки
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Fprogress%2FRating%2FIndex демо-пример}
 * @extends UI/Base:Control
 * @implements Controls/progress:IRating
 * @author Нигматуллина Л.Э.
 * @public
 *
 * @demo Controls-demo/progress/Rating/Index
 */

/*
 * Control of rating
 * Render highlighted stars depending on the rating
 * @extends UI/Base:Control
 * @implements Controls/progress:IRating
 * @author Nigmatullina L.E.
 * @public
 *
 * @demo Controls-demo/progress/Rating/Index
 */
class Rating extends Control<IRatingOptions> {
    protected _template: TemplateFunction = template;
    protected _selectStars: number;
    protected _isHalfStar: boolean;
    protected _stars: IStar[];

    protected _beforeMount(options: IRatingOptions): void {
        this._selectStars = options.value;
        this._isHalfStar = _private.getHalfStar(options.precision);
        _private.resolveStars.call(this, options);
    }

    protected _beforeUpdate(options: IRatingOptions): void {
        const valueChanged = this._selectStars !== options.value;
        const precisionChanged = this._options.precision !== options.precision;
        if (valueChanged) {
            this._selectStars = options.value;
        }
        if (precisionChanged) {
            this._isHalfStar = _private.getHalfStar(options.precision);
        }
        if (valueChanged || precisionChanged || options.iconStyle !== this._options.iconStyle
            || options.emptyIconStyle !== this._options.emptyIconStyle) {
            _private.resolveStars.call(this, options);
        }
    }

    private _onHoverStar(event: SyntheticEvent<Event>): void {
        if (!this._options.readOnly && !detection.isMobilePlatform) {
            _private.updateCountStars.call(this, event);
        }
    }

    private _onHoverOutStar(): void {
        if (!this._options.readOnly && !detection.isMobilePlatform) {
            this._selectStars = this._options.value;
            if (this._isHalfStar !== null) {
                this._isHalfStar = _private.getHalfStar(this._options.precision);
            }
            _private.resolveStars.call(this, this._options);
        }
    }

    private _clickStar(event: SyntheticEvent<Event>): void {
        if (!this._options.readOnly) {
            _private.updateCountStars.call(this, event);
            if (this._selectStars !== this._options.value) {
                this._notify('valueChanged', [this._selectStars]);
            }
            this._isHalfStar = null;
            this._notify('precisionChanged', [0]);
        }
    }
    static _theme: string[] = ['Controls/progress'];
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
}

Object.defineProperty(Rating, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return Rating.getDefaultOptions();
    }
});

export default Rating;
