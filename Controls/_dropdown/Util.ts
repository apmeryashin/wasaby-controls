import rk = require('i18n!Controls');
import Controller from 'Controls/_dropdown/_Controller';
import {ICrudPlus} from 'Types/source';
import {Model} from 'Types/entity';
import {DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {IDropdownControllerOptions} from './interface/IDropdownController';
import {process} from 'Controls/error';
import {TKey} from '../interface';

export function prepareEmpty(emptyText) {
   if (emptyText) {
      return emptyText === true ? rk('Не выбрано') : emptyText;
   }
}

export function isSingleSelectionItem(item: Model, text: string, keyProperty: string, key: TKey = null): boolean {
   return text && (!item || item.get(keyProperty) === key);
}

export function loadItems(
    controller: Controller,
    receivedState: DropdownReceivedState,
    options?: IDropdownControllerOptions
): Promise<void | DropdownReceivedState> {
   const source = options.source;
   if (receivedState) {
      return controller.setItems(receivedState.items).then(() => {
         controller.setHistoryItems(receivedState.history);
      });
   } else if (source) {
      return controller.loadItems().catch((error) => {
         process({error});
      });
   } else if (options.items) {
      controller.setItems(options.items);
   }
}

export function loadSelectedItems(
    controller: Controller,
    receivedState: DropdownReceivedState,
    source: ICrudPlus
): Promise<void | DropdownReceivedState>|void {
   if (receivedState) {
      controller.updateSelectedItems(receivedState.items);
   } else if (source) {
      return controller.loadSelectedItems().catch((error) => {
         process({error});
      });
   }
}
