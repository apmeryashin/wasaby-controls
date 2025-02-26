import {TNavigationResetButtonMode} from 'Controls/interface';

/**
 * @typedef Controls/_paging/interface/IArrowState/TArrowStateVisibility
 * @description Варианты значений для видимости кнопок в пэйджинге.
 */
export type TArrowStateVisibility = 'visible' | 'hidden' | 'readonly';

/**
 * @typedef Controls/_paging/interface/IArrowState/TResetButtonState
 * @description Варианты значений для видимости кнопки возврата к начальной позиции.
 */
export type TResetButtonState = TNavigationResetButtonMode | 'hidden';

/**
 * Интерфейс настройки видимости кнопок в пэйджинге.
 * @interface Controls/_paging/interface/IArrowState
 * @public
 * @author Авраменко А.С.
 */
export interface IArrowState {
    /**
     * Кнопка "Переход в начало".
     */
    begin: TArrowStateVisibility;

    /**
     * Кнопка "Переход к предыдущей странице".
     */
    prev: TArrowStateVisibility;

    /**
     * Кнопка "Переход к следующей странице".
     */
    next: TArrowStateVisibility;

    /**
     * Кнопка "Переход в конец".
     */
    end: TArrowStateVisibility;

    /**
     * Кнопка возврата к начальной позиции.
     */
    reset: TResetButtonState;
}
