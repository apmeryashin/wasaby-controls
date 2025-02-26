import {Control, IControlOptions} from 'UI/Base';
import {constants, detection} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import IDropdownController from 'Controls/_dropdown/interface/IDropdownController';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {DependencyTimer} from 'Controls/popup';
import {RecordSet} from 'Types/collection';
import {IStickyPopupOptions} from 'Controls/popup';

export interface IDropdownReceivedState {
    items?: RecordSet;
    history?: RecordSet;
}

export abstract class BaseDropdown extends Control<IControlOptions, IDropdownReceivedState> {
    protected _controller: IDropdownController = null;
    protected _isOpened: boolean = false;
    protected _dependenciesTimer: DependencyTimer = null;

    reload(): void {
        this._controller.reload();
    }

    closeMenu(): void {
        this._controller.closeMenu();
    }

    abstract openMenu(popupOptions?: IStickyPopupOptions): void;

    protected _handleKeyDown(event: SyntheticEvent<KeyboardEvent>): void {
        const code = event.nativeEvent.keyCode;
        const autofocusConfig = {
            autofocus: true,
            templateOptions: {
                focusable: true
            }
        };
        if (code === constants.key.esc && this._isOpened) {
            this._controller.closeMenu();
            this._stopEvent(event);
        } else if (code === constants.key.space && !this._isOpened) {
            this.openMenu(autofocusConfig);
            this._stopEvent(event);
        } else if ((code === constants.key.down || code === constants.key.up) && this._isOpened) {
            this.openMenu(autofocusConfig);
            this._stopEvent(event);
        }
    }

    protected _handleClick(event: SyntheticEvent): void {
        // stop bubbling event in edit mode, so the list does not handle click event.
        if (this._controller.getItems() && !this._options.readOnly) {
            event.stopPropagation();
        }
    }

    protected _handleMouseEnter(event: SyntheticEvent): void {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this));
        }
    }

    protected _handleMouseLeave(event: SyntheticEvent): void {
        this._dependenciesTimer?.stop();
    }

    protected _onOpen(): void {
        if (!detection.isMobileIOS) {
            RegisterUtil(this, 'scroll', this._handleScroll.bind(this));
        }
        this._isOpened = true;
        this._notify('dropDownOpen');
    }

    protected _onClose(): void {
        this._isOpened = false;
        this._controller.handleClose();
        this._notify('dropDownClose');
    }

    protected _footerClick(data): void {
        this._notify('footerClick', [data]);
    }

    protected _rightTemplateClick(data): void {
        this._notify('rightTemplateClick', [data]);
        this._controller.closeMenu();
    }

    protected _selectorDialogOpened(data): void {
        this._initSelectorItems = data;
        this._controller.closeMenu();
    }

    protected _handleScroll(): void {
        if (this._isOpened) {
            this._controller.closeMenu();
        }
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'scroll');
        this._controller.destroy();
    }

    private _loadDependencies(): void {
        this._controller.loadDependencies().catch((error) => {
            return error;
        });
    }

    private _stopEvent(event: SyntheticEvent): void {
        event.stopPropagation();
        event.preventDefault();
    }
}
