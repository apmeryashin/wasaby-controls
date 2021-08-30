/**
 * @typedef {String} Controls/_interface/TRoundBorderSize
 * @variant null Без скругления.
 * @variant XS Минимальный радиус скругления.
 * @variant S Малый радиус скругления.
 * @variant M Средний радиус скругления.
 * @variant L Большой радиус скругления.
 * @variant XL Максимальный радиус скругления.
 * todo '3xs' | '2xs' нужны только для плитки. Там какие-то свои значения 3xs-m
 */
export type TRoundBorderSize = 'null' | 'xs' | 's' | 'm' | 'l' | 'xl' | '3xs' | '2xs';

/**
 * @interface Controls/_interface/IRoundBorder
 * @public
 * @author Аверкиев П.А.
 */
export interface IRoundBorder {

    /**
     * @name {Controls/_interface/TRoundBorderSize.typedef} tl Левый верхний угол
     */
    tl: TRoundBorderSize;

    /**
     * @name {Controls/_interface/TRoundBorderSize.typedef} tr Правый верхний угол.
     */
    tr: TRoundBorderSize;

    /**
     * @name {Controls/_interface/TRoundBorderSize.typedef} bl Левый нижний угол.
     */
    bl: TRoundBorderSize;

    /**
     * @name {Controls/_interface/TRoundBorderSize.typedef} br Правый нижний угол.
     */
    br: TRoundBorderSize;
}
