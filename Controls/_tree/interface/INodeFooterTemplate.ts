import {ICutConfig, TMoreButtonView} from 'Controls/interface';

/**
 * @public
 * @autor Аверкиев П.А.
 */
export interface INodeFooterTemplate {
    /**
     * Вид кнопки "Ещё" в узлах дерева
     * @default default
     */
    moreButtonView?: TMoreButtonView;
    /**
     * Настройки кнопки "Ещё" в виде cut
     * @see moreButtonView
     */
    cutConfig?: ICutConfig;
}
