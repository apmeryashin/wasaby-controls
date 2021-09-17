import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import template = require('wml!Controls-demo/Popup/Edit/Page/templates/Stack');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Popup/Edit/Page/templates/Stack';

interface IStackOptions extends IControlOptions {
    prefetchResult: Record<string, any>;
}

export default class Stack extends Control<IStackOptions> {
    protected _template: TemplateFunction = template;
    protected _initializingWay: string = 'preload';
    protected _dataSource: Memory;
    protected _indicatorState: boolean = false;
    protected _record: object;
    protected _isNewRecord: boolean;

    protected _beforeMount(options?: IStackOptions): void {
        this._dataSource = options.viewSource;
        this._isNewRecord = !options.record;
        this._record = options.record;
    }

    protected _afterMount(): void {
        this._children.LocalIndicatorDefault.show();
        this._indicatorState = true;
    }

    protected _beforeUpdate(options?: IStackOptions): void {
        if (!this._indicatorState) {
            this._children.LocalIndicatorDefault.show();
        }
        if (options.prefetchResult) {
            if (options.prefetchResult !== this._options.prefetchResult) {
                this._record = options.prefetchResult.stackTemplate.data;
            }
        }
        if (options.record !== this._options.record) {
            this._record = options.record;
        }
        this._children.LocalIndicatorDefault.hide();
        this._indicatorState = false;
    }

    protected _update(): void {
        return this._children.formController.update();
    }

    protected _delete(): void {
        return this._children.formController.delete();
    }

    protected _deleteSuccessedHandler(): void {
        this._notify('close', [], {bubbling: true});
    }

    protected _updateSuccessedHandler(event: Event, record: Model): void {
        if (this._record === record) {
            this._notify('close', [], {bubbling: true});
        }
    }
}
