/**
 * Created by as.krasilnikov on 02.04.2018.
 */
import {Control} from 'UI/Base';
import Container from 'Controls/_popup/Manager/Container';
import {IPopupItem, IPopupOptions, IPopupController} from 'Controls/_popup/interface/IPopup';
import {getModuleByName, loadModule} from 'Controls/_popup/utils/moduleHelper';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {Logger} from 'UI/Utils';

interface IContentData {
    left: number;
    top: number;
    width: number;
}

// Модуль, необходимый для работы окон/панелей в слое совместимости
// В WS2/WS3 модулях нет возможности работать через события, чтобы вызвать методы по работе с окнами
// т.к. хелперы/инстансы старых компонентов могут не лежать в верстке.
// (а если и лежат, то нет возможности общаться с Manager)

export default {
    _manager: null,
    _container: null,
    _indicator: null,
    _contentData: null,
    _rightTemplate: null,
    _rightBottomTemplate: null,
    _stackPosition: 'right',
    _popupHeaderTheme: undefined,
    _theme: undefined,
    _popupSettingsController: undefined,
    _popupPageConfigLoaderModule: undefined,
    setManager(manager: Control): void {
        this._manager = manager;
    },
    getManager(): Control {
        return this._manager;
    },
    setContainer(container: Container): void {
        this._container = container;
    },
    setPopupHeaderTheme(themeName: string): void {
        this._popupHeaderTheme = themeName;
    },
    getPopupHeaderTheme(): string {
        return this._popupHeaderTheme;
    },

    setTheme(themeName: string): void {
        this._theme = themeName;
    },

    getTheme(): string {
        return this._theme;
    },

    // Регистрируем индикатор, лежащий в application.
    // Необходимо для того, чтобы старый индикатор на вдомной странице мог работать через новый компонент
    setIndicator(indicator: Control): void {
        this._indicator = indicator;
    },
    getIndicator(): Control {
        return this._indicator;
    },
    getContainer(): Container {
        return this._container;
    },

    popupUpdated(id: string): void {
        this._manager.eventHandler('popupUpdated', [id]);
    },

    isDestroying(id: string): boolean {
        return this._callManager('isDestroying', arguments);
    },

    /**
     * Найти popup
     */

    find(id: string): IPopupItem {
        return this._callManager('find', arguments);
    },

    /**
     * Удалить popup
     */

    remove(id: string): Promise<void> {
        const managerResult = this._callManager('remove', arguments);
        // todo: https://online.sbis.ru/opendoc.html?guid=6c5ce49a-db79-4fb0-af28-5b50ff688b2e
        if (managerResult === false) { // вызвали метод до маунта Manager'a.
            return Promise.resolve();
        }
        return managerResult;
    },

    /**
     * Обновить popup
     */

    update(id: string, options: IPopupOptions): string {
        return this._callManager('update', arguments);
    },

    updatePosition(id: string): string {
        return this._callManager('updatePosition', arguments);
    },

    updateOptionsAfterInitializing(id: string, options: IPopupOptions): string {
        return this._callManager('updateOptionsAfterInitializing', arguments);
    },

    /**
     * Показать popup
     */

    show(options: IPopupOptions, controller: IPopupController): string {
        return this._callManager('show', arguments);
    },

    loadData(dataLoaders: unknown[]): Promise<unknown> {
        const loaderModule = this._callManager('getDataLoaderModule', arguments);
        if (!loaderModule) {
            const message = 'На приложении не задан загрузчик данных. Опция окна dataLoaders будет проигнорирована';
            Logger.warn(message, this);
            return undefined;
        }
        return new Promise((resolve, reject) => {
            this._getModuleByModuleName(loaderModule, (DataLoader) => {
                DataLoader.load(dataLoaders).then(resolve, reject);
            });
        });
    },

    isPopupCreating(id: string): boolean {
        const item = this.find(id);
        if (item) {
            const popupInstance = this.getContainer().getPopupById(item.id);
            return (item.popupState === 'initializing' || item.popupState === 'creating') && !popupInstance;
        }
        return false;
    },

    _callManager(methodName: string, args: any[]): unknown {
        if (this._manager) {
            return this._manager[methodName].apply(this._manager, args || []);
        }
        return false;
    },

    notifyToManager(actionName: string, args: any[]): void {
        this._callManager('eventHandler', [actionName, args]);
    },

    setContentData(data: IContentData): void {
        this._contentData = data;
    },

    getContentData(): IContentData {
        return this._contentData;
    },

    setRightPanelBottomTemplate(rightTemplate: string): void {
        this._rightBottomTemplate = rightTemplate;
    },

    getRightPanelBottomTemplate(): string {
        return this._rightBottomTemplate;
    },

    setStackPosition(position: string): void {
        this._stackPosition = position;
    },

    getStackPosition(): string {
        return this._stackPosition;
    },

    hasRightPanel(): boolean {
        // На старых страницах настройки на приложении нет, отключаю для темной темы руками, т.к.
        // в облаке правая панель выключена и на вдомных страницах.
        const compatible = !isNewEnvironment() && this._theme !== 'default__dark';
        return !!this._rightBottomTemplate || !!this._rightTemplate || compatible;
    },

    setRightTemplate(template: string): void {
        this._rightTemplate = template;
    },

    getRightTemplate(): string {
        return this._rightTemplate;
    },

    _getModuleByModuleName(moduleName: string, callback: Function): void {
        const module = getModuleByName(moduleName);
        if (module) {
            callback(module);
        } else {
            loadModule(moduleName).then((loadedModule) => {
                callback(loadedModule);
            });
        }
    }
};
