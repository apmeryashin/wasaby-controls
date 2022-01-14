import {Control, TemplateFunction} from 'UI/Base';
import {StackOpener, Controller} from 'Controls/popup';
import * as Template from 'wml!Controls-demo/Popup/Stack/PopupDirection/PopupDirection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _stackOpener: StackOpener = new StackOpener();

    protected _beforeMount(): void {
        Controller.setPopupDirection('left');
        Controller.setRightPanelBottomTemplate(null);
    }

    _openStack(): void {
        this._stackOpener.open({
            template: 'Controls-demo/Popup/Opener/resources/StackTemplate',
            opener: this,
            width: 900,
            templateOptions: {
                maximized: true,
                maximizeButtonVisibility: true
            }
        });
    }
}
