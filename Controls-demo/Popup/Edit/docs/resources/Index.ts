import {Control, TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {Memory} from 'Types/source';
import template = require('wml!Controls-demo/Popup/Edit/docs/resources/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Popup/Edit/MyFormController';

export default class Stack extends Control {
    protected _template: TemplateFunction = template;
    protected _record: Model;
    protected _source: Memory;
    protected _isReadOnlyFields: boolean = false;

    protected _beforeMount(options): void {
        this._record = options.record;
        this._source = options.source;
        this._checkReadOnlyFields(options);
    }

    protected _beforeUpdate(options): void {
        if (this._options.record !== options.record) {
            this._record = options.record;
        }
    }

    protected _checkReadOnlyFields(options): void {
        if (options.type === 'ExternalView') {
            this._isReadOnlyFields = true;
        }
    }

    protected _clickHandlerReadOnlyState(): void {
        this._isReadOnlyFields = !this._isReadOnlyFields;
    }

    protected _update(): void {
        return this._children.formController.update()
            .then(() => {
                if (this._options.type === 'ExternalView') {
                    this._children.confirmation.open({
                        message: 'Данные успешно сохранены и отправлены в реестр!',
                        type: 'ok'
                    });
                } else {
                    this._notify('close', [], {bubbling: true});
                }
            });
    }

    protected _delete(): void {
        return this._children.formController.delete()
            .then(() => {
                this._notify('close', [], {bubbling: true});
            });
    }
}
