import {Control, IControlOptions} from 'UI/Base';
import Popup from 'Controls/_popup/Manager/Popup';
import Container from 'Controls/_popup/Manager/Container';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import {Logger} from 'UI/Utils';
import {
    IPopupItem,
    IPopupOptions,
    IPopupController,
    IPopupItemInfo,
    IDragOffset,
    IPopupSizes
} from 'Controls/_popup/interface/IPopup';
import {goUpByControlTree} from 'UI/Focus';
import {getClosestControl} from 'UI/NodeCollector';
import {List} from 'Types/collection';
import {Bus as EventBus} from 'Env/Event';
import {constants, detection} from 'Env/Env';
import {TouchDetect} from 'Env/Touch';
import {debounce} from 'Types/function';
import * as randomId from 'Core/helpers/Number/randomId';
import * as Deferred from 'Core/Deferred';
import * as cClone from 'Core/core-clone';

const ORIENTATION_CHANGE_DELAY = 50;

/**
 * Popups Manager
 * @class Controls/_popup/Manager
 * @private
 * @singleton
 * @author Красильников Андрей
 */

interface IManagerOptions extends IControlOptions {
    popupHeaderTheme?: string;
    popupSettingsController?: Control;
    dataLoaderModule?: string;
}

const RESIZE_DELAY = 10;
// on ios increase delay for scroll handler, because popup on frequent repositioning loop the scroll.
const SCROLL_DELAY = detection.isMobileIOS ? 100 : 10;

class Manager {
    _contextIsTouch: boolean = false;
    _dataLoaderModule: string;
    _popupItems: List<IPopupItem> = new List();
    private _pageScrolled: Function;
    private _popupResizeOuter: Function;
    private _dragTimer: number;

    constructor(options: IManagerOptions = {}) {
        this.initTheme(options);
        this._dataLoaderModule = options.dataLoaderModule;
        this._pageScrolled = debounce(this._pageScrolledBase, SCROLL_DELAY);
        this._popupResizeOuter = debounce(this._popupResizeOuterBase, RESIZE_DELAY);
    }

    protected initTheme(options: IManagerOptions): void {
        ManagerController.setPopupHeaderTheme(options.popupHeaderTheme);
        ManagerController.setTheme(options.theme);
    }

    init(): void {
        this._updateContext();
        ManagerController.setManager(this);
        this._subscribeToPageDragNDrop();
        this._navigationHandler = this._navigationHandler.bind(this);
        EventBus.channel('navigation').subscribe('onBeforeNavigate', this._navigationHandler);

        if (detection.isMobilePlatform) {
            window.addEventListener('orientationchange', () => {
                // На момент срабатывания обработчика приходят старые размеры страницы.
                // Опытным путем был подобран таймаут, после которого приходят актуальные размеры.
                // Для IPAD PRO необходимо 50мс
                setTimeout(() => {
                    this.orientationChangeHandler();
                    // Еще 1 баг: при блокировке и разблокировки ipad'a с открытым safari, ios решает:
                    // 1. Заресайзить страницу по высоте (html растянут на всю высоту, body меньше половины)
                    // сделать так, чтобы body не уменьшался помог только min-height: 100vh.
                    // 2. Стрельнуть событием orientationChanged
                    // Если при неправильной высоте body пересчитать позицию, то получим неверный результат.
                    // Чтобы сильно долгой задержки не было при реальной смене ориентации, добавляю
                    // еще 1 пересчет позиции, с расчетом на то, что тело страницы успеет вернуть прежние размеры.
                    setTimeout(() => {
                        this.orientationChangeHandler();
                    }, ORIENTATION_CHANGE_DELAY * 3);
                }, ORIENTATION_CHANGE_DELAY);
            });
        }

        if (constants.isBrowserPlatform) {
            // Если смена урла осуществляется по кнопками вперед и назад в браузере - обрабатываем их как клик мимо
            window.addEventListener('popstate', () => {
                this.historyChangeHandler();
            });
        }

        if (detection.isMobileIOS) {
            this._controllerVisibilityChangeHandler = this._controllerVisibilityChangeHandler.bind(this);
            EventBus.globalChannel().subscribe('MobileInputFocus', this._controllerVisibilityChangeHandler);
            EventBus.globalChannel().subscribe('MobileInputFocusOut', this._controllerVisibilityChangeHandler);
        }
    }

