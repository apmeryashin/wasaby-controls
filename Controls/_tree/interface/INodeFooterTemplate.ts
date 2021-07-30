import {INavigationButtonConfig, TNavigationButtonView} from 'Controls/interface';

/**
 * Шаблон подвала узлов
 * @public
 * @autor Аверкиев П.А.
 */
export interface INodeFooterTemplate {
    /**
     * Вид кнопки подгрузки данных
     * @default default
     */
    navigationButtonView?: TNavigationButtonView;
    /**
     * Настройки кнопки подгрузки данных
     * @see navigationButtonView
     */
    navigationButtonConfig?: INavigationButtonConfig;
}
