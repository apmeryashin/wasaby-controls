import {Notification} from 'Controls/popupTemplate';
import template = require('wml!Controls/_compatiblePopup/Notification/Base');
import {TemplateFunction} from 'UI/Base';
import 'css!Controls/popupTemplate';

class NotificationBase extends Notification {
    protected _template: TemplateFunction = template;

   protected _beforeMount(options): void {
      this._contentTemplateOptions = options.contentTemplateOptions;

      /**
       * После показа размеры контента изменяться, нужно сказать об этом потомкам.
       */
      this._contentTemplateOptions.handlers = {
         onAfterShow: (): void => {
             this._notify('controlResize', [], {bubbling: true});
         }
      };

      return  super._beforeMount(options);
   }
}

export default NotificationBase;
