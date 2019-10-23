/**
 * Created by am.gerasimov on 18.04.2018.
 */

import Control = require('Core/Control');
import template = require('wml!Controls/_suggestPopup/Layer/__PopupLayer');
import getZIndex = require('Controls/Utils/getZIndex');
import {detection} from 'Env/Env';
import 'css!theme?Controls/suggest';

var POPUP_CLASS_NAME = 'controls-Suggest__suggestionsContainer_popup';

var _private = {
   openPopup: function(self, opener, options) {
       // !!closeOnOutsideClick не добавлять, иначе саггест закрывается при клике на саггест
      opener.open({
         target: options.target,
         opener: self,
         actionOnScroll: detection.isMobileIOS ? 'none' : 'close',
         zIndex: getZIndex(self), // _vdomOnOldPage для слоя совместимости, уйдёт с удалением опции.
         resizeCallback: self._resizeCallback
      });
   },

   getPopupClassName: function(verAlign) {
      return POPUP_CLASS_NAME + '_' + verAlign;
   },

   setPopupOptions: function(self) {
      self._popupOptions = {
         autofocus: false,
         className: _private.getPopupClassName('bottom'),
         direction: {
            vertical: 'bottom'
         },
         targetPoint: {
            vertical: 'bottom'
         },
         eventHandlers: {
            onResult: self._onResult
         }
      };
   }
};

var __PopupLayer = Control.extend({

   _template: template,

   _beforeMount: function() {
      this._onResult = this._onResult.bind(this);
      this._resizeCallback = this._resizeCallback.bind(this);
      _private.setPopupOptions(this);
   },

   _afterMount: function(options) {
      _private.openPopup(this, this._children.suggestPopup, options);
   },

   _afterUpdate: function(oldOptions) {
      if (this._options.searchValue !== oldOptions.searchValue ||
         this._options.filter !== oldOptions.filter ||
         this._options.showContent !== oldOptions.showContent ||
         this._options.showFooter !== oldOptions.showFooter ||
         this._options.misspellingCaption !== oldOptions.misspellingCaption) {
         _private.openPopup(this, this._children.suggestPopup, this._options);
      }
   },

   close: function() {
      this._children.suggestPopup.close();
   },

   _onResult: function(position) {
      //fix suggest position after show
      this._popupOptions.direction = {
         vertical: position.verticalAlign.side,
         horizontal: position.horizontalAlign.side
      };
      this._popupOptions.offset = {
         vertical: position.verticalAlign.offset,
         horizontal: position.horizontalAlign.offset
      };

      // position.corner fixed by https://online.sbis.ru/opendoc.html?guid=b7a05d49-4a68-423f-81d0-70374f875a22
      this._popupOptions.targetPoint = position.targetPoint;
      this._popupOptions.className = _private.getPopupClassName(position.verticalAlign.side);
      this._popupOptions.fittingMode = 'fixed';
   },

   _resizeCallback: function() {
      this._children.popupContent.resize();
   },
});

__PopupLayer._private = _private;

export default __PopupLayer;
