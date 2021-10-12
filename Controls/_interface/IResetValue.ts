export interface IResetValueOptions {
    resetValue?: boolean | null;
}

/**
 * Интерфейс для контролов, которые поддерживают настройку предустановленного значения.
 * @public
 * @author Красильников А.С.
 */
export default interface IResetValue {
    readonly '[Controls/_interface/IResetValueOptions]': boolean;
}

/**
 * @name Controls/_interface/IResetValueOptions#resetValue
 * @cfg {boolean} Предустановленное значение
 */