    updateOptions(popupHeaderTheme: string): void {
        this._updateContext();
        // Theme of the popup header can be changed dynamically.
        // The option is not inherited, so in order for change option in 1 synchronization cycle,
        // we have to make an event model on ManagerController.
        // Now there are no cases where the theme changes when the popup are open,
        // so now just change the theme to afterUpdate.
        ManagerController.setPopupHeaderTheme(popupHeaderTheme);
    }

    destroy(): void {
        if (detection.isMobileIOS) {
            EventBus.globalChannel().unsubscribe('MobileInputFocus', this._controllerVisibilityChangeHandler);
            EventBus.globalChannel().unsubscribe('MobileInputFocusOut', this._controllerVisibilityChangeHandler);
        }
    }

    getDataLoaderModule(): string {
        return this._dataLoaderModule;
    }

    /**
     * Show
     * @function Controls/_popup/Manager#show
     * @param options popup configuration
     * @param controller popup controller
     */
    show(options: IPopupOptions, controller: IPopupController): string {
        if (this.find(options.id)) {
            this.update(options.id, options);
            return options.id;
        }
        const item: IPopupItem = this._createItemConfig(options, controller);
        const defaultConfigResult: Promise<void> | void | boolean = controller.getDefaultConfig(item);
        if (defaultConfigResult instanceof Promise) {
            defaultConfigResult.then(() => {
                // Если за время выполнения промиса еще раз позвали открытие, то не нужно второй раз создавать окно
                // нужно обновить уже существующее. иначе упадет синхронизатор, т.к. у окна задублируются ключи
                if (this.find(options.id)) {
                    this.update(options.id, options);
                } else {
                    this._addElement(item);
                }
                this._redrawItems();
            });
        } else if (defaultConfigResult === false) {
            this._removeFromParentConfig(item);
            this._fireEventHandler(item, 'onClose');
        } else {
            this._addElement(item);
            this._redrawItems();
        }
        return item.id;
    }

    updatePosition(id: string): void {
        const item = this.find(id);
        let needUpdate = false;
        if (item) {
            needUpdate = item.controller.updatePosition(item, this._getItemContainer(item.id));
        }
        if (needUpdate) {
            this._redrawItems();
        }
    }

    updateOptionsAfterInitializing(id: string, options: IPopupOptions): void {
        const item = this.find(id);
        if (item && item.popupState === item.controller.POPUP_STATE_INITIALIZING) {
            item.popupOptions = options;
            Promise.resolve(item.controller.getDefaultConfig(item)).then(() => {
                this._popupItems._nextVersion();
            });
        }
    }

    /**
     * Upgrade options of an existing popup
     * @function Controls/_popup/Manager#update
     * @param id popup id
     * @param options new options of popup
     */
    update(id: string, options: IPopupOptions): string | null {
        const item: IPopupItem = this.find(id);
        if (item) {
            const oldOptions: IPopupOptions = item.popupOptions;
            item.popupOptions = options;

            // Пока отключаю смену z-index при переоткрытии. Повторный вызов open используют в 2х сценариях -
            // когда хотят открыть "новый" документ и когда просто хотят обновить часть опций, не задавая новый контекст
            // открытия. Во 2м случае обновления z-index быть не должно. Нужно продумать как разделить 2 этих сценария.
            // Пример https://online.sbis.ru/opendoc.html?guid=1f38986e-d9fc-4210-b65a-3c5eca75ecb8
            // this._moveToTop(item);
            const updateOptionsResult: null | Promise<null> =
                item.controller.elementUpdateOptions(item, this._getItemContainer(id));
            if (updateOptionsResult instanceof Promise) {
                updateOptionsResult.then((result) => {
                    return this._updatePopupOptions(id, item, oldOptions, result);
                });
            } else {
                this._updatePopupOptions(id, item, oldOptions, updateOptionsResult);
            }
            return id;
        }
        return null;
    }

    /**
     * Remove popup
     * @function Controls/_popup/Manager#remove
     * @param id popup id
     */
    remove(id: string): Promise<void> {
        const item = this.find(id);
        if (item) {
            const itemContainer = this._getItemContainer(id);
            const needClose = item.controller.beforeElementDestroyed(item, itemContainer);
            if (needClose) {
                return new Promise((resolve) => {
                    this._closeChilds(item).then(() => {
                        this._finishPendings(id, null, null, () => {
                            this._removeElement(item, itemContainer).then(() => {
                                resolve();
                                const parentItem = this.find(item.parentId);
                                this._closeChildHandler(parentItem);
                            });
                        });
                    });
                });
            }
        }
        return Promise.resolve();
    }

