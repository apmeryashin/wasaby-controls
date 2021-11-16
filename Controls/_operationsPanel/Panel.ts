import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Panel/Panel';
import 'css!Controls/operationsPanel';
import {Container} from 'Controls/dragnDrop';
import {DialogOpener} from 'Controls/popup';
import {ControllerClass as OperationsController} from 'Controls/operations';
import Store from 'Controls/Store';
import {TKey} from 'Controls/interface';
import {isEqual} from 'Types/object';

export enum TOperationsPanelPosition {
    LIST_HEADER= 'listHeader',
    DEFAULT = 'default'
}

export interface IOperationsPanelOptions extends IControlOptions {
    operationsController: OperationsController;
    propStorageId: string;
    selectedKeys: TKey;
    excludedKeys: TKey;
    selectedKeysCount: number;
    selectionViewMode: string;
    selectedCountConfig: unknown;
    position?: TOperationsPanelPosition;
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
        return options.selectedKeysCount !== undefined && options.selectedKeysCount !== 0;
    }

    protected _getPanelOffsetClasses(
        position: TOperationsPanelPosition = TOperationsPanelPosition.DEFAULT,
        theme: string
    ): string {
        let classes = `controls_toggle_theme-${theme}`;
        if (position === TOperationsPanelPosition.LIST_HEADER) {
            classes += ' controls-operationsPanelNew__listHeaderPosition';
        } else {
            classes += ` controls-operationsPanelNew__defaultPosition controls_list_theme-${theme}`;
        }
        return classes;
    }

    protected _beforeUpdate(options: IOperationsPanelOptions): void {
        const currentOptions = this._options;
        if (currentOptions.selectedKeys !== options.selectedKeys ||
            currentOptions.excludedKeys !== options.excludedKeys ||
            currentOptions.selectedKeysCount !== options.selectedKeysCount ||
            !isEqual(currentOptions.selectedCountConfig, options.selectedCountConfig)) {
            this._openCloud(options);
            if (this._shouldOpenMenu(options)) {
                this._operationsController.setOperationsMenuVisible(true);
            }
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

    private _openCloud(options = this._options): void {
        const target = this._children.target;
        this._operationsController.setOperationsPanelVisible(true);
        this._getDialogOpener().open({
            template: 'Controls/operationsPanel:Cloud',
            className: this._getPanelOffsetClasses(options.position, options.theme),
            autofocus: false,
            opener: this,
            propStorageId: options.propStorageId,
            templateOptions: {
                selectedKeys: options.selectedKeys,
                excludedKeys: options.excludedKeys,
                selectedKeysCount: options.selectedKeysCount,
                isAllSelected: options.isAllSelected,
                selectedCountConfig: options.selectedCountConfig,
                operationsController: this._operationsController
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
