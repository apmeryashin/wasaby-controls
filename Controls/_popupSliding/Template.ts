import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupSliding/Template/Template';
import {ISlidingPanelTemplateOptions} from 'Controls/_popupSliding/interface/ISlidingPanelTemplate';
import MobileTemplate from 'Controls/_popupSliding/Template/SlidingPanel';
import DesktopTemplate from 'Controls/_popupSliding/Template/Desktop';
import { detection } from 'Env/Env';

/**
 * Интерфейс для шаблона попапа-шторки.
 *
 * @interface Controls/_popupSliding/Template
 * @public
 * @author Красильников А.С.
 */
export default class Template extends Control<ISlidingPanelTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _adaptiveTemplate: Function = detection.isPhone ? MobileTemplate : DesktopTemplate;
}
