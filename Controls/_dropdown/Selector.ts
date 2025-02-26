import rk = require('i18n!Controls');
import {TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/Selector/Selector');
import defaultContentTemplate = require('wml!Controls/_dropdown/Selector/resources/defaultContentTemplate');
import * as Utils from 'Types/util';
import {factory} from 'Types/chain';
import {Model} from 'Types/entity';
import {RecordSet, List} from 'Types/collection';
import {prepareEmpty, loadItems, loadSelectedItems, isSingleSelectionItem} from 'Controls/_dropdown/Util';
import {isEqual} from 'Types/object';
import Controller from 'Controls/_dropdown/_Controller';
import {TKey} from './interface/IDropdownController';
import {BaseDropdown, IDropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IStickyPopupOptions, InfoboxTarget} from 'Controls/popup';
import {IBaseDropdownOptions} from 'Controls/_dropdown/interface/IBaseDropdown';
import getDropdownControllerOptions from 'Controls/_dropdown/Utils/GetDropdownControllerOptions';
import * as Merge from 'Core/core-merge';
import {isLeftMouseButton} from 'Controls/popup';
import 'css!Controls/dropdown';
import 'css!Controls/CommonClasses';
import {IValidationStatusOptions, TSelectedKeys} from 'Controls/interface';

interface IInputOptions extends IBaseDropdownOptions, IValidationStatusOptions {
   maxVisibleItems?: number;
   fontColorStyle?: string;
   fontSize?: string;
   showHeader?: boolean;
   selectedAllText?: string;
   selectedAllKey: TSelectedKeys;
}

const getPropValue = Utils.object.getPropertyValue.bind(Utils);

/**
 * Контрол, позволяющий выбрать значение из списка. Отображается в виде ссылки.
 * Текст ссылки отображает выбранные значения. Значения выбирают в выпадающем меню, которое по умолчанию закрыто.
 *
 * @remark
 * Меню можно открыть кликом на контрол. Для работы единичным параметром selectedKeys используйте контрол с {@link Controls/source:SelectedKey}.
 *
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2Fdropdown_new%2FInput%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/dropdown-menu/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_dropdown.less переменные тем оформления dropdown}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_dropdownPopup.less переменные тем оформления dropdownPopup}
 *
 * @extends UI/Base:Control
 * @mixes Controls/menu:IMenuPopup
 * @mixes Controls/menu:IMenuControl
 * @mixes Controls/menu:IMenuBase
 * @mixes Controls/dropdown:IBaseDropdown
 * @mixes Controls/dropdown:IGrouped
 * @implements Controls/interface:ISource
 * @implements Controls/interface:IMultiSelectable
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/interface:ISelectorDialog
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface:ITextValue
 * @implements Controls/interface:IFontSize
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:ISearch
 * @implements Controls/interface:IItems
 *
 * @public
 * @author Золотова Э.Е.
 * @demo Controls-demo/dropdown_new/Input/Source/Simple/Index
 */

/*
 * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
 * The full list of options is displayed when you click on the control.
 *
 * To work with single selectedKeys option you can use control with {@link Controls/source:SelectedKey}.
 * @extends UI/Base:Control
 * @implements Controls/interface:ISource
 * @implements Controls/interface:IHierarchy
 * @implements Controls/interface:IFilterChanged
 * @implements Controls/interface:INavigation
 * @mixes Controls/Input/interface/IValidation
 * @implements Controls/interface:IMultiSelectable
 * @mixes Controls/dropdown:IHeaderTemplate
 * @implements Controls/interface:ISelectorDialog
 * @mixes Controls/dropdown:IGrouped
 * @implements Controls/interface:ITextValue
 *
 * @public
 * @author Золотова Э.Е.
 * @demo Controls-demo/dropdown_new/Input/Source/Index
 */

export default class Selector extends BaseDropdown {
   protected _template: TemplateFunction = template;
   protected _defaultContentTemplate: TemplateFunction = defaultContentTemplate;
   protected _text: string = '';
   protected _hasMoreText: string = '';
   protected _countItems: number;
   protected _needInfobox: boolean = false;
   protected _item: Model = null;
   protected _isEmptyItem: boolean = false;
   protected _isAllSelectedItem: boolean = false;
   protected _icon: string;
   protected _tooltip: string;
   protected _selectedItems: Model[];
   protected _controller: Controller;
   protected _children: {
      infoboxTarget: InfoboxTarget;
   };

   _beforeMount(options: IInputOptions,
                context: object,
                receivedState: IDropdownReceivedState): void | Promise<void|IDropdownReceivedState> {
      this._controller = new Controller(this._getControllerOptions(options));

      if (options.navigation && options.selectedKeys &&  options.selectedKeys.length) {
         return loadSelectedItems(this._controller, receivedState, options.source);
      } else {
         return loadItems(this._controller, receivedState, options);
      }
   }

   _beforeUpdate(options: IInputOptions): void {
      this._controller.update(this._getControllerOptions(options));
      if (this._options.emptyText !== options.emptyText || this._options.selectedAllText !== options.selectedAllText) {
         this._setCountItems(this._controller.getItems(), options);
      }
   }

   _getControllerOptions(options: IInputOptions): object {
      const controllerOptions = getDropdownControllerOptions(options);
      return { ...controllerOptions, ...{
            markerVisibility: 'onactivated',
            dataLoadCallback: this._dataLoadCallback.bind(this),
            selectorOpener: this,
            selectedKeys: options.selectedKeys || [],
            popupClassName: options.popupClassName || (options.multiSelect ?
                    'controls-DropdownList_multiSelect__margin' :  'controls-DropdownList__margin'),
            allowPin: false,
            selectedItemsChangedCallback: this._prepareDisplayState.bind(this, options),
            openerControl: this
         }
      };
   }

   _getMenuPopupConfig(): IStickyPopupOptions {
      return {
         opener: this._children.infoboxTarget,
         templateOptions: {
            selectorDialogResult: this._selectorTemplateResult.bind(this)
         },
         eventHandlers: {
            onOpen: this._onOpen.bind(this),
            onClose: this._onClose.bind(this),
            onResult: this._onResult.bind(this)
         }
      };
   }

   _selectedItemsChangedHandler(items: Model[], newSelectedKeys: TKey[]): void|unknown {
      const text = this._getText(items, this._options) + this._getMoreText(items, this._options.maxVisibleItems);
      this._notify('textValueChanged', [text]);

      if (!isEqual(this._options.selectedKeys, newSelectedKeys) || this._options.task1178744737) {
         return this._notify('selectedKeysChanged', [newSelectedKeys]);
      }
   }

   _dataLoadCallback(items: RecordSet<Model>): void {
      this._setCountItems(items, this._options);

      if (this._options.dataLoadCallback) {
         this._options.dataLoadCallback(items);
      }
   }

   _prepareDisplayState(options: IInputOptions, items: Model[]): void {
      if (items.length) {
         this._selectedItems = items;
         this._needInfobox = options.readOnly && this._selectedItems.length > 1;
         this._isEmptyItem = isSingleSelectionItem(items[0], options.emptyText, options.keyProperty, options.emptyKey);
         this._isAllSelectedItem = isSingleSelectionItem(
             items[0], options.selectedAllText, options.keyProperty, options.selectedAllKey
         );
         this._item = this._isAllSelectedItem || this._isEmptyItem ? null : items[0];
         this._icon = this._isEmptyItem || this._isAllSelectedItem ? null : getPropValue(this._item, 'icon');
         this._text = this._getText(items, options);
         this._hasMoreText = this._getMoreText(items, options.maxVisibleItems);
         this._tooltip = this._getFullText(items, options.displayProperty,
             options.parentProperty, options.nodeProperty);
      }
   }

   _handleMouseDown(event: SyntheticEvent<MouseEvent>): void {
      if (!isLeftMouseButton(event) || this._options.readOnly) {
         return;
      }
      this.openMenu();
   }

   openMenu(popupOptions?: IStickyPopupOptions): void {
      const config = this._getMenuPopupConfig();
      this._controller.setMenuPopupTarget(this._container);

      this._controller.openMenu(Merge(config, popupOptions || {})).then((result) => {
         if (result) {
            const selectedKeys = this._getSelectedKeys(result, this._options.keyProperty);
            this._selectedItemsChangedHandler(result, selectedKeys);
         }
      });
   }

   protected _onResult(action: string, data: Model|Model[]): void {
      switch (action) {
         case 'applyClick':
            this._applyClick(data);
            break;
         case 'itemClick':
            this._itemClick(data);
            break;
         case 'selectorResult':
            this._selectorResult(data);
            break;
         case 'selectorDialogOpened':
            this._selectorDialogOpened(data);
            break;
         case 'footerClick':
            this._footerClick(data);
            break;
         case 'rightTemplateClick':
            this._rightTemplateClick(data);
      }
   }

   protected _itemClick(data: Model): void {
      const item = this._controller.getPreparedItem(data);
      const selectedKeys = this._getSelectedKeys([item], this._options.keyProperty);
      const res = this._selectedItemsChangedHandler([item], selectedKeys);

      // dropDown must close by default, but user can cancel closing, if returns false from event
      if (res !== false) {
         this._prepareDisplayState(this._options, [item]);
         this._controller.handleSelectedItems(item);
         this._controller.setSelectedKeys(selectedKeys);
      }
   }

   protected _applyClick(data: Model[]): void {
      this._updateSelectedItems(data);
      this._controller.handleSelectedItems(data);
   }

   protected _selectorResult(data): void {
      this._updateSelectedItems(factory(data).toArray());
      this._controller.handleSelectorResult(data);
   }

   protected _selectorTemplateResult(event: Event, selectedItems: List<Model>): void {
      const result = this._notify('selectorCallback', [this._initSelectorItems, selectedItems]) || selectedItems;
      this._selectorResult(result);
   }

   private _setCountItems(items: RecordSet, options: IInputOptions): void {
      this._countItems = items.getCount();
      if (options.emptyText) {
         this._countItems += 1;
      }
      if (options.selectedAllText) {
         this._countItems += 1;
      }
   }

   private _updateSelectedItems(items: Model[]): void {
      const selectedKeys = this._getSelectedKeys(items, this._options.keyProperty);
      this._selectedItemsChangedHandler(items, selectedKeys);
      this._controller.setSelectedKeys(selectedKeys);
      this._prepareDisplayState(this._options, items);
   }

   private _getSelectedKeys(items: Model[], keyProperty: string): TKey[] {
      const keys = [];
      if (isSingleSelectionItem(
          items[0], this._options.selectedAllText, this._options.keyProperty, this._options.selectedAllKey
      )) {
         keys.push(this._options.selectedAllKey);
      } else if (isSingleSelectionItem(
          items[0], this._options.emptyText, this._options.keyProperty, this._options.emptyKey
      )) {
         keys.push(this._options.emptyKey);
      } else {
         factory(items).each((item) => {
            keys.push(getPropValue(item, keyProperty));
         });
      }
      return keys;
   }

   private _getFullText(items: Model[],
                        displayProperty: string,
                        parentProperty: string,
                        nodeProperty: string,
                        maxVisibleItems?: number): string {
      const texts = [];
      factory(items).each((item) => {
         let text = '';
         if (!maxVisibleItems || texts.length < maxVisibleItems) {
            if (parentProperty) {
               const parentKey = getPropValue(item, parentProperty);
               const parent = parentKey && this._controller.getItems().getRecordById(parentKey);
               if (getPropValue(parent, nodeProperty) === false) {
                  text += `${getPropValue(parent, displayProperty)} `;
               }
            }
            text += getPropValue(item, displayProperty) ?? '';
            texts.push(text);
         }
      });
      return texts.join(', ');
   }

   private _getText(items: Model[],
                    {selectedAllText,
                     selectedAllKey,
                     emptyText,
                     emptyKey,
                     parentProperty,
                     nodeProperty,
                     keyProperty,
                     displayProperty,
                     maxVisibleItems}: Partial<IInputOptions>): string {
      const item = items[0];
      let text = '';
      if (isSingleSelectionItem(item, selectedAllText, keyProperty, selectedAllKey)) {
         text = selectedAllText;
      } else if (isSingleSelectionItem(item, emptyText, keyProperty, emptyKey)) {
         text = prepareEmpty(emptyText);
      } else {
         text = this._getFullText(items, displayProperty, parentProperty, nodeProperty, maxVisibleItems);
      }
      return text;
   }

   private _getMoreText(items: Model[], maxVisibleItems): string {
      let moreText = '';
      if (maxVisibleItems) {
         if (items.length > maxVisibleItems) {
            moreText = ', ' + rk('еще') + ' ' + (items.length - maxVisibleItems);
         }
      }
      return moreText;
   }

   protected _deactivated(): void {
      if (this._options.closeMenuOnOutsideClick) {
         this.closeMenu();
      }
   }

   static getDefaultOptions(): Partial<IInputOptions> {
      return {
         iconSize: 's',
         maxVisibleItems: 1,
         validationStatus: 'valid',
         closeMenuOnOutsideClick: true,
         emptyKey: null,
         selectedAllKey: null
      };
   }
}
/**
 * @name Controls/_dropdown/Selector#maxVisibleItems
 * @cfg {Number} Максимальное количество выбранных записей, которые будут отображены.
 * @default 1
 * @demo Controls-demo/dropdown_new/Input/MaxVisibleItems/Index
 * @example
 * Отображение всех выбранных записей.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *    bind:selectedKeys="_selectedKeys"
 *    keyProperty="key"
 *    displayProperty="title"
 *    source="{{_source}}"
 *    multiSelect="{{true}}"
 *    maxVisibleItems="{{null}}">
 * </Controls.dropdown:Selector>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * this._source = new Memory({
 *    keyProperty: 'key',
 *    data: [
 *        {key: 1, title: 'Ярославль'},
 *        {key: 2, title: 'Москва'},
 *        {key: 3, title: 'Санкт-Петербург'},
 *        {key: 4, title: 'Новосибирск'},
 *        {key: 5, title: 'Нижний новгород'},
 *        {key: 6, title: 'Кострома'},
 *        {key: 7, title: 'Рыбинск'}
 *    ]
 * });
 * </pre>
 */

/**
 * @name Controls/_dropdown/Selector#contentTemplate
 * @cfg {Function} Шаблон отображения вызывающего элемента.
 * @remark
 * Для определения шаблона вызовите базовый шаблон - "Controls/dropdown:inputDefaultContentTemplate".
 * Шаблон должен быть помещен в контрол с помощью тега <ws:partial> с атрибутом "template".
 * Содержимое можно переопределить с помощью параметра "contentTemplate".
 * Базовый шаблон Controls/dropdown:inputDefaultContentTemplate по умолчанию отображает только текст.
 * Для отображения иконки и текста используйте шаблон "Controls/dropdown:defaultContentTemplateWithIcon".
 * @demo Controls-demo/dropdown_new/Input/ContentTemplate/Index
 * @example
 * Отображение иконки и текста.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *    bind:selectedKeys="_selectedKeys"
 *    keyProperty="id"
 *    displayProperty="title"
 *    source="{{_source}}"
 *    contentTemplate="Controls/dropdown:defaultContentTemplateWithIcon">
 * </Controls.dropdown:Selector>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Name', icon: 'icon-small icon-TrendUp'},
 *       {id: 2, title: 'Date of change', icon: 'icon-small icon-TrendDown'}
 *    ]
 * });
 * </pre>
 */

/*
 * @name Controls/_dropdown/Input#contentTemplate
 * @cfg {Function} Template that will be render calling element.
 * @remark
 * To determine the template, you should call the base template "Controls/dropdown:inputDefaultContentTemplate".
 * The template should be placed in the component using the <ws:partial> tag with the template attribute.
 * You can redefine content using the contentTemplate option.
 * By default, the base template Controls/dropdown:inputDefaultContentTemplate will display only text.
 * To display the icon and text, use the "Controls/dropdown:defaultContentTemplateWithIcon" template.
 * @example
 * Display text and icon
 * Отображение иконки и текста.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *    bind:selectedKeys="_selectedKeys"
 *    keyProperty="id"
 *    displayProperty="title"
 *    source="{{_source}}"
 *    contentTemplate="Controls/dropdown:defaultContentTemplateWithIcon">
 * </Controls.dropdown:Selector>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Name', icon: 'icon-small icon-TrendUp'},
 *       {id: 2, title: 'Date of change', icon: 'icon-small icon-TrendDown'}
 *    ]
 * });
 * </pre>
 */

/**
 * @name Controls/_dropdown/Selector#multiSelect
 * @cfg {Boolean} Определяет, установлен ли множественный выбор.
 * @default false
 * @demo Controls-demo/dropdown_new/Input/MultiSelect/Simple/Index
 * @demo Controls-demo/dropdown_new/Input/MultiSelect/PinnedItems/Index
 * @example
 * Множественный выбор установлен.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *    bind:selectedKeys="_selectedKeys"
 *    keyProperty="id"
 *    displayProperty="title"
 *    source="{{_source}}"
 *    multiSelect="{{true}}" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl'},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._selectedKeys = [1, 3];
 * </pre>
 */

/**
 * @name Controls/_propertyGrid/IPropertyGrid#multiSelectAccessibilityProperty
 * @cfg {Controls/display:MultiSelectAccessibility} Имя поля записи, в котором хранится состояние видимости чекбокса.
 * @demo Controls-demo/dropdown_new/Input/MultiSelect/MultiSelectAccessibilityProperty/Index
 * @example
 * Множественный выбор установлен.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *    bind:selectedKeys="_selectedKeys"
 *    keyProperty="id"
 *    displayProperty="title"
 *    source="{{_source}}"
 *    multiSelectAccessibilityProperty="checkBoxState"
 *    multiSelect="{{true}}" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * import {MultiSelectAccessibility} from 'Controls/dropdown';
 *
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl', checkBoxState: MultiSelectAccessibility.disabled},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._selectedKeys = [1, 3];
 * </pre>
 */

/**
 * @name Controls/_dropdown/Selector#selectedAllText
 * @cfg {String} Добавляет пустой элемент в список с заданным текстом.
 * Ключ элемента по умолчанию null, для изменения значения ключа используйте {@link selectedAllKey}.
 * @demo Controls-demo/dropdown_new/Input/SelectedAllText/Simple/Index
 */

/**
 * @name Controls/_dropdown/Selector#selectedAllKey
 * @cfg {String} Первичный ключ для пункта выпадающего списка, который создаётся при установке опции {@link selectedAllText}.
 * @default null
 * @demo Controls-demo/dropdown_new/Input/SelectedAllText/SelectedAllKey/Index
 */

/*
 * @name Controls/_dropdown/Input#multiSelect
 * @cfg {Boolean} Determines whether multiple selection is set.
 * @default false
 * @example
 * Multiple selection is set.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *    bind:selectedKeys="_selectedKeys"
 *    keyProperty="id"
 *    displayProperty="title"
 *    source="{{_source}}"
 *    multiSelect="{{true}}" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * this._source = new Memory({
 *    keyProperty: 'id',
 *    data: [
 *       {id: 1, title: 'Yaroslavl'},
 *       {id: 2, title: 'Moscow'},
 *       {id: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * this._selectedKeys = [1, 3];
 * </pre>
 */

/**
 * @event Происходит при изменении выбранных элементов.
 * @name Controls/_dropdown/Selector#selectedKeysChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} keys Набор ключей выбранных элементов.
 * @remark Из обработчика события можно возвращать результат обработки. Если результат будет равен false, выпадающий список не закроется.
 * По умолчанию, когда выбран пункт с иерархией, выпадающий список закрывается.
 * @example
 * В следующем примере создается список и устанавливается опция selectedKeys со значением [1, 2, 3], а также показано, как изменить сообщение, выведенное пользователю на основе выбора.
 * <pre class="brush: html; highlight: [3,4]">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *     on:selectedKeysChanged="onSelectedKeysChanged()"
 *     selectedKeys="{{ _selectedKeys }}"/>
 *    <h1>{{ _message }}</h1>
 * </pre>
 * <pre class="brush: js;">
 * // JavaScript
 * _beforeMount: function() {
 *    this._selectedKeys = [1, 2, 3];
 * },
 * onSelectedKeysChanged: function(e, keys) {
 *    this._selectedKeys = keys; //We don't use binding in this example so we have to update state manually.
 *    if (keys.length > 0) {
 *       this._message = 'Selected ' + keys.length + ' items.';
 *    } else {
 *       this._message = 'You have not selected any items.';
 *    }
 * }
 * </pre>
 */

/**
 * @name Controls/_dropdown/Selector#fontSize
 * @cfg
 * @demo Controls-demo/dropdown_new/Input/FontSize/Index
 */

/**
 * @name Controls/_dropdown/Selector#source
 * @cfg {Controls/_dropdown/interface/IBaseDropdown/SourceCfg.typedef}
 * @default undefined
 * @remark
 * Запись может иметь следующие {@link Controls/_dropdown/interface/IBaseDropdown/Item.typedef свойства}.
 * @demo Controls-demo/dropdown_new/Input/Source/Simple/Index
 * @example
 * Записи будут отображены из источника _source.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector
 *    keyProperty="key"
 *    source="{{_source}}"
 *    viewMode="link"
 *    iconSize="m" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _source: new source.Memory({
 *    keyProperty: 'key',
 *    data: [
 *       {key: '1', icon: 'icon-EmptyMessage', iconStyle: 'info', title: 'Message'},
 *       {key: '2', icon: 'icon-TFTask', title: 'Task'},
 *       {key: '3', title: 'Report'},
 *       {key: '4', title: 'News', readOnly: true}
 *    ]
 * })
 * </pre>
 */

Object.defineProperty(Selector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Selector.getDefaultOptions();
   }
});
