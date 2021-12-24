import {TemplateFunction} from 'UI/Base';
import {INavigationButtonConfig, TNavigationButtonView} from 'Controls/interface';

/**
 * Шаблон подвала узлов
 * @class Controls/_tree/interface/NodeFooterTemplate
 * @public
 * @author Панихин К.А.
 */
export interface INodeFooterTemplateOptions {
    /**
     * @name Controls/_tree/interface/NodeFooterTemplate#content
     * @cfg {String|TemplateFunction} Пользовательский шаблон подвала узла.
     */
    content?: TemplateFunction;
    /**
     * @name Controls/_tree/interface/NodeFooterTemplate#navigationButtonView
     * @cfg {Controls/interface:INavigation/TNavigationButtonView.typedef} Вид кнопки подгрузки данных.
     * @default link
     * @see navigationButtonConfig
     */
    navigationButtonView?: TNavigationButtonView;
    /**
     * @name Controls/_tree/interface/NodeFooterTemplate#navigationButtonConfig
     * Настройки кнопки подгрузки данных
     * @see navigationButtonView
     */
    navigationButtonConfig?: INavigationButtonConfig;
}
