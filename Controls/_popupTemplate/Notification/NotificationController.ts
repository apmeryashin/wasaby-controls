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

    elementCreated(item: INotificationItem, container: HTMLDivElement): boolean {
        const initItemConfig = () => {
            item.height = container.offsetHeight;
            item.width = container.offsetWidth;
            this._setNotificationContent(item);
            this._stack.add(item, 0);
            this._calculateDirection(container);
            this._updatePositions();
        };
        // При создании первого попапа запишем коордианты из истории, чтобы дальше работать со значениями синхронно
        if (!this._historyCoords) {
            this._getPopupCoords().then((config: object) => {
                this._historyCoords = config;
                for (const coord in this._historyCoords) {
                    if (!this._historyCoords[coord]) {
                        this._historyCoords[coord] = 0;
                    }
                }
                initItemConfig();
            });
        } else {
            initItemConfig();
        }
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

    getDefaultConfig(item: INotificationItem): void {
        super.getDefaultConfig.apply(this, arguments);
        this._setNotificationContent(item);
    }

    popupDragEnd(item: INotificationItem, offset: number): void {
        this._savePopupCoords(item);
        delete item.startPosition;
    }

    popupDragStart(item: INotificationItem,
                   container: HTMLElement,
                   offset: IDragOffset): void {
        // Нужно учитывать разницу в высоте между первым элементом и итемом
        let offsetBottom = 0;
        // В списке each нельзя остановить, не будем считать высоту после того, как найдем элемент
        let elementFounded = false;
        // Окна могут быть разной ширины, чтобы окна побольше не выходили за экран, будем делать расчеты по самой
        // большой ширине
        let maxWidth = 0;
        this._stack.each((listItem: INotificationItem) => {
            if (listItem.width > maxWidth ) {
                maxWidth = listItem.width;
            }
            if (!elementFounded) {
                if (listItem.id === item.id) {
                    elementFounded = true;
                    return;
                }
                if (this._direction === 'up') {
                    offsetBottom += listItem.height;
                } else {
                    offsetBottom -= listItem.height;
                }
            }
        });

        const horizontalOffset = -offset.x;
        const verticalOffset = -offset.y;
        if (!item.startPosition) {
            item.startPosition = {
                right: item.position.right,
                bottom: item.position.bottom
            };
        }

        let bottomPosition = item.startPosition.bottom + verticalOffset;
        let rightPosition = item.startPosition.right + horizontalOffset;

        const windowDimensions = DimensionsMeasurer.getWindowDimensions(container);
        if (rightPosition < 0) {
            rightPosition = 0;
        } else if (rightPosition + maxWidth > windowDimensions.innerWidth) {
            rightPosition = windowDimensions.innerWidth - maxWidth;
        }
        if (bottomPosition - offsetBottom < 0) {
            bottomPosition = offsetBottom;
        } else if (bottomPosition + item.height - offsetBottom > windowDimensions.innerHeight ) {
            bottomPosition = windowDimensions.innerHeight + offsetBottom - item.height;
        }
        this._historyCoords = {
            bottom: bottomPosition - offsetBottom,
            right: rightPosition
        };
        this._updatePositions();
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
            let bottom: number = this._historyCoords.bottom || 0;
            const right: number = this._historyCoords.right || 0;

            /**
             * In item.height is the height of the popup.
             * It takes into account the indentation between the notification popups,
             * specified in the template via css. This is done to support theming.
             */
            this._stack.each((item: INotificationItem) => {
                item.position = NotificationStrategy.getPosition(right, bottom);
                if (this._direction === 'up') {
                    bottom += item.height;
                } else {
                    bottom -= item.height;
                }
            });
        }
    }

    private _setNotificationContent(item: INotificationItem): void {
        item.popupOptions.content = NotificationContent;
    }
}
export default new NotificationController();
