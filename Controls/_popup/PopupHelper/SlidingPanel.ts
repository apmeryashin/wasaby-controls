import Base from 'Controls/_popup/PopupHelper/Base';
import BaseOpener, {ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import {ISlidingPanelOptions, ISlidingPanelPopupOptions} from 'Controls/_popup/interface/ISlidingPanel';
import StackOpener from 'Controls/_popup/PopupHelper/Stack';
import DialogOpener from 'Controls/_popup/PopupHelper/Dialog';
import StickyOpener from 'Controls/_popup/PopupHelper/Sticky';
import {detection} from 'Env/Env';
import {Logger} from 'UI/Utils';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';

const POPUP_CONTROLLER = 'Controls/popupSliding:Controller';
const DEFAULT_DESKTOP_MODE = 'stack';
const OPENER_BY_DESKTOP_MODE = {
    stack: StackOpener,
    dialog: DialogOpener,
    sticky: StickyOpener
};

type TDesktopOpener = StackOpener | DialogOpener | StickyOpener;

class SlidingPanelOpener extends BaseOpener {
    static _openPopup(config: ISlidingPanelPopupOptions, popupController: string = POPUP_CONTROLLER): Promise<string> {
        return new Promise((resolve, reject) => {
            BaseOpener.requireModules(config, popupController).then((result: ILoadDependencies) => {
                BaseOpener.showDialog(result.template, config, result.controller).then((popupId: string) => {
                    resolve(popupId);
                });
            }).catch((error: RequireError) => {
                reject(error);
            });
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

/**
 * Хелпер для открытия Шторки.
 * @class Controls/_popup/PopupHelper/SlidingPanel
 * @implements Controls/popup:ISlidingPanel
 *
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/SlidingPanel/Index
 * @public
 */

export default class SlidingPanel extends Base {
    private _opener: Function = SlidingPanelOpener;
    private _desktopOpener: TDesktopOpener;
    protected _options: ISlidingPanelPopupOptions;
    open(popupOptions: ISlidingPanelPopupOptions): unknown {
        const adaptivePopupOptions = this._getPopupOptionsWithSizes(popupOptions);
        const desktopMode = this._getDesktopMode(adaptivePopupOptions);
        this._validateOptions(popupOptions);
        if (this._isMobileMode()) {
            return super.open(adaptivePopupOptions, POPUP_CONTROLLER);
        } else {
            return this._getDesktopOpener(desktopMode).open(adaptivePopupOptions);
        }
    }

    close(...args: unknown[]): void {
        return this._callMethodAdaptive('close', ...args) as void;
    }

    destroy(...args: unknown[]): void {
        return this._callMethodAdaptive('destroy', ...args) as void;
    }

    isOpened(...args: unknown[]): boolean {
        return this._callMethodAdaptive('isOpened', ...args) as boolean;
    }

    private _isMobileMode(): boolean {
        return this._options?.isAdaptive === false || detection.isPhone;
    }

    /**
     * Выполняет метод для десктопного или мобильного опенера,
     * в зависимости от того, на каком устройстве открывают попап.
     * @param {string} methodName
     * @param args
     * @return {unknown}
     * @private
     */
    private _callMethodAdaptive(methodName: string, ...args: unknown[]): unknown {
        if (this._isMobileMode() || !this._desktopOpener) {
            return super[methodName](...args);
        } else {
            return this._getDesktopOpener()[methodName](...args);
        }
    }

    private _getDesktopOpener(
        desktopMode?: ISlidingPanelPopupOptions['slidingPanelOptions']['desktopMode']
    ): TDesktopOpener {
        const mode = desktopMode || this._getDesktopMode(this._options);
        const OpenerConstructor = OPENER_BY_DESKTOP_MODE[mode];
        if (!this._desktopOpener) {
            this._desktopOpener = new OpenerConstructor();
        }
        return this._desktopOpener;
    }

    private _getDesktopMode(
        popupOptions: ISlidingPanelPopupOptions
    ): ISlidingPanelPopupOptions['slidingPanelOptions']['desktopMode'] {
        return popupOptions?.desktopMode || DEFAULT_DESKTOP_MODE;
    }

    /**
     * Получение дефолтного значения slidingPanelOptions,
     * т.к. при открытии на десктопе мы не попадем в контроллел SlidingPanel
     * @param {ISlidingPanelPopupOptions} popupOptions
     * @return {ISlidingPanelOptions}
     * @private
     */
    private _getDefaultSlidingPanelData(popupOptions: ISlidingPanelPopupOptions): ISlidingPanelOptions {
        return {
            desktopMode: popupOptions.desktopMode
        };
    }

    /**
     * Получаем конфиг для открытия панели, в зависимости от того на каком устройстве открываем
     * @param {ISlidingPanelPopupOptions} popupOptions
     * @return {ISlidingPanelPopupOptions}
     * @private
     */
    private _getPopupOptionsWithSizes(popupOptions: ISlidingPanelPopupOptions): ISlidingPanelPopupOptions {
        const isMobileMode = this._isMobileMode();
        const slidingPanelOptions = {
            position: 'bottom',
            desktopMode: DEFAULT_DESKTOP_MODE,
            ...popupOptions.slidingPanelOptions
        };
        const options = isMobileMode ? slidingPanelOptions : popupOptions.dialogOptions;
        const mergedConfig = BaseOpenerUtil.getConfig(this._options, popupOptions) as ISlidingPanelPopupOptions;
        const resultPopupOptions = {
            desktopMode: DEFAULT_DESKTOP_MODE,
            ...mergedConfig,
            ...(options || {}),
            slidingPanelOptions
        };

        /*
            Если открываемся на десктопе, то открываемся другим опенером и в контроллер SlidingPanel не попадаем,
            соответственно slidingPanelOptions никто не прокинет, прокидываем сами через templateOptions
         */
        if (!isMobileMode) {
            if (!resultPopupOptions.templateOptions) {
                resultPopupOptions.templateOptions = {};
            }
            resultPopupOptions.templateOptions.slidingPanelOptions =
                this._getDefaultSlidingPanelData(resultPopupOptions);
        }

        return resultPopupOptions;
    }

    private _validateOptions({slidingPanelOptions}: ISlidingPanelPopupOptions): void {
        const heightList = slidingPanelOptions.heightList ||
            this._options?.slidingPanelOptions?.heightList;
        if (heightList) {
            this._validateHeightList(heightList);
        } else if (!slidingPanelOptions.minHeight) {
            Logger.error('Controls/popup:SlidingPanel: опция minHeight обязательна для заполнения');
        }
    }

    protected _validateHeightList(heightList: ISlidingPanelOptions['heightList']): void {
        const heightListLength = heightList.length;
        if (heightListLength) {
            if (heightListLength > 1) {
                for (let i = 1; i < heightListLength; i++) {
                    if (heightList[i] <= heightList[i - 1]) {
                        Logger.error(`Controls/popup:SlidingPanel:
                            опция heightList должна содержать список высот отсортированных по возрастанию`);
                        break;
                    }
                }
            }
        } else {
            Logger.error('Controls/popup:SlidingPanel: опция heightList должна содержать хотя бы одно значение');
        }
    }
}