    /**
     * Find popup configuration
     * @function Controls/_popup/Manager#find
     * @param id popup id
     */
    find(id: string): IPopupItem {
        const item: IPopupItem = this._findItemById(id);

        if (!item ||
            item.popupState === item.controller.POPUP_STATE_DESTROYING ||
            item.popupState === item.controller.POPUP_STATE_DESTROYED) {
            return null;
        }

        return item;
    }

    isDestroying(id: string): boolean {
        const item = this._findItemById(id);
        if (!item) {
            // Элемент может быть удален с состояния ( что вызывает непорсдетсвенно анмаунт окна), но
            // цикла синхронизации еще могло не произойти. Если окно ожидает синхронизации на разрушение, тоже учитываю.
            const removedItems = ManagerController.getContainer().getRemovingItems();
            for (const removeData of removedItems) {
                if (removeData.removedItem.id === id) {
                    return true;
                }
            }
        }
        return item && (item.popupState === item.controller.POPUP_STATE_START_DESTROYING ||
            item.popupState === item.controller.POPUP_STATE_DESTROYING ||
            item.popupState === item.controller.POPUP_STATE_DESTROYED);
    }

    private _subscribeToPageDragNDrop(): void {
        // Подписка и на платформенное перемещение, и на нативное, т.к. перемещение файлов из ОС тоже нужно отследить.
        const handler = (...args) => {
            this.eventHandler('pageDragnDropHandler', args);
        };
        EventBus.channel('dragnDrop').subscribe('documentDragStart', (event, eventObject) => {
            handler('dragStart', eventObject);
        });
        EventBus.channel('dragnDrop').subscribe('documentDragEnd', (event, eventObject) => {
            handler('dragEnd', eventObject);
        });
        if (document) {
            document.addEventListener('dragenter', handler);
        }
    }

    // Если из текушего окна не открыто других окон, то поднимем его выше среди окон того же уровня (с тем же родителем)
    // при переоткрытии.
    private _moveToTop(item: IPopupItem): void {
        let itemIndex;
        let newIndex;
        const hasChild = item.childs.length > 0;
        const hasParent = !!item.parentId;
        if (hasChild || hasParent) {
            return;
        }
        this._popupItems.each((elem: IPopupItem, index: number) => {
            if (item === elem) {
                itemIndex = index;
            } else if (itemIndex !== undefined) {
                if (elem.parentId === item.parentId) {
                    newIndex = index;
                }
            }
        });
        if (itemIndex !== undefined && newIndex !== undefined) {
            this._popupItems.move(itemIndex, newIndex);
        }
    }

    private orientationChangeHandler(): void {
        let needUpdate = false;
        this._popupItems.each((item) => {
            if (this._orientationChanged(item.id)) {
                needUpdate = true;
            }
        });
        if (needUpdate) {
            this._redrawItems();
        }
    }

    private _updateContext(): void {
        this._contextIsTouch = TouchDetect.getInstance().isTouch();
    }

    private _createItemConfig(options: IPopupOptions, controller: IPopupController): IPopupItem {
        const popupId: string = options.id || randomId('popup-');
        const popupConfig: IPopupItem = {
            id: popupId,
            modal: options.modal,
            controller,
            popupOptions: options,
            sizes: {},
            activeControlAfterDestroy: this._getActiveControl(),
            activeNodeAfterDestroy: this._getActiveElement(), // TODO: COMPATIBLE
            popupState: controller.POPUP_STATE_INITIALIZING,
            childs: []
        } as IPopupItem;

        return popupConfig;
    }

    // Register the relationship between the parent and child popup
    private _registerPopupLink(popupConfig: IPopupItem): void {
        if (popupConfig.popupOptions.opener) {
            const parent: Popup = this._findParentPopup(popupConfig.popupOptions.opener) as Popup;
            if (parent) {
                const id = parent.getPopupId();
                const item = this.find(id);
                if (item) {
                    item.childs.push(popupConfig);
                    popupConfig.parentId = item.id;
                }
            }
        }
    }

    private _findParentPopup(control: Control): Popup | boolean {
        const parentControls: Control[] = goUpByControlTree(control._container);
        for (let i = 0; i < parentControls.length; i++) {
            if (parentControls[i]._moduleName === 'Controls/_popup/Manager/Popup') {
                return parentControls[i] as Popup;
            }
        }
        return false;
    }

