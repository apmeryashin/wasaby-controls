import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import cInstance = require('Core/core-instance');
import {getItemsBySelection} from 'Controls/baseList';
import {Logger} from 'UI/Utils';

import {Move as MoveAction, IMoveActionOptions} from 'Controls/listCommands';
import {Model} from 'Types/entity';
import {LOCAL_MOVE_POSITION} from 'Types/source';

// @TODO Если убрать отсюда шаблон, то operationPanel перестаёт получать события
//   selectedTypeChanged даже от MultiSelect
//  https://online.sbis.ru/doc/0445b971-8675-42ef-b2bc-e68d7f82e0ac
import * as Template from 'wml!Controls/_list/Mover/Mover';
import { Tree } from 'Controls/display';
import {ISelectionObject} from 'Controls/interface';
import {IHashMap} from 'Types/declarations';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';
import {BEFORE_ITEMS_MOVE_RESULT, IMoveItemsParams} from './interface/IMoverAndRemover';

const DEFAULT_SORTING_ORDER = 'asc';

const _private = {
    moveItems(self, items, target, position) {
        const useAction = _private.useAction(items);
        const afterItemsMove = (result) => {
            _private.afterItemsMove(self, items, target, position, result);
            return result;
        };
        return _private.beforeItemsMove(self, items, target, position).addCallback((beforeItemsMoveResult) => {
            if (useAction) {
                return self._action.execute({
                    selection: _private.convertItemsToISelectionObject(items),
                    filter: _private.extractFilter(items),
                    targetKey: _private.getIdByItem(self, target),
                    position,
                    providerName: 'Controls/listCommands:MoveProvider'
                });
            }
            if (beforeItemsMoveResult === BEFORE_ITEMS_MOVE_RESULT.MOVE_IN_ITEMS) {
                return _private.moveInItems(self, items, target, position);
            } else if (beforeItemsMoveResult !== BEFORE_ITEMS_MOVE_RESULT.CUSTOM) {
                return _private.moveInSource(self, items, target, position).addCallback((moveResult) => {
                    _private.moveInItems(self, items, target, position);
                    return moveResult;
                });
            }
        }).addBoth(afterItemsMove);
    },

    beforeItemsMove(self, items, target, position) {
        const beforeItemsMoveResult = self._notify('beforeItemsMove', [items, target, position]);
        return beforeItemsMoveResult instanceof Promise ?
            beforeItemsMoveResult : Deferred.success(beforeItemsMoveResult);
    },

    afterItemsMove(self, items, target, position, result) {
        self._notify('afterItemsMove', [items, target, position, result]);

        // According to the standard, after moving the items, you need to unselect all in the table view.
        // The table view and Mover are in a common container (Control.Container.MultiSelector)
        // and do not know about each other.
        // The only way to affect the selection in the table view is to send the selectedTypeChanged event.
        // You need a schema in which Mover will not work directly with the selection.
        // Will be fixed by: https://online.sbis.ru/opendoc.html?guid=dd5558b9-b72a-4726-be1e-823e943ca173
        self._notify('selectedTypeChanged', ['unselectAll'], {
            bubbling: true
        });
    },

    moveInItems(self, items, target, position) {
        if (position === LOCAL_MOVE_POSITION.On) {
            _private.hierarchyMove(self, items, target);
        } else {
            _private.reorderMove(self, items, target, position);
        }
    },

    reorderMove(self, items, target, position) {
        let movedIndex;
        let movedItem;
        const parentProperty = self._options.parentProperty;
        const targetId = _private.getIdByItem(self, target);
        const targetItem = _private.getModelByItem(self, targetId);
        let targetIndex = self._items.getIndex(targetItem);

        items.forEach((item) => {
            movedItem = _private.getModelByItem(self, item);
            if (movedItem) {
                if (position === LOCAL_MOVE_POSITION.Before) {
                    targetIndex = self._items.getIndex(targetItem);
                }

                movedIndex = self._items.getIndex(movedItem);
                if (movedIndex === -1) {
                    self._items.add(movedItem);
                    movedIndex = self._items.getCount() - 1;
                }

                if (parentProperty && targetItem.get(parentProperty) !== movedItem.get(parentProperty)) {
                    // if the movement was in order and hierarchy at the same time,
                    // then you need to update parentProperty
                    movedItem.set(parentProperty, targetItem.get(parentProperty));
                }

                if (position === LOCAL_MOVE_POSITION.After && targetIndex < movedIndex) {
                    targetIndex = (targetIndex + 1) < self._items.getCount() ? targetIndex + 1 : self._items.getCount();
                } else if (position === LOCAL_MOVE_POSITION.Before && targetIndex > movedIndex) {
                    targetIndex = targetIndex !== 0 ? targetIndex - 1 : 0;
                }
                self._items.move(movedIndex, targetIndex);
            }
        });
    },

    hierarchyMove(self, items, target) {
        const targetId = _private.getIdByItem(self, target);
        items.forEach((item) => {
            item = _private.getModelByItem(self, item);
            if (item) {
                item.set(self._options.parentProperty, targetId);
            }
        });
    },

    moveInSource(self, items, target, position) {
        const targetId = _private.getIdByItem(self, target);
        const idArray = items.map((item) => {
            return _private.getIdByItem(self, item);
        });

        // If reverse sorting is set, then when we call the move on the source, we invert the position.
        if (position !== LOCAL_MOVE_POSITION.On && self._options.sortingOrder !== DEFAULT_SORTING_ORDER) {
            position = position === LOCAL_MOVE_POSITION.After ? LOCAL_MOVE_POSITION.Before : LOCAL_MOVE_POSITION.After;
        }
        return self._source.move(idArray, targetId, {
            position,
            parentProperty: self._options.parentProperty
        });
    },

    moveItemToSiblingPosition(self, item, position) {
        const target = _private.getTargetItem(self, item, position);
        return target ? self.moveItems([item], target, position) : Deferred.success();
    },

    /**
     * Получает элемент к которому мы перемещаем текущий элемент
     * Метод сделан публичным для совместимости с HOC
     * @param self текущий контрол
     * @param item текущий элемент
     * @param position позиция (направление перемещения)
     * @private
     */
    getTargetItem(self, item, position: LOCAL_MOVE_POSITION): Model {
        let result;
        let display;
        let itemIndex;
        let siblingItem;
        let itemFromProjection;

        // В древовидной структуре, нужно получить следующий(предыдущий) с учетом иерархии.
        // В рекордсете между двумя соседними папками, могут лежат дочерние записи одной из папок,
        // а нам необходимо получить соседнюю запись на том же уровне вложенности, что и текущая запись.
        // Поэтому воспользуемся проекцией, которая предоставляет необходимы функционал.
        // Для плоского списка можно получить следующий(предыдущий) элемент просто по индексу в рекордсете.
        if (self._options.parentProperty) {
            display = new Tree({
                collection: self._items,
                keyProperty: self._keyProperty,
                parentProperty: self._options.parentProperty,
                nodeProperty: self._options.nodeProperty,
                root: self._options.root !== undefined ? self._options.root : null
            });
            itemFromProjection = display.getItemBySourceItem(_private.getModelByItem(self, item));
            siblingItem =
                display[position === LOCAL_MOVE_POSITION.Before ? 'getPrevious' : 'getNext'](itemFromProjection);
            result = siblingItem ? siblingItem.getContents() : null;
        } else {
            itemIndex = self._items.getIndex(_private.getModelByItem(self, item));
            result = self._items.at(position === LOCAL_MOVE_POSITION.Before ? --itemIndex : ++itemIndex);
        }

        return result;
    },

    updateDataOptions(self, newOptions, contextDataOptions) {
        self._items = newOptions.items || contextDataOptions?.items;

        const controllerOptions: Partial<IMoveActionOptions> = {
            parentProperty: newOptions.parentProperty
        };
        if (contextDataOptions) {
            controllerOptions.source = newOptions.source || contextDataOptions.source;
            self._keyProperty = newOptions.keyProperty || contextDataOptions.keyProperty;
            self._filter = contextDataOptions.filter;
        } else {
            controllerOptions.source = newOptions.source;
            self._keyProperty = newOptions.keyProperty;
            self._filter = newOptions.filter;
        }
        self._source = controllerOptions.source;
        if (newOptions.moveDialogTemplate) {
            controllerOptions.popupOptions = {
                opener: self
            };

            if (newOptions.moveDialogTemplate.templateName) {
                self._moveDialogTemplate = newOptions.moveDialogTemplate.templateName;
                self._moveDialogOptions = newOptions.moveDialogTemplate.templateOptions;
                controllerOptions.popupOptions.template = self._moveDialogTemplate;
                controllerOptions.popupOptions.templateOptions = self._moveDialogOptions;
            } else {
                self._moveDialogTemplate = newOptions.moveDialogTemplate;
                controllerOptions.popupOptions.template = self._moveDialogTemplate;
                Logger.warn('Mover: Wrong type of moveDialogTemplate option, use object notation instead of template function', self);
            }
        }
        self._action = new MoveAction(controllerOptions as IMoveActionOptions);
    },

    checkItem(self, item, target, position) {
        let key;
        let parentsMap;
        const movedItem = _private.getModelByItem(self, item);

        if (target !== null) {
            target = _private.getModelByItem(self, target);
        }

        // Check for a item to be moved because it may not be in the current recordset
        if (self._options.parentProperty && movedItem) {
            if (target && position === LOCAL_MOVE_POSITION.On && target.get(self._options.nodeProperty) === null) {
                return false;
            }
            parentsMap = _private.getParentsMap(self, _private.getIdByItem(self, target));
            key = '' + movedItem.get(self._keyProperty);
            if (parentsMap.indexOf(key) !== -1) {
                return false;
            }
        }
        return true;
    },

    getParentsMap(self, id) {
        let item;
        const toMap = [];
        const items = self._items;
        const path = items.getMetaData().path;

        item = items.getRecordById(id);
        while (item) {
            id = '' + item.get(self._keyProperty);
            if (toMap.indexOf(id) === -1) {
                toMap.push(id);
            } else {
                break;
            }
            id = item.get(self._options.parentProperty);
            item = items.getRecordById(id);
        }
        if (path) {
            path.forEach((elem) => {
                if (toMap.indexOf(elem.get(self._keyProperty)) === -1) {
                    toMap.push('' + elem.get(self._keyProperty));
                }
            });
        }
        return toMap;
    },

    getModelByItem(self, item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item : self._items.getRecordById(item);
    },

    getIdByItem(self, item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item.get(self._keyProperty) : item;
    },

    getItemsBySelection(selection): Promise<any> {
        let resultSelection;
        // Support moving with mass selection.
        // Full transition to selection will be made by:
        // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        selection.recursive = false;

        if (selection instanceof Array) {
            resultSelection = Deferred.success(selection);
        } else {
            const filter = _private.prepareFilter(this, this._filter, selection);
            resultSelection = getItemsBySelection(selection, this._source, this._items, filter);
        }

        return resultSelection;
    },

    prepareMovedItems(self, items) {
        const result = [];
        items.forEach((item) => {
            result.push(_private.getIdByItem(self, item));
        });
        return result;
    },

    prepareFilter(self, filter, selection): object {
        const searchParam = self._options.searchParam;
        const root = self._options.root;
        let resultFilter = filter;

        if (searchParam && !selection.selected.includes(root)) {
            resultFilter = {...filter};
            delete resultFilter[searchParam];
        }

        return resultFilter;
    },

    useAction(items): boolean {
        return !items.forEach && !items.selected;
    },

    openMoveDialog(self, selection): Promise<void> {
        const templateOptions: IMoverDialogTemplateOptions = {
            movedItems: _private.useAction(selection) ? selection.selectedKeys : selection,
            source: self._source,
            keyProperty: self._keyProperty, // keyProperty может быть заменён в moveDialogOptions
            ...(self._moveDialogOptions as IMoverDialogTemplateOptions)
        };
        return new Promise((resolve) => {
            self._children.dialogOpener.open({
                templateOptions,
                eventHandlers: {
                    onResult: (target: Model) => {
                        resolve(self.moveItems(selection, target, LOCAL_MOVE_POSITION.On));
                    }
                }
            });
        });
    },

    convertItemsToISelectionObject(item): ISelectionObject {
        let selectionObject: ISelectionObject;
        if (item.selected) {
            selectionObject = item;
        } else if (item.selectedKeys) {
            selectionObject = {
                selected: item.selectedKeys,
                excluded: item.excludedKeys
            };
        } else if (item.forEach) {
            selectionObject = {
                selected: item,
                excluded: undefined
            };
        }
        return selectionObject;
    },

    extractFilter(item): IHashMap<any> {
        let filter: IHashMap<any>;
        if (item.filter) {
            filter = item.filter;
        }
        return filter || {};
    }
};

