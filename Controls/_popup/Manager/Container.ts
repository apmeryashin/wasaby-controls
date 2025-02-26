import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {List} from 'Types/collection';
import {IPopupItem} from 'Controls/_popup/interface/IPopup';
import {dispatcherHandler} from 'UI/HotKeys';
import {detection} from 'Env/Env';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import Popup from 'Controls/_popup/Manager/Popup';
import {PendingClass, IPendingConfig} from 'Controls/Pending';
import * as template from 'wml!Controls/_popup/Manager/Container';
import 'css!Controls/popup';

// step zindex between popups.
// It should be enough to place all the additional popups (menu, infobox, suggest) on the main popups (stack, window)
const POPUP_ZINDEX_STEP: number = 10;

interface IRemovedItem {
    removedItem: IPopupItem;
    removeCallback: Function;
}

class Container extends Control<IControlOptions> {

    /**
     * Container for displaying popups
     * @class Controls/_popup/Manager/Container
     * @extends UI/Base:Control
     *
     * @private
     * @author Красильников А.С.
     */

    protected _template: TemplateFunction = template;
    protected _overlayIndex: number;
    protected _popupItems: List<IPopupItem> = new List<IPopupItem>();
    protected _removeItems: IRemovedItem[] = [];
    protected _pendingController: PendingClass;
    protected _mountedPopups: List<string>;
    private _redrawResolve: Function;
    private _redrawPromise: Promise<void>;

    protected _beforeMount(): void {
        const pendingOptions = {
            notifyHandler: (eventName: string, args?: []) => {
                return this._notify(eventName, args, {bubbling: true});
            }
        };
        this._pendingController = new PendingClass(pendingOptions);
        this._onTemplateMounted = this._onTemplateMounted.bind(this);
    }
    protected _afterMount(): void {
        if (this.UNSAFE_isReact) {
            this._mountedPopups = new List();
        }
        ManagerController.setContainer(this);
    }

    protected _afterRender(): void {
        if (this._removeItems.length) {
            this._removeItems.map((data: IRemovedItem) => {
                data.removeCallback(data.removedItem);
            });
            this._removeItems = [];
        }
        if (this._redrawResolve) {
            this._redrawResolve();
            this._redrawResolve = null;
            this._redrawPromise = null;
        }
    }

    protected _onTemplateMounted(popupId: string): void {
        this._mountedPopups.add(popupId);
        const popup = this.getPopupById(popupId);
        popup.onTemplateMounted();
    }

    /**
     * Set a new set of popups
     * @function Controls/_popup/Manager/Container#setPopupItems
     * @param {List} popupItems new popup set
     */
    setPopupItems(popupItems: List<IPopupItem>): Promise<void> {
        this._popupItems = popupItems;
        this._syncMountedPopups();
        this._calcOverlayIndex(popupItems);
        if (!this._redrawPromise)  {
            this._redrawPromise = new Promise((resolve) => {
                this._redrawResolve = resolve;
            });
        }
        return this._redrawPromise;
    }

    private _syncMountedPopups(): void {
        const deleteIds = [];
        this._mountedPopups?.each((popupId) => {
            if (!ManagerController.find(popupId)) {
                deleteIds.push(popupId);
            }
        });
        for (const id of deleteIds) {
            this._mountedPopups.remove(id);
        }
    }

    getOverlayIndex(): number {
        return this._overlayIndex;
    }

    private _calcOverlayIndex(popupItems: List<IPopupItem>): void {
        let maxModalPopup;
        let maxModalPopupIndex;
        popupItems.each((item: IPopupItem, index: number) => {
            if (item.modal) {
                if (!maxModalPopup || item.currentZIndex > maxModalPopup.currentZIndex) {
                    maxModalPopup = item;
                    maxModalPopupIndex = index;
                }
            }
        });
        this._overlayIndex = maxModalPopupIndex;
    }

    removePopupItem(popupItems: List<IPopupItem>, removedItem: IPopupItem, removeCallback: Function): void {
        // Ядро не предоставляет данных о том, когда контрол удалится из верстки.
        // Для того, чтобы пронотифаить событие onClose, когда окно реально удалилось, приходится запоминать
        // удаляемое окно и в цикле после обновления нотифаить для него события.
        // Нужно нотифаить после удаления из-за особенностей работы стековых окон:нижнее окно скрывается через ws-hidden
        // Если верхнее окно закроется, а на событие onClose кто-нибудь (лукап) попытается восстановить фокус
        // то у него ничего не получится, т.к. цикл синхронизации еще не прошел, верхнее окно не удалилось,
        // с нижнего не снялся ws-hidden, из-за чего не отработала фокусировка.
        this._removeItems.push({
            removedItem,
            removeCallback
        });

        // Баг в IE, скорее всего связан с ядром: При удалении абсолютных элементов (окон),
        // сначала удаляются внутренности потом само окно. почему то элементы с overflow: hidden подтормаживают
        // визуально удаление элемента (в DOM окна уже нет, но оно висит с пустым контентом перед пользователем ~1с).
        // Скрываю окно перед циклом синхронизации на удаление, чтобы для пользователя окно скрылось сразу целиком.
        const popup = this.getPopupById(removedItem.id);
        if (detection.isIE && popup) {
            popup._container.classList.add('ws-invisible');
        }
        this.setPopupItems(popupItems);
    }

    getRemovingItems(): IRemovedItem[] {
        return this._removeItems;
    }

    getPopupById(id: string): Popup {
        if (this._children.hasOwnProperty(id)) {
            return this._children[id] as Popup;
        }
    }

    activatePopup(id: string): void {
        const popup = this.getPopupById(id);
        if (popup) {
            popup.activatePopup();
        }
    }

    getPending(): PendingClass {
        return this._pendingController;
    }

    private _registerPendingHandler(event: Event, promise: Promise<unknown>, config: IPendingConfig): void {
        this._pendingController.registerPending(promise, config);
        event.stopPropagation();
    }

    private _finishPendingHandler(event: Event, forceFinishValue: boolean, root: string): Promise<unknown> {
        event.stopPropagation();
        return this._pendingController.finishPendingOperations(forceFinishValue, root);
    }

    private _cancelFinishingPendingHandler(event: Event, root: string): void {
        event.stopPropagation();
        this._pendingController.cancelFinishingPending(root);
    }

    protected _keyDownHandler(event: Event): void {
        return dispatcherHandler(event);
    }

    protected _popupActivated(event: Event, popupId: string, data: boolean): void {
        ManagerController.notifyToManager('popupActivated', [popupId, data]);
    }

    protected _overlayClickHandler(event: Event, item: IPopupItem): void {
        if (!item.popupOptions.closeOnOverlayClick) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    // To calculate the zIndex in a compatible notification Manager
    static POPUP_ZINDEX_STEP: number = POPUP_ZINDEX_STEP;
}

export default Container;
