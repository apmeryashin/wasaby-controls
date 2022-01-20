import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Memory} from 'Types/source';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import {applyHighlighter} from 'Controls/_breadcrumbs/resources/applyHighlighter';
import template = require('wml!Controls/_breadcrumbs/View/View');
import itemTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemTemplate');
import itemsTemplate = require('wml!Controls/_breadcrumbs/View/resources/itemsTemplate');
import calculatedItemsTemplate = require('wml!Controls/_breadcrumbs/View/resources/calculatedItemsTemplate');
import 'wml!Controls/_breadcrumbs/resources/menuContentTemplate';
import 'css!Controls/breadcrumbs';
import {Opener as NavigationMenuOpener} from 'Controls/_breadcrumbs/NavigationMenu/Opener';
import {Path} from 'Controls/dataSource';
import {IVisibleItem} from 'Controls/_breadcrumbs/PrepareDataUtil';
import {Record} from 'Types/entity';
import {TKey} from 'Controls/interface';

const CRUMBS_COUNT = 2;
const MIN_COUNT_OF_LETTER = 3;

// noinspection NonAsciiCharacters
interface ISourceItem {
    displayProperty: string;
    node: boolean;
    parent: TKey;
    'Только узлы': boolean;
    [key: string]: unknown;
}

interface IBreadCrumbsView extends IControlOptions {
    items?: Path;
    visibleItems?: IVisibleItem[];
    displayProperty?: string;
}

/**
 * BreadCrumbs/View.
 *
 * @class Controls/_breadcrumbs/View
 * @extends UI/Base:Control
 * @mixes Controls/breadcrumbs:IBreadCrumbs
 * @implements Controls/interface:IFontColorStyle
 * @implements Controls/interface:IFontSize
 *
 * @private
 * @author Авраменко А.С.
 */

/**
 * @name Controls/_breadcrumbs/View#fontSize
 * @cfg
 * @demo Controls-demo/BreadCrumbs/FontSize/Index
 */

class BreadCrumbsView extends Control<IBreadCrumbsView> {
    protected _template: TemplateFunction =  template;
    protected _itemsTemplate: TemplateFunction = itemsTemplate;
    protected _calculatedItemsTemplate: TemplateFunction = calculatedItemsTemplate;
    protected _popupIsOpen: boolean = false;
    private _menuOpener: NavigationMenuOpener;
    protected _items: IVisibleItem[];

    protected _applyHighlighter: typeof applyHighlighter = applyHighlighter;

    protected _beforeMount(options: IBreadCrumbsView): void {
        this._items = options.visibleItems;
        this._addWithOverflow(options.displayProperty);
        // Эта функция передаётся по ссылке в Opener, так что нужно биндить this, чтобы не потерять его
        this._onResult = this._onResult.bind(this);
        this._menuOpener = new NavigationMenuOpener();
    }
    protected _beforeUpdate(newOptions: IBreadCrumbsView): void {
        if (newOptions.visibleItems !== this._items) {
            this._items = newOptions.visibleItems;
            this._addWithOverflow(newOptions.displayProperty);
        }
    }
    private _addWithOverflow(displayProperty: string): void {
        if (this._items.length <= CRUMBS_COUNT) {
            this._items.forEach((item) => {
                const itemLength = item.item.get(displayProperty)?.length || 0;
                if (!item.isDots && itemLength > MIN_COUNT_OF_LETTER) {
                    item.withOverflow = true;
                }
            });
        }
    }

    protected _afterMount(options?: IControlOptions): void {
        RegisterUtil(this, 'scroll', this._scrollHandler.bind(this));
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'scroll');
        this._menuOpener.close();
    }

    private _scrollHandler(): void {
        this._menuOpener.close();
    }

    protected _onItemClick(e: SyntheticEvent<Event>, itemData: IVisibleItem): void {
            e.stopPropagation();
            if (!this._options.readOnly) {
                this._notify('itemClick', [itemData.item]);
            } else {
                // Если мы не обработали клик по хлебным крошкам (например они readOnly),
                // то не блокируем событие клика, но делаем его не всплывающим
                this._notify('click', []);
            }
    }

    protected _afterRender(oldOptions: IBreadCrumbsView): void {
        if (oldOptions.visibleItems !== this._options.visibleItems) {
            // Если крошки пропали (стало 0 записей), либо наоборот появились (стало больше 0 записей), кинем ресайз,
            // т.к. изменится высота контрола
            if (!this._options.visibleItems.length || !oldOptions.visibleItems.length) {
                this._notify('controlResize', [], {bubbling: true});
            }
        }
    }

    // На mousedown (зажатии кнопки мыши над точками) должно открываться только меню хлебных крошек.
    // Но так как мы не стопим другие клики срабатывает проваливание.
    // Поэтому прекращаем распространение события клика:
    protected _clickHandler(e: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
    }

    /**
     * Обработчик клика по '...', показывает навигационное меню с полным путем.
     */
    protected _dotsClick(e: SyntheticEvent<MouseEvent>): void {
        let parent = null;
        const data = this._options.items.map((item) => {
            const newItem = {} as ISourceItem;

            item.each((field) => {
                newItem[field] = item.get(field);
            });

            newItem.node = true;
            newItem.parent = parent;
            newItem['Только узлы'] = true;
            newItem.displayProperty = this._options.displayProperty;

            parent = item.getKey();

            return newItem;
        });

        if (this._popupIsOpen) {
            this._menuOpener.close();
        }

        this._menuOpener.open(
            this,
            e.currentTarget as HTMLElement,
            {
                eventHandlers: {
                    onResult: this._onResult,
                    onOpen: () => {
                        this._popupIsOpen = true;
                    },
                    onClose: () => {
                        // tslint:disable-next-line:ban-ts-ignore
                        // @ts-ignore
                        if (!this._destroyed) {
                            this._popupIsOpen = false;
                        }
                    }
                },
                templateOptions: {
                    source: new Memory({
                        data,
                        keyProperty: this._options.items[0].getKeyProperty()
                    }),
                    nodeProperty: 'node',
                    parentProperty: 'parent',
                    path: this._options.items,
                    readOnly: this._options.readOnly,
                    displayProperty: this._options.displayProperty
                }
            }
        );
    }

    protected _onHoveredItemChanged(event: SyntheticEvent<Event>, item: Record): void {
        this._notify('hoveredItemChanged', [item]);
    }

    protected _onResult(actionName: string, data: Record): void {
        if (actionName === 'itemClick' && !this._options.readOnly) {
            this._notify('itemClick', [data]);
            this._menuOpener.close();
        }
    }
    static _styles: string[] = ['Controls/_breadcrumbs/resources/FontLoadUtil'];

    static getDefaultOptions(): object {
        return {
            itemTemplate,
            backgroundStyle: 'default',
            displayMode: 'default',
            fontSize: 'xs'
        };
    }
}

Object.defineProperty(BreadCrumbsView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return BreadCrumbsView.getDefaultOptions();
   }
});

export default BreadCrumbsView;