/**
 * Контрол для перемещения элементов списка в recordSet и dataSource.
 *
 * @remark
 * Контрол должен располагаться в одном контейнере {@link Controls/list:DataContainer} со списком.
 * В случае использования {@link Controls/operations:Controller} для корректной обработки событий необходимо помещать Controls/list:Mover внутри Controls/operations:Controller.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/mover/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @implements Controls/interface/IMovable
 * @implements Controls/interface:IHierarchy
 * @deprecated Класс устарел и буден удалён. Используйте методы интерфейса {@link Controls/list:IMovableList}, который по умолчанию подключен в списки.
 * @demo Controls-demo/treeGridNew/Mover/Base/Index
 * @public
 * @author Авраменко А.С.
 */

/*
 * Сontrol to move the list items in recordSet and dataSource.
 * Сontrol must be in one {@link Controls/list:DataContainer} with a list.
 * In case you are using {@link Controls/operations:Controller}
 * you should place Controls/list:Mover inside of Controls/operations:Controller.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @implements Controls/interface/IMovable
 * @implements Controls/interface:IHierarchy
 *
 * @public
 * @author Авраменко А.С.
 */

const Mover = BaseAction.extend({
    _action: null,
    _moveDialogTemplate: null,
    _moveDialogOptions: null,
    _template: Template,
    _beforeMount(options) {
        _private.updateDataOptions(this, options, options._dataOptionsValue);
        Logger.warn('Controls/list:Mover: Класс устарел и буден удалён.' +
            ' Используйте методы интерфейса Controls/list:IMovableList, ' +
            'который по умолчанию подключен в списки.', this);
    },

    _beforeUpdate(options) {
        _private.updateDataOptions(this, options, options._dataOptionsValue);
    },

    moveItemUp(item) {
        return _private.moveItemToSiblingPosition(this, item, LOCAL_MOVE_POSITION.Before);
    },

    moveItemDown(item) {
        return _private.moveItemToSiblingPosition(this, item, LOCAL_MOVE_POSITION.After);
    },

    moveItems(items: []|IMoveItemsParams, target, position): Promise<any> {
        if (target === undefined) {
            return Deferred.success();
        }
        if (_private.useAction(items)) {
            return _private.moveItems(this, items, target, position);
        } else {
            return _private.getItemsBySelection.call(this, items).addCallback((selectItems) => {
                selectItems = selectItems.filter((item) => {
                    return _private.checkItem(this, item, target, position);
                });
                if (selectItems.length) {
                    return _private.moveItems(this, selectItems, target, position);
                } else {
                    return Deferred.success();
                }
            });
        }
    },

    moveItemsWithDialog(items: []|IMoveItemsParams): Promise<any> {
        if (this._moveDialogTemplate) {
            if (this.validate(items)) {
                if (_private.useAction(items)) {
                    return _private.openMoveDialog(this, items);
                } else {
                    return _private.getItemsBySelection.call(this, items).addCallback((selectItems: []) => (
                        _private.openMoveDialog(this, _private.prepareMovedItems(this, selectItems))
                    ));
                }
            }
        } else {
            Logger.warn('Mover: Can\'t call moveItemsWithDialog! moveDialogTemplate option, is undefined', this);
        }
        return Promise.resolve();
    }
});

Mover.getDefaultOptions = () => ({
    sortingOrder: DEFAULT_SORTING_ORDER
});

Object.defineProperty(Mover, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Mover.getDefaultOptions();
   }
});

Mover._private = _private;

export = Mover;
