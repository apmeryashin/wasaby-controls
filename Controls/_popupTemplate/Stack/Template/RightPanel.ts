import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/RightPanel/RightPanel';
import {Controller as ManagerController} from 'Controls/popup';
import 'css!Controls/popupTemplate';

interface IRightPanelOptions extends IControlOptions {
    maximizeButtonClickCallback?: () => void;
    toolbarContentTemplate: TemplateFunction;
}

export default class RightPanel extends Control<IRightPanelOptions> {
    protected _template: TemplateFunction = template;
    protected _rightBottomTemplate: boolean;
    protected _isOutsidePanel: boolean = true;

    protected _beforeMount(options: IRightPanelOptions): void {
        this._rightBottomTemplate = ManagerController.hasRightPanel();
        if (!this._rightBottomTemplate && options.toolbarContentTemplate) {
            this._isOutsidePanel = false;
        }
    }

    protected _maximizeButtonClickHandler(): void {
        if (this._options.maximizeButtonClickCallback) {
            this._options.maximizeButtonClickCallback();
        }
    }

    protected _close(): void {
        this._notify('close', [], {bubbling: true});
    }
}
