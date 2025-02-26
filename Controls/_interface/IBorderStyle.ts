export type BorderStyle = 'success' | 'secondary' | 'warning';

export interface IBorderStyleOptions {
    borderStyle: BorderStyle;
}

/**
 * Интерфейс для контролов, которые поддерживают разные цвета границы.
 * @public
 * @author Красильников А.С.
 */
interface IBorderStyle {
    readonly '[Controls/interface/IBorderStyle]': boolean;
}

export default IBorderStyle;

/**
 * @typedef {String} BorderStyle
 * @variant success
 * @variant secondary
 * @variant warning
 */
/**
 * @name Controls/_interface/IBorderStyle#borderStyle
 * @cfg {BorderStyle} Цвет обводки контрола.
 * @demo Controls-demo/Input/BorderStyles/Index
 */
