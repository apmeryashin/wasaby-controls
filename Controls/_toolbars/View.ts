import {ICrudPlus, PrefetchProxy, Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {factory, RecordSet} from 'Types/collection';
import {descriptor, Record} from 'Types/entity';

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {StickyOpener, IStickyPopupOptions} from 'Controls/popup';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {showType} from './interfaces/IShowType';
import 'css!Controls/toolbars';
import 'css!Controls/buttons';
import 'css!Controls/CommonClasses';

import {
    getButtonTemplate,
    getMenuItems,
    needShowMenu,
    hasSourceChanged,
    getTemplateByItem,
    loadItems,
    getSimpleButtonTemplateOptionsByItem
} from 'Controls/_toolbars/Util';

import {
    IHierarchy,
    IHierarchyOptions,
    IIconSize,
    IIconSizeOptions,
    IItemTemplate,
    IItemTemplateOptions,
    IItems,
    IItemsOptions,
    IFontColorStyle,
    IFontColorStyleOptions,
    IIconStyle,
    IIconStyleOptions,
    IFilter,
    IFilterOptions, IHeightOptions
} from 'Controls/interface';
import {IItemAction, TItemActionVisibilityCallback} from 'Controls/itemActions';

import {IToolbarSourceOptions, default as IToolbarSource} from 'Controls/_toolbars/IToolbarSource';
import {IButtonOptions, IViewMode} from 'Controls/buttons';
import {IGrouped, IGroupedOptions} from 'Controls/dropdown';
import * as template from 'wml!Controls/_toolbars/View';
import * as defaultItemTemplate from 'wml!Controls/_toolbars/ItemTemplate';
import {DependencyTimer, isLeftMouseButton} from 'Controls/popup';
import {IoC} from 'Env/Env';

type TItem = Record;
type TItems = RecordSet<TItem>;
type TypeItem = 'toolButton' | 'icon' | 'link' | 'list';
export type TItemsSpacing = 'medium' | 'big';

export interface IToolbarOptions extends IControlOptions, IHierarchyOptions, IIconSizeOptions,
    IItemTemplateOptions, IGroupedOptions, IToolbarSourceOptions, IItemsOptions<TItem>, IFontColorStyleOptions,
    IIconStyleOptions, IFilterOptions, IHeightOptions {
    /**
     * @name Controls/toolbars:IToolbar#popupClassName
     * @cfg {String} Имя класса, которое будет добавлено к атрибуту class на корневой ноде выпадающего меню.
     * @default ''
     */
    popupClassName: string;
    /**
     * @name Controls/toolbars:IToolbar#itemsSpacing
     * @cfg {String} Размер расстояния между кнопками.
     * @variant medium
     * @variant big
     * @default medium
     */
    itemsSpacing: TItemsSpacing;
     /**
      * @name Controls/toolbars:IToolbar#direction
      * @cfg {String} Расположение элементов в тулбаре.
      * @variant vertical
      * @variant horizontal
      * @demo Controls-demo/Toolbar/Direction/Index
      */
     direction: 'vertical' | 'horizontal';
    /**
     * @name Controls/toolbars:IToolbar#additionalProperty
     * @cfg {String} Имя свойства, содержащего информацию о дополнительном пункте выпадающего меню. Подробное описание <a href="/doc/platform/developmentapl/interface-development/controls/input-elements/dropdown-menu/item-config/#additional">здесь</a>.
     */
    additionalProperty?: string;
    /**
     * @name Controls/toolbars:IToolbar#popupFooterTemplate
     * @cfg {String|TemplateFunction} Шаблон футера дополнительного меню тулбара.
     * @demo Controls-demo/Toolbar/PopupFooterTemplate/Index
     */
    popupFooterTemplate?: String | Function;
    /**
     * @name Controls/toolbars:IToolbar#itemActions
     * @cfg {Array<Controls/itemActions:IItemAction>} Конфигурация опций записи.
     * @demo Controls-demo/Toolbar/ItemActions/Index
     */
    itemActions?: IItemAction[];
    /**
     * @name Controls/toolbars:IToolbar#itemActionVisibilityCallback
     * @cfg {function} Функция управления видимостью опций записи.
     * @remark
     * Аргументы функции:
     *
     * * action (тип {@link Controls/itemActions:IItemAction}) — объект с настройкой действия.
     * * item (тип {@link Types/entity:Model}) — экземпляр записи, действие над которой обрабатывается.
     *
     * Если из функции возвращается true, то операция отображается.
     * @demo Controls-demo/Toolbar/ItemActions/Index
     */
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    /**
     * @name Controls/toolbars:IToolbar#menuSource
     * @cfg {Types/source:ICrudPlus} Объект, реализующий интерфейс {@link Types/source:ICrud},
     * необходимый для работы с источником данных выпадающего меню тулбара.
     * Данные будут загружены отложенно, при взаимодействии с меню.
     * @see source
     * @see items
     */
    menuSource?: ICrudPlus;
    /**
     * @name Controls/toolbars:IToolbar#contrastBackground
     * @cfg {Boolean} Определяет наличие подложки у кнопки открытия выпадающего меню тулбара.
     */
    contrastBackground?: true;
     /**
      * @name Controls/toolbars:IToolbar#translucent
      * @cfg {boolean} Режим полупрозрачного отображения кнопки открытия выпадающего меню тулбара
      * @default false
      * @demo Controls-demo/Toolbar/Translucent/Index
      */
     translucent?: boolean;
     /**
      * @name Controls/toolbars:IToolbar#menuButtonViewMode
      * @cfg {IViewMode} Стиль отображения кнопки открытия выпадающего меню тулбара
      * @default toolButton
      * @demo Controls-demo/Toolbar/MenuButtonViewMode/Index
      */
     menuButtonViewMode?: IViewMode;

     /**
      * @name Controls/toolbars:IToolbar#closeMenuOnOutsideClick
      * @cfg {Boolean} Определяет возможность закрытия окна по клику вне.
      * @default true
      */
     closeMenuOnOutsideClick: boolean;
}

/**
 * Интерфейс опций контрола {@link Controls/toolbars:View}.
 * @interface Controls/toolbars:IToolbar
 * @public
 * @author Красильников А.С.
 * @implements Controls/interface:IHierarchy
 * @implements Controls/interface:IIconSize
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/dropdown:IGrouped
 * @implements Controls/toolbars:IToolbarSource
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IIconStyle
 * @implements Controls/interface:IHeight
 */

/**
 * Графический контрол, отображаемый в виде панели с размещенными на ней кнопками, клик по которым вызывает соответствующие им команды.
 * @class Controls/_toolbars/View
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FToolbar%2FBase%2FIndex демо-пример}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_toolbars.less переменные тем оформления}
 *
 * @extends UI/Base:Control
 * @implements Controls/toolbars:IToolbar
 * @implements Controls/interface:IItems
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Toolbar/Base/Index
 */

class Toolbar extends Control<IToolbarOptions, TItems> implements IHierarchy, IIconSize, IItemTemplate,
    IGrouped, IToolbarSource, IItems, IFontColorStyle, IIconStyle, IFilter {
    /*
     * Used in template
     */
    protected _needShowMenu: boolean = null;
    protected _items: TItems = null;
    protected _source: ICrudPlus = null;
    protected _sourceByItems: Memory = null;
    protected _menuSource: ICrudPlus = null;
    protected _nodeProperty: string = null;
    protected _parentProperty: string = null;
    protected _isLoadMenuItems: boolean = false;
    protected _firstItem: TItem = null;
    protected _countShowItems: number = 0;
    protected _buttonTemplate: TemplateFunction = getButtonTemplate();
    private _menuItems: {
        [key: number]: TItems
    } = {};

    protected _template: TemplateFunction = template;

    protected _dependenciesTimer: DependencyTimer = null;
    private _loadViewPromise: Promise<unknown> = null;

    _children: {
        menuTarget: HTMLElement,
        toolbarItems: HTMLElement
    };

    readonly '[Controls/_interface/IHierarchy]': boolean = true;
    readonly '[Controls/_toolbars/IToolbarSource]': boolean = true;
    readonly '[Controls/_interface/IIconSize]': boolean = true;
    readonly '[Controls/_interface/IFontColorStyle]': boolean = true;
    readonly '[Controls/_interface/IIconStyle]': boolean = true;
    readonly '[Controls/_interface/IItemTemplate]': boolean = true;
    readonly '[Controls/_interface/IItems]': boolean = true;
    readonly '[Controls/_dropdown/interface/IGrouped]': boolean = true;
    readonly '[Controls/_interface/IFilter]': boolean = true;
    private _sticky: StickyOpener;

    constructor(...args) {
        super(...args);

        this._resultHandler = this._resultHandler.bind(this);
        this._closeHandler = this._closeHandler.bind(this);
        this._openHandler = this._openHandler.bind(this);
    }

    private _createMemory(items: TItems): Memory {
        return new Memory({
            data: items.getRawData(),
            keyProperty: items.getKeyProperty()
        });
    }

    private _setSourceByItems(items: TItems): void {
        if (!this._sourceByItems) {
            this._sourceByItems = this._createMemory(items);
        }
    }

    openMenu(): void {
        this._openMenu(this._getMenuConfig());
    }

    closeMenu(): void {
        this._sticky.close();
    }

    private _getSynchronousSourceForMenu(menuItems?: TItems): ICrudPlus {
        const items = menuItems || this._options.items;
        if (items) {
            this._setSourceByItems(items);
            return this._sourceByItems;
        }
        if (this._source) {
            return this._source;
        }
    }

    private _getSourceForMenu(item: TItem): Promise<unknown> {
        if (this._options.menuSource) {
            return this._getMenuSource(item).then((menuSource) => {
                return menuSource;
            });
        }
        const source = this._getSynchronousSourceForMenu();
        return Promise.resolve(source);
    }

    private _getMenuSource(item: TItem): Promise<ICrudPlus> {
        const itemKey = item.get(this._options.keyProperty);
        if (!this._menuItems[itemKey]) {
            const filter = this._options.filter || {};
            filter[this._options.parentProperty] = itemKey;
            const sourceController = new SourceController({
                source: this._options.menuSource,
                keyProperty: this._options.keyProperty,
                filter
            });
            return sourceController.load().then((items) => {
                this._menuItems[itemKey] = items;
                const menuSource = this._createPrefetchProxy(this._options.menuSource, items);
                return menuSource;
            });
        } else {
            const source = this._createPrefetchProxy(this._options.menuSource, this._menuItems[itemKey]);
            return Promise.resolve(source);
        }
    }

    private _getMenuConfig(): IStickyPopupOptions {
        const options = this._options;
        const beforeMenuOpenResult = this._notify('beforeMenuOpen', [], {bubbling: true});
        const popupOptions = beforeMenuOpenResult?.popupOptions || {};
        const templateOptions = beforeMenuOpenResult?.templateOptions || {};
        return {
            ...this._getMenuOptions(),
            ...popupOptions,
            opener: this,
            className: `${options.popupClassName} controls-Toolbar-${options.direction}__popup__list controls_popupTemplate_theme-${options.theme}`,
            templateOptions: {
                ...templateOptions,
                source: this._menuSource,
                ...this._getMenuTemplateOptions(),
                itemActions: options.itemActions,
                itemActionVisibilityCallback: options.itemActionVisibilityCallback,
                additionalProperty: options.additionalProperty,
                footerContentTemplate: options.popupFooterTemplate,
                closeButtonVisibility: true,
                dropdownClassName: `controls-Toolbar-${options.direction}__dropdown`
            },
            target: options.direction === 'vertical' ? this._children.toolbarItems : this._children.menuTarget
        };
    }

    private _getMenuTemplateOptions(): IStickyPopupOptions {
        const options = this._options;
        const isVertical = options.direction === 'vertical';
        const menuTemplateOptions: IStickyPopupOptions = {
            groupTemplate: options.groupTemplate,
            groupProperty: options.groupProperty,
            groupingKeyCallback: options.groupingKeyCallback,
            keyProperty: options.keyProperty,
            parentProperty: options.parentProperty,
            nodeProperty: options.nodeProperty,
            iconSize: options.iconSize,
            iconStyle: options.iconStyle,
            itemTemplateProperty: options.itemTemplateProperty,
            closeButtonViewMode: isVertical ? 'external' : 'link',
            draggable: options.menuDraggable
        };

        if (isVertical) {
           menuTemplateOptions.itemPadding = {
               left: 's'
           };
        }

        return menuTemplateOptions;
    }

    private _getMenuConfigByItem(item: TItem, source: ICrudPlus, root: number, items: RecordSet): IStickyPopupOptions {
        const options = this._options;
        const beforeMenuOpenResult = this._notify('beforeMenuOpen', [item], {bubbling: true});
        const popupOptions = beforeMenuOpenResult?.popupOptions || {};
        const isVerticalDirection = options.direction === 'vertical';
        const className = isVerticalDirection ? `controls-Toolbar-${options.direction}__popup__list` :
            `controls-Toolbar__popup__${Toolbar._typeItem(item)} ${Toolbar._menuItemClassName(item)} controls_popupTemplate_theme-${options.theme} controls_dropdownPopup_theme-${options.theme}`;
        const config = {
            ...this._getMenuOptions(),
            ...popupOptions,
            opener: this,
            className,
            templateOptions: {
                source,
                items,
                root,
                ...this._getMenuTemplateOptions(),
                showHeader: item.get('showHeader'),
                closeButtonVisibility: true,
                headConfig: {
                    icon: item.get('icon'),
                    caption: item.get('title'),
                    iconSize: item.get('iconSize'),
                    iconStyle: item.get('iconStyle') || options.iconStyle
                },
                ...item.get('menuOptions')
            }
        };
        if (!isVerticalDirection) {
            config.targetPoint = {
                vertical: 'top',
                    horizontal: 'left'
            };
            config.direction = {
                horizontal: 'right'
            };
        }
        return config;
    }

    private _getMenuOptions(): IStickyPopupOptions {
        return {
            direction: {
                horizontal: 'left',
                vertical: 'bottom'
            },
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            eventHandlers: {
                onResult: this._resultHandler,
                onClose: this._closeHandler,
                onOpen: this._openHandler
            },
            template: 'Controls/menu:Popup',
            closeOnOutsideClick: this._options.closeMenuOnOutsideClick,
            actionOnScroll: 'close',
            fittingMode: {
                vertical: 'adaptive',
                horizontal: 'overflow'
            }
        };
    }

    private _setState(options: IToolbarOptions): void {
        this._nodeProperty = options.nodeProperty;
        this._parentProperty = options.parentProperty;
    }

    private _createPrefetchProxy(source: ICrudPlus, items: TItems): ICrudPlus {
        return new PrefetchProxy({
            target: source,
            data: {
                query: items
            }
        });
    }

    private _setMenuSource(menuSource: ICrudPlus = this._options.menuSource): void {
        if (this._options.menuSource) {
            this._menuSource = menuSource;
        } else {
            const menuItems = Toolbar._calcMenuItems(this._items);
            const source = this._options.source || this._getSynchronousSourceForMenu(menuItems);
            this._menuSource = this._createPrefetchProxy(source, menuItems);
        }
    }

    private _setStateByItems(items: TItems, source?: ICrudPlus): void {
        this._items = items;
        this._countShowItems = 0;
        items.forEach((item) => {
            if (this._isShowToolbar(item as TItem, this._parentProperty)) {
                this._countShowItems++;
            }
        });
        // у первой записи тулбара не требуется показывать отступ слева
        this._firstItem = this._getFirstToolbarItem() as TItem;
        if (source) {
            this._source = this._createPrefetchProxy(source, this._items);
        }
        this._needShowMenu = needShowMenu(this._items);
    }

    private _needChangeState(newOptions: IToolbarOptions): boolean {
        const currentOptions = this._options;

        return [
            'keyProperty',
            'parentProperty',
            'nodeProperty',
            'popupClassName'
        ].some((optionName: string) => currentOptions[optionName] !== newOptions[optionName]);
    }

    private _openMenu(config: IStickyPopupOptions): void {
        if (!this._sticky) {
            this._sticky = new StickyOpener();
        }
        // Перед открытием нового меню закроем старое.
        // Т.к. вып. список грузит данные асинхронно, то при перерисовке открытого окна будет визуальный баг,
        // когда позиция окна обновилась, а содержимое нет, т.к. не успело загрузиться.
        if (this._options.closeMenuOnOutsideClick) {
            this._sticky.close();
        }
        this._sticky.open(config);
    }

    protected _beforeMount(options: IToolbarOptions, context: {}, receivedItems?: TItems): Promise<TItems> {
        this._setState(options);

        // TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=7d618623-243a-4aa2-a533-215f06e137e1
        this._isShowToolbar = this._isShowToolbar.bind(this);

        if (options.source) {
            if (receivedItems) {
                this._setStateByItems(receivedItems, options.source);
            } else {
                return this.setStateBySource(options.source, options.filter);
            }
        } else if (options.items) {
            this._setStateByItems(options.items);
        }
    }

    protected _beforeUpdate(newOptions: IToolbarOptions): void {
        const itemsChanged = this._options.items !== newOptions.items;
        const filterChanged = this._options.filter !== newOptions.filter;
        const menuSourceChanged = this._options.menuSource !== newOptions.menuSource;
        if (this._needChangeState(newOptions)) {
            this._setState(newOptions);
        }
        if (hasSourceChanged(newOptions.source, this._options.source) || filterChanged) {
            this._isLoadMenuItems = false;
            this._sticky?.close();
            this.setStateBySource(newOptions.source, newOptions.filter);
        }
        if (itemsChanged) {
            this._isLoadMenuItems = false;
            this._sourceByItems = null;
            this._setStateByItems(newOptions.items);
        }
        if (menuSourceChanged) {
            this._menuItems = {};
            this._isLoadMenuItems = false;
            this._setMenuSource(newOptions.menuSource);
        }
        if (itemsChanged || menuSourceChanged) {
            if (this._sticky?.isOpened() && !this._options.closeMenuOnOutsideClick) {
                this.openMenu();
            }
        }
    }

    protected _beforeUnmount(): void {
        this._sticky?.destroy();
        this._sticky = null;
    }

    protected _resultHandler(action, data, nativeEvent): void {
        if (action === 'itemClick' || action === 'rightTemplateClick' || action === 'applyClick') {
            const item = data;
            const notifyActionResult = this._notify(action, [item, nativeEvent]);

            /**
             * menuOpener may not exist because toolbar can be closed by toolbar parent in item click handler
             */
            if (this._sticky.isOpened() &&
                (action === 'applyClick' || !item.get(this._nodeProperty)) &&
                notifyActionResult !== false
            ) {
                this._sticky.close();
            }
        }
    }

    protected setStateBySource(source: ICrudPlus, filter?: Object): Promise<TItems> {
        return loadItems(source, filter).then((items) => {
            this._setStateByItems(items, source);
            return items;
        });
    }

    protected _openHandler(): void {
        this._notify('dropDownOpen');
    }

    protected _closeHandler(): void {
        this._notify('dropDownClose');
        this._setStateByItems(this._items, this._options.source);
        this._setMenuSource();
    }

    protected _itemClickHandler(event: SyntheticEvent<MouseEvent>, item: TItem): void {
        const readOnly: boolean = item.get('readOnly') || this._options.readOnly;

        if (readOnly) {
            event.stopPropagation();
            return;
        }

        if (item.get(this._nodeProperty)) {
            this._getSourceForMenu(item).then((source) => {
                const root = item.get(this._options.keyProperty);
                const menuSource = source;

                const config = this._getMenuConfigByItem(item, menuSource, root, this._menuItems[root]);
                this._openMenu({
                    ...config,
                    target: event.currentTarget
                });
            });
        }

        event.stopPropagation();
        return this._notify('itemClick', [item, event.nativeEvent]);
    }

    protected _getTemplateByItem(item: TItem): TemplateFunction {
        return getTemplateByItem(item, this._options);
    }

    protected _getSimpleButtonTemplateOptionsByItem(item: TItem): IButtonOptions {
        return getSimpleButtonTemplateOptionsByItem(item, this._options);
    }

    protected _mouseDownHandler(event: SyntheticEvent<MouseEvent>): void {
        if (!isLeftMouseButton(event)) {
            return;
        }

        if (!this._options.readOnly) {
            if (!this._isLoadMenuItems) {
                this._setMenuSource();
                this._isLoadMenuItems = true;
            }
            this._openMenu(this._getMenuConfig());
        }
    }

    protected _onClickHandler(event: SyntheticEvent): void {
        event.stopPropagation();
    }

    protected _mouseEnterHandler() {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this));
        }
    }

    protected _mouseLeaveHandler(): void {
        this._dependenciesTimer?.stop();
    }

    private _loadDependencies(): Promise<unknown> {
        try {
            if (!this._isLoadMenuItems) {
                this._setMenuSource();
                this._isLoadMenuItems = true;
            }

            if (!this._loadViewPromise) {
                this._loadViewPromise = import('Controls/menu');
            }
            return this._loadViewPromise;
        } catch (e) {
            IoC.resolve('ILogger').error('_toolbars:View', e);
        }
    }

    /**
     * Used in template
     */
    protected _isShowToolbar(item: TItem, parentProperty: string): boolean {
        const itemShowType = item.get('showType');

        if (itemShowType === showType.MENU) {
            return false;
        }
        const itemHasParentProperty = item.has(parentProperty) && item.get(parentProperty) !== null;
        if (itemHasParentProperty) {
            if (itemShowType === showType.MENU_TOOLBAR) {
                return true;
            }
            return false;
        }

        return true;
    }

    private _getFirstToolbarItem(): void | TItem {
        if (this._items) {
            const count = this._items.getCount();
            if (count === 1) {
                // Если элемент один, покажем его только в тулбаре.
                const isFirstItemShowTypeToolbar = this._items.at(0).get('showType') === showType.TOOLBAR;
                if (!isFirstItemShowTypeToolbar) {
                    this._items.at(0).set('showType', showType.TOOLBAR);
                }
            }
            for (let i = 0; i < count; i++) {
                const item = this._items.at(i) as TItem;
                const isToolbarItem = this._isShowToolbar(item, this._parentProperty);
                if (isToolbarItem) {
                    return item;
                }
            }
        }
        return void 0;
    }

    private static _typeItem(item: TItem): TypeItem {
        if (item.get('icon')) {
            return 'icon';
        }
        if (item.get('viewMode') === 'toolButton') {
            return 'toolButton';
        }

        return 'link';
    }

    private static _menuItemClassName(item: TItem): string {
        const menuClassName = item.get('popupClassName');

        if (menuClassName) {
            return menuClassName;
        }

        return '';
    }

    private static _calcMenuItems(items: TItems): TItems {
        return getMenuItems<TItem>(items).value(factory.recordSet, {
            adapter: items.getAdapter(),
            keyProperty: items.getKeyProperty(),
            format: items.getFormat()
        });
    }

    static getDefaultOptions(): IToolbarOptions {
        return {
            menuSource: null,
            popupClassName: '',
            itemsSpacing: 'medium',
            iconSize: 'm',
            direction: 'horizontal',
            itemTemplate: defaultItemTemplate,
            iconStyle: 'secondary',
            translucent: false,
            closeMenuOnOutsideClick: true,
            menuButtonViewMode: 'toolButton'
        };
    }

    static getOptionTypes(): object {
        return {
            popupClassName: descriptor(String),
            itemsSpacing: descriptor(String).oneOf([
                'medium',
                'big'
            ])
        };
    }
}

