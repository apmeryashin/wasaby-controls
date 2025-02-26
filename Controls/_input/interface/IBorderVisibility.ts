import {descriptor} from 'Types/entity';

export type TBorderVisibility = 'partial' | 'hidden';

export interface IBorderVisibilityOptions {
    borderVisibility: TBorderVisibility;
}

export function getDefaultBorderVisibilityOptions(): Partial<IBorderVisibilityOptions> {
    return {
        borderVisibility: 'partial'
    };
}

export function getOptionBorderVisibilityTypes(): object {
    return {
        borderVisibility: descriptor<string>(String).oneOf([
            'partial', 'hidden', 'visible'
        ])
    };
}

export interface IBorderVisibility {
    readonly '[Controls/interface/IBorderVisibility]': boolean;
}

/**
 * Интерфейс для контролов, которые поддерживают разное количество видимых границ.
 * @interface Controls/_input/interface/IBorderVisibility
 * @public
 * @author Мочалов М.А.
 */

/**
 * @typedef {String} Controls/_input/interface/IBorderVisibility/TBorderVisibility
 * @variant partial Видна нижняя граница
 * @variant hidden Границы не видны
 */
/**
 * @name Controls/_input/interface/IBorderVisibility#borderVisibility
 * @cfg {Controls/_input/interface/IBorderVisibility/TBorderVisibility.typedef} Видимость границ контрола.
 * @default partial
 * @demo Controls-demo/Input/BorderVisibility/Index
 */
