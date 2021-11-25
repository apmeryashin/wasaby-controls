import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Panel/Panel';
import 'css!Controls/operationsPanel';
import {Container} from 'Controls/dragnDrop';
import {DialogOpener} from 'Controls/popup';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {TKey} from 'Controls/interface';

export interface IOperationsPanelOptions extends IControlOptions {
    operationsController: OperationsController;
    propStorageId: string;
    selectedKeys: TKey;
    excludedKeys: TKey;
    selectedKeysCount: number;
    selectionViewMode: string;
    selectedCountConfig: unknown;
    isAllSelected: boolean;
}

export default class extends Control<IOperationsPanelOptions> {
    protected _template: TemplateFunction = template;
    protected _operationsController: OperationsController;
    protected _dialogOpener: DialogOpener = null;
    protected _children: Record<string, Control> = {
        dragNDrop: Container,
        target: HTMLElement
    };

    protected _beforeMount(options: IOperationsPanelOptions): void {
        this._operationsController = options.operationsController;
    }
}
