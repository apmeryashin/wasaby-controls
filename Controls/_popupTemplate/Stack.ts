import Control = require('Core/Control');
import template = require('wml!Controls/_popupTemplate/Stack/Stack');
import Env = require('Env/Env');
import 'css!theme?Controls/_popupTemplate/Stack/Stack';

      var MINIMIZED_STEP_FOR_MAXIMIZED_BUTTON = 100;

      var DialogTemplate = Control.extend({

         /**
          * Base template of stack panel. {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/#template-standart See more}.
          * @class Controls/Popup/Templates/Stack/StackTemplate
          * @extends Core/Control
          * @control
          * @public
          * @category Popup
          * @author Красильников А.С.
          * @mixes Controls/Popup/Templates/Stack/StackTemplateStyles
          * @demo Controls-demo/Popup/Templates/StackTemplatePG
          */

         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#headingCaption
          * @cfg {String} Header title.
          */

         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#headingStyle
          * @cfg {String} Caption display style.
          * @variant secondary
          * @variant primary
          * @variant info
          */

         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#headerContentTemplate
          * @cfg {function|String} The content between the header and the cross closure.
          */

         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#bodyContentTemplate
          * @cfg {function|String} Main content.
          */

         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#footerContentTemplate
          * @cfg {function|String} Content at the bottom of the stack panel.
          */

         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#closeButtonVisibility
          * @cfg {Boolean} Determines whether display of the close button.
          */


         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#maximizeButtonVisibility
          * @cfg {Boolean} Determines the display maximize button.
          */

         /**
          * @name Controls/Popup/Templates/Stack/StackTemplate#closeButtonViewMode
          * @cfg {String} Close button display style.
          * @variant default
          * @variant light
          * @variant primary
          */

         _template: template,
         _maximizeButtonVisibility: false,
         _beforeMount: function(options) {
            if (options.contentArea) {
               Env.IoC.resolve('ILogger').warn('StackTemplate', 'Используется устаревшая опция contentArea, используйте bodyContentTemplate');
            }
            if (options.caption) {
               Env.IoC.resolve('ILogger').warn('StackTemplate', 'Используется устаревшая опция caption, используйте headingCaption');
            }
            if (options.captionStyle) {
               Env.IoC.resolve('ILogger').warn('StackTemplate', 'Используется устаревшая опция captionStyle, используйте headingStyle');
            }
            if (options.showMaximizeButton) {
               Env.IoC.resolve('ILogger').warn('StackTemplate', 'Используется устаревшая опция showMaximizeButton, используйте maximizeButtonVisibility');
            }
            if (options.topArea) {
               Env.IoC.resolve('ILogger').warn('StackTemplate', 'Используется устаревшая опция topArea, используйте headerContentTemplate');
            }

            if (options.bottomArea) {
               Env.IoC.resolve('ILogger').warn('StackTemplate', 'Используется устаревшая опция bottomArea, используйте footerContentTemplate');
            }
            if (options.closeButtonStyle) {
               Env.IoC.resolve('ILogger').warn('StackTemplate', 'Используется устаревшая опция closeButtonStyle, используйте closeButtonViewMode');
            }
            this._updateMaximizeButton(options);
         },

         _beforeUpdate: function(newOptions) {
            this._updateMaximizeButton(newOptions);
         },

         _afterUpdate: function(oldOptions) {
            if (this._options.maximized !== oldOptions.maximized) {
               this._notify('controlResize', [], { bubbling: true });
            }
         },

         _updateMaximizeButton: function(options) {
            this._updateMaximizeButtonTitle(options);
            if (options.stackMaxWidth - options.stackMinWidth < MINIMIZED_STEP_FOR_MAXIMIZED_BUTTON) {
               this._maximizeButtonVisibility = false;
            } else {
               this._maximizeButtonVisibility = options.maximizeButtonVisibility;
            }
         },

         _updateMaximizeButtonTitle: function(options) {
            var maximized = this._calculateMaximized(options);
            this._maximizeButtonTitle = maximized ? rk('Свернуть') : rk('Развернуть');
         },

         /**
          * Закрыть всплывающее окно
          * @function Controls/Popup/Templates/Stack/StackTemplate#close
          */
         close: function() {
            this._notify('close', [], { bubbling: true });
         },
         changeMaximizedState: function() {
            /**
             * @event maximized
             * Occurs when you click the expand / collapse button of the panels.
             */
            var maximized = this._calculateMaximized(this._options);
            this._notify('maximized', [!maximized], { bubbling: true });
         },
         _calculateMaximized: function(options) {
            // TODO: https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
            if (!options.minimizedWidth) {
               var middle = (options.stackMinWidth + options.stackMaxWidth) / 2;
               return options.stackWidth - middle > 0;
            }
            return options.maximized;
         }
      });

      DialogTemplate.getDefaultOptions = function() {
         return {
            headingStyle: 'secondary',
            closeButtonVisibility: true
         };
      };

      export = DialogTemplate;


/**
 * @name Controls/Popup/Templates/Stack/StackTemplate#close
 * Close popup.
 */
