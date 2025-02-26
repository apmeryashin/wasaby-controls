import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operations/__MultiSelector';
import {Memory} from 'Types/source';
import {Model, CancelablePromise} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TKeysSelection, ISelectionObject} from 'Controls/interface';
import {default as getCountUtil, IGetCountCallParams} from 'Controls/_operations/MultiSelector/getCount';
import {LoadingIndicator} from 'Controls/LoadingIndicator';
import {isEqual} from 'Types/object';
import 'css!Controls/operations';
import {ControllerClass as OperationsController} from '../_operations/ControllerClass';
import {process} from 'Controls/error';

const DEFAULT_CAPTION = rk('Отметить');
const DEFAULT_ITEMS = [
   {
      id: 'selectAll',
      title: rk('Все')
   }, {
      id: 'unselectAll',
      title: rk('Снять')
   }
];

const SHOW_SELECTED_ITEM = {
   id: 'selected',
   title: rk('Показать отмеченные')
};

const SHOW_ALL_ITEM = {
   id: 'all',
   title: rk('Показать все')
};

const SHOW_INVERT_ITEM = {
   id: 'toggleAll',
   title: rk('Инвертировать')
};

const SHOW_SELECT_COUNT = [
   {
      id: 'count-10',
      title: '10'
   },
   {
      id: 'count-25',
      title: '25'
   },
   {
      id: 'count-50',
      title: '50'
   },
   {
      id: 'count-100',
      title: '100'
   }
];

const SHOW_SELECT_COUNT_SELECTED_ITEMS = [
   {
      id: 'count-10',
      title: '+10'
   },
   {
      id: 'count-25',
      title: '+25'
   },
   {
      id: 'count-50',
      title: '+50'
   },
   {
      id: 'count-100',
      title: '+100'
   }
];

interface IMultiSelectorChildren {
   countIndicator: LoadingIndicator;
}

interface IMultiSelectorMenuItem {
   id: string;
   title: string;
}

type TCount = null|number|void;
type CountPromise = CancelablePromise<TCount>;
type MultiSelectorMenuItems = IMultiSelectorMenuItem[];

export interface IMultiSelectorOptions extends IControlOptions {
   selectedKeys: TKeysSelection;
   excludedKeys: TKeysSelection;
   selectedKeysCount: TCount;
   isAllSelected?: boolean;
   selectionViewMode?: 'all'|'selected'|'partial';
   selectedCountConfig?: IGetCountCallParams;
   parentProperty?: string;
   operationsController?: OperationsController;
}

/**
 * Контрол отображающий выпадающий список, который позволяет отмечать все записи, инвертировать, снимать с них отметку.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/operations/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_operations.less переменные тем оформления}
 *
 * @class Controls/_operations/SimpleMultiSelector
 * @extends Core/Control
 *
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/operations/SimpleMultiSelector/Index
 */

export default class MultiSelector extends Control<IMultiSelectorOptions> {
   protected _template: TemplateFunction = template;
   protected _menuSource: Memory = null;
   protected _sizeChanged: boolean = false;
   protected _menuCaption: string = null;
   protected _countPromise: CountPromise = null;
   protected _children: IMultiSelectorChildren;

   protected _beforeMount(options: IMultiSelectorOptions): Promise<TCount> {
      this._menuSource = this._getMenuSource(options);
      return this._updateMenuCaptionByOptions(options);
   }

   protected _beforeUpdate(newOptions: IMultiSelectorOptions): void|Promise<TCount> {
      const options = this._options;
      const selectionIsChanged = options.selectedKeys !== newOptions.selectedKeys ||
                                 options.excludedKeys !== newOptions.excludedKeys;
      const viewModeChanged = options.selectionViewMode !== newOptions.selectionViewMode;
      const isAllSelectedChanged = options.isAllSelected !== newOptions.isAllSelected;
      const selectionCfgChanged = !isEqual(options.selectedCountConfig, newOptions.selectedCountConfig);
      const selectionCountChanged = options.selectedKeysCount !== newOptions.selectedKeysCount;

      if (selectionIsChanged || viewModeChanged || isAllSelectedChanged || selectionCfgChanged) {
         this._menuSource = this._getMenuSource(newOptions);
      }

      if (selectionIsChanged || selectionCountChanged || isAllSelectedChanged || selectionCfgChanged) {
         return this._updateMenuCaptionByOptions(newOptions, selectionCfgChanged);
      }
   }

   protected _afterUpdate(oldOptions?: IMultiSelectorOptions): void {
      if (this._sizeChanged) {
         this._sizeChanged = false;
         this._notify('controlResize', [], { bubbling: true });
      }
   }

   private _getAdditionalMenuItems(
       {selectedKeys, selectionViewMode, isAllSelected, selectedKeysCount}: IMultiSelectorOptions
   ): MultiSelectorMenuItems {
      const additionalItems = [];
      const hasSelected = !!selectedKeys.length;

      if (selectionViewMode === 'selected') {
         additionalItems.push(SHOW_ALL_ITEM);
         // Показываем кнопку если есть выбранные и невыбранные записи
      } else if (!isAllSelected) {
         if (selectionViewMode === 'all' && hasSelected) {
            additionalItems.push(SHOW_SELECTED_ITEM);
         } else if (selectionViewMode === 'partial') {
            if (hasSelected && (selectedKeysCount > 0 || selectedKeysCount === null)) {
               additionalItems.push(...SHOW_SELECT_COUNT_SELECTED_ITEMS);
            } else {
               additionalItems.push(...SHOW_SELECT_COUNT);
            }
         }
      }

      if (!(selectionViewMode === 'partial')) {
         additionalItems.push(SHOW_INVERT_ITEM);
      }

      return additionalItems;
   }

