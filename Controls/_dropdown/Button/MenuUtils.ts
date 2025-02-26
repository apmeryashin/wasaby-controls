import {defaultHeight} from 'Controls/buttons';

function getIconSize(options) {
      const sizes = ['small', 'medium', 'large'];
      let iconSize;
      if (options.iconSize) {
         switch (options.iconSize) {
            case 's':
               iconSize = sizes[0];
               break;
            case 'm':
               iconSize = sizes[1];
               break;
            case 'l':
               iconSize = sizes[2];
               break;
         }
      } else {
         sizes.forEach((size) => {
            if (options.icon.indexOf('icon-' + size) !== -1) {
               iconSize = size;
            }
         });
      }
      return iconSize;
   }

function cssStyleGeneration(options) {
      // для каждого размера вызывающего элемента создаем класс, который выравнивает popup через margin.
      let offsetClassName = 'controls-MenuButton_' + options.viewMode;

      if (!options.icon || options.viewMode === 'toolButton' || options.viewMode === 'onlinePageHeader'
          || options.viewMode === 'functionalButton' || options.viewMode === 'linkButton') {
         const currentHeight = options.inlineHeight || defaultHeight(options.viewMode) || options.fontSize;
         offsetClassName += ('__' + currentHeight);

      } else if (options.icon) {
         // у кнопки типа 'Ссылка' высота вызывающего элемента зависит от размера иконки,
         // поэтому необходимо это учесть при сдвиге
         offsetClassName += '_iconSize-' + (getIconSize(options) || 'medium');
      }
      if ((options.viewMode === 'toolButton' || options.viewMode === 'functionalButton') && options.icon) {
         offsetClassName += '_iconSize-' + (getIconSize(options) || 'medium');
      }
      if (!options.headerTemplate && !options.showHeader && options.viewMode === 'link') {
         offsetClassName += '_duplicate';
      }
      offsetClassName += '_popup';
      return offsetClassName;
   }

export = {
      cssStyleGeneration
   };
