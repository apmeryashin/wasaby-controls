import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Popup/StackPageWrapper/Index';
import {Controller} from 'Controls/popup';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _afterMount(): void {
        const workspace = document.querySelector('.controls-PageTemplate');
        const {y, x, width} = workspace.getBoundingClientRect();
        const rightPanelWidth = 54;
        Controller.setContentData({
            top: y,
            left: x,
            width: width - rightPanelWidth
        });
        window.clearSettinngStorage = false;
    }
}
