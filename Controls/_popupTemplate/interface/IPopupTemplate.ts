import {IPopupTemplateBaseOptions} from 'Controls/_popupTemplate/interface/IPopupTemplateBase';
export interface IPopupTemplateOptions extends IPopupTemplateBaseOptions {
    closeButtonViewMode?: string;
}
/**
 * Интерфейс для стандартных шаблонов окон.
 *
 * @interface Controls/_popupTemplate/interface/IPopupTemplate
 * @public
 * @author Красильников А.С.
 */
export default interface IPopupTemplate {
    readonly '[Controls/_popupTemplate/interface/IPopupTemplate]': boolean;
}
/**
 * @name Controls/_popupTemplate/interface/IPopupTemplate#closeButtonViewMode
 * @cfg {String} Стиль отображения кнопки закрытия
 * @variant toolButton Отображение как кнопки панели инструментов.
 * @variant linkButton Отображение кнопки в виде ссылки.
 * @variant functionalButton Отображение функциональной кнопки закрытия
 * @variant external Отображение полупрозрачной кнопки закрытия.
 * @default linkButton
 * @demo Controls-demo/PopupTemplate/Dialog/closeButtonViewMode/Index
 */
