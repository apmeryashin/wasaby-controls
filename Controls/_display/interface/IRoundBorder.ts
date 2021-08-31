/**
 * @typedef {String} Controls/_display/interface/TRoundBorderSize
 * @variant null Без скругления.
 * @variant xs Минимальный радиус скругления.
 * @variant s Малый радиус скругления.
 * @variant m Средний радиус скругления.
 * @variant l Большой радиус скругления.
 * @variant xl Максимальный радиус скругления.
 */
export type TRoundBorderSize = 'null' | 'xs' | 's' | 'm' | 'l' | 'xl' | '3xs' | '2xs';

/**
 * @interface Controls/_display/interface/IRoundBorder
 * @public
 * @author Аверкиев П.А.
 */
export interface IRoundBorder {

    /**
     * @name {Controls/_display/interface/TRoundBorderSize.typedef} tl Левый верхний угол
     */
    tl: TRoundBorderSize;

    /**
     * @name {Controls/_display/interface/TRoundBorderSize.typedef} tr Правый верхний угол.
     */
    tr: TRoundBorderSize;

    /**
     * @name {Controls/_display/interface/TRoundBorderSize.typedef} bl Левый нижний угол.
     */
    bl: TRoundBorderSize;

    /**
     * @name {Controls/_display/interface/TRoundBorderSize.typedef} br Правый нижний угол.
     */
    br: TRoundBorderSize;
}