    private _addElement(item: IPopupItem): void {
        this._popupItems.add(item);
        this._registerPopupLink(item);
    }

    private _closeChilds(item: IPopupItem): Promise<null> {
        if (!item.childs.length) {
            return Promise.resolve(null);
        }
        for (let i = 0; i < item.childs.length; i++) {
            this.remove(item.childs[i].id);
        }

        return new Promise((resolve) => {
            item.closeChildsPromiseResolver = resolve;
        });
    }

    private _closeChildHandler(item: IPopupItem): void {
        // Если окно ожидает закрытия, то ждем, пока не закроются все дети
        if (item && !item.childs.length) {
            if (item.closeChildsPromiseResolver) {
                item.closeChildsPromiseResolver();
            }
        }
    }

    private _removeElement(item: IPopupItem, container: HTMLElement): Promise<void> {
        const removeDeferred = item.controller.elementDestroyedWrapper(item, container);
        this._redrawItems();

        Manager._notifyEvent('managerPopupBeforeDestroyed', [item, this._popupItems, container]);
        return removeDeferred.addCallback(() => {
            this._popupItems.remove(item);
            this._removeFromParentConfig(item);

            this._removeContainerItem(item, (removedItem: IPopupItem) => {
                this._fireEventHandler(removedItem, 'onClose');
            });
            Manager._notifyEvent('managerPopupDestroyed', [item, this._popupItems]);
        });
    }

    private _removeFromParentConfig(item: IPopupItem): void {
        const parent = this.find(item.parentId);
        if (parent) {
            for (let i = 0; i < parent.childs.length; i++) {
                if (parent.childs[i].id === item.id) {
                    parent.childs.splice(i, 1);
                    return;
                }
            }
        }
    }

    protected _popupBeforePaintOnMount(id: string): void {
        const item = this.find(id);
        if (item) {
            if (!item.popupOptions.isCompoundTemplate) {
                Manager._notifyEvent('managerPopupCreated', [item, this._popupItems]);
            }
        }
    }

    protected _popupCreated(id: string): boolean {
        const item = this.find(id);
        if (item) {
            // Register new popup
            this._fireEventHandler(item, 'onOpen');
            this._prepareIsTouchData(item);
            return item.controller.elementCreatedWrapper(item, this._getItemContainer(id));
            // if it's CompoundTemplate, then compoundArea notify event, when template will ready.
            // notify this event on popupBeforePaintOnMount, cause we need synchronous reaction on created popup
            // if (!item.popupOptions.isCompoundTemplate) {
            //     Manager._notifyEvent('managerPopupCreated', [item, this._popupItems]);
            // }
        }
        return false;
    }

    private _prepareIsTouchData(item: IPopupItem): void {
        item.contextIsTouch = this._contextIsTouch;
    }

    protected _popupMovingSize(id: string, offset: object | number): boolean {
        const element = this.find(id);
        if (element) {
            let offsetValue: object = offset;
            if (typeof offset === 'number') {
                offsetValue = {x: offset};
            }
            element.controller.popupMovingSize(element, offsetValue);
            Manager._notifyEvent('managerPopupUpdated', [element, this._popupItems]);
            return true;
        }
        return false;
    }

    protected _popupUpdated(id: string): boolean {
        const element = this.find(id);
        if (element) {
            // при создании попапа, зарегистрируем его
            const needUpdate = element.controller.elementUpdatedWrapper(element, this._getItemContainer(id));
            Manager._notifyEvent('managerPopupUpdated', [element, this._popupItems]);
            return !!needUpdate;
        }
        return false;
    }

    protected _popupMaximized(id: string, state: boolean): boolean {
        const element = this.find(id);
        if (element) {
            element.controller.elementMaximized(element, this._getItemContainer(id), state);
            Manager._notifyEvent('managerPopupMaximized', [element, this._popupItems]);
            return true;
        }
        return false;
    }

    protected _orientationChanged(id: string): boolean {
        const element = this.find(id);
        if (element) {
            return element.controller.orientationChanged(element, this._getItemContainer(id));
        }
        return false;
    }

    protected _popupAfterUpdated(id: string): boolean {
        const element = this.find(id);
        if (element) {
            // при создании попапа, зарегистрируем его
            return element.controller.elementAfterUpdatedWrapper(element, this._getItemContainer(id));
        }
        return false;
    }

