import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Dialog/borderRadius/borderRadius');

class BackgroundStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _bordersRadius = ['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default BackgroundStyle;
