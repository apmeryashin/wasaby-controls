import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Panel/Panel';
import 'css!Controls/operationsPanel';
import {Container} from 'Controls/dragnDrop';
import {DialogOpener} from 'Controls/popup';
import {ControllerClass as OperationsController} from 'Controls/operations';
import Store from 'Controls/Store';
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

    protected _shouldOpenMenu(options: IOperationsPanelOptions): boolean {
        return options.selectedKeysCount !== 0;
    }

    protected _beforeUpdate(options: IOperationsPanelOptions): void {
        if (this._shouldOpenMenu(options)) {
            this._operationsController.setOperationsMenuVisible(true);
        }

        if (this._options.selectedKeys !== options.selectedKeys ||
            this._options.excludedKeys !== options.excludedKeys ||
            this._options.selectedKeysCount !== options.selectedKeysCount
        ) {
            this._openCloud();
        }
    }

    protected _afterMount(options: IOperationsPanelOptions): void {
        this._openCloud();
        if (this._shouldOpenMenu(options)) {
            this._operationsController.setOperationsMenuVisible(true);
        }
    }

    protected _getDialogOpener(): DialogOpener {
        if (!this._dialogOpener) {
            this._dialogOpener = new DialogOpener();
            return this._dialogOpener;
        } else {
            return this._dialogOpener;
        }
    }

    protected _beforeUnmount(): void {
        this._operationsController.setOperationsMenuVisible(false);
        this._operationsController.setOperationsPanelVisible(false);
        this._operationsController = null;
        if (this._dialogOpener) {
            this._dialogOpener.destroy();
            this._dialogOpener = null;
        }
    }

    private _openCloud(): void {
        const target = this._children.target;
        const opener = this._getDialogOpener();
        if (!opener.isOpened()) {
            opener.open({
                template: 'Controls/operationsPanel:Cloud',
                opener: this,
                className: 'controls-operationPanel__offset',
                propStorageId: this._options.propStorageId,
                templateOptions: {
                    selectedKeys: this._options.selectedKeys,
                    excludedKeys: this._options.excludedKeys,
                    selectedKeysCount: this._options.selectedKeysCount,
                    isAllSelected: this._options.isAllSelected,
                    selectedCountConfig: this._options.selectedCountConfig
                },
                eventHandlers: {
                    onClose: () => {
                        if (this._operationsController) {
                            this._operationsController.setOperationsMenuVisible(false);
                            this._operationsController.setOperationsPanelVisible(false);
                        }
                        Store.dispatch('operationsPanelExpanded', false);
                    },
                    onResult: (action: string, type) => {
                        if (action === 'selectedTypeChanged') {
                            this._operationsController.selectionTypeChanged(type);
                        }
                    }
                },
                target
            });
        }
    }
}
