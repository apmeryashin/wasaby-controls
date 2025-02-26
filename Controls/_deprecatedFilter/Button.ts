/**
 * Created by am.gerasimov on 21.02.2018.
 */
import {Control} from 'UI/Base';
import template = require('wml!Controls/_deprecatedFilter/Button/Button');
import chain = require('Types/chain');
import Utils = require('Types/util');
import Deferred = require('Core/Deferred');
import libHelper = require('Core/library');
import {isEqual} from 'Types/object';
import {FilterUtils} from 'Controls/filter';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {detection} from 'Env/Env';
import 'css!Controls/deprecatedFilter';

// tslint:disable

const _private = {
   getText(items) {
      const textArr = [];

      chain.factory(items).each(function(item) {
         if (_private.isItemChanged(item) && !Utils.object.getPropertyValue(item, 'isFast')
             && (Utils.object.getPropertyValue(item, 'visibility') === undefined || Utils.object.getPropertyValue(item, 'visibility'))) {
            const textValue = Utils.object.getPropertyValue(item, 'textValue');
            const resetTextValue = Utils.object.getPropertyValue(item, 'resetTextValue');

            if (textValue && textValue !== resetTextValue) {
               textArr.push(textValue);
            }
         }
      });

      return textArr.join(', ');
   },

   isItemsChanged(items) {
      let isChanged = false;

      chain.factory(items).each(function(item) {
         if (!isChanged) {
            isChanged = Utils.object.getPropertyValue(item, 'resetValue') !== undefined && _private.isItemChanged(item);
         }
      });

      return isChanged;
   },

   isItemChanged(item) {
      return !isEqual(Utils.object.getPropertyValue(item, 'value'), Utils.object.getPropertyValue(item, 'resetValue'));
   },

   resolveItems(self, items) {
      self._items = items;
      self._text = _private.getText(items);
      self._isItemsChanged = _private.isItemsChanged(items);
   },
   setPopupOptions(self, alignment, theme) {
      self._popupOptions = {
         closeOnOutsideClick: true,
         className: 'controls-FilterButton-popup-orientation-' + (alignment === 'right' ? 'left' : 'right') + ` controls_popupTemplate_theme-${theme} controls_filterPopup_theme-${theme}`
      };

      if (alignment === 'right') {
         self._popupOptions.targetPoint = {
            vertical: 'top',
            horizontal: 'right'
         };
         self._popupOptions.direction = {
            horizontal: 'left'
         };
      }
   },

   requireDeps(self) {
      if (!self._depsDeferred) {
         self._depsDeferred = new Deferred();
         if (typeof self._options.templateName === 'string') {
            libHelper.load(self._options.templateName).then((mod) => {
               self._depsDeferred.callback(mod);
            });
         } else {
            self._depsDeferred.callback();
         }
      }
      return self._depsDeferred;

   },

   resetItems(self, items) {
      let textValue;
      let resetValue;

      chain.factory(items).each(function(item) {
         // Fast filters could not be reset from the filter button.
         if (!Utils.object.getPropertyValue(item, 'isFast')) {
            textValue = Utils.object.getPropertyValue(item, 'textValue');
            resetValue = Utils.object.getPropertyValue(item, 'resetValue');

            if (resetValue !== undefined) {
               Utils.object.setPropertyValue(item, 'value', resetValue);
            }
            if (Utils.object.getPropertyValue(item, 'visibility') !== undefined) {
               Utils.object.setPropertyValue(item, 'visibility', false);
            }
            if (textValue !== undefined) {
               Utils.object.setPropertyValue(item, 'textValue', textValue === null ? textValue : '');
            }
         }
      });
   },
   getPopupConfig(self) {
      return {
         templateOptions: {
            template: self._options.templateName,
            items: self._options.items,
            historyId: self._options.historyId
         },
         fittingMode: {
            horizontal: 'overflow',
            vertical: 'adaptive'
         },
         template: 'Controls/filterPopup:_FilterPanelWrapper',
         target: self._children.panelTarget
      };
   }
};
/**
 * Контрол "Кнопка фильтров". Предоставляет возможность отображать и редактировать фильтр в удобном для пользователя виде. Состоит из кнопки-иконки и строкового представления выбранного фильтра.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_filter.less переменные тем оформления filter}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_filterPopup.less переменные тем оформления filterPopup}
 *
 * @class Controls/_filter/Button
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:IFilterButton
 * @demo Controls-demo/Filter/Button/PanelVDom
 * @deprecated Данный контрол устарел и будет удалён. Вместо него используйте {@link Controls/filter:View}.
 *
 * @public
 * @author Герасимов А.М.
 *
 */

/*
 * Control for data filtering. Consists of an icon-button and a string representation of the selected filter.
 * Clicking on a icon-button or a string opens the panel. {@link Controls/filterPopup:DetailPanel}
 * Supports the insertion of a custom template between the button and the filter string.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/filterbutton-and-fastfilters/'>here</a>.
 *
 * Information on filtering settings in the list using the "Filter Button" control you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * @class Controls/_filter/Button
 * @extends UI/Base:Control
 * @mixes Controls/filterPopup:IFilterButton
 * @demo Controls-demo/Filter/Button/PanelVDom
 * @public
 * @author Герасимов А.М.
 *
 */
const FilterButton = Control.extend(/** @lends Controls/_filter/Button.prototype */{

   _template: template,
   _oldPanelOpener: null,
   _text: '',
   _isItemsChanged: false,
   _historyId: null,
   _popupOptions: null,
   _depsDeferred: null,

   _beforeMount(options) {
      if (options.items) {
         _private.resolveItems(this, options.items);
      }
      _private.setPopupOptions(this, options.alignment, options.theme);
   },

   _beforeUnmount() {
      UnregisterUtil(this, 'scroll', {listenAll: true});
   },

   _beforeUpdate(options) {
      if (!isEqual(this._options.items, options.items)) {
         _private.resolveItems(this, options.items);
      }
      if (this._options.alignment !== options.alignment) {
         _private.setPopupOptions(this, options.alignment, options.theme);
      }
   },

   _getFilterState() {
      return this._options.readOnly ? 'disabled' : 'default';
   },

   reset() {
      FilterUtils.resetFilter(this._items);
      this._notify('filterChanged', [{}]);
      this._notify('itemsChanged', [this._items]);
      this._text = '';
   },

   _clearClick() {
      _private.resetItems(this, this._items);
      this._notify('filterChanged', [{}]);
      this._notify('itemsChanged', [this._items]);
      this._text = '';
   },

   openDetailPanel() {
      const self = this;
      if (!this._options.readOnly) {
         if (!detection.isMobileIOS) {
            RegisterUtil(this, 'scroll', this._handleScroll.bind(this), {listenAll: true});
         }
         _private.requireDeps(this).addCallback(function(res) {
            self._children.filterStickyOpener.open(_private.getPopupConfig(self));
            return res;
         });
      }
   },

   _handleScroll(): void {
      const opener = this._children.filterStickyOpener;
      if (opener.isOpened()) {
         opener.close();
      }
   },

   _onFilterChanged(event, data) {
      this._notify('filterChanged', [data.filter]);
      if (data.history) {
         this._notify('historyApply', [data.history,  {bubbling: true}]);
      }
      // The format of the items from the history is different from the items in filter button, so a flag is added to the event
      this._notify('itemsChanged', [data.items, !!data.history]);
   }
});

FilterButton.getDefaultOptions = function() {
   return {
      alignment: 'right'
   };
};

Object.defineProperty(FilterButton, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return FilterButton.getDefaultOptions();
   }
});

FilterButton._private = _private;
export = FilterButton;
