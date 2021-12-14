import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/Dialog/Resizable/Index');
import {DialogOpener} from 'Controls/popup';

const baseStackConfig = {
    template: 'Controls-demo/Popup/Dialog/Resizable/Popup',
    closeOnOutsideClick: true,
    autofocus: true,
    opener: null
};

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _resizable: boolean = false;
    private _dialogOpener: DialogOpener;

    protected _afterMount(options?: IControlOptions, contexts?: any): void {
        this._dialogOpener = new DialogOpener();
    }

    protected _openDialogHandler(): void {
        this._dialogOpener.open({
            ...baseStackConfig,
            templateOptions: {
                closeButtonViewMode: 'external',
                resizable: this._resizable
            }
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Index;
