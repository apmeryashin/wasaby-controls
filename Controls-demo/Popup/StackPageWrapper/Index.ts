import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Popup/StackPageWrapper/Index';
import {Controller} from 'Controls/popup';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _afterMount(): void {
        this._resizeHandler();
    }

    protected _resizeHandler(): void {
        const workspace = document.querySelector('.controls-PageTemplate');
        const workspaceCoords = workspace.getBoundingClientRect();
        const rightPanelWidth = 54;
        Controller.setContentData({
            top: workspaceCoords.top,
            left: workspaceCoords.left,
            width: workspaceCoords.width - rightPanelWidth
        });
        window.clearSettinngStorage = false;
    }
}
