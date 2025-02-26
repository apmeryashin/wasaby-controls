import {default as BaseController} from 'Controls/_popupTemplate/BaseController';
import {IDragOffset, IPopupItem, IPopupOptions, IPopupPosition} from 'Controls/popup';
import * as Deferred from 'Core/Deferred';
import {List} from 'Types/collection';
import NotificationContent from 'Controls/_popupTemplate/Notification/Template/NotificationContent';
import NotificationStrategy from 'Controls/_popupTemplate/Notification/NotificationStrategy';
import {setSettings, getSettings} from 'Controls/Application/SettingsController';
import {DimensionsMeasurer} from 'Controls/sizeUtils';

interface INotificationItem extends IPopupItem {
    height: number;
    width: number;
    closeId: number;
    popupOptions: INotificationOptions;
    startPosition: IPopupPosition;
    container: HTMLElement;
}

interface INotificationOptions extends IPopupOptions {
    autoClose: boolean;
    maximize: boolean;
}

/**
 * Notification Popup Controller
 * @class Controls/_popupTemplate/Notification/Opener/NotificationController
 *
 * @private
 * @extends Controls/_popupTemplate/BaseController
 */
class NotificationController extends BaseController {
    TYPE: string = 'Notification';
    _stack: List<INotificationItem> = new List();
    private _historyCoords: {
        bottom: number;
        right: number;
    };
    private _direction: string = 'up';
    private _startPosition: {
        bottom: number;
        right: number;
    };

    elementCreated(item: INotificationItem, container: HTMLDivElement): boolean {
        item.height = container.offsetHeight;
        item.width = container.offsetWidth;
        item.container = container;
        this._setNotificationContent(item);
        this._stack.add(item, 0);
        this._calculateDirection(container);
        this._updatePositions();
        return true;
    }

    elementUpdated(item: INotificationItem, container: HTMLDivElement): boolean {
        this._setNotificationContent(item);
        item.height = container.offsetHeight;
        this._updatePositions();
        return true;
    }

    elementDestroyed(item: INotificationItem): Promise<null> {
        this._stack.remove(item);
        this._updatePositions();

        super.elementDestroyed.call(item);
        return new Deferred().callback();
    }

    getDefaultConfig(item: INotificationItem): void | Promise<void> {
        super.getDefaultConfig.apply(this, arguments);
        this._setNotificationContent(item);
        if (!this._historyCoords) {
            return this._getPopupCoords().then((config: object) => {
                this._historyCoords = {
                    right: config.right || 0,
                    bottom: config.bottom || 0
                };
            });
        }
    }

    popupDragEnd(item: INotificationItem, offset: number): void {
        this._savePopupCoords(item);
        this._startPosition = null;
    }

    popupDragStart(item: INotificationItem,
                   container: HTMLElement,
                   offset: IDragOffset): void {
        if (!this._startPosition) {
            this._startPosition = {
                right: this._historyCoords.right,
                bottom: this._historyCoords.bottom
            };
        }

        const horizontalOffset = -offset.x;
        const verticalOffset = -offset.y;

        const bottomPosition = this._startPosition.bottom + verticalOffset;
        const rightPosition = this._startPosition.right + horizontalOffset;

        this._historyCoords = {
            bottom: bottomPosition,
            right: rightPosition
        };
        this._updatePositions();
    }

    private _validatePosition(): void {
        // Окна могут быть разной ширины, чтобы окна побольше не выходили за экран, будем делать расчеты по самой
        // большой ширине
        let newBottomPosition = Math.max(this._historyCoords.bottom, 0);
        let newRightPosition = Math.max(this._historyCoords.right, 0);

        let maxWidth = 0;
        this._stack.each((listItem: INotificationItem) => {
            if (listItem.width > maxWidth ) {
                maxWidth = listItem.width;
            }
        });

        const container = this._stack.at(0).container;
        const windowDimensions = DimensionsMeasurer.getWindowDimensions(container);
        newRightPosition = Math.min(newRightPosition, windowDimensions.innerWidth - maxWidth);
        newBottomPosition = Math.min(newBottomPosition, windowDimensions.innerHeight - this._stack.at(0).height);

        this._historyCoords = {
            bottom: newBottomPosition,
            right: newRightPosition
        };
    }

    private _calculateDirection(container: HTMLElement): void {
        // Будем менять направление создания попапов только после открытия первого окна
        if (this._stack.getCount() === 1) {
            const windowDimensions = DimensionsMeasurer.getWindowDimensions(container);
            const windowHeight = windowDimensions.innerHeight;
            // Опеределяет, в какую сторорону по вертикале будут строится окна
            this._direction = windowHeight / 2 > this._historyCoords.bottom ? 'up' : 'down';
        }
    }

    private _savePopupCoords(item: INotificationItem): void {
        setSettings({notificationPopupCoords: {
                right: item.position.right,
                bottom: item.position.bottom
            }});
        this._updatePositions();
    }

    private _getPopupCoords(
    ): Promise<Object> {
        return new Promise((resolve) => {
            getSettings(['notificationPopupCoords']).then((storage: object) => {
                if (storage && storage.notificationPopupCoords) {
                    const bottom = storage.notificationPopupCoords.bottom;
                    const right = storage.notificationPopupCoords.right;
                    resolve({
                        bottom,
                        right
                    });
                } else {
                    resolve({
                        bottom: 0,
                        right: 0
                    });
                }
            });
        });
    }

    private _updatePositions(): void {
        if (this._stack.getCount()) {
            this._validatePosition();
            let bottom: number = this._historyCoords.bottom ;
            const right: number = this._historyCoords.right;

            /**
             * In item.height is the height of the popup.
             * It takes into account the indentation between the notification popups,
             * specified in the template via css. This is done to support theming.
             */
            this._stack.each((item: INotificationItem) => {
                item.position = NotificationStrategy.getPosition(right, bottom);
                bottom += this._direction === 'up' ? item.height : -item.height;
            });
        }
    }

    private _setNotificationContent(item: INotificationItem): void {
        item.popupOptions.content = NotificationContent;
    }
}
export default new NotificationController();
