import Base from 'Controls/_popup/PopupHelper/Base';
import StickyOpener from 'Controls/_popup/Opener/Sticky';
import {IStickyPopupOptions, TActionOnScroll, TTarget} from 'Controls/_popup/interface/ISticky';
import {toggleActionOnScroll} from 'Controls/_popup/utils/SubscribeToScroll';
import * as randomId from 'Core/helpers/Number/randomId';

/**
 * Хелпер для открытия прилипающих окон
 * @class Controls/_popup/PopupHelper/Sticky
 * @implements Controls/popup:IStickyOpener
 * @implements Controls/popup:IBaseOpener
 * @remark
 * Для предотвращения потенциальной утечки памяти не забывайте уничтожать экземпляр опенера с помощью метода {@link Controls/_popup/PopupHelper/Sticky#destroy destroy}.
 *
 * @author Красильников А.С.
 * @public
 */

export default class Sticky extends Base {
    protected _opener = StickyOpener;
    private _instanceId: string = randomId('stickyPopup-');
    private _target: TTarget;
    private _actionOnScroll: TActionOnScroll;

    constructor(config: IStickyPopupOptions = {}) {
        super(config);
        this._updateState(config);
    }

    open(popupOptions: IStickyPopupOptions = {}): Promise<void> {
        this._updateState(popupOptions);
        return super.open(popupOptions);
    }

    // Для Корректной работы registerUtil, хэлпер работат с контролом
    getInstanceId(): string {
        return this._instanceId;
    }

    protected _openHandler(): void {
        super._openHandler();
        if (this._actionOnScroll) {
            toggleActionOnScroll(this._target, true, (scrollEvent: Event) => {
                this._scrollHandler(scrollEvent);
            });
        }
    }

    protected _closeHandler(): void {
        super._closeHandler();
        if (this._actionOnScroll) {
            toggleActionOnScroll(this._target, false);
        }
    }

    protected _scrollHandler(scrollEvent: Event): void {
        StickyOpener._scrollHandler(scrollEvent, this._actionOnScroll, this._popupId);
    }

    private _updateState(options: IStickyPopupOptions): void {
        if (options.actionOnScroll) {
            this._actionOnScroll = options.actionOnScroll;
        }
        if (options.target) {
            this._target = options.target;
        }
    }
}
