import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Popup/Edit/docs/Simple/resources/template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Popup/Edit/MyFormController';

export default class Stack extends Control {
    protected _template: TemplateFunction = template;

    protected _update(): void {
        return this._children.formController.update()
            .then(() => {
                this._notify('close', [], {bubbling: true});
            });
    }
}
