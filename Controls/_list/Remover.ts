import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import {ContextOptions as dataOptions} from 'Controls/context';
import {Remove as RemoveAction} from 'Controls/listCommands';
import {getItemsBySelection} from 'Controls/baseList';
import {Logger} from 'UI/Utils';
import {ISelectionObject} from 'Controls/_interface/ISelectionType';
import {RecordSet} from 'Types/collection';
import {SbisService} from 'Types/source';

interface IOptions {
    source: SbisService;
    filter?: object;
    items?: RecordSet;
}

const _private = {
    removeFromItems(self, keys) {
        let item;
        self._items.setEventRaising(false, true);
        for (let i = 0; i < keys.length; i++) {
            item = self._items.getRecordById(keys[i]);
            if (item) {
                self._items.remove(item);
            }
        }
        self._items.setEventRaising(true, true);
    },

    beforeItemsRemove(self, keys) {
        const beforeItemsRemoveResult = self._notify('beforeItemsRemove', [keys]);
        return beforeItemsRemoveResult instanceof Deferred || beforeItemsRemoveResult instanceof Promise ?
            beforeItemsRemoveResult : Deferred.success(beforeItemsRemoveResult);
    },

    afterItemsRemove(self, keys, result) {
        const afterItemsRemoveResult = self._notify('afterItemsRemove', [keys, result]);

        // According to the standard, after moving the items, you need to unselect all in the table view.
        // The table view and Mover are in a common container (Control.Container.MultiSelector)
        // and do not know about each other.
        // The only way to affect the selection in the table view is to send the selectedTypeChanged event.
        // You need a schema in which Mover will not work directly with the selection.
        // Will be fixed by: https://online.sbis.ru/opendoc.html?guid=dd5558b9-b72a-4726-be1e-823e943ca173
        self._notify('selectedTypeChanged', ['unselectAll'], {
            bubbling: true
        });

        return Promise.resolve(afterItemsRemoveResult);
    },

    updateDataOptions(self, newOptions?: IOptions, contextDataOptions?: IOptions): void {
        self._source = newOptions?.source ? newOptions.source : contextDataOptions.source;
        // items и filter могут быть не заданы в опциях. При этом contextDataOptions может быть тоже не задан
        self._filter = newOptions?.filter ? newOptions.filter : contextDataOptions?.filter;
        self._items = newOptions?.items ? newOptions.items : contextDataOptions?.items;

    },

    getItemsBySelection(self, keys): Promise<ISelectionObject> {
        // Выбранные ключи могут быть массивом или selection'ом
        // Полный переход к selection'у:
        // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        return keys instanceof Array
            ? Promise.resolve(keys)
            : getItemsBySelection(
                keys,
                self._source,
                self._items,
                self._filter,
                null,
                self._options.selectionTypeForAllSelected
            );
    }
};

/**
 * Контрол для удаления элементов списка в recordSet и dataSource.
 * Контрол должен располагаться в том же контейнере (см. {@link Controls/list:DataContainer}), что и список.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FRemove демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/remover/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/variables/_list.less переменные тем оформления}
 *
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @implements Controls/interface/IRemovable
 * @deprecated Класс устарел и будет удалён. Используйте методы интерфейса {@link Controls/list:IRemovableList}, который по умолчанию подключен в списки.
 *
 * @public
 * @author Авраменко А.С.
 */

/*
 * Сontrol to remove the list items in recordSet and dataSource.
 * Сontrol must be in one Controls.Container.Data with a list.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_list/Remover
 * @extends Controls/_list/BaseAction
 * @implements Controls/interface/IRemovable
 *
 * @public
 * @author Авраменко А.С.
 */

const Remover = BaseAction.extend({
    _beforeMount(options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
        Logger.warn('Controls/list:Remover: Класс устарел и будет удалён.' +
            ' Используйте методы интерфейса Controls/list:IRemovableList, который ' +
            'по умолчанию подключен в списки.', this);
    },

    _beforeUpdate(options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
    },

    removeItems(keys: string[]): Promise<void> {
        const both = (result) => {
            if (this._destroyed) {
                return Promise.reject();
            }
            return _private.afterItemsRemove(this, keys, result).then((eventResult) => {
                if (eventResult === false || !(result instanceof Error)) {
                    return;
                }

                this._notify('dataError', [{ error: result }]);
            });
        };
        return _private.getItemsBySelection(this, keys).then((selection) => {
            return _private.beforeItemsRemove(this, selection).then((result) => {
                // если отменили удаление, то надо вернуть false
                if (result === false) {
                    return Promise.resolve(result);
                }
                this._removeAction = new RemoveAction({
                    source: this._source,
                    filter: this._filter,
                    providerName: 'Controls/listCommands:RemoveProvider',
                    selection: selection instanceof Array ? {
                        selected: selection,
                        excluded: []
                    } : selection
                });
                return this._removeAction.execute()
                    .then((promiseResult) => {
                        if (this._destroyed) {
                            return Promise.reject();
                        }
                        _private.removeFromItems(this, selection);
                        return promiseResult;
                    })
                    .then((promiseResult) => both(promiseResult))
                    .catch((promiseResult) => both(promiseResult));
            });
        });
    }
});

/*
FIXME: Нельзя отсюда убирать контекст и заменять на хоки, потому что тогда отвалятся события
Примерно такой сценарий отвалится:
<Controls.list:DataContainer>
  <div>
     <Controls.list:Container>
        <Controls.list:View />
     </Controls.list:Container>
     <Controls.list:Remover />
  </div>
</Controls.list:DataContainer>
 */
Remover.contextTypes = () => ({
    dataOptions
});

export = Remover;
