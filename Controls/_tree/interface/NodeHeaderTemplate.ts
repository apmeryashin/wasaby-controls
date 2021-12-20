import {INavigationButtonConfig, TNavigationButtonView} from 'Controls/interface';

/**
 * Шаблон шапки узлов
 * @class Controls/_tree/interface/NodeHeaderTemplate
 * @public
 * @author Панихин К.А.
 */
export interface INodeHeaderTemplateOptions {
    /**
     * @name Controls/_tree/interface/NodeHeaderTemplate#navigationButtonView
     * @cfg {Controls/interface:INavigation/TNavigationButtonView.typedef} Вид кнопки подгрузки данных.
     * @default link
     * @see navigationButtonConfig
     */
    navigationButtonView?: TNavigationButtonView;
    /**
     * @name Controls/_tree/interface/NodeHeaderTemplate#navigationButtonConfig
     * Настройки кнопки подгрузки данных
     * @see navigationButtonView
     */
    navigationButtonConfig?: INavigationButtonConfig;
}