    protected _popupActivated(id: string): void {
        // popup was activated
    }

    protected mouseDownHandler(event: Event): void {
        this._outsideClickHandler(event);
    }

    private _handlePopupWithOverlay(): void {
        const popupContainer = ManagerController.getContainer();
        const overlayIndex = popupContainer.getOverlayIndex();
        const popupItem = overlayIndex !== -1 && this._popupItems.at(overlayIndex);
        if (popupItem && popupItem.popupState !== popupItem.controller.POPUP_STATE_INITIALIZING) {
            this._closePopupByOutsideClick(popupItem);
        }
    }

    protected historyChangeHandler(): void {
        this._handlePopupWithOverlay();
        this._outsideClickHandler();
    }

    private _outsideClickHandler(event?: Event): void {
        const target = event?.target as HTMLElement;
        const isClickToOverlay = target ? this._elementIsPopupOverlay(target) : false;
        const isClickToIgnoredArea = target ? this._isIgnoreActivationArea(target) : false;
        if (isClickToOverlay) {
            this._handlePopupWithOverlay();
        } else if (!isClickToIgnoredArea) {
            const popupsForClose = [];
            this._popupItems.each((item) => {
                if (item) {
                    const parentControls = target ? goUpByControlTree(target) : [];
                    const popupInstance = ManagerController.getContainer().getPopupById(item.id);

                    // Check the link between target and popup
                    if (this._needClosePopupByOutsideClick(item) && parentControls.indexOf(popupInstance) === -1) {
                        popupsForClose.push(item);
                    }
                }
            });
            for (let i = 0; i < popupsForClose.length; i++) {
                this._closePopupByOutsideClick(popupsForClose[i]);
            }
        }
    }

    private _closePopupByOutsideClick(item: IPopupItem): void {
        if (item.popupOptions.isCompoundTemplate) {
            // TODO: Compatible ветка.
            // Если попап создался, а слой совместимости еще не готов, то считаем что окно не построилось
            // и не должно закрываться на клик мимо.
            const itemContainer = this._getItemContainer(item.id);
            const compoundArea = this._getCompoundArea(itemContainer);
            if (compoundArea.isPopupCreated()) {
                compoundArea.close();
            }
        } else {
            item.controller.closePopupByOutsideClick(item);
        }
    }

    private _elementIsPopupOverlay(target: Element): boolean {
        return target.classList.contains('controls-Container__overlay');
    }

    private _needClosePopupByOutsideClick(item: IPopupItem): boolean {
        return item.popupOptions.closeOnOutsideClick && item.popupState !== item.controller.POPUP_STATE_INITIALIZING;
    }

    private _getActiveElement(): HTMLElement {
        return constants.isBrowserPlatform && document.activeElement as HTMLElement;
    }

    private _getActiveControl(): Control {
        return goUpByControlTree(this._getActiveElement())[0];
    }

    protected _popupDragStart(id: string, offset: IDragOffset, sizes: IPopupSizes): boolean {
        const element = this.find(id);
        if (element) {
            element.controller.popupDragStart(element, this._getItemContainer(id), offset, sizes);
            return true;
        }
        return false;
    }

    protected _popupMouseEnter(id: string, event: Event): boolean {
        const item = this.find(id);
        if (item) {
            item.controller.popupMouseEnter(item, this._getItemContainer(id), event);
        }
        return false;
    }

    protected _popupMouseLeave(id: string, event: Event): boolean {
        const item = this.find(id);
        if (item) {
            item.controller.popupMouseLeave(item, this._getItemContainer(id), event);
        }
        return false;
    }

    protected _popupResizeInner(id: string): boolean {
        const item = this.find(id);
        if (item) {
            const parentItem = this.find(item.parentId);
            // Если над скрытым стековым окном позиционируются другие окна,
            // то не даем им реагировать на внутренние ресайзы
            // иначе позиция может сбиться, т.к. таргет в текущий момент невидим
            if (!parentItem || parentItem.position.hidden !== true) {
                return item.controller.resizeInner(item, this._getItemContainer(id));
            }
        }
        return false;
    }

    protected _popupResizeOuterBase(): void {
        const result = this._updatePopupPosition('resizeOuter');
        // Обработчик обернут в debounce, обновление нужно звать самому, после выполнения функции.
        if (result) {
            this._redrawItems();
        }
    }

