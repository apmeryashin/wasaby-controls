/**
 * @typedef {String} TFontWeight
 * @description Допустимые значения для опции {@link Controls/interface:IFontWeight#fontWeight fontWeight}.
 * @variant default начертание, которое задается при помощи переменной темы оформления
 * @variant normal нормальное начертание
 * @variant bold полужирное начертание
 */
export type TFontWeight = 'default' | 'normal' | 'bold';

export interface IFontWeightOptions {
    /**
     * @name Controls/_interface/IFontWeight#fontWeight
     * @cfg {TFontWeight} Насыщенность шрифта.
     * @default default
     * @demo Controls-demo/Decorator/Money/FontWeight/Index
     */
    fontWeight?: TFontWeight;
}

/**
 * Интерфейс для контролов, которые поддерживают разные начертания шрифта.
 * @public
 * @author Красильников А.С.
 */
export default interface IFontWeight {
    readonly '[Controls/_interface/IFontWeight]': boolean;
}
