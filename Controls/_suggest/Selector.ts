import {Control} from 'UI/Base';
import template = require('wml!Controls/_suggest/Selector/Selector');
import Merge = require('Core/core-merge');
import {CrudWrapper} from 'Controls/dataSource';
import {Service, Source} from 'Controls/history';
import {object} from 'Types/util';
import {getOptionTypes} from 'Controls/_suggest/Utils';
import 'css!Controls/suggest';

const _private = {
   loadSelectedItem(self, options) {
      const filter = {};
      filter[options.keyProperty] = options.selectedKey;
      self._crudWrapper = new CrudWrapper({
         source: options.source
      });
      return self._crudWrapper.query({filter}).then((items) => {
         _private.setValue(self, items.at(0), options.displayProperty);
         return items.at(0);
      });
   },

   setValue(self, item, displayProperty) {
      const value = object.getPropertyValue(item, displayProperty);
      _private.updateValue(self, value);
   },

   updateValue(self, value) {
      self._value = value;
   },

   prepareSuggestTemplate(displayProperty, suggestTemplate) {
      const suggestTemplateConfig = { templateOptions: { displayProperty } };
      return Merge(suggestTemplateConfig, suggestTemplate);
   },

   createHistorySource(historyId, source) {
      return new Source({
         originSource: source,
         historySource: new Service({
            historyId
         })
      });
   }
};
/**
 * Поле ввода с выпадающим списком с возможностью автодополнения.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FSelector%2FSuggest%2FSuggest демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_suggest.less переменные тем оформления}
 *
 *
 * @class Controls/_suggest/Selector
 * @extends Controls/input:Text
 * @implements Controls/interface:ISearch
 * @implements Controls/interface:ISource
 * @implements Controls/interface:IFilterChanged
 * @mixes Controls/suggest:ISuggest
 * @implements Controls/interface:INavigation
 * @implements Controls/interface:ISingleSelectable
 *
 * @author Герасимов А.М.
 * @public
 */

/*
 * Combobox input that suggests options as you are typing.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FSelector%2FSuggest%2FSuggest">Demo-example</a>.
 *
 * @class Controls/_suggest/Selector
 * @extends Controls/input:Text
 * @implements Controls/interface:ISearch
 * @implements Controls/interface:ISource
 * @implements Controls/interface:IFilterChanged
 * @mixes Controls/suggest:ISuggest
 * @implements Controls/interface:INavigation
 *
 * @public
 */
const Suggest = Control.extend({

   _template: template,
   _suggestState: false,
   _searchValue: '',

   _beforeMount(options, context, receivedState) {
      this._suggestTemplate = _private.prepareSuggestTemplate(options.displayProperty, options.suggestTemplate);
      if (options.historyId) {
         this._historySource = _private.createHistorySource(options.historyId, options.source);
      }
      if (receivedState) {
         _private.setValue(this, receivedState, options.displayProperty);
      } else if (options.selectedKey) {
         return _private.loadSelectedItem(this, options);
      } else {
         _private.updateValue(this, '');
         this._searchValue = '';
      }
   },

   _changeValueHandler(event, value) {
      if (value !== this._value) {
         _private.updateValue(this, value);
         this._searchValue = value;
         this._notify('selectedKeyChanged', [null]);
         this._notify('valueChanged', [value]);
      }
   },

   _choose(event, item) {
      this.activate({enableScreenKeyboard: true});
      _private.updateValue(this, item.get(this._options.displayProperty) || '');
      if (this._options.historyId && item.get(this._options.keyProperty) !== undefined) {
         this._historySource.update(item, { $_history: true });
      }
      this._searchValue = '';
      this._notify('selectedKeyChanged', [item.get(this._options.keyProperty)]);
      this._notify('valueChanged', [this._value]);
   },

   _beforeUpdate(newOptions) {
      if (newOptions.source !== this._options.source && newOptions.historyId) {
         this._historySource = _private.createHistorySource(newOptions.historyId, newOptions.source);
      }
      if (this._options.suggestState !== newOptions.suggestState) {
         this._suggestState = newOptions.suggestState;
      }

      if (newOptions.suggestTemplate !== this._options.suggestTemplate) {
         this._suggestTemplate = _private.prepareSuggestTemplate(
             newOptions.displayProperty, newOptions.suggestTemplate
         );
      }

      if (newOptions.selectedKey !== undefined && (newOptions.selectedKey !== this._options.selectedKey ||
         newOptions.source !== this._options.source)) {
         return _private.loadSelectedItem(this, newOptions).addCallback((items) => {
            _private.updateValue(this, this._value);
            this._forceUpdate();
            return items;
         });
      }
   },

   _open() {
      if (!this._options.autoDropDown) {
         this._suggestState = !this._suggestState;
      } else if (this._suggestState) {
         this._suggestState = false;
      }
      this.activate();
   },

   _suggestStateChanged(event, value) {
      this._suggestState = value;
   },

   _deactivated() {
      this._suggestState = false;
   }

});

Suggest.getOptionTypes = getOptionTypes;
Suggest.getDefaultOptions = () => ({
    minSearchLength: 3,
    borderVisibility: 'partial',
    suggestState: false,
    suggestTemplate: {
        templateName: 'Controls/suggestPopup:SuggestTemplate'
    },
    footerTemplate: null
});

Object.defineProperty(Suggest, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Suggest.getDefaultOptions();
   }
});

Suggest._private = _private;

export default Suggest;

/**
 * @name Controls/_suggest/Selector#value
 * @cfg {* | null} Значение поля ввода.
 * @example
 * <pre class="brush: html; highlight: [3]">
 * <!-- WML -->
 * <Controls.suggest:Selector
 *    bind:value="_suggestDownValue"
 *    displayProperty="title"
 *    searchParam="title"
 *    autoDropDown="{{true}}"
 *    navigation="{{_navigation}}"
 *    source="{{_source}}">
 *    <ws:suggestTemplate templateName="wml!Controls-demo/Suggest_new/Selector/AutoDropDown/resources/SuggestTemplate">
 *       <ws:templateOptions demoClass="demo-SuggestInputList"/>
 *    </ws:suggestTemplate>
 * </Controls.suggest:Selector>
 * </pre>
 * @remark
 * Для контрола {@link Controls/suggest:Selector} значение опции value можно только прочитать.
 */
