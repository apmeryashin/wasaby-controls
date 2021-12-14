export type BorderRadius = '3xs' | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl';

export interface IBorderRadiusOptions {
    borderRadius?: BorderRadius;
}

/**
 * Интерфейс для контролов, которые поддерживают разные закругления границы.
 * @public
 * @author Красильников А.С.
 */
interface IBorderRadius {
    readonly '[Controls/interface/IBorderRadius]': boolean;
}

export default IBorderRadius;

/**
 * @typedef {String} BorderRadius
 * @variant 3xs
 * @variant 2xs
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 */
/**
 * @name Controls/_interface/IBorderRadius#borderRadius
 * @cfg {BorderRadius} Закругление обводки контрола.
 */