   private _getMenuSource(options: IMultiSelectorOptions): Memory {
      return new Memory({
         keyProperty: 'id',
         data: DEFAULT_ITEMS.concat(this._getAdditionalMenuItems(options))
      });
   }

   private _updateMenuCaptionByOptions(options: IMultiSelectorOptions,
                                       counterConfigChanged?: boolean): Promise<TCount> {
      const {selectedKeys, excludedKeys, selectedKeysCount, operationsController, selectedCountConfig} = options;
      const selection = this._getSelection(selectedKeys, excludedKeys);
      const count = (counterConfigChanged && selectedKeysCount !== 0) ? null : selectedKeysCount;
      const getCountCallback = (itemsCount, isAllSelected) => {
         this._menuCaption = this._getMenuCaption(selection, itemsCount, isAllSelected);
         this._sizeChanged = true;
         operationsController?.setSelectedKeysCount(itemsCount);
      };
      const needUpdateCount = !selectedCountConfig || !counterConfigChanged ||
          this._isCorrectCount(count) || !options.isAllSelected;

      if (needUpdateCount) {
         const getCountResult = this._getCount(selection, count, options);

         // Если счётчик удаётся посчитать без вызова метода, то надо это делать синхронно,
         // иначе promise порождает асинхронность и перестроение панели операций будет происходить скачками,
         // хотя можно было это сделать за одну синхронизацию
         if (getCountResult instanceof Promise) {
            return getCountResult
                .then((itemsCount) => {
                   getCountCallback(itemsCount, this._options.isAllSelected);
                })
                .catch((error) => error);
         } else {
            getCountCallback(getCountResult, options.isAllSelected);
         }
      }
   }

   private _getMenuCaption({selected}: ISelectionObject, count: TCount, isAllSelected: boolean): string {
      const hasSelected = !!selected.length;
      let caption;

      if (hasSelected) {
         if (count > 0) {
            caption = rk('Отмечено') + ': ' + count;
         } else if (isAllSelected) {
            caption = rk('Отмечено все');
         } else if (count === null) {
            caption = rk('Отмечено');
         } else {
            caption = DEFAULT_CAPTION;
         }
      } else {
         caption = DEFAULT_CAPTION;
      }

      return caption;
   }

   private _getCount(
       selection: ISelectionObject,
       count: TCount,
       {selectedCountConfig, parentProperty}: IMultiSelectorOptions
   ): Promise<TCount>|TCount {
      const selectedKeysLength = selection.selected.length;
      let countResult;
      this._cancelCountPromise();
      if (!selectedCountConfig || !selectedKeysLength || this._isCorrectCount(count)) {
         if (count === undefined) {
            // Для иерархических списков нельзя посчитать кол-во отмеченных записей по количеству ключей
            if (!parentProperty) {
               countResult = selection.selected.length;
            } else if (selectedKeysLength) {
               countResult = null;
            }
         } else {
            countResult = count;
         }
      } else {
         countResult = this._getCountBySourceCall(selection, selectedCountConfig);
      }
      return countResult;
   }

   private _resetCountPromise(): void {
      if (this._children.countIndicator) {
         this._children.countIndicator.hide();
      }
      this._countPromise = null;
   }

   private _cancelCountPromise(): void {
      if (this._countPromise) {
         this._countPromise.cancel();
      }
      this._resetCountPromise();
   }

   private _getCountBySourceCall(selection, selectionCountConfig): Promise<number> {
      this._children.countIndicator?.show();
      this._countPromise = new CancelablePromise(getCountUtil.getCount(selection, selectionCountConfig));
      return this._countPromise.promise
          .then((result: number): number => {
             this._resetCountPromise();
             return result;
          })
          .catch((error) => {
             if (!error.isCanceled) {
                process({error});
             }
             return Promise.reject(error);
          });
   }

   private _getSelection(selectedKeys: TKeysSelection, excludedKeys: TKeysSelection): ISelectionObject {
      return {
         selected: selectedKeys,
         excluded: excludedKeys
      };
   }

   private _isCorrectCount(count: TCount): boolean {
      return typeof count === 'number' || count === undefined;
   }

   protected _onMenuItemActivate(event: SyntheticEvent<'menuItemActivate'>, item: Model): void {
      const itemId: string = item.get('id');

      this._notify('selectedTypeChanged', [itemId], {
         bubbling: true
      });
   }

   protected _beforeUnmount(): void {
      this._cancelCountPromise();
   }

   static getDefaultOptions(): object {
      return {
         selectedKeys: [],
         excludedKeys: [],
         fontColorStyle: 'operationsPanel'
      };
   }
}

Object.defineProperty(MultiSelector, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return MultiSelector.getDefaultOptions();
   }
});

/**
 * @name Controls/_operations/SimpleMultiSelector#selectedKeysCount
 * @cfg {Number} Счётчик отмеченных записей.
 * @example
 * <pre class="brush: html">
 *    <Controls.operations:SimpleMultiSelector selectedKeysCount="{{10}}"/>
 * </pre>
 */

/**
 * @event Происходит при выборе из выпадающего списка, который открывается при клике на кнопку "Отметить".
 * @name Controls/_operations/SimpleMultiSelector#selectedTypeChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} selectedType Идентификатор выбранного пункта
 */
