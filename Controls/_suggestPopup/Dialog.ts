import {Control} from 'UI/Base';
import template = require('wml!Controls/_suggestPopup/Dialog');
import 'css!Controls/suggestPopup';
import 'css!Controls/suggest';
import 'Controls/popupTemplate';

      /**
       * Контрол-контейнер, который обеспечивает связь поля ввода и списка внутри выпадающего блока.
       *
       * @remark
       * Полезные ссылки:
       * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_suggestPopup.less переменные тем оформления}
       * @class Controls/_suggestPopup/Dialog
       * @extends Controls/Control
       * @author Герасимов А.М.
       *
       */

      /*
       * Dialog for list in Suggest component.
       * @class Controls/_suggestPopup/Dialog
       * @extends Controls/Control
       * @author Герасимов Александр
       *
       * @public
       */

const List = Control.extend({

         _template: template,
         _resizeTimeout: null,

         _beforeUnmount() {
            clearTimeout(this._resizeTimeout);
            this._resizeTimeout = null;
         },

         _itemClick(event, item) {
            this._notify('sendResult', [item], { bubbling: true });
            this._notify('close', [], { bubbling: true });
         }

      });
export = List;
