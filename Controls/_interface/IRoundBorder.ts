/**
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
 * Интерфейс конфигурации скругления углов записей.
 * @interface Controls/_interface/IRoundBorder
 * @description
 * Настройка скругления производится для каждого угла записи.
 * @public
 * @author Аверкиев П.А.
 */
export interface IRoundBorder {

    /**
     * Левый верхний угол
     */
    tl: TRoundBorderSize;

    /**
     * Правый верхний угол.
     */
    tr: TRoundBorderSize;

    /**
     * Левый нижний угол.
     */
    bl: TRoundBorderSize;

    /**
     * Правый нижний угол.
     */
    br: TRoundBorderSize;
}
