import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import BaseOpener, {IBaseOpenerOptions} from 'Controls/_popup/Opener/BaseOpener';
import {IEditOptions, IEditOpener} from 'Controls/_popup/interface/IEdit';
import template = require('wml!Controls/_popup/Opener/Edit/Edit');
import CoreMerge = require('Core/core-merge');
import cInstance = require('Core/core-instance');
import Deferred = require('Core/Deferred');

interface IEditOpenerOptions extends IEditOptions, IControlOptions {}
/**
 * Контрол, который открывает всплывающее окно с {@link /doc/platform/developmentapl/interface-development/controls/list/actions/editing-dialog/ диалогом редактирования записи}.
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FPopup%2FEdit%2FOpener демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/editing-dialog/#step4 руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 * @extends Controls/_popup/Opener
 * @implements Controls/popup:IBaseOpener
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Edit/Opener
 */
class Edit extends Control<IEditOpenerOptions> implements IEditOpener {
    readonly '[Controls/_popup/interface/IEditOpener]': boolean;
    protected _template: TemplateFunction = template;
    protected _openerTemplate: Control;
    protected _children: {
        Opener: BaseOpener
    };
    private _resultHandler: Function;
    private _linkedKey: string = null; // key to obtain a synchronized record

    protected _beforeMount(options: IEditOpenerOptions): void {
        this._onResult = this._onResult.bind(this);

        if (options.mode === 'dialog') {
            this._openerTemplate = require('Controls/popup').Dialog;
        } else if (options.mode === 'sticky') {
            this._openerTemplate = require('Controls/popup').Sticky;
        } else {
            this._openerTemplate = require('Controls/popup').Stack;
        }
    }

    open(meta, popupOptions) {
        const config = this._getConfig(meta || {}, popupOptions);
        this._children.Opener.open(config);
    }

    close() {
        this._children.Opener.close();
        this._resultHandler = null;
    }

    isOpened(): boolean {
        return this._children.Opener.isOpened();
    }

    private _onResult(data): void {
        if (data && data.formControllerEvent) {
            const args = [data.formControllerEvent, data.record, data.additionalData || {}];
            const eventResult = this._notify('beforeItemEndEdit', args, {bubbling: true});
            if (eventResult !== Edit.CANCEL && this._options.items) {
                this._loadSynchronizer().addCallback((Synchronizer) => {
                    this._synchronize(eventResult, data, Synchronizer);
                    if (data.formControllerEvent === 'update') {
                        // Если было создание, запоминаем ключ, чтобы при повторном сохранении знать,
                        // какую запись в реестре обновлять
                        if (data.additionalData.isNewRecord && !this._linkedKey) {
                            this._linkedKey = data.additionalData.key || data.record.getId();
                        }
                    }
                });
            }
        } else {
            const args = Array.prototype.slice.call(arguments);
            if (this._resultHandler) {
                this._resultHandler.apply(this, args);
            }
            this._notify('result', args);
        }
    }
    _closeHandler(event: Event): void {
        this._notify(event.type, []);
    }
    _openHandler(event: Event): void {
        this._notify(event.type, []);
    }

    private _getConfig(meta, popupOptions): IBaseOpenerOptions {
        const cfg: IBaseOpenerOptions = {};
        CoreMerge(cfg, popupOptions || {});
        cfg.templateOptions = cfg.templateOptions || {};
        cfg.eventHandlers = cfg.eventHandlers || {};

        this._resultHandler = cfg.eventHandlers.onResult;
        cfg.eventHandlers.onResult = this._onResult;

        if (meta.record) {
            cfg.templateOptions.record = meta.record.clone();
            cfg.templateOptions.record.acceptChanges();
            this._linkedKey = cfg.templateOptions.record.getId();
        } else {
            this._linkedKey = undefined;
        }

        if (meta.key) {
            cfg.templateOptions.key = meta.key;
        }

        return cfg;
    }

    private _processingResult(RecordSynchronizer, data, items, editKey) {
        if (data.formControllerEvent === 'update') {
            if (data.additionalData.isNewRecord) {
                RecordSynchronizer.addRecord(data.record, data.additionalData, items);
            } else {
                RecordSynchronizer.mergeRecord(data.record, items, editKey);
            }
        } else if (data.formControllerEvent === 'delete') {
            this._deleteRecord(RecordSynchronizer, items, editKey);
        } else if (data.formControllerEvent === 'deletestarted') {
            data.additionalData.removePromise.then(() => {
                this._deleteRecord(RecordSynchronizer, items, editKey);
            });
        }
    }

    private _deleteRecord(RecordSynchronizer, items, editKey): void {
        // Если нет editKey - удаляют черновик, которого нет в списке
        if (editKey) {
            RecordSynchronizer.deleteRecord(items, editKey);
        }
    }

    private _getResultArgs(data, RecordSynchronizer) {
        return [RecordSynchronizer, data, this._options.items, this._linkedKey];
    }

    private _synchronize(eventResult, data, Synchronizer) {
        if (cInstance.instanceOfModule(eventResult, 'Core/Deferred')) {
            data.additionalData = data.additionalData || {};

            eventResult.addCallback((record) => {
                data.record = record;
                this._processingResult.apply(this, this._getResultArgs(data, Synchronizer));
            });
        } else {
            this._processingResult.apply(this, this._getResultArgs(data, Synchronizer));
        }
    }
    private _loadSynchronizer(): Promise<Control> {
        const synchronizedModule = 'Controls/Utils/RecordSynchronizer';
        const loadDef = new Deferred();
        if (requirejs.defined(synchronizedModule)) {
            loadDef.callback(requirejs(synchronizedModule));
        } else {
            requirejs([synchronizedModule], (RecordSynchronizer) => {
                loadDef.callback(RecordSynchronizer);
            });
        }
        return loadDef;
    }

    static CANCEL: string = 'cancel';

    static getDefaultOptions(): IEditOpenerOptions {
        return {
            mode: 'stack'
        };
    }
}

Object.defineProperty(Edit, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Edit.getDefaultOptions();
   }
});

export default Edit;
