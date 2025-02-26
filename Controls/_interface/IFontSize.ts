/**
 * @typedef {String} Controls/_interface/IFontSize/TFontSize
 * Набор стандартных значений размеров шрифта.
 * @variant inherit
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 * @variant 4xl
 * @variant 5xl
 * @variant 6xl
 * @variant 7xl
 * @variant 8xl
 * @default l
 */
export type TFontSize =
    'inherit' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'| '8xl';

export interface IFontSizeOptions {
   fontSize?: TFontSize;
}

/**
 * Интерфейс для контролов, которые поддерживают разные размеры шрифта.
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for control, which has different font sizes
 * @public
 */
export default interface IFontSize {
   readonly '[Controls/_interface/IFontSize]': boolean;
}
/**
 * @name Controls/_interface/IFontSize#fontSize
 * @cfg {String} Размер шрифта.
 * @remark
 * Размер шрифта задается константой из стандартного набора размеров шрифта, который определен для текущей темы оформления.
 * @variant inherit
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 * @variant 4xl
 * @variant 5xl
 * @variant 6xl
 * @variant 7xl
 * @variant 8xl
 * @default l
 * @see Icon
 */

/*
 * @name Controls/_interface/IFontSize#fontSize
 * @cfg {Enum} Font size value
 * @variant inherit
 * @variant xs
 * @variant s
 * @variant m
 * @variant l
 * @variant xl
 * @variant 2xl
 * @variant 3xl
 * @variant 4xl
 * @variant 5xl
 * @example
 * Button with xl font size.
 * <pre>
 *    <Controls.buttons:Button icon="icon-Add" fontSize="xl" viewMode="button"/>
 * </pre>
 * @see Icon
 */
