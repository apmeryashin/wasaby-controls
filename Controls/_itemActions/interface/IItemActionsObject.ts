import {IItemAction, TItemActionsSize} from './IItemAction';

/**
 * Расширенный интерфейс IItemAction с полями для использования в шаблоне
 * @interface
 * @private
 * @author Аверкиев П.А.
 */

/*
 * Extended interface for itemActions to use it inside of template
 * @interface
 * @private
 * @author Аверкиев П.А.
 */
export interface IShownItemAction extends IItemAction {
    /**
     * Текст кнопки операции над записью
     */
    caption?: string;

    /**
     * Флаг определяющий, надо ли показывать иконку кнопки операции над записью
     */
    hasIcon?: boolean;

    /**
     * Флаг определяющий, является ли текущая кнопка операции над записью кнопкой вызова меню (Кнопка с тремя точками)
     */
    isMenu?: boolean;

    /**
     * Высота базовой линии для равнивания иконки внутри кнопки
     */
    inlineHeight?: string;

    /**
     * Размер шрифта для выравнивания иконки
     */
    fontSize?: string;

    /**
     * Размер иконки
     */
    iconSize?: TItemActionsSize | 'xs';
}

export interface IItemActionsObject {
    all: IItemAction[];
    showed: IShownItemAction[];
}
