import {INavigationButtonConfig, TNavigationButtonView} from 'Controls/interface';

/**
 * Шаблон подвала узлов
 * @interface Controls/_tree/interface/INodeFooterTemplate
 * @public
 * @author Панихин К.А.
 */
export interface INodeFooterTemplate {
    /**
     * @cfg {Controls/interface:INavigation/TNavigationButtonView.typedef} Вид кнопки подгрузки данных.
     * @default link
     */
    navigationButtonView?: TNavigationButtonView;
    /**
     * Настройки кнопки подгрузки данных
     * @see navigationButtonView
     */
    navigationButtonConfig?: INavigationButtonConfig;
}
