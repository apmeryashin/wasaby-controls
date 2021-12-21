import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/Dialog/closeButtonViewMode/closeButtonViewMode');

class BackgroundStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _closeButtonViewModes = ['linkButton', 'toolButton', 'external'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default BackgroundStyle;