Object.defineProperty(Toolbar, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Toolbar.getDefaultOptions();
   }
});

/**
 * @event Происходит при открытии выпадающего списка.
 * @name Controls/_toolbars/View#dropDownOpen
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @event Происходит при закрытии выпадающего списка.
 * @name Controls/_toolbars/View#dropDownClose
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 */

/**
 * @event Происходит при клике по элементу.
 * @name Controls/_toolbars/View#itemClick
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому производим клик.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.toolbars:View on:itemClick="onToolbarItemClick()" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * onToolbarItemClick: function(e, selectedItem) {
 *    var itemId = selectedItem.get('id');
 *    switch (itemId) {
 *       case 'remove':
 *          this._removeItems();
 *          break;
 *       case 'move':
 *          this._moveItems();
 *          break;
 * }
 * </pre>
 */

/**
 * @name Controls/_toolbars/View#iconStyle
 * @cfg
 * @demo Controls-demo/Toolbar/IconStyle/Index
 */

/**
 * @name Controls/_toolbars/View#fontColorStyle
 * @cfg
 * @demo Controls-demo/Toolbar/IconStyle/Index
 */

/**
 * @name Controls/_toolbars/View#itemTemplate
 * @cfg {String | TemplateFunction} Пользовательский шаблон отображения элемента внутри тулбара.
 * Для того чтобы задать шаблон элемента и в тулбаре и в выпадающем списке, используйте опцию {@link Controls/interface/IItemTemplate itemTemplateProperty}.
 * Для определения внутри шаблона места построения(тулбар или меню) используйте переменную type="toolbar"
 * внутри шаблона.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <div class="wrapper">
 *    <div class="cell">
 *        <ws:if data="{{type === 'toolbar'}}">
 *            {{toolbarContent}}
 *        </ws:if>
 *        <ws:else>
 *            {{menuContent}}}
 *        </ws:else>
 *    </div>
 * </div>
 * </pre>
 *
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <div class="controlsDemo__wrapper">
 *    <div class="controlsDemo__cell">
 *       <Controls.toolbars:View
 *          source="{{_toolbarSource}}"
 *          keyProperty="id">
 *             <ws:itemTemplate>
 *                <div style="background: #E1E1E1">
 *                   <ws:partial template="Controls/toolbars:ItemTemplate" />
 *                </div>
 *             </ws:itemTemplate>
 *       </Controls.toolbars:View>
 *    </div>
 * </div>
 * </pre>
 *
 * @demo Controls-demo/Toolbar/ItemTemplate/Index
 */

export default Toolbar;
