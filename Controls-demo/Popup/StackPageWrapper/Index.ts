import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Popup/StackPageWrapper/Index';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _afterMount(): void {
        window.clearSettinngStorage = false;
    }
}
