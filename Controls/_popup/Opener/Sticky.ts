import BaseOpener, {IBaseOpenerOptions} from 'Controls/_popup/Opener/BaseOpener';
import {IStickyOpener, IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';
import {Logger} from 'UI/Utils';
import {detection} from 'Env/Env';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import CancelablePromise from 'Controls/_popup/utils/CancelablePromise';
import openPopup from 'Controls/_popup/utils/openPopup';
import {toggleActionOnScroll} from 'Controls/_popup/utils/SubscribeToScroll';

const getStickyConfig = (config: IStickyOpenerOptions = {}) => {
    config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
    if (!(config.target instanceof HTMLElement) && !BaseOpenerUtil.isControl(config.target)) {
        Logger.warn('Controls/popup:Sticky. В опцию target передано неверное значение. Опция принимает либо HTMLElement, либо контрол');
        // Если передали jquery, выцеплю значение из него, чтобы контрол продолжал работать.
        if (config.target) {
            config.target = config.target[0] || config.target;
        }
    }
    return config;
};

const POPUP_CONTROLLER = 'Controls/popupTemplate:StickyController';

interface IStickyOpenerOptions extends IStickyPopupOptions, IBaseOpenerOptions {}
/**
 * Контрол, открывающий всплывающее окно, которое позиционируется относительно вызывающего элемента.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 * Для открытия прилипающих окон из кода используйте {@link Controls/popup:StickyOpener}.
 * @author Красильников А.С.
 * @implements Controls/popup:IBaseOpener
 * @demo Controls-demo/Popup/Sticky/Index
 * @public
 */
class Sticky extends BaseOpener<IStickyOpenerOptions> implements IStickyOpener {
    readonly '[Controls/_popup/interface/IStickyOpener]': boolean;
    private _actionOnScroll: string = 'none';

    open(popupOptions: IStickyPopupOptions): Promise<string | undefined> {
        const promise = super.open(getStickyConfig(popupOptions), POPUP_CONTROLLER);
        if (this._actionOnScroll !== 'none') {
            toggleActionOnScroll(this, true, (scrollEvent: Event) => {
                this._scrollHandler(scrollEvent);
            });
        }
        return promise;
    }

    protected _popupHandler(eventName: string, args: any[]): void {
        if (eventName === 'onClose' && this._actionOnScroll !== 'none') {
            toggleActionOnScroll(this, false);
        }
        super._popupHandler(eventName, args);
    }

    protected _getConfig(popupOptions: IStickyOpenerOptions = {}): IStickyOpenerOptions {
        const baseConfig = super._getConfig(popupOptions);
        if (baseConfig.actionOnScroll) {
            this._actionOnScroll = baseConfig.actionOnScroll;
        }
        return baseConfig;
    }

    protected _getIndicatorConfig(): void {
        // В случае со стики глобальный индикатор только мешает, к примеру в саггесте пока вводят в поле ввода
        // зовется открытие автодополнения. при открытии глобальный индикатор блокирует нажатие клавиш и не позволяет
        // вводить символы, пока саггест не откроется, хотя в этом случае блокировка не нужна.
        // По сути так со всеми окнами, открывающимися от таргета.
        const baseConfig = super._getIndicatorConfig();
        baseConfig.isGlobal = false;
        return baseConfig;
    }

    private _scrollHandler(scrollEvent: Event): void {
        Sticky._scrollHandler(scrollEvent, this._actionOnScroll, this._getCurrentPopupId());
    }

    static getDefaultOptions(): IStickyOpenerOptions {
        const baseConfig: IStickyPopupOptions = BaseOpener.getDefaultOptions();
        baseConfig.actionOnScroll = 'none';
        return baseConfig;
    }

    static _openPopup(config: IStickyPopupOptions): CancelablePromise<string> {
        const newCfg = getStickyConfig(config);
        const moduleName = Sticky.prototype._moduleName;
        return openPopup(newCfg, POPUP_CONTROLLER, moduleName);
    }

    static _scrollHandler(scrollEvent: Event, actionOnScroll: string, popupId: string): void {
        if (scrollEvent.type === 'scroll') {
            // Из-за флага listenAll на listener'e, подписка доходит до application'a всегда.
            // На ios при показе клавиатуры стреляет событие скролла, что приводит к вызову текущего обработчика
            // и закрытию окна. Для ios отключаю реакцию на скролл, событие скролла стрельнуло на body.
            if (detection.isMobileIOS && (scrollEvent.target === document.body || scrollEvent.target === document)) {
                return;
            } else if (actionOnScroll === 'close') {
                BaseOpener.closeDialog(popupId);
            } else if (actionOnScroll === 'track') {
                ManagerController.notifyToManager('pageScrolled', []);
            }
        }
    }

    static openPopup(config: IStickyPopupOptions): Promise<string> {
        const cancelablePromise = Sticky._openPopup(config);
        return new Promise((resolve, reject) => {
            cancelablePromise.then(resolve);
            cancelablePromise.catch(reject);
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

Object.defineProperty(Sticky, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Sticky.getDefaultOptions();
   }
});

export default Sticky;

/**
 * Статический метод для открытия всплывающего окна. При использовании метода не требуется создавать {@link Controls/popup:Sticky} в верстке.
 * @function
 * @static
 * @name Controls/_popup/Opener/Sticky#openPopup
 * @deprecated Используйте методы класса {@link Controls/popup:StickyOpener}.
 */

/**
 * Статический метод для закрытия всплывающего окна.
 * @function
 * @static
 * @name Controls/_popup/Opener/Sticky#closePopup
 * @param {String} popupId Идентификатор окна. Такой идентификатор можно получить при открытии окна методом {@link openPopup}.
 * @deprecated Используйте методы класса {@link Controls/popup:StickyOpener}.
 */