    protected _workspaceResize(): boolean {
        return this._updatePopupPosition('workspaceResize');
    }

    protected _pageScrolledBase(): boolean {
        const result = this._updatePopupPosition('pageScrolled');
        // Обработчик обернут в debounce, обновление нужно звать самому, после выполнения функции.
        if (result) {
            this._redrawItems();
        }
    }

    private _updatePopupPosition(callbackName: string): boolean {
        let needUpdatePopups = false;
        // Изменились размеры контентной области. Сбросим кэш и пересчитаем позиции окон.
        this._resetRestrictiveContainerCache();
        this._popupItems.each((item: IPopupItem) => {
            const needUpdate = item.controller[callbackName](item, this._getItemContainer(item.id));
            if (needUpdate) {
                needUpdatePopups = true;
            }
        });
        return needUpdatePopups;
    }

    private _resetRestrictiveContainerCache(): void {
        const BaseController = this._getBaseController();
        BaseController?.resetRootContainerCoords();
    }

    private _getBaseController(): unknown {
        const controllerLibName = 'Controls/popupTemplate';
        if (requirejs.defined(controllerLibName)) {
            const {BaseController} = requirejs(controllerLibName);
            return BaseController;
        }
    }

    protected _popupDragEnd(id: string, offset: number): boolean {
        const element = this.find(id);
        if (element) {
            element.controller.popupDragEnd(element, offset);
            return true;
        }
        return false;
    }

    protected _popupResult(id: string): boolean {
        const args = Array.prototype.slice.call(arguments, 1);
        // Окно уничтожается из верстки за счет удаления конфигурации из массива, по которому строятся окна.
        // В этом случае вызов unmount дочерних контролов произойдет после того, как конфига с окном в списке не будет.
        // Поэтому если на beforeUnmount пронотифаят sendResult, то мы его не обработаем, т.к. не найдем конфиг окна.
        // Поэтому достаю опции не из массива, а из самого инстанса, который в этом случае находится в состоянии
        // анмаунта, но еще не удален.
        const popup = this._getPopupContainer().getPopupById(id);
        this._callEvents(popup?._options, 'onResult', args);
    }

    protected _popupClose(id: string): boolean {
        const item = this.find(id);
        if (item) {
            item.removeInitiator = 'innerTemplate';
            this.remove(id);
        }
        return false;
    }

    protected _popupAnimated(id: string): boolean {
        const item = this._findItemById(id);
        if (item) {
            return item.controller.elementAnimated(item, this._getItemContainer(id));
        }
        return false;
    }

    private _fireEventHandler(item: IPopupItem, event: string): boolean {
        if (item) {
            const popupOptions = cClone(item.popupOptions || {});
            popupOptions.id = item.id;
            try {
                this._callEvents(popupOptions, event);
            } catch (e: Error) {
                Logger.error(`В окне с шаблоном ${popupOptions.template}
                произошла ошибка в обработчике события ${event}`, undefined, e);
            }
        }
    }

    private _callEvents(options: IPopupOptions = {}, event: string, args: unknown[] = []): boolean {
        if (options._events && options._events[event]) {
            options._events[event](event, args);
        }
        if (options.eventHandlers && typeof options.eventHandlers[event] === 'function') {
            options.eventHandlers[event].apply(options, args);
        }
    }

    private _getItemContainer(id: string): HTMLElement {
        const popupContainer = ManagerController.getContainer();
        const item = popupContainer && popupContainer._children[id];
        let container = item && item._container;

        // todo https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
        if (container && container.jquery) {
            container = container[0];
        }
        return container;
    }

    private _removeContainerItem(removedItem: IPopupItem, removedCallback: Function): void {
        ManagerController.getContainer().removePopupItem(this._popupItems, removedItem, removedCallback);
        this._redrawItems();
    }

    private _redrawItems(): Promise<void> {
        this._updateZIndex();
        this._popupItems._nextVersion();
        return ManagerController.getContainer().setPopupItems(this._popupItems);
    }

