/* tslint:disable:no-magic-numbers */
import * as template from 'wml!Controls-demo/treeGridNew/Forwarding/Index';
import * as nodeTemplate from 'wml!Controls-demo/treeGridNew/Forwarding/NodeTemplate';
import * as headerCell from 'wml!Controls-demo/treeGridNew/Forwarding/HeaderCellTemplate';
import {data} from './Data';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Control, TemplateFunction} from 'UI/Base';
import {IGroupNodeColumn} from 'Controls/treeGrid';
import {IHeaderCell, TColspanCallbackResult} from 'Controls/grid';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {
    Container as ScrollContainer,
    IntersectionObserverSyntheticEntry
} from 'Controls/scroll';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        scrollContainer: ScrollContainer
    };

    protected _viewSource: HierarchicalMemory;
    protected _header: IHeaderCell[] = [
        {
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2,
            template: headerCell,
            templateOptions: {
                field: 'name',
                defaultCaption: 'Name',
                pinnedRecord: null
            }
        },
        {
            caption: 'Price',
            startRow: 1,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
        },
        {
            caption: 'Count',
            startRow: 1,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Total',
            startRow: 1,
            endRow: 2,
            startColumn: 4,
            endColumn: 5
        },
        {
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 5,
            template: headerCell,
            templateOptions: {
                field: 'total',
                defaultCaption: '',
                pinnedRecord: null
            }
        }
    ];
    protected _columns: IGroupNodeColumn[] = [
        {
            width: '200px',
            displayProperty: 'name',
            template: nodeTemplate,
            templateOptions: {
                // значения пересечения при которых дергается _intersectHandler
                // при такой конфигурации событие будет стрелять трижды:
                //  1. при пересечении блок с верхней границей контейнера
                //  2. при уходе блока за верхнюю границу контейнера
                //  3. при полном выходе блока ниже верхней границы контейнера
                threshold: [0, 1],
                // 40px высота шапки
                rootMargin: '-40px 0px 0px 0px'
            }
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'price'
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'count'
        },
        {
            width: '100px',
            align: 'right',
            displayType: 'number',
            displayProperty: 'total'
        }
    ];
    protected _expandedItems: CrudEntityKey[] = [null];

    // Стек записей узлов, которые ушли за верхнюю границу либо пересекаются с ней
    private _pinnedStack: Model[] = [];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            data,
            keyProperty: 'id',
            parentProperty: 'parent',
            filter: (): boolean => true
        });
    }

    protected _intersectHandler(
        event: SyntheticEvent,
        entries: IntersectionObserverSyntheticEntry[]
    ): void {

        // Оставляем только те записи где есть данные
        const groupsEntries = entries.filter((e) => {
            return !!e.data;
        });

        if (!groupsEntries.length) {
            return;
        }

        // Пробегаемся по всем записям и заполняем _pinnedStack.
        // Записи приходят в том порядке в котором они расположены в DOM.
        // Нас интересуют только те записи, которые находятся выше верхней границы либо пересекаются с ней.
        // После инициализации контрола стрельнет обработчик и сюда придет информацию о всех контейнерах.
        groupsEntries.forEach((e) => {
            // getBoundingClientRect для ScrollContainer
            const rootBounds = e.nativeEntry.rootBounds;
            // getBoundingClientRect для элемента списка, который пересек границы ScrollContainer
            const targetBounds = e.nativeEntry.boundingClientRect;

            // true если дочерний контейнер пересекается с верхней границей
            const intersectTop = targetBounds.top < rootBounds.top && targetBounds.bottom > rootBounds.top;
            // true если дочерний контейнер находится полностью за верхней границей
            const above = targetBounds.bottom <= rootBounds.top;

            const model = e.data as Model;
            const index = this._pinnedStack.indexOf(model);
            const hasInStack = index >= 0;

            // Если контейнер пересек или ушел за верхнюю границу, то добавляем его в стек закрепленных.
            // В противном случае выкидываем его из стека тем самым делая последний элемент стека актуальным.
            if (intersectTop || above) {
                if (hasInStack) {
                    return;
                }

                this._pinnedStack.push(model);
            } else if (hasInStack) {
                this._pinnedStack.splice(index, 1);
            }
        });

        // Последняя запись стека является актуальной
        const actualPinnedRecord = this._pinnedStack.length
            ? this._pinnedStack[this._pinnedStack.length - 1]
            : null;

        // Если запись осталась той же, то смысла обновлять нет т.к. будет лишняя перерисовка
        if (this._header[0].templateOptions.pinnedRecord === actualPinnedRecord) {
            return;
        }

        this._header[0].templateOptions.pinnedRecord = actualPinnedRecord;
        this._header[4].templateOptions.pinnedRecord = actualPinnedRecord;
        this._header = [...this._header];
    }

    protected _colspanCallback(
        item: Model,
        column: IGroupNodeColumn,
        columnIndex: number
    ): TColspanCallbackResult {
        return item.get('nodeType') === 'group' && columnIndex === 0 ? 3 : 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
