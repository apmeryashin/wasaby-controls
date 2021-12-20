import {Logger} from 'UI/Utils';
import {Control} from 'UI/Base';
import BaseOpener, {ILoadDependencies, IBaseOpenerOptions} from 'Controls/_popup/Opener/BaseOpener';
import loadPopupPageConfig from 'Controls/_popup/utils/loadPopupPageConfig';
import {getModuleByName} from 'Controls/_popup/utils/moduleHelper';
import CancelablePromise from 'Controls/_popup/utils/CancelablePromise';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';
import {IPrefetchData, waitPrefetchData} from 'Controls/_popup/utils/Preload';

/**
 * Запускает лоадеры, если они присутсвуют в конфиге,
 * после их вызова вызывает колбек в котором должно быть открытие попапа
 * @param config
 * @param openCallback
 */
function startLoadersIfNecessary(config: IBaseOpenerOptions, openCallback: Function): void {
    if (config.dataLoaders) {
        return BaseOpenerUtil.getManagerWithCallback(() => {
            config._prefetchPromise = ManagerController.loadData(config.dataLoaders);

            // Если initializingWay remote, то нужно вызывать открытие
            // и обновление попапа только после завершения лоадеров.
            if (config.initializingWay === 'remote') {
                waitPrefetchData(config._prefetchPromise).then((prefetchData: IPrefetchData) => {
                    config._prefetchData = prefetchData;
                    openCallback();
                }, openCallback);
            } else {
                openCallback();
            }
        });
    } else {
        openCallback();
    }
}

export default function openPopup(config: IBaseOpenerOptions, controller: string,
                                  moduleName: string): CancelablePromise<string> {
    const promise = new CancelablePromise<string>((cancelablePromise, resolve, reject) => {
        if (!config.hasOwnProperty('isHelper')) {
            Logger.warn('Controls/popup:Dialog: Для открытия диалоговых окон из кода используйте DialogOpener');
        }
        if (!config.hasOwnProperty('opener')) {
            Logger.error( `${moduleName}: Для открытия окна через статический метод, обязательно нужно указать опцию opener`);
        }

        const showDialog = (templateModule: Control, popupConfig: IBaseOpenerOptions, controllerModule: Control) => {
            if (cancelablePromise.isCanceled() === false) {
                startLoadersIfNecessary(popupConfig, () => {
                    BaseOpener.showDialog(templateModule, popupConfig, controllerModule).then((popupId: string) => {
                        if (cancelablePromise.isCanceled() === true) {
                            ManagerController.remove(popupId);
                            reject();
                        }
                        resolve(popupId);
                    });
                });
            } else {
                reject();
            }
        };

        const openByConfig = (popupCfg: IBaseOpenerOptions, controllerModuleName: string) => {

            // что-то поменялось в ядре, в ie из-за частых синхронизаций(при d'n'd) отвалилась перерисовка окон,
            // ядро пишет что создано несколько окон с таким ключом. Такой же сценарий актуален не только для диалогов.
            // убираю асинхронную фазу, чтобы ключ окна не успевал протухнуть пока идут микротаски от промисов.
            const tplModule = getModuleByName(popupCfg.template as string);
            const contrModule = getModuleByName(controllerModuleName);
            if (tplModule && contrModule) {
                showDialog(tplModule, popupCfg, contrModule);
            } else {
                BaseOpener.requireModules(popupCfg, controllerModuleName).then((result: ILoadDependencies) => {
                    showDialog(result.template, popupCfg, result.controller);
                }).catch((error: RequireError) => {
                    reject(error);
                });
            }
        };

        if (config.pageId) {
            loadPopupPageConfig(config).then((popupCfg) => {
                openByConfig(popupCfg, controller);
            }).catch(reject);
        } else {
            openByConfig(config, controller);
        }
    }).catch((err: Error) => {
        Logger.error( `${moduleName}: ${err.message}`);
    });
    return promise;
}