    private _updateZIndex(): void {
        const popupList = this._preparePopupList();
        const POPUP_ZINDEX_STEP = 10;
        // для topPopup сделал шаг 2000, чтобы не писать отдельный просчет zIndex на старой странице
        const TOP_POPUP_ZINDEX_STEP = 2000;

        this._popupItems.each((item: IPopupItem, index: number) => {
            // todo Нужно будет удалить поддержку опции zIndex, теперь есть zIndexCallback
            let customZIndex: number = item.popupOptions.zIndex;
            const currentItem = popupList.at(index);
            if (item.popupOptions.zIndexCallback) {
                customZIndex = item.popupOptions.zIndexCallback(currentItem, popupList);
            }
            const step = item.popupOptions.topPopup ? TOP_POPUP_ZINDEX_STEP : POPUP_ZINDEX_STEP;
            const calculatedZIndex: number = currentItem.parentZIndex ? currentItem.parentZIndex + step : null;
            const baseZIndex: number = (index + 1) * step;

            // zIndex c конфига не может быть меньше родительского
            if (currentItem.parentZIndex && customZIndex < currentItem.parentZIndex) {
                customZIndex = calculatedZIndex;
            }

            item.currentZIndex = customZIndex || calculatedZIndex || baseZIndex;
        });
    }

    private _preparePopupList(): List<IPopupItemInfo> {
        const popupList: List<IPopupItemInfo> = new List();
        this._popupItems.each((item: IPopupItem) => {
            let parentZIndex = null;
            if (item.parentId) {
                const index = this._popupItems && this._popupItems.getIndexByValue('id', item.parentId);
                if (index > -1) {
                    parentZIndex = this._popupItems.at(index).currentZIndex;
                }
            }
            popupList.add({
                id: item.id,
                type: item.controller.TYPE,
                parentId: item.parentId,
                parentZIndex,
                popupOptions: {
                    maximize: !!item.popupOptions.maximize, // for notification popup
                    modal: !!item.popupOptions.modal, // for notification popup
                    template: item.popupOptions.template
                }
            });
        });
        return popupList;
    }

    private _controllerVisibilityChangeHandler(): void {
        const keyboardAnimationDelay = 250;
        // wait, until keyboard show/hide for positioning popup
        setTimeout(() => {
            this._popupItems.each((item) => {
                if (item.controller.needRecalcOnKeyboardShow()) {
                    item.controller.elementUpdatedWrapper(item, this._getItemContainer(item.id));
                }
            });
            this._redrawItems();
        }, keyboardAnimationDelay);
    }

    private _getPopupContainer(): Container {
        return ManagerController.getContainer();
    }

    private _finishPendings(popupId: string,
                            popupCallback: Function,
                            pendingCallback: Function,
                            pendingsFinishedCallback: Function): void {
        const registrator = this._getPopupContainer().getPending();
        const item = this._findItemById(popupId);
        if (item && registrator) {
            if (popupCallback) {
                popupCallback();
            }

            if (registrator) {
                const hasRegisterPendings = registrator.hasRegisteredPendings(popupId);
                if (hasRegisterPendings && pendingCallback) {
                    pendingCallback();
                }
                if (item.removePending) {
                    return item.removePending;
                }
                item.removePending = registrator.finishPendingOperations(undefined, popupId);

                // TODO: Compatible Пендинги от совместимости старого FormController'a не
                // попадают в _hasRegisteredPendings,
                // но вызываются в finishPendingOperations не завершаясь.
                // (приходит только информация, нужно стопать закрытие или нет)
                // Сдедал правку, чтобы мы не ждали завершения пендинга от совместимости
                if (!hasRegisterPendings) {
                    item.removePending = (new Deferred()).callback();
                }
                item.removePending.addCallbacks(() => {
                    item.removePending = null;
                    if (pendingsFinishedCallback) {
                        pendingsFinishedCallback();
                    }
                }, (e) => {
                    item.removePending = null;
                    // Change popupState from 'destroyed' to 'created' after cancelFinishPending
                    item.popupState = item.controller.POPUP_STATE_CREATED;
                    if (e.canceled !== true) {
                        Logger.error('Controls/_popup/Manager/Container: Не получилось завершить пендинги: ' +
                            '(name: ' + e.name + ', message: ' + e.message + ', details: ' + e.details + ')',
                            undefined, e);
                        if (pendingsFinishedCallback) {
                            pendingsFinishedCallback();
                        }
                    }
                });
            }
        } else {
            if (pendingsFinishedCallback) {
                pendingsFinishedCallback();
            }
        }
    }

