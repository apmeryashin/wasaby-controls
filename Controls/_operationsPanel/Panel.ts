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
            this._operationsController.setOperationsMenuOpened(true);
        }
    }

    protected _getDialogOpener(): Promise<DialogOpener> {
        if (!this._dialogOpener) {
            return import('Controls/popup').then((popup) => {
                this._dialogOpener = new popup.DialogOpener();
                return this._dialogOpener;
            });
        } else {
            return Promise.resolve(this._dialogOpener);
        }
    }

    private _openCloud(): void {
        this._getDialogOpener().then((opener) => {
            const target = this._children.target;
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
                        this._options.operationsController.setOperationsMenuOpened(false);
                    },
                    onResult: (action: string) => {
                        if (action === 'click') {
                            this._options.operationsController.selectionTypeChanged('all');
                        }
                    }
                },
                target
            });
        });
    }
    protected _shouldOpenMenu(options: IOperationsPanelOptions): boolean {
        return options.selectedKeysCount > 0;
    }
}
