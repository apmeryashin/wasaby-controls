/**
 * @typedef {String} Controls/_interface/ITileRoundBorder/TTileRoundBorderSize
 * @variant null Без скругления.
 * @variant 3xs Минимальный радиус скругления.
 * @variant 2xs Малый радиус скругления.
 * @variant xs Средний радиус скругления.
 * @variant s Большой радиус скругления.
 * @variant m Максимальный радиус скругления.
 */
export type TTileRoundBorderSize = 'null' | '3xs' | '2xs' | 'xs' | 's' | 'm';

/**
 * @interface Controls/_interface/ITileRoundBorder
 * @public
 * @author Аверкиев П.А.
 */
export interface ITileRoundBorder {

    /**
     * @name {Controls/_interface/ITileRoundBorder/TTileRoundBorderSize.typedef} tl Левый верхний угол
     */
    tl: TTileRoundBorderSize;

    /**
     * @name {Controls/_interface/ITileRoundBorder/TTileRoundBorderSize.typedef} tr Правый верхний угол.
     */
    tr: TTileRoundBorderSize;

    /**
     * @name {Controls/_interface/ITileRoundBorder/TTileRoundBorderSize.typedef} bl Левый нижний угол.
     */
    bl: TTileRoundBorderSize;

    /**
     * @name {Controls/_interface/ITileRoundBorder/TTileRoundBorderSize.typedef} br Правый нижний угол.
     */
    br: TTileRoundBorderSize;
}
