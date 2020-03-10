import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/FormController/FormControllerDemo');
import {Memory} from 'Types/source';
import * as Deferred from 'Core/Deferred';
import Model from 'Types/_entity/Model';
import {ISource} from 'Types/source';
import Env = require('Env/Env');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/FormController/FormControllerDemo';

class FormController extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _dataSource: ISource = null;
    protected idCount =  1;
    protected _key = 0;
    protected _record = null;
    protected _recordAsText = '';

    protected _beforeMount(cfg): void {
        this._dataSource = cfg.dataSource || new Memory({
            keyProperty: 'id',
            data: [{ id: 0 }]
        });
    }

    private _create(config): Promise<any> {
        const self = this;
        const resultDef = new Deferred();
        const initValues = config.initValues;
        const finishDef = this._children.registrator.finishPendingOperations();

        initValues.id = this.idCount;

        finishDef.addCallback(function(finishResult) {
            let createDef = self._children.formControllerInst.create(initValues);
            createDef.addCallback(function(result) {
                self.idCount++;
                resultDef.callback(true);
                return result;
            }).addErrback(function(e) {
                resultDef.errback(e);
                Env.IoC.resolve('ILogger').error('FormController example', '', e);
                return e;
            });
            return finishResult;
        });
        finishDef.addErrback(function(e) {
            resultDef.errback(e);
            Env.IoC.resolve('ILogger').error('FormController example', '', e);
            return e;
        });

        return resultDef;
    }

    private _read(config): Promise<any> {
        const self = this;
        const resultDef = new Deferred();

        const finishDef = this._children.registrator.finishPendingOperations();

        finishDef.addCallback(function(finishResult) {
            self._key = config.key;
            self._record = null;
            self._forceUpdate();
            resultDef.callback(true);
            return finishResult;
        });
        finishDef.addErrback(function(e) {
            resultDef.errback(e);
            Env.IoC.resolve('ILogger').error('FormController example', '', e);
            return e;
        });

        return resultDef;
    }
    private _update(): Promise<any> {
        return this._children.formControllerInst.update();
    }
    private _delete():Promise<any> {
        return this._children.formControllerInst.delete();
    }

    private _clickCreateHandler(): void {
        this._create({
            initValues: {
                title: 'Title',
                description: 'New note'
            }
        });
    }
    private _clickReadHandler(e, id): void {
        this._read({ key: id });
    }
    private _clickUpdateHandler(): void  {
        this._update();
    }
    private _clickDeleteHandler(): void  {
        this._delete();
    }

    private _alertHandler(e, msg): void  {
        this._alert(msg);
    }
    private _alert(msg) {
        Env.IoC.resolve('ILogger').info(msg);
    }
    getRecordString() {
        if (!this._record) {
            return '';
        }
        if (!this._record.getRawData()) {
            return '';
        }
        return JSON.stringify(this._record.getRawData());
    }
    private _createSuccessedHandler(e, record) {
        this._alert('FormController demo: create successed');
        this._updateValuesByRecord(record);
    }
    private _updateSuccessedHandler(e, record, key): void {
        this._alert('FormController demo: update successed with key ' + key);
        this._updateValuesByRecord(record);
    }
    private _updateFailedHandler(): void  {
        this._alert('FormController demo: update failed');
        this._updateValuesByRecord(this._record);
    }
    private _validationFailedHandler(): void  {
        this._alert('FormController demo: validation failed');
        this._updateValuesByRecord(this._record);
    }
    private _readSuccessedHandler(e, record): void  {
        this._alert('FormController demo: read successed');
        this._updateValuesByRecord(record);
    }
    private _readFailedHandler(e, err): void  {
        this._alert('FormController demo: read failed');
        this._updateValuesByRecord(new Model());
    }
    private _deleteSuccessedHandler(e): void  {
        this._alert('FormController demo: delete successed');
        this._updateValuesByRecord(new Model());
    }
    private _deleteFailedHandler(e): void  {
        this._alert('FormController demo: delete failed');
        this._updateValuesByRecord(new Model());
    }
    private _updateValuesByRecord(record) {
        this._record = record;

        this._key = this._record.get('id');
        this._recordAsText = this.getRecordString();

        // запросим еще данные прямо из dataSource и обновим dataSourceRecordString
        const self = this;
        const def = this._dataSource.read(this._key);
        def.addCallback((record) => {
            if (!record) {
                return '';
            }
            if (!record.getRawData()) {
                return '';
            }
            self.dataSourceRecordString = record.getRawData();
            self._forceUpdate();
        });
        def.addErrback(function(e) {
            self.dataSourceRecordString = '';
            self._forceUpdate();
            return e;
        });
        this._forceUpdate();
    }
    private _requestCustomUpdate(): boolean {
        return false;
    }
    static _theme: string[] = ['Controls/Classes'];
}
export default FormController;
