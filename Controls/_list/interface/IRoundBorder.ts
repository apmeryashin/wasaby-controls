/**
 * TODO Это копипаста до https://online.sbis.ru/opendoc.html?guid=92d60564-ce8f-4dc3-8faa-6f58e0ab066a.
 *  Надо убрать этот интерфейс, и оставить только в Controls/interfaces
 * @typedef {String} Controls/_interface/TRoundBorderSize
 * @variant null Без скругления.
 * @variant xs Минимальный радиус скругления.
 * @variant s Малый радиус скругления.
 * @variant m Средний радиус скругления.
 * @variant l Большой радиус скругления.
 * @variant xl Максимальный радиус скругления.
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
