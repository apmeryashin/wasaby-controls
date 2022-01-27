import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_lookup/SelectedCollection/SelectedCollection');
import ItemTemplate = require('wml!Controls/_lookup/SelectedCollection/ItemTemplate');
import {EventUtils} from 'UI/Events';
import selectedCollectionUtils = require('Controls/_lookup/SelectedCollection/Utils');
import ContentTemplate = require('wml!Controls/_lookup/SelectedCollection/_ContentTemplate');
import CrossTemplate = require('wml!Controls/_lookup/SelectedCollection/_CrossTemplate');
import CounterTemplate = require('wml!Controls/_lookup/SelectedCollection/CounterTemplate');
import {SyntheticEvent} from 'Vdom/Vdom';
import { Model } from 'Types/entity';
import {RecordSet} from 'Types/collection';
import { IStickyPopupOptions, StickyOpener } from 'Controls/popup';
import { ILookupOptions } from 'Controls/_lookup/Lookup';
import 'css!Controls/lookup';

const JS_CLASS_CAPTION_ITEM = '.js-controls-SelectedCollection__item__caption';
const JS_CLASS_CROSS_ITEM = '.js-controls-SelectedCollection__item__cross';

export interface ISelectedCollectionOptions extends IControlOptions, ILookupOptions {
   displayProperty: string;
   items: RecordSet;
   maxVisibleItems: number;
   itemTemplate: TemplateFunction;
}

interface ISelectedCollectionChildren {
   infoBoxLink: HTMLElement;
}
/**
 * Контрол, отображающий коллекцию элементов.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_lookup.less переменные тем оформления}
 *
 * @class Controls/_lookup/SelectedCollection
 * @extends UI/Base:Control
 *
 * @public
 * @author Герасимов А.М.
 */
/*
 * Control, that display collection of items.
 *
 * @class Controls/_lookup/SelectedCollection
 * @extends UI/Base:Control
 *
 * @author Герасимов А.М.
 */
class SelectedCollection extends Control<ISelectedCollectionOptions, number> {
   protected _template: TemplateFunction = template;
   protected _visibleItems: Model[] = null;
   protected _notifyHandler: (event: SyntheticEvent, eventName: string) => void = EventUtils.tmplNotify;
   protected _getItemMaxWidth: Function = selectedCollectionUtils.getItemMaxWidth;
   protected _getItemOrder: Function = selectedCollectionUtils.getItemOrder;
   protected _counterWidth: number = 0;
   protected _contentTemplate: TemplateFunction = ContentTemplate;
   protected _crossTemplate: TemplateFunction = CrossTemplate;
   protected _counterTemplate: TemplateFunction = CounterTemplate;
   protected _children: ISelectedCollectionChildren;
   protected _stickyOpener: StickyOpener = null;
   protected _needShowCounter: boolean = false;

   protected _beforeMount(options: ISelectedCollectionOptions): void {
      this._clickCallbackPopup = this._clickCallbackPopup.bind(this);
      this._visibleItems = selectedCollectionUtils.getVisibleItems(options);
      this._counterWidth = options._counterWidth || 0;
   }

   protected _beforeUpdate(newOptions: ISelectedCollectionOptions): void {
      const itemsCount: number = newOptions.items.getCount();
      this._visibleItems = selectedCollectionUtils.getVisibleItems(newOptions);

      if (this._isShowCounter(itemsCount, newOptions.multiLine, newOptions.maxVisibleItems)) {
         this._counterWidth = newOptions._counterWidth ||
                              this._getCounterWidth(itemsCount, newOptions);
      } else {
         this._closeInfobox();
      }
   }

   protected _afterMount(): void {
      const itemsCount: number = this._options.items.getCount();

      if (this._isShowCounter(itemsCount,
                              this._options.multiLine, this._options.maxVisibleItems) && !this._counterWidth) {
         this._counterWidth = this._counterWidth ||
                              this._getCounterWidth(itemsCount, this._options);
         if (this._counterWidth) {
            this._forceUpdate();
         }
      }
   }

   protected _beforeUnmount(): void {
      this._closeInfobox();
   }

   protected _itemClick(event: SyntheticEvent, item: Model): void {
      let eventName: string;

      if (event.target.closest(JS_CLASS_CAPTION_ITEM)) {
         eventName = 'itemClick';
      } else if (event.target.closest(JS_CLASS_CROSS_ITEM)) {
         eventName = 'crossClick';
      }

      if (eventName) {
         event.stopPropagation();
         this._notify(eventName, [item, event.nativeEvent]);
      }
   }

   protected _clickCallbackPopup(eventType: string, item: Model): void {
      if (eventType === 'crossClick') {
         this._notify('crossClick', [item]);
      } else if (eventType === 'itemClick') {
         this._notify('itemClick', [item]);
      }
   }

   protected _openInfoBox(): Promise<void> {
      const config: IStickyPopupOptions = {
         target: this._children.infoBoxLink,
         opener: this,
         closeOnOutsideClick: true,
         actionOnScroll: 'close',
         width: this._container.offsetWidth,
         template: 'Controls/lookupPopup:Collection',
         direction: {
            vertical: 'bottom',
            horizontal: 'right'
         },
         targetPoint: {
            vertical: 'bottom',
            horizontal: 'left'
         },
         templateOptions: {
            items: this._options.items.clone(),
            readOnly: this._options.readOnly,
            displayProperty: this._options.displayProperty,
            itemTemplate: this._options.itemTemplate,
            clickCallback: this._clickCallbackPopup
         },
         eventHandlers: {
            onClose: () => {
               if (!this._destroyed) {
                  this._notify('closeInfoBox', []);
               }
            }
         }
      };

      this._notify('openInfoBox', [config]);
      this._getStickyOpener().open(config);
   }

   private _getStickyOpener(): StickyOpener {
      if (!this._stickyOpener) {
         this._stickyOpener = new StickyOpener();
      }
      return this._stickyOpener;
   }

   private _getCounterWidth(itemsCount: number,
                            {
                               readOnly,
                               itemsLayout,
                               fontSize
                            }: ISelectedCollectionOptions): number {
      // in mode read only and single line, counter does not affect the collection
      if (readOnly && itemsLayout === 'oneRow') {
         return 0;
      }

      return selectedCollectionUtils.getCounterWidth(itemsCount, this._options.theme, fontSize);
   }

   private _isShowCounter(itemsCount: number, multiline: boolean, maxVisibleItems?: number): boolean {
      this._needShowCounter = multiline ? itemsCount > maxVisibleItems : itemsCount > 1;
      return this._needShowCounter;
   }

   private _closeInfobox(): void {
      const stickyOpener = this._getStickyOpener();
      if (stickyOpener.isOpened()) {
         this._notify('closeInfoBox');
         stickyOpener.close();
      }
   }

   static getDefaultOptions(): Object {
        return {
            itemTemplate: ItemTemplate,
            itemsLayout: 'default',
            backgroundStyle: 'default'
        };
    }
}

Object.defineProperty(SelectedCollection, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return SelectedCollection.getDefaultOptions();
   }
});

export default SelectedCollection;
