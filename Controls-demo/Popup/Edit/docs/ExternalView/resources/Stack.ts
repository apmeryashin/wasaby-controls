import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Popup/Edit/docs/ExternalView/resources/tmpl');
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Popup/Edit/MyFormController';

export default class Stack extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    protected _record: Model;
    protected _isReadOnlyFields: boolean = true;

    protected _beforeMount(options): void {
        this._source = options.source;
        this._source.read(0).then((record) => this._record = record);
    }

    protected _clickHandler(): void {
        this._isReadOnlyFields = !this._isReadOnlyFields;
    }

    protected _update(): void {
        return this._children.formController.update()
            .then(() => {
                this._children.confirmation.open({
                    message: 'Данные успешно сохранены и отправлены!',
                    type: 'ok'
                });
            });
    }
}
