import toolbars = require('Controls/toolbars');
import {showType} from 'Controls/Utils/Toolbar';
import getWidthUtil = require('Controls/Utils/getWidth');


   var MENU_WIDTH = 0;

   var _private = {
      initializeConstants: function() {
         if (!MENU_WIDTH) {
            MENU_WIDTH = window && getWidthUtil.getWidth('<span class="controls-Toolbar__menuOpen"><i class="icon-medium icon-ExpandDown"/></span>');
         }
      },

      getItemMarkup: function(item, theme) {
         const templateProperty = item && item.get('itemTemplateProperty');
         const contentTemplate = templateProperty && item.get(templateProperty);
         return toolbars.ItemTemplate({
            item,
            size: 'm',
            itemsSpacing: 'medium',
            theme,
            contentTemplate
         });
      },

      getItemsSizes: function(items, visibleKeys, theme) {
         var
            measurer = document.createElement('div'),
            itemsSizes = [],
            itemsMark = '';

         visibleKeys.forEach(function(key) {
            itemsMark += _private.getItemMarkup(items.getRecordById(key), theme);
         });

         measurer.innerHTML = itemsMark;

         measurer.classList.add('controls-UtilsOperationsPanel__measurer');
         document.body.appendChild(measurer);
         [].forEach.call(measurer.getElementsByClassName('controls-Toolbar_item'), function(item) {
            var
               styles = window.getComputedStyle(item),
               padding = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
            itemsSizes.push(item.clientWidth + padding);
         });
         document.body.removeChild(measurer);

         return itemsSizes;
      }
   };

   export = {

      fillItemsType: function(keyProperty, parentProperty, items, availableWidth, theme) {
         var
            itemsSizes,
            currentWidth,
            visibleItemsKeys = [];

         items.each(function(item) {
            if (!item.get(parentProperty)) {
               visibleItemsKeys.push(item.get(keyProperty));
            }
         });
         itemsSizes = _private.getItemsSizes(items, visibleItemsKeys, theme);
         currentWidth = itemsSizes.reduce(function(acc, width) {
            return acc + width;
         }, 0);

         _private.initializeConstants();

         items.forEach(function(item) {
            item.set('showType', 0);
         });

         if (currentWidth > availableWidth) {
            currentWidth += MENU_WIDTH;
            for (var i = visibleItemsKeys.length - 1; i >= 0; i--) {
               items.getRecordById(visibleItemsKeys[i]).set('showType', currentWidth > availableWidth ? showType.MENU : showType.MENU_TOOLBAR);
               currentWidth -= itemsSizes[i];
            }
         } else {
            items.each(function(item) {
               item.set('showType', showType.TOOLBAR);
            });
         }
         return items;
      }
   };
