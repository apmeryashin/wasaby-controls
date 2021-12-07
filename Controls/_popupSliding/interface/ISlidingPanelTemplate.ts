import {TemplateFunction, IControlOptions} from 'UI/Base';
import {ISlidingPanelOptions} from 'Controls/popup';

export interface ISlidingPanelTemplateOptions extends IControlOptions {
    controlButtonVisibility: boolean;
    bodyContentTemplate?: string | TemplateFunction;
    slidingPanelOptions: ISlidingPanelOptions;
}

/**
 * Интерфейс для шаблона попапа-шторки.
 *
 * @interface Controls/_popupSliding/interface/ISlidingPanelTemplate
 * @public
 * @author Красильников А.С.
 */
export interface ISlidingPanelTemplate {
    readonly '[Controls/_popupSliding/interface/ISlidingPanelTemplate]'?: boolean;
}

/**
 * @name Controls/_popupSliding/interface/ISlidingPanelTemplate#controlButtonVisibility
 * @cfg {boolean} Определяет показ контроллера для разворота шторки.
 * @default true
 */

/**
 * @name Controls/_popupSliding/interface/ISlidingPanelTemplate#bodyContentTemplate
 * @cfg {string|TemplateFunction} Пользовательский контент шторки.
 */

/**
 * @name Controls/_popupSliding/interface/ISlidingPanelTemplate#headerContentTemplate
 * @demo Controls-demo/Popup/SlidingPanel/HeaderContentTemplate/Index
 * @cfg {string|TemplateFunction} Контент шапки шторки.
 */

/**
 * @name Controls/_popupSliding/interface/ISlidingPanelTemplate#toolbarContentTemplate
 * @demo Controls-demo/Popup/SlidingPanel/HeaderContentTemplate/Index
 * @cfg {string|TemplateFunction} Шаблон тулбара с набором действий для шторки.
 * На десктопе работает только для режима выезжающей панели.
 */

/**
 * @name Controls/_popupSliding/interface/ISlidingPanelTemplate#slidingPanelOptions
 * @cfg {object} Содержит сведения о позиционировании шторки.
 * @remark
 * При открытии шторки с помощью {@link Controls/popup:SlidingPanelOpener}, в шаблон передаётся значение для опции slidingPanelOptions.
 * Необходимо использовать его для конфигурации Controls/popupSliding:Template, как показано в следующем примере.
 * <pre>
 * <Controls.popupSliding:Template slidingPanelOptions="{{_options.slidingPanelOptions}}" />
 * </pre>
 * Конфигурировать значение в ручную не нужно, необходимо только проксировать значение приходящее в шаблон.
 */
