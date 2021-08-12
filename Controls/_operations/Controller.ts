import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_operations/Controller/Controller');
import {EventUtils} from 'UI/Events';
import { SyntheticEvent } from 'Vdom/Vdom';
import { TKeySelection as TKey } from 'Controls/interface';
import {default as OperationsController} from 'Controls/_operations/ControllerClass';
import { TSelectionType } from 'Controls/interface';

/**
 * Контрол используется для организации множественного выбора.
 * Он обеспечивает связь между {@link Controls/operations:PanelContainer} и {@link Controls/list:Container}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/operations/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_operations.less переменные тем оформления}
 *
 * @class Controls/_operations/Controller
 * @extends UI/Base:Control
 * @implements Controls/interface/IPromisedSelectable
 *
 * @author Авраменко А.С.
 * @public
 */

/*
 * Container for content that can work with multiselection.
 * Puts selection in child context.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/list/actions/operations/'>here</a>.
 *
 * @class Controls/_operations/Controller
 * @extends UI/Base:Control
 * @implements Controls/interface/IPromisedSelectable
 *
 * @author Авраменко А.С.
 * @public
 */

export default class MultiSelector extends Control {
   protected _template: TemplateFunction = template;
   protected _selectedKeysCount: number|null;
   protected _selectionType: TSelectionType = 'all';
   protected _isAllSelected: boolean = false;
   protected _listMarkedKey: TKey = null;
   protected _notifyHandler: Function = EventUtils.tmplNotify;
   private _operationsController: OperationsController = null;
   constructor() {
      super();
      this._itemOpenHandler = this._itemOpenHandler.bind(this);
      this._selectionViewModeChanged = this._selectionViewModeChanged.bind(this);
   }

   protected _beforeMount(options): void {
      this._operationsController = this._createOperationsController(options);
   }

   protected _beforeUpdate(options): void {
      this._operationsController.update(options);
      if (options.hasOwnProperty('markedKey') && options.markedKey !== undefined) {
         this._listMarkedKey = this._getOperationsController().setListMarkedKey(options.markedKey);
      }
   }

   protected _beforeUnmount(): void {
      if (this._operationsController) {
         this._operationsController.destroy();
         this._operationsController.unsubscribe('selectionViewModeChanged', this._selectionViewModeChanged);
         this._operationsController = null;
      }
   }

   protected _registerHandler(event, registerType, component, callback, config): void {
      this._getOperationsController().registerHandler(event, registerType, component, callback, config);
   }

   protected _unregisterHandler(event, registerType, component, config): void {
      this._getOperationsController().unregisterHandler(event, component, config);
   }

   protected _selectedTypeChangedHandler(event: SyntheticEvent<null>, typeName: string, limit: number): void {
      this._getOperationsController().selectionTypeChanged(typeName, limit);
   }

   protected _selectedKeysCountChanged(e, count: number|null, isAllSelected: boolean): void {
      e.stopPropagation();
      this._selectedKeysCount = count;
      this._isAllSelected = isAllSelected;
   }

   protected _itemOpenHandler(newCurrentRoot, items, dataRoot = null): void {
      this._getOperationsController().itemOpenHandler(newCurrentRoot, items, dataRoot);
      if (this._options.itemOpenHandler instanceof Function) {
         return this._options.itemOpenHandler(newCurrentRoot, items, dataRoot);
      }
   }

   protected _listMarkedKeyChangedHandler(event: SyntheticEvent<null>, markedKey: TKey): void {
      this._listMarkedKey = this._getOperationsController(this._options).setListMarkedKey(markedKey);
      return this._notify('markedKeyChanged', [markedKey]);
   }

   protected _markedKeyChangedHandler(event: SyntheticEvent<null>): void {
      event.stopPropagation();
   }

   protected _operationsPanelOpen(): void {
      this._listMarkedKey = this._getOperationsController(this._options).setOperationsPanelVisible(true);
   }

   protected _listSelectionTypeForAllSelectedChanged(event: SyntheticEvent, selectionType: TSelectionType): void {
      event.stopPropagation();
      this._selectionType = selectionType;
   }

   protected _operationsPanelClose(): void {
      this._getOperationsController(this._options).setOperationsPanelVisible(false);
   }

   private _selectionViewModeChanged(event: SyntheticEvent, type: string): void {
      this._notify('selectionViewModeChanged', [type]);
   }

   private _createOperationsController(options): OperationsController {
      const controller = new OperationsController({...options});
      controller.subscribe('selectionViewModeChanged', this._selectionViewModeChanged);
      return controller;
   }

   private _getOperationsController(): OperationsController {
      if (!this._operationsController) {
         this._operationsController = this._createOperationsController(this._options);
      }

      return this._operationsController;
   }
}