    private _isIgnoreActivationArea(focusedContainer: HTMLElement): boolean {
        const ignoredClasses = ['controls-Popup__isolatedFocusingContext', 'ws-window-overlay',
            'ws-wait-indicator', 'controls-OpenDialogAction-overlay'];
        while (focusedContainer && focusedContainer.classList) {
            // TODO: Compatible
            // Клик по старому оверлею не должен приводить к закрытию вдомных окон на старой странице
            for (const ignoredClass of ignoredClasses) {
                if (focusedContainer.classList.contains(ignoredClass)) {
                    return true;
                }
            }
            // У SVG в IE11 нет parentElement
            focusedContainer = focusedContainer.parentElement || focusedContainer.parentNode;
        }
        return false;
    }

    private _findItemById(id: string): IPopupItem {
        const index = this._popupItems && this._popupItems.getIndexByValue('id', id);
        if (index > -1) {
            return this._popupItems.at(index);
        }
        return null;
    }

    // TODO Compatible
    // Старые панели прерывали свое закрытие без механизма пендингов, на событие onBeforeClose
    // Зовем метод close с шаблона. Если закрывать по механизму деактивации, то он уничтожит попап =>
    // у compoundArea вызовется сразу destroy. такую логику прервать нельзя
    private _getCompoundArea(popupContainer: HTMLElement): Control {
        const compoundContainer = $('.controls-CompoundArea', popupContainer)[0];
        return getClosestControl(compoundContainer);
    }

    private _updatePopupOptions(id: string, item: IPopupItem, oldOptions: IPopupOptions, result: boolean): void {
        if (result) {
            // Эмулируется поведение при открытии, когда состояние с initializing меняется на created
            item.controller.beforeUpdateOptions(item);
            this._redrawItems().then(() => {
                item.controller.afterUpdateOptions(item);
                if (item.popupOptions.autofocus !== false) {
                    ManagerController.getContainer().activatePopup(id);
                }
            });
        } else {
            item.popupOptions = oldOptions;
        }
    }

    protected _pageDragnDropHandler(type: string, dragEvent: object = {}): boolean {
        const {domEvent} = dragEvent;
        const delay = 10;
        if (this._dragTimer) {
            clearTimeout(this._dragTimer);
        }

        /*
           Событие documentDragStart стреляет на всех контейнерах на странице. Для обработки понимаем, лежит ли
           нужный контейнер внутри текущего окна.
           Делать нужно синхронно, а не в таймауте,
           т.к. конец драга может вызвать перестроение и нода таргета уже не будет в доме
         */
        const popupNode = domEvent?.target.closest('.controls-Popup');

        // Общий обработчик троттлим в течение 10мс. Нужно для того, чтобы понять, не происходит ли dnd внутри окна
        // и не быть завязаным на порядок срабатывания событий.
        this._dragTimer = setTimeout(() => {
            this._dragTimer = null;
            this._popupItems.each((item) => {
                const popupContainer = this._getItemContainer(item.id);
                const isInsideDrag = popupNode === popupContainer;
                if (item.controller.dragNDropOnPage(item, popupContainer, isInsideDrag, type)) {
                    this.remove(item.id);
                }
                this._redrawItems();
            });
        }, delay);
    }

    // TODO Должно быть удалено после https://online.sbis.ru/opendoc.html?guid=f2b13a65-f404-4fbd-a05c-bbf6b59358e6
    private _navigationHandler(event: Event, activeElement: HTMLElement, isIconClick: boolean): void {
        let hasPendings = false;
        // Если пытаются перейти по аккордеону, то закрываем все открытые окна
        // Если есть пендинги - отменяем переход.
        this._popupItems.each((item) => {
            const registrator = this._getPopupContainer().getPending();
            if (registrator) {
                if (registrator.hasRegisteredPendings(item.id)) {
                    hasPendings = true;
                }
            }
            // Закрываю окна первого уровня, дочерние закроются вместе с ними
            // нотификационные окна не закрываем ( ДО, звонки )
            if (!item.parentId && item.controller.TYPE !== 'Notification') {
                this.remove(item.id);
            }
        });
        // Устанавливаю результат только когда нужно отменить переход, иначе ломается старый механизм spa-переходов,
        // работающий на значении результата события onbeforenavigate
        if (!isIconClick && hasPendings) {
            event.setResult(false);
        }
    }

    eventHandler(actionName: string, args: any[]): void {
        const actionResult = this[`_${actionName}`].apply(this, args);
        if (actionResult === true) {
            this._redrawItems();
        }
    }

    private static _notifyEvent(event: string, args: unknown[]): void {
        EventBus.channel('popupManager').notify(event, ...args);
    }
}

export default Manager;
