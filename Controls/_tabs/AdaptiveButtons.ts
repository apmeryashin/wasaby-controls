import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as template from 'wml!Controls/_tabs/AdaptiveButtons/AdaptiveButtons';
import {RecordSet} from 'Types/collection';
import {loadFontWidthConstants, getFontWidth} from 'Controls/Utils/getFontWidth';
import {SbisService, Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {CrudWrapper} from 'Controls/dataSource';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';
import {ITabsButtonsOptions} from './interface/ITabsButtons';
import {TSelectedKey} from 'Controls/interface';
import * as rk from 'i18n!Controls';

const MARGIN = 13;
const MIN_WIDTH = 26;
const ICON_WIDTH = 16;
const PADDING_OF_MORE_BUTTON = 6;
const COUNT_OF_MARGIN = 2;
const MORE_BUTTON_TEXT = rk('Ещё...');

interface IReceivedState {
    items: RecordSet<object>;
    containerWidth: number;
}

export interface ITabsAdaptiveButtonsOptions extends ITabsButtonsOptions {
    /**
     * @name Controls/_tabs/ITabsAdaptiveButtons#align
     * @cfg {String} Выравнивание вкладок по правому или левому краю.
     * @variant left Вкладки выравниваются по левому краю.
     * @variant right Вкладки выравниваются по правому краю.
     * @default right
     */
    align?: string;
    /**
     * @name Controls/_tabs/ITabsAdaptiveButtons#containerWidth
     * @cfg {Number} Ширина контейнера вкладок. Необходимо указывать для правильного расчета ширины вкладок.
     */
    containerWidth: number;
}

/**
 * Интерфейс для опций контрола адаптивных вкладок.
 * @interface Controls/_tabs/ITabsAdaptiveButtons
 * @public
 * @author Красильников А.С.
 */

/**
 * Контрол предоставляет пользователю возможность выбрать между двумя или более адаптивными под ширину вкладками.
 *
 * @class Controls/_tabs/AdaptiveButtons
 * @extends UI/Base:Control
 * @mixes Controls/tabs:ITabsButtons
 * @mixes Controls/tabs:ITabsAdaptiveButtons
 * @implements Controls/interface:ISource
 * @implements Controls/interface:IItems
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Tabs/AdaptiveButtons/Index
 */

class AdaptiveButtons extends Control<ITabsAdaptiveButtonsOptions, IReceivedState> {
    readonly '[Controls/_tabs/interface/ITabsButtons]': boolean = true;
    protected _template: TemplateFunction = template;
    protected _lastIndex: number = 0;
    protected _items: RecordSet<object>;
    protected _moreButtonWidth: number;
    protected _visibleItems: RecordSet<object>;
    protected _crudWrapper: CrudWrapper;
    protected _menuSource: Memory;
    protected _filter: object;
    protected _itemTemplate: string = 'Controls/tabs:buttonsItemTemplate';
    protected _position: number;

    protected _beforeMount(options?: ITabsAdaptiveButtonsOptions,
                           contexts?: object,
                           receivedState?: IReceivedState): Promise<IReceivedState> | void {
        if (options.containerWidth === undefined || isNaN(options.containerWidth)) {
            Logger.error('Не задана обязательная опция containerWidth. Вкладки не будут построены.', this);
        }
        if (receivedState) {
            if (options.containerWidth !== receivedState.containerWidth) {
                Logger.warn('Опция containerWidth на клиенте и сервере имеет разные значения,' +
                    'вкладки могут прыгать при построении', this);

            }
            this._setItems(receivedState.items);
            this._moreButtonWidth = this._getTextWidth(MORE_BUTTON_TEXT, 'm');
            this._calcVisibleItems(this._items, options, options.selectedKey);
            if (this._lastIndex < 0) {
                return;
            }
            this._menuSource = this._createMemoryForMenu(options.keyProperty);
            this._updateFilter(options);
        } else {
            return new Promise((resolve) => {
                loadFontWidthConstants().then((getTextWidth: Function) => {
                    this._getTextWidth = getTextWidth;
                    this._moreButtonWidth = this._getTextWidth(MORE_BUTTON_TEXT, 'm');
                    const getReceivedData = (opts: ITabsAdaptiveButtonsOptions) => {
                        this._prepareItems(opts);
                        resolve({
                            items: this._items,
                            containerWidth: options.containerWidth
                        });
                    };

                    if (options.items) {
                        this._setItems(options.items);
                        getReceivedData(options);
                    } else if (options.source) {
                        this._loadItems(options.source).then(() => {
                            getReceivedData(options);
                        });
                    }
                });
            });
        }
    }

    protected _beforeUpdate(newOptions?: ITabsAdaptiveButtonsOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            this._loadItems(newOptions.source).then(() => {
                this._prepareItems(newOptions);
            });
        }

        const isItemsChanged = newOptions.items && newOptions.items !== this._options.items;
        const isContainerWidthChanged = newOptions.containerWidth !== this._options.containerWidth;

        if (isItemsChanged) {
            this._setItems(newOptions.items);
        }

        if (isItemsChanged || isContainerWidthChanged) {
            this._prepareItems(newOptions);
            this._calcVisibleItems(this._items, newOptions, newOptions.selectedKey);
        }
    }

    protected _selectedKeyHandler(event: SyntheticEvent<Event>, key: string): void {
        this._notify('selectedKeyChanged', [key]);
    }

    private _setItems(items: RecordSet): void {
        this._items = items;
    }

    private _loadItems(source: SbisService): Promise<void> {
        this._crudWrapper = new CrudWrapper({
            source
        });
        return this._crudWrapper.query({}).then((items: RecordSet<object>) => {
            this._setItems(items);
        });
    }

    private _menuItemClickHandler(event: SyntheticEvent<Event>, keys: number[]|string[]): void {
        const item: Model<object> = this._items.getRecordById(keys[0]);
        item.set('canShrink', true);
        /*Выбрав один из пунктов меню пользователь активирует соответствующую вкладку.
        Выбранная в меню вкладка заменяет собой прежнюю крайнюю на экране вкладку*/
        this._selectedKeyHandler(event, item.get(this._options.keyProperty));
        this._visibleItems.replace(item, this._position);
        // для вызова перерисовки Controls.tabs:Buttons необходимо передать новые items
        this._visibleItems = this._visibleItems.clone();
        this._updateFilter(this._options);
        this._calcVisibleItems(this._items, this._options, keys[0], true);
    }

    // при нажатии на кнопку еще останавливаем событие для того, чтобы вкладка не выбралась.
    private _onMouseDownHandler(event: SyntheticEvent<Event>): void {
        event.stopPropagation();
    }

    private _prepareItems(options: ITabsAdaptiveButtonsOptions): void {
        this._items.forEach((item: Model<object>) => {
            item.set('align', options.align);
        });
        this._calcVisibleItems(this._items, options, options.selectedKey);
        if (this._lastIndex < 0) {
            return;
        }
        this._menuSource = this._createMemoryForMenu(options.keyProperty);
        this._updateFilter(options);
    }

    private _createMemoryForMenu(keyProperty: string): Memory {
        return new Memory({
            keyProperty,
            data: this._items.getRawData()
        });
    }
    private _updateFilter(options: ITabsAdaptiveButtonsOptions): void {
        const arrIdOfInvisibleItems = [];
        const filter = {};
        const keyPropertyOfLastItem = this._visibleItems.at(this._position).get(options.keyProperty);
        // фильтруем названия неуместившихся вкладок, а так же ту которая в данный момент размещена на экране последней
        this._items.each((item) => {
            if (this._visibleItems.getIndexByValue(options.keyProperty, item.get(options.keyProperty)) === -1
            || item.get(options.keyProperty) === keyPropertyOfLastItem) {
                arrIdOfInvisibleItems.push(item.get(options.keyProperty));
            }
        });
        filter[options.keyProperty] = arrIdOfInvisibleItems;
        this._filter = filter;
    }

    private _calcVisibleItems(
        items: RecordSet<object>,
        options: ITabsAdaptiveButtonsOptions,
        key: TSelectedKey,
        afterMenuSelection: boolean = false
    ): void {
        const arrWidth = this._getItemsWidth(items, options.displayProperty);
        const containerWidth = options.containerWidth;
        const clonedItems = items.clone().getRawData();
        if (options.align === 'right') {
            clonedItems.reverse();
            arrWidth.reverse();
        }
        const currentItemIndex = clonedItems.findIndex((item) => item.id === key);
        let currentContainerWidth = this._moreButtonWidth + PADDING_OF_MORE_BUTTON + arrWidth[currentItemIndex];
        const rawData = [];
        rawData.push(clonedItems[currentItemIndex]);
        const minWidth = MIN_WIDTH + MARGIN * COUNT_OF_MARGIN;
        for (let i = 0; i <= arrWidth.length - 1; i++) {
             if (containerWidth - currentContainerWidth > minWidth) {
                 if (i !== currentItemIndex) {
                     const add = !afterMenuSelection || currentContainerWidth + arrWidth[i] < containerWidth;
                     const leftPosition = afterMenuSelection ? options.align === 'right' : i < currentItemIndex;
                     if (add) {
                         currentContainerWidth += arrWidth[i];
                         if (leftPosition) {
                             rawData.unshift(clonedItems[i]);
                         } else {
                             rawData.push(clonedItems[i]);
                         }
                     }
                 }
             } else {
                 break;
             }
        }
        if (afterMenuSelection && options.align === 'left') {
            rawData[rawData.length - 1] = rawData.shift();
        }
        this._lastIndex = rawData.length - 1;
        rawData.forEach((item) => item.canShrink = false);
        if (options.align === 'right') {
            rawData.reverse();
        }
        // Чтобы ужималась последняя вкладка.
        const indexCanShrinkElement = options.align === 'right' ? 0 : rawData.length - 1;
        rawData[indexCanShrinkElement].canShrink = true;
        this._visibleItems = new RecordSet();
        this._visibleItems.setRawData(rawData);
        this._position = options.align === 'right' ? 0 : this._visibleItems.getCount() - 1;
    }

    private _getItemsWidth(items: RecordSet<object>, displayProperty: string): number[] {
        const widthArray = [];
        for (let i = 0; i < items.getCount(); i++) {
            const item = items.at(i);
            let itemTextWidth = this._getTextWidth(item.get(displayProperty), 'l');
            let iconWidth = 0;
            if (item.get('icon')) {
                iconWidth += ICON_WIDTH + PADDING_OF_MORE_BUTTON;
            }
            if (itemTextWidth < MIN_WIDTH) {
                itemTextWidth = MIN_WIDTH;
            }
            widthArray.push(itemTextWidth + COUNT_OF_MARGIN * MARGIN + iconWidth);
        }
        return widthArray;
    }

    private _getTextWidth(text: string, size: string  = 'l'): number {
       return Math.ceil(getFontWidth(text, size));
    }

    static getDefaultOptions(): Partial<ITabsAdaptiveButtonsOptions> {
        return {
            align: 'right',
            displayProperty: 'title'
        };
    }
}

Object.defineProperty(AdaptiveButtons, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return AdaptiveButtons.getDefaultOptions();
   }
});

export default AdaptiveButtons;
