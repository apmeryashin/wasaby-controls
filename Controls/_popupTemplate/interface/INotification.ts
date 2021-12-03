import {IControlOptions} from 'UI/Base';

/**
 * Интерфейс для окна уведомления.
 *
 * @interface Controls/_popupTemplate/interface/INotification
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_popupTemplate/interface/INotification#style
 * @cfg {String} Устанавливает стиль отображения окна уведомления.
 * @default secondary
 * @variant warning
 * @variant secondary
 * @variant success
 * @variant danger
 * @default secondary
 */

/**
 * @name Controls/_popupTemplate/interface/INotification#closeButtonVisible
 * @cfg {Boolean} Устанавливает видимость кнопки, закрывающей окно.
 * @default true
 */

type TStyle = 'warning' | 'secondary' | 'success' | 'danger';

export interface INotificationBase {
    closeButtonVisible?: Boolean;
    style?: TStyle;
}

export interface INotificationOptions extends IControlOptions, INotificationBase {
    icon?: String;
    text?: String;
}

export interface INotification {
    readonly '[Controls/_popupTemplate/Notification/interface/INotification]': boolean;
}
