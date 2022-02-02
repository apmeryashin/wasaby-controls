import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Notification/Template/Simple/Simple';
import {INotificationBase} from 'Controls/_popupTemplate/interface/INotification';
import 'css!Controls/popupTemplate';
import 'css!Controls/CommonClasses';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';

/**
 * Базовый шаблон {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/ простого окна уведомления}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @class Controls/_popupTemplate/Notification/Simple
 * @extends UI/Base:Control
 * @mixes Controls/popupTemplate:INotification
 *
 * @public
 * @demo Controls-demo/PopupTemplate/Notification/Index
 * @author Красильников А.С.
 */

interface INotificationSimpleOptions extends INotificationBase, IControlOptions {}

class NotificationSimple extends Control<INotificationSimpleOptions> {
    protected _template: TemplateFunction = template;
    protected _iconStyle: String;

    protected _beforeMount(options: INotificationSimpleOptions): void {
        this._iconStyle = NotificationSimple._prepareIconStyle(options);
        if (options.style !== undefined) {
            Logger.warn(`${this._moduleName}: Используется устаревшая опция style,` +
                                                                               ' нужно использовать borderStyle', this);
        }
    }

    protected _beforeUpdate(options: INotificationSimpleOptions): void {
        this._iconStyle = NotificationSimple._prepareIconStyle(options);
    }

    protected _mousedownHandler(e: SyntheticEvent<MouseEvent>): void {
        // Помечаю событиие обработанным, чтобы попап не обрабатывал начало драга
        e.nativeEvent.processed = true;
    }

    private static _prepareIconStyle(popupOptions: INotificationSimpleOptions): String {
        switch (popupOptions.style || popupOptions.borderStyle) {
            case 'warning':
                return 'warning';
            case 'success' :
                return 'success';
            case 'danger':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    static getDefaultOptions(): INotificationSimpleOptions {
        return {
            borderStyle: 'secondary',
            closeButtonVisible: true
        };
    }
}

Object.defineProperty(NotificationSimple, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return NotificationSimple.getDefaultOptions();
   }
});

/**
 * @name Controls/_popupTemplate/Notification/Simple#icon
 * @cfg {String} Устанавливает значок сообщения окна уведомления.
 */

/**
 * @name Controls/_popupTemplate/Notification/Simple#text
 * @cfg {String} Устанавливает текст уведомления.
 */

/**
 * @name Controls/_popupTemplate/Notification/Simple#borderStyle
 * @cfg {String} Устанавливает стиль отображения окна уведомления.
 * @remark Данная опция так же устанавливает стиль отображения иконки нотификационного окна.
 */
export default NotificationSimple;
