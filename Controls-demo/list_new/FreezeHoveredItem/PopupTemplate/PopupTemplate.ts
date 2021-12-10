import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as ControlTemplate from 'wml!Controls-demo/list_new/FreezeHoveredItem/PopupTemplate/PopupTemplate';

class PopupTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = ControlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default PopupTemplate;
